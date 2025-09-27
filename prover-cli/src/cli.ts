import { type Resource } from '@midnight-ntwrk/wallet';
import { type Wallet } from '@midnight-ntwrk/wallet-api';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface, type Interface } from 'node:readline/promises';
import { type Logger } from 'pino';
import { type StartedDockerComposeEnvironment, type DockerComposeEnvironment } from 'testcontainers';
import { readFile } from 'node:fs/promises';
import { type ProverProviders, type DeployedProverContract } from './common-types';
import { type Config, StandaloneConfig } from './config';
import * as api from './api';

let logger: Logger;

/**
 * This seed gives access to tokens minted in the genesis block of a local development node - only
 * used in standalone networks to build a wallet with initial funds.
 */
const GENESIS_MINT_WALLET_SEED = '0000000000000000000000000000000000000000000000000000000000000001';

// Document structure for salary proof
interface SalaryDocument {
  Name: string;
  Employer: string;
  Address: string;
  Date: string;
  NetPay: number;
}

// Proof request structure
interface SalaryProofRequest {
  document: SalaryDocument;
  proofAmount: number; // Amount user wants to prove (≤ NetPay)
}

const MAIN_LOOP_QUESTION = `
You can do one of the following:
  1. Upload salary document and generate proof
  2. View proof status
  3. Exit
Which would you like to do? `;

const processJsonDocument = async (rli: Interface): Promise<SalaryDocument> => {
  const jsonInput = await rli.question('Enter JSON file path or paste JSON directly: ');
  
  let documentData: any;
  
  try {
    // First try to parse as direct JSON
    documentData = JSON.parse(jsonInput);
  } catch {
    try {
      // Try reading as file path
      const fileContent = await readFile(jsonInput, 'utf8');
      documentData = JSON.parse(fileContent);
    } catch (error) {
      logger.error('Invalid JSON format or file path');
      throw new Error('Could not parse JSON document');
    }
  }

  // Validate required fields
  const requiredFields = ['Name', 'Employer', 'Address', 'Date', 'NetPay'];
  for (const field of requiredFields) {
    if (!(field in documentData)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  if (typeof documentData.NetPay !== 'number' || documentData.NetPay <= 0) {
    throw new Error('NetPay must be a positive number');
  }

  return documentData as SalaryDocument;
};

const getProofAmount = async (rli: Interface, maxAmount: number): Promise<number> => {
  while (true) {
    const amountStr = await rli.question(`Enter amount to prove (must be ≤ ${maxAmount}): `);
    const amount = parseFloat(amountStr);
    
    if (isNaN(amount)) {
      logger.error('Please enter a valid number');
      continue;
    }
    
    if (amount <= 0) {
      logger.error('Amount must be positive');
      continue;
    }
    
    if (amount > maxAmount) {
      logger.error(`Amount cannot exceed NetPay of ${maxAmount}`);
      continue;
    }
    
    return amount;
  }
};

const createSalaryProof = async (
  proverContract: DeployedProverContract,
  rli: Interface
): Promise<void> => {
  try {
    // Get document from user
    logger.info('Processing salary document...');
    const document = await processJsonDocument(rli);
    
    logger.info(`Document loaded for ${document.Name} from ${document.Employer}`);
    logger.info(`NetPay: ${document.NetPay}`);
    
    // Get proof amount from user
    const proofAmount = await getProofAmount(rli, document.NetPay);
    
    const proofRequest: SalaryProofRequest = {
      document,
      proofAmount
    };
    
    // Submit proof request
    logger.info('Submitting proof request...');
    await api.submitProofRequest(proverContract, proofRequest);
    
    // Generate proof
    logger.info('Generating salary proof...');
    await api.generateProof(proverContract);
    
    logger.info(`✅ Salary proof generated successfully!`);
    logger.info(`Generated proof that salary is at least ${proofAmount} without revealing actual amount`);
    logger.info(`This proof can now be verified by others using the verification CLI`);
    
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Proof generation failed: ${error.message}`);
    } else {
      logger.error('Unknown error during proof generation');
    }
    throw error;
  }
};

const join = async (providers: ProverProviders, rli: Interface): Promise<DeployedProverContract> => {
  const contractAddress = await rli.question('What is the contract address (in hex)? ');
  return await api.joinContract(providers, contractAddress);
};

// Add a function to check for existing contracts
const checkForExistingContract = async (providers: ProverProviders): Promise<DeployedProverContract | null> => {
  try {
    // This would call an API function to check if the current wallet has any deployed contracts
    return await api.findExistingContract(providers);
  } catch (error) {
    logger.debug('No existing contract found or error checking contracts');
    return null;
  }
};

const autoDeployOrJoin = async (providers: ProverProviders): Promise<DeployedProverContract | null> => {
  logger.info('Checking for existing contracts...');
  
  // Check if user already has a contract
  const existingContract = await checkForExistingContract(providers);
  
  if (existingContract) {
    logger.info('✅ Found existing contract! Connecting...');
    return existingContract;
  } else {
    logger.info('No existing contract found. Deploying new contract...');
    const newContract = await api.deploy(providers, { initialState: {} });
    logger.info('✅ New contract deployed successfully!');
    return newContract;
  }
};

// Update mainLoop to use automatic deployment/joining
const mainLoop = async (providers: ProverProviders, rli: Interface): Promise<void> => {
  const proverContract = await autoDeployOrJoin(providers);
  if (proverContract === null) {
    logger.error('Failed to deploy or join contract');
    return;
  }
  
  while (true) {
    const choice = await rli.question(MAIN_LOOP_QUESTION);
    switch (choice) {
      case '1':
        await createSalaryProof(proverContract, rli);
        break;
      case '2':
        await api.displayProofStatus(providers, proverContract);
        break;
      case '3':
        logger.info('Exiting...');
        return;
      default:
        logger.error(`Invalid choice: ${choice}`);
    }
  }
};

const buildWalletFromSeed = async (config: Config, rli: Interface): Promise<Wallet & Resource> => {
  const seed = await rli.question('Enter your wallet seed: ');
  return await api.buildWalletAndWaitForFunds(config, seed, '');
};

const WALLET_LOOP_QUESTION = `
You can do one of the following:
  1. Build a fresh wallet
  2. Build wallet from a seed
  3. Exit
Which would you like to do? `;

const buildWallet = async (config: Config, rli: Interface): Promise<(Wallet & Resource) | null> => {
  if (config instanceof StandaloneConfig) {
    return await api.buildWalletAndWaitForFunds(config, GENESIS_MINT_WALLET_SEED, '');
  }
  while (true) {
    const choice = await rli.question(WALLET_LOOP_QUESTION);
    switch (choice) {
      case '1':
        return await api.buildFreshWallet(config);
      case '2':
        return await buildWalletFromSeed(config, rli);
      case '3':
        logger.info('Exiting...');
        return null;
      default:
        logger.error(`Invalid choice: ${choice}`);
    }
  }
};

const mapContainerPort = (env: StartedDockerComposeEnvironment, url: string, containerName: string) => {
  const mappedUrl = new URL(url);
  const container = env.getContainer(containerName);

  mappedUrl.port = String(container.getFirstMappedPort());

  return mappedUrl.toString().replace(/\/+$/, '');
};

export const run = async (config: Config, _logger: Logger, dockerEnv?: DockerComposeEnvironment): Promise<void> => {
  logger = _logger;
  api.setLogger(_logger);
  const rli = createInterface({ input, output, terminal: true });
  let env;
  if (dockerEnv !== undefined) {
    env = await dockerEnv.up();

    if (config instanceof StandaloneConfig) {
      config.indexer = mapContainerPort(env, config.indexer, 'prover-indexer');
      config.indexerWS = mapContainerPort(env, config.indexerWS, 'prover-indexer');
      config.node = mapContainerPort(env, config.node, 'prover-node');
      config.proofServer = mapContainerPort(env, config.proofServer, 'prover-proof-server');
    }
  }
  const wallet = await buildWallet(config, rli);
  try {
    if (wallet !== null) {
      const providers = await api.configureProviders(wallet, config);
      await mainLoop(providers, rli);
    }
  } catch (e) {
    if (e instanceof Error) {
      logger.error(`Found error '${e.message}'`);
      logger.info('Exiting...');
      logger.debug(`${e.stack}`);
    } else {
      throw e;
    }
  } finally {
    try {
      rli.close();
      rli.removeAllListeners();
    } catch (e) {
      logger.error(`Error closing readline interface: ${e}`);
    } finally {
      try {
        if (wallet !== null) {
          await wallet.close();
        }
      } catch (e) {
        logger.error(`Error closing wallet: ${e}`);
      } finally {
        try {
          if (env !== undefined) {
            await env.down();
            logger.info('Goodbye');
          }
        } catch (e) {
          logger.error(`Error shutting down docker environment: ${e}`);
        }
      }
    }
  }
};

// Export for automated processing (API usage)
export const processDocumentAutomatically = async (
  config: Config,
  _logger: Logger,
  documentPath: string,
  proofAmount: number,
  dockerEnv?: DockerComposeEnvironment
): Promise<void> => {
  logger = _logger;
  api.setLogger(_logger);
  
  try {
    // Read and validate document
    const fileContent = await readFile(documentPath, 'utf8');
    const document = JSON.parse(fileContent) as SalaryDocument;
    
    if (proofAmount > document.NetPay) {
      throw new Error(`Proof amount ${proofAmount} exceeds NetPay ${document.NetPay}`);
    }
    
    // Setup wallet and providers
    const wallet = await api.buildWalletAndWaitForFunds(config, GENESIS_MINT_WALLET_SEED, '');
    const providers = await api.configureProviders(wallet, config);
    
    // Auto deploy or join existing contract
    const proverContract = await autoDeployOrJoin(providers);
    if (!proverContract) {
      throw new Error('Failed to deploy or join contract');
    }
    
    const proofRequest: SalaryProofRequest = { document, proofAmount };
    
    await api.submitProofRequest(proverContract, proofRequest);
    await api.generateProof(proverContract);
    
    logger.info('✅ Automated salary proof generated successfully!');
    logger.info('This proof can now be verified by others using the verification CLI');
    
  } catch (error) {
    logger.error(`Automated processing failed: ${error}`);
    throw error;
  }
};

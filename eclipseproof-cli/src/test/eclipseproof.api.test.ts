import { type Resource } from '@midnight-ntwrk/wallet';
import { type Wallet } from '@midnight-ntwrk/wallet-api';
import path from 'path';
import * as api from '../api';
import { type ProverProviders, type SalaryProofRequest } from '../common-types';
import { currentDir } from '../config';
import { createLogger } from '../logger-utils';
import { TestEnvironment } from './simulators/test-environment';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const logDir = path.resolve(currentDir, '..', 'logs', 'tests', `${new Date().toISOString()}.log`);
const logger = await createLogger(logDir);

describe('Prover API', () => {
  let testEnvironment: TestEnvironment;
  let wallet: Wallet & Resource;
  let providers: ProverProviders;

  beforeAll(
    async () => {
      api.setLogger(logger);
      testEnvironment = new TestEnvironment(logger);
      const testConfiguration = await testEnvironment.start();
      wallet = await testEnvironment.getWallet();
      providers = await api.configureProviders(wallet, testConfiguration.dappConfig);
    },
    1000 * 60 * 45,
  );

  afterAll(async () => {
    await testEnvironment.saveWalletCache();
    await testEnvironment.shutdown();
  });

  it('should deploy prover contract and generate salary proof [@slow]', async () => {
    // Deploy prover contract with initial state
    const proverContract = await api.deploy(providers, {
      proofs: [],
      status: ''
    });
    expect(proverContract).not.toBeNull();

    // Check initial proof status
    const initialStatus = await api.displayProofStatus(providers, proverContract);
    expect(initialStatus.proofStatus).toBeDefined();

    // Create sample salary document
    const sampleDocument = {
      Name: "John Doe",
      Employer: "Tech Corp",
      Address: "123 Main St",
      Date: "2024-01-15",
      NetPay: 75000
    };

    const proofRequest: SalaryProofRequest = {
      document: sampleDocument,
      proofAmount: 50000 // Proving salary is at least 50k
    };

    // Submit proof request
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const submitResponse = await api.submitProofRequest(proverContract, proofRequest);
    expect(submitResponse.txHash).toMatch(/[0-9a-f]{64}/);
    expect(submitResponse.blockHeight).toBeGreaterThan(BigInt(0));

    // Generate proof
    const generateResponse = await api.generateProof(proverContract);
    expect(generateResponse.txHash).toMatch(/[0-9a-f]{64}/);
    expect(generateResponse.blockHeight).toBeGreaterThan(BigInt(0));

    // Check final proof status
    const finalStatus = await api.displayProofStatus(providers, proverContract);
    expect(finalStatus.contractAddress).toEqual(initialStatus.contractAddress);
    expect(finalStatus.proofStatus).toBeDefined();
  });
});

import { type Logger } from 'pino';
import * as Rx from 'rxjs';
import { WebSocket } from 'ws';
import { webcrypto } from 'crypto';
import * as bip39 from '@scure/bip39';
import { wordlist as english } from '@scure/bip39/wordlists/english.js';

import {
  type CounterContract,
  type CounterPrivateStateId,
  type CounterProviders,
  type DeployedCounterContract,
} from './common-types';
import { type Config, contractConfig } from './config';
import { Counter, type CounterPrivateState, witnesses } from '@meshsdk/counter-contract';

import { type ContractAddress } from '@midnight-ntwrk/compact-runtime';
import * as ledger from '@midnight-ntwrk/ledger-v6';


import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { assertIsContractAddress } from '@midnight-ntwrk/midnight-js-utils';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import {
  type FinalizedTxData,
  type MidnightProvider,
  type WalletProvider,
  type BalancedProvingRecipe,
} from '@midnight-ntwrk/midnight-js-types';

import {
  createKeystore,
  InMemoryTransactionHistoryStorage,
  PublicKey as UnshieldedPublicKey,
  type UnshieldedKeystore,
  UnshieldedWallet,
} from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';

let logger: Logger;

// @ts-expect-error: It's needed to enable WebSocket usage through apollo
globalThis.WebSocket = WebSocket;

export function setLogger(_logger: Logger) {
  logger = _logger;
}

// Types for the new wallet
export interface WalletContext {
  wallet: WalletFacade;
  shieldedSecretKeys: ledger.ZswapSecretKeys;
  dustSecretKey: ledger.DustSecretKey;
  unshieldedKeystore: UnshieldedKeystore;
}

export const getCounterLedgerState = async (
  providers: CounterProviders,
  contractAddress: ContractAddress,
): Promise<bigint | null> => {
  assertIsContractAddress(contractAddress);
  logger.info('Checking contract ledger state...');
  const state = await providers.publicDataProvider
    .queryContractState(contractAddress)
    .then((contractState) => (contractState != null ? Counter.ledger(contractState.data).round : null));
  logger.info(`Ledger state: ${state}`);
  return state;
};

export const counterContractInstance: CounterContract = new Counter.Contract(witnesses);

export const joinContract = async (
  providers: CounterProviders,
  contractAddress: string,
): Promise<DeployedCounterContract> => {
  const counterContract = await findDeployedContract(providers, {
    contractAddress,
    contract: counterContractInstance,
    privateStateId: 'counterPrivateState',
    initialPrivateState: { privateCounter: 0 },
  });
  logger.info(`Joined contract at address: ${counterContract.deployTxData.public.contractAddress}`);
  return counterContract;
};

export const deploy = async (
  providers: CounterProviders,
  privateState: CounterPrivateState,
): Promise<DeployedCounterContract> => {
  logger.info('Deploying counter contract...');
  const counterContract = await deployContract(providers, {
    contract: counterContractInstance,
    privateStateId: 'counterPrivateState',
    initialPrivateState: privateState,
  });
  logger.info(`Deployed contract at address: ${counterContract.deployTxData.public.contractAddress}`);
  return counterContract;
};

export const increment = async (counterContract: DeployedCounterContract): Promise<FinalizedTxData> => {
  logger.info('Incrementing...');
  const finalizedTxData = await counterContract.callTx.increment();
  logger.info({
    section: 'PUBLIC',
    tx: finalizedTxData.public.tx,
    txHash: finalizedTxData.public.txHash,
    txId: finalizedTxData.public.txId,
    blockHeight: finalizedTxData.public.blockHeight,
    blockHash: finalizedTxData.public.blockHash,
    blockAuthority: finalizedTxData.public.blockAuthor,
    blockTimestamp: finalizedTxData.public.blockTimestamp,
    fees: finalizedTxData.public.fees,
    nextContractState: finalizedTxData.public.nextContractState,
    publicTranscript: finalizedTxData.public.publicTranscript,
    status: finalizedTxData.public.status,
    identifiers: finalizedTxData.public.identifiers,
    indexerId: finalizedTxData.public.indexerId,
    protocolVersion: finalizedTxData.public.protocolVersion,
    segmentStatusMap: finalizedTxData.public.segmentStatusMap,
    unshielded: finalizedTxData.public.unshielded,
  });

  logger.info({
    section: 'Guaranteed-Effects',
    claimedContractCalls: finalizedTxData.public.partitionedTranscript[0]?.effects.claimedContractCalls,
    claimedNullifiers: finalizedTxData.public.partitionedTranscript[0]?.effects.claimedNullifiers,
    claimedShieldedReceives: finalizedTxData.public.partitionedTranscript[0]?.effects.claimedShieldedReceives,
    claimedShieldedSpends: finalizedTxData.public.partitionedTranscript[0]?.effects.claimedShieldedSpends,
    claimedUnshieldedSpends: finalizedTxData.public.partitionedTranscript[0]?.effects.claimedUnshieldedSpends,
    shieldedMints: finalizedTxData.public.partitionedTranscript[0]?.effects.shieldedMints,
    unshieldedInputs: finalizedTxData.public.partitionedTranscript[0]?.effects.unshieldedInputs,
    unshieldedMints: finalizedTxData.public.partitionedTranscript[0]?.effects.unshieldedMints,
    unshieldedOutputs: finalizedTxData.public.partitionedTranscript[0]?.effects.unshieldedOutputs,
    gas: finalizedTxData.public.partitionedTranscript[0]?.gas,
    program: finalizedTxData.public.partitionedTranscript[0]?.program,
  });

  logger.info({
    section: 'Fallible-Effects',
   claimedContractCalls: finalizedTxData.public.partitionedTranscript[1]?.effects.claimedContractCalls,
    claimedNullifiers: finalizedTxData.public.partitionedTranscript[1]?.effects.claimedNullifiers,
    claimedShieldedReceives: finalizedTxData.public.partitionedTranscript[1]?.effects.claimedShieldedReceives,
    claimedShieldedSpends: finalizedTxData.public.partitionedTranscript[1]?.effects.claimedShieldedSpends,
    claimedUnshieldedSpends: finalizedTxData.public.partitionedTranscript[1]?.effects.claimedUnshieldedSpends,
    shieldedMints: finalizedTxData.public.partitionedTranscript[1]?.effects.shieldedMints,
    unshieldedInputs: finalizedTxData.public.partitionedTranscript[1]?.effects.unshieldedInputs,
    unshieldedMints: finalizedTxData.public.partitionedTranscript[1]?.effects.unshieldedMints,
    unshieldedOutputs: finalizedTxData.public.partitionedTranscript[1]?.effects.unshieldedOutputs,
    gas: finalizedTxData.public.partitionedTranscript[1]?.gas,
    program: finalizedTxData.public.partitionedTranscript[1]?.program,
  });

  logger.info({
    section: 'Private Section',
    Inputs: finalizedTxData.private.input,
    newCoins: finalizedTxData.private.newCoins,
    nextPrivateState: finalizedTxData.private.nextPrivateState,
    nextZswapLocalState: finalizedTxData.private.nextZswapLocalState,
    Output: finalizedTxData.private.output,
    privateTranscriptOutputs: finalizedTxData.private.privateTranscriptOutputs,
    result: finalizedTxData.private.result,
    unprovenTx: finalizedTxData.private.unprovenTx,
  });

  return finalizedTxData.public;
};

export const displayCounterValue = async (
  providers: CounterProviders,
  counterContract: DeployedCounterContract,
): Promise<{ counterValue: bigint | null; contractAddress: string }> => {
  const contractAddress = counterContract.deployTxData.public.contractAddress;
  const counterValue = await getCounterLedgerState(providers, contractAddress);
  if (counterValue === null) {
    logger.info(`There is no counter contract deployed at ${contractAddress}.`);
  } else {
    logger.info(`Current counter value: ${Number(counterValue)}`);
  }
  return { contractAddress, counterValue };
};

export const createWalletAndMidnightProvider = async (
  walletContext: WalletContext,
): Promise<WalletProvider & MidnightProvider> => {
  const state = await Rx.firstValueFrom(walletContext.wallet.state().pipe(Rx.filter((s) => s.isSynced)));
  logger.info({
    section: 'DUST Wallet State',
    dust: state.dust,
  });
   logger.info({
    section: 'Shielded Wallet State',
    shielded: state.shielded,
  });
   logger.info({
    section: 'Unshielded Wallet State',
    unshielded: state.unshielded,
  });
  return {
    getCoinPublicKey(): ledger.CoinPublicKey {
      return walletContext.shieldedSecretKeys.coinPublicKey as unknown as ledger.CoinPublicKey;
    },
    getEncryptionPublicKey(): ledger.EncPublicKey {
      return walletContext.shieldedSecretKeys.encryptionPublicKey as unknown as ledger.EncPublicKey;
    },
    async balanceTx(
      tx: ledger.UnprovenTransaction,
      newCoins?: ledger.ShieldedCoinInfo[],
      ttl?: Date,
    ): Promise<BalancedProvingRecipe> {
      // Use the wallet facade to balance the transaction
      const txTtl = ttl ?? new Date(Date.now() + 30 * 60 * 1000); // 30 min default TTL
      // balanceTransaction returns a ProvingRecipe directly
      const provingRecipe = await walletContext.wallet.balanceTransaction(
        walletContext.shieldedSecretKeys,
        walletContext.dustSecretKey,
        tx as unknown as ledger.Transaction<ledger.SignatureEnabled, ledger.Proofish, ledger.Bindingish>,
        txTtl,
      );
      return provingRecipe as unknown as BalancedProvingRecipe;
    },
    async submitTx(tx: ledger.FinalizedTransaction): Promise<ledger.TransactionId> {
      return await walletContext.wallet.submitTransaction(tx);
    },
  };
};

export const waitForSync = (wallet: WalletFacade) =>
  Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(5_000),
      Rx.tap((state) => {
        logger.info(`Waiting for wallet sync. Synced: ${state.isSynced}`);
      }),
      Rx.filter((state) => state.isSynced),
    ),
  );

export const waitForFunds = (wallet: WalletFacade) =>
  Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(10_000),
      Rx.tap((state) => {
        const unshielded = state.unshielded?.balances[ledger.nativeToken().raw] ?? 0n;
        const shielded = state.shielded?.balances[ledger.nativeToken().raw] ?? 0n;
        logger.info(`Waiting for funds. Synced: ${state.isSynced}, Unshielded: ${unshielded}, Shielded: ${shielded}`);
      }),
      Rx.filter((state) => state.isSynced),
      Rx.map(
        (s) =>
          (s.unshielded?.balances[ledger.nativeToken().raw] ?? 0n) +
          (s.shielded?.balances[ledger.nativeToken().raw] ?? 0n),
      ),
      Rx.filter((balance) => balance > 0n),
    ),
  );

/**
 * Display wallet balances (unshielded, shielded, total)
 */
export const displayWalletBalances = async (
  wallet: WalletFacade,
): Promise<{ unshielded: any; shielded: bigint; total: bigint }> => {
  const state = await Rx.firstValueFrom(wallet.state());
  const unshielded = state.unshielded?.balances[ledger.nativeToken().raw] ?? 0n; 
  const shielded = state.shielded?.balances[ledger.nativeToken().raw] ?? 0n;
  const total = unshielded + shielded;

  logger.info(`Unshielded balance: ${unshielded} tSTAR`);
  logger.info(`Shielded balance: ${shielded} tSTAR`);
  logger.info(`Total balance: ${total} tSTAR`);

  return { unshielded, shielded, total };
};

/**
 * Register unshielded Night UTXOs for dust generation
 * This is required before the wallet can pay transaction fees
 */
export const registerNightForDust = async (walletContext: WalletContext): Promise<boolean> => {
  const state = await Rx.firstValueFrom(walletContext.wallet.state().pipe(Rx.filter((s) => s.isSynced)));

  // Check if we have unshielded coins that are not registered for dust generation
  const unregisteredNightUtxos =
    state.unshielded?.availableCoins.filter((coin) => coin.meta.registeredForDustGeneration === false) ?? [];

  if (unregisteredNightUtxos.length === 0) {
    logger.info('No unshielded Night UTXOs available for dust registration, or all are already registered');

    // Check current dust balance
    const dustBalance = state.dust?.walletBalance(new Date()) ?? 0n;
    logger.info(`Current dust balance: ${dustBalance}`);

    return dustBalance > 0n;
  }

  logger.info(`Found ${unregisteredNightUtxos.length} unshielded Night UTXOs not registered for dust generation`);
  logger.info('Registering Night UTXOs for dust generation...');

  try {
    const recipe = await walletContext.wallet.registerNightUtxosForDustGeneration(
      unregisteredNightUtxos,
      walletContext.unshieldedKeystore.getPublicKey(),
      (payload) => walletContext.unshieldedKeystore.signData(payload)
    );

    logger.info('Finalizing dust registration transaction...');
    const finalizedTx = await walletContext.wallet.finalizeTransaction(recipe);

    logger.info('Submitting dust registration transaction...');
    const txId = await walletContext.wallet.submitTransaction(finalizedTx);
    logger.info(`Dust registration submitted with tx id: ${txId}`);

    // Wait for dust to be available
    logger.info('Waiting for dust to be generated...');
    await Rx.firstValueFrom(
      walletContext.wallet.state().pipe(
        Rx.throttleTime(5_000),
        Rx.tap((s) => {
          const dustBalance = s.dust?.walletBalance(new Date()) ?? 0n;
          logger.info(`Dust balance: ${dustBalance}`);
        }),
        Rx.filter((s) => (s.dust?.walletBalance(new Date()) ?? 0n) > 0n),
      ),
    );

    logger.info('Dust registration complete!');
    return true;
  } catch (e) {
    logger.error(`Failed to register Night UTXOs for dust: ${e}`);
    return false;
  }
};

/**
 * Convert mnemonic phrase to seed buffer using BIP39 standard
 * This generates a 64-byte seed as expected by Midnight HD wallet
 */
export const mnemonicToSeed = async (mnemonic: string): Promise<Buffer> => {
  const words = mnemonic.trim().split(/\s+/);
  if (!bip39.validateMnemonic(words.join(' '), english)) {
    throw new Error('Invalid mnemonic phrase');
  }
  // Use BIP39 standard seed derivation (PBKDF2) - produces 64 bytes. hashes it (mixes it up) 2048 times using SHA-512
  const seed = await bip39.mnemonicToSeed(words.join(' '));
  return Buffer.from(seed);
};

/**
 * Initialize wallet with seed using the new wallet SDK
 */
export const initWalletWithSeed = async (
  seed: Buffer,
  config: Config,
): Promise<WalletContext> => {
  const hdWallet = HDWallet.fromSeed(seed);

  if (hdWallet.type !== 'seedOk') {
    throw new Error('Failed to initialize HDWallet');
  }

  const derivationResult = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);

  if (derivationResult.type !== 'keysDerived') {
    throw new Error('Failed to derive keys');
  }

  hdWallet.hdWallet.clear();

  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(derivationResult.keys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(derivationResult.keys[Roles.Dust]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unshieldedKeystore = createKeystore(derivationResult.keys[Roles.NightExternal], config.networkId as any);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const walletConfiguration: any = {
    networkId: config.networkId,
    costParameters: {
      additionalFeeOverhead: 300_000_000_000_000n, // 300 trillion - matches SDK examples
      feeBlocksMargin: 5,
    },
    relayURL: new URL(config.node),
    provingServerUrl: new URL(config.proofServer),
    indexerClientConnection: {
      indexerHttpUrl: config.indexer,
      indexerWsUrl: config.indexerWS,
    },
    indexerUrl: config.indexerWS,
  };

  const shieldedWallet = ShieldedWallet(walletConfiguration).startWithSecretKeys(shieldedSecretKeys);
  const dustWallet = DustWallet(walletConfiguration).startWithSecretKey(
    dustSecretKey,
    ledger.LedgerParameters.initialParameters().dust,
  );
  const unshieldedWallet = UnshieldedWallet({
    ...walletConfiguration,
    txHistoryStorage: new InMemoryTransactionHistoryStorage(),
  }).startWithPublicKey(UnshieldedPublicKey.fromKeyStore(unshieldedKeystore));

  const facade: WalletFacade = new WalletFacade(shieldedWallet, unshieldedWallet, dustWallet);
  await facade.start(shieldedSecretKeys, dustSecretKey);

  return { wallet: facade, shieldedSecretKeys, dustSecretKey, unshieldedKeystore };
};

/**
 * Build wallet from mnemonic and wait for funds
 */
export const buildWalletAndWaitForFunds = async (
  config: Config,
  mnemonic: string,
): Promise<WalletContext> => {
  logger.info('Building wallet from mnemonic...');

  const seed = await mnemonicToSeed(mnemonic);
  const walletContext = await initWalletWithSeed(seed, config);

  logger.info(`Your wallet address: ${walletContext.unshieldedKeystore.getBech32Address().asString()}`);

  // Wait for sync first
  logger.info('Waiting for wallet to sync...');
  await waitForSync(walletContext.wallet);

  // Display and check balance
  const { total } = await displayWalletBalances(walletContext.wallet);

  if (total === 0n) {
    logger.info('Waiting to receive tokens...');
    await waitForFunds(walletContext.wallet);
    await displayWalletBalances(walletContext.wallet);
  }

  // Register Night UTXOs for dust generation (required for paying fees)
  await registerNightForDust(walletContext);

  return walletContext;
};

export const randomBytes = (length: number): Uint8Array => {
  const bytes = new Uint8Array(length);
  webcrypto.getRandomValues(bytes);
  return bytes;
};

/**
 * Generate a fresh wallet with random mnemonic
 */
export const buildFreshWallet = async (config: Config): Promise<WalletContext> => {
  const mnemonic = bip39.generateMnemonic(english, 256);
  logger.info(`Generated new wallet mnemonic: ${mnemonic}`);
  return await buildWalletAndWaitForFunds(config, mnemonic);
};

/**
 * Build wallet from hex seed (for backwards compatibility with genesis wallet)
 */
export const buildWalletFromHexSeed = async (
  config: Config,
  hexSeed: string,
): Promise<WalletContext> => {
  logger.info('Building wallet from hex seed...');
  const seed = Buffer.from(hexSeed, 'hex');
  const walletContext = await initWalletWithSeed(seed, config);

  logger.info(`Your wallet address: ${walletContext.unshieldedKeystore.getBech32Address().asString()}`);

  // Wait for sync first
  logger.info('Waiting for wallet to sync...');
  await waitForSync(walletContext.wallet);

  // Display and check balance
  const { total } = await displayWalletBalances(walletContext.wallet);

  if (total === 0n) {
    logger.info('Waiting to receive tokens...');
    await waitForFunds(walletContext.wallet);
    await displayWalletBalances(walletContext.wallet);
  }

  // Register Night UTXOs for dust generation (required for paying fees)
  await registerNightForDust(walletContext);

  return walletContext;
};

export const configureProviders = async (walletContext: WalletContext, config: Config) => {
  // Set global network ID - required before contract deployment
  setNetworkId(config.networkId);

  const walletAndMidnightProvider = await createWalletAndMidnightProvider(walletContext);
  return {
    privateStateProvider: levelPrivateStateProvider<typeof CounterPrivateStateId>({
      privateStateStoreName: contractConfig.privateStateStoreName,
    }),
    publicDataProvider: indexerPublicDataProvider(config.indexer, config.indexerWS),
    zkConfigProvider: new NodeZkConfigProvider<'increment'>(contractConfig.zkConfigPath),
    proofProvider: httpClientProofProvider(config.proofServer),
    walletProvider: walletAndMidnightProvider,
    midnightProvider: walletAndMidnightProvider,
  };
};

export const closeWallet = async (walletContext: WalletContext): Promise<void> => {
  try {
    await walletContext.wallet.stop();
  } catch (e) {
    logger.error(`Error closing wallet: ${e}`);
  }
};

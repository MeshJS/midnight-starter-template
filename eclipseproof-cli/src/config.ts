import path from 'node:path';
import { NetworkId, setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { WalletBuilder } from '@midnight-ntwrk/wallet';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import type { ProverProviders } from './common-types';
import { createLogger } from './logger-utils';

export const currentDir = path.resolve(new URL(import.meta.url).pathname, '..');

export const contractConfig = {
  privateStateStoreName: 'eclipseproof-private-state',
  zkConfigPath: path.resolve(currentDir, '..', 'frontend-vite-react', 'public', 'midnight', 'counter'),
};

export interface Config {
  readonly logDir: string;
  readonly indexer: string;
  readonly indexerWS: string;
  readonly node: string;
  readonly proofServer: string;
}

export class TestnetLocalConfig implements Config {
  logDir = path.resolve(currentDir, '..', 'logs', 'testnet-local', `${new Date().toISOString()}.log`);
  indexer = 'http://127.0.0.1:8088/api/v1/graphql';
  indexerWS = 'ws://127.0.0.1:8088/api/v1/graphql/ws';
  node = 'http://127.0.0.1:9944';
  proofServer = 'http://127.0.0.1:6300';
  constructor() {
    setNetworkId(NetworkId.TestNet);
  }
}

export class StandaloneConfig implements Config {
  logDir = path.resolve(currentDir, '..', 'logs', 'standalone', `${new Date().toISOString()}.log`);
  indexer = 'http://127.0.0.1:8088/api/v1/graphql';
  indexerWS = 'ws://127.0.0.1:8088/api/v1/graphql/ws';
  node = 'http://127.0.0.1:9944';
  proofServer = 'http://127.0.0.1:6300';
  constructor() {
    setNetworkId(NetworkId.Undeployed);
  }
}

export class TestnetRemoteConfig implements Config {
  logDir = path.resolve(currentDir, '..', 'logs', 'testnet-remote', `${new Date().toISOString()}.log`);
  indexer = 'https://indexer.testnet-02.midnight.network/api/v1/graphql';
  indexerWS = 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws';
  node = 'https://rpc.testnet-02.midnight.network';
  proofServer = 'http://127.0.0.1:6300';
  constructor() {
    setNetworkId(NetworkId.TestNet);
  }
}

export async function setupProviders(config?: Config): Promise<ProverProviders> {
  const logger = createLogger('providers');
  
  // Use provided config or default to testnet
  const cfg = config || new TestnetLocalConfig();
  
  logger.info('Setting up providers with config:', {
    indexer: cfg.indexer,
    node: cfg.node,
    proofServer: cfg.proofServer
  });

  // Create wallet (you might want to use a seed from environment variables)
  const walletSeed = process.env.WALLET_SEED || '0000000000000000000000000000000000000000000000000000000000000001';
  
  // Import required dependencies for wallet setup
  const { getZswapNetworkId } = await import('@midnight-ntwrk/midnight-js-network-id');
  
  const wallet = await WalletBuilder.buildFromSeed(
    cfg.indexer,
    cfg.indexerWS,
    cfg.proofServer,
    cfg.node,
    walletSeed,
    getZswapNetworkId(),
    'info',
  );
  
  wallet.start();

  // Use the existing configureProviders function from api.ts
  const { configureProviders } = await import('./api');
  const providers = await configureProviders(wallet, cfg);

  logger.info('Providers set up successfully');
  return providers;
}

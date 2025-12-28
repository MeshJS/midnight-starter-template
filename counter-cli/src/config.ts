import path from 'node:path';
export const currentDir = path.resolve(new URL(import.meta.url).pathname, '..');

export const contractConfig = {
  privateStateStoreName: 'counter-private-state',
  zkConfigPath: path.resolve(currentDir, '..', '..', 'counter-contract', 'src', 'managed', 'counter'),
};

export interface Config {
  readonly logDir: string;
  readonly indexer: string;
  readonly indexerWS: string;
  readonly node: string;
  readonly proofServer: string;
  readonly networkId: string;
}

export class UndeployedConfig implements Config {
  logDir = path.resolve(currentDir, '..', 'logs', 'tui-standalone', `${new Date().toISOString()}.log`);
  indexer = 'http://127.0.0.1:8088/api/v3/graphql';
  indexerWS = 'ws://127.0.0.1:8088/api/v3/graphql/ws';
  node = 'ws://127.0.0.1:9944';
  proofServer = 'http://127.0.0.1:6300';
  networkId = 'undeployed';
}

export class PreviewConfig implements Config {
  logDir = path.resolve(currentDir, '..', 'logs', 'tui-preview', `${new Date().toISOString()}.log`);
  indexer = 'https://indexer.preview.midnight.network/api/v3/graphql';
  indexerWS = 'wss://indexer.preview.midnight.network/api/v3/graphql/ws';
  node = 'wss://rpc.preview.midnight.network';
  proofServer = 'http://127.0.0.1:6300';
  networkId = 'preview';
}

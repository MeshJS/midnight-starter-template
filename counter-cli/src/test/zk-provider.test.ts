import path from 'path';
import * as api from '../api';
import { type CounterProviders } from '../common-types';
import { currentDir } from '../config';
import { createLogger } from '../logger';

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import 'dotenv/config';
import * as Rx from 'rxjs';
import { TestEnvironment } from './simulators/simulator';
import { Counter } from '@meshsdk/counter-contract';

const logDir = path.resolve(currentDir, '..', 'logs', 'zk-provider', `${new Date().toISOString()}.log`);
const logger = await createLogger(logDir);

describe('API', () => {
  let testEnvironment: TestEnvironment;
  let wallet: api.WalletContext;
  let providers: CounterProviders;

  beforeAll(
    async () => {
      api.setLogger(logger);
      testEnvironment = new TestEnvironment(logger);
      const testConfiguration = await testEnvironment.start();
      logger.info(`Test configuration: ${JSON.stringify(testConfiguration)}`);
      wallet = await testEnvironment.getWallet();
      providers = await api.configureProviders(wallet, testConfiguration.dappConfig);
    },
    1000 * 60 * 45,
  );

  afterAll(async () => {
    await testEnvironment.shutdown();
  });

  it('ZK provider testing', async () => {
    const zkConfig = await providers.zkConfigProvider.get('increment');
    logger.info({
      circuitId: zkConfig.circuitId,
      PK: zkConfig.proverKey,
      VK: zkConfig.verifierKey,
      zkIR: zkConfig.zkir,
    });

    await providers.zkConfigProvider.getProverKey('increment');
    await providers.zkConfigProvider.getVerifierKey('increment');
    await providers.zkConfigProvider.getVerifierKeys(["increment"]);
    await providers.zkConfigProvider.getZKIR('increment');
  });
});

import path from 'path';
import * as api from '../api';
import { type CounterProviders } from '../common-types';
import { currentDir } from '../config';
import { createLogger } from '../logger';

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import 'dotenv/config';
import * as Rx from 'rxjs';
import { TestEnvironment } from '../test/simulators/simulator';

const logDir = path.resolve(currentDir, '..', 'logs', 'private-provider', `${new Date().toISOString()}.log`);
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

  it('private state provider testing', async () => {
    await providers.privateStateProvider.set("counterPrivateState", { privateCounter: 0 });
    await providers.privateStateProvider.setSigningKey ("9b0419c8f7c6575e238b305931780e359b3ca37c9dc48f872e48a3603c92f4f", "testkey");
  });  
});

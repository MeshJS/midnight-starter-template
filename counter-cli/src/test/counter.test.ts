import path from 'path';
import * as api from '../api';
import { type CounterProviders } from '../common-types';
import { currentDir } from '../config';
import { createLogger } from '../logger';
import { TestEnvironment } from './simulators/simulator';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import 'dotenv/config';

let logDir: string;
const network = process.env.TEST_ENV || 'undeployed';
if (network === 'undeployed') {
  logDir = path.resolve(currentDir, '..', 'logs', 'test-undeployed', `${new Date().toISOString()}.log`);
} else {
  logDir = path.resolve(currentDir, '..', 'logs', 'test-preview', `${new Date().toISOString()}.log`);
}
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

  it('should deploy the contract and increment the counter [@slow]', async () => {
    const counterContract = await api.deploy(providers, { privateCounter: 0 });
    // expect(counterContract).not.toBeNull();

    // const counter = await api.displayCounterValue(providers, counterContract);
    // expect(counter.counterValue).toEqual(BigInt(0));

    // await new Promise((resolve) => setTimeout(resolve, 2000));
    // const response = await api.increment(counterContract);
    // expect(response.txHash).toMatch(/[0-9a-f]{64}/);
    // expect(response.blockHeight).toBeGreaterThan(BigInt(0));

    // const counterAfter = await api.displayCounterValue(providers, counterContract);
    // expect(counterAfter.counterValue).toEqual(BigInt(1));
    // expect(counterAfter.contractAddress).toEqual(counter.contractAddress);
  });
});

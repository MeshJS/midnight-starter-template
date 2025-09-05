import path from 'path';
import { TestEnvironment } from '../test/commons';
import { nativeToken, tokenType } from '@midnight-ntwrk/ledger';
import { type Wallet } from '@midnight-ntwrk/wallet-api';
import type { Resource } from '@midnight-ntwrk/wallet';
import { ContractAddress } from '@midnight-ntwrk/compact-runtime';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { type CounterProviders } from '../common-types';
import * as api from '../api';
import { currentDir } from '../config';
import { createLogger } from '../logger-utils';

// Update this wallet address with your own undeployed-network wallet
const my_own_wallet =
  'mn_shield-addr_undeployed1pldqkwy77d0cw0yspkqxv8urkxhtlm3p9w3aq500wuqhaagaljnsxq93lz69qpm6erjvk7wgun3crpf999wcukywuk5c5ch7jpaf62dm7v4tuepw';
const logDir = path.resolve(currentDir, '..', 'logs', 'prepare-standalone', `${new Date().toISOString()}.log`);
const logger = await createLogger(logDir);

describe('Prepare Standalone', () => {
  let testEnvironment: TestEnvironment;
  let wallet: Wallet & Resource;
  let providers: CounterProviders;
  let keepAliveInterval: NodeJS.Timeout;

  async function sendNativeToken(address: string, amount: bigint): Promise<string> {
    const transferRecipe = await wallet.transferTransaction([
      {
        amount,
        receiverAddress: address,
        type: nativeToken(),
      },
    ]);
    const transaction = await wallet.proveTransaction(transferRecipe);
    return await wallet.submitTransaction(transaction);
  }

  beforeAll(
    async () => {
      api.setLogger(logger);
      testEnvironment = new TestEnvironment(logger);
      const testConfiguration = await testEnvironment.start();
      wallet = await testEnvironment.getWallet();
      providers = await api.configureProviders(wallet, testConfiguration.dappConfig);
      keepAliveInterval = setInterval(() => {
        console.log('Keeping container alive...');
      }, 60000); // every 60 seconds
    },
    1000 * 60 * 45,
  );

  afterAll(
    async () => {
      try {
        // await testEnvironment.shutdown();
        clearInterval(keepAliveInterval);
        await new Promise(() => {});
      } catch (e) {
        // ignore
      }
    },
    1000 * 60 * 60 * 24 * 7,
  );

  it('Initialize standalone', async () => {    
    await sendNativeToken(my_own_wallet, 10000n * 1000000n);
    logger.info('funded');
  });
});

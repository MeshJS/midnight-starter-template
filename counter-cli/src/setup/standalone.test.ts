import path from 'path';
import * as api from '../api';
import { type CounterProviders } from '../common-types';
import { currentDir } from '../config';
import { createLogger } from '../logger';
import { TestEnvironment } from '../test/simulators/simulator';
import { describe, it, beforeAll, afterAll } from 'vitest';
import 'dotenv/config';
import * as ledger from '@midnight-ntwrk/ledger-v6';

const logDir = path.resolve(currentDir, '..', 'logs', 'setup-undeployed', `${new Date().toISOString()}.log`);
const logger = await createLogger(logDir);

async function sendNativeToken(wallet: api.WalletContext, address: string, amount: bigint): Promise<string> {
  const txTtl = new Date(Date.now() + 300 * 60 * 1000); // 30 min  

  const transferRecipe = await wallet.wallet.transferTransaction(
    wallet.shieldedSecretKeys,
    wallet.dustSecretKey,
    [
      {
        type: 'unshielded',
        outputs: [
          {
            type: ledger.nativeToken().raw,
            amount,
            receiverAddress: address,
          },
        ],
      },
    ],
    txTtl,
  ); 

  logger.info('Finalizing dust registration transaction...');
  const finalizedTx = await wallet.wallet.finalizeTransaction(transferRecipe);  

  logger.info('Submitting dust registration transaction...');
  const txId = await wallet.wallet.submitTransaction(finalizedTx); 
  logger.info(`Dust registration submitted with tx id: ${txId}`);

  // return txId;
  return txId
}

describe('Prepare Standalone', () => {
  let testEnvironment: TestEnvironment;
  let wallet: api.WalletContext;
  let providers: CounterProviders;
  let keepAliveInterval: NodeJS.Timeout;

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
        clearInterval(keepAliveInterval);
        await new Promise(() => {});
      } catch (e) {
        // ignore
      }
    },
    1000 * 60 * 60 * 24 * 7,
  );

  it('Initialize standalone', async () => {
    const address = process.env.MY_UNDEPLOYED_ADDRESS!
    const result = await sendNativeToken(wallet, address, 10000000n);
    logger.info(result);
  });
});

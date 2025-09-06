import { type Resource } from '@midnight-ntwrk/wallet';
import { type Wallet } from '@midnight-ntwrk/wallet-api';
import path from 'path';
import * as api from '../api';
import { type BboardProviders } from '../common-types';
import { currentDir } from '../config';
import { createLogger } from '../logger-utils';
import { TestEnvironment } from './simulators/test-environment';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { nativeToken } from '@midnight-ntwrk/ledger';

const logDir = path.resolve(currentDir, '..', 'logs', 'tests', `${new Date().toISOString()}.log`);
const logger = await createLogger(logDir);

describe('API', () => {
  let testEnvironment: TestEnvironment;
  let wallet: Wallet & Resource;
  let wallet2: Wallet & Resource;
  let providers: BboardProviders;
  let providers2: BboardProviders;

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
      await sendNativeToken('mn_shield-addr_undeployed135el9hssfsajj73du04sykra84vq7p6l869hx0vqppux8ruhjz3qxq8uelfgju0mdxxe5dmstdag6vnk3fjwwh2dy4f28mupjpc3tls48glz5xw2', 10000n * 1000000n);
      wallet2 = await testEnvironment.getWallet('1efd17461679989e7e18481e97342c2b478dc1e39c7fc676a2e4f07824eeb7b2');
      providers = await api.configureProviders(wallet, testConfiguration.dappConfig);
      providers2 = await api.configureProviders(wallet2, testConfiguration.dappConfig, 'bboard-private-state2');
    },
    1000 * 60 * 45,
  );

  afterAll(async () => {
    await testEnvironment.saveWalletCache();
    await testEnvironment.shutdown();    
  });

  it('should deploy the contract and increment the counter [@slow]', async () => {
    const bboardContract = await api.deploy(providers);
    const bboardContract2 = await api.joinContract(providers2, bboardContract.deployTxData.public.contractAddress);
    expect(bboardContract).not.toBeNull();

    const bboard = await api.displayLedgerState(providers, bboardContract);
    expect(bboard.ledgerState?.instance).toEqual(BigInt(1));

    await new Promise((resolve) => setTimeout(resolve, 2000));
    const response = await api.post(bboardContract, 'hello');
    expect(response.txHash).toMatch(/[0-9a-f]{64}/);
    expect(response.blockHeight).toBeGreaterThan(BigInt(0));

    const counterAfter = await api.displayLedgerState(providers, bboardContract);
    expect(counterAfter.ledgerState?.instance).toEqual(BigInt(1));
    expect(counterAfter.contractAddress).toEqual(bboard.contractAddress);

    await new Promise((resolve) => setTimeout(resolve, 2000));
    await api.takeDown(bboardContract2);
  });
});

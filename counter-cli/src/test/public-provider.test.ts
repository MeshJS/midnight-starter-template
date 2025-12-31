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

const logDir = path.resolve(currentDir, '..', 'logs', 'public-provider', `${new Date().toISOString()}.log`);
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

  it('public state provider testing', async () => {
    const counterContractDeployed = await api.deploy(providers, { privateCounter: 0 });
    const contractAddress = counterContractDeployed.deployTxData.public.contractAddress;
    const response = await api.increment(counterContractDeployed);

    // observable state
    const rawState1 = await Rx.firstValueFrom(
      providers.publicDataProvider.contractStateObservable(contractAddress, { type: 'all' }),
    );
    const state = Counter.ledger(rawState1.data);
    logger.info({ rawState1 });
    logger.info({ state });

    //Contract State
    const rawState2 = await providers.publicDataProvider.queryContractState(contractAddress);
    if (!rawState2) {
      throw new Error('Failed to get contract state');
    }
    const state2 = Counter.ledger(rawState2.data);
    logger.info({ rawState2 });
    logger.info({ state2 });
    

    // Data when contract is deployed
    const rawState3 = await providers.publicDataProvider.queryDeployContractState(contractAddress);    
     if (!rawState3) {
      throw new Error('Failed to get contract state');
    }
    const state3 = Counter.ledger(rawState3.data);
    logger.info({ rawState3 });
    logger.info({ state3 });

    // Query unshielded balances
    const rawState4 = await providers.publicDataProvider.queryUnshieldedBalances(contractAddress);    
     if (!rawState4) {
      throw new Error('Failed to get contract state');
    };
    logger.info({ rawState4 });  
    
    // Query shielded and contract state of the contract
    const rawState5 = await providers.publicDataProvider.queryZSwapAndContractState(contractAddress);    
     if (!rawState5) {
      throw new Error('Failed to get contract state');
    };
    logger.info({ rawState5 });  
    const state5_ZswapChainState_Contract = rawState5[0].filter(contractAddress).toString();
    const state5_ZswapChainState = rawState5[0].toString();
    const publicState = Counter.ledger(rawState5[1].data);
    logger.info({ state5_ZswapChainState_Contract });    
    logger.info({ state5_ZswapChainState });
    logger.info({ publicState });   
    
    // unshielded balances observable
    const rawState6 = await Rx.firstValueFrom(providers.publicDataProvider.unshieldedBalancesObservable(contractAddress, { type: 'all' }));
     if (!rawState6) {
      throw new Error('Failed to get contract state');
    };
    logger.info({ rawState6 });  

    // waiting for contract state
    const rawState7 = await providers.publicDataProvider.watchForContractState(contractAddress);    
     if (!rawState7) {
      throw new Error('Failed to get contract state');
    };
    const state7 = Counter.ledger(rawState7.data);
    logger.info({ state7 });

    // DeployTxData
    const rawState8 = await providers.publicDataProvider.watchForDeployTxData(contractAddress);    
     if (!rawState8) {
      throw new Error('Failed to get contract state');
    };    
    logger.info({ status: rawState8.status });

    // DeployTxIdData
    const rawState9 = await providers.publicDataProvider.watchForTxData(response.txId);    
     if (!rawState9) {
      throw new Error('Failed to get contract state');
    };    
    logger.info({ status: rawState9.status });    
    logger.info({ unshielded: rawState9.unshielded });

    // Wait for unshileded
    const rawState10 = await providers.publicDataProvider.watchForUnshieldedBalances(contractAddress);    
     if (!rawState10) {
      throw new Error('Failed to get contract state');
    };    
    logger.info({ rawState10 });
  });
});

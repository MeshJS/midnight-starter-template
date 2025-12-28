import { type Logger } from 'pino';
import { type ContractAddress } from '@midnight-ntwrk/compact-runtime';
import * as Rx from 'rxjs';
import { CounterContract, CounterPrivateStateId, CounterProviders, DeployedCounterContract, emptyState, UserAction, type DerivedState } from './common-types';
import { Counter, CounterPrivateState, createPrivateState, witnesses } from '@meshsdk/counter-contract';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { PrivateStateProvider } from '@midnight-ntwrk/midnight-js-types';

export const counterContractInstance: CounterContract = new Counter.Contract(witnesses);

export interface ContractControllerInterface {
  readonly deployedContractAddress: ContractAddress;   
  readonly state$: Rx.Observable<DerivedState>;
  increment: () => Promise<void>;
}

export class ContractController implements ContractControllerInterface {
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Rx.Observable<DerivedState>;
  readonly privateStates$: Rx.Subject<CounterPrivateState>;
  readonly turns$: Rx.Subject<UserAction>;  

  private constructor(
    public readonly contractPrivateStateId: typeof CounterPrivateStateId,
    public readonly deployedContract: DeployedCounterContract,
    public readonly providers: CounterProviders,
    private readonly logger: Logger,
  ) {
    const combine = (_acc: DerivedState, value: DerivedState): DerivedState => {
      return {
        round: value.round,
        privateState: value.privateState,
        turns: value.turns,        
      };
    };
    this.deployedContractAddress = deployedContract.deployTxData.public.contractAddress;
    this.turns$ = new Rx.Subject<UserAction>();
    this.privateStates$ = new Rx.Subject<CounterPrivateState>();
    this.state$ = Rx.combineLatest(
      [
        providers.publicDataProvider
          .contractStateObservable(this.deployedContractAddress, { type: 'all' })
          .pipe(Rx.map((contractState) => Counter.ledger(contractState.data))),
        Rx.concat(
          Rx.from(
            Rx.defer(() => providers.privateStateProvider.get(contractPrivateStateId) as Promise<CounterPrivateState>),
          ),
          this.privateStates$,
        ),
        Rx.concat(Rx.of<UserAction>({ increment: undefined }), this.turns$),
      ],
      (ledgerState, privateState, userActions) => {
        const result: DerivedState = {
          round: ledgerState.round,
          privateState: privateState,
          turns: userActions,
        };
        return result;
      },
    ).pipe(
      Rx.scan(combine, emptyState),
      Rx.retry({
        // sometimes websocket fails, if want to add attempts, include count in the object
        delay: 500,
      }),
    );
  }

  async increment(): Promise<void> {
    this.logger?.info('incrementing counter');
    this.turns$.next({ increment: 'incrementinng the counter' });

    try {
      const txData = await this.deployedContract.callTx.increment();
      this.logger?.trace({
        increment: {
          message: 'incrementing the counter - blockchain info',
          txHash: txData.public.txHash,
          blockHeight: txData.public.blockHeight,
        },
      });
      this.turns$.next({
        increment: undefined,
      });
    } catch (e) {
      this.turns$.next({
        increment: undefined,
      });
      throw e;
    }
  }

  static async deploy(
    contractPrivateStateId: typeof CounterPrivateStateId,    
    providers: CounterProviders,
    logger: Logger,
  ): Promise<ContractController> {
    logger.info({
      deployContract: {
        action: "Deploying contract",
        contractPrivateStateId, 
        providers       
      },
    });    
    const deployedContract = await deployContract(providers, {
      privateStateId: contractPrivateStateId,
      contract: counterContractInstance,
      initialPrivateState: await ContractController.getPrivateState(contractPrivateStateId, providers.privateStateProvider),      
    });

    logger.trace({
      contractDeployed: {
        action: "Contract was deployed",
        contractPrivateStateId,
        finalizedDeployTxData: deployedContract.deployTxData.public,
      },
    });

    return new ContractController(contractPrivateStateId, deployedContract, providers, logger);
  }

  static async join(
    contractPrivateStateId: typeof CounterPrivateStateId,   
    providers: CounterProviders,
    contractAddress: ContractAddress,
    logger: Logger,
  ): Promise<ContractController> {
    logger.info({
      joinContract: {
        action: "Joining contract",
        contractPrivateStateId,
        contractAddress,
      },
    });

    const deployedContract = await findDeployedContract(providers, {
      contractAddress,
      contract: counterContractInstance,
      privateStateId: contractPrivateStateId,
      initialPrivateState: await ContractController.getPrivateState(contractPrivateStateId, providers.privateStateProvider),
    });

    logger.trace({
      contractJoined: {
        action: "Join the contract successfully",
        contractPrivateStateId,
        finalizedDeployTxData: deployedContract.deployTxData.public,
      },
    });

    return new ContractController(contractPrivateStateId, deployedContract, providers, logger);
  }

  private static async getPrivateState(
    counterPrivateStateId: typeof CounterPrivateStateId,
    privateStateProvider: PrivateStateProvider<typeof CounterPrivateStateId, CounterPrivateState>,
  ): Promise<CounterPrivateState> {
    const existingPrivateState = await privateStateProvider.get(counterPrivateStateId);
    const initialState = await this.getOrCreateInitialPrivateState(counterPrivateStateId, privateStateProvider);
    return existingPrivateState ?? initialState;
  }

  static async getOrCreateInitialPrivateState(
    counterPrivateStateId: typeof CounterPrivateStateId,
    privateStateProvider: PrivateStateProvider<typeof CounterPrivateStateId, CounterPrivateState>,
  ): Promise<CounterPrivateState> {
    let state = await privateStateProvider.get(counterPrivateStateId);
    
    if (state === null) {
      state = this.createPrivateState(0);
      await privateStateProvider.set(counterPrivateStateId, state);
    }
    return state;
  }

  private static createPrivateState(value: number): CounterPrivateState {    
    return createPrivateState(value);
  }
}

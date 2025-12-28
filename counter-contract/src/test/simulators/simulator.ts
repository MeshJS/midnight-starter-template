import { createLogger } from "../../logger.js";
import { LogicTestingConfig } from "../../config.js";
import { player1 } from "../counter.test.js";

import {
  Contract,
  type Ledger,
  ledger
} from "../../managed/counter/contract/index.js";
import {
  type CounterPrivateState,
  createPrivateState,
  witnesses
} from "../../witnesses.js";

import {
  type CircuitContext,
  QueryContext,
  sampleContractAddress,
  createConstructorContext,
  CostModel,
  CircuitResults,
  CoinPublicKey,
  emptyZswapLocalState,
  ContractAddress
} from "@midnight-ntwrk/compact-runtime";

const config = new LogicTestingConfig();
export const logger = await createLogger(config.logDir);

export class CounterSimulator {
  readonly contract: Contract<CounterPrivateState>;
  circuitContext: CircuitContext<CounterPrivateState>;
  userPrivateStates: Record<string, CounterPrivateState>;
  updateUserPrivateState: (newPrivateState: CounterPrivateState) => void;
  contractAddress: ContractAddress;

  constructor(privateState: CounterPrivateState) {
    this.contract = new Contract<CounterPrivateState>(witnesses);
    this.contractAddress = sampleContractAddress();
    const {
      currentPrivateState,
      currentContractState,
      currentZswapLocalState
    } = this.contract.initialState(
      createConstructorContext(
        { privateCounter: privateState.privateCounter },
        player1
      )
    );
    this.circuitContext = {
      currentPrivateState,
      currentZswapLocalState,
      currentQueryContext: new QueryContext(
        currentContractState.data,
        this.contractAddress
      ),
      costModel: CostModel.initialCostModel()
    };
    this.userPrivateStates = { ["p1"]: currentPrivateState };
    this.updateUserPrivateState = (newPrivateState: CounterPrivateState) => {};
  }

  static deployContract(secretKey: number): CounterSimulator {
    return new CounterSimulator(createPrivateState(secretKey));
  }

  createPrivateState(pName: string, secretKey: number): void {
    this.userPrivateStates[pName] = createPrivateState(secretKey);
  }

  private buildTurnContext(
    currentPrivateState: CounterPrivateState
  ): CircuitContext<CounterPrivateState> {
    return {
      ...this.circuitContext,
      currentPrivateState,
    };
  }

  private updateUserPrivateStateByName =
    (name: string) =>
    (newPrivateState: CounterPrivateState): void => {
      this.userPrivateStates[name] = newPrivateState;
    };

  as(name: string): CounterSimulator {
    const ps = this.userPrivateStates[name];
    if (!ps) {
      throw new Error(
        `No private state found for user '${name}'. Did you register it?`
      );
    }
    this.circuitContext = this.buildTurnContext(ps);
    this.updateUserPrivateState = this.updateUserPrivateStateByName(name);
    return this;
  }

  public getLedger(): Ledger {
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  public getPrivateState(): CounterPrivateState {
    return this.circuitContext.currentPrivateState;
  }

  public getCircuitContext(): CircuitContext<CounterPrivateState> {
    return this.circuitContext;
  }

  updateStateAndGetLedger<T>(
    circuitResults: CircuitResults<CounterPrivateState, T>
  ): Ledger {
    this.circuitContext = circuitResults.context;
    this.updateUserPrivateState(circuitResults.context.currentPrivateState);
    return this.getLedger();
  }

  public increment(sender?: CoinPublicKey): Ledger {
    // Update the current context to be the result of executing the circuit.
    const circuitResults = this.contract.impureCircuits.increment({
      ...this.circuitContext,
      currentZswapLocalState: sender
        ? emptyZswapLocalState(sender)
        : this.circuitContext.currentZswapLocalState
    }); 

    logger.info("INCREMET CIRCUIT");
    logger.info({
      section: "Circuit Results",
      gasCost: circuitResults.gasCost,
      proofData: circuitResults.proofData,
      result: circuitResults.result
    });

    return this.updateStateAndGetLedger(circuitResults);
  }
}

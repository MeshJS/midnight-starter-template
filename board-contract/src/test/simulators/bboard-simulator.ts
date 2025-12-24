import {
  type CircuitContext,
  type CoinPublicKey,
  CircuitResults,
  QueryContext,
  emptyZswapLocalState,
  sampleContractAddress,
  constructorContext,
  convert_bigint_to_Uint8Array
} from "@midnight-ntwrk/compact-runtime";
import {
  Contract,
  type Ledger,
  ledger
} from "../../managed/board/contract/index.cjs";
import { type BBoardPrivateState, createBBoardPrivateState, witnesses } from "../../witnesses.js";
import { createLogger } from "../../logger-utils.js";
import { LogicTestingConfig } from "../../config.js";
import { ContractAddress, encodeTokenType } from '@midnight-ntwrk/onchain-runtime';
import { p1 } from "../bboard.test.js";

const config = new LogicTestingConfig();
export const logger = await createLogger(config.logDir);

export class BBoardSimulator {
  readonly contract: Contract<BBoardPrivateState>;  
  circuitContext: CircuitContext<BBoardPrivateState>;
  userPrivateStates: Record<string, BBoardPrivateState>;
  updateUserPrivateState: (newPrivateState: BBoardPrivateState) => void;
  contractAddress: ContractAddress;

  constructor(privateState: BBoardPrivateState) {
    this.contract = new Contract<BBoardPrivateState>(witnesses);
    this.contractAddress = sampleContractAddress();
    const {
      currentPrivateState,
      currentContractState,
      currentZswapLocalState
    } = this.contract.initialState(
      constructorContext({ secretKey: privateState.secretKey }, p1)
    );
    this.circuitContext = {
      currentPrivateState,
      currentZswapLocalState,
      originalState: currentContractState,
      transactionContext: new QueryContext(
        currentContractState.data,
        this.contractAddress
      )
    };
    this.userPrivateStates = { ['p1']: currentPrivateState };
    this.updateUserPrivateState = (newPrivateState: BBoardPrivateState) => {};
  }

  static deployContract(secretKey: Uint8Array): BBoardSimulator {
    return new BBoardSimulator(createBBoardPrivateState(secretKey));
  }

  createPrivateState(pName: string, secretKey: Uint8Array): void {
    this.userPrivateStates[pName] = createBBoardPrivateState(secretKey);
  }

  private buildTurnContext(currentPrivateState: BBoardPrivateState): CircuitContext<BBoardPrivateState> {
    return {
      ...this.circuitContext,
      currentPrivateState,
    };
  }

  private updateUserPrivateStateByName =
    (name: string) =>
    (newPrivateState: BBoardPrivateState): void => {
      this.userPrivateStates[name] = newPrivateState;
    };

  as(name: string): BBoardSimulator {
    const ps = this.userPrivateStates[name];
    if (!ps) {
      throw new Error(`No private state found for user '${name}'. Did you register it?`);
    }
    this.circuitContext = this.buildTurnContext(ps);
    this.updateUserPrivateState = this.updateUserPrivateStateByName(name);
    return this;
  }

  public getLedger(): Ledger {
    return ledger(this.circuitContext.transactionContext.state);
  }

  public getPrivateState(): BBoardPrivateState {
    return this.circuitContext.currentPrivateState;
  }

  updateStateAndGetLedger<T>(circuitResults: CircuitResults<BBoardPrivateState, T>): Ledger {
    this.circuitContext = circuitResults.context;     
    this.updateUserPrivateState(circuitResults.context.currentPrivateState);
    return this.getLedger();
  }   

  public post(message: string, sender?: CoinPublicKey): Ledger {
    // Update the current context to be the result of executing the circuit.
    const circuitResults = this.contract.impureCircuits.post(
      {
        ...this.circuitContext,
        currentZswapLocalState: sender
          ? emptyZswapLocalState(sender)
          : this.circuitContext.currentZswapLocalState,
      },
      message
    );
    return this.updateStateAndGetLedger(circuitResults);
  }

  public takeDown(sender?: CoinPublicKey): Ledger {
    const circuitResults = this.contract.impureCircuits.takeDown(
      {
        ...this.circuitContext,
        currentZswapLocalState: sender
          ? emptyZswapLocalState(sender)
          : this.circuitContext.currentZswapLocalState,
      },
    );
    return this.updateStateAndGetLedger(circuitResults);
  }

  public publicKey(sender?: CoinPublicKey): Uint8Array {
    const instance = convert_bigint_to_Uint8Array(
      32,
      this.getLedger().instance
    );
    return this.contract.circuits.publicKey(
      {
        ...this.circuitContext,
        currentZswapLocalState: sender
          ? emptyZswapLocalState(sender)
          : this.circuitContext.currentZswapLocalState,
      },
      this.getPrivateState().secretKey,
      instance
    ).result;
  }
}

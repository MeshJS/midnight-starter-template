import {
  type CircuitContext,
  QueryContext,
  sampleContractAddress,
  createConstructorContext,
  CostModel
} from "@midnight-ntwrk/compact-runtime";
import {
  Contract,
  type Ledger,
  ledger
} from "../../managed/counter/contract/index.js";
import { type CounterPrivateState, witnesses } from "../../witnesses.js";
import { createLogger } from "../../logger.js";
import { LogicTestingConfig } from "../../config.js";

// This is over-kill for such a simple contract, but the same pattern can be used to test more
// complex contracts.

const config = new LogicTestingConfig();
export const logger = await createLogger(config.logDir);

export class CounterSimulator {
  readonly contract: Contract<CounterPrivateState>;
  circuitContext: CircuitContext<CounterPrivateState>;

  constructor() {
    this.contract = new Contract<CounterPrivateState>(witnesses);
    const {
      currentPrivateState,
      currentContractState,
      currentZswapLocalState,
    } = this.contract.initialState(
      createConstructorContext({ privateCounter: 0 }, "0".repeat(64))
    );
    this.circuitContext = {
      currentPrivateState,
      currentZswapLocalState,  
      currentQueryContext: new QueryContext(
        currentContractState.data,
        sampleContractAddress()
      ),   
      costModel: CostModel.initialCostModel(),
    };
  }

  public getLedger(): Ledger {
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  public getPrivateState(): CounterPrivateState {
    return this.circuitContext.currentPrivateState;
  }

  public increment(): Ledger {
    // Update the current context to be the result of executing the circuit.
    const circuitResults = this.contract.impureCircuits.increment(
      this.circuitContext
    );
    logger.info({
      section: "Circuit Context",
      currentPrivateState: circuitResults.context.currentPrivateState,
      currentZswapLocalState: circuitResults.context.currentZswapLocalState,   
    });
    logger.info({
      section: "Circuit Proof Data",
      input: circuitResults.proofData.input,
      output: circuitResults.proofData.output,
      privateTranscriptOutputs:
        circuitResults.proofData.privateTranscriptOutputs,
      publicTranscript: circuitResults.proofData.publicTranscript
    });
    logger.info({
      section: "Circuit result",
      result: circuitResults.result
    });
    this.circuitContext = circuitResults.context;
    return ledger(this.circuitContext.currentQueryContext.state);
  }
}

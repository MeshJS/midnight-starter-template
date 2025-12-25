import { CounterSimulator, logger } from "./simulators/simulator.js";
import { describe, it, expect } from "vitest";
import * as utils from "./utils/utils";
import { CoinPublicKey } from "@midnight-ntwrk/compact-runtime";

// Users private information
const key1 = 0;
const key2 = 1;

// Callers
export const player1 = utils.toHexPadded("player1");
export const player2 = utils.toHexPadded("player2");

function createSimulator() {
  const simulator = CounterSimulator.deployContract(key1);
  simulator.createPrivateState("p2", key2);
  return simulator;
}

let caller: CoinPublicKey;

describe("Counter smart contract", () => {
  it("Display intial values", () => {
    const simulator = createSimulator();
    const initialLedgerState = simulator.as("p1").getLedger();
    const initialPrivateState = simulator.as("p1").getPrivateState();
    const circuitContext = simulator.as("p1").getCircuitContext();
    expect(initialLedgerState.round).toEqual(0n);
    expect(initialPrivateState).toEqual({ privateCounter: 0 });

    logger.info({
      section: "Values",
      initialLedgerState,
      initialPrivateState,
      initialLocalZswap: circuitContext.currentZswapLocalState
    });
    logger.info({
      section: "parameters",
      costModel: circuitContext.costModel,
      gasLimit: circuitContext.gasLimit
    });
    logger.info({
      section: "Query context",
      address: circuitContext.currentQueryContext.address,
      block: circuitContext.currentQueryContext.block,
      comIndices: circuitContext.currentQueryContext.comIndices,
      effects: circuitContext.currentQueryContext.effects
    });      
  }); 

  it("increments the counter correctly", () => {
    const simulator = createSimulator();
    const nextLedgerState = simulator.as("p1").increment();
    expect(nextLedgerState.round).toEqual(1n);
    const nextPrivateState = simulator.as("p1").getPrivateState();
    expect(nextPrivateState).toEqual({ privateCounter: 0 });
    const circuitContext = simulator.as("p1").getCircuitContext();

    logger.info({
      section: "Values",
      ledgerState: nextLedgerState,
      privateState: nextPrivateState,
      localZswap: circuitContext.currentZswapLocalState
    });
    logger.info({
      section: "parameters",
      costModel: circuitContext.costModel,
      gasLimit: circuitContext.gasLimit
    });
    logger.info({
      section: "Query context",
      address: circuitContext.currentQueryContext.address,
      block: circuitContext.currentQueryContext.block,
      comIndices: circuitContext.currentQueryContext.comIndices,
      effects: circuitContext.currentQueryContext.effects
    });     
  });
});

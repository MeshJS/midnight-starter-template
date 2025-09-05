import { BBoardSimulator } from "./simulators/bboard-simulator";
import { describe, it, expect } from "vitest";
import { randomBytes } from "./utils/utils";
import { STATE } from "../managed/board/contract/index.cjs";
import * as utils from "./utils/utils";
import { CoinPublicKey } from "@midnight-ntwrk/compact-runtime";

// Users private information
const key1 = randomBytes(32);
const key2 = randomBytes(32);

// Callers
export const p1 = utils.toHexPadded("player1");
export const p2 = utils.toHexPadded("player2");

function createSimulator() {
  const simulator = BBoardSimulator.deployContract(key1);
  simulator.createPrivateState("p2", key2);
  return simulator;
}

let caller: CoinPublicKey;

describe("BBoard smart contract", () => {
  it("properly initializes ledger state and private state", () => {
    const simulator = createSimulator();
    const initialLedgerState = simulator.as("p1").getLedger();
    expect(initialLedgerState.instance).toEqual(1n);
    expect(initialLedgerState.message.is_some).toEqual(false);
    expect(initialLedgerState.message.value).toEqual("");
    expect(initialLedgerState.poster).toEqual(new Uint8Array(32));
    expect(initialLedgerState.state).toEqual(STATE.vacant);
    const initialPrivateState = simulator.as("p1").getPrivateState();
    expect(initialPrivateState).toEqual({ secretKey: key1 });
  });

  it("lets you set a message", () => {
    const simulator = createSimulator();
    const initialPrivateState = simulator.as("p1").getPrivateState();
    const message =
      "Szeth-son-son-Vallano, Truthless of Shinovar, wore white on the day he was to kill a king";
    simulator.as("p1").post(message);
    // the private ledger state shouldn't change
    expect(initialPrivateState).toEqual(simulator.as("p1").getPrivateState());
    // And all the correct things should have been updated in the public ledger state
    const ledgerState = simulator.as("p1").getLedger();
    expect(ledgerState.instance).toEqual(1n);
    expect(ledgerState.message.is_some).toEqual(true);
    expect(ledgerState.message.value).toEqual(message);
    expect(ledgerState.poster).toEqual(simulator.as("p1").publicKey());
    expect(ledgerState.state).toEqual(STATE.occupied);
  });

  it("lets you take down a message", () => {
    const simulator = createSimulator();
    const initialPrivateState = simulator.as("p1").getPrivateState();
    const initialPublicKey = simulator.as("p1").publicKey();
    const message =
      "Prince Raoden of Arelon awoke early that morning, completely unaware that he had been damned for all eternity.";
    simulator.as("p1").post(message);
    simulator.as("p1").takeDown();
    // the private ledger state shouldn't change
    expect(initialPrivateState).toEqual(simulator.as("p1").getPrivateState());
    // And all the correct things should have been updated in the public ledger state
    const ledgerState = simulator.as("p1").getLedger();
    expect(ledgerState.instance).toEqual(2n);
    expect(ledgerState.message.is_some).toEqual(false);
    expect(ledgerState.message.value).toEqual("");
    // Technically the circuit doesn't clear the previous poster
    expect(ledgerState.poster).toEqual(initialPublicKey);
    expect(ledgerState.state).toEqual(STATE.vacant);
  });

  it("lets you post another message after taking down the first", () => {
    const simulator = createSimulator();
    const initialPrivateState = simulator.as("p1").getPrivateState();
    simulator.as("p1").post("Life before Death.");
    simulator.as("p1").takeDown();
    const message = "Strength before Weakness.";
    simulator.as("p1").post(message);
    // the private ledger state shouldn't change
    expect(initialPrivateState).toEqual(simulator.as("p1").getPrivateState());
    // And all the correct things should have been updated in the public ledger state
    const ledgerState = simulator.as("p1").getLedger();
    expect(ledgerState.instance).toEqual(2n);
    expect(ledgerState.message.is_some).toEqual(true);
    expect(ledgerState.message.value).toEqual(message);
    expect(ledgerState.poster).toEqual(simulator.as("p1").publicKey());
    expect(ledgerState.state).toEqual(STATE.occupied);
  });

  it("lets a different user post a message after taking down the first", () => {
    const simulator = createSimulator();
    const caller = p2;
    simulator
      .as("p1")
      .post("Remember, the past need not become our future as well.");
    expect(() => simulator.as("p1").takeDown(caller)).toThrow(
      "failed assert: Attempted to take down post, but not the current poster"
    );
    simulator.as("p1").takeDown();
    const message = "Joy was more than just an absence of discomfort.";
    simulator.as("p2").post(message);
    const ledgerState = simulator.as("p2").getLedger();
    expect(ledgerState.instance).toEqual(2n);
    expect(ledgerState.message.is_some).toEqual(true);
    expect(ledgerState.message.value).toEqual(message);
    expect(ledgerState.poster).toEqual(simulator.as("p2").publicKey());
    expect(ledgerState.state).toEqual(STATE.occupied);
  });

  it("doesn't let the same user post twice", () => {
    const simulator = createSimulator();
    simulator
      .as("p1")
      .post(
        "My name is Stephen Leeds, and I am perfectly sane. My hallucinations, however, are all quite mad."
      );
    expect(() =>
      simulator
        .as("p1")
        .post(
          "You should know by now that I've already had greatness. I traded it for mediocrity and some measure of sanity."
        )
    ).toThrow("failed assert: Attempted to post to an occupied board");
  });

  it("doesn't let different users post twice", () => {
    const simulator = createSimulator();
    simulator.as("p1").post("Ash fell from the sky");
    expect(() =>
      simulator.as("p2").post("I am, unfortunately, the hero of ages.")
    ).toThrow("failed assert: Attempted to post to an occupied board");
  });

  it("doesn't let users take down someone elses posts", () => {
    const simulator = createSimulator();
    simulator
      .as("p1")
      .post(
        "Sometimes a hypocrite is nothing more than a man in the process of changing."
      );
    expect(() => simulator.as("p2").takeDown()).toThrow(
      "failed assert: Attempted to take down post, but not the current poster"
    );
  });
});

// This file is part of Eclipse Proof Contract
// Copyright (C) 2025 Eclipse Proof Team
// SPDX-License-Identifier: Apache-2.0

import { EclipseProofSimulator } from "./eclipseproof-simulator.js";
import {
  NetworkId,
  setNetworkId,
} from "@midnight-ntwrk/midnight-js-network-id";
import { describe, it, expect } from "vitest";
import { randomBytes } from "./utils.js";
import { createUserHashFromStrings, validateEarningsData } from "../witnesses.js";

setNetworkId(NetworkId.Undeployed);

describe("Eclipse Proof Earnings Verification Contract", () => {
  const defaultUserData = {
    name: "Alice Johnson",
    dob: "1985-03-15",
    netPay: 6000,
    claimedEarnings: 5500,
  };

  it("generates initial ledger state deterministically", () => {
    const key = randomBytes(32);
    const simulator0 = new EclipseProofSimulator(key);
    const simulator1 = new EclipseProofSimulator(key);
    expect(simulator0.getLedger()).toEqual(simulator1.getLedger());
  });

  it("properly initializes ledger state and private state", () => {
    const key = randomBytes(32);
    const simulator = new EclipseProofSimulator(
      key,
      defaultUserData.name,
      defaultUserData.dob,
      defaultUserData.netPay,
      defaultUserData.claimedEarnings
    );

    const initialLedgerState = simulator.getLedger();
    expect(initialLedgerState.epoch).toEqual(1n);
    expect(initialLedgerState.instance).toEqual(1n);
    expect(initialLedgerState.minNetPayThreshold).toEqual(1000n);

    const initialPrivateState = simulator.getPrivateState();
    expect(initialPrivateState.secretKey).toEqual(key);
    expect(initialPrivateState.name).toEqual(defaultUserData.name);
    expect(initialPrivateState.dateOfBirth).toEqual(defaultUserData.dob);
    expect(initialPrivateState.netPay).toEqual(defaultUserData.netPay);
    expect(initialPrivateState.claimedEarnings).toEqual(defaultUserData.claimedEarnings);
  });

  it("allows user to enroll and create earnings proof", () => {
    const simulator = new EclipseProofSimulator(
      randomBytes(32),
      defaultUserData.name,
      defaultUserData.dob,
      defaultUserData.netPay,
      defaultUserData.claimedEarnings
    );

    simulator.enrollAndProveEarnings();

    const proof = simulator.getMyEarningsProof();
    expect(proof.claimedAmount).toEqual(BigInt(defaultUserData.claimedEarnings));
    expect(proof.verified).toEqual(1n);
  });

  it("prevents enrollment when claimed earnings exceed net pay", () => {
    const simulator = new EclipseProofSimulator(
      randomBytes(32),
      defaultUserData.name,
      defaultUserData.dob,
      3000, // net pay
      5000  // claimed earnings (exceeds net pay)
    );

    expect(() => simulator.enrollAndProveEarnings())
      .toThrow("claimed earnings exceed net pay");
  });

  it("prevents enrollment when net pay is below threshold", () => {
    const simulator = new EclipseProofSimulator(
      randomBytes(32),
      defaultUserData.name,
      defaultUserData.dob,
      500,  // net pay below default threshold of 1000
      400   // claimed earnings
    );

    expect(() => simulator.enrollAndProveEarnings())
      .toThrow("net pay below threshold");
  });

  it("prevents double enrollment", () => {
    const simulator = new EclipseProofSimulator(
      randomBytes(32),
      defaultUserData.name,
      defaultUserData.dob,
      defaultUserData.netPay,
      defaultUserData.claimedEarnings
    );

    simulator.enrollAndProveEarnings();
    
    expect(() => simulator.enrollAndProveEarnings())
      .toThrow("already enrolled");
  });

  it("allows updating earnings proof for enrolled user", () => {
    const simulator = new EclipseProofSimulator(
      randomBytes(32),
      defaultUserData.name,
      defaultUserData.dob,
      defaultUserData.netPay,
      defaultUserData.claimedEarnings
    );

    simulator.enrollAndProveEarnings();

    // Update with new earnings data
    simulator.switchUser(
      simulator.getPrivateState().secretKey,
      defaultUserData.name,
      defaultUserData.dob,
      7000, // higher net pay
      6500  // higher claimed earnings
    );

    simulator.updateEarningsProof();

    const updatedProof = simulator.getMyEarningsProof();
    expect(updatedProof.claimedAmount).toEqual(6500n);
  });

  it("allows verification of earnings by user public key", () => {
    const simulator = new EclipseProofSimulator(
      randomBytes(32),
      defaultUserData.name,
      defaultUserData.dob,
      defaultUserData.netPay,
      defaultUserData.claimedEarnings
    );

    simulator.enrollAndProveEarnings();

    const userPk = simulator.publicKey();
    const userHash = simulator.getUserHash();
    const requiredAmount = 5000n;

    const verificationResult = simulator.verifyEarningsByUserPk(
      userPk,
      userHash,
      requiredAmount
    );

    expect(verificationResult).toEqual(1n); // Should pass verification
  });

  it("fails verification when required amount exceeds claimed earnings", () => {
    const simulator = new EclipseProofSimulator(
      randomBytes(32),
      defaultUserData.name,
      defaultUserData.dob,
      defaultUserData.netPay,
      defaultUserData.claimedEarnings
    );

    simulator.enrollAndProveEarnings();

    const userPk = simulator.publicKey();
    const userHash = simulator.getUserHash();
    const requiredAmount = 7000n; // Exceeds claimed earnings of 5500

    const verificationResult = simulator.verifyEarningsByUserPk(
      userPk,
      userHash,
      requiredAmount
    );

    expect(verificationResult).toEqual(0n); // Should fail verification
  });

  it("allows admin to update minimum net pay threshold", () => {
    const simulator = new EclipseProofSimulator(randomBytes(32));

    expect(simulator.getMinNetPayThreshold()).toEqual(1000n);

    simulator.setMinNetPayThreshold(2000n);

    expect(simulator.getMinNetPayThreshold()).toEqual(2000n);
  });

  it("allows admin to revoke earnings proof", () => {
    const simulator = new EclipseProofSimulator(
      randomBytes(32),
      defaultUserData.name,
      defaultUserData.dob,
      defaultUserData.netPay,
      defaultUserData.claimedEarnings
    );

    simulator.enrollAndProveEarnings();
    const userPk = simulator.publicKey();

    // Verify proof exists
    const proof = simulator.getEarningsProofByPk(userPk);
    expect(proof.verified).toEqual(1n);

    // Admin revokes the proof
    simulator.revokeEarningsProof(userPk);

    // Proof should no longer exist
    expect(() => simulator.getEarningsProofByPk(userPk))
      .toThrow("no proof found");
  });

  it("creates verification requests correctly", () => {
    const simulator = new EclipseProofSimulator(randomBytes(32));
    const targetUserHash = createUserHashFromStrings("Bob Smith", "1990-05-20");
    const requiredAmount = 4000n;

    const requestId = simulator.createVerificationRequest(targetUserHash, requiredAmount);

    expect(requestId).toBeInstanceOf(Uint8Array);
    expect(requestId.length).toEqual(32);
  });

  it("validates earnings data correctly", () => {
    expect(validateEarningsData(5000, 4500)).toBe(true);
    expect(validateEarningsData(3000, 3500)).toBe(false); // claimed > net
    expect(validateEarningsData(0, 1000)).toBe(false);    // net pay is 0
    expect(validateEarningsData(5000, 0)).toBe(false);    // claimed is 0
    expect(validateEarningsData(-1000, 500)).toBe(false); // negative net pay
  });

  it("creates consistent user hashes from same name and DOB", () => {
    const hash1 = createUserHashFromStrings("John Doe", "1985-01-01");
    const hash2 = createUserHashFromStrings("John Doe", "1985-01-01");
    const hash3 = createUserHashFromStrings("Jane Doe", "1985-01-01");

    expect(hash1).toEqual(hash2);
    expect(hash1).not.toEqual(hash3);
  });
});

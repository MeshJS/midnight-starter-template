// This file is part of Eclipse Proof Contract
// Copyright (C) 2025 Eclipse Proof Team
// SPDX-License-Identifier: Apache-2.0

import {
  type CircuitContext,
  QueryContext,
  sampleContractAddress,
  constructorContext,
  convert_bigint_to_Uint8Array,
} from "@midnight-ntwrk/compact-runtime";
import {
  Contract,
  type Ledger,
  ledger,
} from "../managed/eclipseproof/contract/index.cjs";
import { type EclipseProofPrivateState, witnesses, createUserHashFromStrings } from "../witnesses.js";

/**
 * Simulator for testing the Eclipse Proof earnings verification contract
 */
export class EclipseProofSimulator {
  readonly contract: Contract<EclipseProofPrivateState>;
  circuitContext: CircuitContext<EclipseProofPrivateState>;

  constructor(
    secretKey: Uint8Array,
    name?: string,
    dateOfBirth?: string,
    netPay?: number,
    claimedEarnings?: number
  ) {
    this.contract = new Contract<EclipseProofPrivateState>(witnesses);
    const privateState = {
      secretKey,
      name,
      dateOfBirth,
      netPay,
      claimedEarnings,
    };

    const {
      currentPrivateState,
      currentContractState,
      currentZswapLocalState,
    } = this.contract.initialState(
      constructorContext(privateState, "0".repeat(64)),
    );

    this.circuitContext = {
      currentPrivateState,
      currentZswapLocalState,
      originalState: currentContractState,
      transactionContext: new QueryContext(
        currentContractState.data,
        sampleContractAddress(),
      ),
    };
  }

  /**
   * Switch to a different user with new private data
   */
  public switchUser(
    secretKey: Uint8Array,
    name?: string,
    dateOfBirth?: string,
    netPay?: number,
    claimedEarnings?: number
  ): void {
    this.circuitContext.currentPrivateState = {
      secretKey,
      name,
      dateOfBirth,
      netPay,
      claimedEarnings,
    };
  }

  public getLedger(): Ledger {
    return ledger(this.circuitContext.transactionContext.state);
  }

  public getPrivateState(): EclipseProofPrivateState {
    return this.circuitContext.currentPrivateState;
  }

  /**
   * Enroll user and create earnings proof
   */
  public enrollAndProveEarnings(): Ledger {
    this.circuitContext = this.contract.impureCircuits.enrollAndProveEarnings(
      this.circuitContext,
    ).context;
    return ledger(this.circuitContext.transactionContext.state);
  }

  /**
   * Update existing earnings proof
   */
  public updateEarningsProof(): Ledger {
    this.circuitContext = this.contract.impureCircuits.updateEarningsProof(
      this.circuitContext,
    ).context;
    return ledger(this.circuitContext.transactionContext.state);
  }

  /**
   * Create a verification request
   */
  public createVerificationRequest(
    targetUserHash: Uint8Array,
    requiredAmount: bigint
  ): Uint8Array {
    const result = this.contract.impureCircuits.createVerificationRequest(
      this.circuitContext,
      targetUserHash,
      requiredAmount,
    );
    this.circuitContext = result.context;
    return result.result;
  }

  /**
   * Verify earnings by user public key
   */
  public verifyEarningsByUserPk(
    userPk: Uint8Array,
    expectedUserHash: Uint8Array,
    requiredAmount: bigint
  ): bigint {
    return this.contract.circuits.verifyEarningsByUserPk(
      this.circuitContext,
      userPk,
      expectedUserHash,
      requiredAmount,
    ).result;
  }

  /**
   * Get the user's public key
   */
  public publicKey(): Uint8Array {
    const instanceBytes = convert_bigint_to_Uint8Array(
      32,
      this.getLedger().instance,
    );
    return this.contract.circuits.publicKey(
      this.circuitContext,
      instanceBytes,
      this.getPrivateState().secretKey,
    ).result;
  }

  /**
   * Get user hash from current private state
   */
  public getUserHash(): Uint8Array {
    const name = this.getPrivateState().name || "John Doe";
    const dob = this.getPrivateState().dateOfBirth || "1990-01-15";
    return createUserHashFromStrings(name, dob);
  }

  /**
   * Get earnings proof for current user
   */
  public getMyEarningsProof(): any {
    return this.contract.circuits.getMyEarningsProof(this.circuitContext).result;
  }

  /**
   * Get earnings proof by public key
   */
  public getEarningsProofByPk(userPk: Uint8Array): any {
    return this.contract.circuits.getEarningsProofByPk(
      this.circuitContext,
      userPk,
    ).result;
  }

  /**
   * Check if user meets earnings threshold
   */
  public checkEarningsThreshold(userPk: Uint8Array, threshold: bigint): bigint {
    return this.contract.circuits.checkEarningsThreshold(
      this.circuitContext,
      userPk,
      threshold,
    ).result;
  }

  /**
   * Admin function: set minimum net pay threshold
   */
  public setMinNetPayThreshold(threshold: bigint): Ledger {
    this.circuitContext = this.contract.impureCircuits.setMinNetPayThreshold(
      this.circuitContext,
      threshold,
    ).context;
    return ledger(this.circuitContext.transactionContext.state);
  }

  /**
   * Admin function: revoke earnings proof
   */
  public revokeEarningsProof(userPk: Uint8Array): Ledger {
    this.circuitContext = this.contract.impureCircuits.revokeEarningsProof(
      this.circuitContext,
      userPk,
    ).context;
    return ledger(this.circuitContext.transactionContext.state);
  }

  /**
   * Get current epoch
   */
  public getEpoch(): bigint {
    return this.contract.circuits.getEpoch(this.circuitContext).result;
  }

  /**
   * Get minimum net pay threshold
   */
  public getMinNetPayThreshold(): bigint {
    return this.contract.circuits.getMinNetPayThreshold(this.circuitContext).result;
  }
}

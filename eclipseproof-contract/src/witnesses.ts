// This file is part of Eclipse Proof Contract
// Copyright (C) 2025 Eclipse Proof Team
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0

/*
 * This file defines the witness functions for the Eclipse Proof contract.
 * Witnesses provide private inputs that are verified through zero-knowledge proofs
 * without revealing the actual values.
 */

import { Ledger, Witnesses } from "./managed/eclipseproof/contract/index.cjs";
import { WitnessContext } from "@midnight-ntwrk/compact-runtime";

/* **********************************************************************
 * Private state for the Eclipse Proof contract contains the user's
 * secret key and private information needed for earnings verification.
 */

export type EclipseProofPrivateState = {
  readonly secretKey: Uint8Array;
  readonly name?: string;          // User's full name
  readonly dateOfBirth?: string;   // User's date of birth (YYYY-MM-DD format)
  readonly netPay?: number;        // Net pay from payslip
  readonly claimedEarnings?: number; // Amount user wants to prove
};

export const createEclipseProofPrivateState = (
  secretKey: Uint8Array,
  name?: string,
  dateOfBirth?: string,
  netPay?: number,
  claimedEarnings?: number
): EclipseProofPrivateState => ({
  secretKey,
  name,
  dateOfBirth,
  netPay,
  claimedEarnings,
});

/** ===================== *
 *  Helper Functions      *
 *  ===================== */

function hexToBytes32(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length !== 64) throw new Error("Expected 32 bytes (64 hex chars)");
  const out = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    out[i] = parseInt(clean.slice(2 * i, 2 * i + 2), 16);
  }
  return out;
}

function stringToBytes32(str: string): Uint8Array {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(str);
  const out = new Uint8Array(32);
  
  // Copy the string bytes, truncate if too long, pad with zeros if too short
  const copyLength = Math.min(encoded.length, 32);
  out.set(encoded.slice(0, copyLength));
  
  return out;
}

function uint64ToBytes32(n: number): Uint8Array {
  if (!Number.isInteger(n) || n < 0 || n > Number.MAX_SAFE_INTEGER) {
    throw new Error("Number out of safe uint64 range");
  }
  
  const out = new Uint8Array(32);
  // Store as little-endian in first 8 bytes
  for (let i = 0; i < 8; i++) {
    out[i] = (n >> (i * 8)) & 0xff;
  }
  return out;
}

/** ===================== *
 *  Test/Default Values   *
 *  ===================== */

// Default test values - in production these would come from user input
const DEFAULT_USER_SK_HEX = "7f3a5b2c8d9e1f4a6b7c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b";
const DEFAULT_NAME = "John Doe";
const DEFAULT_DOB = "1990-01-15";
const DEFAULT_NET_PAY = 5000; // $5000 monthly net pay
const DEFAULT_CLAIMED_EARNINGS = 4500; // Claiming $4500

/** ===================== *
 *  Witness Functions     *
 *  ===================== */

export const witnesses: Witnesses<EclipseProofPrivateState> = {
  // User's secret key for generating public key
  userSecretKey: (
    ctx: WitnessContext<Ledger, EclipseProofPrivateState>
  ): [EclipseProofPrivateState, Uint8Array] => [
    ctx.privateState,
    ctx.privateState.secretKey || hexToBytes32(DEFAULT_USER_SK_HEX)
  ],

  // User's name (padded to 32 bytes)
  userName: (
    ctx: WitnessContext<Ledger, EclipseProofPrivateState>
  ): [EclipseProofPrivateState, Uint8Array] => [
    ctx.privateState,
    stringToBytes32(ctx.privateState.name || DEFAULT_NAME)
  ],

  // User's date of birth (padded to 32 bytes)
  userDateOfBirth: (
    ctx: WitnessContext<Ledger, EclipseProofPrivateState>
  ): [EclipseProofPrivateState, Uint8Array] => [
    ctx.privateState,
    stringToBytes32(ctx.privateState.dateOfBirth || DEFAULT_DOB)
  ],

  // Net pay from payslip (as Uint64)
  netPayFromPayslip: (
    ctx: WitnessContext<Ledger, EclipseProofPrivateState>
  ): [EclipseProofPrivateState, bigint] => [
    ctx.privateState,
    BigInt(ctx.privateState.netPay || DEFAULT_NET_PAY)
  ],

  // Amount user claims as earnings (as Uint64)
  claimedEarnings: (
    ctx: WitnessContext<Ledger, EclipseProofPrivateState>
  ): [EclipseProofPrivateState, bigint] => [
    ctx.privateState,
    BigInt(ctx.privateState.claimedEarnings || DEFAULT_CLAIMED_EARNINGS)
  ],
};

/** ===================== *
 *  Utility Functions     *
 *  ===================== */

// Create a user hash from name and DOB (for external use)
export function createUserHashFromStrings(name: string, dob: string): Uint8Array {
  const nameBytes = stringToBytes32(name);
  const dobBytes = stringToBytes32(dob);
  
  // Simple hash - in production you'd use a proper cryptographic hash
  const combined = new Uint8Array(64);
  combined.set(nameBytes, 0);
  combined.set(dobBytes, 32);
  
  // For now, return first 32 bytes - in production use proper hash function
  return combined.slice(0, 32);
}

// Validate earnings data
export function validateEarningsData(netPay: number, claimedEarnings: number): boolean {
  return (
    netPay > 0 &&
    claimedEarnings > 0 &&
    claimedEarnings <= netPay &&
    Number.isInteger(netPay) &&
    Number.isInteger(claimedEarnings)
  );
}

// This file is part of midnightntwrk/example-counter.
// Copyright (C) 2025 Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// This is how we type an empty object.
import { Ledger} from "./managed/eclipseproof/contract/index.cjs";
import { WitnessContext } from "@midnight-ntwrk/compact-runtime";

const enum Sex {
  MALE, // represented as 0 in compact enum types
  FEMALE, // represented as 1 in compact enum types
  UNSET // represented as 2 in compact enum types
}
export type eclipseProofPrivateState = {
  secretKey: Uint8Array;
  age: number;
  net_pay: bigint;
  gender: Sex;
  country: string;
};
export const createeclipseProofPrivateState = (secretKey: Uint8Array, age: number, net_pay: bigint, gender: Sex, country: string) => ({
  secretKey,
  age,
  net_pay,
  gender,
  country
});

function hexToBytes32(hex: string): Uint8Array {
  if (typeof hex !== 'string') {
    throw new TypeError("Input must be a string");
  }
  
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
  
  if (cleanHex.length !== 64) {
    throw new Error(`Expected 64 hex characters, got ${cleanHex.length}`);
  }
  
  if (!/^[0-9a-fA-F]+$/.test(cleanHex)) {
    throw new Error("Input contains invalid hex characters");
  }
  
  const result = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    const byteHex = cleanHex.slice(i * 2, i * 2 + 2);
    result[i] = parseInt(byteHex, 16);
  }
  
  return result;
}

function u16ToBytes32LE(value: number): Uint8Array {
  if (!Number.isInteger(value)) {
    throw new TypeError("Value must be an integer");
  }
  
  const MIN_U16 = 0;
  const MAX_U16 = 65535; // 0xFFFF
  
  if (value < MIN_U16 || value > MAX_U16) {
    throw new Error(`Value must be between ${MIN_U16} and ${MAX_U16}`);
  }
  
  const result = new Uint8Array(32); // All bytes default to 0
  result[0] = value & 0xFF;         // Little-endian: least significant byte first
  result[1] = (value >>> 8) & 0xFF; // Use >>> for unsigned right shift
  
  return result;
}
// Converts a payment amount to a 32-byte little-endian representation.
// Assumes the amount is in the smallest unit (like satoshis for BTC).
// assetDecimals defines how many decimal places the asset uses (e.g., 8 for BTC).
function paymentToBytes32LE(amount: number | bigint, assetDecimals: number = 8): Uint8Array {
  let value: bigint;
  
  if (typeof amount === 'number') {
    const factor = 10 ** assetDecimals;
    value = BigInt(Math.round(amount * factor));
  } else {
    value = amount;
  }
  
  if (value < 0n || value > 0xFFFFFFFFFFFFFFFFn) {
    throw new Error("Payment amount out of range");
  }
  
  const result = new Uint8Array(32);
  for (let i = 0; i < 8; i++) {
    result[i] = Number((value >> BigInt(i * 8)) & 0xFFn);
  }
  return result;
}

// For country names instead of codes
function countryNameToBytes32(country: string): Uint8Array {
  const normalized = country.toLowerCase().trim();
  const encoder = new TextEncoder();
  const encoded = encoder.encode(normalized);
  const result = new Uint8Array(32);
  result.set(encoded);
  return result;
}

function wordToBytesWithLength(word: string, maxLength: number = 30): Uint8Array {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(word);
  
  if (encoded.length > maxLength) {
    throw new Error(`Word too long: ${encoded.length} bytes (max ${maxLength})`);
  }
  
  const result = new Uint8Array(32);
  result[0] = encoded.length; // First byte = length
  result.set(encoded, 1);     // Data starts at byte 1
  return result;
}

export const witnesses = {
  userSecretKey: ({
    privateState,
  }: WitnessContext<Ledger, eclipseProofPrivateState>): [
    eclipseProofPrivateState,
    Uint8Array,
  ] => [privateState, hexToBytes32(Buffer.from(privateState.secretKey).toString('hex'))],
  userAgeBytes: ({
    privateState,
  }: WitnessContext<Ledger, eclipseProofPrivateState>): [
    eclipseProofPrivateState,
    Uint8Array,
  ] => [privateState, u16ToBytes32LE(privateState.age)],
  userCountryAlpha2: ({
    privateState,
  }: WitnessContext<Ledger, eclipseProofPrivateState>): [
    eclipseProofPrivateState,
    Uint8Array,
  ] => [privateState, countryNameToBytes32(privateState.country)],
  userNetPay: ({
    privateState,
  }: WitnessContext<Ledger, eclipseProofPrivateState>): [
    eclipseProofPrivateState,
    Uint8Array,
  ] => [privateState, paymentToBytes32LE(privateState.net_pay, 8)],
  userGender: ({
    privateState,
  }: WitnessContext<Ledger, eclipseProofPrivateState>): [
    eclipseProofPrivateState,
    Sex,
  ] => [privateState, privateState.gender],
};

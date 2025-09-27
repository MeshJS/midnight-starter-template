// This file is part of Eclipse Proof Contract
// Copyright (C) 2025 Eclipse Proof Team
// SPDX-License-Identifier: Apache-2.0

export function randomBytes(length: number): Uint8Array {
  const result = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    result[i] = Math.floor(Math.random() * 256);
  }
  return result;
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/^0x/, '');
  const result = new Uint8Array(clean.length / 2);
  for (let i = 0; i < result.length; i++) {
    result[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return result;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function stringToBytes32(str: string): Uint8Array {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(str);
  const result = new Uint8Array(32);
  const copyLength = Math.min(encoded.length, 32);
  result.set(encoded.slice(0, copyLength));
  return result;
}

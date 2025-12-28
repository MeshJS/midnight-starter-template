import * as bip39 from '@scure/bip39';
import { wordlist as english } from '@scure/bip39/wordlists/english.js';
import { webcrypto } from 'crypto';

/**
 * Convert mnemonic phrase to seed buffer using BIP39 standard
 * This generates a 64-byte seed as expected by Midnight HD wallet
 */
export const mnemonicToSeed = async (mnemonic: string): Promise<Buffer> => {
  const words = mnemonic.trim().split(/\s+/);
  if (!bip39.validateMnemonic(words.join(' '), english)) {
    throw new Error('Invalid mnemonic phrase');
  }
  // Use BIP39 standard seed derivation (PBKDF2) - produces 64 bytes. hashes it (mixes it up) 2048 times using SHA-512
  const seed = await bip39.mnemonicToSeed(words.join(' '));
  return Buffer.from(seed);
};

export const randomBytes = (length: number): Uint8Array => {
  const bytes = new Uint8Array(length);
  webcrypto.getRandomValues(bytes);
  return bytes;
};

export const tokenValue = (value: bigint): bigint => value * 10n ** 6n;

import { TestEnvironment } from '../test/commons';
import path from 'path';
import { createLogger } from '../logger-utils';
import { currentDir } from '../config';
import * as api from '../api';

import { mnemonicToSeedSync } from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs';

import * as bip39 from '@scure/bip39';
import { wordlist as english } from '@scure/bip39/wordlists/english';
import { HDKey } from '@scure/bip32';
import { generateRandomSeed, HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';

export const mnemonicToWords: (mnemonic: string) => string[] = (mnemonic: string) => mnemonic.split(' ');

export const generateMnemonicWords: (strength?: number) => string[] = (strength = 256) =>
  mnemonicToWords(bip39.generateMnemonic(english, strength));

export const validateMnemonic = (mnemonic: string): boolean => bip39.validateMnemonic(mnemonic, english);

const mnemonicWords = generateMnemonicWords().join(' ');
const seedDerived = mnemonicToSeedSync(mnemonicWords); // 64 bytes

const seddDerivedHex = Buffer.from(seedDerived).toString('hex'); // 64 bytes
// This is the seed that will be used to generate the wallet since the wallet implementation expects 32 bytes hex string.
const seedDerivedHex32 = Buffer.from(seedDerived).subarray(0, 32).toString('hex'); // 32 bytes
// Optionally generate a random seed
const seedGenerated = generateRandomSeed(); //32 bytes

// The following code is for reference only, Midnight provides a HDWallet abstraction using the HdKey from scure/bip32 implementation
const rootKey = HDKey.fromMasterSeed(seedDerived);
// How to calculate the path
// const path = `m/${PURPOSE}'/${COIN_TYPE}'/${this.account}'/${this.role}/${index}`;
// const derivedKey = rootKey.derive(path);

// This is for reference only, another way to create a root key using BIP32
const bip32 = BIP32Factory(ecc);
const root = bip32.fromSeed(seedDerived);

console.log({ mnemonicWords: mnemonicWords });
console.log({ seedDerived });
console.log({ seddDerivedHex });
console.log({ seedDerivedHex32 });
console.log({ seedGenerated });
console.log({ rootKey });
console.log({ root });
console.log({ validateMnemonic: validateMnemonic(mnemonicWords) });

const generatedWallet = HDWallet.fromSeed(seedDerived); //seed could be 32 bytes or 64 bytes

if (generatedWallet.type == 'seedOk') {
  const zswapKey = generatedWallet.hdWallet.selectAccount(0).selectRole(Roles.Zswap).deriveKeyAt(0);
  if (zswapKey.type === 'keyDerived') {
    console.log('success', zswapKey.key);
  } else {
    console.error('Error deriving key');
  }
} else {
  console.error('Error generating HDWallet');
}

// SET WALLET & EXECUTE CIRCUIT

const logDir = path.resolve(currentDir, '..', 'logs', 'embedded-wallet', `${new Date().toISOString()}.log`);
const logger = await createLogger(logDir);

api.setLogger(logger);
const testEnvironment = new TestEnvironment(logger);
const testConfiguration = await testEnvironment.start();
const wallet = await testEnvironment.getWallet();
const providers = await api.configureProviders(wallet, testConfiguration.dappConfig);

// const counterContract = await api.deploy(providers, { privateCounter: 0 });
// const response = await api.increment(counterContract);
// const counterAfter = await api.displayCounterValue(providers, counterContract);

// console.log({ counterContract });
// console.log({ response });
// console.log({ counterAfter });

await testEnvironment.saveWalletCache();
await testEnvironment.shutdown();

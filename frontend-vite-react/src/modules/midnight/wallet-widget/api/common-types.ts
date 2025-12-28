export type DustAddress = {
  dustAddress: string;
};

export type DustBalance = {
  cap: bigint;
  balance: bigint;
};

export type ShieldedAddress = {
  shieldedAddress: string;
  shieldedCoinPublicKey: string;
  shieldedEncryptionPublicKey: string;
};

export type ShieldedBalance = Record<string, bigint>;

export type UnshieldedAddress = {
  unshieldedAddress: string;
};

export type UnshieldedBalanceDappConnector = Record<string, bigint>;




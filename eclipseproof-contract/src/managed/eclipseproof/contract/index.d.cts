import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type EarningsProof = { epoch: bigint;
                              userHash: Uint8Array;
                              claimedAmount: bigint;
                              verified: bigint;
                              timestamp: bigint
                            };

export type VerificationRequest = { userHash: Uint8Array;
                                    requiredAmount: bigint;
                                    requesterId: Uint8Array
                                  };

export type Witnesses<T> = {
  userSecretKey(context: __compactRuntime.WitnessContext<Ledger, T>): [T, Uint8Array];
  userName(context: __compactRuntime.WitnessContext<Ledger, T>): [T, Uint8Array];
  userDateOfBirth(context: __compactRuntime.WitnessContext<Ledger, T>): [T, Uint8Array];
  netPayFromPayslip(context: __compactRuntime.WitnessContext<Ledger, T>): [T, bigint];
  claimedEarnings(context: __compactRuntime.WitnessContext<Ledger, T>): [T, bigint];
}

export type ImpureCircuits<T> = {
  bumpEpoch(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, []>;
  setMinNetPayThreshold(context: __compactRuntime.CircuitContext<T>,
                        threshold_0: bigint): __compactRuntime.CircuitResults<T, []>;
  revokeEarningsProof(context: __compactRuntime.CircuitContext<T>,
                      userPk_0: Uint8Array): __compactRuntime.CircuitResults<T, []>;
  enrollAndProveEarnings(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, []>;
  updateEarningsProof(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, []>;
  createVerificationRequest(context: __compactRuntime.CircuitContext<T>,
                            targetUserHash_0: Uint8Array,
                            requiredAmount_0: bigint): __compactRuntime.CircuitResults<T, Uint8Array>;
  verifyEarningsByUserPk(context: __compactRuntime.CircuitContext<T>,
                         userPk_0: Uint8Array,
                         expectedUserHash_0: Uint8Array,
                         requiredAmount_0: bigint): __compactRuntime.CircuitResults<T, bigint>;
  getEpoch(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, bigint>;
  getInstanceBytes(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, Uint8Array>;
  getMinNetPayThreshold(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, bigint>;
  getMyEarningsProof(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, EarningsProof>;
  getEarningsProofByPk(context: __compactRuntime.CircuitContext<T>,
                       userPk_0: Uint8Array): __compactRuntime.CircuitResults<T, EarningsProof>;
  checkEarningsThreshold(context: __compactRuntime.CircuitContext<T>,
                         userPk_0: Uint8Array,
                         threshold_0: bigint): __compactRuntime.CircuitResults<T, bigint>;
  owner(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, { is_left: boolean,
                                                                                           left: { bytes: Uint8Array
                                                                                                 },
                                                                                           right: { bytes: Uint8Array
                                                                                                  }
                                                                                         }>;
  transferOwnership(context: __compactRuntime.CircuitContext<T>,
                    newOwner_0: { is_left: boolean,
                                  left: { bytes: Uint8Array },
                                  right: { bytes: Uint8Array }
                                }): __compactRuntime.CircuitResults<T, []>;
  renounceOwnership(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, []>;
}

export type PureCircuits = {
  publicKey(inst_0: Uint8Array, sk_0: Uint8Array): Uint8Array;
  createUserHash(name_0: Uint8Array, dob_0: Uint8Array): Uint8Array;
  verifyEarningsByHash(targetUserHash_0: Uint8Array, requiredAmount_0: bigint): bigint;
}

export type Circuits<T> = {
  publicKey(context: __compactRuntime.CircuitContext<T>,
            inst_0: Uint8Array,
            sk_0: Uint8Array): __compactRuntime.CircuitResults<T, Uint8Array>;
  createUserHash(context: __compactRuntime.CircuitContext<T>,
                 name_0: Uint8Array,
                 dob_0: Uint8Array): __compactRuntime.CircuitResults<T, Uint8Array>;
  bumpEpoch(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, []>;
  setMinNetPayThreshold(context: __compactRuntime.CircuitContext<T>,
                        threshold_0: bigint): __compactRuntime.CircuitResults<T, []>;
  revokeEarningsProof(context: __compactRuntime.CircuitContext<T>,
                      userPk_0: Uint8Array): __compactRuntime.CircuitResults<T, []>;
  enrollAndProveEarnings(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, []>;
  updateEarningsProof(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, []>;
  createVerificationRequest(context: __compactRuntime.CircuitContext<T>,
                            targetUserHash_0: Uint8Array,
                            requiredAmount_0: bigint): __compactRuntime.CircuitResults<T, Uint8Array>;
  verifyEarningsByHash(context: __compactRuntime.CircuitContext<T>,
                       targetUserHash_0: Uint8Array,
                       requiredAmount_0: bigint): __compactRuntime.CircuitResults<T, bigint>;
  verifyEarningsByUserPk(context: __compactRuntime.CircuitContext<T>,
                         userPk_0: Uint8Array,
                         expectedUserHash_0: Uint8Array,
                         requiredAmount_0: bigint): __compactRuntime.CircuitResults<T, bigint>;
  getEpoch(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, bigint>;
  getInstanceBytes(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, Uint8Array>;
  getMinNetPayThreshold(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, bigint>;
  getMyEarningsProof(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, EarningsProof>;
  getEarningsProofByPk(context: __compactRuntime.CircuitContext<T>,
                       userPk_0: Uint8Array): __compactRuntime.CircuitResults<T, EarningsProof>;
  checkEarningsThreshold(context: __compactRuntime.CircuitContext<T>,
                         userPk_0: Uint8Array,
                         threshold_0: bigint): __compactRuntime.CircuitResults<T, bigint>;
  owner(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, { is_left: boolean,
                                                                                           left: { bytes: Uint8Array
                                                                                                 },
                                                                                           right: { bytes: Uint8Array
                                                                                                  }
                                                                                         }>;
  transferOwnership(context: __compactRuntime.CircuitContext<T>,
                    newOwner_0: { is_left: boolean,
                                  left: { bytes: Uint8Array },
                                  right: { bytes: Uint8Array }
                                }): __compactRuntime.CircuitResults<T, []>;
  renounceOwnership(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, []>;
}

export type Ledger = {
  readonly epoch: bigint;
  readonly instance: bigint;
  earningsProofs: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): EarningsProof;
    [Symbol.iterator](): Iterator<[Uint8Array, EarningsProof]>
  };
  verificationRequests: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): VerificationRequest;
    [Symbol.iterator](): Iterator<[Uint8Array, VerificationRequest]>
  };
  readonly minNetPayThreshold: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<T, W extends Witnesses<T> = Witnesses<T>> {
  witnesses: W;
  circuits: Circuits<T>;
  impureCircuits: ImpureCircuits<T>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<T>,
               initialOwner_0: { is_left: boolean,
                                 left: { bytes: Uint8Array },
                                 right: { bytes: Uint8Array }
                               }): __compactRuntime.ConstructorResult<T>;
}

export declare function ledger(state: __compactRuntime.StateValue): Ledger;
export declare const pureCircuits: PureCircuits;

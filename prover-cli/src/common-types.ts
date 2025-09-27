import { Prover, type ProverPrivateState } from '@meshsdk/prover-contract';
import type { ImpureCircuitId, MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import type { DeployedContract, FoundContract } from '@midnight-ntwrk/midnight-js-contracts';

export type ProverCircuits = ImpureCircuitId<Prover.Contract<ProverPrivateState>>;

export const ProverPrivateStateId = 'proverPrivateState';

export type ProverProviders = MidnightProviders<ProverCircuits, typeof ProverPrivateStateId, ProverPrivateState>;

export type ProverContract = Prover.Contract<ProverPrivateState>;

export type DeployedProverContract = DeployedContract<ProverContract> | FoundContract<ProverContract>;

// Salary document structure
export interface SalaryDocument {
  Name: string;
  Employer: string;
  Address: string;
  Date: string;
  NetPay: number;
}

// Proof request structure
export interface SalaryProofRequest {
  document: SalaryDocument;
  proofAmount: number; // Amount user wants to prove (≤ NetPay)
}

export type UserAction = {
  submitProofRequest: SalaryProofRequest | undefined;
  generateProof: string | undefined;
};

export type ProofStatus = 'idle' | 'pending' | 'generating' | 'completed' | 'failed';

export type DerivedState = {
  readonly proofStatus: ProofStatus;
  readonly proofCount: number;
  readonly lastProofAmount: number | null;
};

export const emptyState: DerivedState = {
  proofStatus: 'idle',
  proofCount: 0,
  lastProofAmount: null,
};

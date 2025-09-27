import { EclipseProof, type EclipseProofPrivateState } from './eclipseproof-contract-compat';
import type { ImpureCircuitId, MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import type { DeployedContract, FoundContract } from '@midnight-ntwrk/midnight-js-contracts';

export type EclipseProofCircuits = ImpureCircuitId<EclipseProof.Contract<EclipseProofPrivateState>>;

export const EclipseProofPrivateStateId = 'eclipseProofPrivateState';

export type EclipseProofProviders = MidnightProviders<EclipseProofCircuits, typeof EclipseProofPrivateStateId, EclipseProofPrivateState>;

export type EclipseProofContract = EclipseProof.Contract<EclipseProofPrivateState>;

export type DeployedEclipseProofContract = DeployedContract<EclipseProofContract> | FoundContract<EclipseProofContract>;

// Legacy types for backward compatibility (will be deprecated)
export type ProverCircuits = EclipseProofCircuits;
export const ProverPrivateStateId = EclipseProofPrivateStateId;
export type ProverProviders = EclipseProofProviders;
export type ProverContract = EclipseProofContract;
export type DeployedProverContract = DeployedEclipseProofContract;

// Payslip document structure (updated to match requirements)
export interface PayslipDocument {
  name: string;
  employer: string;
  address: string;
  date: string;
  netpay: number;
}

// User input for proof generation
export interface ProofGenerationInput {
  name: string;
  payslip: PayslipDocument;
  dateOfBirth: string;
  amountToProve: number; // Amount user wants to prove (≤ netpay)
}

// Proof verification input
export interface ProofVerificationInput {
  proof: string; // The generated proof string
  name: string;
  dateOfBirth: string;
  amountToVerify: number;
}

// Legacy interfaces for backward compatibility
export interface SalaryDocument {
  Name: string;
  Employer: string;
  Address: string;
  Date: string;
  NetPay: number;
}

export interface SalaryProofRequest {
  document: SalaryDocument;
  proofAmount: number;
}

export type UserAction = {
  submitProofRequest: SalaryProofRequest | undefined;
  generateProof: string | undefined;
  submitProofGeneration: ProofGenerationInput | undefined;
  verifyProof: ProofVerificationInput | undefined;
};

export type ProofStatus = 'idle' | 'pending' | 'generating' | 'completed' | 'failed';

export type DerivedState = {
  readonly proofStatus: ProofStatus;
  readonly proofCount: number;
  readonly lastProofAmount: number | null;
  readonly lastGeneratedProof: string | null;
  readonly lastVerificationResult: boolean | null;
};

export const emptyState: DerivedState = {
  proofStatus: 'idle',
  proofCount: 0,
  lastProofAmount: null,
  lastGeneratedProof: null,
  lastVerificationResult: null,
};

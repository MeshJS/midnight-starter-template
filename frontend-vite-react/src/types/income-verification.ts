export interface IncomeData {
  amount: number;
  currency: string;
  timestamp: number;
  employerHash?: string; // Optional hash of employer for extra verification
}

export interface IncomeProof {
  proofKey: string;
  minIncome: number;
  currency: string;
  timestamp: number;
  isValid: boolean;
}

export interface VerificationRequest {
  proofKey: string;
  requiredMinIncome: number;
  currency: string;
}

export interface VerificationResult {
  isValid: boolean;
  timestamp: number;
  meetsRequirement: boolean;
  error?: string;
}

// Contract state interfaces
export interface IncomeVerificationState {
  // This will contain the private state of income proofs
  proofs: Map<string, IncomeProof>;
}

// Public parameters for verification
export interface VerificationParams {
  minIncome: number;
  currency: string;
}

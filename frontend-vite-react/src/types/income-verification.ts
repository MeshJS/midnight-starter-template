export interface IncomeData {
  amount: number;
  currency: string;
  timestamp: number;
  employerHash?: string; // Optional hash of employer for extra verification
  // Personal details for verification matching
  name?: string;
  dateOfBirth?: string;
  personalHash?: string; // Hash of personal details for privacy
}

export interface IncomeProof {
  proofKey: string;
  minIncome: number;
  currency: string;
  timestamp: number;
  isValid: boolean;
  // Identity verification hashes
  nameHash?: string;
  dobHash?: string;
  personalDataHash?: string;
}

export interface VerificationRequest {
  proofKey: string;
  requiredMinIncome: number;
  currency: string;
  // Additional verification fields
  applicantName: string;
  applicantDOB: string;
  expectedHash?: string;
}

export interface VerificationResult {
  isValid: boolean;
  timestamp: number;
  meetsRequirement: boolean;
  identityMatches: boolean;
  error?: string;
} // Contract state interfaces
export interface IncomeVerificationState {
  // This will contain the private state of income proofs
  proofs: Map<string, IncomeProof>;
}

// Public parameters for verification
export interface VerificationParams {
  minIncome: number;
  currency: string;
}

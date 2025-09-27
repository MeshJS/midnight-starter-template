// Temporary compatibility layer for EclipseProof contract
// This file provides type compatibility while transitioning from prover-contract to eclipseproof-contract

// Mock contract types for development
export interface EclipseProofPrivateState {
  proofs: any[];
  status: string;
}

// Mock witnesses structure
export const witnesses = {
  // Mock witnesses for development
  witnessName: () => ({}),
};

export namespace EclipseProof {
  export class Contract<T> {
    witnesses: any;
    impureCircuits: any;
    initialState: any;
    
    constructor(witnesses: any) {
      this.witnesses = witnesses;
      this.impureCircuits = {};
      this.initialState = {};
    }
  }
}

// Additional types specific to EclipseProof functionality
export interface EclipseProofData {
  user: {
    name: string;
    dateOfBirth: string;
  };
  payslip: {
    name: string;
    employer: string;
    address: string;
    date: string;
    netpay: number;
  };
  amountToProve: number;
  timestamp: string;
}

export interface EclipseProofResult {
  isValid: boolean;
  reason?: string;
}

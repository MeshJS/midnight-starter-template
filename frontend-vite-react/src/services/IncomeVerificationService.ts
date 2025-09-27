import {
  IncomeData,
  IncomeProof,
  VerificationRequest,
  VerificationResult,
} from "../types/income-verification";

export class IncomeVerificationService {
  private apiBaseUrl: string;

  constructor(_contractAddress: string) {
    this.apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
  }

  /**
   * Extract income data from uploaded payslip file
   */
  async extractIncomeFromFile(file: File): Promise<IncomeData> {
    console.log("Processing file:", file.name);

    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await fetch(`${this.apiBaseUrl}/api/income/extract`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const incomeData = await response.json();
      
      return {
        amount: incomeData.amount,
        currency: incomeData.currency || "GBP",
        timestamp: incomeData.timestamp || Date.now(),
        employerHash: incomeData.employerHash,
      };
    } catch (error) {
      console.error('Error extracting income from file:', error);
      throw new Error(`Failed to extract income data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate proof from JSON payslip data
   */
  async generateProofFromJson(data: {
    name: string;
    payslipJson: string;
    dateOfBirth: string;
    amountToProve: number;
  }): Promise<string> {
    console.log("Generating proof from JSON data...");
    console.log("Amount to prove:", data.amountToProve);

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/proof/generate-from-json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Proof generated:', result);

      return result.proofHash;
    } catch (error) {
      console.error('Error generating proof from JSON:', error);
      throw new Error(`Failed to generate proof: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a zero-knowledge proof for income verification (legacy)
   */
  async generateIncomeProof(
    incomeData: IncomeData,
    minIncomeToProve: number,
    personalDetails?: { name: string; dob: string }
  ): Promise<string> {
    console.log("Generating proof for income verification...");
    console.log("Actual income:", incomeData.amount);
    console.log("Min income to prove:", minIncomeToProve);

    try {
      // First, submit the proof request to the backend
      const document = {
        Name: personalDetails?.name || 'Anonymous',
        Employer: 'Unknown', // This could be extracted from the income data
        Address: 'Unknown',
        Date: new Date().toISOString().split('T')[0],
        NetPay: incomeData.amount
      };

      const submitResponse = await fetch(`${this.apiBaseUrl}/api/proof/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document,
          proofAmount: minIncomeToProve,
        }),
      });

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${submitResponse.status}`);
      }

      const submitResult = await submitResponse.json();
      console.log('Proof request submitted:', submitResult);

      // Then generate the actual proof
      const generateResponse = await fetch(`${this.apiBaseUrl}/api/proof/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${generateResponse.status}`);
      }

      const generateResult = await generateResponse.json();
      console.log('Proof generated:', generateResult);

      // Store the proof locally for demo purposes
      const proof: IncomeProof = {
        proofKey: generateResult.proofKey,
        minIncome: minIncomeToProve,
        currency: incomeData.currency,
        timestamp: Date.now(),
        isValid: true,
        nameHash: personalDetails?.name ? this.generateHash(personalDetails.name.toLowerCase()) : '',
        dobHash: personalDetails?.dob ? this.generateHash(personalDetails.dob) : '',
        personalDataHash: personalDetails ? this.generateHash(personalDetails.name.toLowerCase() + personalDetails.dob) : '',
      };

      this.storeProof(generateResult.proofKey, proof);

      return generateResult.proofKey;
    } catch (error) {
      console.error('Error generating income proof:', error);
      throw new Error(`Failed to generate proof: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify proof from blockchain
   */
  async verifyProofFromBlockchain(data: {
    proofHash: string;
    name: string;
    dateOfBirth: string;
    requiredAmount: number;
  }): Promise<VerificationResult> {
    console.log("Verifying proof from blockchain:", data.proofHash);

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/proof/verify-from-blockchain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Proof verification result:', result);

      return {
        isValid: result.isValid,
        timestamp: result.verificationTimestamp || Date.now(),
        meetsRequirement: result.meetsRequirement,
        identityMatches: result.identityMatches,
        error: result.isValid && result.meetsRequirement && result.identityMatches
          ? undefined 
          : "Proof verification failed, doesn't meet requirements, or identity mismatch",
      };
    } catch (error) {
      return {
        isValid: false,
        timestamp: Date.now(),
        meetsRequirement: false,
        identityMatches: false,
        error: `Verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Verify an income proof (legacy)
   */
  async verifyIncomeProof(
    request: VerificationRequest
  ): Promise<VerificationResult> {
    console.log("Verifying proof:", request.proofKey);

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/proof/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proofKey: request.proofKey,
          requiredAmount: request.requiredMinIncome,
          verifierName: request.applicantName, // Use applicant name as verifier for now
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Proof verification result:', result);

      return {
        isValid: result.isValid,
        timestamp: result.verificationTimestamp || Date.now(),
        meetsRequirement: result.meetsRequirement,
        identityMatches: true, // Backend handles this verification
        error: result.isValid && result.meetsRequirement 
          ? undefined 
          : "Proof verification failed or doesn't meet requirements",
      };
    } catch (error) {
      return {
        isValid: false,
        timestamp: Date.now(),
        meetsRequirement: false,
        identityMatches: false,
        error: `Verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  // SIMULATION METHODS (Replace with real Midnight Network integration)

  private generateHash(input: string): string {
    // Simple hash simulation for demo purposes
    // In real implementation, this would use a proper cryptographic hash function
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private storeProof(proofKey: string, proof: IncomeProof): void {
    // Store in localStorage for demo
    const proofs = JSON.parse(localStorage.getItem("incomeProofs") || "{}");
    proofs[proofKey] = proof;
    localStorage.setItem("incomeProofs", JSON.stringify(proofs));
  }
}

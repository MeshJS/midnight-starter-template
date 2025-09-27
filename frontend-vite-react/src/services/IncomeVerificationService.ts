import {
  IncomeData,
  IncomeProof,
  VerificationRequest,
  VerificationResult,
} from "../types/income-verification";

export class IncomeVerificationService {

  constructor(_contractAddress: string) {
  }

  /**
   * Extract income data from uploaded payslip file
   * In a real implementation, this would use OCR/AI to parse the document
   */
  async extractIncomeFromFile(file: File): Promise<IncomeData> {
    // HACKATHON SIMULATION: In reality, you'd use OCR/AI to extract this data
    console.log("Processing file:", file.name);

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For demo purposes, we'll simulate extracting different income amounts
    // based on file size or name patterns
    const simulatedIncome = this.simulateIncomeExtraction(file);

    return {
      amount: simulatedIncome,
      currency: "GBP",
      timestamp: Date.now(),
      employerHash: this.generateEmployerHash(file.name),
    };
  }

  /**
   * Generate a zero-knowledge proof for income verification
   */
  async generateIncomeProof(
    incomeData: IncomeData,
    minIncomeToProve: number,
    personalDetails?: { name: string; dob: string }
  ): Promise<string> {
    console.log("Generating proof for income verification...");
    console.log("Actual income:", incomeData.amount);
    console.log("Min income to prove:", minIncomeToProve);

    // Validate that the actual income meets the minimum requirement
    if (incomeData.amount < minIncomeToProve) {
      throw new Error(
        `Your income (£${incomeData.amount}) is below the minimum you want to prove (£${minIncomeToProve})`
      );
    }

    // Simulate the zero-knowledge proof generation process
    // In reality, this would use the Midnight Network's Compact contract
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate hashes for identity verification (in real implementation, these would be cryptographic hashes)
    let nameHash = "";
    let dobHash = "";
    let personalDataHash = "";

    if (personalDetails) {
      nameHash = this.generateHash(personalDetails.name.toLowerCase());
      dobHash = this.generateHash(personalDetails.dob);
      personalDataHash = this.generateHash(
        personalDetails.name.toLowerCase() + personalDetails.dob
      );
    }

    // Generate a realistic-looking proof key
    const proofData = {
      minIncome: minIncomeToProve,
      currency: incomeData.currency,
      timestamp: Date.now(),
      actualIncome: incomeData.amount, // This would be hidden in real ZK proof
      nameHash,
      dobHash,
      personalDataHash,
    };

    const proofKey = this.generateProofKey(proofData);

    // Store the proof in our simulated "blockchain" (localStorage for demo)
    const proof: IncomeProof = {
      proofKey,
      minIncome: minIncomeToProve,
      currency: incomeData.currency,
      timestamp: proofData.timestamp,
      isValid: true,
      nameHash,
      dobHash,
      personalDataHash,
    };

    this.storeProof(proofKey, proof);

    return proofKey;
  }

  /**
   * Verify an income proof
   */
  async verifyIncomeProof(
    request: VerificationRequest
  ): Promise<VerificationResult> {
    console.log("Verifying proof:", request.proofKey);

    // Simulate blockchain verification time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const proof = this.retrieveProof(request.proofKey);

      if (!proof) {
        return {
          isValid: false,
          timestamp: Date.now(),
          meetsRequirement: false,
          identityMatches: false,
          error: "Proof key not found or invalid",
        };
      }

      const meetsRequirement = proof.minIncome >= request.requiredMinIncome;

      // Verify identity details by comparing hashes
      const providedNameHash = this.generateHash(
        request.applicantName.toLowerCase()
      );
      const providedDobHash = this.generateHash(request.applicantDOB);

      const identityMatches =
        proof.nameHash === providedNameHash &&
        proof.dobHash === providedDobHash;

      if (!identityMatches) {
        return {
          isValid: proof.isValid,
          timestamp: Date.now(),
          meetsRequirement: false,
          identityMatches: false,
          error: "Identity details do not match the proof",
        };
      }

      return {
        isValid: proof.isValid,
        timestamp: Date.now(),
        meetsRequirement,
        identityMatches,
        error: meetsRequirement
          ? undefined
          : `Proof only guarantees £${proof.minIncome}, but £${request.requiredMinIncome} is required`,
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

  private simulateIncomeExtraction(file: File): number {
    // Simulate different income levels based on file characteristics
    const baseIncome = 2000;
    const sizeMultiplier = Math.min(file.size / 100000, 3); // File size affects simulated income
    const randomFactor = 0.8 + Math.random() * 0.4; // Random variation

    return Math.round((baseIncome + sizeMultiplier * 1000) * randomFactor);
  }

  private generateEmployerHash(filename: string): string {
    // Simple hash simulation based on filename
    return "emp_" + btoa(filename).slice(0, 8);
  }

  private generateProofKey(proofData: any): string {
    const timestamp = Date.now().toString(36);
    const dataHash = btoa(JSON.stringify(proofData)).slice(0, 16);
    return `zk_proof_${timestamp}_${dataHash}`;
  }

  private storeProof(proofKey: string, proof: IncomeProof): void {
    const proofs = this.getStoredProofs();
    proofs[proofKey] = proof;
    localStorage.setItem("income_proofs", JSON.stringify(proofs));
  }

  private retrieveProof(proofKey: string): IncomeProof | null {
    const proofs = this.getStoredProofs();
    return proofs[proofKey] || null;
  }

  private getStoredProofs(): Record<string, IncomeProof> {
    const stored = localStorage.getItem("income_proofs");
    return stored ? JSON.parse(stored) : {};
  }
}

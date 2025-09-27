// Local contract types - bridges to the actual contract
// This avoids TypeScript root directory issues while maintaining clean imports

// Re-export the contract types and functions
export type EclipseProofPrivateState = {
  readonly secretKey: Uint8Array;
  readonly name?: string;
  readonly dateOfBirth?: string;
  readonly netPay?: number;
  readonly claimedEarnings?: number;
};

// Mock witnesses for development - replace with actual contract witnesses when available
export const witnesses = {
  userSecretKey: (ctx: any): [EclipseProofPrivateState, Uint8Array] => [
    ctx.privateState,
    ctx.privateState.secretKey || new Uint8Array(32)
  ],
  userName: (ctx: any): [EclipseProofPrivateState, Uint8Array] => [
    ctx.privateState,
    new Uint8Array(32) // Convert name to bytes32
  ],
  userDateOfBirth: (ctx: any): [EclipseProofPrivateState, Uint8Array] => [
    ctx.privateState,
    new Uint8Array(32) // Convert DOB to bytes32
  ],
  netPayFromPayslip: (ctx: any): [EclipseProofPrivateState, bigint] => [
    ctx.privateState,
    BigInt(ctx.privateState.netPay || 0)
  ],
  claimedEarnings: (ctx: any): [EclipseProofPrivateState, bigint] => [
    ctx.privateState,
    BigInt(ctx.privateState.claimedEarnings || 0)
  ]
};

// Helper function to create private state
export const createEclipseProofPrivateState = (
  secretKey: Uint8Array,
  name?: string,
  dateOfBirth?: string,
  netPay?: number,
  claimedEarnings?: number
): EclipseProofPrivateState => ({
  secretKey,
  name,
  dateOfBirth,
  netPay,
  claimedEarnings,
});

// Helper to generate a random secret key
export const generateSecretKey = (): Uint8Array => {
  const key = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(key);
  } else {
    // Fallback for Node.js environment
    const { webcrypto } = require('crypto');
    webcrypto.getRandomValues(key);
  }
  return key;
};

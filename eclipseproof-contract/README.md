# Eclipse Proof: Zero-Knowledge Earnings Verification Contract

Eclipse Proof is a privacy-preserving earnings verification system built on the Midnight blockchain using zero-knowledge proofs. It allows users to prove their earnings without revealing sensitive payslip information.

## Overview

This contract enables:
- **Private Earnings Verification**: Users can prove they earn above a certain threshold without revealing exact amounts
- **Identity Protection**: User identity is protected through cryptographic hashes of name and date of birth
- **Fraud Prevention**: Claimed earnings cannot exceed actual net pay from payslips
- **Flexible Verification**: Verifiers can check earnings against specific thresholds

## How It Works

### For Users (Provers):

1. **Enrollment**: Users provide their private information:
   - Name and Date of Birth (used to create identity hash)
   - Net pay from payslip (private witness)
   - Claimed earnings amount (what they want to prove)

2. **Zero-Knowledge Proof**: The contract verifies:
   - Net pay meets minimum threshold
   - Claimed earnings ≤ net pay (prevents fraud)
   - Creates proof without revealing sensitive data

3. **Proof Storage**: Only the proof result is stored on-chain:
   - User identity hash (derived from name + DOB)
   - Claimed earnings amount
   - Verification status
   - Timestamp

### For Verifiers:

1. **Verification Request**: Provide:
   - User identity hash (from name + DOB)
   - Required minimum earnings threshold

2. **Proof Verification**: Contract checks:
   - User has valid earnings proof
   - Claimed earnings meet the required threshold
   - Proof is current and verified

## Contract Structure

### Key Data Types

```compact
struct EarningsProof {
    epoch: Uint<64>;          // Version/timestamp
    userHash: Bytes<32>;      // Hash of (name + DOB)
    claimedAmount: Uint<64>;  // Claimed earnings
    verified: Uint<1>;        // Verification status
    timestamp: Uint<64>;      // Creation time
}
```

### Main Functions

#### User Functions:
- `enrollAndProveEarnings()`: Initial enrollment with earnings proof
- `updateEarningsProof()`: Update existing proof with new data
- `getMyEarningsProof()`: Retrieve own proof

#### Verifier Functions:
- `verifyEarningsByUserPk()`: Verify earnings by user public key
- `createVerificationRequest()`: Create formal verification request
- `checkEarningsThreshold()`: Check if user meets earnings threshold

#### Admin Functions:
- `setMinNetPayThreshold()`: Update minimum net pay requirement
- `revokeEarningsProof()`: Revoke user's proof
- `bumpEpoch()`: Increment version counter

## Privacy Model

1. **What's Private**:
   - User's actual name and date of birth
   - Exact net pay from payslip
   - User's secret key

2. **What's Public**:
   - Cryptographic hash of user identity
   - Claimed earnings amount (what user wants to prove)
   - Verification status

3. **Zero-Knowledge Properties**:
   - Verifiers learn only whether user meets threshold
   - No sensitive personal or financial data is revealed
   - Proofs are cryptographically sound and cannot be forged

## Use Cases

- **Lending Platforms**: Verify borrower income without seeing payslips
- **Rental Applications**: Prove income for apartment rentals
- **Employment Verification**: Validate earnings for background checks
- **Insurance**: Risk assessment based on income brackets
- **Government Benefits**: Eligibility verification for social programs

## Building and Testing

```bash
# Install dependencies
npm install

# Build the contract
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint
```

## Security Considerations

1. **Fraud Prevention**: Contract ensures claimed earnings cannot exceed net pay
2. **Identity Verification**: User hash prevents identity spoofing
3. **Access Control**: Admin functions protected by ownership model
4. **Version Control**: Epoch system tracks policy changes
5. **Proof Integrity**: Zero-knowledge proofs ensure mathematical soundness

## Example Usage

```typescript
import { EclipseProofSimulator } from './src/test/eclipseproof-simulator.js';
import { createUserHashFromStrings } from './src/witnesses.js';

// Create user with earnings data
const simulator = new EclipseProofSimulator(
  secretKey,
  "Alice Johnson",      // name
  "1985-03-15",        // date of birth
  6000,                // net pay from payslip
  5500                 // claimed earnings
);

// Enroll and create proof
simulator.enrollAndProveEarnings();

// Verifier checks earnings
const userHash = createUserHashFromStrings("Alice Johnson", "1985-03-15");
const meetsThreshold = simulator.verifyEarningsByUserPk(
  userPublicKey,
  userHash,
  5000n  // required threshold
);
```

## License

Apache-2.0 - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## Support

For questions and support, please open an issue in the repository.

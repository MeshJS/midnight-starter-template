// This file is part of Eclipse Proof Contract
// Copyright (C) 2025 Eclipse Proof Team
// SPDX-License-Identifier: Apache-2.0
// EclipseProof Contract Integration
// This file provides a clean interface for the CLI to use the compiled contract
import { witnesses } from './witnesses';
// Import the compiled contract
const contractModule = require('./managed/eclipseproof/contract/index.cjs');
// Create the contract instance
export const createEclipseProofContract = () => {
    return new contractModule.Contract(witnesses);
};
export { witnesses };
// For backwards compatibility, export under EclipseProof namespace
export const EclipseProof = {
    Contract: contractModule.Contract
};
//# sourceMappingURL=index.js.map
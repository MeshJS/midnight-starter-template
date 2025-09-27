import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import { createLogger } from './logger-utils';
import { 
    submitProofRequest, 
    generateProof, 
    deploy, 
    joinContract,
    displayProofStatus,
    findExistingContract,
    postProofToBlockchain,
    getProofFromBlockchain
} from './api';
import { setupProviders } from './config';
import type { DeployedProverContract, ProverProviders } from './common-types';
import type { EclipseProofPrivateState } from './eclipseproof-contract-compat';

const app = express();
const PORT = process.env.PORT || 3001;
const logger = createLogger('server');

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept common document formats
        const allowedMimes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/jpg',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Please upload PDF, Word, or image files.'));
        }
    }
});

// Global state for contract management
let providers: ProverProviders | null = null;
let deployedContract: DeployedProverContract | null = null;

// On-demand contract initialization
async function ensureContractInitialized(): Promise<DeployedProverContract> {
    if (deployedContract) {
        return deployedContract;
    }

    if (!providers) {
        throw new Error('Providers not initialized');
    }

    try {
        logger.info('Initializing contract on-demand...');
        
        // Try to find existing contract first
        const existingContract = await findExistingContract(providers);
        if (existingContract) {
            deployedContract = existingContract;
            logger.info('Found existing contract');
            return deployedContract;
        }

        // Deploy new contract with initial state
        const initialState: EclipseProofPrivateState = {
            proofs: [],
            status: 'idle'
        };
        deployedContract = await deploy(providers, initialState);
        logger.info('Deployed new contract on-demand');
        return deployedContract;
    } catch (error) {
        logger.error('Failed to initialize contract:', error);
        throw error;
    }
}

// Initialize providers on startup
async function initializeProviders() {
    try {
        logger.info('Initializing providers...');
        providers = await setupProviders();
        logger.info('Providers initialized successfully');
        
        // For now, skip contract deployment to avoid initialization issues
        // This can be handled on-demand when the first API call is made
        logger.info('Skipping contract deployment for now - will deploy on first use');
        deployedContract = null;
        
    } catch (error) {
        logger.error('Failed to initialize providers:', error);
        logger.info('Continuing without full initialization - some features may be limited');
        providers = null;
        deployedContract = null;
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        providersInitialized: providers !== null,
        contractDeployed: deployedContract !== null,
        contractAddress: deployedContract?.deployTxData.public.contractAddress || null,
        version: '1.0.0'
    });
});

// Contract status endpoint
app.get('/api/contract/status', async (req, res) => {
    try {
        if (!providers) {
            return res.status(503).json({ error: 'Providers not initialized' });
        }

        const contract = await ensureContractInitialized();
        const status = await displayProofStatus(providers, contract);
        res.json(status);
    } catch (error) {
        logger.error('Error getting contract status:', error);
        res.status(500).json({ error: 'Failed to get contract status' });
    }
});

// Document upload and income extraction endpoint
app.post('/api/income/extract', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        logger.info(`Processing document: ${req.file.originalname}`);
        
        // Simulate income extraction based on file properties
        const simulatedIncome = simulateIncomeExtraction(req.file);
        
        const incomeData = {
            amount: simulatedIncome,
            currency: 'GBP',
            timestamp: Date.now(),
            employerHash: generateEmployerHash(req.file.originalname),
            documentHash: generateDocumentHash(req.file.buffer)
        };

        logger.info(`Extracted income data: ${JSON.stringify(incomeData)}`);
        res.json(incomeData);
    } catch (error) {
        logger.error('Error extracting income:', error);
        res.status(500).json({ error: 'Failed to extract income data' });
    }
});

// Generate proof from JSON data endpoint
app.post('/api/proof/generate-from-json', async (req, res) => {
    try {
        if (!providers) {
            return res.status(503).json({ error: 'Providers not initialized' });
        }

        const { name, payslipJson, dateOfBirth, amountToProve } = req.body;
        
        if (!name || !payslipJson || !dateOfBirth || !amountToProve) {
            return res.status(400).json({ 
                error: 'Missing required fields: name, payslipJson, dateOfBirth, amountToProve' 
            });
        }

        // Parse and validate payslip JSON
        let payslipData;
        try {
            payslipData = JSON.parse(payslipJson);
        } catch (err) {
            return res.status(400).json({ error: 'Invalid JSON format for payslip data' });
        }

        // Extract net pay from payslip data
        const netPay = payslipData.netPay || payslipData.net_pay || payslipData.NetPay;
        if (!netPay || typeof netPay !== 'number') {
            return res.status(400).json({ 
                error: 'Invalid payslip data: netPay field is required and must be a number' 
            });
        }

        // Validate that the actual income meets the minimum requirement
        if (netPay < amountToProve) {
            return res.status(400).json({ 
                error: `Income verification failed. Required: ${amountToProve}, Actual: ${netPay}` 
            });
        }

        // Generate a unique proof hash
        const proofHash = generateProofHash(name, payslipJson, dateOfBirth, amountToProve);
        
        // Store proof data for verification (in production this would be on blockchain)
        storeProofData(proofHash, {
            name,
            dateOfBirth,
            amountToProve,
            netPay,
            timestamp: Date.now(),
            payslipHash: generateHash(payslipJson)
        });

        // Post to Midnight blockchain (placeholder implementation)
        const blockchainResult = await postProofToBlockchain(proofHash, {
            name,
            dateOfBirth,
            amountToProve,
            timestamp: Date.now()
        });
        
        res.json({
            success: true,
            proofHash,
            blockchainTxHash: blockchainResult.txHash,
            blockHash: blockchainResult.blockHash,
            message: 'Proof generated and stored successfully'
        });
    } catch (error) {
        logger.error('Error generating proof from JSON:', error);
        res.status(500).json({ error: 'Failed to generate proof' });
    }
});

// Submit proof request endpoint (legacy)
app.post('/api/proof/submit', async (req, res) => {
    try {
        if (!providers) {
            return res.status(503).json({ error: 'Providers not initialized' });
        }

        const { document, proofAmount } = req.body;
        
        if (!document || !proofAmount) {
            return res.status(400).json({ error: 'Missing required fields: document and proofAmount' });
        }

        // Validate that the actual income meets the minimum requirement
        if (document.NetPay < proofAmount) {
            return res.status(400).json({ 
                error: `Income verification failed. Required: ${proofAmount}, Actual: ${document.NetPay}` 
            });
        }

        const contract = await ensureContractInitialized();
        const proofRequest = {
            document,
            proofAmount
        };

        const result = await submitProofRequest(contract, proofRequest);
        
        res.json({
            success: true,
            txHash: result.txHash,
            txId: result.txId,
            proofId: `proof_${Date.now()}` // Generate a proof ID for tracking
        });
    } catch (error) {
        logger.error('Error submitting proof request:', error);
        res.status(500).json({ error: 'Failed to submit proof request' });
    }
});

// Generate proof endpoint
app.post('/api/proof/generate', async (req, res) => {
    try {
        if (!providers) {
            return res.status(503).json({ error: 'Providers not initialized' });
        }

        const contract = await ensureContractInitialized();
        const result = await generateProof(contract);
        
        res.json({
            success: true,
            txHash: result.txHash,
            txId: result.txId,
            proofKey: `proof_key_${Date.now()}` // Generate a proof key for verification
        });
    } catch (error) {
        logger.error('Error generating proof:', error);
        res.status(500).json({ error: 'Failed to generate proof' });
    }
});

// Verify proof from blockchain endpoint
app.post('/api/proof/verify-from-blockchain', async (req, res) => {
    try {
        const { proofHash, name, dateOfBirth, requiredAmount } = req.body;
        
        if (!proofHash || !name || !dateOfBirth || !requiredAmount) {
            return res.status(400).json({ 
                error: 'Missing required fields: proofHash, name, dateOfBirth, requiredAmount' 
            });
        }

        // Try to retrieve proof from Midnight blockchain first
        let storedProof = await getProofFromBlockchain(proofHash);
        
        // Fallback to local storage if not found on blockchain
        if (!storedProof) {
            storedProof = getStoredProofData(proofHash);
        }
        
        if (!storedProof) {
            return res.status(404).json({ 
                error: 'Proof not found on blockchain',
                isValid: false,
                meetsRequirement: false,
                identityMatches: false
            });
        }

        // Verify identity matches
        const identityMatches = storedProof.name.toLowerCase() === name.toLowerCase() && 
                               storedProof.dateOfBirth === dateOfBirth;

        // Check if proof meets requirement
        const meetsRequirement = storedProof.amountToProve >= requiredAmount;
        
        logger.info(`Verifying proof: ${proofHash} for ${requiredAmount} by ${name}`);
        logger.info(`Identity matches: ${identityMatches}, Meets requirement: ${meetsRequirement}`);
        
        res.json({
            isValid: true,
            meetsRequirement,
            identityMatches,
            verificationTimestamp: Date.now(),
            proofTimestamp: storedProof.timestamp
        });
    } catch (error) {
        logger.error('Error verifying proof from blockchain:', error);
        res.status(500).json({ error: 'Failed to verify proof from blockchain' });
    }
});

// Verify proof endpoint (legacy)
app.post('/api/proof/verify', async (req, res) => {
    try {
        const { proofKey, requiredAmount, verifierName } = req.body;
        
        if (!proofKey || !requiredAmount) {
            return res.status(400).json({ error: 'Missing required fields: proofKey and requiredAmount' });
        }

        // Mock verification - in reality this would verify the zero-knowledge proof
        const isValid = proofKey.startsWith('proof_key_');
        const proofAmount = isValid ? Math.floor(Math.random() * 10000) + Number(requiredAmount) : 0;
        
        logger.info(`Verifying proof: ${proofKey} for ${requiredAmount} by ${verifierName}`);
        
        res.json({
            isValid,
            meetsRequirement: isValid && proofAmount >= Number(requiredAmount),
            verificationTimestamp: Date.now(),
            verifierName: verifierName || 'Anonymous'
        });
    } catch (error) {
        logger.error('Error verifying proof:', error);
        res.status(500).json({ error: 'Failed to verify proof' });
    }
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Utility functions
function simulateIncomeExtraction(file: Express.Multer.File): number {
    // Simulate income extraction based on file size or name
    const baseIncome = 3000;
    const fileNameLower = file.originalname.toLowerCase();
    
    if (fileNameLower.includes('high') || fileNameLower.includes('senior')) {
        return baseIncome + Math.floor(Math.random() * 3000) + 2000; // 5000-8000
    } else if (fileNameLower.includes('mid') || fileNameLower.includes('manager')) {
        return baseIncome + Math.floor(Math.random() * 2000) + 1000; // 4000-6000
    } else {
        return baseIncome + Math.floor(Math.random() * 1500); // 3000-4500
    }
}

function generateEmployerHash(filename: string): string {
    // Simple hash based on filename for demo
    let hash = 0;
    for (let i = 0; i < filename.length; i++) {
        const char = filename.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
}

function generateDocumentHash(buffer: Buffer): string {
    // Simple hash of document content
    let hash = 0;
    for (let i = 0; i < Math.min(buffer.length, 1000); i++) {
        hash = ((hash << 5) - hash) + buffer[i];
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

function generateHash(input: string): string {
    // Simple hash function for demo purposes
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

function generateProofHash(name: string, payslipJson: string, dateOfBirth: string, amountToProve: number): string {
    // Generate a unique hash for the proof
    const combinedData = `${name.toLowerCase()}_${payslipJson}_${dateOfBirth}_${amountToProve}_${Date.now()}`;
    return `proof_hash_${generateHash(combinedData)}`;
}

// In-memory storage for demo purposes (in production this would be on blockchain)
const proofStorage: { [key: string]: any } = {};

function storeProofData(proofHash: string, proofData: any): void {
    proofStorage[proofHash] = proofData;
    logger.info(`Stored proof data for hash: ${proofHash}`);
}

function getStoredProofData(proofHash: string): any | null {
    return proofStorage[proofHash] || null;
}

// Start server
async function startServer() {
    await initializeProviders();
    
    app.listen(PORT, () => {
        logger.info(`EclipseProof API server running on port ${PORT}`);
        logger.info(`Mode: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`Providers initialized: ${providers !== null}`);
        if (deployedContract) {
            logger.info(`Contract address: ${deployedContract.deployTxData.public.contractAddress}`);
        } else {
            logger.info('Contract will be initialized on first use');
        }
    });
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});

startServer().catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
});

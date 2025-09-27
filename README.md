# � EclipseProof

**Privacy-Preserving Income Verification Using Zero-Knowledge Proofs**

EclipseProof revolutionizes income verification by allowing individuals to prove they meet income requirements without revealing their exact salary, employer details, or other sensitive financial information.

## 🌟 The Problem We Solve

### Traditional Income Verification Issues:

- 📄 **Over-sharing**: Applicants must share complete payslips with sensitive details
- 🔍 **Privacy Invasion**: Verifiers see exact salaries, employer names, and personal data
- � **Security Risk**: Sensitive documents can be misused or data breached
- ⏱️ **Manual Process**: Time-consuming document review and verification

### EclipseProof Solution:

- 🔒 **Zero-Knowledge Proofs**: Prove income thresholds without revealing exact amounts
- 🛡️ **Privacy-First**: Only the minimum necessary information is shared
- ⚡ **Instant Verification**: Cryptographic proofs verified in seconds
- 🌐 **Blockchain Security**: Powered by Midnight Network for trust and transparency

## 🎯 How It Works

### Simple Analogy

Imagine you want to get into a club that only allows people over 21:

**❌ Old Way:** Show your entire driver's license (revealing name, address, exact birthday)  
**✅ EclipseProof Way:** Get a cryptographic "stamp" that only proves "Yes, I'm over 21"

### For Income Verification:

1. **Prover** uploads their payslip privately
2. System extracts income data (never shared)
3. Prover specifies minimum income to prove (e.g., "I earn at least £2,500")
4. System generates a **Proof Key** using zero-knowledge cryptography
5. **Verifier** checks the Proof Key against their requirement
6. Result: ✅ "Meets requirement" or ❌ "Doesn't meet requirement"

**The verifier learns ONLY whether the requirement is met - nothing else!**

## � Features

### 🔐 For Provers (Income Holders)

- **Document Upload**: Secure payslip processing with OCR simulation
- **Income Detection**: Automatic extraction of salary information
- **Flexible Thresholds**: Prove any minimum income level
- **Privacy Protection**: Your exact income stays completely private
- **Proof Generation**: Create shareable cryptographic proofs

### ✅ For Verifiers (Landlords, Lenders, etc.)

- **Simple Verification**: Paste proof key and set requirements
- **Instant Results**: Get yes/no answers in seconds
- **Privacy Compliant**: No access to sensitive personal data
- **Audit Trail**: Blockchain-backed verification history
- **Trust Guaranteed**: Cryptographic proof prevents fraud

## 🛠️ Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Blockchain**: Midnight Network (Privacy-focused blockchain)
- **Cryptography**: Zero-Knowledge Proofs via Compact language
- **UI/UX**: Tailwind CSS with dark theme
- **State Management**: React Hooks + RxJS
- **Testing**: Vitest + Docker containers

## 📦 Installation & Setup

### Prerequisites

- Node.js 20.16.0+
- npm or yarn
- Git
- Docker (for local development)
- [Compact Tools](https://docs.midnight.network/relnotes/compact-tools) (Midnight developer tools)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Utpal-Kalita/EclipseProof.git
cd EclipseProof

# Install dependencies
npm install

# Build all packages
npm run build

# Start the development server
npm run dev:frontend

# Open your browser
# Navigate to http://localhost:5173
```

### Project Structure

```
EclipseProof/
├── frontend-vite-react/          # React web application
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/               # Application pages
│   │   ├── services/            # Business logic & API calls
│   │   ├── types/               # TypeScript interfaces
│   │   └── App.tsx              # Main application component
├── counter-contract/             # Smart contract (Compact language)
├── counter-cli/                 # Command-line interface
├── bulletin-board/              # Additional contract examples
└── README.md                    # This file
```

## 🎮 Usage Guide

### � As a Prover (Proving Your Income)

1. **Navigate to the Prover Tab** 🔐
2. **Upload Your Payslip**: Click "Choose a payslip file" and select your document
3. **Review Detected Income**: The system will show the extracted income amount
4. **Set Proof Amount**: Enter the minimum income you want to prove (e.g., £2,500)
5. **Generate Proof**: Click "Generate Privacy Proof"
6. **Share Proof Key**: Copy the generated proof key and share it with your verifier

### 🏢 As a Verifier (Checking Income Proof)

1. **Navigate to the Verifier Tab** ✅
2. **Paste Proof Key**: Enter the proof key shared by the prover
3. **Set Requirement**: Enter your minimum income requirement
4. **Verify**: Click "Verify Income Proof"
5. **Review Result**: Get instant ✅ or ❌ without seeing sensitive details

## 🔒 Privacy & Security

### What Provers Keep Private:

- ❌ Exact salary amount
- ❌ Employer name and details
- ❌ Bank account information
- ❌ Personal identifiers on payslips
- ❌ Other income sources

### What Verifiers Learn:

- ✅ Whether income meets their minimum requirement
- ✅ Timestamp of verification
- ✅ Currency used (e.g., GBP)
- ❌ Nothing else!

### Security Features:

- 🔐 **End-to-End Encryption**: All sensitive data encrypted
- 🌐 **Blockchain Security**: Proofs stored on decentralized network
- 🛡️ **Zero-Knowledge**: Cryptographically impossible to extract private data
- 🔍 **Audit Trail**: All verifications logged for transparency
- 🚫 **No Data Storage**: Original documents never permanently stored

## 🎯 Use Cases

### 🏠 **Rental Applications**

- Landlords verify tenant income without seeing full payslips
- Faster application processing
- Reduced privacy invasion

### 🏦 **Loan Applications**

- Banks verify income thresholds for loan eligibility
- Streamlined underwriting process
- Enhanced data protection compliance

### 💼 **Employment Verification**

- Background checks without salary disclosure
- Contractor qualification verification
- Reduced administrative overhead

### 🎓 **Scholarship Applications**

- Income-based eligibility without financial exposure
- Simplified verification for educational institutions

## 🔮 Future Roadmap

### Phase 1: Core Platform ✅

- [x] Basic proof generation and verification
- [x] Web interface for provers and verifiers
- [x] Privacy-preserving architecture

### Phase 2: Enhanced Features 🚧

- [ ] Real OCR integration for document processing
- [ ] Multi-currency support
- [ ] Mobile application
- [ ] API for third-party integrations

### Phase 3: Enterprise Ready 📋

- [ ] Bulk verification tools
- [ ] Advanced analytics dashboard
- [ ] Compliance reporting
- [ ] Enterprise SSO integration

### Phase 4: Ecosystem Expansion 🌐

- [ ] Integration with major property platforms
- [ ] Banking API partnerships
- [ ] Government verification systems
- [ ] International market expansion

## 🔧 Development

### Network Configuration

#### Testnet Network

1. **Set Network ID** - Already configured in `frontend-vite-react/src/App.tsx`
2. **Contract Address** - Currently using Counter contract for demo
3. **Start Development**:
   ```bash
   npm run dev:frontend
   ```

#### Local Development

1. **Configure wallet address** in `counter-cli/src/scripts/prepare-standalone.test.ts`
2. **Start local instances**:
   ```bash
   npm run dev:undeployed-instances
   ```
3. **Deploy and configure contract address**

### Available Scripts

```bash
npm run build          # Build all packages
npm run test           # Run tests
npm run lint           # Lint code
npm run dev:frontend   # Start frontend dev server
npm run compact        # Compile smart contracts
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Setup

```bash
# Fork the repository
# Clone your fork
git clone https://github.com/YOUR_USERNAME/EclipseProof.git

# Create a feature branch
git checkout -b feature/amazing-feature

# Make your changes
# Test your changes
npm test

# Commit with clear message
git commit -m "Add amazing feature"

# Push to your fork
git push origin feature/amazing-feature

# Create a Pull Request
```

### Areas for Contribution:

- 🐛 Bug fixes and improvements
- ✨ New features and enhancements
- 📚 Documentation improvements
- 🧪 Test coverage expansion
- 🎨 UI/UX enhancements
- 🔒 Security audits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Midnight Network**: For providing privacy-focused blockchain infrastructure
- **Mesh SDK**: For React integration with Midnight Network
- **Zero-Knowledge Community**: For advancing privacy-preserving technologies
- **Open Source Contributors**: For making this project possible

## 📞 Support & Contact

- **GitHub Issues**: [Report bugs or request features](https://github.com/Utpal-Kalita/EclipseProof/issues)
- **Documentation**: [Visit our docs](https://github.com/Utpal-Kalita/EclipseProof/wiki)
- **Email**: Contact via GitHub profile

---

**Built with ❤️ for Privacy | Powered by Zero-Knowledge Proofs | Secured by Midnight Network**

_EclipseProof: Where Privacy Meets Verification_ 🔐✨

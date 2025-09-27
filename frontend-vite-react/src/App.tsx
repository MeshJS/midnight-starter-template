import { useState } from "react";
import { MidnightMeshProvider, useAssets } from "@meshsdk/midnight-react";
import * as pino from "pino";
import {
  NetworkId,
  setNetworkId,
} from "@midnight-ntwrk/midnight-js-network-id";
import { ThemeProvider } from "./components/theme-provider";
import { IncomeVerificationService } from "./services/IncomeVerificationService";
import { IncomeData } from "./types/income-verification";
import { MidnightWallet } from "@/modules/midnight/wallet-widget";

// Set up logging and network
export const logger = pino.pino({
  level: "trace",
});

// Configure for TestNet
setNetworkId(NetworkId.TestNet);

// This will be our income verification contract address
// TODO: Replace with actual deployed contract address
const contractAddress =
  "0200616f9ecf9710f508bf13f7f98dacbed239a0f38fb289f08d532d7b367dd57505";

// Main EclipseProof Component
function EclipseProofApp() {
  // === STATE MANAGEMENT ===
  // This is where we store all the data that can change on the page.
  const [view, setView] = useState("prover"); // 'prover' or 'verifier'

  // State for the Prover View
  const [file, setFile] = useState<File | null>(null);
  const [fileChosenText, setFileChosenText] = useState(
    "Choose a payslip file..."
  );
  const [desiredAmount, setDesiredAmount] = useState("");
  const [proverName, setProverName] = useState("");
  const [proverDOB, setProverDOB] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [proofKey, setProofKey] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [extractedIncome, setExtractedIncome] = useState<IncomeData | null>(
    null
  );
  const [error, setError] = useState<string>("");

  // State for the Verifier View
  const [verifyKey, setVerifyKey] = useState("");
  const [requiredAmount, setRequiredAmount] = useState("");
  const [verifierName, setVerifierName] = useState("");
  const [verifierDOB, setVerifierDOB] = useState("");
  const [verificationResult, setVerificationResult] = useState<
    "success" | "failed" | null
  >(null);
  const [verificationError, setVerificationError] = useState<string>("");

  const { hasConnectedWallet, walletName, address } = useAssets();
  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";
  const walletLabel = walletName || "Midnight Wallet";

  // Initialize the service
  const verificationService = new IncomeVerificationService(contractAddress);

  // === EVENT HANDLERS ===
  // These are the functions that run when you click buttons or type in boxes.

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFileChosenText(selectedFile.name);
      setError("");
      setExtractedIncome(null);
      setProofKey("");
    }
  };

  const handleGenerateProof = async () => {
    if (!hasConnectedWallet) {
      setError("Connect your Midnight wallet to generate a proof.");
      return;
    }

    if (!file || !desiredAmount) {
      setError("Please upload a payslip and enter the desired amount.");
      return;
    }

    if (!proverName || !proverDOB) {
      setError(
        "Please enter your name and date of birth for identity verification."
      );
      return;
    }

    setIsLoading(true);
    setProofKey("");
    setError("");

    try {
      // Step 1: Extract income data from the uploaded file
      const incomeData = await verificationService.extractIncomeFromFile(file);
      setExtractedIncome(incomeData);

      console.log("Extracted income:", incomeData.amount);

      // Step 2: Generate the zero-knowledge proof with personal details
      const proof = await verificationService.generateIncomeProof(
        incomeData,
        parseInt(desiredAmount),
        { name: proverName, dob: proverDOB }
      );

      setProofKey(proof);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate proof";
      setError(errorMessage);
      console.error("Proof generation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(proofKey).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleVerifyProof = async () => {
    if (!hasConnectedWallet) {
      setVerificationError(
        "Connect your Midnight wallet to verify income proofs."
      );
      setVerificationResult(null);
      return;
    }

    if (!verifyKey || !requiredAmount) {
      setVerificationError(
        "Please provide a proof key and the required income amount."
      );
      return;
    }

    if (!verifierName || !verifierDOB) {
      setVerificationError(
        "Please enter the applicant's name and date of birth for verification."
      );
      return;
    }

    setIsLoading(true);
    setVerificationResult(null);
    setVerificationError("");

    try {
      const result = await verificationService.verifyIncomeProof({
        proofKey: verifyKey,
        requiredMinIncome: parseInt(requiredAmount),
        currency: "GBP",
        applicantName: verifierName,
        applicantDOB: verifierDOB,
      });

      if (result.error) {
        setVerificationError(result.error);
        setVerificationResult("failed");
      } else if (!result.identityMatches) {
        setVerificationError(
          "Identity verification failed. The provided details do not match the proof."
        );
        setVerificationResult("failed");
      } else {
        setVerificationResult(
          result.isValid && result.meetsRequirement ? "success" : "failed"
        );
        if (!result.meetsRequirement) {
          setVerificationError(
            "The proof does not meet the required minimum income."
          );
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Verification failed";
      setVerificationError(errorMessage);
      setVerificationResult("failed");
      console.error("Verification error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // === JSX (The HTML Part) ===
  // This is what gets rendered to the screen.
  return (
    <div className="w-full max-w-lg">
      {/* Added a style tag to include the custom CSS directly in the component */}
      <style>{`
                .loader {
                    border: 2px solid #fff;
                    border-top-color: #4f46e5;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                .fade-in {
                    animation: fadeIn 0.5s ease-in-out;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .btn-primary {
                    background-color: #4f46e5;
                    transition: background-color 0.3s ease;
                }

                .btn-primary:hover {
                    background-color: #4338ca;
                }
            `}</style>

      <header className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold text-white">EclipseProof</h1>
            <p className="text-indigo-400">
              Verify Your Income. Preserve Your Privacy.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <MidnightWallet />
            {hasConnectedWallet ? (
              <p className="text-xs text-slate-400">
                Logged in as {walletLabel}
                {truncatedAddress && (
                  <span className="ml-1 font-mono text-slate-300">
                    ({truncatedAddress})
                  </span>
                )}
              </p>
            ) : (
              <p className="text-xs text-slate-400 text-center md:text-right">
                Connect your Midnight wallet to start.
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="bg-slate-800 rounded-xl shadow-2xl p-6 md:p-8">
        <div className="flex border border-slate-700 rounded-lg p-1 mb-6 bg-slate-900">
          <button
            onClick={() => setView("prover")}
            className={`w-1/2 p-2 rounded-md text-sm font-semibold transition-colors duration-300 ${view === "prover" ? "bg-indigo-600 text-white" : "text-slate-300"}`}
          >
            🔐 Prover
          </button>
          <button
            onClick={() => setView("verifier")}
            className={`w-1/2 p-2 rounded-md text-sm font-semibold transition-colors duration-300 ${view === "verifier" ? "bg-indigo-600 text-white" : "text-slate-300"}`}
          >
            ✅ Verifier
          </button>
        </div>

        {!hasConnectedWallet && (
          <div className="mb-6 rounded-lg border border-indigo-600 bg-indigo-900/30 p-4 text-indigo-100">
            <p className="text-sm font-medium">
              Connect your Midnight wallet to generate or verify income proofs.
            </p>
            <p className="mt-2 text-xs text-indigo-200">
              Use the Connect Wallet button above to sign in securely.
            </p>
          </div>
        )}

        {/* Conditional Rendering: Show Prover View */}
        {view === "prover" && (
          <div className="space-y-6 fade-in">
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold text-white mb-2">
                🔐 Prover Dashboard
              </h2>
              <p className="text-slate-400 text-sm">
                Generate a privacy-preserving proof of your income
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                1. Upload Your Payslip
              </label>
              <label className="w-full flex items-center justify-center px-4 py-3 bg-slate-700 text-slate-300 rounded-lg cursor-pointer hover:bg-slate-600">
                <span className="text-sm">{fileChosenText}</span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {extractedIncome && (
                <div className="mt-2 p-3 bg-green-900/30 border border-green-700 rounded-lg">
                  <p className="text-green-300 text-sm">
                    ✅ Detected Income: £
                    {extractedIncome.amount.toLocaleString()}
                    <span className="text-green-400 ml-2">
                      (Processed from document)
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="prover-name"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  2a. Your Full Name
                </label>
                <input
                  type="text"
                  id="prover-name"
                  value={proverName}
                  onChange={(e) => setProverName(e.target.value)}
                  placeholder="e.g., John Smith"
                  className="form-input block w-full pl-3 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="prover-dob"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  2b. Date of Birth
                </label>
                <input
                  type="date"
                  id="prover-dob"
                  value={proverDOB}
                  onChange={(e) => setProverDOB(e.target.value)}
                  className="form-input block w-full pl-3 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="desired-amount"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                3. Minimum Income to Prove (£)
              </label>
              <input
                type="number"
                id="desired-amount"
                value={desiredAmount}
                onChange={(e) => setDesiredAmount(e.target.value)}
                placeholder="e.g., 2500"
                className="form-input block w-full pl-3 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
              {extractedIncome &&
                desiredAmount &&
                parseInt(desiredAmount) > extractedIncome.amount && (
                  <p className="mt-1 text-red-400 text-sm">
                    ⚠️ Warning: You're trying to prove £{desiredAmount} but your
                    income is £{extractedIncome.amount}
                  </p>
                )}
              <p className="text-slate-500 text-xs mt-1">
                💡 Your identity details will be cryptographically hashed for
                privacy protection
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg">
                <p className="text-red-300 text-sm">❌ {error}</p>
              </div>
            )}

            <button
              onClick={handleGenerateProof}
              disabled={isLoading || !hasConnectedWallet}
              className="w-full btn-primary text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "🔄 Generating Proof..."
                : "🔐 Generate Privacy Proof"}
              {isLoading && <div className="loader w-5 h-5 ml-2"></div>}
            </button>
            {proofKey && (
              <div className="fade-in">
                <div className="p-4 bg-slate-900 border border-slate-600 rounded-lg">
                  <p className="text-slate-300 text-sm mb-2">
                    🎉 Your Privacy Proof (share this with verifiers):
                  </p>
                  <div className="flex items-center justify-between bg-slate-800 p-3 rounded">
                    <code className="text-indigo-300 text-sm font-mono break-all">
                      {proofKey}
                    </code>
                    <button
                      onClick={handleCopyKey}
                      className="ml-4 p-2 rounded-md hover:bg-slate-700 flex-shrink-0"
                    >
                      {copySuccess ? "✅" : "📋"}
                    </button>
                  </div>
                  <p className="text-slate-400 text-xs mt-2">
                    This proof shows you earn at least £{desiredAmount} without
                    revealing your exact income.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Conditional Rendering: Show Verifier View */}
        {view === "verifier" && (
          <div className="space-y-6 fade-in">
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold text-white mb-2">
                ✅ Verifier Dashboard
              </h2>
              <p className="text-slate-400 text-sm">
                Verify income proofs while protecting applicant privacy
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                1. Paste Proof from Prover
              </label>
              <input
                type="text"
                value={verifyKey}
                onChange={(e) => setVerifyKey(e.target.value)}
                placeholder="zk_proof_..."
                className="form-input block w-full py-2 px-3 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm"
              />
              <p className="text-slate-500 text-xs mt-1">
                The prover should share their proof key with you
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="verifier-name"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  2a. Applicant's Full Name
                </label>
                <input
                  type="text"
                  id="verifier-name"
                  value={verifierName}
                  onChange={(e) => setVerifierName(e.target.value)}
                  placeholder="e.g., John Smith"
                  className="form-input block w-full pl-3 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="verifier-dob"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  2b. Applicant's Date of Birth
                </label>
                <input
                  type="date"
                  id="verifier-dob"
                  value={verifierDOB}
                  onChange={(e) => setVerifierDOB(e.target.value)}
                  className="form-input block w-full pl-3 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                3. Your Minimum Income Requirement (£)
              </label>
              <input
                type="number"
                value={requiredAmount}
                onChange={(e) => setRequiredAmount(e.target.value)}
                placeholder="e.g., 2500"
                className="form-input block w-full pl-3 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
              <p className="text-slate-500 text-xs mt-1">
                Enter the minimum income you require for approval
              </p>
              <p className="text-slate-500 text-xs mt-1">
                🔒 Identity verification ensures the proof matches the specific
                applicant
              </p>
            </div>

            {verificationError && (
              <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg">
                <p className="text-red-300 text-sm">❌ {verificationError}</p>
              </div>
            )}

            <button
              onClick={handleVerifyProof}
              disabled={isLoading || !hasConnectedWallet}
              className="w-full btn-primary text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "🔄 Verifying Proof..." : "✅ Verify Income Proof"}
              {isLoading && <div className="loader w-5 h-5 ml-2"></div>}
            </button>
            {verificationResult && (
              <div
                className={`fade-in p-4 rounded-lg mt-4 ${verificationResult === "success" ? "bg-green-900/50 border border-green-700" : "bg-red-900/50 border border-red-700"}`}
              >
                <h3
                  className={`font-bold ${verificationResult === "success" ? "text-green-300" : "text-red-300"}`}
                >
                  {verificationResult === "success"
                    ? "✅ Proof Verified Successfully"
                    : "❌ Proof Verification Failed"}
                </h3>
                <p
                  className={`text-sm mt-2 ${verificationResult === "success" ? "text-green-200" : "text-red-200"}`}
                >
                  {verificationResult === "success"
                    ? `The prover meets your minimum income requirement of £${requiredAmount}.`
                    : "The proof is either invalid or does not meet your requirements."}
                </p>
                {verificationResult === "success" && (
                  <div className="mt-3 p-3 bg-green-800/30 rounded border border-green-600">
                    <p className="text-green-200 text-xs">
                      🔐 <strong>Privacy Protected:</strong> You only know they
                      meet your requirement. Their exact income, employer, and
                      other details remain completely private.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Main App Component with Providers
function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="eclipse-proof-theme">
      <MidnightMeshProvider logger={logger}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 flex items-center justify-center p-4">
          <EclipseProofApp />
        </div>
      </MidnightMeshProvider>
    </ThemeProvider>
  );
}

export default App;

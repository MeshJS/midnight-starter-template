import type { ProofProvider, ProveTxConfig, ProvenTransaction  } from "@midnight-ntwrk/midnight-js-types";
import type { UnprovenTransaction } from "@midnight-ntwrk/ledger-v6";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";

export const proofClient = <K extends string>(
  url: string,
  callback: (status: "proveTxStarted" | "proveTxDone") => void
): ProofProvider<K> => {
  const httpClientProvider = httpClientProofProvider(url.trim());
  return {
    proveTx(
      tx: UnprovenTransaction,
      proveTxConfig?: ProveTxConfig<K>
    ): Promise<ProvenTransaction> {
      callback("proveTxStarted");
      return httpClientProvider.proveTx(tx, proveTxConfig).finally(() => {
        callback("proveTxDone");
      });
    },
  };
};

export const noopProofClient = <K extends string>(): ProofProvider<K> => {
  return {
    proveTx(): Promise<ProvenTransaction> {
      return Promise.reject(new Error("Proof server not available"));
    },
  };
};

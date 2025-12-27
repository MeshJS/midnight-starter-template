import * as ledger from "@midnight-ntwrk/ledger-v6";
import {
  type MidnightProvider,
  type WalletProvider,
  type BalancedProvingRecipe,
  PrivateStateProvider,
  ZKConfigProvider,
  ProofProvider,
  PublicDataProvider,
} from "@midnight-ntwrk/midnight-js-types";
import { createContext, useCallback, useMemo, useState } from "react";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import { Logger } from "pino";
import type {
  CounterCircuits,
  CounterPrivateStateId,
} from "../api/common-types";
import { CounterProviders } from "../api/common-types";
import { useWallet } from "../../wallet-widget/hooks/useWallet";
import { WrappedPrivateStateProvider } from "../../wallet-widget/utils/ProvidersWrappers/privateStateProvider";
import {
  ActionMessages,
  ProviderAction,
  WrappedPublicDataProvider,
} from "../../wallet-widget/utils/ProvidersWrappers/publicDataProvider";
import { CachedFetchZkConfigProvider } from "../../wallet-widget/utils/ProvidersWrappers/zkConfigProvider";
import {
  noopProofClient,
  proofClient,
} from "../../wallet-widget/utils/ProvidersWrappers/proofClient";

export interface ProvidersState {
  privateStateProvider: PrivateStateProvider<typeof CounterPrivateStateId>;
  zkConfigProvider?: ZKConfigProvider<CounterCircuits>;
  proofProvider: ProofProvider<CounterCircuits>;
  publicDataProvider?: PublicDataProvider;
  walletProvider?: WalletProvider;
  midnightProvider?: MidnightProvider;
  providers?: CounterProviders;
  flowMessage?: string;
}

interface ProviderProps {
  children: React.ReactNode;
  logger: Logger;
}

export const ProvidersContext = createContext<ProvidersState | undefined>(
  undefined
);

export const Provider = ({ children, logger }: ProviderProps) => {
  const [flowMessage, setFlowMessage] = useState<string | undefined>(undefined);

  const { serviceUriConfig, shieldedAddresses, connectedAPI } = useWallet();

  const actionMessages = useMemo<ActionMessages>(
    () => ({
      proveTxStarted: "Proving transaction...",
      proveTxDone: undefined,
      balanceTxStarted: "Signing the transaction with Midnight Lace wallet...",
      balanceTxDone: undefined,
      downloadProverStarted: "Downloading prover key...",
      downloadProverDone: undefined,
      submitTxStarted: "Submitting transaction...",
      submitTxDone: undefined,
      watchForTxDataStarted:
        "Waiting for transaction finalization on blockchain...",
      watchForTxDataDone: undefined,
    }),
    []
  );

  const providerCallback = useCallback(
    (action: ProviderAction): void => {
      setFlowMessage(actionMessages[action]);
    },
    [actionMessages]
  );

  const privateStateProvider: PrivateStateProvider<
    typeof CounterPrivateStateId
  > = useMemo(
    () =>
      new WrappedPrivateStateProvider(
        levelPrivateStateProvider({
          privateStateStoreName: "counter-private-state",
        }),
        logger
      ),
    [logger]
  );

  const publicDataProvider: PublicDataProvider | undefined = useMemo(
    () =>
      serviceUriConfig
        ? new WrappedPublicDataProvider(
            indexerPublicDataProvider(
              serviceUriConfig.indexerUri,
              serviceUriConfig.indexerWsUri
            ),
            providerCallback,
            logger
          )
        : undefined,
    [serviceUriConfig, providerCallback, logger]
  );

  const zkConfigProvider = useMemo(() => {
    if (typeof window === "undefined") {
      // Return undefined (or an appropriate fallback) if running on the server.
      return undefined;
    }
    return new CachedFetchZkConfigProvider<CounterCircuits>(
      `${window.location.origin}/midnight/counter`,
      fetch.bind(window),
      () => {}
    );
  }, []);

  const proofProvider = useMemo(
    () =>
      serviceUriConfig?.proverServerUri
        ? proofClient(serviceUriConfig.proverServerUri, providerCallback)
        : noopProofClient(),
    [serviceUriConfig, providerCallback]
  );

  const walletProvider: WalletProvider = useMemo(
    () =>
      connectedAPI
        ? {
            getCoinPublicKey(): ledger.CoinPublicKey {
              return shieldedAddresses?.shieldedCoinPublicKey as unknown as ledger.CoinPublicKey;
            },
            getEncryptionPublicKey(): ledger.EncPublicKey {
              return shieldedAddresses?.shieldedEncryptionPublicKey as unknown as ledger.EncPublicKey;
            },
            async balanceTx(
              tx: ledger.UnprovenTransaction
            ): Promise<BalancedProvingRecipe> {
              const txString = tx as unknown as string;
              const provingRecipe =
                await connectedAPI.balanceSealedTransaction(txString);
              return provingRecipe as unknown as BalancedProvingRecipe;
            },
          }
        : {
            getCoinPublicKey(): ledger.CoinPublicKey {
              return "";
            },
            getEncryptionPublicKey(): ledger.EncPublicKey {
              return "";
            },
            balanceTx: () => Promise.reject(new Error("readonly")),
          },
    [connectedAPI, providerCallback]
  );

  const midnightProvider: MidnightProvider = useMemo(
    () =>
      connectedAPI
        ? {
            submitTx: (
              tx: ledger.FinalizedTransaction
            ): Promise<ledger.TransactionId> => {
              const txString = tx as unknown as string;
              providerCallback("submitTxStarted");
              connectedAPI
                .submitTransaction(txString)
                .finally(() => providerCallback("submitTxDone"));
              return Promise.resolve("TransactionId");
            },
          }
        : {
            submitTx: (): Promise<ledger.TransactionId> =>
              Promise.reject(new Error("readonly")),
          },
    [connectedAPI, providerCallback]
  );

  const combinedProviders: ProvidersState = useMemo(() => {
    return {
      privateStateProvider,
      publicDataProvider,
      proofProvider,
      zkConfigProvider,
      walletProvider,
      midnightProvider,
      // Only set the nested providers object if publicDataProvider (and others, if needed) are defined.
      providers:
        publicDataProvider && zkConfigProvider
          ? {
              privateStateProvider,
              publicDataProvider,
              zkConfigProvider,
              proofProvider,
              walletProvider,
              midnightProvider,
            }
          : undefined,
      flowMessage,
    };
  }, [
    privateStateProvider,
    publicDataProvider,
    proofProvider,
    zkConfigProvider,
    walletProvider,
    midnightProvider,
    flowMessage,
  ]);

  return (
    <ProvidersContext.Provider value={combinedProviders}>
      {children}
    </ProvidersContext.Provider>
  );
};

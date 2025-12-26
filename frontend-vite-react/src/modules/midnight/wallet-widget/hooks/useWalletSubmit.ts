import { useCallback, useContext, useState } from "react";
import { Transaction } from "@midnight-ntwrk/zswap";
import { WalletContext } from "../contexts";

export const useWalletSubmit = () => {
  const [error, setError] = useState<unknown>();
  const [result, setResult] = useState<string>();
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { hasConnectedWallet, midnightBrowserWalletInstance } =
    useContext(WalletContext);

  const submitTx = useCallback(async (signedTx: Transaction) => {
    setSubmitting(true);
    setError(undefined);

    try {
      if (hasConnectedWallet && midnightBrowserWalletInstance) {
        const txHash = await midnightBrowserWalletInstance.submitTransaction(signedTx);
        setResult(txHash);
      }      
    } catch (error) {
      setError(error);
    }

    setSubmitting(false);
  }, [hasConnectedWallet, midnightBrowserWalletInstance]);

  return {
    error,
    result,
    submitting,
    submitTx,
  };
};
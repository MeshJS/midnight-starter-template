import { useCallback, useContext, useState } from "react";
import { CoinInfo, Transaction } from "@midnight-ntwrk/zswap";
import { WalletContext } from "../contexts";

export const useWalletBalanceProve = () => {
  const [error, setError] = useState<unknown>();
  const [result, setResult] = useState<Transaction>();
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { hasConnectedWallet, midnightBrowserWalletInstance } =
    useContext(WalletContext);

  const submitTx = useCallback(async (tx: Transaction, newCoins: CoinInfo[]) => {
    setSubmitting(true);
    setError(undefined);

    try {
      if (hasConnectedWallet && midnightBrowserWalletInstance) {
        const txHash = await midnightBrowserWalletInstance.balanceAndProveTransaction(tx, newCoins);
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
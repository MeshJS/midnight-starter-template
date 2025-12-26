import { useEffect, useState } from "react";
import { InitialAPI } from "@midnight-ntwrk/dapp-connector-api";
import { MidnightBrowserWallet } from "../api/walletController";

export const useWalletList = () => {
  const [wallets, setWallets] = useState<InitialAPI[]>([]);
  useEffect(() => {
    async function get() {
      setWallets(MidnightBrowserWallet.getAvailableWallets());
    }
    get();
  }, []);

  return wallets;
};
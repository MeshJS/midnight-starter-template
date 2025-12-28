import { useContext } from "react";
import { WalletContext } from "../contexts/wallet";

export const useWallet = () => {
  const {
    connectingWallet,
    open,
    setOpen,
    error,
    initialAPI,
    connectedAPI,
    serviceUriConfig,
    status,
    dustAddress,
    dustBalance,
    shieldedAddresses,
    shieldedBalances,
    unshieldedAddress,
    unshieldedBalances,
    proofServerOnline,
    connectWallet,
    disconnect,
    refresh,
  } = useContext(WalletContext);

  if (connectWallet === undefined || disconnect === undefined) {
    throw new Error(
      "Can't call useWallet outside of the WalletProvider context"
    );
  }

  return {
    connectingWallet,
    open,
    setOpen,
    error,
    initialAPI,
    connectedAPI,
    serviceUriConfig,
    status,
    dustAddress,
    dustBalance,
    shieldedAddresses,
    shieldedBalances,
    unshieldedAddress,
    unshieldedBalances,
    proofServerOnline,
    connectWallet,
    disconnect,
    refresh,
  };
};

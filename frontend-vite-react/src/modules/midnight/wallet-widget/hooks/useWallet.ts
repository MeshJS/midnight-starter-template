import { useContext } from "react";
import { WalletContext } from "../contexts";

export const useWallet = () => {
  const {
    hasConnectedWallet,   
    open,
    setOpen, 
    midnightBrowserWalletInstance,
    connectingWallet,
    connectWallet,
    disconnect,
    setWallet,    
    error,
    address,
    state,
  } = useContext(WalletContext);

  if (connectWallet === undefined || disconnect === undefined) {
    throw new Error(
      "Can't call useWallet outside of the WalletProvider context",
    );
  }

  return {
    hasConnectedWallet,  
    open,
    setOpen,  
    midnightBrowserWalletInstance,
    connectingWallet,
    connectWallet,
    disconnect,
    setWallet,    
    error,
    address,
    state,
  };
};
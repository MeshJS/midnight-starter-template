import { createContext, useCallback, useEffect, useState } from "react";
import { type Logger } from "pino";
import {
  Configuration,
  ConnectedAPI,
  ConnectionStatus,
  InitialAPI,
} from "@midnight-ntwrk/dapp-connector-api";
import { MidnightBrowserWallet } from "../api/walletController";
import {
  DustAddress,
  DustBalance,
  ShieldedAddress,
  ShieldedBalance,
  UnshieldedAddress,
  UnshieldedBalanceDappConnector,
} from "../api/common-types";

interface MidnightMeshProviderProps {
  children: React.ReactNode;
  logger?: Logger;
}

export interface WalletContext {
  connectingWallet: boolean;
  open: boolean;
  setOpen: (value: boolean) => void;
  error?: any | undefined;
  initialAPI: InitialAPI | undefined;
  connectedAPI: ConnectedAPI | undefined;
  serviceUriConfig: Configuration | undefined;
  status: ConnectionStatus | undefined;
  dustAddress: DustAddress | undefined;
  dustBalance: DustBalance | undefined;
  shieldedAddresses: ShieldedAddress | undefined;
  shieldedBalances: ShieldedBalance | undefined;
  unshieldedAddress: UnshieldedAddress | undefined;
  unshieldedBalances: UnshieldedBalanceDappConnector | undefined;
  proofServerOnline: boolean | undefined;
  connectWallet: ((rdns: string, networkID: string) => Promise<void>) | undefined;
  disconnect: () => void;
  refresh: () => void;
}

export const WalletContext = createContext<WalletContext>({
  connectingWallet: false,
  open: false,
  setOpen: () => {},
  error: undefined,
  initialAPI: undefined,
  connectedAPI: undefined,
  serviceUriConfig: undefined,
  status: undefined,
  dustAddress: undefined,
  dustBalance: undefined,
  shieldedAddresses: undefined,
  shieldedBalances: undefined,
  unshieldedAddress: undefined,
  unshieldedBalances: undefined,
  proofServerOnline: undefined,
  connectWallet: undefined,
  disconnect: () => {},
  refresh: () => {},
});

export const MidnightMeshProvider = ({
  children,
  logger,
}: MidnightMeshProviderProps) => {
  const store = useWalletStore(logger);
  return (
    <WalletContext.Provider value={store}>
      <>{children}</>
    </WalletContext.Provider>
  );
};

export const useWalletStore = (logger?: Logger): WalletContext => {
  const [connectingWallet, setConnectingWallet] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<any | undefined>(undefined);
  const [initialAPI, setInitialAPI] = useState<InitialAPI | undefined>(
    undefined
  );
  const [connectedAPI, setConnectedAPI] = useState<ConnectedAPI | undefined>(
    undefined
  );
  const [serviceUriConfig, setServiceUriConfig] = useState<
    Configuration | undefined
  >(undefined);
  const [status, setStatus] = useState<ConnectionStatus | undefined>(undefined);
  const [dustAddress, setDustAddress] = useState<DustAddress | undefined>(
    undefined
  );
  const [dustBalance, setDustBalance] = useState<DustBalance | undefined>(
    undefined
  );
  const [shieldedAddresses, setShieldedAddresses] = useState<
    ShieldedAddress | undefined
  >(undefined);
  const [shieldedBalances, setShieldedBalances] = useState<
    ShieldedBalance | undefined
  >(undefined);
  const [unshieldedAddress, setUnshieldedAddress] = useState<
    UnshieldedAddress | undefined
  >(undefined);
  const [unshieldedBalances, setUnshieldedBalances] = useState<
    UnshieldedBalanceDappConnector | undefined
  >(undefined);
  const [proofServerOnline, setProofServerOnline] = useState<
    boolean | undefined
  >(false);
  const [midnightBrowserWalletInstance, setMidnightBrowserWalletInstance] =
    useState<MidnightBrowserWallet | undefined>(undefined);

  const connectWallet = useCallback(
    async (rdns: string, networkID: string) => {
      setConnectingWallet(true);

      try {
        const midnightBrowserWalletInstance =
          await MidnightBrowserWallet.connectToWallet(rdns, networkID, logger);
        setInitialAPI(midnightBrowserWalletInstance.initialAPI);
        setConnectedAPI(midnightBrowserWalletInstance.connectedAPI);
        setError(undefined);
        setServiceUriConfig(midnightBrowserWalletInstance.serviceUriConfig);
        setStatus(midnightBrowserWalletInstance.status);
        setDustAddress(midnightBrowserWalletInstance.dustAddress);
        setDustBalance(midnightBrowserWalletInstance.dustBalance);
        setShieldedAddresses(midnightBrowserWalletInstance.shieldedAddresses);
        setShieldedBalances(midnightBrowserWalletInstance.shieldedBalances);
        setUnshieldedAddress(midnightBrowserWalletInstance.unshieldedAddress);
        setUnshieldedBalances(midnightBrowserWalletInstance.unshieldedBalances);
        setProofServerOnline(midnightBrowserWalletInstance.proofServerOnline);
        setMidnightBrowserWalletInstance(midnightBrowserWalletInstance);
      } catch (error) {
        setError(error);
      }
      setConnectingWallet(false);
    },
    [logger]
  );

  const disconnect = useCallback(() => {
    MidnightBrowserWallet.deleteMidnightWalletConnected(logger);   
    midnightBrowserWalletInstance?.disconnect();
    setInitialAPI(midnightBrowserWalletInstance?.initialAPI);
    setConnectedAPI(midnightBrowserWalletInstance?.connectedAPI);
    setError(undefined);
    setServiceUriConfig(midnightBrowserWalletInstance?.serviceUriConfig);
    setStatus(midnightBrowserWalletInstance?.status);
    setDustAddress(midnightBrowserWalletInstance?.dustAddress);
    setDustBalance(midnightBrowserWalletInstance?.dustBalance);
    setShieldedAddresses(midnightBrowserWalletInstance?.shieldedAddresses);
    setShieldedBalances(midnightBrowserWalletInstance?.shieldedBalances);
    setUnshieldedAddress(midnightBrowserWalletInstance?.unshieldedAddress);
    setUnshieldedBalances(midnightBrowserWalletInstance?.unshieldedBalances);
    setProofServerOnline(midnightBrowserWalletInstance?.proofServerOnline);    
  }, [logger]);

  const refresh = useCallback(() => {
    if (midnightBrowserWalletInstance === undefined) return;
    midnightBrowserWalletInstance.refresh();
    setServiceUriConfig(midnightBrowserWalletInstance.serviceUriConfig);
    setStatus(midnightBrowserWalletInstance.status);
    setDustAddress(midnightBrowserWalletInstance.dustAddress);
    setDustBalance(midnightBrowserWalletInstance.dustBalance);
    setShieldedAddresses(midnightBrowserWalletInstance.shieldedAddresses);
    setShieldedBalances(midnightBrowserWalletInstance.shieldedBalances);
    setUnshieldedAddress(midnightBrowserWalletInstance.unshieldedAddress);
    setUnshieldedBalances(midnightBrowserWalletInstance.unshieldedBalances);
    setProofServerOnline(midnightBrowserWalletInstance.proofServerOnline);
  }, [logger]);

  useEffect(() => {
    const { rdns, networkID } = MidnightBrowserWallet.getMidnightWalletConnected();
    
    if (rdns && networkID) {     
      connectWallet(rdns, networkID);
    }
  }, [connectWallet]);

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

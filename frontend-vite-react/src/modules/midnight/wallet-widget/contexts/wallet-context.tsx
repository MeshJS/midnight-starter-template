import { createContext, useCallback, useEffect, useState } from 'react';
import { type Logger } from 'pino';
import { MidnightBrowserWallet } from '@meshsdk/midnight-wallet';
import { Configuration } from '@midnight-ntwrk/dapp-connector-api';

export enum WalletState {
  NOT_CONNECTED = 'NOT_CONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
}

const INITIAL_STATE = {
  walletName: undefined,
  midnightBrowserWalletInstance: undefined,
};

export const WalletContext = createContext<WalletContext>({
  hasConnectedWallet: false,
  open: false,
  setOpen: () => {},
  midnightBrowserWalletInstance: INITIAL_STATE.midnightBrowserWalletInstance,  
  connectingWallet: false,
  connectWallet: async () => {},
  disconnect: () => {},
  setWallet: async () => {},  
  state: WalletState.NOT_CONNECTED,
  walletName: undefined,
  address: undefined,
  coinPublicKey: undefined,
  encryptionPublicKey: undefined,
  uris: undefined,
  isProofServerOnline: false,
});

export interface WalletContext {
  hasConnectedWallet: boolean;
  open: boolean;
  setOpen: (value: boolean) => void;
  midnightBrowserWalletInstance: MidnightBrowserWallet | undefined;  
  connectingWallet: boolean;
  connectWallet: (walletName: string, persist?: boolean) => Promise<void>;
  disconnect: () => void;
  setWallet: (midnightBrowserWalletInstance: MidnightBrowserWallet, walletName: string) => void;
  error?: unknown;  
  state: WalletState;
  walletName: string | undefined;
  address: string | undefined;
  coinPublicKey: string | undefined;
  encryptionPublicKey: string | undefined;
  uris: Configuration | undefined;
  isProofServerOnline: boolean;
}

export const useWalletStore = (logger?: Logger): WalletContext => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<any | undefined>(undefined);
  const [state, setState] = useState<WalletState>(WalletState.NOT_CONNECTED);
  const [connectingWallet, setConnectingWallet] = useState<boolean>(false);
  const [midnightBrowserWalletInstance, setMidnightBrowserWalletInstance] = useState<MidnightBrowserWallet | undefined>(
    INITIAL_STATE.midnightBrowserWalletInstance,
  );
  const [address, setAddress] = useState<string | undefined>('');
  const [coinPublicKey, setCoinPublicKey] = useState<string>();
  const [encryptionPublicKey, setEncryptionPublicKey] = useState<string | undefined>(undefined);
  const [walletName, setWaName] = useState<string | undefined>(undefined);
  const [uris, setUris] = useState<Configuration | undefined>(undefined);
  const [isProofServerOnline, setIsProofServerOnline] = useState<boolean>(false);

  const connectWallet = useCallback(
    async (walletName: string) => {
      setConnectingWallet(true);
      setState(WalletState.CONNECTING);

      try {
        const midnightBrowserWalletInstance = await MidnightBrowserWallet.connectToWallet(walletName, logger);
        setMidnightBrowserWalletInstance(midnightBrowserWalletInstance);
        setError(undefined);
        setAddress(midnightBrowserWalletInstance._address);
        setCoinPublicKey(midnightBrowserWalletInstance._coinPublicKey);
        setEncryptionPublicKey(midnightBrowserWalletInstance._encryptionPublicKey);
        setWaName(midnightBrowserWalletInstance._walletName);
        setUris(midnightBrowserWalletInstance._uris);
        setIsProofServerOnline(midnightBrowserWalletInstance._proofServerOnline);

        setState(WalletState.CONNECTED);
      } catch (error) {
        setError(error);
        setState(WalletState.NOT_CONNECTED);
        setMidnightBrowserWalletInstance(INITIAL_STATE.midnightBrowserWalletInstance);
        setAddress(undefined);
        setCoinPublicKey(undefined);
        setEncryptionPublicKey(undefined);
        setWaName(undefined);
        setUris(undefined);
      }

      setConnectingWallet(false);
    },
    [logger],
  );

  const disconnect = useCallback(() => {
    setMidnightBrowserWalletInstance(INITIAL_STATE.midnightBrowserWalletInstance);
    setState(WalletState.NOT_CONNECTED);
    setAddress(undefined);
    setCoinPublicKey(undefined);
    setEncryptionPublicKey(undefined);
    setWaName(undefined);
    setUris(undefined);
    MidnightBrowserWallet.deleteMidnightWalletConnected(logger);
  }, [logger]);

  const setWallet = useCallback(async (midnightBrowserWalletInstance: MidnightBrowserWallet) => {
    setMidnightBrowserWalletInstance(midnightBrowserWalletInstance);
    setAddress(midnightBrowserWalletInstance._address);
    setCoinPublicKey(midnightBrowserWalletInstance._coinPublicKey);
    setEncryptionPublicKey(midnightBrowserWalletInstance._encryptionPublicKey);
    setWaName(midnightBrowserWalletInstance._walletName);
    setUris(midnightBrowserWalletInstance._uris);
    setIsProofServerOnline(midnightBrowserWalletInstance._proofServerOnline);
    setState(WalletState.CONNECTED);
  }, []);

  // after connected
  useEffect(() => {
    async function load() {
      if (midnightBrowserWalletInstance && address === undefined) {
        const address = midnightBrowserWalletInstance._address;
        setAddress(address);
      }
    }
    load();
  }, [midnightBrowserWalletInstance, address]);

  // if persist
  useEffect(() => {
    const walletName = MidnightBrowserWallet.getMidnightWalletConnected();
    if (walletName) {
      connectWallet(walletName);
    }
  }, [connectWallet]);

  return {
    hasConnectedWallet: INITIAL_STATE.walletName !== walletName,
    open, 
    setOpen,
    midnightBrowserWalletInstance,    
    connectingWallet,
    connectWallet,
    disconnect,
    setWallet,
    error,    
    state,
    walletName,
    address,
    coinPublicKey,
    encryptionPublicKey,
    uris,
    isProofServerOnline
  };
};
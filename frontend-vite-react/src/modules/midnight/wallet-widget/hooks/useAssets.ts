import { useContext } from 'react';

import { WalletContext } from '../contexts';

export const useAssets = () => {

  const { address, coinPublicKey, encryptionPublicKey, uris, walletName, isProofServerOnline, hasConnectedWallet } = useContext(WalletContext); 

  return { address, coinPublicKey, encryptionPublicKey, uris, walletName, isProofServerOnline, hasConnectedWallet };
};
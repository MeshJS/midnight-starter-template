import { useContext } from 'react';
import { DeployedProviderContext, type DeployedAPIProvider } from '../contexts';

export const useDeployedContracts = (): DeployedAPIProvider => {
  const context = useContext(DeployedProviderContext);

  if (!context) {
    throw new Error('A wallet and Provider context is required.');
  }

  return context;
};

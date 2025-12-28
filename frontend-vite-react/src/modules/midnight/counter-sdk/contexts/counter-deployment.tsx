import type { PropsWithChildren } from 'react';
import { createContext, useMemo } from 'react';
import { type Logger } from 'pino';

import type { DeployedAPIProvider } from './counter-deployment-class';
import { useLocalState } from '../hooks/use-localStorage';
import { DeployedTemplateManager } from './counter-deployment-class';

import { ContractAddress } from '@midnight-ntwrk/compact-runtime';
import { useProviders } from '../hooks/use-providers';

export const DeployedProviderContext = createContext<DeployedAPIProvider | undefined>(undefined);

export type DeployedProviderProps = PropsWithChildren<{
  logger: Logger;  
  contractAddress: ContractAddress;
}>;

export const DeployedProvider = ({ logger, contractAddress, children }: DeployedProviderProps) => {
  const localState = useLocalState();
  const providers = useProviders();
  const manager = useMemo(() => {
    return new DeployedTemplateManager(logger, localState, contractAddress, providers?.providers);
  }, [logger, localState, providers?.providers]);

  return (
    <DeployedProviderContext.Provider value={manager}>
      {children}
    </DeployedProviderContext.Provider>
  );
};

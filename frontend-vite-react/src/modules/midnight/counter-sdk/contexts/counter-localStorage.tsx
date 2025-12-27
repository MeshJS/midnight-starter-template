import { createContext, useMemo } from 'react';
import { type Logger } from 'pino';
import { LocalStorage, LocalStorageProps } from './counter-localStorage-class';

export const LocalStorageContext = createContext<LocalStorageProps | undefined>(undefined);

export interface LocalStorageProviderProps {
  children: React.ReactNode;
  logger: Logger;
}

export const LocalStorageProvider = ({ children, logger }: LocalStorageProviderProps) => {
  const localStorageInstance = useMemo(() => new LocalStorage(logger), [logger]);

  return (
    <LocalStorageContext.Provider value={localStorageInstance}>
      {children}
    </LocalStorageContext.Provider>
  );
};

import { useWalletStore, WalletContext } from "./wallet-context";
import { type Logger } from "pino";
export { WalletContext } from "./wallet-context";

interface MidnightMeshProviderProps {
  children: React.ReactNode;
  logger?: Logger;
}

export const MidnightMeshProvider = ({children, logger}: MidnightMeshProviderProps) => {
  const store = useWalletStore(logger);
  return (
    <WalletContext.Provider value={store}>
      <>{children}</>
    </WalletContext.Provider>
  );
};
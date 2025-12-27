import { BrowserRouter, Route, Routes } from "react-router-dom";
import * as pino from "pino";
import {
  setNetworkId,
} from "@midnight-ntwrk/midnight-js-network-id";
import { MainLayout } from "./layouts/layout";
import { Home } from "./pages/home/";
import { Counter } from "./pages/counter";
import { WalletUI } from "./pages/wallet-ui";
import { ThemeProvider } from "./components/theme-provider";
import { MidnightMeshProvider } from "./modules/midnight/wallet-widget/contexts/wallet";
import { CounterAppProvider } from "./modules/midnight/counter-sdk/contexts";

export const logger = pino.pino({
  level: "trace",
});
// Update this network id, could be testnet or undeployed
// const networkId = process.env.VITE_NETWORKID!;
setNetworkId("preview");
// Update this with your deployed contract address
const contractAddress = process.env.CONTRACT_ADDRESS!; 
export const MIDNIGHT_STORAGE_PASSWORD="your-secure-password-here" 

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <MidnightMeshProvider logger={logger}>
        <CounterAppProvider logger={logger} contractAddress={contractAddress}>
          <BrowserRouter basename="/">
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/wallet-ui" element={<WalletUI />} />
                <Route path="/counter" element={<Counter />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CounterAppProvider>
      </MidnightMeshProvider>
    </ThemeProvider>
  );
}

export default App;

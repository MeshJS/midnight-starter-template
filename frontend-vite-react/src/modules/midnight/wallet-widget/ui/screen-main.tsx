import { useWallet } from "../hooks/useWallet";
import { useWalletList } from "../hooks/useWalletList";
import { walletsListFormat } from "./common/common-values";
import { TooltipProvider } from "./common/tooltip";
import WalletIcon from "./wallet-icon";

export default function ScreenMain({ selectedNetwork, setOpen }: { selectedNetwork: string; setOpen: Function }) {
  const wallets = useWalletList();
  const { connectWallet } = useWallet();

  return (
    <TooltipProvider>
      <div
        className="grid gap-4 py-7 place-items-center gap-y-8"
        style={{
          gridTemplateColumns: `repeat(${wallets.length}, minmax(0, 1fr))`,
        }}
      >
        {wallets.map((wallet, index) => {
          const config = walletsListFormat[wallet.name];
          if (!config) return null; // Skip rendering if config is not found
          const walletKey = config.key;
          const displayName = config.displayName;
          const icon = config.icon;

          return (
            <WalletIcon
              key={index}
              iconReactNode={icon}
              name={displayName}
              action={() => {
                connectWallet(walletKey, selectedNetwork);
                setOpen(false);
              }}
            />
          );
        })}
      </div>
    </TooltipProvider>
  );
}


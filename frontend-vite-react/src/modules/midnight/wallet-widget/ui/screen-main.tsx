import { useWallet } from "../hooks/useWallet";
import { useWalletList } from "../hooks/useWalletList";
import IconLace from "./common/icons/icon-lace";
import { TooltipProvider } from "./common/tooltip";
import WalletIcon from "./wallet-icon";
import { type JSX } from "react";

export default function ScreenMain({
  setOpen,
}: {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  setOpen: Function;
}) {
  const wallets = useWalletList();
  const { connectWallet } = useWallet();

  // Example config map for wallet overrides
  const walletsConfig: {
    [key: string]: { key: string; displayName: string; icon: JSX.Element };
  } = {
    lace: { key: "mnLace", displayName: "LACE", icon: <IconLace /> },
  };

  return (
    <TooltipProvider>
      <div
        className="grid gap-4 py-7 place-items-center gap-y-8"
        style={{
          gridTemplateColumns: `repeat(${wallets.length}, minmax(0, 1fr))`,
        }}
      >
        {wallets.map((wallet, index) => {
          const config = walletsConfig[wallet.name];
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
                connectWallet(walletKey);
                setOpen(false);
              }}
            />
          );
        })}
      </div>
    </TooltipProvider>
  );
}

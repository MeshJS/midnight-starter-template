import IconLace from '../common/icons/icon-lace';
import { TooltipProvider } from '../common/tooltip';
import { useWallet, useWalletList } from '@meshsdk/midnight-react';
import WalletIcon from './wallet-icon';
import { type JSX, useState } from 'react';
import { ensureMidnightEnabled } from '../../provider';

export default function ScreenMain({
  setOpen,
}: {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  setOpen: Function;
}) {
  const wallets = useWalletList();
  const { connectWallet } = useWallet();
  const [connectError, setConnectError] = useState<string | null>(null);
  const [pendingWallet, setPendingWallet] = useState<string | null>(null);

  const walletsConfig: { [key: string]: { key: string; displayName: string; icon: JSX.Element } } = {
    lace: { key: 'mnLace', displayName: 'LACE', icon: <IconLace /> },
    mnLace: { key: 'mnLace', displayName: 'LACE', icon: <IconLace /> },
  };

  const makeFallbackIcon = (label: string) => (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
      {label.slice(0, 2).toUpperCase()}
    </span>
  );

  const handleConnect = async (walletKey: string, label: string) => {
    try {
      setConnectError(null);
      setPendingWallet(label);
      await ensureMidnightEnabled();
      await connectWallet(walletKey);
      setOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to connect wallet';
      setConnectError(message);
      console.error('Midnight wallet connect error:', error);
    } finally {
      setPendingWallet(null);
    }
  };

  if (wallets.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-slate-300">
        No compatible Midnight wallets found. Install the Lace browser wallet (Midnight
        edition) and refresh. Double-check you are on Chrome 119+ and using the Midnight
        testnet profile.
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="grid gap-4 py-7 place-items-center gap-y-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {wallets.map((wallet, index) => {
          const config = walletsConfig[wallet.name] ?? {
            key: wallet.name,
            displayName: wallet.name,
            icon: makeFallbackIcon(wallet.name),
          };

          return (
            <WalletIcon
              key={index}
              iconReactNode={config.icon}
              name={config.displayName}
              loading={pendingWallet === config.displayName}
              action={() => handleConnect(config.key, config.displayName)}
            />
          );
        })}
      </div>
      {connectError && (
        <p className="px-4 pb-4 text-center text-xs text-red-300">
          {connectError}
        </p>
      )}
    </TooltipProvider>
  );
}

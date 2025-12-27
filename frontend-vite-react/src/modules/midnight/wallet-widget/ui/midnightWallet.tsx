import { Button } from "./common/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./common/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./common/dropdown-menu";
import { ChevronDown, Network } from "lucide-react";
import { networkID } from "./common/common-values";
import ConnectedButton from "./connected-button";
import ScreenMain from "./screen-main";
import { useWallet } from "../hooks/useWallet";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { MidnightBrowserWallet } from "../api/walletController";

export const MidnightWallet = () => {
  const { open, setOpen, status } = useWallet();
  const [selectedNetwork, setSelectedNetwork] = useState(networkID.PREVIEW);

  useEffect(() => {
    const networkID = MidnightBrowserWallet.getMidnightWalletConnected()
      .networkID;
    if (networkID === null) return;     
    setSelectedNetwork(networkID as SetStateAction<networkID>);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div>
        {status?.status === undefined ? (
          <DialogTrigger asChild>
            <Button variant="outline" className="">
              Connect Wallet
            </Button>
          </DialogTrigger>
        ) : (
          <ConnectedButton />
        )}
      </div>

      <DialogContent
        className="sm:max-w-[425px] justify-center items-center"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <Header
          selectedNetwork={selectedNetwork}
          setSelectedNetwork={setSelectedNetwork}
        />
        <ScreenMain setOpen={setOpen} selectedNetwork={selectedNetwork} />
        <Footer />
      </DialogContent>
    </Dialog>
  );
};

function Header({
  selectedNetwork,
  setSelectedNetwork,
}: {
  selectedNetwork: string;
  setSelectedNetwork: Dispatch<SetStateAction<networkID>>;
}) {
  const getInitials = (network: string) => {
    if (network === "preprod") return "PROD";
    return network.substring(0, 4).toUpperCase();
  };
  return (
    <DialogHeader className="pb-4 space-y-3">
      <DialogTitle className="text-lg font-semibold text-center">
        Connect Wallet
      </DialogTitle>

      <div className="flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs font-medium"
            >
              <Network className="h-3 w-3 mr-1" />
              {getInitials(selectedNetwork)}
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="min-w-[140px]">
            {Object.values(networkID).map((network) => (
              <DropdownMenuItem
                key={network}
                onClick={() => setSelectedNetwork(network)}
                className={selectedNetwork === network ? "bg-accent" : ""}
              >
                {network}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </DialogHeader>
  );
}

function Footer() {
  return (
    <DialogFooter className="justify-center text-sm">
      <a
        href="https://meshjs.dev/"
        target="_blank"
        className="flex gap-1 items-center justify-center text-accent-foreground hover:text-zinc-500 fill-foreground hover:fill-zinc-500 dark:hover:text-orange-200 dark:hover:fill-zinc-200"
      >
        <span className="">Powered by</span>
        <svg
          width={22}
          height={22}
          enableBackground="new 0 0 300 200"
          viewBox="0 0 300 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="m289 127-45-60-45-60c-.9-1.3-2.4-2-4-2s-3.1.7-4 2l-37 49.3c-2 2.7-6 2.7-8 0l-37-49.3c-.9-1.3-2.4-2-4-2s-3.1.7-4 2l-45 60-45 60c-1.3 1.8-1.3 4.2 0 6l45 60c.9 1.3 2.4 2 4 2s3.1-.7 4-2l37-49.3c2-2.7 6-2.7 8 0l37 49.3c.9 1.3 2.4 2 4 2s3.1-.7 4-2l37-49.3c2-2.7 6-2.7 8 0l37 49.3c.9 1.3 2.4 2 4 2s3.1-.7 4-2l45-60c1.3-1.8 1.3-4.2 0-6zm-90-103.3 32.5 43.3c1.3 1.8 1.3 4.2 0 6l-32.5 43.3c-2 2.7-6 2.7-8 0l-32.5-43.3c-1.3-1.8-1.3-4.2 0-6l32.5-43.3c2-2.7 6-2.7 8 0zm-90 0 32.5 43.3c1.3 1.8 1.3 4.2 0 6l-32.5 43.3c-2 2.7-6 2.7-8 0l-32.5-43.3c-1.3-1.8-1.3-4.2 0-6l32.5-43.3c2-2.7 6-2.7 8 0zm-53 152.6-32.5-43.3c-1.3-1.8-1.3-4.2 0-6l32.5-43.3c2-2.7 6-2.7 8 0l32.5 43.3c1.3 1.8 1.3 4.2 0 6l-32.5 43.3c-2 2.7-6 2.7-8 0zm90 0-32.5-43.3c-1.3-1.8-1.3-4.2 0-6l32.5-43.3c2-2.7 6-2.7 8 0l32.5 43.3c1.3 1.8 1.3 4.2 0 6l-32.5 43.3c-2 2.7-6 2.7-8 0zm90 0-32.5-43.3c-1.3-1.8-1.3-4.2 0-6l32.5-43.3c2-2.7 6-2.7 8 0l32.5 43.3c1.3 1.8 1.3 4.2 0 6l-32.5 43.3c-2 2.7-6 2.7-8 0z" />
        </svg>
        <span className="">Mesh SDK</span>
      </a>
    </DialogFooter>
  );
}

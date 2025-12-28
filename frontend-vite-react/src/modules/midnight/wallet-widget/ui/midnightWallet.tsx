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
    const networkID =
      MidnightBrowserWallet.getMidnightWalletConnected().networkID;
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
        className="sm:max-w-[425px] justify-center items-center border-2 border-white dark:border-gray-800"
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
      <div className="flex gap-1 items-center justify-center">
        <span className="text-accent-foreground">Powered by</span>
        <a
          href="https://meshjs.dev/"
          target="_blank"
          className="flex items-center gap-1 text-accent-foreground hover:text-zinc-500 fill-foreground hover:fill-zinc-500 dark:hover:text-orange-200 dark:hover:fill-zinc-200"
        >
          <img
            src="/meshlogo-with-title-white.svg"
            alt="Mesh"
            className="h-4 dark:block hidden object-contain"
            style={{ width: "auto" }}
          />
          <img
            src="/meshlogo-with-title-black.svg"
            alt="Mesh"
            className="h-4 dark:hidden block object-contain"
            style={{ width: "auto" }}
          />
        </a>
        <span className="mx-1 text-accent-foreground">&</span>
        <a
          href="https://eddalabs.io/"
          target="_blank"
          className="flex items-center gap-1 text-accent-foreground hover:text-zinc-500 fill-foreground hover:fill-zinc-500 dark:hover:text-orange-200 dark:hover:fill-zinc-200"
        >
          <img
            src="/transparent-logo-white.svg"
            alt="Edda Labs"
            className="h-3 dark:block hidden object-contain"
            style={{ width: "auto" }}
          />
          <img
            src="/transparent-logo-black.svg"
            alt="Edda Labs"
            className="h-3 dark:hidden block object-contain"
            style={{ width: "auto" }}
          />
        </a>
      </div>
    </DialogFooter>
  );
}

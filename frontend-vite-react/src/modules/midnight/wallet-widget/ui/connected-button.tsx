import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./common/dropdown-menu";
import { Button } from "./common/button";
import { useWallet } from "../hooks/useWallet";

export default function ConnectedButton() {
  const { disconnect, unshieldedAddress } = useWallet();  

  return (
    <>
      {unshieldedAddress && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {unshieldedAddress.unshieldedAddress.slice(0, 4)}...{unshieldedAddress.unshieldedAddress.slice(-4)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(unshieldedAddress.unshieldedAddress);
              }}
            >
              Copy Address
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                disconnect();
              }}
            >
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
}

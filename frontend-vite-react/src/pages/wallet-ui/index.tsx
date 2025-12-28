import { ModeToggle } from "@/components/mode-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link2, Server, Wifi, WifiOff, Wallet } from "lucide-react";
import { MidnightWallet } from "@/modules/midnight/wallet-widget/ui/midnightWallet";
import { useWallet } from "@/modules/midnight/wallet-widget/hooks/useWallet";

export function WalletUI() {
  const {
    disconnect,
    setOpen,
    refresh,
    status,
    proofServerOnline,
    initialAPI,
    unshieldedAddress,
    shieldedAddresses,
    serviceUriConfig,
    dustAddress,
    dustBalance,
    unshieldedBalances,
  } = useWallet();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Wallet Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your wallet and view connection details
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Wallet Management
              </CardTitle>
              <CardDescription>
                Connect your wallet and view addresses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex  gap-6">
                <div className="flex-1 flex items-center justify-center">
                  <MidnightWallet />
                </div>
                <div className="flex flex-col gap-2 border-l pl-4">
                  <h4 className="text-xs font-medium text-muted-foreground mb-1">
                    Actions
                  </h4>
                  <Button
                    variant="outline"
                    onClick={disconnect}
                    className="gap-2 h-7 text-xs w-full"
                  >
                    <Link2 className="h-3 w-3" />
                    Disconnect
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setOpen(true)}
                    className="gap-2 h-7 text-xs w-full"
                  >
                    <Wallet className="h-3 w-3" />
                    Open
                  </Button>
                  <Button
                    variant="outline"
                    onClick={refresh}
                    className="gap-2 h-7 text-xs w-full"
                  >
                    <Wallet className="h-3 w-3" />
                    Refresh
                  </Button>
                </div>
              </div>
              <div className="border-t pt-4 space-y-4">
                <h4 className="text-sm font-medium">Wallet Information</h4>

                <div className="space-y-2">
                  <div className="bg-muted px-3 py-2 rounded-md">
                    <div className="text-xs text-muted-foreground mb-1">
                      Unshielded Address
                    </div>
                    <div className="text-sm font-mono break-all">
                      {unshieldedAddress?.unshieldedAddress || "Not connected"}
                    </div>
                  </div>

                  <div className="bg-muted px-3 py-2 rounded-md">
                    <div className="text-xs text-muted-foreground mb-1">
                      Shielded Address
                    </div>
                    <div className="text-sm font-mono break-all">
                      {shieldedAddresses?.shieldedAddress || "Not connected"}
                    </div>
                  </div>

                  <div className="bg-muted px-3 py-2 rounded-md">
                    <div className="text-xs text-muted-foreground mb-1">
                      Coin Public Key
                    </div>
                    <div className="text-sm font-mono break-all">
                      {shieldedAddresses?.shieldedCoinPublicKey ||
                        "Not connected"}
                    </div>
                  </div>

                  <div className="bg-muted px-3 py-2 rounded-md">
                    <div className="text-xs text-muted-foreground mb-1">
                      Encryption Public Key
                    </div>
                    <div className="text-sm font-mono break-all">
                      {shieldedAddresses?.shieldedEncryptionPublicKey ||
                        "Not connected"}
                    </div>
                  </div>

                  <div className="bg-muted px-3 py-2 rounded-md">
                    <div className="text-xs text-muted-foreground mb-1">
                      Dust Address
                    </div>
                    <div className="text-sm font-mono break-all">
                      {dustAddress?.dustAddress || "Not connected"}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-muted px-3 py-2 rounded-md">
                      <div className="text-xs text-muted-foreground mb-1">
                        Dust Balance
                      </div>
                      <div className="text-sm font-mono">
                        {dustBalance?.balance
                          ? Math.floor(
                              Number(dustBalance.balance) / 1000000000000000
                            ).toLocaleString()
                          : "Not connected"}
                      </div>
                    </div>
                    <div className="bg-muted px-3 py-2 rounded-md">
                      <div className="text-xs text-muted-foreground mb-1">
                        Dust Cap
                      </div>
                      <div className="text-sm font-mono">
                        {dustBalance?.cap
                          ? Math.floor(
                              Number(dustBalance.cap) / 1000000000000000
                            ).toLocaleString()
                          : "Not connected"}
                      </div>
                    </div>
                    <div className="bg-muted px-3 py-2 rounded-md">
                      <div className="text-xs text-muted-foreground mb-1">
                        Night Balance
                      </div>
                      <div className="text-sm font-mono space-y-1">
                        {unshieldedBalances
                          ? Object.entries(unshieldedBalances).map(
                              ([token, balance]) => (
                                <div
                                  key={token}
                                  className="flex justify-between"
                                >
                                  <span>
                                    {Math.floor(
                                      Number(balance) / 1000000
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              )
                            )
                          : "Not connected"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Connection Details Only */}
        <Card className="border-border h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Connection Details
            </CardTitle>
            <CardDescription>Network and connection status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Wallet Status</h3>
                <div className="flex items-center gap-2 text-sm">
                  <div
                    className={`h-2 w-2 rounded-full ${status?.status ? "bg-green-500" : "bg-gray-500"}`}
                  />
                  {status?.status === "connected"
                    ? "Connected"
                    : "Disconnected"}
                </div>
                {status?.status === "connected" && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground ml-4">
                    <Server className="h-3 w-3" />
                    Network: {status?.networkId}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground ml-4">
                  <Wallet className="h-3 w-3" />
                  Wallet Name: {initialAPI?.name || "Not connected"}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Proof Server</h3>
              <div className="flex items-center gap-2 text-sm">
                {proofServerOnline ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-500" />
                    <span>Offline</span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Network Endpoints</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Server className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-50" />
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Substrate Node
                    </div>
                    <div className="truncate">
                      {serviceUriConfig?.substrateNodeUri || "Not available"}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Server className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-50" />
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Indexer (REST)
                    </div>
                    <div className="truncate">
                      {serviceUriConfig?.indexerUri || "Not available"}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Server className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-50" />
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Indexer (WebSocket)
                    </div>
                    <div className="truncate">
                      {serviceUriConfig?.indexerWsUri || "Not available"}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Server className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-50" />
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Proof Server
                    </div>
                    <div className="truncate">
                      {serviceUriConfig?.proverServerUri || "Not available"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

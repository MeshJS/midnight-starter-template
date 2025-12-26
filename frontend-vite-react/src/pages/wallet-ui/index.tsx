import { ModeToggle } from "@/components/mode-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link2, Server, Wifi, WifiOff, Wallet, Key } from "lucide-react";
import { MidnightWallet } from "@/modules/midnight/wallet-widget/ui";
import { useWallet } from "@/modules/midnight/wallet-widget/hooks/useWallet";

export function WalletUI() { 
  const { connectingWallet, disconnect, setOpen, connectWallet, status, proofServerOnline, initialAPI, unshieldedAddress, shieldedAddresses, serviceUriConfig } = useWallet();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet Dashboard</h1>
          <p className="text-muted-foreground">Manage your wallet and view connection details</p>
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
                Wallet Widget
              </CardTitle>
              <CardDescription>Interact with your wallet</CardDescription>
            </CardHeader>
            <CardContent>
              <MidnightWallet />
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Wallet Actions</CardTitle>
              <CardDescription>Manage your wallet connection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline" 
                  onClick={disconnect}
                  className="gap-2"
                >
                  <Link2 className="h-4 w-4" />
                  Disconnect
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setOpen(true)}
                  className="gap-2"
                >
                  <Wallet className="h-4 w-4" />
                  Open Wallet
                </Button>
                <Button 
                  onClick={() => connectWallet("mnLace")}
                  className="gap-2"
                >
                  <Wallet className="h-4 w-4" />
                  Connect Lace
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <Card className="border-border h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Connection Details
            </CardTitle>
            <CardDescription>Your wallet and network information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Wallet Status</h3>
              <div className="flex items-center gap-2 text-sm">
                <div className={`h-2 w-2 rounded-full ${status?.status ? 'bg-green-500' : 'bg-gray-500'}`} />
                {status?.status === "connected" ? 'Connected' : 'Disconnected'}
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
              <h3 className="text-sm font-medium">Wallet Name</h3>
              <div className="bg-muted px-3 py-2 rounded-md text-sm font-mono">
                {initialAPI?.name || 'Not connected'}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Unshielded Address</h3>
              <div className="bg-muted px-3 py-2 rounded-md text-sm font-mono break-all">
                {unshieldedAddress?.unshieldedAddress || 'Not connected'}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Shielded Address</h3>
              <div className="bg-muted px-3 py-2 rounded-md text-sm font-mono break-all">
                {shieldedAddresses?.shieldedAddress || 'Not connected'}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Connection Status</h3>
              <div className="flex items-center gap-2 text-sm">
                <div className={`h-2 w-2 rounded-full ${connectingWallet ? 'bg-yellow-500' : 'bg-gray-500'}`} />
                {connectingWallet ? 'Connecting...' : 'Idle'}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Coin Public Key</h3>
              <div className="bg-muted px-3 py-2 rounded-md text-sm font-mono break-all">
                {shieldedAddresses?.shieldedCoinPublicKey || 'Not connected'}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Encryption Public Key</h3>
              <div className="bg-muted px-3 py-2 rounded-md text-sm font-mono break-all">
                {shieldedAddresses?.shieldedEncryptionPublicKey || 'Not connected'}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Network Endpoints</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Server className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-50" />
                  <div>
                    <div className="text-xs text-muted-foreground">Substrate Node</div>
                    <div className="truncate">{serviceUriConfig?.substrateNodeUri || 'Not available'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Server className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-50" />
                  <div>
                    <div className="text-xs text-muted-foreground">Indexer (REST)</div>
                    <div className="truncate">{serviceUriConfig?.indexerUri || 'Not available'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Server className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-50" />
                  <div>
                    <div className="text-xs text-muted-foreground">Indexer (WebSocket)</div>
                    <div className="truncate">{serviceUriConfig?.indexerWsUri || 'Not available'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Server className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-50" />
                  <div>
                    <div className="text-xs text-muted-foreground">Proof Server</div>
                    <div className="truncate">{serviceUriConfig?.proverServerUri || 'Not available'}</div>
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

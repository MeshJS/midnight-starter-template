import { Loading } from "@/components/loading";
import { useEffect, useState } from "react";
import { RefreshCw, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";
import { useContractSubscription } from "@/modules/midnight/counter-sdk/hooks/use-contract-subscription";

export const Counter = () => {
  const { deployedContractAPI, derivedState, onDeploy, providers } =
    useContractSubscription();
  const [deployedAddress, setDeployedAddress] = useState<string | undefined>(
    undefined
  );
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    if (derivedState?.round !== undefined) {
      setAppLoading(false);
    }
  }, [derivedState?.round]);

  const deployNew = async () => {
    const { address } = await onDeploy();
    setDeployedAddress(address);
  };

  const increment = async () => {
    if (deployedContractAPI) {
      await deployedContractAPI.increment();
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      {appLoading && <Loading />}
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold text-foreground mb-2">Counter Contract</h1>
            <p className="text-xl text-muted-foreground">Interact with the counter smart contract</p>
          </div>
          <div className="hidden md:block">
            <ModeToggle />
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlusCircle className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Counter Contract</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              Deploy and interact with a simple counter smart contract
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={deployNew} className="gap-2">
                  <PlusCircle className="w-5 h-5" />
                  <span>Deploy New Contract</span>
                </Button>
              </div>

              {deployedAddress && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Deployed Contract</p>
                  <p className="text-sm font-mono break-all">{deployedAddress}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Counter Value</p>
                    <p className="text-2xl font-bold">{derivedState?.round || '0'}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Private Data</p>
                    <p className="text-2xl font-bold">{derivedState?.privateState.privateCounter || '0'}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Turns</p>
                    <p className="text-sm font-mono break-all">{derivedState?.turns.increment || 'idle'}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Contract Address</p>
                    <p className="text-sm font-mono break-all">{deployedContractAPI?.deployedContractAddress || 'Not deployed'}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center mt-6">
                <Button
                  onClick={increment}
                  disabled={!deployedContractAPI}
                  variant={deployedContractAPI ? "default" : "secondary"}
                  className="gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Increment Counter</span>
                </Button>
              </div>

              {providers?.flowMessage && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{providers.flowMessage}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

import {
  ConnectedAPI,
  InitialAPI,
  Configuration,
  ConnectionStatus,
} from "@midnight-ntwrk/dapp-connector-api";
import { pipe as fnPipe } from "fp-ts/lib/function.js";
import { type Logger } from "pino";
import {
  catchError,
  concatMap,
  filter,
  firstValueFrom,
  interval,
  map,
  take,
  tap,
  throwError,
  timeout,
} from "rxjs";

import {
  DustAddress,
  DustBalance,
  ShieldedAddress,
  ShieldedBalance,
  UnshieldedAddress,
  UnshieldedBalanceDappConnector,
} from "./common-types";
import { checkProofServerStatus } from "../utils/proofServer/utils";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";

declare global {
  interface Window {
    midnight?: { [key: string]: InitialAPI };
  }
}

export class MidnightBrowserWallet {
  private constructor(
    public initialAPI: InitialAPI | undefined,
    public connectedAPI: ConnectedAPI | undefined,
    public serviceUriConfig: Configuration | undefined,
    public status: ConnectionStatus | undefined,
    public dustAddress: DustAddress | undefined,
    public dustBalance: DustBalance | undefined,
    public shieldedAddresses: ShieldedAddress | undefined,
    public shieldedBalances: ShieldedBalance | undefined,
    public unshieldedAddress: UnshieldedAddress | undefined,
    public unshieldedBalances: UnshieldedBalanceDappConnector | undefined,
    public proofServerOnline: boolean = false,
    public logger?: Logger
  ) {}

  static getAvailableWallets(): InitialAPI[] {
    if (window === undefined) return [];
    if (window.midnight === undefined) return [];

    const wallets: InitialAPI[] = [];
    for (const key in window.midnight) {
      try {
        const _wallet = window.midnight[key];
        if (_wallet === undefined) continue;
        if (_wallet.name === undefined) continue;
        if (_wallet.apiVersion === undefined) continue;
        wallets.push({
          name: _wallet.name,
          apiVersion: _wallet.apiVersion,
          connect: _wallet.connect,
          icon: _wallet.icon,
          rdns: _wallet.rdns,
        });
      } catch (e) {
        console.log(e);
      }
    }
    return wallets;
  }

  static getMidnightWalletConnected(): { rdns: string | null; networkID: string | null } {
    const rdns = window.localStorage.getItem("rdns-connected");
    const networkID = window.localStorage.getItem("network-id");
    return { rdns, networkID };
  }

  static setMidnightWalletConnected(rdns: string, networkID: string, logger?: Logger): void {
    if (logger) {
      logger.trace(`Setting wallet auto connect to ${rdns}`);
    }
    window.localStorage.setItem("rdns-connected", rdns);
    window.localStorage.setItem("network-id", networkID);
  }

  static deleteMidnightWalletConnected(logger?: Logger): void {
    if (logger) {
      logger.trace("Deleting wallet auto connect ");
    }
    window.localStorage.removeItem("rdns-connected");
    window.localStorage.removeItem("network-id");
  }

  static async connectToWallet(
    rdns: string,
    networkID: string,
    logger?: Logger
  ): Promise<MidnightBrowserWallet> {
    return firstValueFrom(
      fnPipe(
        interval(100),
        map(() => window.midnight?.[rdns]),
        tap((initialAPI) => {
          logger?.info(initialAPI, "Check for wallet initial API");
        }),
        filter((initialAPI): initialAPI is InitialAPI => !!initialAPI),
        tap((initialAPI) => {
          logger?.info(
            initialAPI,
            "Compatible wallet initial API found. Connecting."
          );
        }),
        take(1),
        timeout({
          first: 1_000,
          with: () =>
            throwError(() => {
              logger?.error("Could not find wallet initial API");

              return new Error("Could not find wallet initial API");
            }),
        }),
        concatMap(async (initialAPI) => {          
          return {
            connectedAPI: await initialAPI.connect(networkID),
            initialAPI,
          };
        }),
        catchError((error, apis) =>
          error
            ? throwError(() => {
                logger?.error("Unable to enable connector API");
                return new Error("Application is not authorized");
              })
            : apis
        ),
        concatMap(async ({ connectedAPI, initialAPI }) => {
          if (!connectedAPI) {
            throw new Error("Connected API is undefined");
          }
          const serviceUriConfig = await connectedAPI.getConfiguration();
          const status = await connectedAPI.getConnectionStatus();
          const dustAddress = await connectedAPI.getDustAddress();
          const dustBalance = await connectedAPI.getDustBalance();
          const shieldedAddresses = await connectedAPI.getShieldedAddresses();
          const shieldedBalances = await connectedAPI.getShieldedBalances();
          const unshieldedAddress = await connectedAPI.getUnshieldedAddress();
          const unshieldedBalances = await connectedAPI.getUnshieldedBalances();
          const proofServerOnline = await checkProofServerStatus(
            serviceUriConfig.proverServerUri
          );

          logger?.info("Connected to wallet");

          const wallet = new MidnightBrowserWallet(
            initialAPI,
            connectedAPI,
            serviceUriConfig,
            status,
            dustAddress,
            dustBalance,
            shieldedAddresses,
            shieldedBalances,
            unshieldedAddress,
            unshieldedBalances,
            proofServerOnline,
            logger
          );

          // Call the static method
          const networkID = status.status === "connected" ? status.networkId : null;
          if (networkID === null) {
            throw new Error("Network ID is null");
          }
          MidnightBrowserWallet.setMidnightWalletConnected(rdns, networkID, logger);
          setNetworkId(networkID);

          return wallet;
        })
      )
    );
  }

  disconnect(logger?: Logger): void {
    MidnightBrowserWallet.deleteMidnightWalletConnected(logger);
    this.initialAPI = undefined;
    this.connectedAPI = undefined;
    this.serviceUriConfig = undefined;
    this.status = undefined;
    this.dustAddress = undefined;
    this.dustBalance = undefined;
    this.shieldedAddresses = undefined;
    this.shieldedBalances = undefined;
    this.unshieldedAddress = undefined;
    this.unshieldedBalances = undefined;
  }

  async refresh(): Promise<void> {
    if (this.connectedAPI === undefined) return;
    this.serviceUriConfig = await this.connectedAPI.getConfiguration();
    this.status = await this.connectedAPI.getConnectionStatus();
    this.dustAddress = await this.connectedAPI.getDustAddress();
    this.dustBalance = await this.connectedAPI.getDustBalance();
    this.shieldedAddresses = await this.connectedAPI.getShieldedAddresses();
    this.shieldedBalances = await this.connectedAPI.getShieldedBalances();
    this.unshieldedAddress = await this.connectedAPI.getUnshieldedAddress();
    this.unshieldedBalances = await this.connectedAPI.getUnshieldedBalances();
    this.proofServerOnline = await checkProofServerStatus(
      this.serviceUriConfig.proverServerUri
    );
  }
}

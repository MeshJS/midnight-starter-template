import type { PrivateStateProvider, PrivateStateId } from '@midnight-ntwrk/midnight-js-types';
import type { Logger } from 'pino';

export class WrappedPrivateStateProvider<PSI extends PrivateStateId = PrivateStateId, PS = any>
  implements PrivateStateProvider<PSI, PS>
{
  constructor(
    private readonly privateDataProvider: PrivateStateProvider<PSI, PS>,
    private readonly logger?: Logger,
  ) {}

  set(privateStateId: PSI, state: PS): Promise<void> {
    this.logger?.trace(`Setting private state for key: ${privateStateId}`);
    return this.privateDataProvider.set(privateStateId, state);
  }

  get(privateStateId: PSI): Promise<null | PS> {
    this.logger?.trace(`Getting private state for key: ${privateStateId}`);
    return this.privateDataProvider.get(privateStateId);
  }

  remove(privateStateId: PSI): Promise<void> {
    this.logger?.trace(`Removing private state for key: ${privateStateId}`);
    return this.privateDataProvider.remove(privateStateId);
  }

  clear(): Promise<void> {
    this.logger?.trace('Clearing private state');
    return this.privateDataProvider.clear();
  }

  setSigningKey(address: string, signingKey: string): Promise<void> {
    this.logger?.trace(`Setting signing key for key: ${address}`);
    return this.privateDataProvider.setSigningKey(address, signingKey);
  }

  getSigningKey(address: string): Promise<null | string> {
    this.logger?.trace(`Getting signing key for key: ${address}`);
    return this.privateDataProvider.getSigningKey(address);
  }

  removeSigningKey(address: string): Promise<void> {
    this.logger?.trace(`Removing signing key for key: ${address}`);
    return this.privateDataProvider.removeSigningKey(address);
  }

  clearSigningKeys(): Promise<void> {
    this.logger?.trace('Clearing signing keys');
    return this.privateDataProvider.clearSigningKeys();
  }
}
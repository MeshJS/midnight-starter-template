import type { SigningKey } from "@midnight-ntwrk/compact-runtime";
import type { ContractAddress } from "@midnight-ntwrk/ledger-v6";
import {
  type Contract,
  type PrivateState,
  type PrivateStateId,
  type PrivateStateProvider,
} from "@midnight-ntwrk/midnight-js-types";

/**
 * A simple in-memory implementation of private state provider. Makes it easy to capture and rewrite private state from deploy.
 * @template PSI - Type of the private state identifier.
 * @template PS - Type of the private state.
 * @returns {PrivateStateProvider<PSI, PS>} An in-memory private state provider.
 */
export const inMemoryPrivateStateProvider = <
  PSI extends PrivateStateId,
  PS extends PrivateState<Contract>,
>(): PrivateStateProvider<PSI, PS> => {
  const record = new Map<PSI, PS>();
  const signingKeys = {} as Record<ContractAddress, SigningKey>;

  return {
    /**
     * Sets the private state for a given key.
     * @param {PSI} key - The key for the private state.
     * @param {PS} state - The private state to set.
     * @returns {Promise<void>} A promise that resolves when the state is set.
     */
    set(key: PSI, state: PS): Promise<void> {
      record.set(key, state);
      return Promise.resolve();
    },
    /**
     * Gets the private state for a given key.
     * @param {PSI} key - The key for the private state.
     * @returns {Promise<PS | null>} A promise that resolves to the private state or null if not found.
     */
    get(key: PSI): Promise<PS | null> {
      const value = record.get(key) ?? null;
      return Promise.resolve(value);
    },
    /**
     * Removes the private state for a given key.
     * @param {PSI} key - The key for the private state.
     * @returns {Promise<void>} A promise that resolves when the state is removed.
     */
    remove(key: PSI): Promise<void> {
      record.delete(key);
      return Promise.resolve();
    },
    /**
     * Clears all private states.
     * @returns {Promise<void>} A promise that resolves when all states are cleared.
     */
    clear(): Promise<void> {
      record.clear();
      return Promise.resolve();
    },
    /**
     * Sets the signing key for a given contract address.
     * @param {ContractAddress} contractAddress - The contract address.
     * @param {SigningKey} signingKey - The signing key to set.
     * @returns {Promise<void>} A promise that resolves when the signing key is set.
     */
    setSigningKey(
      contractAddress: ContractAddress,
      signingKey: SigningKey
    ): Promise<void> {
      signingKeys[contractAddress] = signingKey;
      return Promise.resolve();
    },
    /**
     * Gets the signing key for a given contract address.
     * @param {ContractAddress} contractAddress - The contract address.
     * @returns {Promise<SigningKey | null>} A promise that resolves to the signing key or null if not found.
     */
    getSigningKey(
      contractAddress: ContractAddress
    ): Promise<SigningKey | null> {
      const value = signingKeys[contractAddress] ?? null;
      return Promise.resolve(value);
    },
    /**
     * Removes the signing key for a given contract address.
     * @param {ContractAddress} contractAddress - The contract address.
     * @returns {Promise<void>} A promise that resolves when the signing key is removed.
     */
    removeSigningKey(contractAddress: ContractAddress): Promise<void> {
      delete signingKeys[contractAddress];
      return Promise.resolve();
    },
    /**
     * Clears all signing keys.
     * @returns {Promise<void>} A promise that resolves when all signing keys are cleared.
     */
    clearSigningKeys(): Promise<void> {
      Object.keys(signingKeys).forEach((contractAddress) => {
        delete signingKeys[contractAddress];
      });
      return Promise.resolve();
    },
  };
};

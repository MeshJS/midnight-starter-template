import { Board, type BBoardPrivateState } from '@meshsdk/board-contract';
import type { ImpureCircuitId, MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import type { DeployedContract, FoundContract } from '@midnight-ntwrk/midnight-js-contracts';

export type BboardCircuits = ImpureCircuitId<Board.Contract<BBoardPrivateState>>;

export const BboardPrivateStateId = 'bboardPrivateState';

export type BboardProviders = MidnightProviders<BboardCircuits, typeof BboardPrivateStateId, BBoardPrivateState>;

export type BboardContract = Board.Contract<BBoardPrivateState>;

export type DeployedBboardContract = DeployedContract<BboardContract> | FoundContract<BboardContract>;

export type UserAction = {
  post: string | undefined;  
  takeDown: string | undefined;
};

export type BboardDerivedState = {  
  readonly state: Board.Ledger["state"];
  readonly sequence: Board.Ledger["instance"];
  readonly message: Board.Ledger["message"];
  readonly isOwner: boolean;
};

export const emptyState: BboardDerivedState = {
  state: Board.STATE.vacant,
  sequence: 0n,
  message: { is_some: false, value: '' },
  isOwner: false,
};

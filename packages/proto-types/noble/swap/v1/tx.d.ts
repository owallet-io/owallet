import _m0 from "protobufjs/minimal";
import { Algorithm } from "../../../noble/swap/v1/algorithm";
import { Coin } from "../../../cosmos/base/v1beta1/coin";
import { Route, Swap } from "../../../noble/swap/v1/swap";
export declare const protobufPackage = "noble.swap.v1";
export interface MsgWithdrawProtocolFees {
  /** Address of the signer who is requesting the fee withdrawal. */
  signer: string;
  /** Address to which the withdrawn fees will be sent. */
  to: string;
}
export interface MsgWithdrawProtocolFeesResponse {}
export interface MsgWithdrawRewards {
  /** Address of the signer who is requesting the reward withdrawal. */
  signer: string;
}
export interface MsgWithdrawRewardsResponse {
  /** List of rewards withdrawn by the user. */
  rewards: Coin[];
}
export interface MsgSwap {
  /** Address of the signer who is initiating the swap. */
  signer: string;
  /** The coin to be swapped. */
  amount: Coin | undefined;
  /** The routes through which the swap will occur. */
  routes: Route[];
  /** The minimum amount of tokens expected after the swap. */
  min: Coin | undefined;
}
export interface MsgSwapResponse {
  /** The resulting amount of tokens after the swap. */
  result: Coin | undefined;
  /** Details of each individual swap involved in the process. */
  swaps: Swap[];
}
export interface MsgPauseByAlgorithm {
  /** Address of the signer who is requesting to pause the pools. */
  signer: string;
  /** The algorithm used by the pools to be paused. */
  algorithm: Algorithm;
}
export interface MsgPauseByAlgorithmResponse {
  /** List of IDs of the paused pools. */
  pausedPools: string[];
}
export interface MsgPauseByPoolIds {
  /** Address of the signer who is requesting to pause the pools. */
  signer: string;
  /** List of IDs of the pools to be paused. */
  poolIds: string[];
}
export interface MsgPauseByPoolIdsResponse {
  /** List of IDs of the paused pools. */
  pausedPools: string[];
}
export interface MsgUnpauseByAlgorithm {
  /** Address of the signer who is requesting to unpause the pools. */
  signer: string;
  /** The algorithm used by the pools to be unpaused. */
  algorithm: Algorithm;
}
export interface MsgUnpauseByAlgorithmResponse {
  /** List of IDs of the unpaused pools. */
  unpausedPools: string[];
}
export interface MsgUnpauseByPoolIds {
  /** Address of the signer who is requesting to unpause the pools. */
  signer: string;
  /** List of IDs of the pools to be unpaused. */
  poolIds: string[];
}
export interface MsgUnpauseByPoolIdsResponse {
  /** List of IDs of the unpaused pools. */
  unpausedPools: string[];
}
export declare const MsgWithdrawProtocolFees: {
  encode(message: MsgWithdrawProtocolFees, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgWithdrawProtocolFees;
  fromJSON(object: any): MsgWithdrawProtocolFees;
  toJSON(message: MsgWithdrawProtocolFees): unknown;
  fromPartial<
    I extends {
      signer?: string | undefined;
      to?: string | undefined;
    } & {
      signer?: string | undefined;
      to?: string | undefined;
    } & Record<Exclude<keyof I, keyof MsgWithdrawProtocolFees>, never>
  >(
    object: I
  ): MsgWithdrawProtocolFees;
};
export declare const MsgWithdrawProtocolFeesResponse: {
  encode(_: MsgWithdrawProtocolFeesResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgWithdrawProtocolFeesResponse;
  fromJSON(_: any): MsgWithdrawProtocolFeesResponse;
  toJSON(_: MsgWithdrawProtocolFeesResponse): unknown;
  fromPartial<I extends {} & {} & Record<Exclude<keyof I, never>, never>>(
    _: I
  ): MsgWithdrawProtocolFeesResponse;
};
export declare const MsgWithdrawRewards: {
  encode(message: MsgWithdrawRewards, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgWithdrawRewards;
  fromJSON(object: any): MsgWithdrawRewards;
  toJSON(message: MsgWithdrawRewards): unknown;
  fromPartial<
    I extends {
      signer?: string | undefined;
    } & {
      signer?: string | undefined;
    } & Record<Exclude<keyof I, "signer">, never>
  >(
    object: I
  ): MsgWithdrawRewards;
};
export declare const MsgWithdrawRewardsResponse: {
  encode(message: MsgWithdrawRewardsResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgWithdrawRewardsResponse;
  fromJSON(object: any): MsgWithdrawRewardsResponse;
  toJSON(message: MsgWithdrawRewardsResponse): unknown;
  fromPartial<
    I extends {
      rewards?:
        | {
            denom?: string | undefined;
            amount?: string | undefined;
          }[]
        | undefined;
    } & {
      rewards?:
        | ({
            denom?: string | undefined;
            amount?: string | undefined;
          }[] &
            ({
              denom?: string | undefined;
              amount?: string | undefined;
            } & {
              denom?: string | undefined;
              amount?: string | undefined;
            } & Record<
                Exclude<keyof I["rewards"][number], keyof Coin>,
                never
              >)[] &
            Record<
              Exclude<
                keyof I["rewards"],
                keyof {
                  denom?: string | undefined;
                  amount?: string | undefined;
                }[]
              >,
              never
            >)
        | undefined;
    } & Record<Exclude<keyof I, "rewards">, never>
  >(
    object: I
  ): MsgWithdrawRewardsResponse;
};
export declare const MsgSwap: {
  encode(message: MsgSwap, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSwap;
  fromJSON(object: any): MsgSwap;
  toJSON(message: MsgSwap): unknown;
  fromPartial<
    I extends {
      signer?: string | undefined;
      amount?:
        | {
            denom?: string | undefined;
            amount?: string | undefined;
          }
        | undefined;
      routes?:
        | {
            poolId?: string | undefined;
            denomTo?: string | undefined;
          }[]
        | undefined;
      min?:
        | {
            denom?: string | undefined;
            amount?: string | undefined;
          }
        | undefined;
    } & {
      signer?: string | undefined;
      amount?:
        | ({
            denom?: string | undefined;
            amount?: string | undefined;
          } & {
            denom?: string | undefined;
            amount?: string | undefined;
          } & Record<Exclude<keyof I["amount"], keyof Coin>, never>)
        | undefined;
      routes?:
        | ({
            poolId?: string | undefined;
            denomTo?: string | undefined;
          }[] &
            ({
              poolId?: string | undefined;
              denomTo?: string | undefined;
            } & {
              poolId?: string | undefined;
              denomTo?: string | undefined;
            } & Record<
                Exclude<keyof I["routes"][number], keyof Route>,
                never
              >)[] &
            Record<
              Exclude<
                keyof I["routes"],
                keyof {
                  poolId?: string | undefined;
                  denomTo?: string | undefined;
                }[]
              >,
              never
            >)
        | undefined;
      min?:
        | ({
            denom?: string | undefined;
            amount?: string | undefined;
          } & {
            denom?: string | undefined;
            amount?: string | undefined;
          } & Record<Exclude<keyof I["min"], keyof Coin>, never>)
        | undefined;
    } & Record<Exclude<keyof I, keyof MsgSwap>, never>
  >(
    object: I
  ): MsgSwap;
};
export declare const MsgSwapResponse: {
  encode(message: MsgSwapResponse, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSwapResponse;
  fromJSON(object: any): MsgSwapResponse;
  toJSON(message: MsgSwapResponse): unknown;
  fromPartial<
    I extends {
      result?:
        | {
            denom?: string | undefined;
            amount?: string | undefined;
          }
        | undefined;
      swaps?:
        | {
            poolId?: string | undefined;
            in?:
              | {
                  denom?: string | undefined;
                  amount?: string | undefined;
                }
              | undefined;
            out?:
              | {
                  denom?: string | undefined;
                  amount?: string | undefined;
                }
              | undefined;
            fees?:
              | {
                  denom?: string | undefined;
                  amount?: string | undefined;
                }[]
              | undefined;
          }[]
        | undefined;
    } & {
      result?:
        | ({
            denom?: string | undefined;
            amount?: string | undefined;
          } & {
            denom?: string | undefined;
            amount?: string | undefined;
          } & Record<Exclude<keyof I["result"], keyof Coin>, never>)
        | undefined;
      swaps?:
        | ({
            poolId?: string | undefined;
            in?:
              | {
                  denom?: string | undefined;
                  amount?: string | undefined;
                }
              | undefined;
            out?:
              | {
                  denom?: string | undefined;
                  amount?: string | undefined;
                }
              | undefined;
            fees?:
              | {
                  denom?: string | undefined;
                  amount?: string | undefined;
                }[]
              | undefined;
          }[] &
            ({
              poolId?: string | undefined;
              in?:
                | {
                    denom?: string | undefined;
                    amount?: string | undefined;
                  }
                | undefined;
              out?:
                | {
                    denom?: string | undefined;
                    amount?: string | undefined;
                  }
                | undefined;
              fees?:
                | {
                    denom?: string | undefined;
                    amount?: string | undefined;
                  }[]
                | undefined;
            } & {
              poolId?: string | undefined;
              in?:
                | ({
                    denom?: string | undefined;
                    amount?: string | undefined;
                  } & {
                    denom?: string | undefined;
                    amount?: string | undefined;
                  } & Record<
                      Exclude<keyof I["swaps"][number]["in"], keyof Coin>,
                      never
                    >)
                | undefined;
              out?:
                | ({
                    denom?: string | undefined;
                    amount?: string | undefined;
                  } & {
                    denom?: string | undefined;
                    amount?: string | undefined;
                  } & Record<
                      Exclude<keyof I["swaps"][number]["out"], keyof Coin>,
                      never
                    >)
                | undefined;
              fees?:
                | ({
                    denom?: string | undefined;
                    amount?: string | undefined;
                  }[] &
                    ({
                      denom?: string | undefined;
                      amount?: string | undefined;
                    } & {
                      denom?: string | undefined;
                      amount?: string | undefined;
                    } & Record<
                        Exclude<
                          keyof I["swaps"][number]["fees"][number],
                          keyof Coin
                        >,
                        never
                      >)[] &
                    Record<
                      Exclude<
                        keyof I["swaps"][number]["fees"],
                        keyof {
                          denom?: string | undefined;
                          amount?: string | undefined;
                        }[]
                      >,
                      never
                    >)
                | undefined;
            } & Record<
                Exclude<keyof I["swaps"][number], keyof Swap>,
                never
              >)[] &
            Record<
              Exclude<
                keyof I["swaps"],
                keyof {
                  poolId?: string | undefined;
                  in?:
                    | {
                        denom?: string | undefined;
                        amount?: string | undefined;
                      }
                    | undefined;
                  out?:
                    | {
                        denom?: string | undefined;
                        amount?: string | undefined;
                      }
                    | undefined;
                  fees?:
                    | {
                        denom?: string | undefined;
                        amount?: string | undefined;
                      }[]
                    | undefined;
                }[]
              >,
              never
            >)
        | undefined;
    } & Record<Exclude<keyof I, keyof MsgSwapResponse>, never>
  >(
    object: I
  ): MsgSwapResponse;
};
export declare const MsgPauseByAlgorithm: {
  encode(message: MsgPauseByAlgorithm, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgPauseByAlgorithm;
  fromJSON(object: any): MsgPauseByAlgorithm;
  toJSON(message: MsgPauseByAlgorithm): unknown;
  fromPartial<
    I extends {
      signer?: string | undefined;
      algorithm?: Algorithm | undefined;
    } & {
      signer?: string | undefined;
      algorithm?: Algorithm | undefined;
    } & Record<Exclude<keyof I, keyof MsgPauseByAlgorithm>, never>
  >(
    object: I
  ): MsgPauseByAlgorithm;
};
export declare const MsgPauseByAlgorithmResponse: {
  encode(message: MsgPauseByAlgorithmResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgPauseByAlgorithmResponse;
  fromJSON(object: any): MsgPauseByAlgorithmResponse;
  toJSON(message: MsgPauseByAlgorithmResponse): unknown;
  fromPartial<
    I extends {
      pausedPools?: string[] | undefined;
    } & {
      pausedPools?:
        | (string[] &
            string[] &
            Record<Exclude<keyof I["pausedPools"], keyof string[]>, never>)
        | undefined;
    } & Record<Exclude<keyof I, "pausedPools">, never>
  >(
    object: I
  ): MsgPauseByAlgorithmResponse;
};
export declare const MsgPauseByPoolIds: {
  encode(message: MsgPauseByPoolIds, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgPauseByPoolIds;
  fromJSON(object: any): MsgPauseByPoolIds;
  toJSON(message: MsgPauseByPoolIds): unknown;
  fromPartial<
    I extends {
      signer?: string | undefined;
      poolIds?: string[] | undefined;
    } & {
      signer?: string | undefined;
      poolIds?:
        | (string[] &
            string[] &
            Record<Exclude<keyof I["poolIds"], keyof string[]>, never>)
        | undefined;
    } & Record<Exclude<keyof I, keyof MsgPauseByPoolIds>, never>
  >(
    object: I
  ): MsgPauseByPoolIds;
};
export declare const MsgPauseByPoolIdsResponse: {
  encode(message: MsgPauseByPoolIdsResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgPauseByPoolIdsResponse;
  fromJSON(object: any): MsgPauseByPoolIdsResponse;
  toJSON(message: MsgPauseByPoolIdsResponse): unknown;
  fromPartial<
    I extends {
      pausedPools?: string[] | undefined;
    } & {
      pausedPools?:
        | (string[] &
            string[] &
            Record<Exclude<keyof I["pausedPools"], keyof string[]>, never>)
        | undefined;
    } & Record<Exclude<keyof I, "pausedPools">, never>
  >(
    object: I
  ): MsgPauseByPoolIdsResponse;
};
export declare const MsgUnpauseByAlgorithm: {
  encode(message: MsgUnpauseByAlgorithm, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgUnpauseByAlgorithm;
  fromJSON(object: any): MsgUnpauseByAlgorithm;
  toJSON(message: MsgUnpauseByAlgorithm): unknown;
  fromPartial<
    I extends {
      signer?: string | undefined;
      algorithm?: Algorithm | undefined;
    } & {
      signer?: string | undefined;
      algorithm?: Algorithm | undefined;
    } & Record<Exclude<keyof I, keyof MsgUnpauseByAlgorithm>, never>
  >(
    object: I
  ): MsgUnpauseByAlgorithm;
};
export declare const MsgUnpauseByAlgorithmResponse: {
  encode(
    message: MsgUnpauseByAlgorithmResponse,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgUnpauseByAlgorithmResponse;
  fromJSON(object: any): MsgUnpauseByAlgorithmResponse;
  toJSON(message: MsgUnpauseByAlgorithmResponse): unknown;
  fromPartial<
    I extends {
      unpausedPools?: string[] | undefined;
    } & {
      unpausedPools?:
        | (string[] &
            string[] &
            Record<Exclude<keyof I["unpausedPools"], keyof string[]>, never>)
        | undefined;
    } & Record<Exclude<keyof I, "unpausedPools">, never>
  >(
    object: I
  ): MsgUnpauseByAlgorithmResponse;
};
export declare const MsgUnpauseByPoolIds: {
  encode(message: MsgUnpauseByPoolIds, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUnpauseByPoolIds;
  fromJSON(object: any): MsgUnpauseByPoolIds;
  toJSON(message: MsgUnpauseByPoolIds): unknown;
  fromPartial<
    I extends {
      signer?: string | undefined;
      poolIds?: string[] | undefined;
    } & {
      signer?: string | undefined;
      poolIds?:
        | (string[] &
            string[] &
            Record<Exclude<keyof I["poolIds"], keyof string[]>, never>)
        | undefined;
    } & Record<Exclude<keyof I, keyof MsgUnpauseByPoolIds>, never>
  >(
    object: I
  ): MsgUnpauseByPoolIds;
};
export declare const MsgUnpauseByPoolIdsResponse: {
  encode(message: MsgUnpauseByPoolIdsResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgUnpauseByPoolIdsResponse;
  fromJSON(object: any): MsgUnpauseByPoolIdsResponse;
  toJSON(message: MsgUnpauseByPoolIdsResponse): unknown;
  fromPartial<
    I extends {
      unpausedPools?: string[] | undefined;
    } & {
      unpausedPools?:
        | (string[] &
            string[] &
            Record<Exclude<keyof I["unpausedPools"], keyof string[]>, never>)
        | undefined;
    } & Record<Exclude<keyof I, "unpausedPools">, never>
  >(
    object: I
  ): MsgUnpauseByPoolIdsResponse;
};
export interface Msg {
  /** Swap allows a user to swap one type of token for another, using multiple routes. */
  Swap(request: MsgSwap): Promise<MsgSwapResponse>;
  /** WithdrawProtocolFees allows the protocol to withdraw accumulated fees and move them to another account. */
  WithdrawProtocolFees(
    request: MsgWithdrawProtocolFees
  ): Promise<MsgWithdrawProtocolFeesResponse>;
  /** WithdrawRewards allows a user to claim their accumulated rewards. */
  WithdrawRewards(
    request: MsgWithdrawRewards
  ): Promise<MsgWithdrawRewardsResponse>;
  /** PauseByAlgorithm pauses all pools using a specific algorithm. */
  PauseByAlgorithm(
    request: MsgPauseByAlgorithm
  ): Promise<MsgPauseByAlgorithmResponse>;
  /** PauseByPoolIds pauses specific pools identified by their pool IDs. */
  PauseByPoolIds(
    request: MsgPauseByPoolIds
  ): Promise<MsgPauseByPoolIdsResponse>;
  /** UnpauseByAlgorithm unpauses all pools using a specific algorithm. */
  UnpauseByAlgorithm(
    request: MsgUnpauseByAlgorithm
  ): Promise<MsgUnpauseByAlgorithmResponse>;
  /** UnpauseByPoolIds unpauses specific pools identified by their pool IDs. */
  UnpauseByPoolIds(
    request: MsgUnpauseByPoolIds
  ): Promise<MsgUnpauseByPoolIdsResponse>;
}
type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined;
export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : Partial<T>;
type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin
  ? P
  : P & {
      [K in keyof P]: Exact<P[K], I[K]>;
    } & Record<Exclude<keyof I, KeysOfUnion<P>>, never>;
export {};

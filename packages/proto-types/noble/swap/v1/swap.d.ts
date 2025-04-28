import _m0 from "protobufjs/minimal";
import { Coin } from "../../../cosmos/base/v1beta1/coin";
export declare const protobufPackage = "noble.swap.v1";
export interface Route {
  /** ID of the Pool. */
  poolId: string;
  /** Destination denom after the Swap in the Pool. */
  denomTo: string;
}
export interface Swap {
  /** ID of the pool used in the swap. */
  poolId: string;
  /** The input coin for the swap. */
  in: Coin | undefined;
  /** The output coin after the swap. */
  out: Coin | undefined;
  /** Any fees incurred during the swap. */
  fees: Coin[];
}
export declare const Route: {
  encode(message: Route, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): Route;
  fromJSON(object: any): Route;
  toJSON(message: Route): unknown;
  fromPartial<
    I extends {
      poolId?: string | undefined;
      denomTo?: string | undefined;
    } & {
      poolId?: string | undefined;
      denomTo?: string | undefined;
    } & Record<Exclude<keyof I, keyof Route>, never>
  >(
    object: I
  ): Route;
};
export declare const Swap: {
  encode(message: Swap, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): Swap;
  fromJSON(object: any): Swap;
  toJSON(message: Swap): unknown;
  fromPartial<
    I extends {
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
          } & Record<Exclude<keyof I["in"], keyof Coin>, never>)
        | undefined;
      out?:
        | ({
            denom?: string | undefined;
            amount?: string | undefined;
          } & {
            denom?: string | undefined;
            amount?: string | undefined;
          } & Record<Exclude<keyof I["out"], keyof Coin>, never>)
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
            } & Record<Exclude<keyof I["fees"][number], keyof Coin>, never>)[] &
            Record<
              Exclude<
                keyof I["fees"],
                keyof {
                  denom?: string | undefined;
                  amount?: string | undefined;
                }[]
              >,
              never
            >)
        | undefined;
    } & Record<Exclude<keyof I, keyof Swap>, never>
  >(
    object: I
  ): Swap;
};
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

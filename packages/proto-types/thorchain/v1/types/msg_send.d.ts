import _m0 from "protobufjs/minimal";
import { Coin } from "../../../cosmos/base/v1beta1/coin";
export declare const protobufPackage = "types";
export interface MsgSend {
  fromAddress: Uint8Array;
  toAddress: Uint8Array;
  amount: Coin[];
}
export declare const MsgSend: {
  encode(message: MsgSend, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSend;
  fromJSON(object: any): MsgSend;
  toJSON(message: MsgSend): unknown;
  fromPartial<
    I extends {
      fromAddress?: Uint8Array | undefined;
      toAddress?: Uint8Array | undefined;
      amount?:
        | {
            denom?: string | undefined;
            amount?: string | undefined;
          }[]
        | undefined;
    } & {
      fromAddress?: Uint8Array | undefined;
      toAddress?: Uint8Array | undefined;
      amount?:
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
                Exclude<keyof I["amount"][number], keyof Coin>,
                never
              >)[] &
            Record<
              Exclude<
                keyof I["amount"],
                keyof {
                  denom?: string | undefined;
                  amount?: string | undefined;
                }[]
              >,
              never
            >)
        | undefined;
    } & Record<Exclude<keyof I, keyof MsgSend>, never>
  >(
    object: I
  ): MsgSend;
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

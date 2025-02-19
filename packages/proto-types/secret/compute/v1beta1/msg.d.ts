import _m0 from "protobufjs/minimal";
import { Coin } from "../../../cosmos/base/v1beta1/coin";
export declare const protobufPackage = "secret.compute.v1beta1";
export interface MsgStoreCode {
  sender: Uint8Array;
  /** WASMByteCode can be raw or gzip compressed */
  wasmByteCode: Uint8Array;
  /** Source is a valid absolute HTTPS URI to the contract's source code, optional */
  source: string;
  /** Builder is a valid docker image name with tag, optional */
  builder: string;
}
export interface MsgInstantiateContract {
  sender: Uint8Array;
  /**
   * Admin is an optional address that can execute migrations
   *  bytes admin = 2 [(gogoproto.casttype) = "github.com/cosmos/cosmos-sdk/types.AccAddress"];
   */
  callbackCodeHash: string;
  codeId: string;
  label: string;
  initMsg: Uint8Array;
  initFunds: Coin[];
  callbackSig: Uint8Array;
}
export interface MsgExecuteContract {
  sender: Uint8Array;
  contract: Uint8Array;
  msg: Uint8Array;
  callbackCodeHash: string;
  sentFunds: Coin[];
  callbackSig: Uint8Array;
}
export declare const MsgStoreCode: {
  encode(message: MsgStoreCode, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgStoreCode;
  fromJSON(object: any): MsgStoreCode;
  toJSON(message: MsgStoreCode): unknown;
  create<
    I extends {
      sender?: Uint8Array;
      wasmByteCode?: Uint8Array;
      source?: string;
      builder?: string;
    } & {
      sender?: Uint8Array;
      wasmByteCode?: Uint8Array;
      source?: string;
      builder?: string;
    } & { [K in Exclude<keyof I, keyof MsgStoreCode>]: never }
  >(
    base?: I
  ): MsgStoreCode;
  fromPartial<
    I_1 extends {
      sender?: Uint8Array;
      wasmByteCode?: Uint8Array;
      source?: string;
      builder?: string;
    } & {
      sender?: Uint8Array;
      wasmByteCode?: Uint8Array;
      source?: string;
      builder?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof MsgStoreCode>]: never }
  >(
    object: I_1
  ): MsgStoreCode;
};
export declare const MsgInstantiateContract: {
  encode(message: MsgInstantiateContract, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgInstantiateContract;
  fromJSON(object: any): MsgInstantiateContract;
  toJSON(message: MsgInstantiateContract): unknown;
  create<
    I extends {
      sender?: Uint8Array;
      callbackCodeHash?: string;
      codeId?: string;
      label?: string;
      initMsg?: Uint8Array;
      initFunds?: {
        denom?: string;
        amount?: string;
      }[];
      callbackSig?: Uint8Array;
    } & {
      sender?: Uint8Array;
      callbackCodeHash?: string;
      codeId?: string;
      label?: string;
      initMsg?: Uint8Array;
      initFunds?: {
        denom?: string;
        amount?: string;
      }[] &
        ({
          denom?: string;
          amount?: string;
        } & {
          denom?: string;
          amount?: string;
        } & {
          [K in Exclude<keyof I["initFunds"][number], keyof Coin>]: never;
        })[] & {
          [K_1 in Exclude<
            keyof I["initFunds"],
            keyof {
              denom?: string;
              amount?: string;
            }[]
          >]: never;
        };
      callbackSig?: Uint8Array;
    } & { [K_2 in Exclude<keyof I, keyof MsgInstantiateContract>]: never }
  >(
    base?: I
  ): MsgInstantiateContract;
  fromPartial<
    I_1 extends {
      sender?: Uint8Array;
      callbackCodeHash?: string;
      codeId?: string;
      label?: string;
      initMsg?: Uint8Array;
      initFunds?: {
        denom?: string;
        amount?: string;
      }[];
      callbackSig?: Uint8Array;
    } & {
      sender?: Uint8Array;
      callbackCodeHash?: string;
      codeId?: string;
      label?: string;
      initMsg?: Uint8Array;
      initFunds?: {
        denom?: string;
        amount?: string;
      }[] &
        ({
          denom?: string;
          amount?: string;
        } & {
          denom?: string;
          amount?: string;
        } & {
          [K_3 in Exclude<keyof I_1["initFunds"][number], keyof Coin>]: never;
        })[] & {
          [K_4 in Exclude<
            keyof I_1["initFunds"],
            keyof {
              denom?: string;
              amount?: string;
            }[]
          >]: never;
        };
      callbackSig?: Uint8Array;
    } & { [K_5 in Exclude<keyof I_1, keyof MsgInstantiateContract>]: never }
  >(
    object: I_1
  ): MsgInstantiateContract;
};
export declare const MsgExecuteContract: {
  encode(message: MsgExecuteContract, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgExecuteContract;
  fromJSON(object: any): MsgExecuteContract;
  toJSON(message: MsgExecuteContract): unknown;
  create<
    I extends {
      sender?: Uint8Array;
      contract?: Uint8Array;
      msg?: Uint8Array;
      callbackCodeHash?: string;
      sentFunds?: {
        denom?: string;
        amount?: string;
      }[];
      callbackSig?: Uint8Array;
    } & {
      sender?: Uint8Array;
      contract?: Uint8Array;
      msg?: Uint8Array;
      callbackCodeHash?: string;
      sentFunds?: {
        denom?: string;
        amount?: string;
      }[] &
        ({
          denom?: string;
          amount?: string;
        } & {
          denom?: string;
          amount?: string;
        } & {
          [K in Exclude<keyof I["sentFunds"][number], keyof Coin>]: never;
        })[] & {
          [K_1 in Exclude<
            keyof I["sentFunds"],
            keyof {
              denom?: string;
              amount?: string;
            }[]
          >]: never;
        };
      callbackSig?: Uint8Array;
    } & { [K_2 in Exclude<keyof I, keyof MsgExecuteContract>]: never }
  >(
    base?: I
  ): MsgExecuteContract;
  fromPartial<
    I_1 extends {
      sender?: Uint8Array;
      contract?: Uint8Array;
      msg?: Uint8Array;
      callbackCodeHash?: string;
      sentFunds?: {
        denom?: string;
        amount?: string;
      }[];
      callbackSig?: Uint8Array;
    } & {
      sender?: Uint8Array;
      contract?: Uint8Array;
      msg?: Uint8Array;
      callbackCodeHash?: string;
      sentFunds?: {
        denom?: string;
        amount?: string;
      }[] &
        ({
          denom?: string;
          amount?: string;
        } & {
          denom?: string;
          amount?: string;
        } & {
          [K_3 in Exclude<keyof I_1["sentFunds"][number], keyof Coin>]: never;
        })[] & {
          [K_4 in Exclude<
            keyof I_1["sentFunds"],
            keyof {
              denom?: string;
              amount?: string;
            }[]
          >]: never;
        };
      callbackSig?: Uint8Array;
    } & { [K_5 in Exclude<keyof I_1, keyof MsgExecuteContract>]: never }
  >(
    object: I_1
  ): MsgExecuteContract;
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
  : T extends globalThis.Array<infer U>
  ? globalThis.Array<DeepPartial<U>>
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
    } & {
      [K in Exclude<keyof I, KeysOfUnion<P>>]: never;
    };
export {};

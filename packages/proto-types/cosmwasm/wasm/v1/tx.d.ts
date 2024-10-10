import _m0 from "protobufjs/minimal";
import { Coin } from "../../../cosmos/base/v1beta1/coin";
import { AccessConfig } from "./types";
export declare const protobufPackage = "cosmwasm.wasm.v1";
/** MsgStoreCode submit Wasm code to the system */
export interface MsgStoreCode {
  /** Sender is the that actor that signed the messages */
  sender: string;
  /** WASMByteCode can be raw or gzip compressed */
  wasmByteCode: Uint8Array;
  /**
   * InstantiatePermission access control to apply on contract creation,
   * optional
   */
  instantiatePermission: AccessConfig | undefined;
}
/** MsgStoreCodeResponse returns store result data. */
export interface MsgStoreCodeResponse {
  /** CodeID is the reference to the stored WASM code */
  codeId: string;
}
/**
 * MsgInstantiateContract create a new smart contract instance for the given
 * code id.
 */
export interface MsgInstantiateContract {
  /** Sender is the that actor that signed the messages */
  sender: string;
  /** Admin is an optional address that can execute migrations */
  admin: string;
  /** CodeID is the reference to the stored WASM code */
  codeId: string;
  /** Label is optional metadata to be stored with a contract instance. */
  label: string;
  /** Msg json encoded message to be passed to the contract on instantiation */
  msg: Uint8Array;
  /** Funds coins that are transferred to the contract on instantiation */
  funds: Coin[];
}
/** MsgInstantiateContractResponse return instantiation result data */
export interface MsgInstantiateContractResponse {
  /** Address is the bech32 address of the new contract instance. */
  address: string;
  /** Data contains base64-encoded bytes to returned from the contract */
  data: Uint8Array;
}
/** MsgExecuteContract submits the given message data to a smart contract */
export interface MsgExecuteContract {
  /** Sender is the that actor that signed the messages */
  sender: string;
  /** Contract is the address of the smart contract */
  contract: string;
  /** Msg json encoded message to be passed to the contract */
  msg: Uint8Array;
  /** Funds coins that are transferred to the contract on execution */
  funds: Coin[];
}
/** MsgExecuteContractResponse returns execution result data. */
export interface MsgExecuteContractResponse {
  /** Data contains base64-encoded bytes to returned from the contract */
  data: Uint8Array;
}
/** MsgMigrateContract runs a code upgrade/ downgrade for a smart contract */
export interface MsgMigrateContract {
  /** Sender is the that actor that signed the messages */
  sender: string;
  /** Contract is the address of the smart contract */
  contract: string;
  /** CodeID references the new WASM code */
  codeId: string;
  /** Msg json encoded message to be passed to the contract on migration */
  msg: Uint8Array;
}
/** MsgMigrateContractResponse returns contract migration result data. */
export interface MsgMigrateContractResponse {
  /**
   * Data contains same raw bytes returned as data from the wasm contract.
   * (May be empty)
   */
  data: Uint8Array;
}
/** MsgUpdateAdmin sets a new admin for a smart contract */
export interface MsgUpdateAdmin {
  /** Sender is the that actor that signed the messages */
  sender: string;
  /** NewAdmin address to be set */
  newAdmin: string;
  /** Contract is the address of the smart contract */
  contract: string;
}
/** MsgUpdateAdminResponse returns empty data */
export interface MsgUpdateAdminResponse {}
/** MsgClearAdmin removes any admin stored for a smart contract */
export interface MsgClearAdmin {
  /** Sender is the that actor that signed the messages */
  sender: string;
  /** Contract is the address of the smart contract */
  contract: string;
}
/** MsgClearAdminResponse returns empty data */
export interface MsgClearAdminResponse {}
export declare const MsgStoreCode: {
  encode(message: MsgStoreCode, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgStoreCode;
  fromJSON(object: any): MsgStoreCode;
  toJSON(message: MsgStoreCode): unknown;
  create<
    I extends {
      sender?: string;
      wasmByteCode?: Uint8Array;
      instantiatePermission?: {
        permission?: import("./types").AccessType;
        address?: string;
      };
    } & {
      sender?: string;
      wasmByteCode?: Uint8Array;
      instantiatePermission?: {
        permission?: import("./types").AccessType;
        address?: string;
      } & {
        permission?: import("./types").AccessType;
        address?: string;
      } & {
        [K in Exclude<
          keyof I["instantiatePermission"],
          keyof AccessConfig
        >]: never;
      };
    } & { [K_1 in Exclude<keyof I, keyof MsgStoreCode>]: never }
  >(
    base?: I
  ): MsgStoreCode;
  fromPartial<
    I_1 extends {
      sender?: string;
      wasmByteCode?: Uint8Array;
      instantiatePermission?: {
        permission?: import("./types").AccessType;
        address?: string;
      };
    } & {
      sender?: string;
      wasmByteCode?: Uint8Array;
      instantiatePermission?: {
        permission?: import("./types").AccessType;
        address?: string;
      } & {
        permission?: import("./types").AccessType;
        address?: string;
      } & {
        [K_2 in Exclude<
          keyof I_1["instantiatePermission"],
          keyof AccessConfig
        >]: never;
      };
    } & { [K_3 in Exclude<keyof I_1, keyof MsgStoreCode>]: never }
  >(
    object: I_1
  ): MsgStoreCode;
};
export declare const MsgStoreCodeResponse: {
  encode(message: MsgStoreCodeResponse, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgStoreCodeResponse;
  fromJSON(object: any): MsgStoreCodeResponse;
  toJSON(message: MsgStoreCodeResponse): unknown;
  create<
    I extends {
      codeId?: string;
    } & {
      codeId?: string;
    } & { [K in Exclude<keyof I, "codeId">]: never }
  >(
    base?: I
  ): MsgStoreCodeResponse;
  fromPartial<
    I_1 extends {
      codeId?: string;
    } & {
      codeId?: string;
    } & { [K_1 in Exclude<keyof I_1, "codeId">]: never }
  >(
    object: I_1
  ): MsgStoreCodeResponse;
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
      sender?: string;
      admin?: string;
      codeId?: string;
      label?: string;
      msg?: Uint8Array;
      funds?: {
        denom?: string;
        amount?: string;
      }[];
    } & {
      sender?: string;
      admin?: string;
      codeId?: string;
      label?: string;
      msg?: Uint8Array;
      funds?: {
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
          [K in Exclude<keyof I["funds"][number], keyof Coin>]: never;
        })[] & {
          [K_1 in Exclude<
            keyof I["funds"],
            keyof {
              denom?: string;
              amount?: string;
            }[]
          >]: never;
        };
    } & { [K_2 in Exclude<keyof I, keyof MsgInstantiateContract>]: never }
  >(
    base?: I
  ): MsgInstantiateContract;
  fromPartial<
    I_1 extends {
      sender?: string;
      admin?: string;
      codeId?: string;
      label?: string;
      msg?: Uint8Array;
      funds?: {
        denom?: string;
        amount?: string;
      }[];
    } & {
      sender?: string;
      admin?: string;
      codeId?: string;
      label?: string;
      msg?: Uint8Array;
      funds?: {
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
          [K_3 in Exclude<keyof I_1["funds"][number], keyof Coin>]: never;
        })[] & {
          [K_4 in Exclude<
            keyof I_1["funds"],
            keyof {
              denom?: string;
              amount?: string;
            }[]
          >]: never;
        };
    } & { [K_5 in Exclude<keyof I_1, keyof MsgInstantiateContract>]: never }
  >(
    object: I_1
  ): MsgInstantiateContract;
};
export declare const MsgInstantiateContractResponse: {
  encode(
    message: MsgInstantiateContractResponse,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgInstantiateContractResponse;
  fromJSON(object: any): MsgInstantiateContractResponse;
  toJSON(message: MsgInstantiateContractResponse): unknown;
  create<
    I extends {
      address?: string;
      data?: Uint8Array;
    } & {
      address?: string;
      data?: Uint8Array;
    } & { [K in Exclude<keyof I, keyof MsgInstantiateContractResponse>]: never }
  >(
    base?: I
  ): MsgInstantiateContractResponse;
  fromPartial<
    I_1 extends {
      address?: string;
      data?: Uint8Array;
    } & {
      address?: string;
      data?: Uint8Array;
    } & {
      [K_1 in Exclude<keyof I_1, keyof MsgInstantiateContractResponse>]: never;
    }
  >(
    object: I_1
  ): MsgInstantiateContractResponse;
};
export declare const MsgExecuteContract: {
  encode(message: MsgExecuteContract, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgExecuteContract;
  fromJSON(object: any): MsgExecuteContract;
  toJSON(message: MsgExecuteContract): unknown;
  create<
    I extends {
      sender?: string;
      contract?: string;
      msg?: Uint8Array;
      funds?: {
        denom?: string;
        amount?: string;
      }[];
    } & {
      sender?: string;
      contract?: string;
      msg?: Uint8Array;
      funds?: {
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
          [K in Exclude<keyof I["funds"][number], keyof Coin>]: never;
        })[] & {
          [K_1 in Exclude<
            keyof I["funds"],
            keyof {
              denom?: string;
              amount?: string;
            }[]
          >]: never;
        };
    } & { [K_2 in Exclude<keyof I, keyof MsgExecuteContract>]: never }
  >(
    base?: I
  ): MsgExecuteContract;
  fromPartial<
    I_1 extends {
      sender?: string;
      contract?: string;
      msg?: Uint8Array;
      funds?: {
        denom?: string;
        amount?: string;
      }[];
    } & {
      sender?: string;
      contract?: string;
      msg?: Uint8Array;
      funds?: {
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
          [K_3 in Exclude<keyof I_1["funds"][number], keyof Coin>]: never;
        })[] & {
          [K_4 in Exclude<
            keyof I_1["funds"],
            keyof {
              denom?: string;
              amount?: string;
            }[]
          >]: never;
        };
    } & { [K_5 in Exclude<keyof I_1, keyof MsgExecuteContract>]: never }
  >(
    object: I_1
  ): MsgExecuteContract;
};
export declare const MsgExecuteContractResponse: {
  encode(message: MsgExecuteContractResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgExecuteContractResponse;
  fromJSON(object: any): MsgExecuteContractResponse;
  toJSON(message: MsgExecuteContractResponse): unknown;
  create<
    I extends {
      data?: Uint8Array;
    } & {
      data?: Uint8Array;
    } & { [K in Exclude<keyof I, "data">]: never }
  >(
    base?: I
  ): MsgExecuteContractResponse;
  fromPartial<
    I_1 extends {
      data?: Uint8Array;
    } & {
      data?: Uint8Array;
    } & { [K_1 in Exclude<keyof I_1, "data">]: never }
  >(
    object: I_1
  ): MsgExecuteContractResponse;
};
export declare const MsgMigrateContract: {
  encode(message: MsgMigrateContract, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgMigrateContract;
  fromJSON(object: any): MsgMigrateContract;
  toJSON(message: MsgMigrateContract): unknown;
  create<
    I extends {
      sender?: string;
      contract?: string;
      codeId?: string;
      msg?: Uint8Array;
    } & {
      sender?: string;
      contract?: string;
      codeId?: string;
      msg?: Uint8Array;
    } & { [K in Exclude<keyof I, keyof MsgMigrateContract>]: never }
  >(
    base?: I
  ): MsgMigrateContract;
  fromPartial<
    I_1 extends {
      sender?: string;
      contract?: string;
      codeId?: string;
      msg?: Uint8Array;
    } & {
      sender?: string;
      contract?: string;
      codeId?: string;
      msg?: Uint8Array;
    } & { [K_1 in Exclude<keyof I_1, keyof MsgMigrateContract>]: never }
  >(
    object: I_1
  ): MsgMigrateContract;
};
export declare const MsgMigrateContractResponse: {
  encode(message: MsgMigrateContractResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgMigrateContractResponse;
  fromJSON(object: any): MsgMigrateContractResponse;
  toJSON(message: MsgMigrateContractResponse): unknown;
  create<
    I extends {
      data?: Uint8Array;
    } & {
      data?: Uint8Array;
    } & { [K in Exclude<keyof I, "data">]: never }
  >(
    base?: I
  ): MsgMigrateContractResponse;
  fromPartial<
    I_1 extends {
      data?: Uint8Array;
    } & {
      data?: Uint8Array;
    } & { [K_1 in Exclude<keyof I_1, "data">]: never }
  >(
    object: I_1
  ): MsgMigrateContractResponse;
};
export declare const MsgUpdateAdmin: {
  encode(message: MsgUpdateAdmin, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateAdmin;
  fromJSON(object: any): MsgUpdateAdmin;
  toJSON(message: MsgUpdateAdmin): unknown;
  create<
    I extends {
      sender?: string;
      newAdmin?: string;
      contract?: string;
    } & {
      sender?: string;
      newAdmin?: string;
      contract?: string;
    } & { [K in Exclude<keyof I, keyof MsgUpdateAdmin>]: never }
  >(
    base?: I
  ): MsgUpdateAdmin;
  fromPartial<
    I_1 extends {
      sender?: string;
      newAdmin?: string;
      contract?: string;
    } & {
      sender?: string;
      newAdmin?: string;
      contract?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof MsgUpdateAdmin>]: never }
  >(
    object: I_1
  ): MsgUpdateAdmin;
};
export declare const MsgUpdateAdminResponse: {
  encode(_: MsgUpdateAdminResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgUpdateAdminResponse;
  fromJSON(_: any): MsgUpdateAdminResponse;
  toJSON(_: MsgUpdateAdminResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgUpdateAdminResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgUpdateAdminResponse;
};
export declare const MsgClearAdmin: {
  encode(message: MsgClearAdmin, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgClearAdmin;
  fromJSON(object: any): MsgClearAdmin;
  toJSON(message: MsgClearAdmin): unknown;
  create<
    I extends {
      sender?: string;
      contract?: string;
    } & {
      sender?: string;
      contract?: string;
    } & { [K in Exclude<keyof I, keyof MsgClearAdmin>]: never }
  >(
    base?: I
  ): MsgClearAdmin;
  fromPartial<
    I_1 extends {
      sender?: string;
      contract?: string;
    } & {
      sender?: string;
      contract?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof MsgClearAdmin>]: never }
  >(
    object: I_1
  ): MsgClearAdmin;
};
export declare const MsgClearAdminResponse: {
  encode(_: MsgClearAdminResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgClearAdminResponse;
  fromJSON(_: any): MsgClearAdminResponse;
  toJSON(_: MsgClearAdminResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgClearAdminResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgClearAdminResponse;
};
/** Msg defines the wasm Msg service. */
export interface Msg {
  /** StoreCode to submit Wasm code to the system */
  StoreCode(request: MsgStoreCode): Promise<MsgStoreCodeResponse>;
  /** Instantiate creates a new smart contract instance for the given code id. */
  InstantiateContract(
    request: MsgInstantiateContract
  ): Promise<MsgInstantiateContractResponse>;
  /** Execute submits the given message data to a smart contract */
  ExecuteContract(
    request: MsgExecuteContract
  ): Promise<MsgExecuteContractResponse>;
  /** Migrate runs a code upgrade/ downgrade for a smart contract */
  MigrateContract(
    request: MsgMigrateContract
  ): Promise<MsgMigrateContractResponse>;
  /** UpdateAdmin sets a new   admin for a smart contract */
  UpdateAdmin(request: MsgUpdateAdmin): Promise<MsgUpdateAdminResponse>;
  /** ClearAdmin removes any admin stored for a smart contract */
  ClearAdmin(request: MsgClearAdmin): Promise<MsgClearAdminResponse>;
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

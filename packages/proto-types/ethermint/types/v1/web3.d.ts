import _m0 from "protobufjs/minimal";
export declare const protobufPackage = "ethermint.types.v1";
export interface ExtensionOptionsWeb3Tx {
  /**
   * typed data chain id used only in EIP712 Domain and should match
   * Ethereum network ID in a Web3 provider (e.g. Metamask).
   */
  typedDataChainId: string;
  /**
   * fee payer is an account address for the fee payer. It will be validated
   * during EIP712 signature checking.
   */
  feePayer: string;
  /**
   * fee payer sig is a signature data from the fee paying account,
   * allows to perform fee delegation when using EIP712 Domain.
   */
  feePayerSig: Uint8Array;
}
export declare const ExtensionOptionsWeb3Tx: {
  encode(message: ExtensionOptionsWeb3Tx, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): ExtensionOptionsWeb3Tx;
  fromJSON(object: any): ExtensionOptionsWeb3Tx;
  toJSON(message: ExtensionOptionsWeb3Tx): unknown;
  create<
    I extends {
      typedDataChainId?: string;
      feePayer?: string;
      feePayerSig?: Uint8Array;
    } & {
      typedDataChainId?: string;
      feePayer?: string;
      feePayerSig?: Uint8Array;
    } & { [K in Exclude<keyof I, keyof ExtensionOptionsWeb3Tx>]: never }
  >(
    base?: I
  ): ExtensionOptionsWeb3Tx;
  fromPartial<
    I_1 extends {
      typedDataChainId?: string;
      feePayer?: string;
      feePayerSig?: Uint8Array;
    } & {
      typedDataChainId?: string;
      feePayer?: string;
      feePayerSig?: Uint8Array;
    } & { [K_1 in Exclude<keyof I_1, keyof ExtensionOptionsWeb3Tx>]: never }
  >(
    object: I_1
  ): ExtensionOptionsWeb3Tx;
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

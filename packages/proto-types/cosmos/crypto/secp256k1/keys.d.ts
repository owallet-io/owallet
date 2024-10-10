import _m0 from "protobufjs/minimal";
export declare const protobufPackage = "cosmos.crypto.secp256k1";
/**
 * PubKey defines a secp256k1 public key
 * Key is the compressed form of the pubkey. The first byte depends is a 0x02 byte
 * if the y-coordinate is the lexicographically largest of the two associated with
 * the x-coordinate. Otherwise the first byte is a 0x03.
 * This prefix is followed with the x-coordinate.
 */
export interface PubKey {
  key: Uint8Array;
}
/** PrivKey defines a secp256k1 private key. */
export interface PrivKey {
  key: Uint8Array;
}
export declare const PubKey: {
  encode(message: PubKey, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): PubKey;
  fromJSON(object: any): PubKey;
  toJSON(message: PubKey): unknown;
  create<
    I extends {
      key?: Uint8Array;
    } & {
      key?: Uint8Array;
    } & { [K in Exclude<keyof I, "key">]: never }
  >(
    base?: I
  ): PubKey;
  fromPartial<
    I_1 extends {
      key?: Uint8Array;
    } & {
      key?: Uint8Array;
    } & { [K_1 in Exclude<keyof I_1, "key">]: never }
  >(
    object: I_1
  ): PubKey;
};
export declare const PrivKey: {
  encode(message: PrivKey, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): PrivKey;
  fromJSON(object: any): PrivKey;
  toJSON(message: PrivKey): unknown;
  create<
    I extends {
      key?: Uint8Array;
    } & {
      key?: Uint8Array;
    } & { [K in Exclude<keyof I, "key">]: never }
  >(
    base?: I
  ): PrivKey;
  fromPartial<
    I_1 extends {
      key?: Uint8Array;
    } & {
      key?: Uint8Array;
    } & { [K_1 in Exclude<keyof I_1, "key">]: never }
  >(
    object: I_1
  ): PrivKey;
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

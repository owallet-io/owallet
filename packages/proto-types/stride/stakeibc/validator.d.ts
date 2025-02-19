import _m0 from "protobufjs/minimal";
export declare const protobufPackage = "stride.stakeibc";
export interface Validator {
  name: string;
  address: string;
  weight: string;
  delegation: string;
  slashQueryProgressTracker: string;
  slashQueryCheckpoint: string;
  sharesToTokensRate: string;
  delegationChangesInProgress: string;
  slashQueryInProgress: boolean;
}
export declare const Validator: {
  encode(message: Validator, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): Validator;
  fromJSON(object: any): Validator;
  toJSON(message: Validator): unknown;
  create<
    I extends {
      name?: string;
      address?: string;
      weight?: string;
      delegation?: string;
      slashQueryProgressTracker?: string;
      slashQueryCheckpoint?: string;
      sharesToTokensRate?: string;
      delegationChangesInProgress?: string;
      slashQueryInProgress?: boolean;
    } & {
      name?: string;
      address?: string;
      weight?: string;
      delegation?: string;
      slashQueryProgressTracker?: string;
      slashQueryCheckpoint?: string;
      sharesToTokensRate?: string;
      delegationChangesInProgress?: string;
      slashQueryInProgress?: boolean;
    } & { [K in Exclude<keyof I, keyof Validator>]: never }
  >(
    base?: I
  ): Validator;
  fromPartial<
    I_1 extends {
      name?: string;
      address?: string;
      weight?: string;
      delegation?: string;
      slashQueryProgressTracker?: string;
      slashQueryCheckpoint?: string;
      sharesToTokensRate?: string;
      delegationChangesInProgress?: string;
      slashQueryInProgress?: boolean;
    } & {
      name?: string;
      address?: string;
      weight?: string;
      delegation?: string;
      slashQueryProgressTracker?: string;
      slashQueryCheckpoint?: string;
      sharesToTokensRate?: string;
      delegationChangesInProgress?: string;
      slashQueryInProgress?: boolean;
    } & { [K_1 in Exclude<keyof I_1, keyof Validator>]: never }
  >(
    object: I_1
  ): Validator;
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

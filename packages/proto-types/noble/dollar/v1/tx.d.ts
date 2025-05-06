import _m0 from "protobufjs/minimal";
export declare const protobufPackage = "noble.dollar.v1";
/** MsgClaimYield is a message holders of the Noble Dollar can use to claim their yield. */
export interface MsgClaimYield {
  signer: string;
}
/** MsgClaimYieldResponse is the response of the ClaimYield message. */
export interface MsgClaimYieldResponse {}
/** MsgSetPausedState allows the authority to configure the Noble Dollar Portal paused state. */
export interface MsgSetPausedState {
  signer: string;
  paused: boolean;
}
/** MsgSetPausedStateResponse is the response of the SetPausedState message. */
export interface MsgSetPausedStateResponse {}
export declare const MsgClaimYield: {
  encode(message: MsgClaimYield, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgClaimYield;
  fromJSON(object: any): MsgClaimYield;
  toJSON(message: MsgClaimYield): unknown;
  fromPartial<
    I extends {
      signer?: string | undefined;
    } & {
      signer?: string | undefined;
    } & Record<Exclude<keyof I, "signer">, never>
  >(
    object: I
  ): MsgClaimYield;
};
export declare const MsgClaimYieldResponse: {
  encode(_: MsgClaimYieldResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgClaimYieldResponse;
  fromJSON(_: any): MsgClaimYieldResponse;
  toJSON(_: MsgClaimYieldResponse): unknown;
  fromPartial<I extends {} & {} & Record<Exclude<keyof I, never>, never>>(
    _: I
  ): MsgClaimYieldResponse;
};
export declare const MsgSetPausedState: {
  encode(message: MsgSetPausedState, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSetPausedState;
  fromJSON(object: any): MsgSetPausedState;
  toJSON(message: MsgSetPausedState): unknown;
  fromPartial<
    I extends {
      signer?: string | undefined;
      paused?: boolean | undefined;
    } & {
      signer?: string | undefined;
      paused?: boolean | undefined;
    } & Record<Exclude<keyof I, keyof MsgSetPausedState>, never>
  >(
    object: I
  ): MsgSetPausedState;
};
export declare const MsgSetPausedStateResponse: {
  encode(_: MsgSetPausedStateResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSetPausedStateResponse;
  fromJSON(_: any): MsgSetPausedStateResponse;
  toJSON(_: MsgSetPausedStateResponse): unknown;
  fromPartial<I extends {} & {} & Record<Exclude<keyof I, never>, never>>(
    _: I
  ): MsgSetPausedStateResponse;
};
export interface Msg {
  ClaimYield(request: MsgClaimYield): Promise<MsgClaimYieldResponse>;
  SetPausedState(
    request: MsgSetPausedState
  ): Promise<MsgSetPausedStateResponse>;
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

import _m0 from "protobufjs/minimal";
export declare const protobufPackage = "agoric.swingset";
/** MsgDeliverInbound defines an SDK message for delivering an eventual send */
export interface MsgDeliverInbound {
  messages: string[];
  nums: string[];
  ack: string;
  submitter: Uint8Array;
}
/** MsgDeliverInboundResponse is an empty reply. */
export interface MsgDeliverInboundResponse {}
/**
 * MsgWalletAction defines an SDK message for the on-chain wallet to perform an
 * action that *does not* spend any assets (other than gas fees/stamps).  This
 * message type is typically protected by feegrant budgets.
 */
export interface MsgWalletAction {
  owner: Uint8Array;
  /** The action to perform, as JSON-stringified marshalled data. */
  action: string;
}
/** MsgWalletActionResponse is an empty reply. */
export interface MsgWalletActionResponse {}
/**
 * MsgWalletSpendAction defines an SDK message for the on-chain wallet to
 * perform an action that *does spend the owner's assets.*  This message type is
 * typically protected by explicit confirmation by the user.
 */
export interface MsgWalletSpendAction {
  owner: Uint8Array;
  /** The action to perform, as JSON-stringified marshalled data. */
  spendAction: string;
}
/** MsgWalletSpendActionResponse is an empty reply. */
export interface MsgWalletSpendActionResponse {}
/** MsgProvision defines an SDK message for provisioning a client to the chain */
export interface MsgProvision {
  nickname: string;
  address: Uint8Array;
  powerFlags: string[];
  submitter: Uint8Array;
}
/** MsgProvisionResponse is an empty reply. */
export interface MsgProvisionResponse {}
/** MsgInstallBundle carries a signed bundle to SwingSet. */
export interface MsgInstallBundle {
  bundle: string;
  submitter: Uint8Array;
  /**
   * Either bundle or compressed_bundle will be set.
   * Default compression algorithm is gzip.
   */
  compressedBundle: Uint8Array;
  /** Size in bytes of uncompression of compressed_bundle. */
  uncompressedSize: string;
}
/**
 * MsgInstallBundleResponse is an empty acknowledgement that an install bundle
 * message has been queued for the SwingSet kernel's consideration.
 */
export interface MsgInstallBundleResponse {}
export declare const MsgDeliverInbound: {
  encode(message: MsgDeliverInbound, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgDeliverInbound;
  fromJSON(object: any): MsgDeliverInbound;
  toJSON(message: MsgDeliverInbound): unknown;
  create<
    I extends {
      messages?: string[];
      nums?: string[];
      ack?: string;
      submitter?: Uint8Array;
    } & {
      messages?: string[] &
        string[] & {
          [K in Exclude<keyof I["messages"], keyof string[]>]: never;
        };
      nums?: string[] &
        string[] & { [K_1 in Exclude<keyof I["nums"], keyof string[]>]: never };
      ack?: string;
      submitter?: Uint8Array;
    } & { [K_2 in Exclude<keyof I, keyof MsgDeliverInbound>]: never }
  >(
    base?: I
  ): MsgDeliverInbound;
  fromPartial<
    I_1 extends {
      messages?: string[];
      nums?: string[];
      ack?: string;
      submitter?: Uint8Array;
    } & {
      messages?: string[] &
        string[] & {
          [K_3 in Exclude<keyof I_1["messages"], keyof string[]>]: never;
        };
      nums?: string[] &
        string[] & {
          [K_4 in Exclude<keyof I_1["nums"], keyof string[]>]: never;
        };
      ack?: string;
      submitter?: Uint8Array;
    } & { [K_5 in Exclude<keyof I_1, keyof MsgDeliverInbound>]: never }
  >(
    object: I_1
  ): MsgDeliverInbound;
};
export declare const MsgDeliverInboundResponse: {
  encode(_: MsgDeliverInboundResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgDeliverInboundResponse;
  fromJSON(_: any): MsgDeliverInboundResponse;
  toJSON(_: MsgDeliverInboundResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgDeliverInboundResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgDeliverInboundResponse;
};
export declare const MsgWalletAction: {
  encode(message: MsgWalletAction, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgWalletAction;
  fromJSON(object: any): MsgWalletAction;
  toJSON(message: MsgWalletAction): unknown;
  create<
    I extends {
      owner?: Uint8Array;
      action?: string;
    } & {
      owner?: Uint8Array;
      action?: string;
    } & { [K in Exclude<keyof I, keyof MsgWalletAction>]: never }
  >(
    base?: I
  ): MsgWalletAction;
  fromPartial<
    I_1 extends {
      owner?: Uint8Array;
      action?: string;
    } & {
      owner?: Uint8Array;
      action?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof MsgWalletAction>]: never }
  >(
    object: I_1
  ): MsgWalletAction;
};
export declare const MsgWalletActionResponse: {
  encode(_: MsgWalletActionResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgWalletActionResponse;
  fromJSON(_: any): MsgWalletActionResponse;
  toJSON(_: MsgWalletActionResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgWalletActionResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgWalletActionResponse;
};
export declare const MsgWalletSpendAction: {
  encode(message: MsgWalletSpendAction, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgWalletSpendAction;
  fromJSON(object: any): MsgWalletSpendAction;
  toJSON(message: MsgWalletSpendAction): unknown;
  create<
    I extends {
      owner?: Uint8Array;
      spendAction?: string;
    } & {
      owner?: Uint8Array;
      spendAction?: string;
    } & { [K in Exclude<keyof I, keyof MsgWalletSpendAction>]: never }
  >(
    base?: I
  ): MsgWalletSpendAction;
  fromPartial<
    I_1 extends {
      owner?: Uint8Array;
      spendAction?: string;
    } & {
      owner?: Uint8Array;
      spendAction?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof MsgWalletSpendAction>]: never }
  >(
    object: I_1
  ): MsgWalletSpendAction;
};
export declare const MsgWalletSpendActionResponse: {
  encode(_: MsgWalletSpendActionResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgWalletSpendActionResponse;
  fromJSON(_: any): MsgWalletSpendActionResponse;
  toJSON(_: MsgWalletSpendActionResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgWalletSpendActionResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgWalletSpendActionResponse;
};
export declare const MsgProvision: {
  encode(message: MsgProvision, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgProvision;
  fromJSON(object: any): MsgProvision;
  toJSON(message: MsgProvision): unknown;
  create<
    I extends {
      nickname?: string;
      address?: Uint8Array;
      powerFlags?: string[];
      submitter?: Uint8Array;
    } & {
      nickname?: string;
      address?: Uint8Array;
      powerFlags?: string[] &
        string[] & {
          [K in Exclude<keyof I["powerFlags"], keyof string[]>]: never;
        };
      submitter?: Uint8Array;
    } & { [K_1 in Exclude<keyof I, keyof MsgProvision>]: never }
  >(
    base?: I
  ): MsgProvision;
  fromPartial<
    I_1 extends {
      nickname?: string;
      address?: Uint8Array;
      powerFlags?: string[];
      submitter?: Uint8Array;
    } & {
      nickname?: string;
      address?: Uint8Array;
      powerFlags?: string[] &
        string[] & {
          [K_2 in Exclude<keyof I_1["powerFlags"], keyof string[]>]: never;
        };
      submitter?: Uint8Array;
    } & { [K_3 in Exclude<keyof I_1, keyof MsgProvision>]: never }
  >(
    object: I_1
  ): MsgProvision;
};
export declare const MsgProvisionResponse: {
  encode(_: MsgProvisionResponse, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgProvisionResponse;
  fromJSON(_: any): MsgProvisionResponse;
  toJSON(_: MsgProvisionResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgProvisionResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgProvisionResponse;
};
export declare const MsgInstallBundle: {
  encode(message: MsgInstallBundle, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgInstallBundle;
  fromJSON(object: any): MsgInstallBundle;
  toJSON(message: MsgInstallBundle): unknown;
  create<
    I extends {
      bundle?: string;
      submitter?: Uint8Array;
      compressedBundle?: Uint8Array;
      uncompressedSize?: string;
    } & {
      bundle?: string;
      submitter?: Uint8Array;
      compressedBundle?: Uint8Array;
      uncompressedSize?: string;
    } & { [K in Exclude<keyof I, keyof MsgInstallBundle>]: never }
  >(
    base?: I
  ): MsgInstallBundle;
  fromPartial<
    I_1 extends {
      bundle?: string;
      submitter?: Uint8Array;
      compressedBundle?: Uint8Array;
      uncompressedSize?: string;
    } & {
      bundle?: string;
      submitter?: Uint8Array;
      compressedBundle?: Uint8Array;
      uncompressedSize?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof MsgInstallBundle>]: never }
  >(
    object: I_1
  ): MsgInstallBundle;
};
export declare const MsgInstallBundleResponse: {
  encode(_: MsgInstallBundleResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgInstallBundleResponse;
  fromJSON(_: any): MsgInstallBundleResponse;
  toJSON(_: MsgInstallBundleResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgInstallBundleResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgInstallBundleResponse;
};
/** Transactions. */
export interface Msg {
  /** Install a JavaScript sources bundle on the chain's SwingSet controller. */
  InstallBundle(request: MsgInstallBundle): Promise<MsgInstallBundleResponse>;
  /** Send inbound messages. */
  DeliverInbound(
    request: MsgDeliverInbound
  ): Promise<MsgDeliverInboundResponse>;
  /** Perform a low-privilege wallet action. */
  WalletAction(request: MsgWalletAction): Promise<MsgWalletActionResponse>;
  /** Perform a wallet action that spends assets. */
  WalletSpendAction(
    request: MsgWalletSpendAction
  ): Promise<MsgWalletSpendActionResponse>;
  /** Provision a new endpoint. */
  Provision(request: MsgProvision): Promise<MsgProvisionResponse>;
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

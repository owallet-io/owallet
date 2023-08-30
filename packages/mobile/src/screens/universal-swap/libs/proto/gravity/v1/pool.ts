/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "gravity.v1";

/** IDSet represents a set of IDs */
export interface IDSet {
  ids: string[];
}

export interface BatchFees {
  token: string;
  totalFees: string;
  txCount: string;
}

export interface EventWithdrawalReceived {
  bridgeContract: string;
  bridgeChainId: string;
  outgoingTxId: string;
  nonce: string;
}

export interface EventWithdrawCanceled {
  sender: string;
  txId: string;
  bridgeContract: string;
  bridgeChainId: string;
}

function createBaseIDSet(): IDSet {
  return { ids: [] };
}

export const IDSet = {
  encode(message: IDSet, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.ids) {
      writer.uint64(v);
    }
    writer.ldelim();
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): IDSet {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIDSet();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.ids.push(longToString(reader.uint64() as Long));
            }
          } else {
            message.ids.push(longToString(reader.uint64() as Long));
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): IDSet {
    return { ids: Array.isArray(object?.ids) ? object.ids.map((e: any) => String(e)) : [] };
  },

  toJSON(message: IDSet): unknown {
    const obj: any = {};
    if (message.ids) {
      obj.ids = message.ids.map((e) => e);
    } else {
      obj.ids = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<IDSet>, I>>(base?: I): IDSet {
    return IDSet.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<IDSet>, I>>(object: I): IDSet {
    const message = createBaseIDSet();
    message.ids = object.ids?.map((e) => e) || [];
    return message;
  },
};

function createBaseBatchFees(): BatchFees {
  return { token: "", totalFees: "", txCount: "0" };
}

export const BatchFees = {
  encode(message: BatchFees, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.token !== "") {
      writer.uint32(10).string(message.token);
    }
    if (message.totalFees !== "") {
      writer.uint32(18).string(message.totalFees);
    }
    if (message.txCount !== "0") {
      writer.uint32(24).uint64(message.txCount);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BatchFees {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBatchFees();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.token = reader.string();
          break;
        case 2:
          message.totalFees = reader.string();
          break;
        case 3:
          message.txCount = longToString(reader.uint64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): BatchFees {
    return {
      token: isSet(object.token) ? String(object.token) : "",
      totalFees: isSet(object.totalFees) ? String(object.totalFees) : "",
      txCount: isSet(object.txCount) ? String(object.txCount) : "0",
    };
  },

  toJSON(message: BatchFees): unknown {
    const obj: any = {};
    message.token !== undefined && (obj.token = message.token);
    message.totalFees !== undefined && (obj.totalFees = message.totalFees);
    message.txCount !== undefined && (obj.txCount = message.txCount);
    return obj;
  },

  create<I extends Exact<DeepPartial<BatchFees>, I>>(base?: I): BatchFees {
    return BatchFees.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<BatchFees>, I>>(object: I): BatchFees {
    const message = createBaseBatchFees();
    message.token = object.token ?? "";
    message.totalFees = object.totalFees ?? "";
    message.txCount = object.txCount ?? "0";
    return message;
  },
};

function createBaseEventWithdrawalReceived(): EventWithdrawalReceived {
  return { bridgeContract: "", bridgeChainId: "", outgoingTxId: "", nonce: "" };
}

export const EventWithdrawalReceived = {
  encode(message: EventWithdrawalReceived, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.bridgeContract !== "") {
      writer.uint32(10).string(message.bridgeContract);
    }
    if (message.bridgeChainId !== "") {
      writer.uint32(18).string(message.bridgeChainId);
    }
    if (message.outgoingTxId !== "") {
      writer.uint32(26).string(message.outgoingTxId);
    }
    if (message.nonce !== "") {
      writer.uint32(34).string(message.nonce);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventWithdrawalReceived {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventWithdrawalReceived();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.bridgeContract = reader.string();
          break;
        case 2:
          message.bridgeChainId = reader.string();
          break;
        case 3:
          message.outgoingTxId = reader.string();
          break;
        case 4:
          message.nonce = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EventWithdrawalReceived {
    return {
      bridgeContract: isSet(object.bridgeContract) ? String(object.bridgeContract) : "",
      bridgeChainId: isSet(object.bridgeChainId) ? String(object.bridgeChainId) : "",
      outgoingTxId: isSet(object.outgoingTxId) ? String(object.outgoingTxId) : "",
      nonce: isSet(object.nonce) ? String(object.nonce) : "",
    };
  },

  toJSON(message: EventWithdrawalReceived): unknown {
    const obj: any = {};
    message.bridgeContract !== undefined && (obj.bridgeContract = message.bridgeContract);
    message.bridgeChainId !== undefined && (obj.bridgeChainId = message.bridgeChainId);
    message.outgoingTxId !== undefined && (obj.outgoingTxId = message.outgoingTxId);
    message.nonce !== undefined && (obj.nonce = message.nonce);
    return obj;
  },

  create<I extends Exact<DeepPartial<EventWithdrawalReceived>, I>>(base?: I): EventWithdrawalReceived {
    return EventWithdrawalReceived.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<EventWithdrawalReceived>, I>>(object: I): EventWithdrawalReceived {
    const message = createBaseEventWithdrawalReceived();
    message.bridgeContract = object.bridgeContract ?? "";
    message.bridgeChainId = object.bridgeChainId ?? "";
    message.outgoingTxId = object.outgoingTxId ?? "";
    message.nonce = object.nonce ?? "";
    return message;
  },
};

function createBaseEventWithdrawCanceled(): EventWithdrawCanceled {
  return { sender: "", txId: "", bridgeContract: "", bridgeChainId: "" };
}

export const EventWithdrawCanceled = {
  encode(message: EventWithdrawCanceled, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (message.txId !== "") {
      writer.uint32(18).string(message.txId);
    }
    if (message.bridgeContract !== "") {
      writer.uint32(26).string(message.bridgeContract);
    }
    if (message.bridgeChainId !== "") {
      writer.uint32(34).string(message.bridgeChainId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventWithdrawCanceled {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventWithdrawCanceled();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.txId = reader.string();
          break;
        case 3:
          message.bridgeContract = reader.string();
          break;
        case 4:
          message.bridgeChainId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EventWithdrawCanceled {
    return {
      sender: isSet(object.sender) ? String(object.sender) : "",
      txId: isSet(object.txId) ? String(object.txId) : "",
      bridgeContract: isSet(object.bridgeContract) ? String(object.bridgeContract) : "",
      bridgeChainId: isSet(object.bridgeChainId) ? String(object.bridgeChainId) : "",
    };
  },

  toJSON(message: EventWithdrawCanceled): unknown {
    const obj: any = {};
    message.sender !== undefined && (obj.sender = message.sender);
    message.txId !== undefined && (obj.txId = message.txId);
    message.bridgeContract !== undefined && (obj.bridgeContract = message.bridgeContract);
    message.bridgeChainId !== undefined && (obj.bridgeChainId = message.bridgeChainId);
    return obj;
  },

  create<I extends Exact<DeepPartial<EventWithdrawCanceled>, I>>(base?: I): EventWithdrawCanceled {
    return EventWithdrawCanceled.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<EventWithdrawCanceled>, I>>(object: I): EventWithdrawCanceled {
    const message = createBaseEventWithdrawCanceled();
    message.sender = object.sender ?? "";
    message.txId = object.txId ?? "";
    message.bridgeContract = object.bridgeContract ?? "";
    message.bridgeChainId = object.bridgeChainId ?? "";
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function longToString(long: Long) {
  return long.toString();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}

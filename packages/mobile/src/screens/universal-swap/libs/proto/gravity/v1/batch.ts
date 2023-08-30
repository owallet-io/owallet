/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { ERC20Token } from "./attestation";

export const protobufPackage = "gravity.v1";

/** OutgoingTxBatch represents a batch of transactions going from gravity to ETH */
export interface OutgoingTxBatch {
  batchNonce: string;
  batchTimeout: string;
  transactions: OutgoingTransferTx[];
  tokenContract: string;
  cosmosBlockCreated: string;
}

/** OutgoingTransferTx represents an individual send from gravity to ETH */
export interface OutgoingTransferTx {
  id: string;
  sender: string;
  destAddress: string;
  erc20Token: ERC20Token | undefined;
  erc20Fee: ERC20Token | undefined;
}

/** OutgoingLogicCall represents an individual logic call from gravity to ETH */
export interface OutgoingLogicCall {
  transfers: ERC20Token[];
  fees: ERC20Token[];
  logicContractAddress: string;
  payload: Uint8Array;
  timeout: string;
  invalidationId: Uint8Array;
  invalidationNonce: string;
  cosmosBlockCreated: string;
}

export interface EventOutgoingBatchCanceled {
  bridgeContract: string;
  bridgeChainId: string;
  batchId: string;
  nonce: string;
}

export interface EventOutgoingBatch {
  bridgeContract: string;
  bridgeChainId: string;
  batchId: string;
  nonce: string;
}

function createBaseOutgoingTxBatch(): OutgoingTxBatch {
  return { batchNonce: "0", batchTimeout: "0", transactions: [], tokenContract: "", cosmosBlockCreated: "0" };
}

export const OutgoingTxBatch = {
  encode(message: OutgoingTxBatch, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.batchNonce !== "0") {
      writer.uint32(8).uint64(message.batchNonce);
    }
    if (message.batchTimeout !== "0") {
      writer.uint32(16).uint64(message.batchTimeout);
    }
    for (const v of message.transactions) {
      OutgoingTransferTx.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (message.tokenContract !== "") {
      writer.uint32(34).string(message.tokenContract);
    }
    if (message.cosmosBlockCreated !== "0") {
      writer.uint32(40).uint64(message.cosmosBlockCreated);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): OutgoingTxBatch {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOutgoingTxBatch();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.batchNonce = longToString(reader.uint64() as Long);
          break;
        case 2:
          message.batchTimeout = longToString(reader.uint64() as Long);
          break;
        case 3:
          message.transactions.push(OutgoingTransferTx.decode(reader, reader.uint32()));
          break;
        case 4:
          message.tokenContract = reader.string();
          break;
        case 5:
          message.cosmosBlockCreated = longToString(reader.uint64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): OutgoingTxBatch {
    return {
      batchNonce: isSet(object.batchNonce) ? String(object.batchNonce) : "0",
      batchTimeout: isSet(object.batchTimeout) ? String(object.batchTimeout) : "0",
      transactions: Array.isArray(object?.transactions)
        ? object.transactions.map((e: any) => OutgoingTransferTx.fromJSON(e))
        : [],
      tokenContract: isSet(object.tokenContract) ? String(object.tokenContract) : "",
      cosmosBlockCreated: isSet(object.cosmosBlockCreated) ? String(object.cosmosBlockCreated) : "0",
    };
  },

  toJSON(message: OutgoingTxBatch): unknown {
    const obj: any = {};
    message.batchNonce !== undefined && (obj.batchNonce = message.batchNonce);
    message.batchTimeout !== undefined && (obj.batchTimeout = message.batchTimeout);
    if (message.transactions) {
      obj.transactions = message.transactions.map((e) => e ? OutgoingTransferTx.toJSON(e) : undefined);
    } else {
      obj.transactions = [];
    }
    message.tokenContract !== undefined && (obj.tokenContract = message.tokenContract);
    message.cosmosBlockCreated !== undefined && (obj.cosmosBlockCreated = message.cosmosBlockCreated);
    return obj;
  },

  create<I extends Exact<DeepPartial<OutgoingTxBatch>, I>>(base?: I): OutgoingTxBatch {
    return OutgoingTxBatch.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<OutgoingTxBatch>, I>>(object: I): OutgoingTxBatch {
    const message = createBaseOutgoingTxBatch();
    message.batchNonce = object.batchNonce ?? "0";
    message.batchTimeout = object.batchTimeout ?? "0";
    message.transactions = object.transactions?.map((e) => OutgoingTransferTx.fromPartial(e)) || [];
    message.tokenContract = object.tokenContract ?? "";
    message.cosmosBlockCreated = object.cosmosBlockCreated ?? "0";
    return message;
  },
};

function createBaseOutgoingTransferTx(): OutgoingTransferTx {
  return { id: "0", sender: "", destAddress: "", erc20Token: undefined, erc20Fee: undefined };
}

export const OutgoingTransferTx = {
  encode(message: OutgoingTransferTx, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "0") {
      writer.uint32(8).uint64(message.id);
    }
    if (message.sender !== "") {
      writer.uint32(18).string(message.sender);
    }
    if (message.destAddress !== "") {
      writer.uint32(26).string(message.destAddress);
    }
    if (message.erc20Token !== undefined) {
      ERC20Token.encode(message.erc20Token, writer.uint32(34).fork()).ldelim();
    }
    if (message.erc20Fee !== undefined) {
      ERC20Token.encode(message.erc20Fee, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): OutgoingTransferTx {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOutgoingTransferTx();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = longToString(reader.uint64() as Long);
          break;
        case 2:
          message.sender = reader.string();
          break;
        case 3:
          message.destAddress = reader.string();
          break;
        case 4:
          message.erc20Token = ERC20Token.decode(reader, reader.uint32());
          break;
        case 5:
          message.erc20Fee = ERC20Token.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): OutgoingTransferTx {
    return {
      id: isSet(object.id) ? String(object.id) : "0",
      sender: isSet(object.sender) ? String(object.sender) : "",
      destAddress: isSet(object.destAddress) ? String(object.destAddress) : "",
      erc20Token: isSet(object.erc20Token) ? ERC20Token.fromJSON(object.erc20Token) : undefined,
      erc20Fee: isSet(object.erc20Fee) ? ERC20Token.fromJSON(object.erc20Fee) : undefined,
    };
  },

  toJSON(message: OutgoingTransferTx): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.sender !== undefined && (obj.sender = message.sender);
    message.destAddress !== undefined && (obj.destAddress = message.destAddress);
    message.erc20Token !== undefined &&
      (obj.erc20Token = message.erc20Token ? ERC20Token.toJSON(message.erc20Token) : undefined);
    message.erc20Fee !== undefined &&
      (obj.erc20Fee = message.erc20Fee ? ERC20Token.toJSON(message.erc20Fee) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<OutgoingTransferTx>, I>>(base?: I): OutgoingTransferTx {
    return OutgoingTransferTx.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<OutgoingTransferTx>, I>>(object: I): OutgoingTransferTx {
    const message = createBaseOutgoingTransferTx();
    message.id = object.id ?? "0";
    message.sender = object.sender ?? "";
    message.destAddress = object.destAddress ?? "";
    message.erc20Token = (object.erc20Token !== undefined && object.erc20Token !== null)
      ? ERC20Token.fromPartial(object.erc20Token)
      : undefined;
    message.erc20Fee = (object.erc20Fee !== undefined && object.erc20Fee !== null)
      ? ERC20Token.fromPartial(object.erc20Fee)
      : undefined;
    return message;
  },
};

function createBaseOutgoingLogicCall(): OutgoingLogicCall {
  return {
    transfers: [],
    fees: [],
    logicContractAddress: "",
    payload: new Uint8Array(),
    timeout: "0",
    invalidationId: new Uint8Array(),
    invalidationNonce: "0",
    cosmosBlockCreated: "0",
  };
}

export const OutgoingLogicCall = {
  encode(message: OutgoingLogicCall, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.transfers) {
      ERC20Token.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.fees) {
      ERC20Token.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.logicContractAddress !== "") {
      writer.uint32(26).string(message.logicContractAddress);
    }
    if (message.payload.length !== 0) {
      writer.uint32(34).bytes(message.payload);
    }
    if (message.timeout !== "0") {
      writer.uint32(40).uint64(message.timeout);
    }
    if (message.invalidationId.length !== 0) {
      writer.uint32(50).bytes(message.invalidationId);
    }
    if (message.invalidationNonce !== "0") {
      writer.uint32(56).uint64(message.invalidationNonce);
    }
    if (message.cosmosBlockCreated !== "0") {
      writer.uint32(64).uint64(message.cosmosBlockCreated);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): OutgoingLogicCall {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOutgoingLogicCall();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.transfers.push(ERC20Token.decode(reader, reader.uint32()));
          break;
        case 2:
          message.fees.push(ERC20Token.decode(reader, reader.uint32()));
          break;
        case 3:
          message.logicContractAddress = reader.string();
          break;
        case 4:
          message.payload = reader.bytes();
          break;
        case 5:
          message.timeout = longToString(reader.uint64() as Long);
          break;
        case 6:
          message.invalidationId = reader.bytes();
          break;
        case 7:
          message.invalidationNonce = longToString(reader.uint64() as Long);
          break;
        case 8:
          message.cosmosBlockCreated = longToString(reader.uint64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): OutgoingLogicCall {
    return {
      transfers: Array.isArray(object?.transfers) ? object.transfers.map((e: any) => ERC20Token.fromJSON(e)) : [],
      fees: Array.isArray(object?.fees) ? object.fees.map((e: any) => ERC20Token.fromJSON(e)) : [],
      logicContractAddress: isSet(object.logicContractAddress) ? String(object.logicContractAddress) : "",
      payload: isSet(object.payload) ? bytesFromBase64(object.payload) : new Uint8Array(),
      timeout: isSet(object.timeout) ? String(object.timeout) : "0",
      invalidationId: isSet(object.invalidationId) ? bytesFromBase64(object.invalidationId) : new Uint8Array(),
      invalidationNonce: isSet(object.invalidationNonce) ? String(object.invalidationNonce) : "0",
      cosmosBlockCreated: isSet(object.cosmosBlockCreated) ? String(object.cosmosBlockCreated) : "0",
    };
  },

  toJSON(message: OutgoingLogicCall): unknown {
    const obj: any = {};
    if (message.transfers) {
      obj.transfers = message.transfers.map((e) => e ? ERC20Token.toJSON(e) : undefined);
    } else {
      obj.transfers = [];
    }
    if (message.fees) {
      obj.fees = message.fees.map((e) => e ? ERC20Token.toJSON(e) : undefined);
    } else {
      obj.fees = [];
    }
    message.logicContractAddress !== undefined && (obj.logicContractAddress = message.logicContractAddress);
    message.payload !== undefined &&
      (obj.payload = base64FromBytes(message.payload !== undefined ? message.payload : new Uint8Array()));
    message.timeout !== undefined && (obj.timeout = message.timeout);
    message.invalidationId !== undefined &&
      (obj.invalidationId = base64FromBytes(
        message.invalidationId !== undefined ? message.invalidationId : new Uint8Array(),
      ));
    message.invalidationNonce !== undefined && (obj.invalidationNonce = message.invalidationNonce);
    message.cosmosBlockCreated !== undefined && (obj.cosmosBlockCreated = message.cosmosBlockCreated);
    return obj;
  },

  create<I extends Exact<DeepPartial<OutgoingLogicCall>, I>>(base?: I): OutgoingLogicCall {
    return OutgoingLogicCall.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<OutgoingLogicCall>, I>>(object: I): OutgoingLogicCall {
    const message = createBaseOutgoingLogicCall();
    message.transfers = object.transfers?.map((e) => ERC20Token.fromPartial(e)) || [];
    message.fees = object.fees?.map((e) => ERC20Token.fromPartial(e)) || [];
    message.logicContractAddress = object.logicContractAddress ?? "";
    message.payload = object.payload ?? new Uint8Array();
    message.timeout = object.timeout ?? "0";
    message.invalidationId = object.invalidationId ?? new Uint8Array();
    message.invalidationNonce = object.invalidationNonce ?? "0";
    message.cosmosBlockCreated = object.cosmosBlockCreated ?? "0";
    return message;
  },
};

function createBaseEventOutgoingBatchCanceled(): EventOutgoingBatchCanceled {
  return { bridgeContract: "", bridgeChainId: "", batchId: "", nonce: "" };
}

export const EventOutgoingBatchCanceled = {
  encode(message: EventOutgoingBatchCanceled, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.bridgeContract !== "") {
      writer.uint32(10).string(message.bridgeContract);
    }
    if (message.bridgeChainId !== "") {
      writer.uint32(18).string(message.bridgeChainId);
    }
    if (message.batchId !== "") {
      writer.uint32(26).string(message.batchId);
    }
    if (message.nonce !== "") {
      writer.uint32(34).string(message.nonce);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventOutgoingBatchCanceled {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventOutgoingBatchCanceled();
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
          message.batchId = reader.string();
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

  fromJSON(object: any): EventOutgoingBatchCanceled {
    return {
      bridgeContract: isSet(object.bridgeContract) ? String(object.bridgeContract) : "",
      bridgeChainId: isSet(object.bridgeChainId) ? String(object.bridgeChainId) : "",
      batchId: isSet(object.batchId) ? String(object.batchId) : "",
      nonce: isSet(object.nonce) ? String(object.nonce) : "",
    };
  },

  toJSON(message: EventOutgoingBatchCanceled): unknown {
    const obj: any = {};
    message.bridgeContract !== undefined && (obj.bridgeContract = message.bridgeContract);
    message.bridgeChainId !== undefined && (obj.bridgeChainId = message.bridgeChainId);
    message.batchId !== undefined && (obj.batchId = message.batchId);
    message.nonce !== undefined && (obj.nonce = message.nonce);
    return obj;
  },

  create<I extends Exact<DeepPartial<EventOutgoingBatchCanceled>, I>>(base?: I): EventOutgoingBatchCanceled {
    return EventOutgoingBatchCanceled.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<EventOutgoingBatchCanceled>, I>>(object: I): EventOutgoingBatchCanceled {
    const message = createBaseEventOutgoingBatchCanceled();
    message.bridgeContract = object.bridgeContract ?? "";
    message.bridgeChainId = object.bridgeChainId ?? "";
    message.batchId = object.batchId ?? "";
    message.nonce = object.nonce ?? "";
    return message;
  },
};

function createBaseEventOutgoingBatch(): EventOutgoingBatch {
  return { bridgeContract: "", bridgeChainId: "", batchId: "", nonce: "" };
}

export const EventOutgoingBatch = {
  encode(message: EventOutgoingBatch, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.bridgeContract !== "") {
      writer.uint32(10).string(message.bridgeContract);
    }
    if (message.bridgeChainId !== "") {
      writer.uint32(18).string(message.bridgeChainId);
    }
    if (message.batchId !== "") {
      writer.uint32(26).string(message.batchId);
    }
    if (message.nonce !== "") {
      writer.uint32(34).string(message.nonce);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventOutgoingBatch {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventOutgoingBatch();
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
          message.batchId = reader.string();
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

  fromJSON(object: any): EventOutgoingBatch {
    return {
      bridgeContract: isSet(object.bridgeContract) ? String(object.bridgeContract) : "",
      bridgeChainId: isSet(object.bridgeChainId) ? String(object.bridgeChainId) : "",
      batchId: isSet(object.batchId) ? String(object.batchId) : "",
      nonce: isSet(object.nonce) ? String(object.nonce) : "",
    };
  },

  toJSON(message: EventOutgoingBatch): unknown {
    const obj: any = {};
    message.bridgeContract !== undefined && (obj.bridgeContract = message.bridgeContract);
    message.bridgeChainId !== undefined && (obj.bridgeChainId = message.bridgeChainId);
    message.batchId !== undefined && (obj.batchId = message.batchId);
    message.nonce !== undefined && (obj.nonce = message.nonce);
    return obj;
  },

  create<I extends Exact<DeepPartial<EventOutgoingBatch>, I>>(base?: I): EventOutgoingBatch {
    return EventOutgoingBatch.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<EventOutgoingBatch>, I>>(object: I): EventOutgoingBatch {
    const message = createBaseEventOutgoingBatch();
    message.bridgeContract = object.bridgeContract ?? "";
    message.bridgeChainId = object.bridgeChainId ?? "";
    message.batchId = object.batchId ?? "";
    message.nonce = object.nonce ?? "";
    return message;
  },
};

declare var self: any | undefined;
declare var window: any | undefined;
declare var global: any | undefined;
var tsProtoGlobalThis: any = (() => {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw "Unable to locate global object";
})();

function bytesFromBase64(b64: string): Uint8Array {
  if (tsProtoGlobalThis.Buffer) {
    return Uint8Array.from(tsProtoGlobalThis.Buffer.from(b64, "base64"));
  } else {
    const bin = tsProtoGlobalThis.atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; ++i) {
      arr[i] = bin.charCodeAt(i);
    }
    return arr;
  }
}

function base64FromBytes(arr: Uint8Array): string {
  if (tsProtoGlobalThis.Buffer) {
    return tsProtoGlobalThis.Buffer.from(arr).toString("base64");
  } else {
    const bin: string[] = [];
    arr.forEach((byte) => {
      bin.push(String.fromCharCode(byte));
    });
    return tsProtoGlobalThis.btoa(bin.join(""));
  }
}

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

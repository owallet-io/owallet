"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MsgExecuteContract = exports.MsgInstantiateContract = exports.MsgStoreCode = exports.protobufPackage = void 0;
/* eslint-disable */
const long_1 = __importDefault(require("long"));
const minimal_1 = __importDefault(require("protobufjs/minimal"));
const coin_1 = require("../../../cosmos/base/v1beta1/coin");
exports.protobufPackage = "secret.compute.v1beta1";
function createBaseMsgStoreCode() {
    return { sender: new Uint8Array(), wasmByteCode: new Uint8Array(), source: "", builder: "" };
}
exports.MsgStoreCode = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.sender.length !== 0) {
            writer.uint32(10).bytes(message.sender);
        }
        if (message.wasmByteCode.length !== 0) {
            writer.uint32(18).bytes(message.wasmByteCode);
        }
        if (message.source !== "") {
            writer.uint32(26).string(message.source);
        }
        if (message.builder !== "") {
            writer.uint32(34).string(message.builder);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgStoreCode();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.sender = reader.bytes();
                    break;
                case 2:
                    message.wasmByteCode = reader.bytes();
                    break;
                case 3:
                    message.source = reader.string();
                    break;
                case 4:
                    message.builder = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            sender: isSet(object.sender) ? bytesFromBase64(object.sender) : new Uint8Array(),
            wasmByteCode: isSet(object.wasmByteCode) ? bytesFromBase64(object.wasmByteCode) : new Uint8Array(),
            source: isSet(object.source) ? String(object.source) : "",
            builder: isSet(object.builder) ? String(object.builder) : "",
        };
    },
    toJSON(message) {
        const obj = {};
        message.sender !== undefined &&
            (obj.sender = base64FromBytes(message.sender !== undefined ? message.sender : new Uint8Array()));
        message.wasmByteCode !== undefined &&
            (obj.wasmByteCode = base64FromBytes(message.wasmByteCode !== undefined ? message.wasmByteCode : new Uint8Array()));
        message.source !== undefined && (obj.source = message.source);
        message.builder !== undefined && (obj.builder = message.builder);
        return obj;
    },
    create(base) {
        return exports.MsgStoreCode.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(object) {
        var _a, _b, _c, _d;
        const message = createBaseMsgStoreCode();
        message.sender = (_a = object.sender) !== null && _a !== void 0 ? _a : new Uint8Array();
        message.wasmByteCode = (_b = object.wasmByteCode) !== null && _b !== void 0 ? _b : new Uint8Array();
        message.source = (_c = object.source) !== null && _c !== void 0 ? _c : "";
        message.builder = (_d = object.builder) !== null && _d !== void 0 ? _d : "";
        return message;
    },
};
function createBaseMsgInstantiateContract() {
    return {
        sender: new Uint8Array(),
        callbackCodeHash: "",
        codeId: "0",
        label: "",
        initMsg: new Uint8Array(),
        initFunds: [],
        callbackSig: new Uint8Array(),
    };
}
exports.MsgInstantiateContract = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.sender.length !== 0) {
            writer.uint32(10).bytes(message.sender);
        }
        if (message.callbackCodeHash !== "") {
            writer.uint32(18).string(message.callbackCodeHash);
        }
        if (message.codeId !== "0") {
            writer.uint32(24).uint64(message.codeId);
        }
        if (message.label !== "") {
            writer.uint32(34).string(message.label);
        }
        if (message.initMsg.length !== 0) {
            writer.uint32(42).bytes(message.initMsg);
        }
        for (const v of message.initFunds) {
            coin_1.Coin.encode(v, writer.uint32(50).fork()).ldelim();
        }
        if (message.callbackSig.length !== 0) {
            writer.uint32(58).bytes(message.callbackSig);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgInstantiateContract();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.sender = reader.bytes();
                    break;
                case 2:
                    message.callbackCodeHash = reader.string();
                    break;
                case 3:
                    message.codeId = longToString(reader.uint64());
                    break;
                case 4:
                    message.label = reader.string();
                    break;
                case 5:
                    message.initMsg = reader.bytes();
                    break;
                case 6:
                    message.initFunds.push(coin_1.Coin.decode(reader, reader.uint32()));
                    break;
                case 7:
                    message.callbackSig = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            sender: isSet(object.sender) ? bytesFromBase64(object.sender) : new Uint8Array(),
            callbackCodeHash: isSet(object.callbackCodeHash) ? String(object.callbackCodeHash) : "",
            codeId: isSet(object.codeId) ? String(object.codeId) : "0",
            label: isSet(object.label) ? String(object.label) : "",
            initMsg: isSet(object.initMsg) ? bytesFromBase64(object.initMsg) : new Uint8Array(),
            initFunds: Array.isArray(object === null || object === void 0 ? void 0 : object.initFunds) ? object.initFunds.map((e) => coin_1.Coin.fromJSON(e)) : [],
            callbackSig: isSet(object.callbackSig) ? bytesFromBase64(object.callbackSig) : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.sender !== undefined &&
            (obj.sender = base64FromBytes(message.sender !== undefined ? message.sender : new Uint8Array()));
        message.callbackCodeHash !== undefined && (obj.callbackCodeHash = message.callbackCodeHash);
        message.codeId !== undefined && (obj.codeId = message.codeId);
        message.label !== undefined && (obj.label = message.label);
        message.initMsg !== undefined &&
            (obj.initMsg = base64FromBytes(message.initMsg !== undefined ? message.initMsg : new Uint8Array()));
        if (message.initFunds) {
            obj.initFunds = message.initFunds.map((e) => e ? coin_1.Coin.toJSON(e) : undefined);
        }
        else {
            obj.initFunds = [];
        }
        message.callbackSig !== undefined &&
            (obj.callbackSig = base64FromBytes(message.callbackSig !== undefined ? message.callbackSig : new Uint8Array()));
        return obj;
    },
    create(base) {
        return exports.MsgInstantiateContract.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(object) {
        var _a, _b, _c, _d, _e, _f, _g;
        const message = createBaseMsgInstantiateContract();
        message.sender = (_a = object.sender) !== null && _a !== void 0 ? _a : new Uint8Array();
        message.callbackCodeHash = (_b = object.callbackCodeHash) !== null && _b !== void 0 ? _b : "";
        message.codeId = (_c = object.codeId) !== null && _c !== void 0 ? _c : "0";
        message.label = (_d = object.label) !== null && _d !== void 0 ? _d : "";
        message.initMsg = (_e = object.initMsg) !== null && _e !== void 0 ? _e : new Uint8Array();
        message.initFunds = ((_f = object.initFunds) === null || _f === void 0 ? void 0 : _f.map((e) => coin_1.Coin.fromPartial(e))) || [];
        message.callbackSig = (_g = object.callbackSig) !== null && _g !== void 0 ? _g : new Uint8Array();
        return message;
    },
};
function createBaseMsgExecuteContract() {
    return {
        sender: new Uint8Array(),
        contract: new Uint8Array(),
        msg: new Uint8Array(),
        callbackCodeHash: "",
        sentFunds: [],
        callbackSig: new Uint8Array(),
    };
}
exports.MsgExecuteContract = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.sender.length !== 0) {
            writer.uint32(10).bytes(message.sender);
        }
        if (message.contract.length !== 0) {
            writer.uint32(18).bytes(message.contract);
        }
        if (message.msg.length !== 0) {
            writer.uint32(26).bytes(message.msg);
        }
        if (message.callbackCodeHash !== "") {
            writer.uint32(34).string(message.callbackCodeHash);
        }
        for (const v of message.sentFunds) {
            coin_1.Coin.encode(v, writer.uint32(42).fork()).ldelim();
        }
        if (message.callbackSig.length !== 0) {
            writer.uint32(50).bytes(message.callbackSig);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgExecuteContract();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.sender = reader.bytes();
                    break;
                case 2:
                    message.contract = reader.bytes();
                    break;
                case 3:
                    message.msg = reader.bytes();
                    break;
                case 4:
                    message.callbackCodeHash = reader.string();
                    break;
                case 5:
                    message.sentFunds.push(coin_1.Coin.decode(reader, reader.uint32()));
                    break;
                case 6:
                    message.callbackSig = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            sender: isSet(object.sender) ? bytesFromBase64(object.sender) : new Uint8Array(),
            contract: isSet(object.contract) ? bytesFromBase64(object.contract) : new Uint8Array(),
            msg: isSet(object.msg) ? bytesFromBase64(object.msg) : new Uint8Array(),
            callbackCodeHash: isSet(object.callbackCodeHash) ? String(object.callbackCodeHash) : "",
            sentFunds: Array.isArray(object === null || object === void 0 ? void 0 : object.sentFunds) ? object.sentFunds.map((e) => coin_1.Coin.fromJSON(e)) : [],
            callbackSig: isSet(object.callbackSig) ? bytesFromBase64(object.callbackSig) : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.sender !== undefined &&
            (obj.sender = base64FromBytes(message.sender !== undefined ? message.sender : new Uint8Array()));
        message.contract !== undefined &&
            (obj.contract = base64FromBytes(message.contract !== undefined ? message.contract : new Uint8Array()));
        message.msg !== undefined &&
            (obj.msg = base64FromBytes(message.msg !== undefined ? message.msg : new Uint8Array()));
        message.callbackCodeHash !== undefined && (obj.callbackCodeHash = message.callbackCodeHash);
        if (message.sentFunds) {
            obj.sentFunds = message.sentFunds.map((e) => e ? coin_1.Coin.toJSON(e) : undefined);
        }
        else {
            obj.sentFunds = [];
        }
        message.callbackSig !== undefined &&
            (obj.callbackSig = base64FromBytes(message.callbackSig !== undefined ? message.callbackSig : new Uint8Array()));
        return obj;
    },
    create(base) {
        return exports.MsgExecuteContract.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(object) {
        var _a, _b, _c, _d, _e, _f;
        const message = createBaseMsgExecuteContract();
        message.sender = (_a = object.sender) !== null && _a !== void 0 ? _a : new Uint8Array();
        message.contract = (_b = object.contract) !== null && _b !== void 0 ? _b : new Uint8Array();
        message.msg = (_c = object.msg) !== null && _c !== void 0 ? _c : new Uint8Array();
        message.callbackCodeHash = (_d = object.callbackCodeHash) !== null && _d !== void 0 ? _d : "";
        message.sentFunds = ((_e = object.sentFunds) === null || _e === void 0 ? void 0 : _e.map((e) => coin_1.Coin.fromPartial(e))) || [];
        message.callbackSig = (_f = object.callbackSig) !== null && _f !== void 0 ? _f : new Uint8Array();
        return message;
    },
};
var tsProtoGlobalThis = (() => {
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
function bytesFromBase64(b64) {
    if (tsProtoGlobalThis.Buffer) {
        return Uint8Array.from(tsProtoGlobalThis.Buffer.from(b64, "base64"));
    }
    else {
        const bin = tsProtoGlobalThis.atob(b64);
        const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; ++i) {
            arr[i] = bin.charCodeAt(i);
        }
        return arr;
    }
}
function base64FromBytes(arr) {
    if (tsProtoGlobalThis.Buffer) {
        return tsProtoGlobalThis.Buffer.from(arr).toString("base64");
    }
    else {
        const bin = [];
        arr.forEach((byte) => {
            bin.push(String.fromCharCode(byte));
        });
        return tsProtoGlobalThis.btoa(bin.join(""));
    }
}
function longToString(long) {
    return long.toString();
}
if (minimal_1.default.util.Long !== long_1.default) {
    minimal_1.default.util.Long = long_1.default;
    minimal_1.default.configure();
}
function isSet(value) {
    return value !== null && value !== undefined;
}
//# sourceMappingURL=msg.js.map
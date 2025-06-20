"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MsgSend = exports.protobufPackage = void 0;
/* eslint-disable */
const long_1 = __importDefault(require("long"));
const minimal_1 = __importDefault(require("protobufjs/minimal"));
const coin_1 = require("../../../cosmos/base/v1beta1/coin");
exports.protobufPackage = "types";
function createBaseMsgSend() {
    return {
        fromAddress: new Uint8Array(),
        toAddress: new Uint8Array(),
        amount: [],
    };
}
exports.MsgSend = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.fromAddress.length !== 0) {
            writer.uint32(10).bytes(message.fromAddress);
        }
        if (message.toAddress.length !== 0) {
            writer.uint32(18).bytes(message.toAddress);
        }
        for (const v of message.amount) {
            coin_1.Coin.encode(v, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgSend();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.fromAddress = reader.bytes();
                    break;
                case 2:
                    message.toAddress = reader.bytes();
                    break;
                case 3:
                    message.amount.push(coin_1.Coin.decode(reader, reader.uint32()));
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
            fromAddress: isSet(object.fromAddress)
                ? bytesFromBase64(object.fromAddress)
                : new Uint8Array(),
            toAddress: isSet(object.toAddress)
                ? bytesFromBase64(object.toAddress)
                : new Uint8Array(),
            amount: Array.isArray(object === null || object === void 0 ? void 0 : object.amount)
                ? object.amount.map((e) => coin_1.Coin.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.fromAddress !== undefined &&
            (obj.fromAddress = base64FromBytes(message.fromAddress !== undefined
                ? message.fromAddress
                : new Uint8Array()));
        message.toAddress !== undefined &&
            (obj.toAddress = base64FromBytes(message.toAddress !== undefined ? message.toAddress : new Uint8Array()));
        if (message.amount) {
            obj.amount = message.amount.map((e) => (e ? coin_1.Coin.toJSON(e) : undefined));
        }
        else {
            obj.amount = [];
        }
        return obj;
    },
    fromPartial(object) {
        var _a, _b, _c;
        const message = createBaseMsgSend();
        message.fromAddress = (_a = object.fromAddress) !== null && _a !== void 0 ? _a : new Uint8Array();
        message.toAddress = (_b = object.toAddress) !== null && _b !== void 0 ? _b : new Uint8Array();
        message.amount = ((_c = object.amount) === null || _c === void 0 ? void 0 : _c.map((e) => coin_1.Coin.fromPartial(e))) || [];
        return message;
    },
};
var globalThis = (() => {
    if (typeof globalThis !== "undefined")
        return globalThis;
    if (typeof self !== "undefined")
        return self;
    if (typeof window !== "undefined")
        return window;
    if (typeof global !== "undefined")
        return global;
    throw "Unable to locate global object";
})();
const atob = globalThis.atob ||
    ((b64) => globalThis.Buffer.from(b64, "base64").toString("binary"));
function bytesFromBase64(b64) {
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; ++i) {
        arr[i] = bin.charCodeAt(i);
    }
    return arr;
}
const btoa = globalThis.btoa ||
    ((bin) => globalThis.Buffer.from(bin, "binary").toString("base64"));
function base64FromBytes(arr) {
    const bin = [];
    for (const byte of arr) {
        bin.push(String.fromCharCode(byte));
    }
    return btoa(bin.join(""));
}
if (minimal_1.default.util.Long !== long_1.default) {
    minimal_1.default.util.Long = long_1.default;
    minimal_1.default.configure();
}
function isSet(value) {
    return value !== null && value !== undefined;
}
//# sourceMappingURL=msg_send.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Swap = exports.Route = exports.protobufPackage = void 0;
/* eslint-disable */
const long_1 = __importDefault(require("long"));
const minimal_1 = __importDefault(require("protobufjs/minimal"));
const coin_1 = require("../../../cosmos/base/v1beta1/coin");
exports.protobufPackage = "noble.swap.v1";
function createBaseRoute() {
    return { poolId: "0", denomTo: "" };
}
exports.Route = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.poolId !== "0") {
            writer.uint32(8).uint64(message.poolId);
        }
        if (message.denomTo !== "") {
            writer.uint32(18).string(message.denomTo);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRoute();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.poolId = longToString(reader.uint64());
                    break;
                case 2:
                    message.denomTo = reader.string();
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
            poolId: isSet(object.poolId) ? String(object.poolId) : "0",
            denomTo: isSet(object.denomTo) ? String(object.denomTo) : "",
        };
    },
    toJSON(message) {
        const obj = {};
        message.poolId !== undefined && (obj.poolId = message.poolId);
        message.denomTo !== undefined && (obj.denomTo = message.denomTo);
        return obj;
    },
    fromPartial(object) {
        var _a, _b;
        const message = createBaseRoute();
        message.poolId = (_a = object.poolId) !== null && _a !== void 0 ? _a : "0";
        message.denomTo = (_b = object.denomTo) !== null && _b !== void 0 ? _b : "";
        return message;
    },
};
function createBaseSwap() {
    return { poolId: "0", in: undefined, out: undefined, fees: [] };
}
exports.Swap = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.poolId !== "0") {
            writer.uint32(8).uint64(message.poolId);
        }
        if (message.in !== undefined) {
            coin_1.Coin.encode(message.in, writer.uint32(18).fork()).ldelim();
        }
        if (message.out !== undefined) {
            coin_1.Coin.encode(message.out, writer.uint32(26).fork()).ldelim();
        }
        for (const v of message.fees) {
            coin_1.Coin.encode(v, writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseSwap();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.poolId = longToString(reader.uint64());
                    break;
                case 2:
                    message.in = coin_1.Coin.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.out = coin_1.Coin.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.fees.push(coin_1.Coin.decode(reader, reader.uint32()));
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
            poolId: isSet(object.poolId) ? String(object.poolId) : "0",
            in: isSet(object.in) ? coin_1.Coin.fromJSON(object.in) : undefined,
            out: isSet(object.out) ? coin_1.Coin.fromJSON(object.out) : undefined,
            fees: Array.isArray(object === null || object === void 0 ? void 0 : object.fees)
                ? object.fees.map((e) => coin_1.Coin.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.poolId !== undefined && (obj.poolId = message.poolId);
        message.in !== undefined &&
            (obj.in = message.in ? coin_1.Coin.toJSON(message.in) : undefined);
        message.out !== undefined &&
            (obj.out = message.out ? coin_1.Coin.toJSON(message.out) : undefined);
        if (message.fees) {
            obj.fees = message.fees.map((e) => (e ? coin_1.Coin.toJSON(e) : undefined));
        }
        else {
            obj.fees = [];
        }
        return obj;
    },
    fromPartial(object) {
        var _a, _b;
        const message = createBaseSwap();
        message.poolId = (_a = object.poolId) !== null && _a !== void 0 ? _a : "0";
        message.in =
            object.in !== undefined && object.in !== null
                ? coin_1.Coin.fromPartial(object.in)
                : undefined;
        message.out =
            object.out !== undefined && object.out !== null
                ? coin_1.Coin.fromPartial(object.out)
                : undefined;
        message.fees = ((_b = object.fees) === null || _b === void 0 ? void 0 : _b.map((e) => coin_1.Coin.fromPartial(e))) || [];
        return message;
    },
};
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
//# sourceMappingURL=swap.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MsgUnpauseByPoolIdsResponse = exports.MsgUnpauseByPoolIds = exports.MsgUnpauseByAlgorithmResponse = exports.MsgUnpauseByAlgorithm = exports.MsgPauseByPoolIdsResponse = exports.MsgPauseByPoolIds = exports.MsgPauseByAlgorithmResponse = exports.MsgPauseByAlgorithm = exports.MsgSwapResponse = exports.MsgSwap = exports.MsgWithdrawRewardsResponse = exports.MsgWithdrawRewards = exports.MsgWithdrawProtocolFeesResponse = exports.MsgWithdrawProtocolFees = exports.protobufPackage = void 0;
/* eslint-disable */
const long_1 = __importDefault(require("long"));
const minimal_1 = __importDefault(require("protobufjs/minimal"));
const algorithm_1 = require("../../../noble/swap/v1/algorithm");
const coin_1 = require("../../../cosmos/base/v1beta1/coin");
const swap_1 = require("../../../noble/swap/v1/swap");
exports.protobufPackage = "noble.swap.v1";
function createBaseMsgWithdrawProtocolFees() {
    return { signer: "", to: "" };
}
exports.MsgWithdrawProtocolFees = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.signer !== "") {
            writer.uint32(10).string(message.signer);
        }
        if (message.to !== "") {
            writer.uint32(18).string(message.to);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgWithdrawProtocolFees();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.signer = reader.string();
                    break;
                case 2:
                    message.to = reader.string();
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
            signer: isSet(object.signer) ? String(object.signer) : "",
            to: isSet(object.to) ? String(object.to) : "",
        };
    },
    toJSON(message) {
        const obj = {};
        message.signer !== undefined && (obj.signer = message.signer);
        message.to !== undefined && (obj.to = message.to);
        return obj;
    },
    fromPartial(object) {
        var _a, _b;
        const message = createBaseMsgWithdrawProtocolFees();
        message.signer = (_a = object.signer) !== null && _a !== void 0 ? _a : "";
        message.to = (_b = object.to) !== null && _b !== void 0 ? _b : "";
        return message;
    },
};
function createBaseMsgWithdrawProtocolFeesResponse() {
    return {};
}
exports.MsgWithdrawProtocolFeesResponse = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgWithdrawProtocolFeesResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(_) {
        return {};
    },
    toJSON(_) {
        const obj = {};
        return obj;
    },
    fromPartial(_) {
        const message = createBaseMsgWithdrawProtocolFeesResponse();
        return message;
    },
};
function createBaseMsgWithdrawRewards() {
    return { signer: "" };
}
exports.MsgWithdrawRewards = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.signer !== "") {
            writer.uint32(10).string(message.signer);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgWithdrawRewards();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.signer = reader.string();
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
            signer: isSet(object.signer) ? String(object.signer) : "",
        };
    },
    toJSON(message) {
        const obj = {};
        message.signer !== undefined && (obj.signer = message.signer);
        return obj;
    },
    fromPartial(object) {
        var _a;
        const message = createBaseMsgWithdrawRewards();
        message.signer = (_a = object.signer) !== null && _a !== void 0 ? _a : "";
        return message;
    },
};
function createBaseMsgWithdrawRewardsResponse() {
    return { rewards: [] };
}
exports.MsgWithdrawRewardsResponse = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        for (const v of message.rewards) {
            coin_1.Coin.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgWithdrawRewardsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.rewards.push(coin_1.Coin.decode(reader, reader.uint32()));
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
            rewards: Array.isArray(object === null || object === void 0 ? void 0 : object.rewards)
                ? object.rewards.map((e) => coin_1.Coin.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.rewards) {
            obj.rewards = message.rewards.map((e) => e ? coin_1.Coin.toJSON(e) : undefined);
        }
        else {
            obj.rewards = [];
        }
        return obj;
    },
    fromPartial(object) {
        var _a;
        const message = createBaseMsgWithdrawRewardsResponse();
        message.rewards = ((_a = object.rewards) === null || _a === void 0 ? void 0 : _a.map((e) => coin_1.Coin.fromPartial(e))) || [];
        return message;
    },
};
function createBaseMsgSwap() {
    return { signer: "", amount: undefined, routes: [], min: undefined };
}
exports.MsgSwap = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.signer !== "") {
            writer.uint32(10).string(message.signer);
        }
        if (message.amount !== undefined) {
            coin_1.Coin.encode(message.amount, writer.uint32(18).fork()).ldelim();
        }
        for (const v of message.routes) {
            swap_1.Route.encode(v, writer.uint32(26).fork()).ldelim();
        }
        if (message.min !== undefined) {
            coin_1.Coin.encode(message.min, writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgSwap();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.signer = reader.string();
                    break;
                case 2:
                    message.amount = coin_1.Coin.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.routes.push(swap_1.Route.decode(reader, reader.uint32()));
                    break;
                case 4:
                    message.min = coin_1.Coin.decode(reader, reader.uint32());
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
            signer: isSet(object.signer) ? String(object.signer) : "",
            amount: isSet(object.amount) ? coin_1.Coin.fromJSON(object.amount) : undefined,
            routes: Array.isArray(object === null || object === void 0 ? void 0 : object.routes)
                ? object.routes.map((e) => swap_1.Route.fromJSON(e))
                : [],
            min: isSet(object.min) ? coin_1.Coin.fromJSON(object.min) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.signer !== undefined && (obj.signer = message.signer);
        message.amount !== undefined &&
            (obj.amount = message.amount ? coin_1.Coin.toJSON(message.amount) : undefined);
        if (message.routes) {
            obj.routes = message.routes.map((e) => (e ? swap_1.Route.toJSON(e) : undefined));
        }
        else {
            obj.routes = [];
        }
        message.min !== undefined &&
            (obj.min = message.min ? coin_1.Coin.toJSON(message.min) : undefined);
        return obj;
    },
    fromPartial(object) {
        var _a, _b;
        const message = createBaseMsgSwap();
        message.signer = (_a = object.signer) !== null && _a !== void 0 ? _a : "";
        message.amount =
            object.amount !== undefined && object.amount !== null
                ? coin_1.Coin.fromPartial(object.amount)
                : undefined;
        message.routes = ((_b = object.routes) === null || _b === void 0 ? void 0 : _b.map((e) => swap_1.Route.fromPartial(e))) || [];
        message.min =
            object.min !== undefined && object.min !== null
                ? coin_1.Coin.fromPartial(object.min)
                : undefined;
        return message;
    },
};
function createBaseMsgSwapResponse() {
    return { result: undefined, swaps: [] };
}
exports.MsgSwapResponse = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.result !== undefined) {
            coin_1.Coin.encode(message.result, writer.uint32(10).fork()).ldelim();
        }
        for (const v of message.swaps) {
            swap_1.Swap.encode(v, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgSwapResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.result = coin_1.Coin.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.swaps.push(swap_1.Swap.decode(reader, reader.uint32()));
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
            result: isSet(object.result) ? coin_1.Coin.fromJSON(object.result) : undefined,
            swaps: Array.isArray(object === null || object === void 0 ? void 0 : object.swaps)
                ? object.swaps.map((e) => swap_1.Swap.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.result !== undefined &&
            (obj.result = message.result ? coin_1.Coin.toJSON(message.result) : undefined);
        if (message.swaps) {
            obj.swaps = message.swaps.map((e) => (e ? swap_1.Swap.toJSON(e) : undefined));
        }
        else {
            obj.swaps = [];
        }
        return obj;
    },
    fromPartial(object) {
        var _a;
        const message = createBaseMsgSwapResponse();
        message.result =
            object.result !== undefined && object.result !== null
                ? coin_1.Coin.fromPartial(object.result)
                : undefined;
        message.swaps = ((_a = object.swaps) === null || _a === void 0 ? void 0 : _a.map((e) => swap_1.Swap.fromPartial(e))) || [];
        return message;
    },
};
function createBaseMsgPauseByAlgorithm() {
    return { signer: "", algorithm: 0 };
}
exports.MsgPauseByAlgorithm = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.signer !== "") {
            writer.uint32(10).string(message.signer);
        }
        if (message.algorithm !== 0) {
            writer.uint32(16).int32(message.algorithm);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgPauseByAlgorithm();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.signer = reader.string();
                    break;
                case 2:
                    message.algorithm = reader.int32();
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
            signer: isSet(object.signer) ? String(object.signer) : "",
            algorithm: isSet(object.algorithm)
                ? (0, algorithm_1.algorithmFromJSON)(object.algorithm)
                : 0,
        };
    },
    toJSON(message) {
        const obj = {};
        message.signer !== undefined && (obj.signer = message.signer);
        message.algorithm !== undefined &&
            (obj.algorithm = (0, algorithm_1.algorithmToJSON)(message.algorithm));
        return obj;
    },
    fromPartial(object) {
        var _a, _b;
        const message = createBaseMsgPauseByAlgorithm();
        message.signer = (_a = object.signer) !== null && _a !== void 0 ? _a : "";
        message.algorithm = (_b = object.algorithm) !== null && _b !== void 0 ? _b : 0;
        return message;
    },
};
function createBaseMsgPauseByAlgorithmResponse() {
    return { pausedPools: [] };
}
exports.MsgPauseByAlgorithmResponse = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        writer.uint32(10).fork();
        for (const v of message.pausedPools) {
            writer.uint64(v);
        }
        writer.ldelim();
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgPauseByAlgorithmResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if ((tag & 7) === 2) {
                        const end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2) {
                            message.pausedPools.push(longToString(reader.uint64()));
                        }
                    }
                    else {
                        message.pausedPools.push(longToString(reader.uint64()));
                    }
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
            pausedPools: Array.isArray(object === null || object === void 0 ? void 0 : object.pausedPools)
                ? object.pausedPools.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.pausedPools) {
            obj.pausedPools = message.pausedPools.map((e) => e);
        }
        else {
            obj.pausedPools = [];
        }
        return obj;
    },
    fromPartial(object) {
        var _a;
        const message = createBaseMsgPauseByAlgorithmResponse();
        message.pausedPools = ((_a = object.pausedPools) === null || _a === void 0 ? void 0 : _a.map((e) => e)) || [];
        return message;
    },
};
function createBaseMsgPauseByPoolIds() {
    return { signer: "", poolIds: [] };
}
exports.MsgPauseByPoolIds = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.signer !== "") {
            writer.uint32(10).string(message.signer);
        }
        writer.uint32(18).fork();
        for (const v of message.poolIds) {
            writer.uint64(v);
        }
        writer.ldelim();
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgPauseByPoolIds();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.signer = reader.string();
                    break;
                case 2:
                    if ((tag & 7) === 2) {
                        const end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2) {
                            message.poolIds.push(longToString(reader.uint64()));
                        }
                    }
                    else {
                        message.poolIds.push(longToString(reader.uint64()));
                    }
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
            signer: isSet(object.signer) ? String(object.signer) : "",
            poolIds: Array.isArray(object === null || object === void 0 ? void 0 : object.poolIds)
                ? object.poolIds.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.signer !== undefined && (obj.signer = message.signer);
        if (message.poolIds) {
            obj.poolIds = message.poolIds.map((e) => e);
        }
        else {
            obj.poolIds = [];
        }
        return obj;
    },
    fromPartial(object) {
        var _a, _b;
        const message = createBaseMsgPauseByPoolIds();
        message.signer = (_a = object.signer) !== null && _a !== void 0 ? _a : "";
        message.poolIds = ((_b = object.poolIds) === null || _b === void 0 ? void 0 : _b.map((e) => e)) || [];
        return message;
    },
};
function createBaseMsgPauseByPoolIdsResponse() {
    return { pausedPools: [] };
}
exports.MsgPauseByPoolIdsResponse = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        writer.uint32(10).fork();
        for (const v of message.pausedPools) {
            writer.uint64(v);
        }
        writer.ldelim();
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgPauseByPoolIdsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if ((tag & 7) === 2) {
                        const end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2) {
                            message.pausedPools.push(longToString(reader.uint64()));
                        }
                    }
                    else {
                        message.pausedPools.push(longToString(reader.uint64()));
                    }
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
            pausedPools: Array.isArray(object === null || object === void 0 ? void 0 : object.pausedPools)
                ? object.pausedPools.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.pausedPools) {
            obj.pausedPools = message.pausedPools.map((e) => e);
        }
        else {
            obj.pausedPools = [];
        }
        return obj;
    },
    fromPartial(object) {
        var _a;
        const message = createBaseMsgPauseByPoolIdsResponse();
        message.pausedPools = ((_a = object.pausedPools) === null || _a === void 0 ? void 0 : _a.map((e) => e)) || [];
        return message;
    },
};
function createBaseMsgUnpauseByAlgorithm() {
    return { signer: "", algorithm: 0 };
}
exports.MsgUnpauseByAlgorithm = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.signer !== "") {
            writer.uint32(10).string(message.signer);
        }
        if (message.algorithm !== 0) {
            writer.uint32(16).int32(message.algorithm);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUnpauseByAlgorithm();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.signer = reader.string();
                    break;
                case 2:
                    message.algorithm = reader.int32();
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
            signer: isSet(object.signer) ? String(object.signer) : "",
            algorithm: isSet(object.algorithm)
                ? (0, algorithm_1.algorithmFromJSON)(object.algorithm)
                : 0,
        };
    },
    toJSON(message) {
        const obj = {};
        message.signer !== undefined && (obj.signer = message.signer);
        message.algorithm !== undefined &&
            (obj.algorithm = (0, algorithm_1.algorithmToJSON)(message.algorithm));
        return obj;
    },
    fromPartial(object) {
        var _a, _b;
        const message = createBaseMsgUnpauseByAlgorithm();
        message.signer = (_a = object.signer) !== null && _a !== void 0 ? _a : "";
        message.algorithm = (_b = object.algorithm) !== null && _b !== void 0 ? _b : 0;
        return message;
    },
};
function createBaseMsgUnpauseByAlgorithmResponse() {
    return { unpausedPools: [] };
}
exports.MsgUnpauseByAlgorithmResponse = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        writer.uint32(10).fork();
        for (const v of message.unpausedPools) {
            writer.uint64(v);
        }
        writer.ldelim();
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUnpauseByAlgorithmResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if ((tag & 7) === 2) {
                        const end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2) {
                            message.unpausedPools.push(longToString(reader.uint64()));
                        }
                    }
                    else {
                        message.unpausedPools.push(longToString(reader.uint64()));
                    }
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
            unpausedPools: Array.isArray(object === null || object === void 0 ? void 0 : object.unpausedPools)
                ? object.unpausedPools.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.unpausedPools) {
            obj.unpausedPools = message.unpausedPools.map((e) => e);
        }
        else {
            obj.unpausedPools = [];
        }
        return obj;
    },
    fromPartial(object) {
        var _a;
        const message = createBaseMsgUnpauseByAlgorithmResponse();
        message.unpausedPools = ((_a = object.unpausedPools) === null || _a === void 0 ? void 0 : _a.map((e) => e)) || [];
        return message;
    },
};
function createBaseMsgUnpauseByPoolIds() {
    return { signer: "", poolIds: [] };
}
exports.MsgUnpauseByPoolIds = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.signer !== "") {
            writer.uint32(10).string(message.signer);
        }
        writer.uint32(18).fork();
        for (const v of message.poolIds) {
            writer.uint64(v);
        }
        writer.ldelim();
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUnpauseByPoolIds();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.signer = reader.string();
                    break;
                case 2:
                    if ((tag & 7) === 2) {
                        const end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2) {
                            message.poolIds.push(longToString(reader.uint64()));
                        }
                    }
                    else {
                        message.poolIds.push(longToString(reader.uint64()));
                    }
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
            signer: isSet(object.signer) ? String(object.signer) : "",
            poolIds: Array.isArray(object === null || object === void 0 ? void 0 : object.poolIds)
                ? object.poolIds.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.signer !== undefined && (obj.signer = message.signer);
        if (message.poolIds) {
            obj.poolIds = message.poolIds.map((e) => e);
        }
        else {
            obj.poolIds = [];
        }
        return obj;
    },
    fromPartial(object) {
        var _a, _b;
        const message = createBaseMsgUnpauseByPoolIds();
        message.signer = (_a = object.signer) !== null && _a !== void 0 ? _a : "";
        message.poolIds = ((_b = object.poolIds) === null || _b === void 0 ? void 0 : _b.map((e) => e)) || [];
        return message;
    },
};
function createBaseMsgUnpauseByPoolIdsResponse() {
    return { unpausedPools: [] };
}
exports.MsgUnpauseByPoolIdsResponse = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        writer.uint32(10).fork();
        for (const v of message.unpausedPools) {
            writer.uint64(v);
        }
        writer.ldelim();
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUnpauseByPoolIdsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if ((tag & 7) === 2) {
                        const end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2) {
                            message.unpausedPools.push(longToString(reader.uint64()));
                        }
                    }
                    else {
                        message.unpausedPools.push(longToString(reader.uint64()));
                    }
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
            unpausedPools: Array.isArray(object === null || object === void 0 ? void 0 : object.unpausedPools)
                ? object.unpausedPools.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.unpausedPools) {
            obj.unpausedPools = message.unpausedPools.map((e) => e);
        }
        else {
            obj.unpausedPools = [];
        }
        return obj;
    },
    fromPartial(object) {
        var _a;
        const message = createBaseMsgUnpauseByPoolIdsResponse();
        message.unpausedPools = ((_a = object.unpausedPools) === null || _a === void 0 ? void 0 : _a.map((e) => e)) || [];
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
//# sourceMappingURL=tx.js.map
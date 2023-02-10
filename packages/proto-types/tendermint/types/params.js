"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashedParams = exports.VersionParams = exports.ValidatorParams = exports.EvidenceParams = exports.BlockParams = exports.ConsensusParams = exports.protobufPackage = void 0;
/* eslint-disable */
const long_1 = __importDefault(require("long"));
const minimal_1 = __importDefault(require("protobufjs/minimal"));
const duration_1 = require("../../google/protobuf/duration");
exports.protobufPackage = "tendermint.types";
function createBaseConsensusParams() {
    return { block: undefined, evidence: undefined, validator: undefined, version: undefined };
}
exports.ConsensusParams = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.block !== undefined) {
            exports.BlockParams.encode(message.block, writer.uint32(10).fork()).ldelim();
        }
        if (message.evidence !== undefined) {
            exports.EvidenceParams.encode(message.evidence, writer.uint32(18).fork()).ldelim();
        }
        if (message.validator !== undefined) {
            exports.ValidatorParams.encode(message.validator, writer.uint32(26).fork()).ldelim();
        }
        if (message.version !== undefined) {
            exports.VersionParams.encode(message.version, writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseConsensusParams();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.block = exports.BlockParams.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.evidence = exports.EvidenceParams.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.validator = exports.ValidatorParams.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.version = exports.VersionParams.decode(reader, reader.uint32());
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
            block: isSet(object.block) ? exports.BlockParams.fromJSON(object.block) : undefined,
            evidence: isSet(object.evidence) ? exports.EvidenceParams.fromJSON(object.evidence) : undefined,
            validator: isSet(object.validator) ? exports.ValidatorParams.fromJSON(object.validator) : undefined,
            version: isSet(object.version) ? exports.VersionParams.fromJSON(object.version) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.block !== undefined && (obj.block = message.block ? exports.BlockParams.toJSON(message.block) : undefined);
        message.evidence !== undefined &&
            (obj.evidence = message.evidence ? exports.EvidenceParams.toJSON(message.evidence) : undefined);
        message.validator !== undefined &&
            (obj.validator = message.validator ? exports.ValidatorParams.toJSON(message.validator) : undefined);
        message.version !== undefined &&
            (obj.version = message.version ? exports.VersionParams.toJSON(message.version) : undefined);
        return obj;
    },
    create(base) {
        return exports.ConsensusParams.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(object) {
        const message = createBaseConsensusParams();
        message.block = (object.block !== undefined && object.block !== null)
            ? exports.BlockParams.fromPartial(object.block)
            : undefined;
        message.evidence = (object.evidence !== undefined && object.evidence !== null)
            ? exports.EvidenceParams.fromPartial(object.evidence)
            : undefined;
        message.validator = (object.validator !== undefined && object.validator !== null)
            ? exports.ValidatorParams.fromPartial(object.validator)
            : undefined;
        message.version = (object.version !== undefined && object.version !== null)
            ? exports.VersionParams.fromPartial(object.version)
            : undefined;
        return message;
    },
};
function createBaseBlockParams() {
    return { maxBytes: "0", maxGas: "0", timeIotaMs: "0" };
}
exports.BlockParams = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.maxBytes !== "0") {
            writer.uint32(8).int64(message.maxBytes);
        }
        if (message.maxGas !== "0") {
            writer.uint32(16).int64(message.maxGas);
        }
        if (message.timeIotaMs !== "0") {
            writer.uint32(24).int64(message.timeIotaMs);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseBlockParams();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.maxBytes = longToString(reader.int64());
                    break;
                case 2:
                    message.maxGas = longToString(reader.int64());
                    break;
                case 3:
                    message.timeIotaMs = longToString(reader.int64());
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
            maxBytes: isSet(object.maxBytes) ? String(object.maxBytes) : "0",
            maxGas: isSet(object.maxGas) ? String(object.maxGas) : "0",
            timeIotaMs: isSet(object.timeIotaMs) ? String(object.timeIotaMs) : "0",
        };
    },
    toJSON(message) {
        const obj = {};
        message.maxBytes !== undefined && (obj.maxBytes = message.maxBytes);
        message.maxGas !== undefined && (obj.maxGas = message.maxGas);
        message.timeIotaMs !== undefined && (obj.timeIotaMs = message.timeIotaMs);
        return obj;
    },
    create(base) {
        return exports.BlockParams.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(object) {
        var _a, _b, _c;
        const message = createBaseBlockParams();
        message.maxBytes = (_a = object.maxBytes) !== null && _a !== void 0 ? _a : "0";
        message.maxGas = (_b = object.maxGas) !== null && _b !== void 0 ? _b : "0";
        message.timeIotaMs = (_c = object.timeIotaMs) !== null && _c !== void 0 ? _c : "0";
        return message;
    },
};
function createBaseEvidenceParams() {
    return { maxAgeNumBlocks: "0", maxAgeDuration: undefined, maxBytes: "0" };
}
exports.EvidenceParams = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.maxAgeNumBlocks !== "0") {
            writer.uint32(8).int64(message.maxAgeNumBlocks);
        }
        if (message.maxAgeDuration !== undefined) {
            duration_1.Duration.encode(message.maxAgeDuration, writer.uint32(18).fork()).ldelim();
        }
        if (message.maxBytes !== "0") {
            writer.uint32(24).int64(message.maxBytes);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEvidenceParams();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.maxAgeNumBlocks = longToString(reader.int64());
                    break;
                case 2:
                    message.maxAgeDuration = duration_1.Duration.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.maxBytes = longToString(reader.int64());
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
            maxAgeNumBlocks: isSet(object.maxAgeNumBlocks) ? String(object.maxAgeNumBlocks) : "0",
            maxAgeDuration: isSet(object.maxAgeDuration) ? duration_1.Duration.fromJSON(object.maxAgeDuration) : undefined,
            maxBytes: isSet(object.maxBytes) ? String(object.maxBytes) : "0",
        };
    },
    toJSON(message) {
        const obj = {};
        message.maxAgeNumBlocks !== undefined && (obj.maxAgeNumBlocks = message.maxAgeNumBlocks);
        message.maxAgeDuration !== undefined &&
            (obj.maxAgeDuration = message.maxAgeDuration ? duration_1.Duration.toJSON(message.maxAgeDuration) : undefined);
        message.maxBytes !== undefined && (obj.maxBytes = message.maxBytes);
        return obj;
    },
    create(base) {
        return exports.EvidenceParams.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(object) {
        var _a, _b;
        const message = createBaseEvidenceParams();
        message.maxAgeNumBlocks = (_a = object.maxAgeNumBlocks) !== null && _a !== void 0 ? _a : "0";
        message.maxAgeDuration = (object.maxAgeDuration !== undefined && object.maxAgeDuration !== null)
            ? duration_1.Duration.fromPartial(object.maxAgeDuration)
            : undefined;
        message.maxBytes = (_b = object.maxBytes) !== null && _b !== void 0 ? _b : "0";
        return message;
    },
};
function createBaseValidatorParams() {
    return { pubKeyTypes: [] };
}
exports.ValidatorParams = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        for (const v of message.pubKeyTypes) {
            writer.uint32(10).string(v);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseValidatorParams();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.pubKeyTypes.push(reader.string());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { pubKeyTypes: Array.isArray(object === null || object === void 0 ? void 0 : object.pubKeyTypes) ? object.pubKeyTypes.map((e) => String(e)) : [] };
    },
    toJSON(message) {
        const obj = {};
        if (message.pubKeyTypes) {
            obj.pubKeyTypes = message.pubKeyTypes.map((e) => e);
        }
        else {
            obj.pubKeyTypes = [];
        }
        return obj;
    },
    create(base) {
        return exports.ValidatorParams.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(object) {
        var _a;
        const message = createBaseValidatorParams();
        message.pubKeyTypes = ((_a = object.pubKeyTypes) === null || _a === void 0 ? void 0 : _a.map((e) => e)) || [];
        return message;
    },
};
function createBaseVersionParams() {
    return { appVersion: "0" };
}
exports.VersionParams = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.appVersion !== "0") {
            writer.uint32(8).uint64(message.appVersion);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseVersionParams();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.appVersion = longToString(reader.uint64());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { appVersion: isSet(object.appVersion) ? String(object.appVersion) : "0" };
    },
    toJSON(message) {
        const obj = {};
        message.appVersion !== undefined && (obj.appVersion = message.appVersion);
        return obj;
    },
    create(base) {
        return exports.VersionParams.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(object) {
        var _a;
        const message = createBaseVersionParams();
        message.appVersion = (_a = object.appVersion) !== null && _a !== void 0 ? _a : "0";
        return message;
    },
};
function createBaseHashedParams() {
    return { blockMaxBytes: "0", blockMaxGas: "0" };
}
exports.HashedParams = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.blockMaxBytes !== "0") {
            writer.uint32(8).int64(message.blockMaxBytes);
        }
        if (message.blockMaxGas !== "0") {
            writer.uint32(16).int64(message.blockMaxGas);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseHashedParams();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.blockMaxBytes = longToString(reader.int64());
                    break;
                case 2:
                    message.blockMaxGas = longToString(reader.int64());
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
            blockMaxBytes: isSet(object.blockMaxBytes) ? String(object.blockMaxBytes) : "0",
            blockMaxGas: isSet(object.blockMaxGas) ? String(object.blockMaxGas) : "0",
        };
    },
    toJSON(message) {
        const obj = {};
        message.blockMaxBytes !== undefined && (obj.blockMaxBytes = message.blockMaxBytes);
        message.blockMaxGas !== undefined && (obj.blockMaxGas = message.blockMaxGas);
        return obj;
    },
    create(base) {
        return exports.HashedParams.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(object) {
        var _a, _b;
        const message = createBaseHashedParams();
        message.blockMaxBytes = (_a = object.blockMaxBytes) !== null && _a !== void 0 ? _a : "0";
        message.blockMaxGas = (_b = object.blockMaxGas) !== null && _b !== void 0 ? _b : "0";
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
//# sourceMappingURL=params.js.map
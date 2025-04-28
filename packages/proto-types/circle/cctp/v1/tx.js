"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MsgRemoveRemoteTokenMessenger = exports.MsgAddRemoteTokenMessengerResponse = exports.MsgAddRemoteTokenMessenger = exports.MsgUnlinkTokenPairResponse = exports.MsgUnlinkTokenPair = exports.MsgLinkTokenPairResponse = exports.MsgLinkTokenPair = exports.MsgUpdateSignatureThresholdResponse = exports.MsgUpdateSignatureThreshold = exports.MsgReplaceMessageResponse = exports.MsgReplaceMessage = exports.MsgSendMessageWithCallerResponse = exports.MsgSendMessageWithCaller = exports.MsgSendMessageResponse = exports.MsgSendMessage = exports.MsgReceiveMessageResponse = exports.MsgReceiveMessage = exports.MsgReplaceDepositForBurnResponse = exports.MsgReplaceDepositForBurn = exports.MsgDepositForBurnWithCallerResponse = exports.MsgDepositForBurnWithCaller = exports.MsgDepositForBurnResponse = exports.MsgDepositForBurn = exports.MsgSetMaxBurnAmountPerMessageResponse = exports.MsgSetMaxBurnAmountPerMessage = exports.MsgUpdateMaxMessageBodySizeResponse = exports.MsgUpdateMaxMessageBodySize = exports.MsgUnpauseSendingAndReceivingMessagesResponse = exports.MsgUnpauseSendingAndReceivingMessages = exports.MsgPauseSendingAndReceivingMessagesResponse = exports.MsgPauseSendingAndReceivingMessages = exports.MsgUnpauseBurningAndMintingResponse = exports.MsgUnpauseBurningAndMinting = exports.MsgPauseBurningAndMintingResponse = exports.MsgPauseBurningAndMinting = exports.MsgDisableAttesterResponse = exports.MsgDisableAttester = exports.MsgEnableAttesterResponse = exports.MsgEnableAttester = exports.MsgAcceptOwnerResponse = exports.MsgAcceptOwner = exports.MsgUpdatePauserResponse = exports.MsgUpdatePauser = exports.MsgUpdateTokenControllerResponse = exports.MsgUpdateTokenController = exports.MsgUpdateAttesterManagerResponse = exports.MsgUpdateAttesterManager = exports.MsgUpdateOwnerResponse = exports.MsgUpdateOwner = exports.protobufPackage = void 0;
exports.MsgRemoveRemoteTokenMessengerResponse = void 0;
/* eslint-disable */
const long_1 = __importDefault(require("long"));
const minimal_1 = __importDefault(require("protobufjs/minimal"));
exports.protobufPackage = "circle.cctp.v1";
function createBaseMsgUpdateOwner() {
    return { from: "", newOwner: "" };
}
exports.MsgUpdateOwner = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.from !== "") {
            writer.uint32(10).string(message.from);
        }
        if (message.newOwner !== "") {
            writer.uint32(18).string(message.newOwner);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateOwner();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.from = reader.string();
                    break;
                case 2:
                    message.newOwner = reader.string();
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
            from: isSet(object.from) ? String(object.from) : "",
            newOwner: isSet(object.newOwner) ? String(object.newOwner) : "",
        };
    },
    toJSON(message) {
        const obj = {};
        message.from !== undefined && (obj.from = message.from);
        message.newOwner !== undefined && (obj.newOwner = message.newOwner);
        return obj;
    },
    fromPartial(object) {
        var _a, _b;
        const message = createBaseMsgUpdateOwner();
        message.from = (_a = object.from) !== null && _a !== void 0 ? _a : "";
        message.newOwner = (_b = object.newOwner) !== null && _b !== void 0 ? _b : "";
        return message;
    },
};
function createBaseMsgUpdateOwnerResponse() {
    return {};
}
exports.MsgUpdateOwnerResponse = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateOwnerResponse();
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
        const message = createBaseMsgUpdateOwnerResponse();
        return message;
    },
};
function createBaseMsgUpdateAttesterManager() {
    return { from: "", newAttesterManager: "" };
}
exports.MsgUpdateAttesterManager = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.from !== "") {
            writer.uint32(10).string(message.from);
        }
        if (message.newAttesterManager !== "") {
            writer.uint32(18).string(message.newAttesterManager);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateAttesterManager();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.from = reader.string();
                    break;
                case 2:
                    message.newAttesterManager = reader.string();
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
            from: isSet(object.from) ? String(object.from) : "",
            newAttesterManager: isSet(object.newAttesterManager)
                ? String(object.newAttesterManager)
                : "",
        };
    },
    toJSON(message) {
        const obj = {};
        message.from !== undefined && (obj.from = message.from);
        message.newAttesterManager !== undefined &&
            (obj.newAttesterManager = message.newAttesterManager);
        return obj;
    },
    fromPartial(object) {
        var _a, _b;
        const message = createBaseMsgUpdateAttesterManager();
        message.from = (_a = object.from) !== null && _a !== void 0 ? _a : "";
        message.newAttesterManager = (_b = object.newAttesterManager) !== null && _b !== void 0 ? _b : "";
        return message;
    },
};
function createBaseMsgUpdateAttesterManagerResponse() {
    return {};
}
exports.MsgUpdateAttesterManagerResponse = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateAttesterManagerResponse();
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
        const message = createBaseMsgUpdateAttesterManagerResponse();
        return message;
    },
};
function createBaseMsgUpdateTokenController() {
    return { from: "", newTokenController: "" };
}
exports.MsgUpdateTokenController = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.from !== "") {
            writer.uint32(10).string(message.from);
        }
        if (message.newTokenController !== "") {
            writer.uint32(18).string(message.newTokenController);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateTokenController();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.from = reader.string();
                    break;
                case 2:
                    message.newTokenController = reader.string();
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
            from: isSet(object.from) ? String(object.from) : "",
            newTokenController: isSet(object.newTokenController)
                ? String(object.newTokenController)
                : "",
        };
    },
    toJSON(message) {
        const obj = {};
        message.from !== undefined && (obj.from = message.from);
        message.newTokenController !== undefined &&
            (obj.newTokenController = message.newTokenController);
        return obj;
    },
    fromPartial(object) {
        var _a, _b;
        const message = createBaseMsgUpdateTokenController();
        message.from = (_a = object.from) !== null && _a !== void 0 ? _a : "";
        message.newTokenController = (_b = object.newTokenController) !== null && _b !== void 0 ? _b : "";
        return message;
    },
};
function createBaseMsgUpdateTokenControllerResponse() {
    return {};
}
exports.MsgUpdateTokenControllerResponse = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateTokenControllerResponse();
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
        const message = createBaseMsgUpdateTokenControllerResponse();
        return message;
    },
};
function createBaseMsgUpdatePauser() {
    return { from: "", newPauser: "" };
}
exports.MsgUpdatePauser = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.from !== "") {
            writer.uint32(10).string(message.from);
        }
        if (message.newPauser !== "") {
            writer.uint32(18).string(message.newPauser);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdatePauser();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.from = reader.string();
                    break;
                case 2:
                    message.newPauser = reader.string();
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
            from: isSet(object.from) ? String(object.from) : "",
            newPauser: isSet(object.newPauser) ? String(object.newPauser) : "",
        };
    },
    toJSON(message) {
        const obj = {};
        message.from !== undefined && (obj.from = message.from);
        message.newPauser !== undefined && (obj.newPauser = message.newPauser);
        return obj;
    },
    fromPartial(object) {
        var _a, _b;
        const message = createBaseMsgUpdatePauser();
        message.from = (_a = object.from) !== null && _a !== void 0 ? _a : "";
        message.newPauser = (_b = object.newPauser) !== null && _b !== void 0 ? _b : "";
        return message;
    },
};
function createBaseMsgUpdatePauserResponse() {
    return {};
}
exports.MsgUpdatePauserResponse = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdatePauserResponse();
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
        const message = createBaseMsgUpdatePauserResponse();
        return message;
    },
};
function createBaseMsgAcceptOwner() {
    return { from: "" };
}
exports.MsgAcceptOwner = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.from !== "") {
            writer.uint32(10).string(message.from);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgAcceptOwner();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.from = reader.string();
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
            from: isSet(object.from) ? String(object.from) : "",
        };
    },
    toJSON(message) {
        const obj = {};
        message.from !== undefined && (obj.from = message.from);
        return obj;
    },
    fromPartial(object) {
        var _a;
        const message = createBaseMsgAcceptOwner();
        message.from = (_a = object.from) !== null && _a !== void 0 ? _a : "";
        return message;
    },
};
function createBaseMsgAcceptOwnerResponse() {
    return {};
}
exports.MsgAcceptOwnerResponse = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgAcceptOwnerResponse();
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
        const message = createBaseMsgAcceptOwnerResponse();
        return message;
    },
};
function createBaseMsgEnableAttester() {
    return { from: "", attester: "" };
}
exports.MsgEnableAttester = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.from !== "") {
            writer.uint32(10).string(message.from);
        }
        if (message.attester !== "") {
            writer.uint32(18).string(message.attester);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgEnableAttester();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.from = reader.string();
                    break;
                case 2:
                    message.attester = reader.string();
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
            from: isSet(object.from) ? String(object.from) : "",
            attester: isSet(object.attester) ? String(object.attester) : "",
        };
    },
    toJSON(message) {
        const obj = {};
        message.from !== undefined && (obj.from = message.from);
        message.attester !== undefined && (obj.attester = message.attester);
        return obj;
    },
    fromPartial(object) {
        var _a, _b;
        const message = createBaseMsgEnableAttester();
        message.from = (_a = object.from) !== null && _a !== void 0 ? _a : "";
        message.attester = (_b = object.attester) !== null && _b !== void 0 ? _b : "";
        return message;
    },
};
function createBaseMsgEnableAttesterResponse() {
    return {};
}
exports.MsgEnableAttesterResponse = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgEnableAttesterResponse();
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
        const message = createBaseMsgEnableAttesterResponse();
        return message;
    },
};
function createBaseMsgDisableAttester() {
    return { from: "", attester: "" };
}
exports.MsgDisableAttester = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.from !== "") {
            writer.uint32(10).string(message.from);
        }
        if (message.attester !== "") {
            writer.uint32(18).string(message.attester);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgDisableAttester();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.from = reader.string();
                    break;
                case 2:
                    message.attester = reader.string();
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
            from: isSet(object.from) ? String(object.from) : "",
            attester: isSet(object.attester) ? String(object.attester) : "",
        };
    },
    toJSON(message) {
        const obj = {};
        message.from !== undefined && (obj.from = message.from);
        message.attester !== undefined && (obj.attester = message.attester);
        return obj;
    },
    fromPartial(object) {
        var _a, _b;
        const message = createBaseMsgDisableAttester();
        message.from = (_a = object.from) !== null && _a !== void 0 ? _a : "";
        message.attester = (_b = object.attester) !== null && _b !== void 0 ? _b : "";
        return message;
    },
};
function createBaseMsgDisableAttesterResponse() {
    return {};
}
exports.MsgDisableAttesterResponse = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgDisableAttesterResponse();
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
        const message = createBaseMsgDisableAttesterResponse();
        return message;
    },
};
function createBaseMsgPauseBurningAndMinting() {
    return { from: "" };
}
exports.MsgPauseBurningAndMinting = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.from !== "") {
            writer.uint32(10).string(message.from);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgPauseBurningAndMinting();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.from = reader.string();
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
            from: isSet(object.from) ? String(object.from) : "",
        };
    },
    toJSON(message) {
        const obj = {};
        message.from !== undefined && (obj.from = message.from);
        return obj;
    },
    fromPartial(object) {
        var _a;
        const message = createBaseMsgPauseBurningAndMinting();
        message.from = (_a = object.from) !== null && _a !== void 0 ? _a : "";
        return message;
    },
};
function createBaseMsgPauseBurningAndMintingResponse() {
    return {};
}
exports.MsgPauseBurningAndMintingResponse = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgPauseBurningAndMintingResponse();
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
        const message = createBaseMsgPauseBurningAndMintingResponse();
        return message;
    },
};
function createBaseMsgUnpauseBurningAndMinting() {
    return { from: "" };
}
exports.MsgUnpauseBurningAndMinting = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.from !== "") {
            writer.uint32(10).string(message.from);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUnpauseBurningAndMinting();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.from = reader.string();
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
            from: isSet(object.from) ? String(object.from) : "",
        };
    },
    toJSON(message) {
        const obj = {};
        message.from !== undefined && (obj.from = message.from);
        return obj;
    },
    fromPartial(object) {
        var _a;
        const message = createBaseMsgUnpauseBurningAndMinting();
        message.from = (_a = object.from) !== null && _a !== void 0 ? _a : "";
        return message;
    },
};
function createBaseMsgUnpauseBurningAndMintingResponse() {
    return {};
}
exports.MsgUnpauseBurningAndMintingResponse = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUnpauseBurningAndMintingResponse();
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
        const message = createBaseMsgUnpauseBurningAndMintingResponse();
        return message;
    },
};
function createBaseMsgPauseSendingAndReceivingMessages() {
    return { from: "" };
}
exports.MsgPauseSendingAndReceivingMessages = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.from !== "") {
            writer.uint32(10).string(message.from);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgPauseSendingAndReceivingMessages();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.from = reader.string();
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
            from: isSet(object.from) ? String(object.from) : "",
        };
    },
    toJSON(message) {
        const obj = {};
        message.from !== undefined && (obj.from = message.from);
        return obj;
    },
    fromPartial(object) {
        var _a;
        const message = createBaseMsgPauseSendingAndReceivingMessages();
        message.from = (_a = object.from) !== null && _a !== void 0 ? _a : "";
        return message;
    },
};
function createBaseMsgPauseSendingAndReceivingMessagesResponse() {
    return {};
}
exports.MsgPauseSendingAndReceivingMessagesResponse = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgPauseSendingAndReceivingMessagesResponse();
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
        const message = createBaseMsgPauseSendingAndReceivingMessagesResponse();
        return message;
    },
};
function createBaseMsgUnpauseSendingAndReceivingMessages() {
    return { from: "" };
}
exports.MsgUnpauseSendingAndReceivingMessages = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.from !== "") {
            writer.uint32(10).string(message.from);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUnpauseSendingAndReceivingMessages();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.from = reader.string();
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
            from: isSet(object.from) ? String(object.from) : "",
        };
    },
    toJSON(message) {
        const obj = {};
        message.from !== undefined && (obj.from = message.from);
        return obj;
    },
    fromPartial(object) {
        var _a;
        const message = createBaseMsgUnpauseSendingAndReceivingMessages();
        message.from = (_a = object.from) !== null && _a !== void 0 ? _a : "";
        return message;
    },
};
function createBaseMsgUnpauseSendingAndReceivingMessagesResponse() {
    return {};
}
exports.MsgUnpauseSendingAndReceivingMessagesResponse = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUnpauseSendingAndReceivingMessagesResponse();
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
        const message = createBaseMsgUnpauseSendingAndReceivingMessagesResponse();
        return message;
    },
};
function createBaseMsgUpdateMaxMessageBodySize() {
    return { from: "", messageSize: "0" };
}
exports.MsgUpdateMaxMessageBodySize = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.from !== "") {
            writer.uint32(10).string(message.from);
        }
        if (message.messageSize !== "0") {
            writer.uint32(16).uint64(message.messageSize);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateMaxMessageBodySize();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.from = reader.string();
                    break;
                case 2:
                    message.messageSize = longToString(reader.uint64());
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
            from: isSet(object.from) ? String(object.from) : "",
            messageSize: isSet(object.messageSize) ? String(object.messageSize) : "0",
        };
    },
    toJSON(message) {
        const obj = {};
        message.from !== undefined && (obj.from = message.from);
        message.messageSize !== undefined &&
            (obj.messageSize = message.messageSize);
        return obj;
    },
    fromPartial(object) {
        var _a, _b;
        const message = createBaseMsgUpdateMaxMessageBodySize();
        message.from = (_a = object.from) !== null && _a !== void 0 ? _a : "";
        message.messageSize = (_b = object.messageSize) !== null && _b !== void 0 ? _b : "0";
        return message;
    },
};
function createBaseMsgUpdateMaxMessageBodySizeResponse() {
    return {};
}
exports.MsgUpdateMaxMessageBodySizeResponse = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateMaxMessageBodySizeResponse();
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
        const message = createBaseMsgUpdateMaxMessageBodySizeResponse();
        return message;
    },
};
function createBaseMsgSetMaxBurnAmountPerMessage() {
    return { from: "", localToken: "", amount: "" };
}
exports.MsgSetMaxBurnAmountPerMessage = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.from !== "") {
            writer.uint32(10).string(message.from);
        }
        if (message.localToken !== "") {
            writer.uint32(18).string(message.localToken);
        }
        if (message.amount !== "") {
            writer.uint32(26).string(message.amount);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgSetMaxBurnAmountPerMessage();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.from = reader.string();
                    break;
                case 2:
                    message.localToken = reader.string();
                    break;
                case 3:
                    message.amount = reader.string();
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
            from: isSet(object.from) ? String(object.from) : "",
            localToken: isSet(object.localToken) ? String(object.localToken) : "",
            amount: isSet(object.amount) ? String(object.amount) : "",
        };
    },
    toJSON(message) {
        const obj = {};
        message.from !== undefined && (obj.from = message.from);
        message.localToken !== undefined && (obj.localToken = message.localToken);
        message.amount !== undefined && (obj.amount = message.amount);
        return obj;
    },
    fromPartial(object) {
        var _a, _b, _c;
        const message = createBaseMsgSetMaxBurnAmountPerMessage();
        message.from = (_a = object.from) !== null && _a !== void 0 ? _a : "";
        message.localToken = (_b = object.localToken) !== null && _b !== void 0 ? _b : "";
        message.amount = (_c = object.amount) !== null && _c !== void 0 ? _c : "";
        return message;
    },
};
function createBaseMsgSetMaxBurnAmountPerMessageResponse() {
    return {};
}
exports.MsgSetMaxBurnAmountPerMessageResponse = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgSetMaxBurnAmountPerMessageResponse();
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
        const message = createBaseMsgSetMaxBurnAmountPerMessageResponse();
        return message;
    },
};
function createBaseMsgDepositForBurn() {
    return {
        from: "",
        amount: "",
        destinationDomain: 0,
        mintRecipient: new Uint8Array(),
        burnToken: "",
    };
}
exports.MsgDepositForBurn = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.from !== "") {
            writer.uint32(10).string(message.from);
        }
        if (message.amount !== "") {
            writer.uint32(18).string(message.amount);
        }
        if (message.destinationDomain !== 0) {
            writer.uint32(24).uint32(message.destinationDomain);
        }
        if (message.mintRecipient.length !== 0) {
            writer.uint32(34).bytes(message.mintRecipient);
        }
        if (message.burnToken !== "") {
            writer.uint32(42).string(message.burnToken);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgDepositForBurn();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.from = reader.string();
                    break;
                case 2:
                    message.amount = reader.string();
                    break;
                case 3:
                    message.destinationDomain = reader.uint32();
                    break;
                case 4:
                    message.mintRecipient = reader.bytes();
                    break;
                case 5:
                    message.burnToken = reader.string();
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
            from: isSet(object.from) ? String(object.from) : "",
            amount: isSet(object.amount) ? String(object.amount) : "",
            destinationDomain: isSet(object.destinationDomain)
                ? Number(object.destinationDomain)
                : 0,
            mintRecipient: isSet(object.mintRecipient)
                ? bytesFromBase64(object.mintRecipient)
                : new Uint8Array(),
            burnToken: isSet(object.burnToken) ? String(object.burnToken) : "",
        };
    },
    toJSON(message) {
        const obj = {};
        message.from !== undefined && (obj.from = message.from);
        message.amount !== undefined && (obj.amount = message.amount);
        message.destinationDomain !== undefined &&
            (obj.destinationDomain = Math.round(message.destinationDomain));
        message.mintRecipient !== undefined &&
            (obj.mintRecipient = base64FromBytes(message.mintRecipient !== undefined
                ? message.mintRecipient
                : new Uint8Array()));
        message.burnToken !== undefined && (obj.burnToken = message.burnToken);
        return obj;
    },
    fromPartial(object) {
        var _a, _b, _c, _d, _e;
        const message = createBaseMsgDepositForBurn();
        message.from = (_a = object.from) !== null && _a !== void 0 ? _a : "";
        message.amount = (_b = object.amount) !== null && _b !== void 0 ? _b : "";
        message.destinationDomain = (_c = object.destinationDomain) !== null && _c !== void 0 ? _c : 0;
        message.mintRecipient = (_d = object.mintRecipient) !== null && _d !== void 0 ? _d : new Uint8Array();
        message.burnToken = (_e = object.burnToken) !== null && _e !== void 0 ? _e : "";
        return message;
    },
};
function createBaseMsgDepositForBurnResponse() {
    return { nonce: "0" };
}
exports.MsgDepositForBurnResponse = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.nonce !== "0") {
            writer.uint32(8).uint64(message.nonce);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgDepositForBurnResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.nonce = longToString(reader.uint64());
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
            nonce: isSet(object.nonce) ? String(object.nonce) : "0",
        };
    },
    toJSON(message) {
        const obj = {};
        message.nonce !== undefined && (obj.nonce = message.nonce);
        return obj;
    },
    fromPartial(object) {
        var _a;
        const message = createBaseMsgDepositForBurnResponse();
        message.nonce = (_a = object.nonce) !== null && _a !== void 0 ? _a : "0";
        return message;
    },
};
function createBaseMsgDepositForBurnWithCaller() {
    return {
        from: "",
        amount: "",
        destinationDomain: 0,
        mintRecipient: new Uint8Array(),
        burnToken: "",
        destinationCaller: new Uint8Array(),
    };
}
exports.MsgDepositForBurnWithCaller = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.from !== "") {
            writer.uint32(10).string(message.from);
        }
        if (message.amount !== "") {
            writer.uint32(18).string(message.amount);
        }
        if (message.destinationDomain !== 0) {
            writer.uint32(24).uint32(message.destinationDomain);
        }
        if (message.mintRecipient.length !== 0) {
            writer.uint32(34).bytes(message.mintRecipient);
        }
        if (message.burnToken !== "") {
            writer.uint32(42).string(message.burnToken);
        }
        if (message.destinationCaller.length !== 0) {
            writer.uint32(50).bytes(message.destinationCaller);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgDepositForBurnWithCaller();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.from = reader.string();
                    break;
                case 2:
                    message.amount = reader.string();
                    break;
                case 3:
                    message.destinationDomain = reader.uint32();
                    break;
                case 4:
                    message.mintRecipient = reader.bytes();
                    break;
                case 5:
                    message.burnToken = reader.string();
                    break;
                case 6:
                    message.destinationCaller = reader.bytes();
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
            from: isSet(object.from) ? String(object.from) : "",
            amount: isSet(object.amount) ? String(object.amount) : "",
            destinationDomain: isSet(object.destinationDomain)
                ? Number(object.destinationDomain)
                : 0,
            mintRecipient: isSet(object.mintRecipient)
                ? bytesFromBase64(object.mintRecipient)
                : new Uint8Array(),
            burnToken: isSet(object.burnToken) ? String(object.burnToken) : "",
            destinationCaller: isSet(object.destinationCaller)
                ? bytesFromBase64(object.destinationCaller)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.from !== undefined && (obj.from = message.from);
        message.amount !== undefined && (obj.amount = message.amount);
        message.destinationDomain !== undefined &&
            (obj.destinationDomain = Math.round(message.destinationDomain));
        message.mintRecipient !== undefined &&
            (obj.mintRecipient = base64FromBytes(message.mintRecipient !== undefined
                ? message.mintRecipient
                : new Uint8Array()));
        message.burnToken !== undefined && (obj.burnToken = message.burnToken);
        message.destinationCaller !== undefined &&
            (obj.destinationCaller = base64FromBytes(message.destinationCaller !== undefined
                ? message.destinationCaller
                : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        var _a, _b, _c, _d, _e, _f;
        const message = createBaseMsgDepositForBurnWithCaller();
        message.from = (_a = object.from) !== null && _a !== void 0 ? _a : "";
        message.amount = (_b = object.amount) !== null && _b !== void 0 ? _b : "";
        message.destinationDomain = (_c = object.destinationDomain) !== null && _c !== void 0 ? _c : 0;
        message.mintRecipient = (_d = object.mintRecipient) !== null && _d !== void 0 ? _d : new Uint8Array();
        message.burnToken = (_e = object.burnToken) !== null && _e !== void 0 ? _e : "";
        message.destinationCaller = (_f = object.destinationCaller) !== null && _f !== void 0 ? _f : new Uint8Array();
        return message;
    },
};
function createBaseMsgDepositForBurnWithCallerResponse() {
    return { nonce: "0" };
}
exports.MsgDepositForBurnWithCallerResponse = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.nonce !== "0") {
            writer.uint32(8).uint64(message.nonce);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgDepositForBurnWithCallerResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.nonce = longToString(reader.uint64());
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
            nonce: isSet(object.nonce) ? String(object.nonce) : "0",
        };
    },
    toJSON(message) {
        const obj = {};
        message.nonce !== undefined && (obj.nonce = message.nonce);
        return obj;
    },
    fromPartial(object) {
        var _a;
        const message = createBaseMsgDepositForBurnWithCallerResponse();
        message.nonce = (_a = object.nonce) !== null && _a !== void 0 ? _a : "0";
        return message;
    },
};
function createBaseMsgReplaceDepositForBurn() {
    return {
        from: "",
        originalMessage: new Uint8Array(),
        originalAttestation: new Uint8Array(),
        newDestinationCaller: new Uint8Array(),
        newMintRecipient: new Uint8Array(),
    };
}
exports.MsgReplaceDepositForBurn = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.from !== "") {
            writer.uint32(10).string(message.from);
        }
        if (message.originalMessage.length !== 0) {
            writer.uint32(18).bytes(message.originalMessage);
        }
        if (message.originalAttestation.length !== 0) {
            writer.uint32(26).bytes(message.originalAttestation);
        }
        if (message.newDestinationCaller.length !== 0) {
            writer.uint32(34).bytes(message.newDestinationCaller);
        }
        if (message.newMintRecipient.length !== 0) {
            writer.uint32(42).bytes(message.newMintRecipient);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgReplaceDepositForBurn();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.from = reader.string();
                    break;
                case 2:
                    message.originalMessage = reader.bytes();
                    break;
                case 3:
                    message.originalAttestation = reader.bytes();
                    break;
                case 4:
                    message.newDestinationCaller = reader.bytes();
                    break;
                case 5:
                    message.newMintRecipient = reader.bytes();
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
            from: isSet(object.from) ? String(object.from) : "",
            originalMessage: isSet(object.originalMessage)
                ? bytesFromBase64(object.originalMessage)
                : new Uint8Array(),
            originalAttestation: isSet(object.originalAttestation)
                ? bytesFromBase64(object.originalAttestation)
                : new Uint8Array(),
            newDestinationCaller: isSet(object.newDestinationCaller)
                ? bytesFromBase64(object.newDestinationCaller)
                : new Uint8Array(),
            newMintRecipient: isSet(object.newMintRecipient)
                ? bytesFromBase64(object.newMintRecipient)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.from !== undefined && (obj.from = message.from);
        message.originalMessage !== undefined &&
            (obj.originalMessage = base64FromBytes(message.originalMessage !== undefined
                ? message.originalMessage
                : new Uint8Array()));
        message.originalAttestation !== undefined &&
            (obj.originalAttestation = base64FromBytes(message.originalAttestation !== undefined
                ? message.originalAttestation
                : new Uint8Array()));
        message.newDestinationCaller !== undefined &&
            (obj.newDestinationCaller = base64FromBytes(message.newDestinationCaller !== undefined
                ? message.newDestinationCaller
                : new Uint8Array()));
        message.newMintRecipient !== undefined &&
            (obj.newMintRecipient = base64FromBytes(message.newMintRecipient !== undefined
                ? message.newMintRecipient
                : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        var _a, _b, _c, _d, _e;
        const message = createBaseMsgReplaceDepositForBurn();
        message.from = (_a = object.from) !== null && _a !== void 0 ? _a : "";
        message.originalMessage = (_b = object.originalMessage) !== null && _b !== void 0 ? _b : new Uint8Array();
        message.originalAttestation =
            (_c = object.originalAttestation) !== null && _c !== void 0 ? _c : new Uint8Array();
        message.newDestinationCaller =
            (_d = object.newDestinationCaller) !== null && _d !== void 0 ? _d : new Uint8Array();
        message.newMintRecipient = (_e = object.newMintRecipient) !== null && _e !== void 0 ? _e : new Uint8Array();
        return message;
    },
};
function createBaseMsgReplaceDepositForBurnResponse() {
    return {};
}
exports.MsgReplaceDepositForBurnResponse = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgReplaceDepositForBurnResponse();
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
        const message = createBaseMsgReplaceDepositForBurnResponse();
        return message;
    },
};
function createBaseMsgReceiveMessage() {
    return { from: "", message: new Uint8Array(), attestation: new Uint8Array() };
}
exports.MsgReceiveMessage = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.from !== "") {
            writer.uint32(10).string(message.from);
        }
        if (message.message.length !== 0) {
            writer.uint32(18).bytes(message.message);
        }
        if (message.attestation.length !== 0) {
            writer.uint32(26).bytes(message.attestation);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgReceiveMessage();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.from = reader.string();
                    break;
                case 2:
                    message.message = reader.bytes();
                    break;
                case 3:
                    message.attestation = reader.bytes();
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
            from: isSet(object.from) ? String(object.from) : "",
            message: isSet(object.message)
                ? bytesFromBase64(object.message)
                : new Uint8Array(),
            attestation: isSet(object.attestation)
                ? bytesFromBase64(object.attestation)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.from !== undefined && (obj.from = message.from);
        message.message !== undefined &&
            (obj.message = base64FromBytes(message.message !== undefined ? message.message : new Uint8Array()));
        message.attestation !== undefined &&
            (obj.attestation = base64FromBytes(message.attestation !== undefined
                ? message.attestation
                : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        var _a, _b, _c;
        const message = createBaseMsgReceiveMessage();
        message.from = (_a = object.from) !== null && _a !== void 0 ? _a : "";
        message.message = (_b = object.message) !== null && _b !== void 0 ? _b : new Uint8Array();
        message.attestation = (_c = object.attestation) !== null && _c !== void 0 ? _c : new Uint8Array();
        return message;
    },
};
function createBaseMsgReceiveMessageResponse() {
    return { success: false };
}
exports.MsgReceiveMessageResponse = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.success === true) {
            writer.uint32(8).bool(message.success);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgReceiveMessageResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.success = reader.bool();
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
            success: isSet(object.success) ? Boolean(object.success) : false,
        };
    },
    toJSON(message) {
        const obj = {};
        message.success !== undefined && (obj.success = message.success);
        return obj;
    },
    fromPartial(object) {
        var _a;
        const message = createBaseMsgReceiveMessageResponse();
        message.success = (_a = object.success) !== null && _a !== void 0 ? _a : false;
        return message;
    },
};
function createBaseMsgSendMessage() {
    return {
        from: "",
        destinationDomain: 0,
        recipient: new Uint8Array(),
        messageBody: new Uint8Array(),
    };
}
exports.MsgSendMessage = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.from !== "") {
            writer.uint32(10).string(message.from);
        }
        if (message.destinationDomain !== 0) {
            writer.uint32(16).uint32(message.destinationDomain);
        }
        if (message.recipient.length !== 0) {
            writer.uint32(26).bytes(message.recipient);
        }
        if (message.messageBody.length !== 0) {
            writer.uint32(34).bytes(message.messageBody);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgSendMessage();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.from = reader.string();
                    break;
                case 2:
                    message.destinationDomain = reader.uint32();
                    break;
                case 3:
                    message.recipient = reader.bytes();
                    break;
                case 4:
                    message.messageBody = reader.bytes();
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
            from: isSet(object.from) ? String(object.from) : "",
            destinationDomain: isSet(object.destinationDomain)
                ? Number(object.destinationDomain)
                : 0,
            recipient: isSet(object.recipient)
                ? bytesFromBase64(object.recipient)
                : new Uint8Array(),
            messageBody: isSet(object.messageBody)
                ? bytesFromBase64(object.messageBody)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.from !== undefined && (obj.from = message.from);
        message.destinationDomain !== undefined &&
            (obj.destinationDomain = Math.round(message.destinationDomain));
        message.recipient !== undefined &&
            (obj.recipient = base64FromBytes(message.recipient !== undefined ? message.recipient : new Uint8Array()));
        message.messageBody !== undefined &&
            (obj.messageBody = base64FromBytes(message.messageBody !== undefined
                ? message.messageBody
                : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        var _a, _b, _c, _d;
        const message = createBaseMsgSendMessage();
        message.from = (_a = object.from) !== null && _a !== void 0 ? _a : "";
        message.destinationDomain = (_b = object.destinationDomain) !== null && _b !== void 0 ? _b : 0;
        message.recipient = (_c = object.recipient) !== null && _c !== void 0 ? _c : new Uint8Array();
        message.messageBody = (_d = object.messageBody) !== null && _d !== void 0 ? _d : new Uint8Array();
        return message;
    },
};
function createBaseMsgSendMessageResponse() {
    return { nonce: "0" };
}
exports.MsgSendMessageResponse = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.nonce !== "0") {
            writer.uint32(8).uint64(message.nonce);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgSendMessageResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.nonce = longToString(reader.uint64());
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
            nonce: isSet(object.nonce) ? String(object.nonce) : "0",
        };
    },
    toJSON(message) {
        const obj = {};
        message.nonce !== undefined && (obj.nonce = message.nonce);
        return obj;
    },
    fromPartial(object) {
        var _a;
        const message = createBaseMsgSendMessageResponse();
        message.nonce = (_a = object.nonce) !== null && _a !== void 0 ? _a : "0";
        return message;
    },
};
function createBaseMsgSendMessageWithCaller() {
    return {
        from: "",
        destinationDomain: 0,
        recipient: new Uint8Array(),
        messageBody: new Uint8Array(),
        destinationCaller: new Uint8Array(),
    };
}
exports.MsgSendMessageWithCaller = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.from !== "") {
            writer.uint32(10).string(message.from);
        }
        if (message.destinationDomain !== 0) {
            writer.uint32(16).uint32(message.destinationDomain);
        }
        if (message.recipient.length !== 0) {
            writer.uint32(26).bytes(message.recipient);
        }
        if (message.messageBody.length !== 0) {
            writer.uint32(34).bytes(message.messageBody);
        }
        if (message.destinationCaller.length !== 0) {
            writer.uint32(42).bytes(message.destinationCaller);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgSendMessageWithCaller();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.from = reader.string();
                    break;
                case 2:
                    message.destinationDomain = reader.uint32();
                    break;
                case 3:
                    message.recipient = reader.bytes();
                    break;
                case 4:
                    message.messageBody = reader.bytes();
                    break;
                case 5:
                    message.destinationCaller = reader.bytes();
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
            from: isSet(object.from) ? String(object.from) : "",
            destinationDomain: isSet(object.destinationDomain)
                ? Number(object.destinationDomain)
                : 0,
            recipient: isSet(object.recipient)
                ? bytesFromBase64(object.recipient)
                : new Uint8Array(),
            messageBody: isSet(object.messageBody)
                ? bytesFromBase64(object.messageBody)
                : new Uint8Array(),
            destinationCaller: isSet(object.destinationCaller)
                ? bytesFromBase64(object.destinationCaller)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.from !== undefined && (obj.from = message.from);
        message.destinationDomain !== undefined &&
            (obj.destinationDomain = Math.round(message.destinationDomain));
        message.recipient !== undefined &&
            (obj.recipient = base64FromBytes(message.recipient !== undefined ? message.recipient : new Uint8Array()));
        message.messageBody !== undefined &&
            (obj.messageBody = base64FromBytes(message.messageBody !== undefined
                ? message.messageBody
                : new Uint8Array()));
        message.destinationCaller !== undefined &&
            (obj.destinationCaller = base64FromBytes(message.destinationCaller !== undefined
                ? message.destinationCaller
                : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        var _a, _b, _c, _d, _e;
        const message = createBaseMsgSendMessageWithCaller();
        message.from = (_a = object.from) !== null && _a !== void 0 ? _a : "";
        message.destinationDomain = (_b = object.destinationDomain) !== null && _b !== void 0 ? _b : 0;
        message.recipient = (_c = object.recipient) !== null && _c !== void 0 ? _c : new Uint8Array();
        message.messageBody = (_d = object.messageBody) !== null && _d !== void 0 ? _d : new Uint8Array();
        message.destinationCaller = (_e = object.destinationCaller) !== null && _e !== void 0 ? _e : new Uint8Array();
        return message;
    },
};
function createBaseMsgSendMessageWithCallerResponse() {
    return { nonce: "0" };
}
exports.MsgSendMessageWithCallerResponse = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.nonce !== "0") {
            writer.uint32(8).uint64(message.nonce);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgSendMessageWithCallerResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.nonce = longToString(reader.uint64());
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
            nonce: isSet(object.nonce) ? String(object.nonce) : "0",
        };
    },
    toJSON(message) {
        const obj = {};
        message.nonce !== undefined && (obj.nonce = message.nonce);
        return obj;
    },
    fromPartial(object) {
        var _a;
        const message = createBaseMsgSendMessageWithCallerResponse();
        message.nonce = (_a = object.nonce) !== null && _a !== void 0 ? _a : "0";
        return message;
    },
};
function createBaseMsgReplaceMessage() {
    return {
        from: "",
        originalMessage: new Uint8Array(),
        originalAttestation: new Uint8Array(),
        newMessageBody: new Uint8Array(),
        newDestinationCaller: new Uint8Array(),
    };
}
exports.MsgReplaceMessage = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.from !== "") {
            writer.uint32(10).string(message.from);
        }
        if (message.originalMessage.length !== 0) {
            writer.uint32(18).bytes(message.originalMessage);
        }
        if (message.originalAttestation.length !== 0) {
            writer.uint32(26).bytes(message.originalAttestation);
        }
        if (message.newMessageBody.length !== 0) {
            writer.uint32(34).bytes(message.newMessageBody);
        }
        if (message.newDestinationCaller.length !== 0) {
            writer.uint32(42).bytes(message.newDestinationCaller);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgReplaceMessage();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.from = reader.string();
                    break;
                case 2:
                    message.originalMessage = reader.bytes();
                    break;
                case 3:
                    message.originalAttestation = reader.bytes();
                    break;
                case 4:
                    message.newMessageBody = reader.bytes();
                    break;
                case 5:
                    message.newDestinationCaller = reader.bytes();
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
            from: isSet(object.from) ? String(object.from) : "",
            originalMessage: isSet(object.originalMessage)
                ? bytesFromBase64(object.originalMessage)
                : new Uint8Array(),
            originalAttestation: isSet(object.originalAttestation)
                ? bytesFromBase64(object.originalAttestation)
                : new Uint8Array(),
            newMessageBody: isSet(object.newMessageBody)
                ? bytesFromBase64(object.newMessageBody)
                : new Uint8Array(),
            newDestinationCaller: isSet(object.newDestinationCaller)
                ? bytesFromBase64(object.newDestinationCaller)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.from !== undefined && (obj.from = message.from);
        message.originalMessage !== undefined &&
            (obj.originalMessage = base64FromBytes(message.originalMessage !== undefined
                ? message.originalMessage
                : new Uint8Array()));
        message.originalAttestation !== undefined &&
            (obj.originalAttestation = base64FromBytes(message.originalAttestation !== undefined
                ? message.originalAttestation
                : new Uint8Array()));
        message.newMessageBody !== undefined &&
            (obj.newMessageBody = base64FromBytes(message.newMessageBody !== undefined
                ? message.newMessageBody
                : new Uint8Array()));
        message.newDestinationCaller !== undefined &&
            (obj.newDestinationCaller = base64FromBytes(message.newDestinationCaller !== undefined
                ? message.newDestinationCaller
                : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        var _a, _b, _c, _d, _e;
        const message = createBaseMsgReplaceMessage();
        message.from = (_a = object.from) !== null && _a !== void 0 ? _a : "";
        message.originalMessage = (_b = object.originalMessage) !== null && _b !== void 0 ? _b : new Uint8Array();
        message.originalAttestation =
            (_c = object.originalAttestation) !== null && _c !== void 0 ? _c : new Uint8Array();
        message.newMessageBody = (_d = object.newMessageBody) !== null && _d !== void 0 ? _d : new Uint8Array();
        message.newDestinationCaller =
            (_e = object.newDestinationCaller) !== null && _e !== void 0 ? _e : new Uint8Array();
        return message;
    },
};
function createBaseMsgReplaceMessageResponse() {
    return {};
}
exports.MsgReplaceMessageResponse = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgReplaceMessageResponse();
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
        const message = createBaseMsgReplaceMessageResponse();
        return message;
    },
};
function createBaseMsgUpdateSignatureThreshold() {
    return { from: "", amount: 0 };
}
exports.MsgUpdateSignatureThreshold = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.from !== "") {
            writer.uint32(10).string(message.from);
        }
        if (message.amount !== 0) {
            writer.uint32(16).uint32(message.amount);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateSignatureThreshold();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.from = reader.string();
                    break;
                case 2:
                    message.amount = reader.uint32();
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
            from: isSet(object.from) ? String(object.from) : "",
            amount: isSet(object.amount) ? Number(object.amount) : 0,
        };
    },
    toJSON(message) {
        const obj = {};
        message.from !== undefined && (obj.from = message.from);
        message.amount !== undefined && (obj.amount = Math.round(message.amount));
        return obj;
    },
    fromPartial(object) {
        var _a, _b;
        const message = createBaseMsgUpdateSignatureThreshold();
        message.from = (_a = object.from) !== null && _a !== void 0 ? _a : "";
        message.amount = (_b = object.amount) !== null && _b !== void 0 ? _b : 0;
        return message;
    },
};
function createBaseMsgUpdateSignatureThresholdResponse() {
    return {};
}
exports.MsgUpdateSignatureThresholdResponse = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateSignatureThresholdResponse();
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
        const message = createBaseMsgUpdateSignatureThresholdResponse();
        return message;
    },
};
function createBaseMsgLinkTokenPair() {
    return {
        from: "",
        remoteDomain: 0,
        remoteToken: new Uint8Array(),
        localToken: "",
    };
}
exports.MsgLinkTokenPair = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.from !== "") {
            writer.uint32(10).string(message.from);
        }
        if (message.remoteDomain !== 0) {
            writer.uint32(16).uint32(message.remoteDomain);
        }
        if (message.remoteToken.length !== 0) {
            writer.uint32(26).bytes(message.remoteToken);
        }
        if (message.localToken !== "") {
            writer.uint32(34).string(message.localToken);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgLinkTokenPair();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.from = reader.string();
                    break;
                case 2:
                    message.remoteDomain = reader.uint32();
                    break;
                case 3:
                    message.remoteToken = reader.bytes();
                    break;
                case 4:
                    message.localToken = reader.string();
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
            from: isSet(object.from) ? String(object.from) : "",
            remoteDomain: isSet(object.remoteDomain)
                ? Number(object.remoteDomain)
                : 0,
            remoteToken: isSet(object.remoteToken)
                ? bytesFromBase64(object.remoteToken)
                : new Uint8Array(),
            localToken: isSet(object.localToken) ? String(object.localToken) : "",
        };
    },
    toJSON(message) {
        const obj = {};
        message.from !== undefined && (obj.from = message.from);
        message.remoteDomain !== undefined &&
            (obj.remoteDomain = Math.round(message.remoteDomain));
        message.remoteToken !== undefined &&
            (obj.remoteToken = base64FromBytes(message.remoteToken !== undefined
                ? message.remoteToken
                : new Uint8Array()));
        message.localToken !== undefined && (obj.localToken = message.localToken);
        return obj;
    },
    fromPartial(object) {
        var _a, _b, _c, _d;
        const message = createBaseMsgLinkTokenPair();
        message.from = (_a = object.from) !== null && _a !== void 0 ? _a : "";
        message.remoteDomain = (_b = object.remoteDomain) !== null && _b !== void 0 ? _b : 0;
        message.remoteToken = (_c = object.remoteToken) !== null && _c !== void 0 ? _c : new Uint8Array();
        message.localToken = (_d = object.localToken) !== null && _d !== void 0 ? _d : "";
        return message;
    },
};
function createBaseMsgLinkTokenPairResponse() {
    return {};
}
exports.MsgLinkTokenPairResponse = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgLinkTokenPairResponse();
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
        const message = createBaseMsgLinkTokenPairResponse();
        return message;
    },
};
function createBaseMsgUnlinkTokenPair() {
    return {
        from: "",
        remoteDomain: 0,
        remoteToken: new Uint8Array(),
        localToken: "",
    };
}
exports.MsgUnlinkTokenPair = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.from !== "") {
            writer.uint32(10).string(message.from);
        }
        if (message.remoteDomain !== 0) {
            writer.uint32(16).uint32(message.remoteDomain);
        }
        if (message.remoteToken.length !== 0) {
            writer.uint32(26).bytes(message.remoteToken);
        }
        if (message.localToken !== "") {
            writer.uint32(34).string(message.localToken);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUnlinkTokenPair();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.from = reader.string();
                    break;
                case 2:
                    message.remoteDomain = reader.uint32();
                    break;
                case 3:
                    message.remoteToken = reader.bytes();
                    break;
                case 4:
                    message.localToken = reader.string();
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
            from: isSet(object.from) ? String(object.from) : "",
            remoteDomain: isSet(object.remoteDomain)
                ? Number(object.remoteDomain)
                : 0,
            remoteToken: isSet(object.remoteToken)
                ? bytesFromBase64(object.remoteToken)
                : new Uint8Array(),
            localToken: isSet(object.localToken) ? String(object.localToken) : "",
        };
    },
    toJSON(message) {
        const obj = {};
        message.from !== undefined && (obj.from = message.from);
        message.remoteDomain !== undefined &&
            (obj.remoteDomain = Math.round(message.remoteDomain));
        message.remoteToken !== undefined &&
            (obj.remoteToken = base64FromBytes(message.remoteToken !== undefined
                ? message.remoteToken
                : new Uint8Array()));
        message.localToken !== undefined && (obj.localToken = message.localToken);
        return obj;
    },
    fromPartial(object) {
        var _a, _b, _c, _d;
        const message = createBaseMsgUnlinkTokenPair();
        message.from = (_a = object.from) !== null && _a !== void 0 ? _a : "";
        message.remoteDomain = (_b = object.remoteDomain) !== null && _b !== void 0 ? _b : 0;
        message.remoteToken = (_c = object.remoteToken) !== null && _c !== void 0 ? _c : new Uint8Array();
        message.localToken = (_d = object.localToken) !== null && _d !== void 0 ? _d : "";
        return message;
    },
};
function createBaseMsgUnlinkTokenPairResponse() {
    return {};
}
exports.MsgUnlinkTokenPairResponse = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUnlinkTokenPairResponse();
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
        const message = createBaseMsgUnlinkTokenPairResponse();
        return message;
    },
};
function createBaseMsgAddRemoteTokenMessenger() {
    return { from: "", domainId: 0, address: new Uint8Array() };
}
exports.MsgAddRemoteTokenMessenger = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.from !== "") {
            writer.uint32(10).string(message.from);
        }
        if (message.domainId !== 0) {
            writer.uint32(16).uint32(message.domainId);
        }
        if (message.address.length !== 0) {
            writer.uint32(26).bytes(message.address);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgAddRemoteTokenMessenger();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.from = reader.string();
                    break;
                case 2:
                    message.domainId = reader.uint32();
                    break;
                case 3:
                    message.address = reader.bytes();
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
            from: isSet(object.from) ? String(object.from) : "",
            domainId: isSet(object.domainId) ? Number(object.domainId) : 0,
            address: isSet(object.address)
                ? bytesFromBase64(object.address)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.from !== undefined && (obj.from = message.from);
        message.domainId !== undefined &&
            (obj.domainId = Math.round(message.domainId));
        message.address !== undefined &&
            (obj.address = base64FromBytes(message.address !== undefined ? message.address : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        var _a, _b, _c;
        const message = createBaseMsgAddRemoteTokenMessenger();
        message.from = (_a = object.from) !== null && _a !== void 0 ? _a : "";
        message.domainId = (_b = object.domainId) !== null && _b !== void 0 ? _b : 0;
        message.address = (_c = object.address) !== null && _c !== void 0 ? _c : new Uint8Array();
        return message;
    },
};
function createBaseMsgAddRemoteTokenMessengerResponse() {
    return {};
}
exports.MsgAddRemoteTokenMessengerResponse = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgAddRemoteTokenMessengerResponse();
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
        const message = createBaseMsgAddRemoteTokenMessengerResponse();
        return message;
    },
};
function createBaseMsgRemoveRemoteTokenMessenger() {
    return { from: "", domainId: 0 };
}
exports.MsgRemoveRemoteTokenMessenger = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.from !== "") {
            writer.uint32(10).string(message.from);
        }
        if (message.domainId !== 0) {
            writer.uint32(16).uint32(message.domainId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgRemoveRemoteTokenMessenger();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.from = reader.string();
                    break;
                case 2:
                    message.domainId = reader.uint32();
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
            from: isSet(object.from) ? String(object.from) : "",
            domainId: isSet(object.domainId) ? Number(object.domainId) : 0,
        };
    },
    toJSON(message) {
        const obj = {};
        message.from !== undefined && (obj.from = message.from);
        message.domainId !== undefined &&
            (obj.domainId = Math.round(message.domainId));
        return obj;
    },
    fromPartial(object) {
        var _a, _b;
        const message = createBaseMsgRemoveRemoteTokenMessenger();
        message.from = (_a = object.from) !== null && _a !== void 0 ? _a : "";
        message.domainId = (_b = object.domainId) !== null && _b !== void 0 ? _b : 0;
        return message;
    },
};
function createBaseMsgRemoveRemoteTokenMessengerResponse() {
    return {};
}
exports.MsgRemoveRemoteTokenMessengerResponse = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgRemoveRemoteTokenMessengerResponse();
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
        const message = createBaseMsgRemoveRemoteTokenMessengerResponse();
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
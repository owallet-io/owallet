"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.algorithmToJSON = exports.algorithmFromJSON = exports.Algorithm = exports.protobufPackage = void 0;
/* eslint-disable */
const long_1 = __importDefault(require("long"));
const minimal_1 = __importDefault(require("protobufjs/minimal"));
exports.protobufPackage = "noble.swap.v1";
/** buf:lint:ignore ENUM_VALUE_PREFIX */
var Algorithm;
(function (Algorithm) {
    /** UNSPECIFIED - buf:lint:ignore ENUM_ZERO_VALUE_SUFFIX */
    Algorithm[Algorithm["UNSPECIFIED"] = 0] = "UNSPECIFIED";
    Algorithm[Algorithm["STABLESWAP"] = 1] = "STABLESWAP";
    Algorithm[Algorithm["PERFECTPRICE"] = 2] = "PERFECTPRICE";
    Algorithm[Algorithm["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(Algorithm = exports.Algorithm || (exports.Algorithm = {}));
function algorithmFromJSON(object) {
    switch (object) {
        case 0:
        case "UNSPECIFIED":
            return Algorithm.UNSPECIFIED;
        case 1:
        case "STABLESWAP":
            return Algorithm.STABLESWAP;
        case 2:
        case "PERFECTPRICE":
            return Algorithm.PERFECTPRICE;
        case -1:
        case "UNRECOGNIZED":
        default:
            return Algorithm.UNRECOGNIZED;
    }
}
exports.algorithmFromJSON = algorithmFromJSON;
function algorithmToJSON(object) {
    switch (object) {
        case Algorithm.UNSPECIFIED:
            return "UNSPECIFIED";
        case Algorithm.STABLESWAP:
            return "STABLESWAP";
        case Algorithm.PERFECTPRICE:
            return "PERFECTPRICE";
        default:
            return "UNKNOWN";
    }
}
exports.algorithmToJSON = algorithmToJSON;
if (minimal_1.default.util.Long !== long_1.default) {
    minimal_1.default.util.Long = long_1.default;
    minimal_1.default.configure();
}
//# sourceMappingURL=algorithm.js.map
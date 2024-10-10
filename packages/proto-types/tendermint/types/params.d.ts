import _m0 from "protobufjs/minimal";
import { Duration } from "../../google/protobuf/duration";
export declare const protobufPackage = "tendermint.types";
/**
 * ConsensusParams contains consensus critical parameters that determine the
 * validity of blocks.
 */
export interface ConsensusParams {
  block: BlockParams | undefined;
  evidence: EvidenceParams | undefined;
  validator: ValidatorParams | undefined;
  version: VersionParams | undefined;
}
/** BlockParams contains limits on the block size. */
export interface BlockParams {
  /**
   * Max block size, in bytes.
   * Note: must be greater than 0
   */
  maxBytes: string;
  /**
   * Max gas per block.
   * Note: must be greater or equal to -1
   */
  maxGas: string;
  /**
   * Minimum time increment between consecutive blocks (in milliseconds) If the
   * block header timestamp is ahead of the system clock, decrease this value.
   *
   * Not exposed to the application.
   */
  timeIotaMs: string;
}
/** EvidenceParams determine how we handle evidence of malfeasance. */
export interface EvidenceParams {
  /**
   * Max age of evidence, in blocks.
   *
   * The basic formula for calculating this is: MaxAgeDuration / {average block
   * time}.
   */
  maxAgeNumBlocks: string;
  /**
   * Max age of evidence, in time.
   *
   * It should correspond with an app's "unbonding period" or other similar
   * mechanism for handling [Nothing-At-Stake
   * attacks](https://github.com/ethereum/wiki/wiki/Proof-of-Stake-FAQ#what-is-the-nothing-at-stake-problem-and-how-can-it-be-fixed).
   */
  maxAgeDuration: Duration | undefined;
  /**
   * This sets the maximum size of total evidence in bytes that can be committed in a single block.
   * and should fall comfortably under the max block bytes.
   * Default is 1048576 or 1MB
   */
  maxBytes: string;
}
/**
 * ValidatorParams restrict the public key types validators can use.
 * NOTE: uses ABCI pubkey naming, not Amino names.
 */
export interface ValidatorParams {
  pubKeyTypes: string[];
}
/** VersionParams contains the ABCI application version. */
export interface VersionParams {
  appVersion: string;
}
/**
 * HashedParams is a subset of ConsensusParams.
 *
 * It is hashed into the Header.ConsensusHash.
 */
export interface HashedParams {
  blockMaxBytes: string;
  blockMaxGas: string;
}
export declare const ConsensusParams: {
  encode(message: ConsensusParams, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): ConsensusParams;
  fromJSON(object: any): ConsensusParams;
  toJSON(message: ConsensusParams): unknown;
  create<
    I extends {
      block?: {
        maxBytes?: string;
        maxGas?: string;
        timeIotaMs?: string;
      };
      evidence?: {
        maxAgeNumBlocks?: string;
        maxAgeDuration?: {
          seconds?: string;
          nanos?: number;
        };
        maxBytes?: string;
      };
      validator?: {
        pubKeyTypes?: string[];
      };
      version?: {
        appVersion?: string;
      };
    } & {
      block?: {
        maxBytes?: string;
        maxGas?: string;
        timeIotaMs?: string;
      } & {
        maxBytes?: string;
        maxGas?: string;
        timeIotaMs?: string;
      } & { [K in Exclude<keyof I["block"], keyof BlockParams>]: never };
      evidence?: {
        maxAgeNumBlocks?: string;
        maxAgeDuration?: {
          seconds?: string;
          nanos?: number;
        };
        maxBytes?: string;
      } & {
        maxAgeNumBlocks?: string;
        maxAgeDuration?: {
          seconds?: string;
          nanos?: number;
        } & {
          seconds?: string;
          nanos?: number;
        } & {
          [K_1 in Exclude<
            keyof I["evidence"]["maxAgeDuration"],
            keyof Duration
          >]: never;
        };
        maxBytes?: string;
      } & {
        [K_2 in Exclude<keyof I["evidence"], keyof EvidenceParams>]: never;
      };
      validator?: {
        pubKeyTypes?: string[];
      } & {
        pubKeyTypes?: string[] &
          string[] & {
            [K_3 in Exclude<
              keyof I["validator"]["pubKeyTypes"],
              keyof string[]
            >]: never;
          };
      } & { [K_4 in Exclude<keyof I["validator"], "pubKeyTypes">]: never };
      version?: {
        appVersion?: string;
      } & {
        appVersion?: string;
      } & { [K_5 in Exclude<keyof I["version"], "appVersion">]: never };
    } & { [K_6 in Exclude<keyof I, keyof ConsensusParams>]: never }
  >(
    base?: I
  ): ConsensusParams;
  fromPartial<
    I_1 extends {
      block?: {
        maxBytes?: string;
        maxGas?: string;
        timeIotaMs?: string;
      };
      evidence?: {
        maxAgeNumBlocks?: string;
        maxAgeDuration?: {
          seconds?: string;
          nanos?: number;
        };
        maxBytes?: string;
      };
      validator?: {
        pubKeyTypes?: string[];
      };
      version?: {
        appVersion?: string;
      };
    } & {
      block?: {
        maxBytes?: string;
        maxGas?: string;
        timeIotaMs?: string;
      } & {
        maxBytes?: string;
        maxGas?: string;
        timeIotaMs?: string;
      } & { [K_7 in Exclude<keyof I_1["block"], keyof BlockParams>]: never };
      evidence?: {
        maxAgeNumBlocks?: string;
        maxAgeDuration?: {
          seconds?: string;
          nanos?: number;
        };
        maxBytes?: string;
      } & {
        maxAgeNumBlocks?: string;
        maxAgeDuration?: {
          seconds?: string;
          nanos?: number;
        } & {
          seconds?: string;
          nanos?: number;
        } & {
          [K_8 in Exclude<
            keyof I_1["evidence"]["maxAgeDuration"],
            keyof Duration
          >]: never;
        };
        maxBytes?: string;
      } & {
        [K_9 in Exclude<keyof I_1["evidence"], keyof EvidenceParams>]: never;
      };
      validator?: {
        pubKeyTypes?: string[];
      } & {
        pubKeyTypes?: string[] &
          string[] & {
            [K_10 in Exclude<
              keyof I_1["validator"]["pubKeyTypes"],
              keyof string[]
            >]: never;
          };
      } & { [K_11 in Exclude<keyof I_1["validator"], "pubKeyTypes">]: never };
      version?: {
        appVersion?: string;
      } & {
        appVersion?: string;
      } & { [K_12 in Exclude<keyof I_1["version"], "appVersion">]: never };
    } & { [K_13 in Exclude<keyof I_1, keyof ConsensusParams>]: never }
  >(
    object: I_1
  ): ConsensusParams;
};
export declare const BlockParams: {
  encode(message: BlockParams, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): BlockParams;
  fromJSON(object: any): BlockParams;
  toJSON(message: BlockParams): unknown;
  create<
    I extends {
      maxBytes?: string;
      maxGas?: string;
      timeIotaMs?: string;
    } & {
      maxBytes?: string;
      maxGas?: string;
      timeIotaMs?: string;
    } & { [K in Exclude<keyof I, keyof BlockParams>]: never }
  >(
    base?: I
  ): BlockParams;
  fromPartial<
    I_1 extends {
      maxBytes?: string;
      maxGas?: string;
      timeIotaMs?: string;
    } & {
      maxBytes?: string;
      maxGas?: string;
      timeIotaMs?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof BlockParams>]: never }
  >(
    object: I_1
  ): BlockParams;
};
export declare const EvidenceParams: {
  encode(message: EvidenceParams, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): EvidenceParams;
  fromJSON(object: any): EvidenceParams;
  toJSON(message: EvidenceParams): unknown;
  create<
    I extends {
      maxAgeNumBlocks?: string;
      maxAgeDuration?: {
        seconds?: string;
        nanos?: number;
      };
      maxBytes?: string;
    } & {
      maxAgeNumBlocks?: string;
      maxAgeDuration?: {
        seconds?: string;
        nanos?: number;
      } & {
        seconds?: string;
        nanos?: number;
      } & { [K in Exclude<keyof I["maxAgeDuration"], keyof Duration>]: never };
      maxBytes?: string;
    } & { [K_1 in Exclude<keyof I, keyof EvidenceParams>]: never }
  >(
    base?: I
  ): EvidenceParams;
  fromPartial<
    I_1 extends {
      maxAgeNumBlocks?: string;
      maxAgeDuration?: {
        seconds?: string;
        nanos?: number;
      };
      maxBytes?: string;
    } & {
      maxAgeNumBlocks?: string;
      maxAgeDuration?: {
        seconds?: string;
        nanos?: number;
      } & {
        seconds?: string;
        nanos?: number;
      } & {
        [K_2 in Exclude<keyof I_1["maxAgeDuration"], keyof Duration>]: never;
      };
      maxBytes?: string;
    } & { [K_3 in Exclude<keyof I_1, keyof EvidenceParams>]: never }
  >(
    object: I_1
  ): EvidenceParams;
};
export declare const ValidatorParams: {
  encode(message: ValidatorParams, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): ValidatorParams;
  fromJSON(object: any): ValidatorParams;
  toJSON(message: ValidatorParams): unknown;
  create<
    I extends {
      pubKeyTypes?: string[];
    } & {
      pubKeyTypes?: string[] &
        string[] & {
          [K in Exclude<keyof I["pubKeyTypes"], keyof string[]>]: never;
        };
    } & { [K_1 in Exclude<keyof I, "pubKeyTypes">]: never }
  >(
    base?: I
  ): ValidatorParams;
  fromPartial<
    I_1 extends {
      pubKeyTypes?: string[];
    } & {
      pubKeyTypes?: string[] &
        string[] & {
          [K_2 in Exclude<keyof I_1["pubKeyTypes"], keyof string[]>]: never;
        };
    } & { [K_3 in Exclude<keyof I_1, "pubKeyTypes">]: never }
  >(
    object: I_1
  ): ValidatorParams;
};
export declare const VersionParams: {
  encode(message: VersionParams, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): VersionParams;
  fromJSON(object: any): VersionParams;
  toJSON(message: VersionParams): unknown;
  create<
    I extends {
      appVersion?: string;
    } & {
      appVersion?: string;
    } & { [K in Exclude<keyof I, "appVersion">]: never }
  >(
    base?: I
  ): VersionParams;
  fromPartial<
    I_1 extends {
      appVersion?: string;
    } & {
      appVersion?: string;
    } & { [K_1 in Exclude<keyof I_1, "appVersion">]: never }
  >(
    object: I_1
  ): VersionParams;
};
export declare const HashedParams: {
  encode(message: HashedParams, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): HashedParams;
  fromJSON(object: any): HashedParams;
  toJSON(message: HashedParams): unknown;
  create<
    I extends {
      blockMaxBytes?: string;
      blockMaxGas?: string;
    } & {
      blockMaxBytes?: string;
      blockMaxGas?: string;
    } & { [K in Exclude<keyof I, keyof HashedParams>]: never }
  >(
    base?: I
  ): HashedParams;
  fromPartial<
    I_1 extends {
      blockMaxBytes?: string;
      blockMaxGas?: string;
    } & {
      blockMaxBytes?: string;
      blockMaxGas?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof HashedParams>]: never }
  >(
    object: I_1
  ): HashedParams;
};
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

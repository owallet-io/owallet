import _m0 from "protobufjs/minimal";
import { PublicKey } from "../crypto/keys";
export declare const protobufPackage = "tendermint.types";
export interface ValidatorSet {
  validators: Validator[];
  proposer: Validator | undefined;
  totalVotingPower: string;
}
export interface Validator {
  address: Uint8Array;
  pubKey: PublicKey | undefined;
  votingPower: string;
  proposerPriority: string;
}
export interface SimpleValidator {
  pubKey: PublicKey | undefined;
  votingPower: string;
}
export declare const ValidatorSet: {
  encode(message: ValidatorSet, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): ValidatorSet;
  fromJSON(object: any): ValidatorSet;
  toJSON(message: ValidatorSet): unknown;
  create<
    I extends {
      validators?: {
        address?: Uint8Array;
        pubKey?: {
          ed25519?: Uint8Array;
          secp256k1?: Uint8Array;
        };
        votingPower?: string;
        proposerPriority?: string;
      }[];
      proposer?: {
        address?: Uint8Array;
        pubKey?: {
          ed25519?: Uint8Array;
          secp256k1?: Uint8Array;
        };
        votingPower?: string;
        proposerPriority?: string;
      };
      totalVotingPower?: string;
    } & {
      validators?: {
        address?: Uint8Array;
        pubKey?: {
          ed25519?: Uint8Array;
          secp256k1?: Uint8Array;
        };
        votingPower?: string;
        proposerPriority?: string;
      }[] &
        ({
          address?: Uint8Array;
          pubKey?: {
            ed25519?: Uint8Array;
            secp256k1?: Uint8Array;
          };
          votingPower?: string;
          proposerPriority?: string;
        } & {
          address?: Uint8Array;
          pubKey?: {
            ed25519?: Uint8Array;
            secp256k1?: Uint8Array;
          } & {
            ed25519?: Uint8Array;
            secp256k1?: Uint8Array;
          } & {
            [K in Exclude<
              keyof I["validators"][number]["pubKey"],
              keyof PublicKey
            >]: never;
          };
          votingPower?: string;
          proposerPriority?: string;
        } & {
          [K_1 in Exclude<
            keyof I["validators"][number],
            keyof Validator
          >]: never;
        })[] & {
          [K_2 in Exclude<
            keyof I["validators"],
            keyof {
              address?: Uint8Array;
              pubKey?: {
                ed25519?: Uint8Array;
                secp256k1?: Uint8Array;
              };
              votingPower?: string;
              proposerPriority?: string;
            }[]
          >]: never;
        };
      proposer?: {
        address?: Uint8Array;
        pubKey?: {
          ed25519?: Uint8Array;
          secp256k1?: Uint8Array;
        };
        votingPower?: string;
        proposerPriority?: string;
      } & {
        address?: Uint8Array;
        pubKey?: {
          ed25519?: Uint8Array;
          secp256k1?: Uint8Array;
        } & {
          ed25519?: Uint8Array;
          secp256k1?: Uint8Array;
        } & {
          [K_3 in Exclude<
            keyof I["proposer"]["pubKey"],
            keyof PublicKey
          >]: never;
        };
        votingPower?: string;
        proposerPriority?: string;
      } & { [K_4 in Exclude<keyof I["proposer"], keyof Validator>]: never };
      totalVotingPower?: string;
    } & { [K_5 in Exclude<keyof I, keyof ValidatorSet>]: never }
  >(
    base?: I
  ): ValidatorSet;
  fromPartial<
    I_1 extends {
      validators?: {
        address?: Uint8Array;
        pubKey?: {
          ed25519?: Uint8Array;
          secp256k1?: Uint8Array;
        };
        votingPower?: string;
        proposerPriority?: string;
      }[];
      proposer?: {
        address?: Uint8Array;
        pubKey?: {
          ed25519?: Uint8Array;
          secp256k1?: Uint8Array;
        };
        votingPower?: string;
        proposerPriority?: string;
      };
      totalVotingPower?: string;
    } & {
      validators?: {
        address?: Uint8Array;
        pubKey?: {
          ed25519?: Uint8Array;
          secp256k1?: Uint8Array;
        };
        votingPower?: string;
        proposerPriority?: string;
      }[] &
        ({
          address?: Uint8Array;
          pubKey?: {
            ed25519?: Uint8Array;
            secp256k1?: Uint8Array;
          };
          votingPower?: string;
          proposerPriority?: string;
        } & {
          address?: Uint8Array;
          pubKey?: {
            ed25519?: Uint8Array;
            secp256k1?: Uint8Array;
          } & {
            ed25519?: Uint8Array;
            secp256k1?: Uint8Array;
          } & {
            [K_6 in Exclude<
              keyof I_1["validators"][number]["pubKey"],
              keyof PublicKey
            >]: never;
          };
          votingPower?: string;
          proposerPriority?: string;
        } & {
          [K_7 in Exclude<
            keyof I_1["validators"][number],
            keyof Validator
          >]: never;
        })[] & {
          [K_8 in Exclude<
            keyof I_1["validators"],
            keyof {
              address?: Uint8Array;
              pubKey?: {
                ed25519?: Uint8Array;
                secp256k1?: Uint8Array;
              };
              votingPower?: string;
              proposerPriority?: string;
            }[]
          >]: never;
        };
      proposer?: {
        address?: Uint8Array;
        pubKey?: {
          ed25519?: Uint8Array;
          secp256k1?: Uint8Array;
        };
        votingPower?: string;
        proposerPriority?: string;
      } & {
        address?: Uint8Array;
        pubKey?: {
          ed25519?: Uint8Array;
          secp256k1?: Uint8Array;
        } & {
          ed25519?: Uint8Array;
          secp256k1?: Uint8Array;
        } & {
          [K_9 in Exclude<
            keyof I_1["proposer"]["pubKey"],
            keyof PublicKey
          >]: never;
        };
        votingPower?: string;
        proposerPriority?: string;
      } & { [K_10 in Exclude<keyof I_1["proposer"], keyof Validator>]: never };
      totalVotingPower?: string;
    } & { [K_11 in Exclude<keyof I_1, keyof ValidatorSet>]: never }
  >(
    object: I_1
  ): ValidatorSet;
};
export declare const Validator: {
  encode(message: Validator, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): Validator;
  fromJSON(object: any): Validator;
  toJSON(message: Validator): unknown;
  create<
    I extends {
      address?: Uint8Array;
      pubKey?: {
        ed25519?: Uint8Array;
        secp256k1?: Uint8Array;
      };
      votingPower?: string;
      proposerPriority?: string;
    } & {
      address?: Uint8Array;
      pubKey?: {
        ed25519?: Uint8Array;
        secp256k1?: Uint8Array;
      } & {
        ed25519?: Uint8Array;
        secp256k1?: Uint8Array;
      } & { [K in Exclude<keyof I["pubKey"], keyof PublicKey>]: never };
      votingPower?: string;
      proposerPriority?: string;
    } & { [K_1 in Exclude<keyof I, keyof Validator>]: never }
  >(
    base?: I
  ): Validator;
  fromPartial<
    I_1 extends {
      address?: Uint8Array;
      pubKey?: {
        ed25519?: Uint8Array;
        secp256k1?: Uint8Array;
      };
      votingPower?: string;
      proposerPriority?: string;
    } & {
      address?: Uint8Array;
      pubKey?: {
        ed25519?: Uint8Array;
        secp256k1?: Uint8Array;
      } & {
        ed25519?: Uint8Array;
        secp256k1?: Uint8Array;
      } & { [K_2 in Exclude<keyof I_1["pubKey"], keyof PublicKey>]: never };
      votingPower?: string;
      proposerPriority?: string;
    } & { [K_3 in Exclude<keyof I_1, keyof Validator>]: never }
  >(
    object: I_1
  ): Validator;
};
export declare const SimpleValidator: {
  encode(message: SimpleValidator, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): SimpleValidator;
  fromJSON(object: any): SimpleValidator;
  toJSON(message: SimpleValidator): unknown;
  create<
    I extends {
      pubKey?: {
        ed25519?: Uint8Array;
        secp256k1?: Uint8Array;
      };
      votingPower?: string;
    } & {
      pubKey?: {
        ed25519?: Uint8Array;
        secp256k1?: Uint8Array;
      } & {
        ed25519?: Uint8Array;
        secp256k1?: Uint8Array;
      } & { [K in Exclude<keyof I["pubKey"], keyof PublicKey>]: never };
      votingPower?: string;
    } & { [K_1 in Exclude<keyof I, keyof SimpleValidator>]: never }
  >(
    base?: I
  ): SimpleValidator;
  fromPartial<
    I_1 extends {
      pubKey?: {
        ed25519?: Uint8Array;
        secp256k1?: Uint8Array;
      };
      votingPower?: string;
    } & {
      pubKey?: {
        ed25519?: Uint8Array;
        secp256k1?: Uint8Array;
      } & {
        ed25519?: Uint8Array;
        secp256k1?: Uint8Array;
      } & { [K_2 in Exclude<keyof I_1["pubKey"], keyof PublicKey>]: never };
      votingPower?: string;
    } & { [K_3 in Exclude<keyof I_1, keyof SimpleValidator>]: never }
  >(
    object: I_1
  ): SimpleValidator;
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

import _m0 from "protobufjs/minimal";
import { Coin } from "../../base/v1beta1/coin";
import { Input, Output } from "./bank";
export declare const protobufPackage = "cosmos.bank.v1beta1";
/** MsgSend represents a message to send coins from one account to another. */
export interface MsgSend {
  fromAddress: string;
  toAddress: string;
  amount: Coin[];
}
/** MsgSendResponse defines the Msg/Send response type. */
export interface MsgSendResponse {}
/** MsgMultiSend represents an arbitrary multi-in, multi-out send message. */
export interface MsgMultiSend {
  inputs: Input[];
  outputs: Output[];
}
/** MsgMultiSendResponse defines the Msg/MultiSend response type. */
export interface MsgMultiSendResponse {}
export declare const MsgSend: {
  encode(message: MsgSend, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSend;
  fromJSON(object: any): MsgSend;
  toJSON(message: MsgSend): unknown;
  create<
    I extends {
      fromAddress?: string;
      toAddress?: string;
      amount?: {
        denom?: string;
        amount?: string;
      }[];
    } & {
      fromAddress?: string;
      toAddress?: string;
      amount?: {
        denom?: string;
        amount?: string;
      }[] &
        ({
          denom?: string;
          amount?: string;
        } & {
          denom?: string;
          amount?: string;
        } & {
          [K in Exclude<keyof I["amount"][number], keyof Coin>]: never;
        })[] & {
          [K_1 in Exclude<
            keyof I["amount"],
            keyof {
              denom?: string;
              amount?: string;
            }[]
          >]: never;
        };
    } & { [K_2 in Exclude<keyof I, keyof MsgSend>]: never }
  >(
    base?: I
  ): MsgSend;
  fromPartial<
    I_1 extends {
      fromAddress?: string;
      toAddress?: string;
      amount?: {
        denom?: string;
        amount?: string;
      }[];
    } & {
      fromAddress?: string;
      toAddress?: string;
      amount?: {
        denom?: string;
        amount?: string;
      }[] &
        ({
          denom?: string;
          amount?: string;
        } & {
          denom?: string;
          amount?: string;
        } & {
          [K_3 in Exclude<keyof I_1["amount"][number], keyof Coin>]: never;
        })[] & {
          [K_4 in Exclude<
            keyof I_1["amount"],
            keyof {
              denom?: string;
              amount?: string;
            }[]
          >]: never;
        };
    } & { [K_5 in Exclude<keyof I_1, keyof MsgSend>]: never }
  >(
    object: I_1
  ): MsgSend;
};
export declare const MsgSendResponse: {
  encode(_: MsgSendResponse, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSendResponse;
  fromJSON(_: any): MsgSendResponse;
  toJSON(_: MsgSendResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgSendResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgSendResponse;
};
export declare const MsgMultiSend: {
  encode(message: MsgMultiSend, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgMultiSend;
  fromJSON(object: any): MsgMultiSend;
  toJSON(message: MsgMultiSend): unknown;
  create<
    I extends {
      inputs?: {
        address?: string;
        coins?: {
          denom?: string;
          amount?: string;
        }[];
      }[];
      outputs?: {
        address?: string;
        coins?: {
          denom?: string;
          amount?: string;
        }[];
      }[];
    } & {
      inputs?: {
        address?: string;
        coins?: {
          denom?: string;
          amount?: string;
        }[];
      }[] &
        ({
          address?: string;
          coins?: {
            denom?: string;
            amount?: string;
          }[];
        } & {
          address?: string;
          coins?: {
            denom?: string;
            amount?: string;
          }[] &
            ({
              denom?: string;
              amount?: string;
            } & {
              denom?: string;
              amount?: string;
            } & {
              [K in Exclude<
                keyof I["inputs"][number]["coins"][number],
                keyof Coin
              >]: never;
            })[] & {
              [K_1 in Exclude<
                keyof I["inputs"][number]["coins"],
                keyof {
                  denom?: string;
                  amount?: string;
                }[]
              >]: never;
            };
        } & {
          [K_2 in Exclude<keyof I["inputs"][number], keyof Input>]: never;
        })[] & {
          [K_3 in Exclude<
            keyof I["inputs"],
            keyof {
              address?: string;
              coins?: {
                denom?: string;
                amount?: string;
              }[];
            }[]
          >]: never;
        };
      outputs?: {
        address?: string;
        coins?: {
          denom?: string;
          amount?: string;
        }[];
      }[] &
        ({
          address?: string;
          coins?: {
            denom?: string;
            amount?: string;
          }[];
        } & {
          address?: string;
          coins?: {
            denom?: string;
            amount?: string;
          }[] &
            ({
              denom?: string;
              amount?: string;
            } & {
              denom?: string;
              amount?: string;
            } & {
              [K_4 in Exclude<
                keyof I["outputs"][number]["coins"][number],
                keyof Coin
              >]: never;
            })[] & {
              [K_5 in Exclude<
                keyof I["outputs"][number]["coins"],
                keyof {
                  denom?: string;
                  amount?: string;
                }[]
              >]: never;
            };
        } & {
          [K_6 in Exclude<keyof I["outputs"][number], keyof Output>]: never;
        })[] & {
          [K_7 in Exclude<
            keyof I["outputs"],
            keyof {
              address?: string;
              coins?: {
                denom?: string;
                amount?: string;
              }[];
            }[]
          >]: never;
        };
    } & { [K_8 in Exclude<keyof I, keyof MsgMultiSend>]: never }
  >(
    base?: I
  ): MsgMultiSend;
  fromPartial<
    I_1 extends {
      inputs?: {
        address?: string;
        coins?: {
          denom?: string;
          amount?: string;
        }[];
      }[];
      outputs?: {
        address?: string;
        coins?: {
          denom?: string;
          amount?: string;
        }[];
      }[];
    } & {
      inputs?: {
        address?: string;
        coins?: {
          denom?: string;
          amount?: string;
        }[];
      }[] &
        ({
          address?: string;
          coins?: {
            denom?: string;
            amount?: string;
          }[];
        } & {
          address?: string;
          coins?: {
            denom?: string;
            amount?: string;
          }[] &
            ({
              denom?: string;
              amount?: string;
            } & {
              denom?: string;
              amount?: string;
            } & {
              [K_9 in Exclude<
                keyof I_1["inputs"][number]["coins"][number],
                keyof Coin
              >]: never;
            })[] & {
              [K_10 in Exclude<
                keyof I_1["inputs"][number]["coins"],
                keyof {
                  denom?: string;
                  amount?: string;
                }[]
              >]: never;
            };
        } & {
          [K_11 in Exclude<keyof I_1["inputs"][number], keyof Input>]: never;
        })[] & {
          [K_12 in Exclude<
            keyof I_1["inputs"],
            keyof {
              address?: string;
              coins?: {
                denom?: string;
                amount?: string;
              }[];
            }[]
          >]: never;
        };
      outputs?: {
        address?: string;
        coins?: {
          denom?: string;
          amount?: string;
        }[];
      }[] &
        ({
          address?: string;
          coins?: {
            denom?: string;
            amount?: string;
          }[];
        } & {
          address?: string;
          coins?: {
            denom?: string;
            amount?: string;
          }[] &
            ({
              denom?: string;
              amount?: string;
            } & {
              denom?: string;
              amount?: string;
            } & {
              [K_13 in Exclude<
                keyof I_1["outputs"][number]["coins"][number],
                keyof Coin
              >]: never;
            })[] & {
              [K_14 in Exclude<
                keyof I_1["outputs"][number]["coins"],
                keyof {
                  denom?: string;
                  amount?: string;
                }[]
              >]: never;
            };
        } & {
          [K_15 in Exclude<keyof I_1["outputs"][number], keyof Output>]: never;
        })[] & {
          [K_16 in Exclude<
            keyof I_1["outputs"],
            keyof {
              address?: string;
              coins?: {
                denom?: string;
                amount?: string;
              }[];
            }[]
          >]: never;
        };
    } & { [K_17 in Exclude<keyof I_1, keyof MsgMultiSend>]: never }
  >(
    object: I_1
  ): MsgMultiSend;
};
export declare const MsgMultiSendResponse: {
  encode(_: MsgMultiSendResponse, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgMultiSendResponse;
  fromJSON(_: any): MsgMultiSendResponse;
  toJSON(_: MsgMultiSendResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgMultiSendResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgMultiSendResponse;
};
/** Msg defines the bank Msg service. */
export interface Msg {
  /** Send defines a method for sending coins from one account to another account. */
  Send(request: MsgSend): Promise<MsgSendResponse>;
  /** MultiSend defines a method for sending coins from some accounts to other accounts. */
  MultiSend(request: MsgMultiSend): Promise<MsgMultiSendResponse>;
}
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

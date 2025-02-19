import _m0 from "protobufjs/minimal";
import { Any } from "../../../../google/protobuf/any";
import { Event } from "../../../../tendermint/abci/types";
export declare const protobufPackage = "cosmos.base.abci.v1beta1";
/**
 * TxResponse defines a structure containing relevant tx data and metadata. The
 * tags are stringified and the log is JSON decoded.
 */
export interface TxResponse {
  /** The block height */
  height: string;
  /** The transaction hash. */
  txhash: string;
  /** Namespace for the Code */
  codespace: string;
  /** Response code. */
  code: number;
  /** Result bytes, if any. */
  data: string;
  /**
   * The output of the application's logger (raw string). May be
   * non-deterministic.
   */
  rawLog: string;
  /** The output of the application's logger (typed). May be non-deterministic. */
  logs: ABCIMessageLog[];
  /** Additional information. May be non-deterministic. */
  info: string;
  /** Amount of gas requested for transaction. */
  gasWanted: string;
  /** Amount of gas consumed by transaction. */
  gasUsed: string;
  /** The request transaction bytes. */
  tx: Any | undefined;
  /**
   * Time of the previous block. For heights > 1, it's the weighted median of
   * the timestamps of the valid votes in the block.LastCommit. For height == 1,
   * it's genesis time.
   */
  timestamp: string;
}
/** ABCIMessageLog defines a structure containing an indexed tx ABCI message log. */
export interface ABCIMessageLog {
  msgIndex: number;
  log: string;
  /**
   * Events contains a slice of Event objects that were emitted during some
   * execution.
   */
  events: StringEvent[];
}
/**
 * StringEvent defines en Event object wrapper where all the attributes
 * contain key/value pairs that are strings instead of raw bytes.
 */
export interface StringEvent {
  type: string;
  attributes: Attribute[];
}
/**
 * Attribute defines an attribute wrapper where the key and value are
 * strings instead of raw bytes.
 */
export interface Attribute {
  key: string;
  value: string;
}
/** GasInfo defines tx execution gas context. */
export interface GasInfo {
  /** GasWanted is the maximum units of work we allow this tx to perform. */
  gasWanted: string;
  /** GasUsed is the amount of gas actually consumed. */
  gasUsed: string;
}
/** Result is the union of ResponseFormat and ResponseCheckTx. */
export interface Result {
  /**
   * Data is any data returned from message or handler execution. It MUST be
   * length prefixed in order to separate data from multiple message executions.
   */
  data: Uint8Array;
  /** Log contains the log information from message or handler execution. */
  log: string;
  /**
   * Events contains a slice of Event objects that were emitted during message
   * or handler execution.
   */
  events: Event[];
}
/**
 * SimulationResponse defines the response generated when a transaction is
 * successfully simulated.
 */
export interface SimulationResponse {
  gasInfo: GasInfo | undefined;
  result: Result | undefined;
}
/**
 * MsgData defines the data returned in a Result object during message
 * execution.
 */
export interface MsgData {
  msgType: string;
  data: Uint8Array;
}
/**
 * TxMsgData defines a list of MsgData. A transaction will have a MsgData object
 * for each message.
 */
export interface TxMsgData {
  data: MsgData[];
}
/** SearchTxsResult defines a structure for querying txs pageable */
export interface SearchTxsResult {
  /** Count of all txs */
  totalCount: string;
  /** Count of txs in current page */
  count: string;
  /** Index of current page, start from 1 */
  pageNumber: string;
  /** Count of total pages */
  pageTotal: string;
  /** Max count txs per page */
  limit: string;
  /** List of txs in current page */
  txs: TxResponse[];
}
export declare const TxResponse: {
  encode(message: TxResponse, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): TxResponse;
  fromJSON(object: any): TxResponse;
  toJSON(message: TxResponse): unknown;
  create<
    I extends {
      height?: string;
      txhash?: string;
      codespace?: string;
      code?: number;
      data?: string;
      rawLog?: string;
      logs?: {
        msgIndex?: number;
        log?: string;
        events?: {
          type?: string;
          attributes?: {
            key?: string;
            value?: string;
          }[];
        }[];
      }[];
      info?: string;
      gasWanted?: string;
      gasUsed?: string;
      tx?: {
        typeUrl?: string;
        value?: Uint8Array;
      };
      timestamp?: string;
    } & {
      height?: string;
      txhash?: string;
      codespace?: string;
      code?: number;
      data?: string;
      rawLog?: string;
      logs?: {
        msgIndex?: number;
        log?: string;
        events?: {
          type?: string;
          attributes?: {
            key?: string;
            value?: string;
          }[];
        }[];
      }[] &
        ({
          msgIndex?: number;
          log?: string;
          events?: {
            type?: string;
            attributes?: {
              key?: string;
              value?: string;
            }[];
          }[];
        } & {
          msgIndex?: number;
          log?: string;
          events?: {
            type?: string;
            attributes?: {
              key?: string;
              value?: string;
            }[];
          }[] &
            ({
              type?: string;
              attributes?: {
                key?: string;
                value?: string;
              }[];
            } & {
              type?: string;
              attributes?: {
                key?: string;
                value?: string;
              }[] &
                ({
                  key?: string;
                  value?: string;
                } & {
                  key?: string;
                  value?: string;
                } & {
                  [K in Exclude<
                    keyof I["logs"][number]["events"][number]["attributes"][number],
                    keyof Attribute
                  >]: never;
                })[] & {
                  [K_1 in Exclude<
                    keyof I["logs"][number]["events"][number]["attributes"],
                    keyof {
                      key?: string;
                      value?: string;
                    }[]
                  >]: never;
                };
            } & {
              [K_2 in Exclude<
                keyof I["logs"][number]["events"][number],
                keyof StringEvent
              >]: never;
            })[] & {
              [K_3 in Exclude<
                keyof I["logs"][number]["events"],
                keyof {
                  type?: string;
                  attributes?: {
                    key?: string;
                    value?: string;
                  }[];
                }[]
              >]: never;
            };
        } & {
          [K_4 in Exclude<
            keyof I["logs"][number],
            keyof ABCIMessageLog
          >]: never;
        })[] & {
          [K_5 in Exclude<
            keyof I["logs"],
            keyof {
              msgIndex?: number;
              log?: string;
              events?: {
                type?: string;
                attributes?: {
                  key?: string;
                  value?: string;
                }[];
              }[];
            }[]
          >]: never;
        };
      info?: string;
      gasWanted?: string;
      gasUsed?: string;
      tx?: {
        typeUrl?: string;
        value?: Uint8Array;
      } & {
        typeUrl?: string;
        value?: Uint8Array;
      } & { [K_6 in Exclude<keyof I["tx"], keyof Any>]: never };
      timestamp?: string;
    } & { [K_7 in Exclude<keyof I, keyof TxResponse>]: never }
  >(
    base?: I
  ): TxResponse;
  fromPartial<
    I_1 extends {
      height?: string;
      txhash?: string;
      codespace?: string;
      code?: number;
      data?: string;
      rawLog?: string;
      logs?: {
        msgIndex?: number;
        log?: string;
        events?: {
          type?: string;
          attributes?: {
            key?: string;
            value?: string;
          }[];
        }[];
      }[];
      info?: string;
      gasWanted?: string;
      gasUsed?: string;
      tx?: {
        typeUrl?: string;
        value?: Uint8Array;
      };
      timestamp?: string;
    } & {
      height?: string;
      txhash?: string;
      codespace?: string;
      code?: number;
      data?: string;
      rawLog?: string;
      logs?: {
        msgIndex?: number;
        log?: string;
        events?: {
          type?: string;
          attributes?: {
            key?: string;
            value?: string;
          }[];
        }[];
      }[] &
        ({
          msgIndex?: number;
          log?: string;
          events?: {
            type?: string;
            attributes?: {
              key?: string;
              value?: string;
            }[];
          }[];
        } & {
          msgIndex?: number;
          log?: string;
          events?: {
            type?: string;
            attributes?: {
              key?: string;
              value?: string;
            }[];
          }[] &
            ({
              type?: string;
              attributes?: {
                key?: string;
                value?: string;
              }[];
            } & {
              type?: string;
              attributes?: {
                key?: string;
                value?: string;
              }[] &
                ({
                  key?: string;
                  value?: string;
                } & {
                  key?: string;
                  value?: string;
                } & {
                  [K_8 in Exclude<
                    keyof I_1["logs"][number]["events"][number]["attributes"][number],
                    keyof Attribute
                  >]: never;
                })[] & {
                  [K_9 in Exclude<
                    keyof I_1["logs"][number]["events"][number]["attributes"],
                    keyof {
                      key?: string;
                      value?: string;
                    }[]
                  >]: never;
                };
            } & {
              [K_10 in Exclude<
                keyof I_1["logs"][number]["events"][number],
                keyof StringEvent
              >]: never;
            })[] & {
              [K_11 in Exclude<
                keyof I_1["logs"][number]["events"],
                keyof {
                  type?: string;
                  attributes?: {
                    key?: string;
                    value?: string;
                  }[];
                }[]
              >]: never;
            };
        } & {
          [K_12 in Exclude<
            keyof I_1["logs"][number],
            keyof ABCIMessageLog
          >]: never;
        })[] & {
          [K_13 in Exclude<
            keyof I_1["logs"],
            keyof {
              msgIndex?: number;
              log?: string;
              events?: {
                type?: string;
                attributes?: {
                  key?: string;
                  value?: string;
                }[];
              }[];
            }[]
          >]: never;
        };
      info?: string;
      gasWanted?: string;
      gasUsed?: string;
      tx?: {
        typeUrl?: string;
        value?: Uint8Array;
      } & {
        typeUrl?: string;
        value?: Uint8Array;
      } & { [K_14 in Exclude<keyof I_1["tx"], keyof Any>]: never };
      timestamp?: string;
    } & { [K_15 in Exclude<keyof I_1, keyof TxResponse>]: never }
  >(
    object: I_1
  ): TxResponse;
};
export declare const ABCIMessageLog: {
  encode(message: ABCIMessageLog, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): ABCIMessageLog;
  fromJSON(object: any): ABCIMessageLog;
  toJSON(message: ABCIMessageLog): unknown;
  create<
    I extends {
      msgIndex?: number;
      log?: string;
      events?: {
        type?: string;
        attributes?: {
          key?: string;
          value?: string;
        }[];
      }[];
    } & {
      msgIndex?: number;
      log?: string;
      events?: {
        type?: string;
        attributes?: {
          key?: string;
          value?: string;
        }[];
      }[] &
        ({
          type?: string;
          attributes?: {
            key?: string;
            value?: string;
          }[];
        } & {
          type?: string;
          attributes?: {
            key?: string;
            value?: string;
          }[] &
            ({
              key?: string;
              value?: string;
            } & {
              key?: string;
              value?: string;
            } & {
              [K in Exclude<
                keyof I["events"][number]["attributes"][number],
                keyof Attribute
              >]: never;
            })[] & {
              [K_1 in Exclude<
                keyof I["events"][number]["attributes"],
                keyof {
                  key?: string;
                  value?: string;
                }[]
              >]: never;
            };
        } & {
          [K_2 in Exclude<keyof I["events"][number], keyof StringEvent>]: never;
        })[] & {
          [K_3 in Exclude<
            keyof I["events"],
            keyof {
              type?: string;
              attributes?: {
                key?: string;
                value?: string;
              }[];
            }[]
          >]: never;
        };
    } & { [K_4 in Exclude<keyof I, keyof ABCIMessageLog>]: never }
  >(
    base?: I
  ): ABCIMessageLog;
  fromPartial<
    I_1 extends {
      msgIndex?: number;
      log?: string;
      events?: {
        type?: string;
        attributes?: {
          key?: string;
          value?: string;
        }[];
      }[];
    } & {
      msgIndex?: number;
      log?: string;
      events?: {
        type?: string;
        attributes?: {
          key?: string;
          value?: string;
        }[];
      }[] &
        ({
          type?: string;
          attributes?: {
            key?: string;
            value?: string;
          }[];
        } & {
          type?: string;
          attributes?: {
            key?: string;
            value?: string;
          }[] &
            ({
              key?: string;
              value?: string;
            } & {
              key?: string;
              value?: string;
            } & {
              [K_5 in Exclude<
                keyof I_1["events"][number]["attributes"][number],
                keyof Attribute
              >]: never;
            })[] & {
              [K_6 in Exclude<
                keyof I_1["events"][number]["attributes"],
                keyof {
                  key?: string;
                  value?: string;
                }[]
              >]: never;
            };
        } & {
          [K_7 in Exclude<
            keyof I_1["events"][number],
            keyof StringEvent
          >]: never;
        })[] & {
          [K_8 in Exclude<
            keyof I_1["events"],
            keyof {
              type?: string;
              attributes?: {
                key?: string;
                value?: string;
              }[];
            }[]
          >]: never;
        };
    } & { [K_9 in Exclude<keyof I_1, keyof ABCIMessageLog>]: never }
  >(
    object: I_1
  ): ABCIMessageLog;
};
export declare const StringEvent: {
  encode(message: StringEvent, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): StringEvent;
  fromJSON(object: any): StringEvent;
  toJSON(message: StringEvent): unknown;
  create<
    I extends {
      type?: string;
      attributes?: {
        key?: string;
        value?: string;
      }[];
    } & {
      type?: string;
      attributes?: {
        key?: string;
        value?: string;
      }[] &
        ({
          key?: string;
          value?: string;
        } & {
          key?: string;
          value?: string;
        } & {
          [K in Exclude<keyof I["attributes"][number], keyof Attribute>]: never;
        })[] & {
          [K_1 in Exclude<
            keyof I["attributes"],
            keyof {
              key?: string;
              value?: string;
            }[]
          >]: never;
        };
    } & { [K_2 in Exclude<keyof I, keyof StringEvent>]: never }
  >(
    base?: I
  ): StringEvent;
  fromPartial<
    I_1 extends {
      type?: string;
      attributes?: {
        key?: string;
        value?: string;
      }[];
    } & {
      type?: string;
      attributes?: {
        key?: string;
        value?: string;
      }[] &
        ({
          key?: string;
          value?: string;
        } & {
          key?: string;
          value?: string;
        } & {
          [K_3 in Exclude<
            keyof I_1["attributes"][number],
            keyof Attribute
          >]: never;
        })[] & {
          [K_4 in Exclude<
            keyof I_1["attributes"],
            keyof {
              key?: string;
              value?: string;
            }[]
          >]: never;
        };
    } & { [K_5 in Exclude<keyof I_1, keyof StringEvent>]: never }
  >(
    object: I_1
  ): StringEvent;
};
export declare const Attribute: {
  encode(message: Attribute, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): Attribute;
  fromJSON(object: any): Attribute;
  toJSON(message: Attribute): unknown;
  create<
    I extends {
      key?: string;
      value?: string;
    } & {
      key?: string;
      value?: string;
    } & { [K in Exclude<keyof I, keyof Attribute>]: never }
  >(
    base?: I
  ): Attribute;
  fromPartial<
    I_1 extends {
      key?: string;
      value?: string;
    } & {
      key?: string;
      value?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof Attribute>]: never }
  >(
    object: I_1
  ): Attribute;
};
export declare const GasInfo: {
  encode(message: GasInfo, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GasInfo;
  fromJSON(object: any): GasInfo;
  toJSON(message: GasInfo): unknown;
  create<
    I extends {
      gasWanted?: string;
      gasUsed?: string;
    } & {
      gasWanted?: string;
      gasUsed?: string;
    } & { [K in Exclude<keyof I, keyof GasInfo>]: never }
  >(
    base?: I
  ): GasInfo;
  fromPartial<
    I_1 extends {
      gasWanted?: string;
      gasUsed?: string;
    } & {
      gasWanted?: string;
      gasUsed?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof GasInfo>]: never }
  >(
    object: I_1
  ): GasInfo;
};
export declare const Result: {
  encode(message: Result, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): Result;
  fromJSON(object: any): Result;
  toJSON(message: Result): unknown;
  create<
    I extends {
      data?: Uint8Array;
      log?: string;
      events?: {
        type?: string;
        attributes?: {
          key?: Uint8Array;
          value?: Uint8Array;
          index?: boolean;
        }[];
      }[];
    } & {
      data?: Uint8Array;
      log?: string;
      events?: {
        type?: string;
        attributes?: {
          key?: Uint8Array;
          value?: Uint8Array;
          index?: boolean;
        }[];
      }[] &
        ({
          type?: string;
          attributes?: {
            key?: Uint8Array;
            value?: Uint8Array;
            index?: boolean;
          }[];
        } & {
          type?: string;
          attributes?: {
            key?: Uint8Array;
            value?: Uint8Array;
            index?: boolean;
          }[] &
            ({
              key?: Uint8Array;
              value?: Uint8Array;
              index?: boolean;
            } & {
              key?: Uint8Array;
              value?: Uint8Array;
              index?: boolean;
            } & {
              [K in Exclude<
                keyof I["events"][number]["attributes"][number],
                keyof import("../../../../tendermint/abci/types").EventAttribute
              >]: never;
            })[] & {
              [K_1 in Exclude<
                keyof I["events"][number]["attributes"],
                keyof {
                  key?: Uint8Array;
                  value?: Uint8Array;
                  index?: boolean;
                }[]
              >]: never;
            };
        } & {
          [K_2 in Exclude<keyof I["events"][number], keyof Event>]: never;
        })[] & {
          [K_3 in Exclude<
            keyof I["events"],
            keyof {
              type?: string;
              attributes?: {
                key?: Uint8Array;
                value?: Uint8Array;
                index?: boolean;
              }[];
            }[]
          >]: never;
        };
    } & { [K_4 in Exclude<keyof I, keyof Result>]: never }
  >(
    base?: I
  ): Result;
  fromPartial<
    I_1 extends {
      data?: Uint8Array;
      log?: string;
      events?: {
        type?: string;
        attributes?: {
          key?: Uint8Array;
          value?: Uint8Array;
          index?: boolean;
        }[];
      }[];
    } & {
      data?: Uint8Array;
      log?: string;
      events?: {
        type?: string;
        attributes?: {
          key?: Uint8Array;
          value?: Uint8Array;
          index?: boolean;
        }[];
      }[] &
        ({
          type?: string;
          attributes?: {
            key?: Uint8Array;
            value?: Uint8Array;
            index?: boolean;
          }[];
        } & {
          type?: string;
          attributes?: {
            key?: Uint8Array;
            value?: Uint8Array;
            index?: boolean;
          }[] &
            ({
              key?: Uint8Array;
              value?: Uint8Array;
              index?: boolean;
            } & {
              key?: Uint8Array;
              value?: Uint8Array;
              index?: boolean;
            } & {
              [K_5 in Exclude<
                keyof I_1["events"][number]["attributes"][number],
                keyof import("../../../../tendermint/abci/types").EventAttribute
              >]: never;
            })[] & {
              [K_6 in Exclude<
                keyof I_1["events"][number]["attributes"],
                keyof {
                  key?: Uint8Array;
                  value?: Uint8Array;
                  index?: boolean;
                }[]
              >]: never;
            };
        } & {
          [K_7 in Exclude<keyof I_1["events"][number], keyof Event>]: never;
        })[] & {
          [K_8 in Exclude<
            keyof I_1["events"],
            keyof {
              type?: string;
              attributes?: {
                key?: Uint8Array;
                value?: Uint8Array;
                index?: boolean;
              }[];
            }[]
          >]: never;
        };
    } & { [K_9 in Exclude<keyof I_1, keyof Result>]: never }
  >(
    object: I_1
  ): Result;
};
export declare const SimulationResponse: {
  encode(message: SimulationResponse, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): SimulationResponse;
  fromJSON(object: any): SimulationResponse;
  toJSON(message: SimulationResponse): unknown;
  create<
    I extends {
      gasInfo?: {
        gasWanted?: string;
        gasUsed?: string;
      };
      result?: {
        data?: Uint8Array;
        log?: string;
        events?: {
          type?: string;
          attributes?: {
            key?: Uint8Array;
            value?: Uint8Array;
            index?: boolean;
          }[];
        }[];
      };
    } & {
      gasInfo?: {
        gasWanted?: string;
        gasUsed?: string;
      } & {
        gasWanted?: string;
        gasUsed?: string;
      } & { [K in Exclude<keyof I["gasInfo"], keyof GasInfo>]: never };
      result?: {
        data?: Uint8Array;
        log?: string;
        events?: {
          type?: string;
          attributes?: {
            key?: Uint8Array;
            value?: Uint8Array;
            index?: boolean;
          }[];
        }[];
      } & {
        data?: Uint8Array;
        log?: string;
        events?: {
          type?: string;
          attributes?: {
            key?: Uint8Array;
            value?: Uint8Array;
            index?: boolean;
          }[];
        }[] &
          ({
            type?: string;
            attributes?: {
              key?: Uint8Array;
              value?: Uint8Array;
              index?: boolean;
            }[];
          } & {
            type?: string;
            attributes?: {
              key?: Uint8Array;
              value?: Uint8Array;
              index?: boolean;
            }[] &
              ({
                key?: Uint8Array;
                value?: Uint8Array;
                index?: boolean;
              } & {
                key?: Uint8Array;
                value?: Uint8Array;
                index?: boolean;
              } & {
                [K_1 in Exclude<
                  keyof I["result"]["events"][number]["attributes"][number],
                  keyof import("../../../../tendermint/abci/types").EventAttribute
                >]: never;
              })[] & {
                [K_2 in Exclude<
                  keyof I["result"]["events"][number]["attributes"],
                  keyof {
                    key?: Uint8Array;
                    value?: Uint8Array;
                    index?: boolean;
                  }[]
                >]: never;
              };
          } & {
            [K_3 in Exclude<
              keyof I["result"]["events"][number],
              keyof Event
            >]: never;
          })[] & {
            [K_4 in Exclude<
              keyof I["result"]["events"],
              keyof {
                type?: string;
                attributes?: {
                  key?: Uint8Array;
                  value?: Uint8Array;
                  index?: boolean;
                }[];
              }[]
            >]: never;
          };
      } & { [K_5 in Exclude<keyof I["result"], keyof Result>]: never };
    } & { [K_6 in Exclude<keyof I, keyof SimulationResponse>]: never }
  >(
    base?: I
  ): SimulationResponse;
  fromPartial<
    I_1 extends {
      gasInfo?: {
        gasWanted?: string;
        gasUsed?: string;
      };
      result?: {
        data?: Uint8Array;
        log?: string;
        events?: {
          type?: string;
          attributes?: {
            key?: Uint8Array;
            value?: Uint8Array;
            index?: boolean;
          }[];
        }[];
      };
    } & {
      gasInfo?: {
        gasWanted?: string;
        gasUsed?: string;
      } & {
        gasWanted?: string;
        gasUsed?: string;
      } & { [K_7 in Exclude<keyof I_1["gasInfo"], keyof GasInfo>]: never };
      result?: {
        data?: Uint8Array;
        log?: string;
        events?: {
          type?: string;
          attributes?: {
            key?: Uint8Array;
            value?: Uint8Array;
            index?: boolean;
          }[];
        }[];
      } & {
        data?: Uint8Array;
        log?: string;
        events?: {
          type?: string;
          attributes?: {
            key?: Uint8Array;
            value?: Uint8Array;
            index?: boolean;
          }[];
        }[] &
          ({
            type?: string;
            attributes?: {
              key?: Uint8Array;
              value?: Uint8Array;
              index?: boolean;
            }[];
          } & {
            type?: string;
            attributes?: {
              key?: Uint8Array;
              value?: Uint8Array;
              index?: boolean;
            }[] &
              ({
                key?: Uint8Array;
                value?: Uint8Array;
                index?: boolean;
              } & {
                key?: Uint8Array;
                value?: Uint8Array;
                index?: boolean;
              } & {
                [K_8 in Exclude<
                  keyof I_1["result"]["events"][number]["attributes"][number],
                  keyof import("../../../../tendermint/abci/types").EventAttribute
                >]: never;
              })[] & {
                [K_9 in Exclude<
                  keyof I_1["result"]["events"][number]["attributes"],
                  keyof {
                    key?: Uint8Array;
                    value?: Uint8Array;
                    index?: boolean;
                  }[]
                >]: never;
              };
          } & {
            [K_10 in Exclude<
              keyof I_1["result"]["events"][number],
              keyof Event
            >]: never;
          })[] & {
            [K_11 in Exclude<
              keyof I_1["result"]["events"],
              keyof {
                type?: string;
                attributes?: {
                  key?: Uint8Array;
                  value?: Uint8Array;
                  index?: boolean;
                }[];
              }[]
            >]: never;
          };
      } & { [K_12 in Exclude<keyof I_1["result"], keyof Result>]: never };
    } & { [K_13 in Exclude<keyof I_1, keyof SimulationResponse>]: never }
  >(
    object: I_1
  ): SimulationResponse;
};
export declare const MsgData: {
  encode(message: MsgData, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgData;
  fromJSON(object: any): MsgData;
  toJSON(message: MsgData): unknown;
  create<
    I extends {
      msgType?: string;
      data?: Uint8Array;
    } & {
      msgType?: string;
      data?: Uint8Array;
    } & { [K in Exclude<keyof I, keyof MsgData>]: never }
  >(
    base?: I
  ): MsgData;
  fromPartial<
    I_1 extends {
      msgType?: string;
      data?: Uint8Array;
    } & {
      msgType?: string;
      data?: Uint8Array;
    } & { [K_1 in Exclude<keyof I_1, keyof MsgData>]: never }
  >(
    object: I_1
  ): MsgData;
};
export declare const TxMsgData: {
  encode(message: TxMsgData, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): TxMsgData;
  fromJSON(object: any): TxMsgData;
  toJSON(message: TxMsgData): unknown;
  create<
    I extends {
      data?: {
        msgType?: string;
        data?: Uint8Array;
      }[];
    } & {
      data?: {
        msgType?: string;
        data?: Uint8Array;
      }[] &
        ({
          msgType?: string;
          data?: Uint8Array;
        } & {
          msgType?: string;
          data?: Uint8Array;
        } & {
          [K in Exclude<keyof I["data"][number], keyof MsgData>]: never;
        })[] & {
          [K_1 in Exclude<
            keyof I["data"],
            keyof {
              msgType?: string;
              data?: Uint8Array;
            }[]
          >]: never;
        };
    } & { [K_2 in Exclude<keyof I, "data">]: never }
  >(
    base?: I
  ): TxMsgData;
  fromPartial<
    I_1 extends {
      data?: {
        msgType?: string;
        data?: Uint8Array;
      }[];
    } & {
      data?: {
        msgType?: string;
        data?: Uint8Array;
      }[] &
        ({
          msgType?: string;
          data?: Uint8Array;
        } & {
          msgType?: string;
          data?: Uint8Array;
        } & {
          [K_3 in Exclude<keyof I_1["data"][number], keyof MsgData>]: never;
        })[] & {
          [K_4 in Exclude<
            keyof I_1["data"],
            keyof {
              msgType?: string;
              data?: Uint8Array;
            }[]
          >]: never;
        };
    } & { [K_5 in Exclude<keyof I_1, "data">]: never }
  >(
    object: I_1
  ): TxMsgData;
};
export declare const SearchTxsResult: {
  encode(message: SearchTxsResult, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): SearchTxsResult;
  fromJSON(object: any): SearchTxsResult;
  toJSON(message: SearchTxsResult): unknown;
  create<
    I extends {
      totalCount?: string;
      count?: string;
      pageNumber?: string;
      pageTotal?: string;
      limit?: string;
      txs?: {
        height?: string;
        txhash?: string;
        codespace?: string;
        code?: number;
        data?: string;
        rawLog?: string;
        logs?: {
          msgIndex?: number;
          log?: string;
          events?: {
            type?: string;
            attributes?: {
              key?: string;
              value?: string;
            }[];
          }[];
        }[];
        info?: string;
        gasWanted?: string;
        gasUsed?: string;
        tx?: {
          typeUrl?: string;
          value?: Uint8Array;
        };
        timestamp?: string;
      }[];
    } & {
      totalCount?: string;
      count?: string;
      pageNumber?: string;
      pageTotal?: string;
      limit?: string;
      txs?: {
        height?: string;
        txhash?: string;
        codespace?: string;
        code?: number;
        data?: string;
        rawLog?: string;
        logs?: {
          msgIndex?: number;
          log?: string;
          events?: {
            type?: string;
            attributes?: {
              key?: string;
              value?: string;
            }[];
          }[];
        }[];
        info?: string;
        gasWanted?: string;
        gasUsed?: string;
        tx?: {
          typeUrl?: string;
          value?: Uint8Array;
        };
        timestamp?: string;
      }[] &
        ({
          height?: string;
          txhash?: string;
          codespace?: string;
          code?: number;
          data?: string;
          rawLog?: string;
          logs?: {
            msgIndex?: number;
            log?: string;
            events?: {
              type?: string;
              attributes?: {
                key?: string;
                value?: string;
              }[];
            }[];
          }[];
          info?: string;
          gasWanted?: string;
          gasUsed?: string;
          tx?: {
            typeUrl?: string;
            value?: Uint8Array;
          };
          timestamp?: string;
        } & {
          height?: string;
          txhash?: string;
          codespace?: string;
          code?: number;
          data?: string;
          rawLog?: string;
          logs?: {
            msgIndex?: number;
            log?: string;
            events?: {
              type?: string;
              attributes?: {
                key?: string;
                value?: string;
              }[];
            }[];
          }[] &
            ({
              msgIndex?: number;
              log?: string;
              events?: {
                type?: string;
                attributes?: {
                  key?: string;
                  value?: string;
                }[];
              }[];
            } & {
              msgIndex?: number;
              log?: string;
              events?: {
                type?: string;
                attributes?: {
                  key?: string;
                  value?: string;
                }[];
              }[] &
                ({
                  type?: string;
                  attributes?: {
                    key?: string;
                    value?: string;
                  }[];
                } & {
                  type?: string;
                  attributes?: {
                    key?: string;
                    value?: string;
                  }[] &
                    ({
                      key?: string;
                      value?: string;
                    } & {
                      key?: string;
                      value?: string;
                    } & {
                      [K in Exclude<
                        keyof I["txs"][number]["logs"][number]["events"][number]["attributes"][number],
                        keyof Attribute
                      >]: never;
                    })[] & {
                      [K_1 in Exclude<
                        keyof I["txs"][number]["logs"][number]["events"][number]["attributes"],
                        keyof {
                          key?: string;
                          value?: string;
                        }[]
                      >]: never;
                    };
                } & {
                  [K_2 in Exclude<
                    keyof I["txs"][number]["logs"][number]["events"][number],
                    keyof StringEvent
                  >]: never;
                })[] & {
                  [K_3 in Exclude<
                    keyof I["txs"][number]["logs"][number]["events"],
                    keyof {
                      type?: string;
                      attributes?: {
                        key?: string;
                        value?: string;
                      }[];
                    }[]
                  >]: never;
                };
            } & {
              [K_4 in Exclude<
                keyof I["txs"][number]["logs"][number],
                keyof ABCIMessageLog
              >]: never;
            })[] & {
              [K_5 in Exclude<
                keyof I["txs"][number]["logs"],
                keyof {
                  msgIndex?: number;
                  log?: string;
                  events?: {
                    type?: string;
                    attributes?: {
                      key?: string;
                      value?: string;
                    }[];
                  }[];
                }[]
              >]: never;
            };
          info?: string;
          gasWanted?: string;
          gasUsed?: string;
          tx?: {
            typeUrl?: string;
            value?: Uint8Array;
          } & {
            typeUrl?: string;
            value?: Uint8Array;
          } & {
            [K_6 in Exclude<keyof I["txs"][number]["tx"], keyof Any>]: never;
          };
          timestamp?: string;
        } & {
          [K_7 in Exclude<keyof I["txs"][number], keyof TxResponse>]: never;
        })[] & {
          [K_8 in Exclude<
            keyof I["txs"],
            keyof {
              height?: string;
              txhash?: string;
              codespace?: string;
              code?: number;
              data?: string;
              rawLog?: string;
              logs?: {
                msgIndex?: number;
                log?: string;
                events?: {
                  type?: string;
                  attributes?: {
                    key?: string;
                    value?: string;
                  }[];
                }[];
              }[];
              info?: string;
              gasWanted?: string;
              gasUsed?: string;
              tx?: {
                typeUrl?: string;
                value?: Uint8Array;
              };
              timestamp?: string;
            }[]
          >]: never;
        };
    } & { [K_9 in Exclude<keyof I, keyof SearchTxsResult>]: never }
  >(
    base?: I
  ): SearchTxsResult;
  fromPartial<
    I_1 extends {
      totalCount?: string;
      count?: string;
      pageNumber?: string;
      pageTotal?: string;
      limit?: string;
      txs?: {
        height?: string;
        txhash?: string;
        codespace?: string;
        code?: number;
        data?: string;
        rawLog?: string;
        logs?: {
          msgIndex?: number;
          log?: string;
          events?: {
            type?: string;
            attributes?: {
              key?: string;
              value?: string;
            }[];
          }[];
        }[];
        info?: string;
        gasWanted?: string;
        gasUsed?: string;
        tx?: {
          typeUrl?: string;
          value?: Uint8Array;
        };
        timestamp?: string;
      }[];
    } & {
      totalCount?: string;
      count?: string;
      pageNumber?: string;
      pageTotal?: string;
      limit?: string;
      txs?: {
        height?: string;
        txhash?: string;
        codespace?: string;
        code?: number;
        data?: string;
        rawLog?: string;
        logs?: {
          msgIndex?: number;
          log?: string;
          events?: {
            type?: string;
            attributes?: {
              key?: string;
              value?: string;
            }[];
          }[];
        }[];
        info?: string;
        gasWanted?: string;
        gasUsed?: string;
        tx?: {
          typeUrl?: string;
          value?: Uint8Array;
        };
        timestamp?: string;
      }[] &
        ({
          height?: string;
          txhash?: string;
          codespace?: string;
          code?: number;
          data?: string;
          rawLog?: string;
          logs?: {
            msgIndex?: number;
            log?: string;
            events?: {
              type?: string;
              attributes?: {
                key?: string;
                value?: string;
              }[];
            }[];
          }[];
          info?: string;
          gasWanted?: string;
          gasUsed?: string;
          tx?: {
            typeUrl?: string;
            value?: Uint8Array;
          };
          timestamp?: string;
        } & {
          height?: string;
          txhash?: string;
          codespace?: string;
          code?: number;
          data?: string;
          rawLog?: string;
          logs?: {
            msgIndex?: number;
            log?: string;
            events?: {
              type?: string;
              attributes?: {
                key?: string;
                value?: string;
              }[];
            }[];
          }[] &
            ({
              msgIndex?: number;
              log?: string;
              events?: {
                type?: string;
                attributes?: {
                  key?: string;
                  value?: string;
                }[];
              }[];
            } & {
              msgIndex?: number;
              log?: string;
              events?: {
                type?: string;
                attributes?: {
                  key?: string;
                  value?: string;
                }[];
              }[] &
                ({
                  type?: string;
                  attributes?: {
                    key?: string;
                    value?: string;
                  }[];
                } & {
                  type?: string;
                  attributes?: {
                    key?: string;
                    value?: string;
                  }[] &
                    ({
                      key?: string;
                      value?: string;
                    } & {
                      key?: string;
                      value?: string;
                    } & {
                      [K_10 in Exclude<
                        keyof I_1["txs"][number]["logs"][number]["events"][number]["attributes"][number],
                        keyof Attribute
                      >]: never;
                    })[] & {
                      [K_11 in Exclude<
                        keyof I_1["txs"][number]["logs"][number]["events"][number]["attributes"],
                        keyof {
                          key?: string;
                          value?: string;
                        }[]
                      >]: never;
                    };
                } & {
                  [K_12 in Exclude<
                    keyof I_1["txs"][number]["logs"][number]["events"][number],
                    keyof StringEvent
                  >]: never;
                })[] & {
                  [K_13 in Exclude<
                    keyof I_1["txs"][number]["logs"][number]["events"],
                    keyof {
                      type?: string;
                      attributes?: {
                        key?: string;
                        value?: string;
                      }[];
                    }[]
                  >]: never;
                };
            } & {
              [K_14 in Exclude<
                keyof I_1["txs"][number]["logs"][number],
                keyof ABCIMessageLog
              >]: never;
            })[] & {
              [K_15 in Exclude<
                keyof I_1["txs"][number]["logs"],
                keyof {
                  msgIndex?: number;
                  log?: string;
                  events?: {
                    type?: string;
                    attributes?: {
                      key?: string;
                      value?: string;
                    }[];
                  }[];
                }[]
              >]: never;
            };
          info?: string;
          gasWanted?: string;
          gasUsed?: string;
          tx?: {
            typeUrl?: string;
            value?: Uint8Array;
          } & {
            typeUrl?: string;
            value?: Uint8Array;
          } & {
            [K_16 in Exclude<keyof I_1["txs"][number]["tx"], keyof Any>]: never;
          };
          timestamp?: string;
        } & {
          [K_17 in Exclude<keyof I_1["txs"][number], keyof TxResponse>]: never;
        })[] & {
          [K_18 in Exclude<
            keyof I_1["txs"],
            keyof {
              height?: string;
              txhash?: string;
              codespace?: string;
              code?: number;
              data?: string;
              rawLog?: string;
              logs?: {
                msgIndex?: number;
                log?: string;
                events?: {
                  type?: string;
                  attributes?: {
                    key?: string;
                    value?: string;
                  }[];
                }[];
              }[];
              info?: string;
              gasWanted?: string;
              gasUsed?: string;
              tx?: {
                typeUrl?: string;
                value?: Uint8Array;
              };
              timestamp?: string;
            }[]
          >]: never;
        };
    } & { [K_19 in Exclude<keyof I_1, keyof SearchTxsResult>]: never }
  >(
    object: I_1
  ): SearchTxsResult;
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

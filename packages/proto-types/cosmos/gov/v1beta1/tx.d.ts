import _m0 from "protobufjs/minimal";
import { Any } from "../../../google/protobuf/any";
import { Coin } from "../../base/v1beta1/coin";
import { VoteOption, WeightedVoteOption } from "./gov";
export declare const protobufPackage = "cosmos.gov.v1beta1";
/**
 * MsgSubmitProposal defines an sdk.Msg type that supports submitting arbitrary
 * proposal Content.
 */
export interface MsgSubmitProposal {
  content: Any | undefined;
  initialDeposit: Coin[];
  proposer: string;
}
/** MsgSubmitProposalResponse defines the Msg/SubmitProposal response type. */
export interface MsgSubmitProposalResponse {
  proposalId: string;
}
/** MsgVote defines a message to cast a vote. */
export interface MsgVote {
  proposalId: string;
  voter: string;
  option: VoteOption;
}
/** MsgVoteResponse defines the Msg/Vote response type. */
export interface MsgVoteResponse {}
/** MsgVoteWeighted defines a message to cast a vote. */
export interface MsgVoteWeighted {
  proposalId: string;
  voter: string;
  options: WeightedVoteOption[];
}
/** MsgVoteWeightedResponse defines the Msg/VoteWeighted response type. */
export interface MsgVoteWeightedResponse {}
/** MsgDeposit defines a message to submit a deposit to an existing proposal. */
export interface MsgDeposit {
  proposalId: string;
  depositor: string;
  amount: Coin[];
}
/** MsgDepositResponse defines the Msg/Deposit response type. */
export interface MsgDepositResponse {}
export declare const MsgSubmitProposal: {
  encode(message: MsgSubmitProposal, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSubmitProposal;
  fromJSON(object: any): MsgSubmitProposal;
  toJSON(message: MsgSubmitProposal): unknown;
  create<
    I extends {
      content?: {
        typeUrl?: string;
        value?: Uint8Array;
      };
      initialDeposit?: {
        denom?: string;
        amount?: string;
      }[];
      proposer?: string;
    } & {
      content?: {
        typeUrl?: string;
        value?: Uint8Array;
      } & {
        typeUrl?: string;
        value?: Uint8Array;
      } & { [K in Exclude<keyof I["content"], keyof Any>]: never };
      initialDeposit?: {
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
          [K_1 in Exclude<
            keyof I["initialDeposit"][number],
            keyof Coin
          >]: never;
        })[] & {
          [K_2 in Exclude<
            keyof I["initialDeposit"],
            keyof {
              denom?: string;
              amount?: string;
            }[]
          >]: never;
        };
      proposer?: string;
    } & { [K_3 in Exclude<keyof I, keyof MsgSubmitProposal>]: never }
  >(
    base?: I
  ): MsgSubmitProposal;
  fromPartial<
    I_1 extends {
      content?: {
        typeUrl?: string;
        value?: Uint8Array;
      };
      initialDeposit?: {
        denom?: string;
        amount?: string;
      }[];
      proposer?: string;
    } & {
      content?: {
        typeUrl?: string;
        value?: Uint8Array;
      } & {
        typeUrl?: string;
        value?: Uint8Array;
      } & { [K_4 in Exclude<keyof I_1["content"], keyof Any>]: never };
      initialDeposit?: {
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
          [K_5 in Exclude<
            keyof I_1["initialDeposit"][number],
            keyof Coin
          >]: never;
        })[] & {
          [K_6 in Exclude<
            keyof I_1["initialDeposit"],
            keyof {
              denom?: string;
              amount?: string;
            }[]
          >]: never;
        };
      proposer?: string;
    } & { [K_7 in Exclude<keyof I_1, keyof MsgSubmitProposal>]: never }
  >(
    object: I_1
  ): MsgSubmitProposal;
};
export declare const MsgSubmitProposalResponse: {
  encode(message: MsgSubmitProposalResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSubmitProposalResponse;
  fromJSON(object: any): MsgSubmitProposalResponse;
  toJSON(message: MsgSubmitProposalResponse): unknown;
  create<
    I extends {
      proposalId?: string;
    } & {
      proposalId?: string;
    } & { [K in Exclude<keyof I, "proposalId">]: never }
  >(
    base?: I
  ): MsgSubmitProposalResponse;
  fromPartial<
    I_1 extends {
      proposalId?: string;
    } & {
      proposalId?: string;
    } & { [K_1 in Exclude<keyof I_1, "proposalId">]: never }
  >(
    object: I_1
  ): MsgSubmitProposalResponse;
};
export declare const MsgVote: {
  encode(message: MsgVote, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgVote;
  fromJSON(object: any): MsgVote;
  toJSON(message: MsgVote): unknown;
  create<
    I extends {
      proposalId?: string;
      voter?: string;
      option?: VoteOption;
    } & {
      proposalId?: string;
      voter?: string;
      option?: VoteOption;
    } & { [K in Exclude<keyof I, keyof MsgVote>]: never }
  >(
    base?: I
  ): MsgVote;
  fromPartial<
    I_1 extends {
      proposalId?: string;
      voter?: string;
      option?: VoteOption;
    } & {
      proposalId?: string;
      voter?: string;
      option?: VoteOption;
    } & { [K_1 in Exclude<keyof I_1, keyof MsgVote>]: never }
  >(
    object: I_1
  ): MsgVote;
};
export declare const MsgVoteResponse: {
  encode(_: MsgVoteResponse, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgVoteResponse;
  fromJSON(_: any): MsgVoteResponse;
  toJSON(_: MsgVoteResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgVoteResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgVoteResponse;
};
export declare const MsgVoteWeighted: {
  encode(message: MsgVoteWeighted, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgVoteWeighted;
  fromJSON(object: any): MsgVoteWeighted;
  toJSON(message: MsgVoteWeighted): unknown;
  create<
    I extends {
      proposalId?: string;
      voter?: string;
      options?: {
        option?: VoteOption;
        weight?: string;
      }[];
    } & {
      proposalId?: string;
      voter?: string;
      options?: {
        option?: VoteOption;
        weight?: string;
      }[] &
        ({
          option?: VoteOption;
          weight?: string;
        } & {
          option?: VoteOption;
          weight?: string;
        } & {
          [K in Exclude<
            keyof I["options"][number],
            keyof WeightedVoteOption
          >]: never;
        })[] & {
          [K_1 in Exclude<
            keyof I["options"],
            keyof {
              option?: VoteOption;
              weight?: string;
            }[]
          >]: never;
        };
    } & { [K_2 in Exclude<keyof I, keyof MsgVoteWeighted>]: never }
  >(
    base?: I
  ): MsgVoteWeighted;
  fromPartial<
    I_1 extends {
      proposalId?: string;
      voter?: string;
      options?: {
        option?: VoteOption;
        weight?: string;
      }[];
    } & {
      proposalId?: string;
      voter?: string;
      options?: {
        option?: VoteOption;
        weight?: string;
      }[] &
        ({
          option?: VoteOption;
          weight?: string;
        } & {
          option?: VoteOption;
          weight?: string;
        } & {
          [K_3 in Exclude<
            keyof I_1["options"][number],
            keyof WeightedVoteOption
          >]: never;
        })[] & {
          [K_4 in Exclude<
            keyof I_1["options"],
            keyof {
              option?: VoteOption;
              weight?: string;
            }[]
          >]: never;
        };
    } & { [K_5 in Exclude<keyof I_1, keyof MsgVoteWeighted>]: never }
  >(
    object: I_1
  ): MsgVoteWeighted;
};
export declare const MsgVoteWeightedResponse: {
  encode(_: MsgVoteWeightedResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgVoteWeightedResponse;
  fromJSON(_: any): MsgVoteWeightedResponse;
  toJSON(_: MsgVoteWeightedResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgVoteWeightedResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgVoteWeightedResponse;
};
export declare const MsgDeposit: {
  encode(message: MsgDeposit, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgDeposit;
  fromJSON(object: any): MsgDeposit;
  toJSON(message: MsgDeposit): unknown;
  create<
    I extends {
      proposalId?: string;
      depositor?: string;
      amount?: {
        denom?: string;
        amount?: string;
      }[];
    } & {
      proposalId?: string;
      depositor?: string;
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
    } & { [K_2 in Exclude<keyof I, keyof MsgDeposit>]: never }
  >(
    base?: I
  ): MsgDeposit;
  fromPartial<
    I_1 extends {
      proposalId?: string;
      depositor?: string;
      amount?: {
        denom?: string;
        amount?: string;
      }[];
    } & {
      proposalId?: string;
      depositor?: string;
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
    } & { [K_5 in Exclude<keyof I_1, keyof MsgDeposit>]: never }
  >(
    object: I_1
  ): MsgDeposit;
};
export declare const MsgDepositResponse: {
  encode(_: MsgDepositResponse, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgDepositResponse;
  fromJSON(_: any): MsgDepositResponse;
  toJSON(_: MsgDepositResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgDepositResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgDepositResponse;
};
/** Msg defines the bank Msg service. */
export interface Msg {
  /** SubmitProposal defines a method to create new proposal given a content. */
  SubmitProposal(
    request: MsgSubmitProposal
  ): Promise<MsgSubmitProposalResponse>;
  /** Vote defines a method to add a vote on a specific proposal. */
  Vote(request: MsgVote): Promise<MsgVoteResponse>;
  /** VoteWeighted defines a method to add a weighted vote on a specific proposal. */
  VoteWeighted(request: MsgVoteWeighted): Promise<MsgVoteWeightedResponse>;
  /** Deposit defines a method to add deposit on a specific proposal. */
  Deposit(request: MsgDeposit): Promise<MsgDepositResponse>;
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

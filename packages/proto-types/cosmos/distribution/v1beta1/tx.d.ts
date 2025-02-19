import _m0 from "protobufjs/minimal";
import { Coin } from "../../base/v1beta1/coin";
export declare const protobufPackage = "cosmos.distribution.v1beta1";
/**
 * MsgSetWithdrawAddress sets the withdraw address for
 * a delegator (or validator self-delegation).
 */
export interface MsgSetWithdrawAddress {
  delegatorAddress: string;
  withdrawAddress: string;
}
/** MsgSetWithdrawAddressResponse defines the Msg/SetWithdrawAddress response type. */
export interface MsgSetWithdrawAddressResponse {}
/**
 * MsgWithdrawDelegatorReward represents delegation withdrawal to a delegator
 * from a single validator.
 */
export interface MsgWithdrawDelegatorReward {
  delegatorAddress: string;
  validatorAddress: string;
}
/** MsgWithdrawDelegatorRewardResponse defines the Msg/WithdrawDelegatorReward response type. */
export interface MsgWithdrawDelegatorRewardResponse {}
/**
 * MsgWithdrawValidatorCommission withdraws the full commission to the validator
 * address.
 */
export interface MsgWithdrawValidatorCommission {
  validatorAddress: string;
}
/** MsgWithdrawValidatorCommissionResponse defines the Msg/WithdrawValidatorCommission response type. */
export interface MsgWithdrawValidatorCommissionResponse {}
/**
 * MsgFundCommunityPool allows an account to directly
 * fund the community pool.
 */
export interface MsgFundCommunityPool {
  amount: Coin[];
  depositor: string;
}
/** MsgFundCommunityPoolResponse defines the Msg/FundCommunityPool response type. */
export interface MsgFundCommunityPoolResponse {}
export declare const MsgSetWithdrawAddress: {
  encode(message: MsgSetWithdrawAddress, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSetWithdrawAddress;
  fromJSON(object: any): MsgSetWithdrawAddress;
  toJSON(message: MsgSetWithdrawAddress): unknown;
  create<
    I extends {
      delegatorAddress?: string;
      withdrawAddress?: string;
    } & {
      delegatorAddress?: string;
      withdrawAddress?: string;
    } & { [K in Exclude<keyof I, keyof MsgSetWithdrawAddress>]: never }
  >(
    base?: I
  ): MsgSetWithdrawAddress;
  fromPartial<
    I_1 extends {
      delegatorAddress?: string;
      withdrawAddress?: string;
    } & {
      delegatorAddress?: string;
      withdrawAddress?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof MsgSetWithdrawAddress>]: never }
  >(
    object: I_1
  ): MsgSetWithdrawAddress;
};
export declare const MsgSetWithdrawAddressResponse: {
  encode(_: MsgSetWithdrawAddressResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSetWithdrawAddressResponse;
  fromJSON(_: any): MsgSetWithdrawAddressResponse;
  toJSON(_: MsgSetWithdrawAddressResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgSetWithdrawAddressResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgSetWithdrawAddressResponse;
};
export declare const MsgWithdrawDelegatorReward: {
  encode(message: MsgWithdrawDelegatorReward, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgWithdrawDelegatorReward;
  fromJSON(object: any): MsgWithdrawDelegatorReward;
  toJSON(message: MsgWithdrawDelegatorReward): unknown;
  create<
    I extends {
      delegatorAddress?: string;
      validatorAddress?: string;
    } & {
      delegatorAddress?: string;
      validatorAddress?: string;
    } & { [K in Exclude<keyof I, keyof MsgWithdrawDelegatorReward>]: never }
  >(
    base?: I
  ): MsgWithdrawDelegatorReward;
  fromPartial<
    I_1 extends {
      delegatorAddress?: string;
      validatorAddress?: string;
    } & {
      delegatorAddress?: string;
      validatorAddress?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof MsgWithdrawDelegatorReward>]: never }
  >(
    object: I_1
  ): MsgWithdrawDelegatorReward;
};
export declare const MsgWithdrawDelegatorRewardResponse: {
  encode(
    _: MsgWithdrawDelegatorRewardResponse,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgWithdrawDelegatorRewardResponse;
  fromJSON(_: any): MsgWithdrawDelegatorRewardResponse;
  toJSON(_: MsgWithdrawDelegatorRewardResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgWithdrawDelegatorRewardResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgWithdrawDelegatorRewardResponse;
};
export declare const MsgWithdrawValidatorCommission: {
  encode(
    message: MsgWithdrawValidatorCommission,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgWithdrawValidatorCommission;
  fromJSON(object: any): MsgWithdrawValidatorCommission;
  toJSON(message: MsgWithdrawValidatorCommission): unknown;
  create<
    I extends {
      validatorAddress?: string;
    } & {
      validatorAddress?: string;
    } & { [K in Exclude<keyof I, "validatorAddress">]: never }
  >(
    base?: I
  ): MsgWithdrawValidatorCommission;
  fromPartial<
    I_1 extends {
      validatorAddress?: string;
    } & {
      validatorAddress?: string;
    } & { [K_1 in Exclude<keyof I_1, "validatorAddress">]: never }
  >(
    object: I_1
  ): MsgWithdrawValidatorCommission;
};
export declare const MsgWithdrawValidatorCommissionResponse: {
  encode(
    _: MsgWithdrawValidatorCommissionResponse,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgWithdrawValidatorCommissionResponse;
  fromJSON(_: any): MsgWithdrawValidatorCommissionResponse;
  toJSON(_: MsgWithdrawValidatorCommissionResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgWithdrawValidatorCommissionResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgWithdrawValidatorCommissionResponse;
};
export declare const MsgFundCommunityPool: {
  encode(message: MsgFundCommunityPool, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgFundCommunityPool;
  fromJSON(object: any): MsgFundCommunityPool;
  toJSON(message: MsgFundCommunityPool): unknown;
  create<
    I extends {
      amount?: {
        denom?: string;
        amount?: string;
      }[];
      depositor?: string;
    } & {
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
      depositor?: string;
    } & { [K_2 in Exclude<keyof I, keyof MsgFundCommunityPool>]: never }
  >(
    base?: I
  ): MsgFundCommunityPool;
  fromPartial<
    I_1 extends {
      amount?: {
        denom?: string;
        amount?: string;
      }[];
      depositor?: string;
    } & {
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
      depositor?: string;
    } & { [K_5 in Exclude<keyof I_1, keyof MsgFundCommunityPool>]: never }
  >(
    object: I_1
  ): MsgFundCommunityPool;
};
export declare const MsgFundCommunityPoolResponse: {
  encode(_: MsgFundCommunityPoolResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgFundCommunityPoolResponse;
  fromJSON(_: any): MsgFundCommunityPoolResponse;
  toJSON(_: MsgFundCommunityPoolResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgFundCommunityPoolResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgFundCommunityPoolResponse;
};
/** Msg defines the distribution Msg service. */
export interface Msg {
  /**
   * SetWithdrawAddress defines a method to change the withdraw address
   * for a delegator (or validator self-delegation).
   */
  SetWithdrawAddress(
    request: MsgSetWithdrawAddress
  ): Promise<MsgSetWithdrawAddressResponse>;
  /**
   * WithdrawDelegatorReward defines a method to withdraw rewards of delegator
   * from a single validator.
   */
  WithdrawDelegatorReward(
    request: MsgWithdrawDelegatorReward
  ): Promise<MsgWithdrawDelegatorRewardResponse>;
  /**
   * WithdrawValidatorCommission defines a method to withdraw the
   * full commission to the validator address.
   */
  WithdrawValidatorCommission(
    request: MsgWithdrawValidatorCommission
  ): Promise<MsgWithdrawValidatorCommissionResponse>;
  /**
   * FundCommunityPool defines a method to allow an account to directly
   * fund the community pool.
   */
  FundCommunityPool(
    request: MsgFundCommunityPool
  ): Promise<MsgFundCommunityPoolResponse>;
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

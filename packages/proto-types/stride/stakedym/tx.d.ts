import _m0 from "protobufjs/minimal";
import { Coin } from "../../cosmos/base/v1beta1/coin";
import {
  DelegationRecord,
  RedemptionRecord,
  UnbondingRecord,
} from "./stakedym";
export declare const protobufPackage = "stride.stakedym";
export declare enum OverwritableRecordType {
  RECORD_TYPE_DELEGATION = 0,
  RECORD_TYPE_UNBONDING = 1,
  RECORD_TYPE_REDEMPTION = 2,
  UNRECOGNIZED = -1,
}
export declare function overwritableRecordTypeFromJSON(
  object: any
): OverwritableRecordType;
export declare function overwritableRecordTypeToJSON(
  object: OverwritableRecordType
): string;
/** LiquidStake */
export interface MsgLiquidStake {
  staker: string;
  nativeAmount: string;
}
export interface MsgLiquidStakeResponse {
  stToken: Coin | undefined;
}
/** RedeemStake */
export interface MsgRedeemStake {
  redeemer: string;
  stTokenAmount: string;
}
export interface MsgRedeemStakeResponse {
  nativeToken: Coin | undefined;
}
/** ConfirmDelegation */
export interface MsgConfirmDelegation {
  operator: string;
  recordId: string;
  txHash: string;
}
export interface MsgConfirmDelegationResponse {}
/** ConfirmUndelegation */
export interface MsgConfirmUndelegation {
  operator: string;
  recordId: string;
  txHash: string;
}
export interface MsgConfirmUndelegationResponse {}
/** ConfirmUnbondedTokenSweep */
export interface MsgConfirmUnbondedTokenSweep {
  operator: string;
  recordId: string;
  txHash: string;
}
export interface MsgConfirmUnbondedTokenSweepResponse {}
/** AdjustDelegatedBalance */
export interface MsgAdjustDelegatedBalance {
  operator: string;
  delegationOffset: string;
  validatorAddress: string;
}
export interface MsgAdjustDelegatedBalanceResponse {}
/** UpdateInnerRedemptionRate */
export interface MsgUpdateInnerRedemptionRateBounds {
  creator: string;
  minInnerRedemptionRate: string;
  maxInnerRedemptionRate: string;
}
export interface MsgUpdateInnerRedemptionRateBoundsResponse {}
/** ResumeHostZone */
export interface MsgResumeHostZone {
  creator: string;
}
export interface MsgResumeHostZoneResponse {}
/** RefreshRedemptionRate */
export interface MsgRefreshRedemptionRate {
  creator: string;
}
export interface MsgRefreshRedemptionRateResponse {}
/** OverwriteDelegationRecord */
export interface MsgOverwriteDelegationRecord {
  creator: string;
  delegationRecord: DelegationRecord | undefined;
}
export interface MsgOverwriteDelegationRecordResponse {}
/** OverwriteUnbondingRecord */
export interface MsgOverwriteUnbondingRecord {
  creator: string;
  unbondingRecord: UnbondingRecord | undefined;
}
export interface MsgOverwriteUnbondingRecordResponse {}
/** OverwriteRedemptionRecord */
export interface MsgOverwriteRedemptionRecord {
  creator: string;
  redemptionRecord: RedemptionRecord | undefined;
}
export interface MsgOverwriteRedemptionRecordResponse {}
/** SetOperatorAddress */
export interface MsgSetOperatorAddress {
  signer: string;
  operator: string;
}
export interface MsgSetOperatorAddressResponse {}
export declare const MsgLiquidStake: {
  encode(message: MsgLiquidStake, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgLiquidStake;
  fromJSON(object: any): MsgLiquidStake;
  toJSON(message: MsgLiquidStake): unknown;
  create<
    I extends {
      staker?: string;
      nativeAmount?: string;
    } & {
      staker?: string;
      nativeAmount?: string;
    } & { [K in Exclude<keyof I, keyof MsgLiquidStake>]: never }
  >(
    base?: I
  ): MsgLiquidStake;
  fromPartial<
    I_1 extends {
      staker?: string;
      nativeAmount?: string;
    } & {
      staker?: string;
      nativeAmount?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof MsgLiquidStake>]: never }
  >(
    object: I_1
  ): MsgLiquidStake;
};
export declare const MsgLiquidStakeResponse: {
  encode(message: MsgLiquidStakeResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgLiquidStakeResponse;
  fromJSON(object: any): MsgLiquidStakeResponse;
  toJSON(message: MsgLiquidStakeResponse): unknown;
  create<
    I extends {
      stToken?: {
        denom?: string;
        amount?: string;
      };
    } & {
      stToken?: {
        denom?: string;
        amount?: string;
      } & {
        denom?: string;
        amount?: string;
      } & { [K in Exclude<keyof I["stToken"], keyof Coin>]: never };
    } & { [K_1 in Exclude<keyof I, "stToken">]: never }
  >(
    base?: I
  ): MsgLiquidStakeResponse;
  fromPartial<
    I_1 extends {
      stToken?: {
        denom?: string;
        amount?: string;
      };
    } & {
      stToken?: {
        denom?: string;
        amount?: string;
      } & {
        denom?: string;
        amount?: string;
      } & { [K_2 in Exclude<keyof I_1["stToken"], keyof Coin>]: never };
    } & { [K_3 in Exclude<keyof I_1, "stToken">]: never }
  >(
    object: I_1
  ): MsgLiquidStakeResponse;
};
export declare const MsgRedeemStake: {
  encode(message: MsgRedeemStake, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgRedeemStake;
  fromJSON(object: any): MsgRedeemStake;
  toJSON(message: MsgRedeemStake): unknown;
  create<
    I extends {
      redeemer?: string;
      stTokenAmount?: string;
    } & {
      redeemer?: string;
      stTokenAmount?: string;
    } & { [K in Exclude<keyof I, keyof MsgRedeemStake>]: never }
  >(
    base?: I
  ): MsgRedeemStake;
  fromPartial<
    I_1 extends {
      redeemer?: string;
      stTokenAmount?: string;
    } & {
      redeemer?: string;
      stTokenAmount?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof MsgRedeemStake>]: never }
  >(
    object: I_1
  ): MsgRedeemStake;
};
export declare const MsgRedeemStakeResponse: {
  encode(message: MsgRedeemStakeResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgRedeemStakeResponse;
  fromJSON(object: any): MsgRedeemStakeResponse;
  toJSON(message: MsgRedeemStakeResponse): unknown;
  create<
    I extends {
      nativeToken?: {
        denom?: string;
        amount?: string;
      };
    } & {
      nativeToken?: {
        denom?: string;
        amount?: string;
      } & {
        denom?: string;
        amount?: string;
      } & { [K in Exclude<keyof I["nativeToken"], keyof Coin>]: never };
    } & { [K_1 in Exclude<keyof I, "nativeToken">]: never }
  >(
    base?: I
  ): MsgRedeemStakeResponse;
  fromPartial<
    I_1 extends {
      nativeToken?: {
        denom?: string;
        amount?: string;
      };
    } & {
      nativeToken?: {
        denom?: string;
        amount?: string;
      } & {
        denom?: string;
        amount?: string;
      } & { [K_2 in Exclude<keyof I_1["nativeToken"], keyof Coin>]: never };
    } & { [K_3 in Exclude<keyof I_1, "nativeToken">]: never }
  >(
    object: I_1
  ): MsgRedeemStakeResponse;
};
export declare const MsgConfirmDelegation: {
  encode(message: MsgConfirmDelegation, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgConfirmDelegation;
  fromJSON(object: any): MsgConfirmDelegation;
  toJSON(message: MsgConfirmDelegation): unknown;
  create<
    I extends {
      operator?: string;
      recordId?: string;
      txHash?: string;
    } & {
      operator?: string;
      recordId?: string;
      txHash?: string;
    } & { [K in Exclude<keyof I, keyof MsgConfirmDelegation>]: never }
  >(
    base?: I
  ): MsgConfirmDelegation;
  fromPartial<
    I_1 extends {
      operator?: string;
      recordId?: string;
      txHash?: string;
    } & {
      operator?: string;
      recordId?: string;
      txHash?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof MsgConfirmDelegation>]: never }
  >(
    object: I_1
  ): MsgConfirmDelegation;
};
export declare const MsgConfirmDelegationResponse: {
  encode(_: MsgConfirmDelegationResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgConfirmDelegationResponse;
  fromJSON(_: any): MsgConfirmDelegationResponse;
  toJSON(_: MsgConfirmDelegationResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgConfirmDelegationResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgConfirmDelegationResponse;
};
export declare const MsgConfirmUndelegation: {
  encode(message: MsgConfirmUndelegation, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgConfirmUndelegation;
  fromJSON(object: any): MsgConfirmUndelegation;
  toJSON(message: MsgConfirmUndelegation): unknown;
  create<
    I extends {
      operator?: string;
      recordId?: string;
      txHash?: string;
    } & {
      operator?: string;
      recordId?: string;
      txHash?: string;
    } & { [K in Exclude<keyof I, keyof MsgConfirmUndelegation>]: never }
  >(
    base?: I
  ): MsgConfirmUndelegation;
  fromPartial<
    I_1 extends {
      operator?: string;
      recordId?: string;
      txHash?: string;
    } & {
      operator?: string;
      recordId?: string;
      txHash?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof MsgConfirmUndelegation>]: never }
  >(
    object: I_1
  ): MsgConfirmUndelegation;
};
export declare const MsgConfirmUndelegationResponse: {
  encode(_: MsgConfirmUndelegationResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgConfirmUndelegationResponse;
  fromJSON(_: any): MsgConfirmUndelegationResponse;
  toJSON(_: MsgConfirmUndelegationResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgConfirmUndelegationResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgConfirmUndelegationResponse;
};
export declare const MsgConfirmUnbondedTokenSweep: {
  encode(
    message: MsgConfirmUnbondedTokenSweep,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgConfirmUnbondedTokenSweep;
  fromJSON(object: any): MsgConfirmUnbondedTokenSweep;
  toJSON(message: MsgConfirmUnbondedTokenSweep): unknown;
  create<
    I extends {
      operator?: string;
      recordId?: string;
      txHash?: string;
    } & {
      operator?: string;
      recordId?: string;
      txHash?: string;
    } & { [K in Exclude<keyof I, keyof MsgConfirmUnbondedTokenSweep>]: never }
  >(
    base?: I
  ): MsgConfirmUnbondedTokenSweep;
  fromPartial<
    I_1 extends {
      operator?: string;
      recordId?: string;
      txHash?: string;
    } & {
      operator?: string;
      recordId?: string;
      txHash?: string;
    } & {
      [K_1 in Exclude<keyof I_1, keyof MsgConfirmUnbondedTokenSweep>]: never;
    }
  >(
    object: I_1
  ): MsgConfirmUnbondedTokenSweep;
};
export declare const MsgConfirmUnbondedTokenSweepResponse: {
  encode(
    _: MsgConfirmUnbondedTokenSweepResponse,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgConfirmUnbondedTokenSweepResponse;
  fromJSON(_: any): MsgConfirmUnbondedTokenSweepResponse;
  toJSON(_: MsgConfirmUnbondedTokenSweepResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgConfirmUnbondedTokenSweepResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgConfirmUnbondedTokenSweepResponse;
};
export declare const MsgAdjustDelegatedBalance: {
  encode(message: MsgAdjustDelegatedBalance, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgAdjustDelegatedBalance;
  fromJSON(object: any): MsgAdjustDelegatedBalance;
  toJSON(message: MsgAdjustDelegatedBalance): unknown;
  create<
    I extends {
      operator?: string;
      delegationOffset?: string;
      validatorAddress?: string;
    } & {
      operator?: string;
      delegationOffset?: string;
      validatorAddress?: string;
    } & { [K in Exclude<keyof I, keyof MsgAdjustDelegatedBalance>]: never }
  >(
    base?: I
  ): MsgAdjustDelegatedBalance;
  fromPartial<
    I_1 extends {
      operator?: string;
      delegationOffset?: string;
      validatorAddress?: string;
    } & {
      operator?: string;
      delegationOffset?: string;
      validatorAddress?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof MsgAdjustDelegatedBalance>]: never }
  >(
    object: I_1
  ): MsgAdjustDelegatedBalance;
};
export declare const MsgAdjustDelegatedBalanceResponse: {
  encode(_: MsgAdjustDelegatedBalanceResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgAdjustDelegatedBalanceResponse;
  fromJSON(_: any): MsgAdjustDelegatedBalanceResponse;
  toJSON(_: MsgAdjustDelegatedBalanceResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgAdjustDelegatedBalanceResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgAdjustDelegatedBalanceResponse;
};
export declare const MsgUpdateInnerRedemptionRateBounds: {
  encode(
    message: MsgUpdateInnerRedemptionRateBounds,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgUpdateInnerRedemptionRateBounds;
  fromJSON(object: any): MsgUpdateInnerRedemptionRateBounds;
  toJSON(message: MsgUpdateInnerRedemptionRateBounds): unknown;
  create<
    I extends {
      creator?: string;
      minInnerRedemptionRate?: string;
      maxInnerRedemptionRate?: string;
    } & {
      creator?: string;
      minInnerRedemptionRate?: string;
      maxInnerRedemptionRate?: string;
    } & {
      [K in Exclude<keyof I, keyof MsgUpdateInnerRedemptionRateBounds>]: never;
    }
  >(
    base?: I
  ): MsgUpdateInnerRedemptionRateBounds;
  fromPartial<
    I_1 extends {
      creator?: string;
      minInnerRedemptionRate?: string;
      maxInnerRedemptionRate?: string;
    } & {
      creator?: string;
      minInnerRedemptionRate?: string;
      maxInnerRedemptionRate?: string;
    } & {
      [K_1 in Exclude<
        keyof I_1,
        keyof MsgUpdateInnerRedemptionRateBounds
      >]: never;
    }
  >(
    object: I_1
  ): MsgUpdateInnerRedemptionRateBounds;
};
export declare const MsgUpdateInnerRedemptionRateBoundsResponse: {
  encode(
    _: MsgUpdateInnerRedemptionRateBoundsResponse,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgUpdateInnerRedemptionRateBoundsResponse;
  fromJSON(_: any): MsgUpdateInnerRedemptionRateBoundsResponse;
  toJSON(_: MsgUpdateInnerRedemptionRateBoundsResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgUpdateInnerRedemptionRateBoundsResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgUpdateInnerRedemptionRateBoundsResponse;
};
export declare const MsgResumeHostZone: {
  encode(message: MsgResumeHostZone, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgResumeHostZone;
  fromJSON(object: any): MsgResumeHostZone;
  toJSON(message: MsgResumeHostZone): unknown;
  create<
    I extends {
      creator?: string;
    } & {
      creator?: string;
    } & { [K in Exclude<keyof I, "creator">]: never }
  >(
    base?: I
  ): MsgResumeHostZone;
  fromPartial<
    I_1 extends {
      creator?: string;
    } & {
      creator?: string;
    } & { [K_1 in Exclude<keyof I_1, "creator">]: never }
  >(
    object: I_1
  ): MsgResumeHostZone;
};
export declare const MsgResumeHostZoneResponse: {
  encode(_: MsgResumeHostZoneResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgResumeHostZoneResponse;
  fromJSON(_: any): MsgResumeHostZoneResponse;
  toJSON(_: MsgResumeHostZoneResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgResumeHostZoneResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgResumeHostZoneResponse;
};
export declare const MsgRefreshRedemptionRate: {
  encode(message: MsgRefreshRedemptionRate, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgRefreshRedemptionRate;
  fromJSON(object: any): MsgRefreshRedemptionRate;
  toJSON(message: MsgRefreshRedemptionRate): unknown;
  create<
    I extends {
      creator?: string;
    } & {
      creator?: string;
    } & { [K in Exclude<keyof I, "creator">]: never }
  >(
    base?: I
  ): MsgRefreshRedemptionRate;
  fromPartial<
    I_1 extends {
      creator?: string;
    } & {
      creator?: string;
    } & { [K_1 in Exclude<keyof I_1, "creator">]: never }
  >(
    object: I_1
  ): MsgRefreshRedemptionRate;
};
export declare const MsgRefreshRedemptionRateResponse: {
  encode(_: MsgRefreshRedemptionRateResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgRefreshRedemptionRateResponse;
  fromJSON(_: any): MsgRefreshRedemptionRateResponse;
  toJSON(_: MsgRefreshRedemptionRateResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgRefreshRedemptionRateResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgRefreshRedemptionRateResponse;
};
export declare const MsgOverwriteDelegationRecord: {
  encode(
    message: MsgOverwriteDelegationRecord,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgOverwriteDelegationRecord;
  fromJSON(object: any): MsgOverwriteDelegationRecord;
  toJSON(message: MsgOverwriteDelegationRecord): unknown;
  create<
    I extends {
      creator?: string;
      delegationRecord?: {
        id?: string;
        nativeAmount?: string;
        status?: import("./stakedym").DelegationRecordStatus;
        txHash?: string;
      };
    } & {
      creator?: string;
      delegationRecord?: {
        id?: string;
        nativeAmount?: string;
        status?: import("./stakedym").DelegationRecordStatus;
        txHash?: string;
      } & {
        id?: string;
        nativeAmount?: string;
        status?: import("./stakedym").DelegationRecordStatus;
        txHash?: string;
      } & {
        [K in Exclude<
          keyof I["delegationRecord"],
          keyof DelegationRecord
        >]: never;
      };
    } & { [K_1 in Exclude<keyof I, keyof MsgOverwriteDelegationRecord>]: never }
  >(
    base?: I
  ): MsgOverwriteDelegationRecord;
  fromPartial<
    I_1 extends {
      creator?: string;
      delegationRecord?: {
        id?: string;
        nativeAmount?: string;
        status?: import("./stakedym").DelegationRecordStatus;
        txHash?: string;
      };
    } & {
      creator?: string;
      delegationRecord?: {
        id?: string;
        nativeAmount?: string;
        status?: import("./stakedym").DelegationRecordStatus;
        txHash?: string;
      } & {
        id?: string;
        nativeAmount?: string;
        status?: import("./stakedym").DelegationRecordStatus;
        txHash?: string;
      } & {
        [K_2 in Exclude<
          keyof I_1["delegationRecord"],
          keyof DelegationRecord
        >]: never;
      };
    } & {
      [K_3 in Exclude<keyof I_1, keyof MsgOverwriteDelegationRecord>]: never;
    }
  >(
    object: I_1
  ): MsgOverwriteDelegationRecord;
};
export declare const MsgOverwriteDelegationRecordResponse: {
  encode(
    _: MsgOverwriteDelegationRecordResponse,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgOverwriteDelegationRecordResponse;
  fromJSON(_: any): MsgOverwriteDelegationRecordResponse;
  toJSON(_: MsgOverwriteDelegationRecordResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgOverwriteDelegationRecordResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgOverwriteDelegationRecordResponse;
};
export declare const MsgOverwriteUnbondingRecord: {
  encode(message: MsgOverwriteUnbondingRecord, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgOverwriteUnbondingRecord;
  fromJSON(object: any): MsgOverwriteUnbondingRecord;
  toJSON(message: MsgOverwriteUnbondingRecord): unknown;
  create<
    I extends {
      creator?: string;
      unbondingRecord?: {
        id?: string;
        status?: import("./stakedym").UnbondingRecordStatus;
        stTokenAmount?: string;
        nativeAmount?: string;
        unbondingCompletionTimeSeconds?: string;
        undelegationTxHash?: string;
        unbondedTokenSweepTxHash?: string;
      };
    } & {
      creator?: string;
      unbondingRecord?: {
        id?: string;
        status?: import("./stakedym").UnbondingRecordStatus;
        stTokenAmount?: string;
        nativeAmount?: string;
        unbondingCompletionTimeSeconds?: string;
        undelegationTxHash?: string;
        unbondedTokenSweepTxHash?: string;
      } & {
        id?: string;
        status?: import("./stakedym").UnbondingRecordStatus;
        stTokenAmount?: string;
        nativeAmount?: string;
        unbondingCompletionTimeSeconds?: string;
        undelegationTxHash?: string;
        unbondedTokenSweepTxHash?: string;
      } & {
        [K in Exclude<
          keyof I["unbondingRecord"],
          keyof UnbondingRecord
        >]: never;
      };
    } & { [K_1 in Exclude<keyof I, keyof MsgOverwriteUnbondingRecord>]: never }
  >(
    base?: I
  ): MsgOverwriteUnbondingRecord;
  fromPartial<
    I_1 extends {
      creator?: string;
      unbondingRecord?: {
        id?: string;
        status?: import("./stakedym").UnbondingRecordStatus;
        stTokenAmount?: string;
        nativeAmount?: string;
        unbondingCompletionTimeSeconds?: string;
        undelegationTxHash?: string;
        unbondedTokenSweepTxHash?: string;
      };
    } & {
      creator?: string;
      unbondingRecord?: {
        id?: string;
        status?: import("./stakedym").UnbondingRecordStatus;
        stTokenAmount?: string;
        nativeAmount?: string;
        unbondingCompletionTimeSeconds?: string;
        undelegationTxHash?: string;
        unbondedTokenSweepTxHash?: string;
      } & {
        id?: string;
        status?: import("./stakedym").UnbondingRecordStatus;
        stTokenAmount?: string;
        nativeAmount?: string;
        unbondingCompletionTimeSeconds?: string;
        undelegationTxHash?: string;
        unbondedTokenSweepTxHash?: string;
      } & {
        [K_2 in Exclude<
          keyof I_1["unbondingRecord"],
          keyof UnbondingRecord
        >]: never;
      };
    } & {
      [K_3 in Exclude<keyof I_1, keyof MsgOverwriteUnbondingRecord>]: never;
    }
  >(
    object: I_1
  ): MsgOverwriteUnbondingRecord;
};
export declare const MsgOverwriteUnbondingRecordResponse: {
  encode(
    _: MsgOverwriteUnbondingRecordResponse,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgOverwriteUnbondingRecordResponse;
  fromJSON(_: any): MsgOverwriteUnbondingRecordResponse;
  toJSON(_: MsgOverwriteUnbondingRecordResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgOverwriteUnbondingRecordResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgOverwriteUnbondingRecordResponse;
};
export declare const MsgOverwriteRedemptionRecord: {
  encode(
    message: MsgOverwriteRedemptionRecord,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgOverwriteRedemptionRecord;
  fromJSON(object: any): MsgOverwriteRedemptionRecord;
  toJSON(message: MsgOverwriteRedemptionRecord): unknown;
  create<
    I extends {
      creator?: string;
      redemptionRecord?: {
        unbondingRecordId?: string;
        redeemer?: string;
        stTokenAmount?: string;
        nativeAmount?: string;
      };
    } & {
      creator?: string;
      redemptionRecord?: {
        unbondingRecordId?: string;
        redeemer?: string;
        stTokenAmount?: string;
        nativeAmount?: string;
      } & {
        unbondingRecordId?: string;
        redeemer?: string;
        stTokenAmount?: string;
        nativeAmount?: string;
      } & {
        [K in Exclude<
          keyof I["redemptionRecord"],
          keyof RedemptionRecord
        >]: never;
      };
    } & { [K_1 in Exclude<keyof I, keyof MsgOverwriteRedemptionRecord>]: never }
  >(
    base?: I
  ): MsgOverwriteRedemptionRecord;
  fromPartial<
    I_1 extends {
      creator?: string;
      redemptionRecord?: {
        unbondingRecordId?: string;
        redeemer?: string;
        stTokenAmount?: string;
        nativeAmount?: string;
      };
    } & {
      creator?: string;
      redemptionRecord?: {
        unbondingRecordId?: string;
        redeemer?: string;
        stTokenAmount?: string;
        nativeAmount?: string;
      } & {
        unbondingRecordId?: string;
        redeemer?: string;
        stTokenAmount?: string;
        nativeAmount?: string;
      } & {
        [K_2 in Exclude<
          keyof I_1["redemptionRecord"],
          keyof RedemptionRecord
        >]: never;
      };
    } & {
      [K_3 in Exclude<keyof I_1, keyof MsgOverwriteRedemptionRecord>]: never;
    }
  >(
    object: I_1
  ): MsgOverwriteRedemptionRecord;
};
export declare const MsgOverwriteRedemptionRecordResponse: {
  encode(
    _: MsgOverwriteRedemptionRecordResponse,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgOverwriteRedemptionRecordResponse;
  fromJSON(_: any): MsgOverwriteRedemptionRecordResponse;
  toJSON(_: MsgOverwriteRedemptionRecordResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgOverwriteRedemptionRecordResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgOverwriteRedemptionRecordResponse;
};
export declare const MsgSetOperatorAddress: {
  encode(message: MsgSetOperatorAddress, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSetOperatorAddress;
  fromJSON(object: any): MsgSetOperatorAddress;
  toJSON(message: MsgSetOperatorAddress): unknown;
  create<
    I extends {
      signer?: string;
      operator?: string;
    } & {
      signer?: string;
      operator?: string;
    } & { [K in Exclude<keyof I, keyof MsgSetOperatorAddress>]: never }
  >(
    base?: I
  ): MsgSetOperatorAddress;
  fromPartial<
    I_1 extends {
      signer?: string;
      operator?: string;
    } & {
      signer?: string;
      operator?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof MsgSetOperatorAddress>]: never }
  >(
    object: I_1
  ): MsgSetOperatorAddress;
};
export declare const MsgSetOperatorAddressResponse: {
  encode(_: MsgSetOperatorAddressResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSetOperatorAddressResponse;
  fromJSON(_: any): MsgSetOperatorAddressResponse;
  toJSON(_: MsgSetOperatorAddressResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgSetOperatorAddressResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgSetOperatorAddressResponse;
};
/** Msg defines the Msg service. */
export interface Msg {
  /** User transaction to liquid stake native tokens into stTokens */
  LiquidStake(request: MsgLiquidStake): Promise<MsgLiquidStakeResponse>;
  /** User transaction to redeem stake stTokens into native tokens */
  RedeemStake(request: MsgRedeemStake): Promise<MsgRedeemStakeResponse>;
  /**
   * Operator transaction to confirm a delegation was submitted
   * on the host chain
   */
  ConfirmDelegation(
    request: MsgConfirmDelegation
  ): Promise<MsgConfirmDelegationResponse>;
  /**
   * Operator transaction to confirm an undelegation was submitted
   * on the host chain
   */
  ConfirmUndelegation(
    request: MsgConfirmUndelegation
  ): Promise<MsgConfirmUndelegationResponse>;
  /**
   * Operator transaction to confirm unbonded tokens were transferred back to
   * stride
   */
  ConfirmUnbondedTokenSweep(
    request: MsgConfirmUnbondedTokenSweep
  ): Promise<MsgConfirmUnbondedTokenSweepResponse>;
  /**
   * Operator transaction to adjust the delegated balance after a validator was
   * slashed
   */
  AdjustDelegatedBalance(
    request: MsgAdjustDelegatedBalance
  ): Promise<MsgAdjustDelegatedBalanceResponse>;
  /** Adjusts the inner redemption rate bounds on the host zone */
  UpdateInnerRedemptionRateBounds(
    request: MsgUpdateInnerRedemptionRateBounds
  ): Promise<MsgUpdateInnerRedemptionRateBoundsResponse>;
  /** Unhalts the host zone if redemption rates were exceeded */
  ResumeHostZone(
    request: MsgResumeHostZone
  ): Promise<MsgResumeHostZoneResponse>;
  /** Trigger updating the redemption rate */
  RefreshRedemptionRate(
    request: MsgRefreshRedemptionRate
  ): Promise<MsgRefreshRedemptionRateResponse>;
  /** Overwrites a delegation record */
  OverwriteDelegationRecord(
    request: MsgOverwriteDelegationRecord
  ): Promise<MsgOverwriteDelegationRecordResponse>;
  /** Overwrites a unbonding record */
  OverwriteUnbondingRecord(
    request: MsgOverwriteUnbondingRecord
  ): Promise<MsgOverwriteUnbondingRecordResponse>;
  /** Overwrites a redemption record */
  OverwriteRedemptionRecord(
    request: MsgOverwriteRedemptionRecord
  ): Promise<MsgOverwriteRedemptionRecordResponse>;
  /** Sets the operator address */
  SetOperatorAddress(
    request: MsgSetOperatorAddress
  ): Promise<MsgSetOperatorAddressResponse>;
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

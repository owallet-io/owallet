import _m0 from "protobufjs/minimal";
import { ICAAccountType } from "./ica_account";
import { Validator } from "./validator";
export declare const protobufPackage = "stride.stakeibc";
export interface MsgUpdateInnerRedemptionRateBounds {
  creator: string;
  chainId: string;
  minInnerRedemptionRate: string;
  maxInnerRedemptionRate: string;
}
export interface MsgUpdateInnerRedemptionRateBoundsResponse {}
export interface MsgLiquidStake {
  creator: string;
  amount: string;
  hostDenom: string;
}
export interface MsgLiquidStakeResponse {}
export interface MsgLSMLiquidStake {
  creator: string;
  amount: string;
  lsmTokenIbcDenom: string;
}
export interface MsgLSMLiquidStakeResponse {
  transactionComplete: boolean;
}
export interface MsgClearBalance {
  creator: string;
  chainId: string;
  amount: string;
  channel: string;
}
export interface MsgClearBalanceResponse {}
export interface MsgRedeemStake {
  creator: string;
  amount: string;
  hostZone: string;
  receiver: string;
}
export interface MsgRedeemStakeResponse {}
/** next: 15 */
export interface MsgRegisterHostZone {
  connectionId: string;
  bech32prefix: string;
  hostDenom: string;
  ibcDenom: string;
  creator: string;
  transferChannelId: string;
  unbondingPeriod: string;
  minRedemptionRate: string;
  maxRedemptionRate: string;
  lsmLiquidStakeEnabled: boolean;
}
export interface MsgRegisterHostZoneResponse {}
export interface MsgClaimUndelegatedTokens {
  creator: string;
  /** UserUnbondingRecords are keyed on {chain_id}.{epoch}.{sender} */
  hostZoneId: string;
  epoch: string;
  sender: string;
}
export interface MsgClaimUndelegatedTokensResponse {}
export interface MsgRebalanceValidators {
  creator: string;
  hostZone: string;
  numRebalance: string;
}
export interface MsgRebalanceValidatorsResponse {}
export interface MsgAddValidators {
  creator: string;
  hostZone: string;
  validators: Validator[];
}
export interface MsgAddValidatorsResponse {}
export interface MsgChangeValidatorWeight {
  creator: string;
  hostZone: string;
  valAddr: string;
  weight: string;
}
export interface MsgChangeValidatorWeightResponse {}
export interface MsgDeleteValidator {
  creator: string;
  hostZone: string;
  valAddr: string;
}
export interface MsgDeleteValidatorResponse {}
export interface MsgRestoreInterchainAccount {
  creator: string;
  chainId: string;
  accountType: ICAAccountType;
}
export interface MsgRestoreInterchainAccountResponse {}
export interface MsgUpdateValidatorSharesExchRate {
  creator: string;
  chainId: string;
  valoper: string;
}
export interface MsgUpdateValidatorSharesExchRateResponse {}
export interface MsgUndelegateHost {
  creator: string;
  amount: string;
}
export interface MsgUndelegateHostResponse {}
export interface MsgCalibrateDelegation {
  creator: string;
  chainId: string;
  valoper: string;
}
export interface MsgCalibrateDelegationResponse {}
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
      chainId?: string;
      minInnerRedemptionRate?: string;
      maxInnerRedemptionRate?: string;
    } & {
      creator?: string;
      chainId?: string;
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
      chainId?: string;
      minInnerRedemptionRate?: string;
      maxInnerRedemptionRate?: string;
    } & {
      creator?: string;
      chainId?: string;
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
export declare const MsgLiquidStake: {
  encode(message: MsgLiquidStake, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgLiquidStake;
  fromJSON(object: any): MsgLiquidStake;
  toJSON(message: MsgLiquidStake): unknown;
  create<
    I extends {
      creator?: string;
      amount?: string;
      hostDenom?: string;
    } & {
      creator?: string;
      amount?: string;
      hostDenom?: string;
    } & { [K in Exclude<keyof I, keyof MsgLiquidStake>]: never }
  >(
    base?: I
  ): MsgLiquidStake;
  fromPartial<
    I_1 extends {
      creator?: string;
      amount?: string;
      hostDenom?: string;
    } & {
      creator?: string;
      amount?: string;
      hostDenom?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof MsgLiquidStake>]: never }
  >(
    object: I_1
  ): MsgLiquidStake;
};
export declare const MsgLiquidStakeResponse: {
  encode(_: MsgLiquidStakeResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgLiquidStakeResponse;
  fromJSON(_: any): MsgLiquidStakeResponse;
  toJSON(_: MsgLiquidStakeResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgLiquidStakeResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgLiquidStakeResponse;
};
export declare const MsgLSMLiquidStake: {
  encode(message: MsgLSMLiquidStake, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgLSMLiquidStake;
  fromJSON(object: any): MsgLSMLiquidStake;
  toJSON(message: MsgLSMLiquidStake): unknown;
  create<
    I extends {
      creator?: string;
      amount?: string;
      lsmTokenIbcDenom?: string;
    } & {
      creator?: string;
      amount?: string;
      lsmTokenIbcDenom?: string;
    } & { [K in Exclude<keyof I, keyof MsgLSMLiquidStake>]: never }
  >(
    base?: I
  ): MsgLSMLiquidStake;
  fromPartial<
    I_1 extends {
      creator?: string;
      amount?: string;
      lsmTokenIbcDenom?: string;
    } & {
      creator?: string;
      amount?: string;
      lsmTokenIbcDenom?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof MsgLSMLiquidStake>]: never }
  >(
    object: I_1
  ): MsgLSMLiquidStake;
};
export declare const MsgLSMLiquidStakeResponse: {
  encode(message: MsgLSMLiquidStakeResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgLSMLiquidStakeResponse;
  fromJSON(object: any): MsgLSMLiquidStakeResponse;
  toJSON(message: MsgLSMLiquidStakeResponse): unknown;
  create<
    I extends {
      transactionComplete?: boolean;
    } & {
      transactionComplete?: boolean;
    } & { [K in Exclude<keyof I, "transactionComplete">]: never }
  >(
    base?: I
  ): MsgLSMLiquidStakeResponse;
  fromPartial<
    I_1 extends {
      transactionComplete?: boolean;
    } & {
      transactionComplete?: boolean;
    } & { [K_1 in Exclude<keyof I_1, "transactionComplete">]: never }
  >(
    object: I_1
  ): MsgLSMLiquidStakeResponse;
};
export declare const MsgClearBalance: {
  encode(message: MsgClearBalance, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgClearBalance;
  fromJSON(object: any): MsgClearBalance;
  toJSON(message: MsgClearBalance): unknown;
  create<
    I extends {
      creator?: string;
      chainId?: string;
      amount?: string;
      channel?: string;
    } & {
      creator?: string;
      chainId?: string;
      amount?: string;
      channel?: string;
    } & { [K in Exclude<keyof I, keyof MsgClearBalance>]: never }
  >(
    base?: I
  ): MsgClearBalance;
  fromPartial<
    I_1 extends {
      creator?: string;
      chainId?: string;
      amount?: string;
      channel?: string;
    } & {
      creator?: string;
      chainId?: string;
      amount?: string;
      channel?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof MsgClearBalance>]: never }
  >(
    object: I_1
  ): MsgClearBalance;
};
export declare const MsgClearBalanceResponse: {
  encode(_: MsgClearBalanceResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgClearBalanceResponse;
  fromJSON(_: any): MsgClearBalanceResponse;
  toJSON(_: MsgClearBalanceResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgClearBalanceResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgClearBalanceResponse;
};
export declare const MsgRedeemStake: {
  encode(message: MsgRedeemStake, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgRedeemStake;
  fromJSON(object: any): MsgRedeemStake;
  toJSON(message: MsgRedeemStake): unknown;
  create<
    I extends {
      creator?: string;
      amount?: string;
      hostZone?: string;
      receiver?: string;
    } & {
      creator?: string;
      amount?: string;
      hostZone?: string;
      receiver?: string;
    } & { [K in Exclude<keyof I, keyof MsgRedeemStake>]: never }
  >(
    base?: I
  ): MsgRedeemStake;
  fromPartial<
    I_1 extends {
      creator?: string;
      amount?: string;
      hostZone?: string;
      receiver?: string;
    } & {
      creator?: string;
      amount?: string;
      hostZone?: string;
      receiver?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof MsgRedeemStake>]: never }
  >(
    object: I_1
  ): MsgRedeemStake;
};
export declare const MsgRedeemStakeResponse: {
  encode(_: MsgRedeemStakeResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgRedeemStakeResponse;
  fromJSON(_: any): MsgRedeemStakeResponse;
  toJSON(_: MsgRedeemStakeResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgRedeemStakeResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgRedeemStakeResponse;
};
export declare const MsgRegisterHostZone: {
  encode(message: MsgRegisterHostZone, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgRegisterHostZone;
  fromJSON(object: any): MsgRegisterHostZone;
  toJSON(message: MsgRegisterHostZone): unknown;
  create<
    I extends {
      connectionId?: string;
      bech32prefix?: string;
      hostDenom?: string;
      ibcDenom?: string;
      creator?: string;
      transferChannelId?: string;
      unbondingPeriod?: string;
      minRedemptionRate?: string;
      maxRedemptionRate?: string;
      lsmLiquidStakeEnabled?: boolean;
    } & {
      connectionId?: string;
      bech32prefix?: string;
      hostDenom?: string;
      ibcDenom?: string;
      creator?: string;
      transferChannelId?: string;
      unbondingPeriod?: string;
      minRedemptionRate?: string;
      maxRedemptionRate?: string;
      lsmLiquidStakeEnabled?: boolean;
    } & { [K in Exclude<keyof I, keyof MsgRegisterHostZone>]: never }
  >(
    base?: I
  ): MsgRegisterHostZone;
  fromPartial<
    I_1 extends {
      connectionId?: string;
      bech32prefix?: string;
      hostDenom?: string;
      ibcDenom?: string;
      creator?: string;
      transferChannelId?: string;
      unbondingPeriod?: string;
      minRedemptionRate?: string;
      maxRedemptionRate?: string;
      lsmLiquidStakeEnabled?: boolean;
    } & {
      connectionId?: string;
      bech32prefix?: string;
      hostDenom?: string;
      ibcDenom?: string;
      creator?: string;
      transferChannelId?: string;
      unbondingPeriod?: string;
      minRedemptionRate?: string;
      maxRedemptionRate?: string;
      lsmLiquidStakeEnabled?: boolean;
    } & { [K_1 in Exclude<keyof I_1, keyof MsgRegisterHostZone>]: never }
  >(
    object: I_1
  ): MsgRegisterHostZone;
};
export declare const MsgRegisterHostZoneResponse: {
  encode(_: MsgRegisterHostZoneResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgRegisterHostZoneResponse;
  fromJSON(_: any): MsgRegisterHostZoneResponse;
  toJSON(_: MsgRegisterHostZoneResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgRegisterHostZoneResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgRegisterHostZoneResponse;
};
export declare const MsgClaimUndelegatedTokens: {
  encode(message: MsgClaimUndelegatedTokens, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgClaimUndelegatedTokens;
  fromJSON(object: any): MsgClaimUndelegatedTokens;
  toJSON(message: MsgClaimUndelegatedTokens): unknown;
  create<
    I extends {
      creator?: string;
      hostZoneId?: string;
      epoch?: string;
      sender?: string;
    } & {
      creator?: string;
      hostZoneId?: string;
      epoch?: string;
      sender?: string;
    } & { [K in Exclude<keyof I, keyof MsgClaimUndelegatedTokens>]: never }
  >(
    base?: I
  ): MsgClaimUndelegatedTokens;
  fromPartial<
    I_1 extends {
      creator?: string;
      hostZoneId?: string;
      epoch?: string;
      sender?: string;
    } & {
      creator?: string;
      hostZoneId?: string;
      epoch?: string;
      sender?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof MsgClaimUndelegatedTokens>]: never }
  >(
    object: I_1
  ): MsgClaimUndelegatedTokens;
};
export declare const MsgClaimUndelegatedTokensResponse: {
  encode(_: MsgClaimUndelegatedTokensResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgClaimUndelegatedTokensResponse;
  fromJSON(_: any): MsgClaimUndelegatedTokensResponse;
  toJSON(_: MsgClaimUndelegatedTokensResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgClaimUndelegatedTokensResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgClaimUndelegatedTokensResponse;
};
export declare const MsgRebalanceValidators: {
  encode(message: MsgRebalanceValidators, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgRebalanceValidators;
  fromJSON(object: any): MsgRebalanceValidators;
  toJSON(message: MsgRebalanceValidators): unknown;
  create<
    I extends {
      creator?: string;
      hostZone?: string;
      numRebalance?: string;
    } & {
      creator?: string;
      hostZone?: string;
      numRebalance?: string;
    } & { [K in Exclude<keyof I, keyof MsgRebalanceValidators>]: never }
  >(
    base?: I
  ): MsgRebalanceValidators;
  fromPartial<
    I_1 extends {
      creator?: string;
      hostZone?: string;
      numRebalance?: string;
    } & {
      creator?: string;
      hostZone?: string;
      numRebalance?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof MsgRebalanceValidators>]: never }
  >(
    object: I_1
  ): MsgRebalanceValidators;
};
export declare const MsgRebalanceValidatorsResponse: {
  encode(_: MsgRebalanceValidatorsResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgRebalanceValidatorsResponse;
  fromJSON(_: any): MsgRebalanceValidatorsResponse;
  toJSON(_: MsgRebalanceValidatorsResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgRebalanceValidatorsResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgRebalanceValidatorsResponse;
};
export declare const MsgAddValidators: {
  encode(message: MsgAddValidators, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgAddValidators;
  fromJSON(object: any): MsgAddValidators;
  toJSON(message: MsgAddValidators): unknown;
  create<
    I extends {
      creator?: string;
      hostZone?: string;
      validators?: {
        name?: string;
        address?: string;
        weight?: string;
        delegation?: string;
        slashQueryProgressTracker?: string;
        slashQueryCheckpoint?: string;
        sharesToTokensRate?: string;
        delegationChangesInProgress?: string;
        slashQueryInProgress?: boolean;
      }[];
    } & {
      creator?: string;
      hostZone?: string;
      validators?: {
        name?: string;
        address?: string;
        weight?: string;
        delegation?: string;
        slashQueryProgressTracker?: string;
        slashQueryCheckpoint?: string;
        sharesToTokensRate?: string;
        delegationChangesInProgress?: string;
        slashQueryInProgress?: boolean;
      }[] &
        ({
          name?: string;
          address?: string;
          weight?: string;
          delegation?: string;
          slashQueryProgressTracker?: string;
          slashQueryCheckpoint?: string;
          sharesToTokensRate?: string;
          delegationChangesInProgress?: string;
          slashQueryInProgress?: boolean;
        } & {
          name?: string;
          address?: string;
          weight?: string;
          delegation?: string;
          slashQueryProgressTracker?: string;
          slashQueryCheckpoint?: string;
          sharesToTokensRate?: string;
          delegationChangesInProgress?: string;
          slashQueryInProgress?: boolean;
        } & {
          [K in Exclude<keyof I["validators"][number], keyof Validator>]: never;
        })[] & {
          [K_1 in Exclude<
            keyof I["validators"],
            keyof {
              name?: string;
              address?: string;
              weight?: string;
              delegation?: string;
              slashQueryProgressTracker?: string;
              slashQueryCheckpoint?: string;
              sharesToTokensRate?: string;
              delegationChangesInProgress?: string;
              slashQueryInProgress?: boolean;
            }[]
          >]: never;
        };
    } & { [K_2 in Exclude<keyof I, keyof MsgAddValidators>]: never }
  >(
    base?: I
  ): MsgAddValidators;
  fromPartial<
    I_1 extends {
      creator?: string;
      hostZone?: string;
      validators?: {
        name?: string;
        address?: string;
        weight?: string;
        delegation?: string;
        slashQueryProgressTracker?: string;
        slashQueryCheckpoint?: string;
        sharesToTokensRate?: string;
        delegationChangesInProgress?: string;
        slashQueryInProgress?: boolean;
      }[];
    } & {
      creator?: string;
      hostZone?: string;
      validators?: {
        name?: string;
        address?: string;
        weight?: string;
        delegation?: string;
        slashQueryProgressTracker?: string;
        slashQueryCheckpoint?: string;
        sharesToTokensRate?: string;
        delegationChangesInProgress?: string;
        slashQueryInProgress?: boolean;
      }[] &
        ({
          name?: string;
          address?: string;
          weight?: string;
          delegation?: string;
          slashQueryProgressTracker?: string;
          slashQueryCheckpoint?: string;
          sharesToTokensRate?: string;
          delegationChangesInProgress?: string;
          slashQueryInProgress?: boolean;
        } & {
          name?: string;
          address?: string;
          weight?: string;
          delegation?: string;
          slashQueryProgressTracker?: string;
          slashQueryCheckpoint?: string;
          sharesToTokensRate?: string;
          delegationChangesInProgress?: string;
          slashQueryInProgress?: boolean;
        } & {
          [K_3 in Exclude<
            keyof I_1["validators"][number],
            keyof Validator
          >]: never;
        })[] & {
          [K_4 in Exclude<
            keyof I_1["validators"],
            keyof {
              name?: string;
              address?: string;
              weight?: string;
              delegation?: string;
              slashQueryProgressTracker?: string;
              slashQueryCheckpoint?: string;
              sharesToTokensRate?: string;
              delegationChangesInProgress?: string;
              slashQueryInProgress?: boolean;
            }[]
          >]: never;
        };
    } & { [K_5 in Exclude<keyof I_1, keyof MsgAddValidators>]: never }
  >(
    object: I_1
  ): MsgAddValidators;
};
export declare const MsgAddValidatorsResponse: {
  encode(_: MsgAddValidatorsResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgAddValidatorsResponse;
  fromJSON(_: any): MsgAddValidatorsResponse;
  toJSON(_: MsgAddValidatorsResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgAddValidatorsResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgAddValidatorsResponse;
};
export declare const MsgChangeValidatorWeight: {
  encode(message: MsgChangeValidatorWeight, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgChangeValidatorWeight;
  fromJSON(object: any): MsgChangeValidatorWeight;
  toJSON(message: MsgChangeValidatorWeight): unknown;
  create<
    I extends {
      creator?: string;
      hostZone?: string;
      valAddr?: string;
      weight?: string;
    } & {
      creator?: string;
      hostZone?: string;
      valAddr?: string;
      weight?: string;
    } & { [K in Exclude<keyof I, keyof MsgChangeValidatorWeight>]: never }
  >(
    base?: I
  ): MsgChangeValidatorWeight;
  fromPartial<
    I_1 extends {
      creator?: string;
      hostZone?: string;
      valAddr?: string;
      weight?: string;
    } & {
      creator?: string;
      hostZone?: string;
      valAddr?: string;
      weight?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof MsgChangeValidatorWeight>]: never }
  >(
    object: I_1
  ): MsgChangeValidatorWeight;
};
export declare const MsgChangeValidatorWeightResponse: {
  encode(_: MsgChangeValidatorWeightResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgChangeValidatorWeightResponse;
  fromJSON(_: any): MsgChangeValidatorWeightResponse;
  toJSON(_: MsgChangeValidatorWeightResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgChangeValidatorWeightResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgChangeValidatorWeightResponse;
};
export declare const MsgDeleteValidator: {
  encode(message: MsgDeleteValidator, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgDeleteValidator;
  fromJSON(object: any): MsgDeleteValidator;
  toJSON(message: MsgDeleteValidator): unknown;
  create<
    I extends {
      creator?: string;
      hostZone?: string;
      valAddr?: string;
    } & {
      creator?: string;
      hostZone?: string;
      valAddr?: string;
    } & { [K in Exclude<keyof I, keyof MsgDeleteValidator>]: never }
  >(
    base?: I
  ): MsgDeleteValidator;
  fromPartial<
    I_1 extends {
      creator?: string;
      hostZone?: string;
      valAddr?: string;
    } & {
      creator?: string;
      hostZone?: string;
      valAddr?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof MsgDeleteValidator>]: never }
  >(
    object: I_1
  ): MsgDeleteValidator;
};
export declare const MsgDeleteValidatorResponse: {
  encode(_: MsgDeleteValidatorResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgDeleteValidatorResponse;
  fromJSON(_: any): MsgDeleteValidatorResponse;
  toJSON(_: MsgDeleteValidatorResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgDeleteValidatorResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgDeleteValidatorResponse;
};
export declare const MsgRestoreInterchainAccount: {
  encode(message: MsgRestoreInterchainAccount, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgRestoreInterchainAccount;
  fromJSON(object: any): MsgRestoreInterchainAccount;
  toJSON(message: MsgRestoreInterchainAccount): unknown;
  create<
    I extends {
      creator?: string;
      chainId?: string;
      accountType?: ICAAccountType;
    } & {
      creator?: string;
      chainId?: string;
      accountType?: ICAAccountType;
    } & { [K in Exclude<keyof I, keyof MsgRestoreInterchainAccount>]: never }
  >(
    base?: I
  ): MsgRestoreInterchainAccount;
  fromPartial<
    I_1 extends {
      creator?: string;
      chainId?: string;
      accountType?: ICAAccountType;
    } & {
      creator?: string;
      chainId?: string;
      accountType?: ICAAccountType;
    } & {
      [K_1 in Exclude<keyof I_1, keyof MsgRestoreInterchainAccount>]: never;
    }
  >(
    object: I_1
  ): MsgRestoreInterchainAccount;
};
export declare const MsgRestoreInterchainAccountResponse: {
  encode(
    _: MsgRestoreInterchainAccountResponse,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgRestoreInterchainAccountResponse;
  fromJSON(_: any): MsgRestoreInterchainAccountResponse;
  toJSON(_: MsgRestoreInterchainAccountResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgRestoreInterchainAccountResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgRestoreInterchainAccountResponse;
};
export declare const MsgUpdateValidatorSharesExchRate: {
  encode(
    message: MsgUpdateValidatorSharesExchRate,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgUpdateValidatorSharesExchRate;
  fromJSON(object: any): MsgUpdateValidatorSharesExchRate;
  toJSON(message: MsgUpdateValidatorSharesExchRate): unknown;
  create<
    I extends {
      creator?: string;
      chainId?: string;
      valoper?: string;
    } & {
      creator?: string;
      chainId?: string;
      valoper?: string;
    } & {
      [K in Exclude<keyof I, keyof MsgUpdateValidatorSharesExchRate>]: never;
    }
  >(
    base?: I
  ): MsgUpdateValidatorSharesExchRate;
  fromPartial<
    I_1 extends {
      creator?: string;
      chainId?: string;
      valoper?: string;
    } & {
      creator?: string;
      chainId?: string;
      valoper?: string;
    } & {
      [K_1 in Exclude<
        keyof I_1,
        keyof MsgUpdateValidatorSharesExchRate
      >]: never;
    }
  >(
    object: I_1
  ): MsgUpdateValidatorSharesExchRate;
};
export declare const MsgUpdateValidatorSharesExchRateResponse: {
  encode(
    _: MsgUpdateValidatorSharesExchRateResponse,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgUpdateValidatorSharesExchRateResponse;
  fromJSON(_: any): MsgUpdateValidatorSharesExchRateResponse;
  toJSON(_: MsgUpdateValidatorSharesExchRateResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgUpdateValidatorSharesExchRateResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgUpdateValidatorSharesExchRateResponse;
};
export declare const MsgUndelegateHost: {
  encode(message: MsgUndelegateHost, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUndelegateHost;
  fromJSON(object: any): MsgUndelegateHost;
  toJSON(message: MsgUndelegateHost): unknown;
  create<
    I extends {
      creator?: string;
      amount?: string;
    } & {
      creator?: string;
      amount?: string;
    } & { [K in Exclude<keyof I, keyof MsgUndelegateHost>]: never }
  >(
    base?: I
  ): MsgUndelegateHost;
  fromPartial<
    I_1 extends {
      creator?: string;
      amount?: string;
    } & {
      creator?: string;
      amount?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof MsgUndelegateHost>]: never }
  >(
    object: I_1
  ): MsgUndelegateHost;
};
export declare const MsgUndelegateHostResponse: {
  encode(_: MsgUndelegateHostResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgUndelegateHostResponse;
  fromJSON(_: any): MsgUndelegateHostResponse;
  toJSON(_: MsgUndelegateHostResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgUndelegateHostResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgUndelegateHostResponse;
};
export declare const MsgCalibrateDelegation: {
  encode(message: MsgCalibrateDelegation, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgCalibrateDelegation;
  fromJSON(object: any): MsgCalibrateDelegation;
  toJSON(message: MsgCalibrateDelegation): unknown;
  create<
    I extends {
      creator?: string;
      chainId?: string;
      valoper?: string;
    } & {
      creator?: string;
      chainId?: string;
      valoper?: string;
    } & { [K in Exclude<keyof I, keyof MsgCalibrateDelegation>]: never }
  >(
    base?: I
  ): MsgCalibrateDelegation;
  fromPartial<
    I_1 extends {
      creator?: string;
      chainId?: string;
      valoper?: string;
    } & {
      creator?: string;
      chainId?: string;
      valoper?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof MsgCalibrateDelegation>]: never }
  >(
    object: I_1
  ): MsgCalibrateDelegation;
};
export declare const MsgCalibrateDelegationResponse: {
  encode(_: MsgCalibrateDelegationResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgCalibrateDelegationResponse;
  fromJSON(_: any): MsgCalibrateDelegationResponse;
  toJSON(_: MsgCalibrateDelegationResponse): unknown;
  create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never }>(
    base?: I
  ): MsgCalibrateDelegationResponse;
  fromPartial<
    I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never }
  >(
    _: I_1
  ): MsgCalibrateDelegationResponse;
};
/** Msg defines the Msg service. */
export interface Msg {
  LiquidStake(request: MsgLiquidStake): Promise<MsgLiquidStakeResponse>;
  LSMLiquidStake(
    request: MsgLSMLiquidStake
  ): Promise<MsgLSMLiquidStakeResponse>;
  RedeemStake(request: MsgRedeemStake): Promise<MsgRedeemStakeResponse>;
  RegisterHostZone(
    request: MsgRegisterHostZone
  ): Promise<MsgRegisterHostZoneResponse>;
  ClaimUndelegatedTokens(
    request: MsgClaimUndelegatedTokens
  ): Promise<MsgClaimUndelegatedTokensResponse>;
  RebalanceValidators(
    request: MsgRebalanceValidators
  ): Promise<MsgRebalanceValidatorsResponse>;
  AddValidators(request: MsgAddValidators): Promise<MsgAddValidatorsResponse>;
  ChangeValidatorWeight(
    request: MsgChangeValidatorWeight
  ): Promise<MsgChangeValidatorWeightResponse>;
  DeleteValidator(
    request: MsgDeleteValidator
  ): Promise<MsgDeleteValidatorResponse>;
  RestoreInterchainAccount(
    request: MsgRestoreInterchainAccount
  ): Promise<MsgRestoreInterchainAccountResponse>;
  UpdateValidatorSharesExchRate(
    request: MsgUpdateValidatorSharesExchRate
  ): Promise<MsgUpdateValidatorSharesExchRateResponse>;
  CalibrateDelegation(
    request: MsgCalibrateDelegation
  ): Promise<MsgCalibrateDelegationResponse>;
  ClearBalance(request: MsgClearBalance): Promise<MsgClearBalanceResponse>;
  UndelegateHost(
    request: MsgUndelegateHost
  ): Promise<MsgUndelegateHostResponse>;
  UpdateInnerRedemptionRateBounds(
    request: MsgUpdateInnerRedemptionRateBounds
  ): Promise<MsgUpdateInnerRedemptionRateBoundsResponse>;
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

import _m0 from "protobufjs/minimal";
export declare const protobufPackage = "stride.stakedym";
/**
 * Status fields for a delegation record
 * Note: There is an important assumption here that tokens in the deposit
 * account should not be tracked by these records. The record is created as soon
 * as the tokens leave stride
 * Additionally, the GetActiveDelegationRecords query filters for records that
 * are either TRANSFER_IN_PROGERSS or DELEGATION_QUEUE. If a new active status
 * is added, the keeper must be modified
 */
export declare enum DelegationRecordStatus {
  /**
   * TRANSFER_IN_PROGRESS - TRANSFER_IN_PROGRESS indicates the native tokens are being sent from the
   * deposit account to the delegation account
   */
  TRANSFER_IN_PROGRESS = 0,
  /**
   * TRANSFER_FAILED - TRANSFER_FAILED indicates that the transfer either timed out or was an ack
   * failure
   */
  TRANSFER_FAILED = 1,
  /**
   * DELEGATION_QUEUE - DELEGATION_QUEUE indicates the tokens have landed on the host zone and are
   * ready to be delegated
   */
  DELEGATION_QUEUE = 2,
  /** DELEGATION_COMPLETE - DELEGATION_COMPLETE indicates the delegation has been completed */
  DELEGATION_COMPLETE = 3,
  UNRECOGNIZED = -1,
}
export declare function delegationRecordStatusFromJSON(
  object: any
): DelegationRecordStatus;
export declare function delegationRecordStatusToJSON(
  object: DelegationRecordStatus
): string;
/** Status fields for an unbonding record */
export declare enum UnbondingRecordStatus {
  /**
   * ACCUMULATING_REDEMPTIONS - ACCUMULATING_REDEMPTIONS indicates redemptions are still being accumulated
   * on this record
   */
  ACCUMULATING_REDEMPTIONS = 0,
  /**
   * UNBONDING_QUEUE - UNBONDING_QUEUE indicates the unbond amount for this epoch has been froze
   * and the tokens are ready to be unbonded on the host zone
   */
  UNBONDING_QUEUE = 1,
  /**
   * UNBONDING_IN_PROGRESS - UNBONDING_IN_PROGRESS indicates the unbonding is currently in progress on
   * the host zone
   */
  UNBONDING_IN_PROGRESS = 2,
  /**
   * UNBONDED - UNBONDED indicates the unbonding is finished on the host zone and the
   * tokens are still in the delegation account
   */
  UNBONDED = 3,
  /**
   * CLAIMABLE - CLAIMABLE indicates the unbonded tokens have been swept to stride and are
   * ready to be distributed to users
   */
  CLAIMABLE = 4,
  /** CLAIMED - CLAIMED indicates the full unbonding cycle has been completed */
  CLAIMED = 5,
  UNRECOGNIZED = -1,
}
export declare function unbondingRecordStatusFromJSON(
  object: any
): UnbondingRecordStatus;
export declare function unbondingRecordStatusToJSON(
  object: UnbondingRecordStatus
): string;
export interface HostZone {
  /** Chain ID */
  chainId: string;
  /** Native token denom on the host zone (e.g. adym) */
  nativeTokenDenom: string;
  /** IBC denom of the native token as it lives on stride (e.g. ibc/...) */
  nativeTokenIbcDenom: string;
  /** Transfer channel ID from stride to the host zone */
  transferChannelId: string;
  /** Operator controlled delegation address on the host zone */
  delegationAddress: string;
  /** Operator controlled reward address on the host zone */
  rewardAddress: string;
  /** Deposit address on stride */
  depositAddress: string;
  /** Redemption address on stride */
  redemptionAddress: string;
  /** Claim address on stride */
  claimAddress: string;
  /** operator address set by safe, on stride */
  operatorAddressOnStride: string;
  /** admin address set upon host zone creation,  on stride */
  safeAddressOnStride: string;
  /** Previous redemption rate */
  lastRedemptionRate: string;
  /** Current redemption rate */
  redemptionRate: string;
  /** Min outer redemption rate - adjusted by governance */
  minRedemptionRate: string;
  /** Max outer redemption rate - adjusted by governance */
  maxRedemptionRate: string;
  /** Min inner redemption rate - adjusted by controller */
  minInnerRedemptionRate: string;
  /** Max inner redemption rate - adjusted by controller */
  maxInnerRedemptionRate: string;
  /** Total delegated balance on the host zone delegation account */
  delegatedBalance: string;
  /** The undelegation period for Dymension in days */
  unbondingPeriodSeconds: string;
  /** Indicates whether the host zone has been halted */
  halted: boolean;
}
/**
 * DelegationRecords track the aggregate liquid stakes and delegations
 * for a given epoch
 * Note: There is an important assumption here that tokens in the deposit
 * account should not be tracked by these records. The record is created as soon
 * as the tokens leave stride
 */
export interface DelegationRecord {
  /** Deposit record unique ID */
  id: string;
  /** The amount of native tokens that should be delegated */
  nativeAmount: string;
  /** The status indicating the point in the delegation's lifecycle */
  status: DelegationRecordStatus;
  /** The tx hash of the delegation on the host zone */
  txHash: string;
}
/** UnbondingRecords track the aggregate unbondings across an epoch */
export interface UnbondingRecord {
  /** Unbonding record ID */
  id: string;
  /** The status indicating the point in the delegation's lifecycle */
  status: UnbondingRecordStatus;
  /** The amount of stTokens that were redeemed */
  stTokenAmount: string;
  /** The corresponding amount of native tokens that should be unbonded */
  nativeAmount: string;
  /** The Unix timestamp (in seconds) at which the unbonding completes */
  unbondingCompletionTimeSeconds: string;
  /** The tx hash of the undelegation on the host zone */
  undelegationTxHash: string;
  /** The tx hash of the unbonded token sweep on the host zone */
  unbondedTokenSweepTxHash: string;
}
/** RedemptionRecords track an individual user's redemption claims */
export interface RedemptionRecord {
  /** Unbonding record ID */
  unbondingRecordId: string;
  /** Redeemer */
  redeemer: string;
  /** The amount of stTokens that were redeemed */
  stTokenAmount: string;
  /** The corresponding amount of native tokens that should be unbonded */
  nativeAmount: string;
}
/** SlashRecords log adjustments to the delegated balance */
export interface SlashRecord {
  /** The slash record monotonically increasing ID */
  id: string;
  /**
   * The Unix timestamp (in seconds) when the slash adjustment was processed on
   * stride
   */
  time: string;
  /** The delta by which the total delegated amount changed from slash */
  nativeAmount: string;
  /** The address (or addresses) of the validator that was slashed */
  validatorAddress: string;
}
export declare const HostZone: {
  encode(message: HostZone, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): HostZone;
  fromJSON(object: any): HostZone;
  toJSON(message: HostZone): unknown;
  create<
    I extends {
      chainId?: string;
      nativeTokenDenom?: string;
      nativeTokenIbcDenom?: string;
      transferChannelId?: string;
      delegationAddress?: string;
      rewardAddress?: string;
      depositAddress?: string;
      redemptionAddress?: string;
      claimAddress?: string;
      operatorAddressOnStride?: string;
      safeAddressOnStride?: string;
      lastRedemptionRate?: string;
      redemptionRate?: string;
      minRedemptionRate?: string;
      maxRedemptionRate?: string;
      minInnerRedemptionRate?: string;
      maxInnerRedemptionRate?: string;
      delegatedBalance?: string;
      unbondingPeriodSeconds?: string;
      halted?: boolean;
    } & {
      chainId?: string;
      nativeTokenDenom?: string;
      nativeTokenIbcDenom?: string;
      transferChannelId?: string;
      delegationAddress?: string;
      rewardAddress?: string;
      depositAddress?: string;
      redemptionAddress?: string;
      claimAddress?: string;
      operatorAddressOnStride?: string;
      safeAddressOnStride?: string;
      lastRedemptionRate?: string;
      redemptionRate?: string;
      minRedemptionRate?: string;
      maxRedemptionRate?: string;
      minInnerRedemptionRate?: string;
      maxInnerRedemptionRate?: string;
      delegatedBalance?: string;
      unbondingPeriodSeconds?: string;
      halted?: boolean;
    } & { [K in Exclude<keyof I, keyof HostZone>]: never }
  >(
    base?: I
  ): HostZone;
  fromPartial<
    I_1 extends {
      chainId?: string;
      nativeTokenDenom?: string;
      nativeTokenIbcDenom?: string;
      transferChannelId?: string;
      delegationAddress?: string;
      rewardAddress?: string;
      depositAddress?: string;
      redemptionAddress?: string;
      claimAddress?: string;
      operatorAddressOnStride?: string;
      safeAddressOnStride?: string;
      lastRedemptionRate?: string;
      redemptionRate?: string;
      minRedemptionRate?: string;
      maxRedemptionRate?: string;
      minInnerRedemptionRate?: string;
      maxInnerRedemptionRate?: string;
      delegatedBalance?: string;
      unbondingPeriodSeconds?: string;
      halted?: boolean;
    } & {
      chainId?: string;
      nativeTokenDenom?: string;
      nativeTokenIbcDenom?: string;
      transferChannelId?: string;
      delegationAddress?: string;
      rewardAddress?: string;
      depositAddress?: string;
      redemptionAddress?: string;
      claimAddress?: string;
      operatorAddressOnStride?: string;
      safeAddressOnStride?: string;
      lastRedemptionRate?: string;
      redemptionRate?: string;
      minRedemptionRate?: string;
      maxRedemptionRate?: string;
      minInnerRedemptionRate?: string;
      maxInnerRedemptionRate?: string;
      delegatedBalance?: string;
      unbondingPeriodSeconds?: string;
      halted?: boolean;
    } & { [K_1 in Exclude<keyof I_1, keyof HostZone>]: never }
  >(
    object: I_1
  ): HostZone;
};
export declare const DelegationRecord: {
  encode(message: DelegationRecord, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): DelegationRecord;
  fromJSON(object: any): DelegationRecord;
  toJSON(message: DelegationRecord): unknown;
  create<
    I extends {
      id?: string;
      nativeAmount?: string;
      status?: DelegationRecordStatus;
      txHash?: string;
    } & {
      id?: string;
      nativeAmount?: string;
      status?: DelegationRecordStatus;
      txHash?: string;
    } & { [K in Exclude<keyof I, keyof DelegationRecord>]: never }
  >(
    base?: I
  ): DelegationRecord;
  fromPartial<
    I_1 extends {
      id?: string;
      nativeAmount?: string;
      status?: DelegationRecordStatus;
      txHash?: string;
    } & {
      id?: string;
      nativeAmount?: string;
      status?: DelegationRecordStatus;
      txHash?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof DelegationRecord>]: never }
  >(
    object: I_1
  ): DelegationRecord;
};
export declare const UnbondingRecord: {
  encode(message: UnbondingRecord, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): UnbondingRecord;
  fromJSON(object: any): UnbondingRecord;
  toJSON(message: UnbondingRecord): unknown;
  create<
    I extends {
      id?: string;
      status?: UnbondingRecordStatus;
      stTokenAmount?: string;
      nativeAmount?: string;
      unbondingCompletionTimeSeconds?: string;
      undelegationTxHash?: string;
      unbondedTokenSweepTxHash?: string;
    } & {
      id?: string;
      status?: UnbondingRecordStatus;
      stTokenAmount?: string;
      nativeAmount?: string;
      unbondingCompletionTimeSeconds?: string;
      undelegationTxHash?: string;
      unbondedTokenSweepTxHash?: string;
    } & { [K in Exclude<keyof I, keyof UnbondingRecord>]: never }
  >(
    base?: I
  ): UnbondingRecord;
  fromPartial<
    I_1 extends {
      id?: string;
      status?: UnbondingRecordStatus;
      stTokenAmount?: string;
      nativeAmount?: string;
      unbondingCompletionTimeSeconds?: string;
      undelegationTxHash?: string;
      unbondedTokenSweepTxHash?: string;
    } & {
      id?: string;
      status?: UnbondingRecordStatus;
      stTokenAmount?: string;
      nativeAmount?: string;
      unbondingCompletionTimeSeconds?: string;
      undelegationTxHash?: string;
      unbondedTokenSweepTxHash?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof UnbondingRecord>]: never }
  >(
    object: I_1
  ): UnbondingRecord;
};
export declare const RedemptionRecord: {
  encode(message: RedemptionRecord, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): RedemptionRecord;
  fromJSON(object: any): RedemptionRecord;
  toJSON(message: RedemptionRecord): unknown;
  create<
    I extends {
      unbondingRecordId?: string;
      redeemer?: string;
      stTokenAmount?: string;
      nativeAmount?: string;
    } & {
      unbondingRecordId?: string;
      redeemer?: string;
      stTokenAmount?: string;
      nativeAmount?: string;
    } & { [K in Exclude<keyof I, keyof RedemptionRecord>]: never }
  >(
    base?: I
  ): RedemptionRecord;
  fromPartial<
    I_1 extends {
      unbondingRecordId?: string;
      redeemer?: string;
      stTokenAmount?: string;
      nativeAmount?: string;
    } & {
      unbondingRecordId?: string;
      redeemer?: string;
      stTokenAmount?: string;
      nativeAmount?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof RedemptionRecord>]: never }
  >(
    object: I_1
  ): RedemptionRecord;
};
export declare const SlashRecord: {
  encode(message: SlashRecord, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): SlashRecord;
  fromJSON(object: any): SlashRecord;
  toJSON(message: SlashRecord): unknown;
  create<
    I extends {
      id?: string;
      time?: string;
      nativeAmount?: string;
      validatorAddress?: string;
    } & {
      id?: string;
      time?: string;
      nativeAmount?: string;
      validatorAddress?: string;
    } & { [K in Exclude<keyof I, keyof SlashRecord>]: never }
  >(
    base?: I
  ): SlashRecord;
  fromPartial<
    I_1 extends {
      id?: string;
      time?: string;
      nativeAmount?: string;
      validatorAddress?: string;
    } & {
      id?: string;
      time?: string;
      nativeAmount?: string;
      validatorAddress?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof SlashRecord>]: never }
  >(
    object: I_1
  ): SlashRecord;
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

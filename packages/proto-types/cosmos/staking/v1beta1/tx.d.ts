import _m0 from "protobufjs/minimal";
import { Any } from "../../../google/protobuf/any";
import { Coin } from "../../base/v1beta1/coin";
import { CommissionRates, Description } from "./staking";
export declare const protobufPackage = "cosmos.staking.v1beta1";
/** MsgCreateValidator defines a SDK message for creating a new validator. */
export interface MsgCreateValidator {
    description: Description | undefined;
    commission: CommissionRates | undefined;
    minSelfDelegation: string;
    delegatorAddress: string;
    validatorAddress: string;
    pubkey: Any | undefined;
    value: Coin | undefined;
}
/** MsgCreateValidatorResponse defines the Msg/CreateValidator response type. */
export interface MsgCreateValidatorResponse {
}
/** MsgEditValidator defines a SDK message for editing an existing validator. */
export interface MsgEditValidator {
    description: Description | undefined;
    validatorAddress: string;
    /**
     * We pass a reference to the new commission rate and min self delegation as
     * it's not mandatory to update. If not updated, the deserialized rate will be
     * zero with no way to distinguish if an update was intended.
     * REF: #2373
     */
    commissionRate: string;
    minSelfDelegation: string;
}
/** MsgEditValidatorResponse defines the Msg/EditValidator response type. */
export interface MsgEditValidatorResponse {
}
/**
 * MsgDelegate defines a SDK message for performing a delegation of coins
 * from a delegator to a validator.
 */
export interface MsgDelegate {
    delegatorAddress: string;
    validatorAddress: string;
    amount: Coin | undefined;
}
/** MsgDelegateResponse defines the Msg/Delegate response type. */
export interface MsgDelegateResponse {
}
/**
 * MsgBeginRedelegate defines a SDK message for performing a redelegation
 * of coins from a delegator and source validator to a destination validator.
 */
export interface MsgBeginRedelegate {
    delegatorAddress: string;
    validatorSrcAddress: string;
    validatorDstAddress: string;
    amount: Coin | undefined;
}
/** MsgBeginRedelegateResponse defines the Msg/BeginRedelegate response type. */
export interface MsgBeginRedelegateResponse {
    completionTime: Date | undefined;
}
/**
 * MsgUndelegate defines a SDK message for performing an undelegation from a
 * delegate and a validator.
 */
export interface MsgUndelegate {
    delegatorAddress: string;
    validatorAddress: string;
    amount: Coin | undefined;
}
/** MsgUndelegateResponse defines the Msg/Undelegate response type. */
export interface MsgUndelegateResponse {
    completionTime: Date | undefined;
}
export declare const MsgCreateValidator: {
    encode(message: MsgCreateValidator, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgCreateValidator;
    fromJSON(object: any): MsgCreateValidator;
    toJSON(message: MsgCreateValidator): unknown;
    create<I extends {
        description?: {
            moniker?: string;
            identity?: string;
            website?: string;
            securityContact?: string;
            details?: string;
        };
        commission?: {
            rate?: string;
            maxRate?: string;
            maxChangeRate?: string;
        };
        minSelfDelegation?: string;
        delegatorAddress?: string;
        validatorAddress?: string;
        pubkey?: {
            typeUrl?: string;
            value?: Uint8Array;
        };
        value?: {
            denom?: string;
            amount?: string;
        };
    } & {
        description?: {
            moniker?: string;
            identity?: string;
            website?: string;
            securityContact?: string;
            details?: string;
        } & {
            moniker?: string;
            identity?: string;
            website?: string;
            securityContact?: string;
            details?: string;
        } & { [K in Exclude<keyof I["description"], keyof Description>]: never; };
        commission?: {
            rate?: string;
            maxRate?: string;
            maxChangeRate?: string;
        } & {
            rate?: string;
            maxRate?: string;
            maxChangeRate?: string;
        } & { [K_1 in Exclude<keyof I["commission"], keyof CommissionRates>]: never; };
        minSelfDelegation?: string;
        delegatorAddress?: string;
        validatorAddress?: string;
        pubkey?: {
            typeUrl?: string;
            value?: Uint8Array;
        } & {
            typeUrl?: string;
            value?: Uint8Array;
        } & { [K_2 in Exclude<keyof I["pubkey"], keyof Any>]: never; };
        value?: {
            denom?: string;
            amount?: string;
        } & {
            denom?: string;
            amount?: string;
        } & { [K_3 in Exclude<keyof I["value"], keyof Coin>]: never; };
    } & { [K_4 in Exclude<keyof I, keyof MsgCreateValidator>]: never; }>(base?: I): MsgCreateValidator;
    fromPartial<I_1 extends {
        description?: {
            moniker?: string;
            identity?: string;
            website?: string;
            securityContact?: string;
            details?: string;
        };
        commission?: {
            rate?: string;
            maxRate?: string;
            maxChangeRate?: string;
        };
        minSelfDelegation?: string;
        delegatorAddress?: string;
        validatorAddress?: string;
        pubkey?: {
            typeUrl?: string;
            value?: Uint8Array;
        };
        value?: {
            denom?: string;
            amount?: string;
        };
    } & {
        description?: {
            moniker?: string;
            identity?: string;
            website?: string;
            securityContact?: string;
            details?: string;
        } & {
            moniker?: string;
            identity?: string;
            website?: string;
            securityContact?: string;
            details?: string;
        } & { [K_5 in Exclude<keyof I_1["description"], keyof Description>]: never; };
        commission?: {
            rate?: string;
            maxRate?: string;
            maxChangeRate?: string;
        } & {
            rate?: string;
            maxRate?: string;
            maxChangeRate?: string;
        } & { [K_6 in Exclude<keyof I_1["commission"], keyof CommissionRates>]: never; };
        minSelfDelegation?: string;
        delegatorAddress?: string;
        validatorAddress?: string;
        pubkey?: {
            typeUrl?: string;
            value?: Uint8Array;
        } & {
            typeUrl?: string;
            value?: Uint8Array;
        } & { [K_7 in Exclude<keyof I_1["pubkey"], keyof Any>]: never; };
        value?: {
            denom?: string;
            amount?: string;
        } & {
            denom?: string;
            amount?: string;
        } & { [K_8 in Exclude<keyof I_1["value"], keyof Coin>]: never; };
    } & { [K_9 in Exclude<keyof I_1, keyof MsgCreateValidator>]: never; }>(object: I_1): MsgCreateValidator;
};
export declare const MsgCreateValidatorResponse: {
    encode(_: MsgCreateValidatorResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgCreateValidatorResponse;
    fromJSON(_: any): MsgCreateValidatorResponse;
    toJSON(_: MsgCreateValidatorResponse): unknown;
    create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never; }>(base?: I): MsgCreateValidatorResponse;
    fromPartial<I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never; }>(_: I_1): MsgCreateValidatorResponse;
};
export declare const MsgEditValidator: {
    encode(message: MsgEditValidator, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgEditValidator;
    fromJSON(object: any): MsgEditValidator;
    toJSON(message: MsgEditValidator): unknown;
    create<I extends {
        description?: {
            moniker?: string;
            identity?: string;
            website?: string;
            securityContact?: string;
            details?: string;
        };
        validatorAddress?: string;
        commissionRate?: string;
        minSelfDelegation?: string;
    } & {
        description?: {
            moniker?: string;
            identity?: string;
            website?: string;
            securityContact?: string;
            details?: string;
        } & {
            moniker?: string;
            identity?: string;
            website?: string;
            securityContact?: string;
            details?: string;
        } & { [K in Exclude<keyof I["description"], keyof Description>]: never; };
        validatorAddress?: string;
        commissionRate?: string;
        minSelfDelegation?: string;
    } & { [K_1 in Exclude<keyof I, keyof MsgEditValidator>]: never; }>(base?: I): MsgEditValidator;
    fromPartial<I_1 extends {
        description?: {
            moniker?: string;
            identity?: string;
            website?: string;
            securityContact?: string;
            details?: string;
        };
        validatorAddress?: string;
        commissionRate?: string;
        minSelfDelegation?: string;
    } & {
        description?: {
            moniker?: string;
            identity?: string;
            website?: string;
            securityContact?: string;
            details?: string;
        } & {
            moniker?: string;
            identity?: string;
            website?: string;
            securityContact?: string;
            details?: string;
        } & { [K_2 in Exclude<keyof I_1["description"], keyof Description>]: never; };
        validatorAddress?: string;
        commissionRate?: string;
        minSelfDelegation?: string;
    } & { [K_3 in Exclude<keyof I_1, keyof MsgEditValidator>]: never; }>(object: I_1): MsgEditValidator;
};
export declare const MsgEditValidatorResponse: {
    encode(_: MsgEditValidatorResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgEditValidatorResponse;
    fromJSON(_: any): MsgEditValidatorResponse;
    toJSON(_: MsgEditValidatorResponse): unknown;
    create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never; }>(base?: I): MsgEditValidatorResponse;
    fromPartial<I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never; }>(_: I_1): MsgEditValidatorResponse;
};
export declare const MsgDelegate: {
    encode(message: MsgDelegate, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgDelegate;
    fromJSON(object: any): MsgDelegate;
    toJSON(message: MsgDelegate): unknown;
    create<I extends {
        delegatorAddress?: string;
        validatorAddress?: string;
        amount?: {
            denom?: string;
            amount?: string;
        };
    } & {
        delegatorAddress?: string;
        validatorAddress?: string;
        amount?: {
            denom?: string;
            amount?: string;
        } & {
            denom?: string;
            amount?: string;
        } & { [K in Exclude<keyof I["amount"], keyof Coin>]: never; };
    } & { [K_1 in Exclude<keyof I, keyof MsgDelegate>]: never; }>(base?: I): MsgDelegate;
    fromPartial<I_1 extends {
        delegatorAddress?: string;
        validatorAddress?: string;
        amount?: {
            denom?: string;
            amount?: string;
        };
    } & {
        delegatorAddress?: string;
        validatorAddress?: string;
        amount?: {
            denom?: string;
            amount?: string;
        } & {
            denom?: string;
            amount?: string;
        } & { [K_2 in Exclude<keyof I_1["amount"], keyof Coin>]: never; };
    } & { [K_3 in Exclude<keyof I_1, keyof MsgDelegate>]: never; }>(object: I_1): MsgDelegate;
};
export declare const MsgDelegateResponse: {
    encode(_: MsgDelegateResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgDelegateResponse;
    fromJSON(_: any): MsgDelegateResponse;
    toJSON(_: MsgDelegateResponse): unknown;
    create<I extends {} & {} & { [K in Exclude<keyof I, never>]: never; }>(base?: I): MsgDelegateResponse;
    fromPartial<I_1 extends {} & {} & { [K_1 in Exclude<keyof I_1, never>]: never; }>(_: I_1): MsgDelegateResponse;
};
export declare const MsgBeginRedelegate: {
    encode(message: MsgBeginRedelegate, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgBeginRedelegate;
    fromJSON(object: any): MsgBeginRedelegate;
    toJSON(message: MsgBeginRedelegate): unknown;
    create<I extends {
        delegatorAddress?: string;
        validatorSrcAddress?: string;
        validatorDstAddress?: string;
        amount?: {
            denom?: string;
            amount?: string;
        };
    } & {
        delegatorAddress?: string;
        validatorSrcAddress?: string;
        validatorDstAddress?: string;
        amount?: {
            denom?: string;
            amount?: string;
        } & {
            denom?: string;
            amount?: string;
        } & { [K in Exclude<keyof I["amount"], keyof Coin>]: never; };
    } & { [K_1 in Exclude<keyof I, keyof MsgBeginRedelegate>]: never; }>(base?: I): MsgBeginRedelegate;
    fromPartial<I_1 extends {
        delegatorAddress?: string;
        validatorSrcAddress?: string;
        validatorDstAddress?: string;
        amount?: {
            denom?: string;
            amount?: string;
        };
    } & {
        delegatorAddress?: string;
        validatorSrcAddress?: string;
        validatorDstAddress?: string;
        amount?: {
            denom?: string;
            amount?: string;
        } & {
            denom?: string;
            amount?: string;
        } & { [K_2 in Exclude<keyof I_1["amount"], keyof Coin>]: never; };
    } & { [K_3 in Exclude<keyof I_1, keyof MsgBeginRedelegate>]: never; }>(object: I_1): MsgBeginRedelegate;
};
export declare const MsgBeginRedelegateResponse: {
    encode(message: MsgBeginRedelegateResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgBeginRedelegateResponse;
    fromJSON(object: any): MsgBeginRedelegateResponse;
    toJSON(message: MsgBeginRedelegateResponse): unknown;
    create<I extends {
        completionTime?: Date | undefined;
    } & {
        completionTime?: Date | undefined;
    } & { [K in Exclude<keyof I, "completionTime">]: never; }>(base?: I): MsgBeginRedelegateResponse;
    fromPartial<I_1 extends {
        completionTime?: Date | undefined;
    } & {
        completionTime?: Date | undefined;
    } & { [K_1 in Exclude<keyof I_1, "completionTime">]: never; }>(object: I_1): MsgBeginRedelegateResponse;
};
export declare const MsgUndelegate: {
    encode(message: MsgUndelegate, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgUndelegate;
    fromJSON(object: any): MsgUndelegate;
    toJSON(message: MsgUndelegate): unknown;
    create<I extends {
        delegatorAddress?: string;
        validatorAddress?: string;
        amount?: {
            denom?: string;
            amount?: string;
        };
    } & {
        delegatorAddress?: string;
        validatorAddress?: string;
        amount?: {
            denom?: string;
            amount?: string;
        } & {
            denom?: string;
            amount?: string;
        } & { [K in Exclude<keyof I["amount"], keyof Coin>]: never; };
    } & { [K_1 in Exclude<keyof I, keyof MsgUndelegate>]: never; }>(base?: I): MsgUndelegate;
    fromPartial<I_1 extends {
        delegatorAddress?: string;
        validatorAddress?: string;
        amount?: {
            denom?: string;
            amount?: string;
        };
    } & {
        delegatorAddress?: string;
        validatorAddress?: string;
        amount?: {
            denom?: string;
            amount?: string;
        } & {
            denom?: string;
            amount?: string;
        } & { [K_2 in Exclude<keyof I_1["amount"], keyof Coin>]: never; };
    } & { [K_3 in Exclude<keyof I_1, keyof MsgUndelegate>]: never; }>(object: I_1): MsgUndelegate;
};
export declare const MsgUndelegateResponse: {
    encode(message: MsgUndelegateResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgUndelegateResponse;
    fromJSON(object: any): MsgUndelegateResponse;
    toJSON(message: MsgUndelegateResponse): unknown;
    create<I extends {
        completionTime?: Date | undefined;
    } & {
        completionTime?: Date | undefined;
    } & { [K in Exclude<keyof I, "completionTime">]: never; }>(base?: I): MsgUndelegateResponse;
    fromPartial<I_1 extends {
        completionTime?: Date | undefined;
    } & {
        completionTime?: Date | undefined;
    } & { [K_1 in Exclude<keyof I_1, "completionTime">]: never; }>(object: I_1): MsgUndelegateResponse;
};
/** Msg defines the staking Msg service. */
export interface Msg {
    /** CreateValidator defines a method for creating a new validator. */
    CreateValidator(request: MsgCreateValidator): Promise<MsgCreateValidatorResponse>;
    /** EditValidator defines a method for editing an existing validator. */
    EditValidator(request: MsgEditValidator): Promise<MsgEditValidatorResponse>;
    /**
     * Delegate defines a method for performing a delegation of coins
     * from a delegator to a validator.
     */
    Delegate(request: MsgDelegate): Promise<MsgDelegateResponse>;
    /**
     * BeginRedelegate defines a method for performing a redelegation
     * of coins from a delegator and source validator to a destination validator.
     */
    BeginRedelegate(request: MsgBeginRedelegate): Promise<MsgBeginRedelegateResponse>;
    /**
     * Undelegate defines a method for performing an undelegation from a
     * delegate and a validator.
     */
    Undelegate(request: MsgUndelegate): Promise<MsgUndelegateResponse>;
}
declare type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export declare type DeepPartial<T> = T extends Builtin ? T : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
declare type KeysOfUnion<T> = T extends T ? keyof T : never;
export declare type Exact<P, I extends P> = P extends Builtin ? P : P & {
    [K in keyof P]: Exact<P[K], I[K]>;
} & {
    [K in Exclude<keyof I, KeysOfUnion<P>>]: never;
};
export {};

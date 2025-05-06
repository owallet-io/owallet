import _m0 from "protobufjs/minimal";
export declare const protobufPackage = "circle.cctp.v1";
export interface MsgUpdateOwner {
  from: string;
  newOwner: string;
}
export interface MsgUpdateOwnerResponse {}
export interface MsgUpdateAttesterManager {
  from: string;
  newAttesterManager: string;
}
export interface MsgUpdateAttesterManagerResponse {}
export interface MsgUpdateTokenController {
  from: string;
  newTokenController: string;
}
export interface MsgUpdateTokenControllerResponse {}
export interface MsgUpdatePauser {
  from: string;
  newPauser: string;
}
export interface MsgUpdatePauserResponse {}
export interface MsgAcceptOwner {
  from: string;
}
export interface MsgAcceptOwnerResponse {}
export interface MsgEnableAttester {
  from: string;
  attester: string;
}
export interface MsgEnableAttesterResponse {}
export interface MsgDisableAttester {
  from: string;
  attester: string;
}
export interface MsgDisableAttesterResponse {}
export interface MsgPauseBurningAndMinting {
  from: string;
}
export interface MsgPauseBurningAndMintingResponse {}
export interface MsgUnpauseBurningAndMinting {
  from: string;
}
export interface MsgUnpauseBurningAndMintingResponse {}
export interface MsgPauseSendingAndReceivingMessages {
  from: string;
}
export interface MsgPauseSendingAndReceivingMessagesResponse {}
export interface MsgUnpauseSendingAndReceivingMessages {
  from: string;
}
export interface MsgUnpauseSendingAndReceivingMessagesResponse {}
export interface MsgUpdateMaxMessageBodySize {
  from: string;
  messageSize: string;
}
export interface MsgUpdateMaxMessageBodySizeResponse {}
export interface MsgSetMaxBurnAmountPerMessage {
  from: string;
  localToken: string;
  amount: string;
}
export interface MsgSetMaxBurnAmountPerMessageResponse {}
export interface MsgDepositForBurn {
  from: string;
  amount: string;
  destinationDomain: number;
  mintRecipient: Uint8Array;
  burnToken: string;
}
export interface MsgDepositForBurnResponse {
  nonce: string;
}
export interface MsgDepositForBurnWithCaller {
  from: string;
  amount: string;
  destinationDomain: number;
  mintRecipient: Uint8Array;
  burnToken: string;
  destinationCaller: Uint8Array;
}
export interface MsgDepositForBurnWithCallerResponse {
  nonce: string;
}
export interface MsgReplaceDepositForBurn {
  from: string;
  originalMessage: Uint8Array;
  originalAttestation: Uint8Array;
  newDestinationCaller: Uint8Array;
  newMintRecipient: Uint8Array;
}
export interface MsgReplaceDepositForBurnResponse {}
export interface MsgReceiveMessage {
  from: string;
  message: Uint8Array;
  attestation: Uint8Array;
}
export interface MsgReceiveMessageResponse {
  success: boolean;
}
export interface MsgSendMessage {
  from: string;
  destinationDomain: number;
  recipient: Uint8Array;
  messageBody: Uint8Array;
}
export interface MsgSendMessageResponse {
  nonce: string;
}
export interface MsgSendMessageWithCaller {
  from: string;
  destinationDomain: number;
  recipient: Uint8Array;
  messageBody: Uint8Array;
  destinationCaller: Uint8Array;
}
export interface MsgSendMessageWithCallerResponse {
  nonce: string;
}
export interface MsgReplaceMessage {
  from: string;
  originalMessage: Uint8Array;
  originalAttestation: Uint8Array;
  newMessageBody: Uint8Array;
  newDestinationCaller: Uint8Array;
}
export interface MsgReplaceMessageResponse {}
export interface MsgUpdateSignatureThreshold {
  from: string;
  amount: number;
}
export interface MsgUpdateSignatureThresholdResponse {}
export interface MsgLinkTokenPair {
  from: string;
  remoteDomain: number;
  remoteToken: Uint8Array;
  localToken: string;
}
export interface MsgLinkTokenPairResponse {}
export interface MsgUnlinkTokenPair {
  from: string;
  remoteDomain: number;
  remoteToken: Uint8Array;
  localToken: string;
}
export interface MsgUnlinkTokenPairResponse {}
export interface MsgAddRemoteTokenMessenger {
  from: string;
  domainId: number;
  address: Uint8Array;
}
export interface MsgAddRemoteTokenMessengerResponse {}
export interface MsgRemoveRemoteTokenMessenger {
  from: string;
  domainId: number;
}
export interface MsgRemoveRemoteTokenMessengerResponse {}
export declare const MsgUpdateOwner: {
  encode(message: MsgUpdateOwner, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateOwner;
  fromJSON(object: any): MsgUpdateOwner;
  toJSON(message: MsgUpdateOwner): unknown;
  fromPartial<
    I extends {
      from?: string | undefined;
      newOwner?: string | undefined;
    } & {
      from?: string | undefined;
      newOwner?: string | undefined;
    } & Record<Exclude<keyof I, keyof MsgUpdateOwner>, never>
  >(
    object: I
  ): MsgUpdateOwner;
};
export declare const MsgUpdateOwnerResponse: {
  encode(_: MsgUpdateOwnerResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgUpdateOwnerResponse;
  fromJSON(_: any): MsgUpdateOwnerResponse;
  toJSON(_: MsgUpdateOwnerResponse): unknown;
  fromPartial<I extends {} & {} & Record<Exclude<keyof I, never>, never>>(
    _: I
  ): MsgUpdateOwnerResponse;
};
export declare const MsgUpdateAttesterManager: {
  encode(message: MsgUpdateAttesterManager, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgUpdateAttesterManager;
  fromJSON(object: any): MsgUpdateAttesterManager;
  toJSON(message: MsgUpdateAttesterManager): unknown;
  fromPartial<
    I extends {
      from?: string | undefined;
      newAttesterManager?: string | undefined;
    } & {
      from?: string | undefined;
      newAttesterManager?: string | undefined;
    } & Record<Exclude<keyof I, keyof MsgUpdateAttesterManager>, never>
  >(
    object: I
  ): MsgUpdateAttesterManager;
};
export declare const MsgUpdateAttesterManagerResponse: {
  encode(_: MsgUpdateAttesterManagerResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgUpdateAttesterManagerResponse;
  fromJSON(_: any): MsgUpdateAttesterManagerResponse;
  toJSON(_: MsgUpdateAttesterManagerResponse): unknown;
  fromPartial<I extends {} & {} & Record<Exclude<keyof I, never>, never>>(
    _: I
  ): MsgUpdateAttesterManagerResponse;
};
export declare const MsgUpdateTokenController: {
  encode(message: MsgUpdateTokenController, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgUpdateTokenController;
  fromJSON(object: any): MsgUpdateTokenController;
  toJSON(message: MsgUpdateTokenController): unknown;
  fromPartial<
    I extends {
      from?: string | undefined;
      newTokenController?: string | undefined;
    } & {
      from?: string | undefined;
      newTokenController?: string | undefined;
    } & Record<Exclude<keyof I, keyof MsgUpdateTokenController>, never>
  >(
    object: I
  ): MsgUpdateTokenController;
};
export declare const MsgUpdateTokenControllerResponse: {
  encode(_: MsgUpdateTokenControllerResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgUpdateTokenControllerResponse;
  fromJSON(_: any): MsgUpdateTokenControllerResponse;
  toJSON(_: MsgUpdateTokenControllerResponse): unknown;
  fromPartial<I extends {} & {} & Record<Exclude<keyof I, never>, never>>(
    _: I
  ): MsgUpdateTokenControllerResponse;
};
export declare const MsgUpdatePauser: {
  encode(message: MsgUpdatePauser, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdatePauser;
  fromJSON(object: any): MsgUpdatePauser;
  toJSON(message: MsgUpdatePauser): unknown;
  fromPartial<
    I extends {
      from?: string | undefined;
      newPauser?: string | undefined;
    } & {
      from?: string | undefined;
      newPauser?: string | undefined;
    } & Record<Exclude<keyof I, keyof MsgUpdatePauser>, never>
  >(
    object: I
  ): MsgUpdatePauser;
};
export declare const MsgUpdatePauserResponse: {
  encode(_: MsgUpdatePauserResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgUpdatePauserResponse;
  fromJSON(_: any): MsgUpdatePauserResponse;
  toJSON(_: MsgUpdatePauserResponse): unknown;
  fromPartial<I extends {} & {} & Record<Exclude<keyof I, never>, never>>(
    _: I
  ): MsgUpdatePauserResponse;
};
export declare const MsgAcceptOwner: {
  encode(message: MsgAcceptOwner, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgAcceptOwner;
  fromJSON(object: any): MsgAcceptOwner;
  toJSON(message: MsgAcceptOwner): unknown;
  fromPartial<
    I extends {
      from?: string | undefined;
    } & {
      from?: string | undefined;
    } & Record<Exclude<keyof I, "from">, never>
  >(
    object: I
  ): MsgAcceptOwner;
};
export declare const MsgAcceptOwnerResponse: {
  encode(_: MsgAcceptOwnerResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgAcceptOwnerResponse;
  fromJSON(_: any): MsgAcceptOwnerResponse;
  toJSON(_: MsgAcceptOwnerResponse): unknown;
  fromPartial<I extends {} & {} & Record<Exclude<keyof I, never>, never>>(
    _: I
  ): MsgAcceptOwnerResponse;
};
export declare const MsgEnableAttester: {
  encode(message: MsgEnableAttester, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgEnableAttester;
  fromJSON(object: any): MsgEnableAttester;
  toJSON(message: MsgEnableAttester): unknown;
  fromPartial<
    I extends {
      from?: string | undefined;
      attester?: string | undefined;
    } & {
      from?: string | undefined;
      attester?: string | undefined;
    } & Record<Exclude<keyof I, keyof MsgEnableAttester>, never>
  >(
    object: I
  ): MsgEnableAttester;
};
export declare const MsgEnableAttesterResponse: {
  encode(_: MsgEnableAttesterResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgEnableAttesterResponse;
  fromJSON(_: any): MsgEnableAttesterResponse;
  toJSON(_: MsgEnableAttesterResponse): unknown;
  fromPartial<I extends {} & {} & Record<Exclude<keyof I, never>, never>>(
    _: I
  ): MsgEnableAttesterResponse;
};
export declare const MsgDisableAttester: {
  encode(message: MsgDisableAttester, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgDisableAttester;
  fromJSON(object: any): MsgDisableAttester;
  toJSON(message: MsgDisableAttester): unknown;
  fromPartial<
    I extends {
      from?: string | undefined;
      attester?: string | undefined;
    } & {
      from?: string | undefined;
      attester?: string | undefined;
    } & Record<Exclude<keyof I, keyof MsgDisableAttester>, never>
  >(
    object: I
  ): MsgDisableAttester;
};
export declare const MsgDisableAttesterResponse: {
  encode(_: MsgDisableAttesterResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgDisableAttesterResponse;
  fromJSON(_: any): MsgDisableAttesterResponse;
  toJSON(_: MsgDisableAttesterResponse): unknown;
  fromPartial<I extends {} & {} & Record<Exclude<keyof I, never>, never>>(
    _: I
  ): MsgDisableAttesterResponse;
};
export declare const MsgPauseBurningAndMinting: {
  encode(message: MsgPauseBurningAndMinting, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgPauseBurningAndMinting;
  fromJSON(object: any): MsgPauseBurningAndMinting;
  toJSON(message: MsgPauseBurningAndMinting): unknown;
  fromPartial<
    I extends {
      from?: string | undefined;
    } & {
      from?: string | undefined;
    } & Record<Exclude<keyof I, "from">, never>
  >(
    object: I
  ): MsgPauseBurningAndMinting;
};
export declare const MsgPauseBurningAndMintingResponse: {
  encode(_: MsgPauseBurningAndMintingResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgPauseBurningAndMintingResponse;
  fromJSON(_: any): MsgPauseBurningAndMintingResponse;
  toJSON(_: MsgPauseBurningAndMintingResponse): unknown;
  fromPartial<I extends {} & {} & Record<Exclude<keyof I, never>, never>>(
    _: I
  ): MsgPauseBurningAndMintingResponse;
};
export declare const MsgUnpauseBurningAndMinting: {
  encode(message: MsgUnpauseBurningAndMinting, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgUnpauseBurningAndMinting;
  fromJSON(object: any): MsgUnpauseBurningAndMinting;
  toJSON(message: MsgUnpauseBurningAndMinting): unknown;
  fromPartial<
    I extends {
      from?: string | undefined;
    } & {
      from?: string | undefined;
    } & Record<Exclude<keyof I, "from">, never>
  >(
    object: I
  ): MsgUnpauseBurningAndMinting;
};
export declare const MsgUnpauseBurningAndMintingResponse: {
  encode(
    _: MsgUnpauseBurningAndMintingResponse,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgUnpauseBurningAndMintingResponse;
  fromJSON(_: any): MsgUnpauseBurningAndMintingResponse;
  toJSON(_: MsgUnpauseBurningAndMintingResponse): unknown;
  fromPartial<I extends {} & {} & Record<Exclude<keyof I, never>, never>>(
    _: I
  ): MsgUnpauseBurningAndMintingResponse;
};
export declare const MsgPauseSendingAndReceivingMessages: {
  encode(
    message: MsgPauseSendingAndReceivingMessages,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgPauseSendingAndReceivingMessages;
  fromJSON(object: any): MsgPauseSendingAndReceivingMessages;
  toJSON(message: MsgPauseSendingAndReceivingMessages): unknown;
  fromPartial<
    I extends {
      from?: string | undefined;
    } & {
      from?: string | undefined;
    } & Record<Exclude<keyof I, "from">, never>
  >(
    object: I
  ): MsgPauseSendingAndReceivingMessages;
};
export declare const MsgPauseSendingAndReceivingMessagesResponse: {
  encode(
    _: MsgPauseSendingAndReceivingMessagesResponse,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgPauseSendingAndReceivingMessagesResponse;
  fromJSON(_: any): MsgPauseSendingAndReceivingMessagesResponse;
  toJSON(_: MsgPauseSendingAndReceivingMessagesResponse): unknown;
  fromPartial<I extends {} & {} & Record<Exclude<keyof I, never>, never>>(
    _: I
  ): MsgPauseSendingAndReceivingMessagesResponse;
};
export declare const MsgUnpauseSendingAndReceivingMessages: {
  encode(
    message: MsgUnpauseSendingAndReceivingMessages,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgUnpauseSendingAndReceivingMessages;
  fromJSON(object: any): MsgUnpauseSendingAndReceivingMessages;
  toJSON(message: MsgUnpauseSendingAndReceivingMessages): unknown;
  fromPartial<
    I extends {
      from?: string | undefined;
    } & {
      from?: string | undefined;
    } & Record<Exclude<keyof I, "from">, never>
  >(
    object: I
  ): MsgUnpauseSendingAndReceivingMessages;
};
export declare const MsgUnpauseSendingAndReceivingMessagesResponse: {
  encode(
    _: MsgUnpauseSendingAndReceivingMessagesResponse,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgUnpauseSendingAndReceivingMessagesResponse;
  fromJSON(_: any): MsgUnpauseSendingAndReceivingMessagesResponse;
  toJSON(_: MsgUnpauseSendingAndReceivingMessagesResponse): unknown;
  fromPartial<I extends {} & {} & Record<Exclude<keyof I, never>, never>>(
    _: I
  ): MsgUnpauseSendingAndReceivingMessagesResponse;
};
export declare const MsgUpdateMaxMessageBodySize: {
  encode(message: MsgUpdateMaxMessageBodySize, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgUpdateMaxMessageBodySize;
  fromJSON(object: any): MsgUpdateMaxMessageBodySize;
  toJSON(message: MsgUpdateMaxMessageBodySize): unknown;
  fromPartial<
    I extends {
      from?: string | undefined;
      messageSize?: string | undefined;
    } & {
      from?: string | undefined;
      messageSize?: string | undefined;
    } & Record<Exclude<keyof I, keyof MsgUpdateMaxMessageBodySize>, never>
  >(
    object: I
  ): MsgUpdateMaxMessageBodySize;
};
export declare const MsgUpdateMaxMessageBodySizeResponse: {
  encode(
    _: MsgUpdateMaxMessageBodySizeResponse,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgUpdateMaxMessageBodySizeResponse;
  fromJSON(_: any): MsgUpdateMaxMessageBodySizeResponse;
  toJSON(_: MsgUpdateMaxMessageBodySizeResponse): unknown;
  fromPartial<I extends {} & {} & Record<Exclude<keyof I, never>, never>>(
    _: I
  ): MsgUpdateMaxMessageBodySizeResponse;
};
export declare const MsgSetMaxBurnAmountPerMessage: {
  encode(
    message: MsgSetMaxBurnAmountPerMessage,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSetMaxBurnAmountPerMessage;
  fromJSON(object: any): MsgSetMaxBurnAmountPerMessage;
  toJSON(message: MsgSetMaxBurnAmountPerMessage): unknown;
  fromPartial<
    I extends {
      from?: string | undefined;
      localToken?: string | undefined;
      amount?: string | undefined;
    } & {
      from?: string | undefined;
      localToken?: string | undefined;
      amount?: string | undefined;
    } & Record<Exclude<keyof I, keyof MsgSetMaxBurnAmountPerMessage>, never>
  >(
    object: I
  ): MsgSetMaxBurnAmountPerMessage;
};
export declare const MsgSetMaxBurnAmountPerMessageResponse: {
  encode(
    _: MsgSetMaxBurnAmountPerMessageResponse,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSetMaxBurnAmountPerMessageResponse;
  fromJSON(_: any): MsgSetMaxBurnAmountPerMessageResponse;
  toJSON(_: MsgSetMaxBurnAmountPerMessageResponse): unknown;
  fromPartial<I extends {} & {} & Record<Exclude<keyof I, never>, never>>(
    _: I
  ): MsgSetMaxBurnAmountPerMessageResponse;
};
export declare const MsgDepositForBurn: {
  encode(message: MsgDepositForBurn, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgDepositForBurn;
  fromJSON(object: any): MsgDepositForBurn;
  toJSON(message: MsgDepositForBurn): unknown;
  fromPartial<
    I extends {
      from?: string | undefined;
      amount?: string | undefined;
      destinationDomain?: number | undefined;
      mintRecipient?: Uint8Array | undefined;
      burnToken?: string | undefined;
    } & {
      from?: string | undefined;
      amount?: string | undefined;
      destinationDomain?: number | undefined;
      mintRecipient?: Uint8Array | undefined;
      burnToken?: string | undefined;
    } & Record<Exclude<keyof I, keyof MsgDepositForBurn>, never>
  >(
    object: I
  ): MsgDepositForBurn;
};
export declare const MsgDepositForBurnResponse: {
  encode(message: MsgDepositForBurnResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgDepositForBurnResponse;
  fromJSON(object: any): MsgDepositForBurnResponse;
  toJSON(message: MsgDepositForBurnResponse): unknown;
  fromPartial<
    I extends {
      nonce?: string | undefined;
    } & {
      nonce?: string | undefined;
    } & Record<Exclude<keyof I, "nonce">, never>
  >(
    object: I
  ): MsgDepositForBurnResponse;
};
export declare const MsgDepositForBurnWithCaller: {
  encode(message: MsgDepositForBurnWithCaller, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgDepositForBurnWithCaller;
  fromJSON(object: any): MsgDepositForBurnWithCaller;
  toJSON(message: MsgDepositForBurnWithCaller): unknown;
  fromPartial<
    I extends {
      from?: string | undefined;
      amount?: string | undefined;
      destinationDomain?: number | undefined;
      mintRecipient?: Uint8Array | undefined;
      burnToken?: string | undefined;
      destinationCaller?: Uint8Array | undefined;
    } & {
      from?: string | undefined;
      amount?: string | undefined;
      destinationDomain?: number | undefined;
      mintRecipient?: Uint8Array | undefined;
      burnToken?: string | undefined;
      destinationCaller?: Uint8Array | undefined;
    } & Record<Exclude<keyof I, keyof MsgDepositForBurnWithCaller>, never>
  >(
    object: I
  ): MsgDepositForBurnWithCaller;
};
export declare const MsgDepositForBurnWithCallerResponse: {
  encode(
    message: MsgDepositForBurnWithCallerResponse,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgDepositForBurnWithCallerResponse;
  fromJSON(object: any): MsgDepositForBurnWithCallerResponse;
  toJSON(message: MsgDepositForBurnWithCallerResponse): unknown;
  fromPartial<
    I extends {
      nonce?: string | undefined;
    } & {
      nonce?: string | undefined;
    } & Record<Exclude<keyof I, "nonce">, never>
  >(
    object: I
  ): MsgDepositForBurnWithCallerResponse;
};
export declare const MsgReplaceDepositForBurn: {
  encode(message: MsgReplaceDepositForBurn, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgReplaceDepositForBurn;
  fromJSON(object: any): MsgReplaceDepositForBurn;
  toJSON(message: MsgReplaceDepositForBurn): unknown;
  fromPartial<
    I extends {
      from?: string | undefined;
      originalMessage?: Uint8Array | undefined;
      originalAttestation?: Uint8Array | undefined;
      newDestinationCaller?: Uint8Array | undefined;
      newMintRecipient?: Uint8Array | undefined;
    } & {
      from?: string | undefined;
      originalMessage?: Uint8Array | undefined;
      originalAttestation?: Uint8Array | undefined;
      newDestinationCaller?: Uint8Array | undefined;
      newMintRecipient?: Uint8Array | undefined;
    } & Record<Exclude<keyof I, keyof MsgReplaceDepositForBurn>, never>
  >(
    object: I
  ): MsgReplaceDepositForBurn;
};
export declare const MsgReplaceDepositForBurnResponse: {
  encode(_: MsgReplaceDepositForBurnResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgReplaceDepositForBurnResponse;
  fromJSON(_: any): MsgReplaceDepositForBurnResponse;
  toJSON(_: MsgReplaceDepositForBurnResponse): unknown;
  fromPartial<I extends {} & {} & Record<Exclude<keyof I, never>, never>>(
    _: I
  ): MsgReplaceDepositForBurnResponse;
};
export declare const MsgReceiveMessage: {
  encode(message: MsgReceiveMessage, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgReceiveMessage;
  fromJSON(object: any): MsgReceiveMessage;
  toJSON(message: MsgReceiveMessage): unknown;
  fromPartial<
    I extends {
      from?: string | undefined;
      message?: Uint8Array | undefined;
      attestation?: Uint8Array | undefined;
    } & {
      from?: string | undefined;
      message?: Uint8Array | undefined;
      attestation?: Uint8Array | undefined;
    } & Record<Exclude<keyof I, keyof MsgReceiveMessage>, never>
  >(
    object: I
  ): MsgReceiveMessage;
};
export declare const MsgReceiveMessageResponse: {
  encode(message: MsgReceiveMessageResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgReceiveMessageResponse;
  fromJSON(object: any): MsgReceiveMessageResponse;
  toJSON(message: MsgReceiveMessageResponse): unknown;
  fromPartial<
    I extends {
      success?: boolean | undefined;
    } & {
      success?: boolean | undefined;
    } & Record<Exclude<keyof I, "success">, never>
  >(
    object: I
  ): MsgReceiveMessageResponse;
};
export declare const MsgSendMessage: {
  encode(message: MsgSendMessage, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSendMessage;
  fromJSON(object: any): MsgSendMessage;
  toJSON(message: MsgSendMessage): unknown;
  fromPartial<
    I extends {
      from?: string | undefined;
      destinationDomain?: number | undefined;
      recipient?: Uint8Array | undefined;
      messageBody?: Uint8Array | undefined;
    } & {
      from?: string | undefined;
      destinationDomain?: number | undefined;
      recipient?: Uint8Array | undefined;
      messageBody?: Uint8Array | undefined;
    } & Record<Exclude<keyof I, keyof MsgSendMessage>, never>
  >(
    object: I
  ): MsgSendMessage;
};
export declare const MsgSendMessageResponse: {
  encode(message: MsgSendMessageResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSendMessageResponse;
  fromJSON(object: any): MsgSendMessageResponse;
  toJSON(message: MsgSendMessageResponse): unknown;
  fromPartial<
    I extends {
      nonce?: string | undefined;
    } & {
      nonce?: string | undefined;
    } & Record<Exclude<keyof I, "nonce">, never>
  >(
    object: I
  ): MsgSendMessageResponse;
};
export declare const MsgSendMessageWithCaller: {
  encode(message: MsgSendMessageWithCaller, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSendMessageWithCaller;
  fromJSON(object: any): MsgSendMessageWithCaller;
  toJSON(message: MsgSendMessageWithCaller): unknown;
  fromPartial<
    I extends {
      from?: string | undefined;
      destinationDomain?: number | undefined;
      recipient?: Uint8Array | undefined;
      messageBody?: Uint8Array | undefined;
      destinationCaller?: Uint8Array | undefined;
    } & {
      from?: string | undefined;
      destinationDomain?: number | undefined;
      recipient?: Uint8Array | undefined;
      messageBody?: Uint8Array | undefined;
      destinationCaller?: Uint8Array | undefined;
    } & Record<Exclude<keyof I, keyof MsgSendMessageWithCaller>, never>
  >(
    object: I
  ): MsgSendMessageWithCaller;
};
export declare const MsgSendMessageWithCallerResponse: {
  encode(
    message: MsgSendMessageWithCallerResponse,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSendMessageWithCallerResponse;
  fromJSON(object: any): MsgSendMessageWithCallerResponse;
  toJSON(message: MsgSendMessageWithCallerResponse): unknown;
  fromPartial<
    I extends {
      nonce?: string | undefined;
    } & {
      nonce?: string | undefined;
    } & Record<Exclude<keyof I, "nonce">, never>
  >(
    object: I
  ): MsgSendMessageWithCallerResponse;
};
export declare const MsgReplaceMessage: {
  encode(message: MsgReplaceMessage, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgReplaceMessage;
  fromJSON(object: any): MsgReplaceMessage;
  toJSON(message: MsgReplaceMessage): unknown;
  fromPartial<
    I extends {
      from?: string | undefined;
      originalMessage?: Uint8Array | undefined;
      originalAttestation?: Uint8Array | undefined;
      newMessageBody?: Uint8Array | undefined;
      newDestinationCaller?: Uint8Array | undefined;
    } & {
      from?: string | undefined;
      originalMessage?: Uint8Array | undefined;
      originalAttestation?: Uint8Array | undefined;
      newMessageBody?: Uint8Array | undefined;
      newDestinationCaller?: Uint8Array | undefined;
    } & Record<Exclude<keyof I, keyof MsgReplaceMessage>, never>
  >(
    object: I
  ): MsgReplaceMessage;
};
export declare const MsgReplaceMessageResponse: {
  encode(_: MsgReplaceMessageResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgReplaceMessageResponse;
  fromJSON(_: any): MsgReplaceMessageResponse;
  toJSON(_: MsgReplaceMessageResponse): unknown;
  fromPartial<I extends {} & {} & Record<Exclude<keyof I, never>, never>>(
    _: I
  ): MsgReplaceMessageResponse;
};
export declare const MsgUpdateSignatureThreshold: {
  encode(message: MsgUpdateSignatureThreshold, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgUpdateSignatureThreshold;
  fromJSON(object: any): MsgUpdateSignatureThreshold;
  toJSON(message: MsgUpdateSignatureThreshold): unknown;
  fromPartial<
    I extends {
      from?: string | undefined;
      amount?: number | undefined;
    } & {
      from?: string | undefined;
      amount?: number | undefined;
    } & Record<Exclude<keyof I, keyof MsgUpdateSignatureThreshold>, never>
  >(
    object: I
  ): MsgUpdateSignatureThreshold;
};
export declare const MsgUpdateSignatureThresholdResponse: {
  encode(
    _: MsgUpdateSignatureThresholdResponse,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgUpdateSignatureThresholdResponse;
  fromJSON(_: any): MsgUpdateSignatureThresholdResponse;
  toJSON(_: MsgUpdateSignatureThresholdResponse): unknown;
  fromPartial<I extends {} & {} & Record<Exclude<keyof I, never>, never>>(
    _: I
  ): MsgUpdateSignatureThresholdResponse;
};
export declare const MsgLinkTokenPair: {
  encode(message: MsgLinkTokenPair, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgLinkTokenPair;
  fromJSON(object: any): MsgLinkTokenPair;
  toJSON(message: MsgLinkTokenPair): unknown;
  fromPartial<
    I extends {
      from?: string | undefined;
      remoteDomain?: number | undefined;
      remoteToken?: Uint8Array | undefined;
      localToken?: string | undefined;
    } & {
      from?: string | undefined;
      remoteDomain?: number | undefined;
      remoteToken?: Uint8Array | undefined;
      localToken?: string | undefined;
    } & Record<Exclude<keyof I, keyof MsgLinkTokenPair>, never>
  >(
    object: I
  ): MsgLinkTokenPair;
};
export declare const MsgLinkTokenPairResponse: {
  encode(_: MsgLinkTokenPairResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgLinkTokenPairResponse;
  fromJSON(_: any): MsgLinkTokenPairResponse;
  toJSON(_: MsgLinkTokenPairResponse): unknown;
  fromPartial<I extends {} & {} & Record<Exclude<keyof I, never>, never>>(
    _: I
  ): MsgLinkTokenPairResponse;
};
export declare const MsgUnlinkTokenPair: {
  encode(message: MsgUnlinkTokenPair, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUnlinkTokenPair;
  fromJSON(object: any): MsgUnlinkTokenPair;
  toJSON(message: MsgUnlinkTokenPair): unknown;
  fromPartial<
    I extends {
      from?: string | undefined;
      remoteDomain?: number | undefined;
      remoteToken?: Uint8Array | undefined;
      localToken?: string | undefined;
    } & {
      from?: string | undefined;
      remoteDomain?: number | undefined;
      remoteToken?: Uint8Array | undefined;
      localToken?: string | undefined;
    } & Record<Exclude<keyof I, keyof MsgUnlinkTokenPair>, never>
  >(
    object: I
  ): MsgUnlinkTokenPair;
};
export declare const MsgUnlinkTokenPairResponse: {
  encode(_: MsgUnlinkTokenPairResponse, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgUnlinkTokenPairResponse;
  fromJSON(_: any): MsgUnlinkTokenPairResponse;
  toJSON(_: MsgUnlinkTokenPairResponse): unknown;
  fromPartial<I extends {} & {} & Record<Exclude<keyof I, never>, never>>(
    _: I
  ): MsgUnlinkTokenPairResponse;
};
export declare const MsgAddRemoteTokenMessenger: {
  encode(message: MsgAddRemoteTokenMessenger, writer?: _m0.Writer): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgAddRemoteTokenMessenger;
  fromJSON(object: any): MsgAddRemoteTokenMessenger;
  toJSON(message: MsgAddRemoteTokenMessenger): unknown;
  fromPartial<
    I extends {
      from?: string | undefined;
      domainId?: number | undefined;
      address?: Uint8Array | undefined;
    } & {
      from?: string | undefined;
      domainId?: number | undefined;
      address?: Uint8Array | undefined;
    } & Record<Exclude<keyof I, keyof MsgAddRemoteTokenMessenger>, never>
  >(
    object: I
  ): MsgAddRemoteTokenMessenger;
};
export declare const MsgAddRemoteTokenMessengerResponse: {
  encode(
    _: MsgAddRemoteTokenMessengerResponse,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgAddRemoteTokenMessengerResponse;
  fromJSON(_: any): MsgAddRemoteTokenMessengerResponse;
  toJSON(_: MsgAddRemoteTokenMessengerResponse): unknown;
  fromPartial<I extends {} & {} & Record<Exclude<keyof I, never>, never>>(
    _: I
  ): MsgAddRemoteTokenMessengerResponse;
};
export declare const MsgRemoveRemoteTokenMessenger: {
  encode(
    message: MsgRemoveRemoteTokenMessenger,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgRemoveRemoteTokenMessenger;
  fromJSON(object: any): MsgRemoveRemoteTokenMessenger;
  toJSON(message: MsgRemoveRemoteTokenMessenger): unknown;
  fromPartial<
    I extends {
      from?: string | undefined;
      domainId?: number | undefined;
    } & {
      from?: string | undefined;
      domainId?: number | undefined;
    } & Record<Exclude<keyof I, keyof MsgRemoveRemoteTokenMessenger>, never>
  >(
    object: I
  ): MsgRemoveRemoteTokenMessenger;
};
export declare const MsgRemoveRemoteTokenMessengerResponse: {
  encode(
    _: MsgRemoveRemoteTokenMessengerResponse,
    writer?: _m0.Writer
  ): _m0.Writer;
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgRemoveRemoteTokenMessengerResponse;
  fromJSON(_: any): MsgRemoveRemoteTokenMessengerResponse;
  toJSON(_: MsgRemoveRemoteTokenMessengerResponse): unknown;
  fromPartial<I extends {} & {} & Record<Exclude<keyof I, never>, never>>(
    _: I
  ): MsgRemoveRemoteTokenMessengerResponse;
};
/** Msg defines the Msg service. */
export interface Msg {
  AcceptOwner(request: MsgAcceptOwner): Promise<MsgAcceptOwnerResponse>;
  AddRemoteTokenMessenger(
    request: MsgAddRemoteTokenMessenger
  ): Promise<MsgAddRemoteTokenMessengerResponse>;
  DepositForBurn(
    request: MsgDepositForBurn
  ): Promise<MsgDepositForBurnResponse>;
  DepositForBurnWithCaller(
    request: MsgDepositForBurnWithCaller
  ): Promise<MsgDepositForBurnWithCallerResponse>;
  DisableAttester(
    request: MsgDisableAttester
  ): Promise<MsgDisableAttesterResponse>;
  EnableAttester(
    request: MsgEnableAttester
  ): Promise<MsgEnableAttesterResponse>;
  LinkTokenPair(request: MsgLinkTokenPair): Promise<MsgLinkTokenPairResponse>;
  PauseBurningAndMinting(
    request: MsgPauseBurningAndMinting
  ): Promise<MsgPauseBurningAndMintingResponse>;
  PauseSendingAndReceivingMessages(
    request: MsgPauseSendingAndReceivingMessages
  ): Promise<MsgPauseSendingAndReceivingMessagesResponse>;
  ReceiveMessage(
    request: MsgReceiveMessage
  ): Promise<MsgReceiveMessageResponse>;
  RemoveRemoteTokenMessenger(
    request: MsgRemoveRemoteTokenMessenger
  ): Promise<MsgRemoveRemoteTokenMessengerResponse>;
  ReplaceDepositForBurn(
    request: MsgReplaceDepositForBurn
  ): Promise<MsgReplaceDepositForBurnResponse>;
  ReplaceMessage(
    request: MsgReplaceMessage
  ): Promise<MsgReplaceMessageResponse>;
  SendMessage(request: MsgSendMessage): Promise<MsgSendMessageResponse>;
  SendMessageWithCaller(
    request: MsgSendMessageWithCaller
  ): Promise<MsgSendMessageWithCallerResponse>;
  UnlinkTokenPair(
    request: MsgUnlinkTokenPair
  ): Promise<MsgUnlinkTokenPairResponse>;
  UnpauseBurningAndMinting(
    request: MsgUnpauseBurningAndMinting
  ): Promise<MsgUnpauseBurningAndMintingResponse>;
  UnpauseSendingAndReceivingMessages(
    request: MsgUnpauseSendingAndReceivingMessages
  ): Promise<MsgUnpauseSendingAndReceivingMessagesResponse>;
  UpdateOwner(request: MsgUpdateOwner): Promise<MsgUpdateOwnerResponse>;
  UpdateAttesterManager(
    request: MsgUpdateAttesterManager
  ): Promise<MsgUpdateAttesterManagerResponse>;
  UpdateTokenController(
    request: MsgUpdateTokenController
  ): Promise<MsgUpdateTokenControllerResponse>;
  UpdatePauser(request: MsgUpdatePauser): Promise<MsgUpdatePauserResponse>;
  UpdateMaxMessageBodySize(
    request: MsgUpdateMaxMessageBodySize
  ): Promise<MsgUpdateMaxMessageBodySizeResponse>;
  SetMaxBurnAmountPerMessage(
    request: MsgSetMaxBurnAmountPerMessage
  ): Promise<MsgSetMaxBurnAmountPerMessageResponse>;
  UpdateSignatureThreshold(
    request: MsgUpdateSignatureThreshold
  ): Promise<MsgUpdateSignatureThresholdResponse>;
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
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
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
    } & Record<Exclude<keyof I, KeysOfUnion<P>>, never>;
export {};

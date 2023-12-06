/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { Coin } from "../../cosmos/base/v1beta1/coin";
import { Any } from "../../google/protobuf/any";
import { BridgeValidator } from "./types";

export const protobufPackage = "gravity.v1";

/**
 * MsgSetOrchestratorAddress
 * this message allows validators to delegate their voting responsibilities
 * to a given key. This key is then used as an optional authentication method
 * for sigining oracle claims
 * VALIDATOR
 * The validator field is a cosmosvaloper1... string (i.e. sdk.ValAddress)
 * that references a validator in the active set
 * ORCHESTRATOR
 * The orchestrator field is a cosmos1... string  (i.e. sdk.AccAddress) that
 * references the key that is being delegated to
 * ETH_ADDRESS
 * This is a hex encoded 0x Ethereum public key that will be used by this
 * validator on Ethereum
 */
export interface MsgSetOrchestratorAddress {
  validator: string;
  orchestrator: string;
  ethAddress: string;
}

export interface MsgSetOrchestratorAddressResponse {
}

/**
 * MsgValsetConfirm
 * this is the message sent by the validators when they wish to submit their
 * signatures over the validator set at a given block height. A validator must
 * first call MsgSetEthAddress to set their Ethereum address to be used for
 * signing. Then someone (anyone) must make a ValsetRequest, the request is
 * essentially a messaging mechanism to determine which block all validators
 * should submit signatures over. Finally validators sign the validator set,
 * powers, and Ethereum addresses of the entire validator set at the height of a
 * ValsetRequest and submit that signature with this message.
 *
 * If a sufficient number of validators (66% of voting power) (A) have set
 * Ethereum addresses and (B) submit ValsetConfirm messages with their
 * signatures it is then possible for anyone to view these signatures in the
 * chain store and submit them to Ethereum to update the validator set
 * -------------
 */
export interface MsgValsetConfirm {
  nonce: string;
  orchestrator: string;
  ethAddress: string;
  signature: string;
  evmChainPrefix: string;
}

export interface MsgValsetConfirmResponse {
}

/**
 * MsgSendToEth
 * This is the message that a user calls when they want to bridge an asset
 * it will later be removed when it is included in a batch and successfully
 * submitted tokens are removed from the users balance immediately
 * -------------
 * AMOUNT:
 * the coin to send across the bridge, note the restriction that this is a
 * single coin not a set of coins that is normal in other Cosmos messages
 * BRIDGE_FEE:
 * the fee paid for the bridge, distinct from the fee paid to the chain to
 * actually send this message in the first place. So a successful send has
 * two layers of fees for the user
 * CHAIN_FEE:
 * the fee paid to the chain for handling the request, which must be a
 * certain percentage of the AMOUNT, as determined by governance.
 * This Msg will be rejected if CHAIN_FEE is insufficient.
 */
export interface MsgSendToEth {
  sender: string;
  ethDest: string;
  amount: Coin | undefined;
  bridgeFee: Coin | undefined;
  chainFee: Coin | undefined;
  evmChainPrefix: string;
}

export interface MsgSendToEthResponse {
}

/**
 * MsgRequestBatch
 * this is a message anyone can send that requests a batch of transactions to
 * send across the bridge be created for whatever block height this message is
 * included in. This acts as a coordination point, the handler for this message
 * looks at the AddToOutgoingPool tx's in the store and generates a batch, also
 * available in the store tied to this message. The validators then grab this
 * batch, sign it, submit the signatures with a MsgConfirmBatch before a relayer
 * can finally submit the batch
 * -------------
 */
export interface MsgRequestBatch {
  sender: string;
  denom: string;
  evmChainPrefix: string;
}

export interface MsgRequestBatchResponse {
}

/**
 * MsgConfirmBatch
 * When validators observe a MsgRequestBatch they form a batch by ordering
 * transactions currently in the txqueue in order of highest to lowest fee,
 * cutting off when the batch either reaches a hardcoded maximum size (to be
 * decided, probably around 100) or when transactions stop being profitable
 * (TODO determine this without nondeterminism) This message includes the batch
 * as well as an Ethereum signature over this batch by the validator
 * -------------
 */
export interface MsgConfirmBatch {
  nonce: string;
  tokenContract: string;
  ethSigner: string;
  orchestrator: string;
  signature: string;
  evmChainPrefix: string;
}

export interface MsgConfirmBatchResponse {
}

/**
 * MsgConfirmLogicCall
 * When validators observe a MsgRequestBatch they form a batch by ordering
 * transactions currently in the txqueue in order of highest to lowest fee,
 * cutting off when the batch either reaches a hardcoded maximum size (to be
 * decided, probably around 100) or when transactions stop being profitable
 * (TODO determine this without nondeterminism) This message includes the batch
 * as well as an Ethereum signature over this batch by the validator
 * -------------
 */
export interface MsgConfirmLogicCall {
  invalidationId: string;
  invalidationNonce: string;
  ethSigner: string;
  orchestrator: string;
  signature: string;
  evmChainPrefix: string;
}

export interface MsgConfirmLogicCallResponse {
}

/**
 * MsgSendToCosmosClaim
 * When more than 66% of the active validator set has
 * claimed to have seen the deposit enter the ethereum blockchain coins are
 * issued to the Cosmos address in question
 * -------------
 */
export interface MsgSendToCosmosClaim {
  eventNonce: string;
  ethBlockHeight: string;
  tokenContract: string;
  amount: string;
  ethereumSender: string;
  cosmosReceiver: string;
  orchestrator: string;
  evmChainPrefix: string;
}

export interface MsgSendToCosmosClaimResponse {
}

/**
 * MsgExecuteIbcAutoForwards
 * Prompts the forwarding of Pending IBC Auto-Forwards in the queue
 * The Pending forwards will be executed in order of their original
 * SendToCosmos.EventNonce The funds in the queue will be sent to a local
 * gravity-prefixed address if IBC transfer is not possible
 */
export interface MsgExecuteIbcAutoForwards {
  /** How many queued forwards to clear, be careful about gas limits */
  forwardsToClear: string;
  /** This message's sender */
  executor: string;
  /** auto forward for a specific chain */
  evmChainPrefix: string;
}

export interface MsgExecuteIbcAutoForwardsResponse {
}

/**
 * BatchSendToEthClaim claims that a batch of send to eth
 * operations on the bridge contract was executed.
 */
export interface MsgBatchSendToEthClaim {
  eventNonce: string;
  ethBlockHeight: string;
  batchNonce: string;
  tokenContract: string;
  orchestrator: string;
  evmChainPrefix: string;
}

export interface MsgBatchSendToEthClaimResponse {
}

/**
 * ERC20DeployedClaim allows the Cosmos module
 * to learn about an ERC20 that someone deployed
 * to represent a Cosmos asset
 */
export interface MsgERC20DeployedClaim {
  eventNonce: string;
  ethBlockHeight: string;
  cosmosDenom: string;
  tokenContract: string;
  name: string;
  symbol: string;
  decimals: string;
  orchestrator: string;
  evmChainPrefix: string;
}

export interface MsgERC20DeployedClaimResponse {
}

/**
 * This informs the Cosmos module that a logic
 * call has been executed
 */
export interface MsgLogicCallExecutedClaim {
  eventNonce: string;
  ethBlockHeight: string;
  invalidationId: Uint8Array;
  invalidationNonce: string;
  orchestrator: string;
  evmChainPrefix: string;
}

export interface MsgLogicCallExecutedClaimResponse {
}

/**
 * This informs the Cosmos module that a validator
 * set has been updated.
 */
export interface MsgValsetUpdatedClaim {
  eventNonce: string;
  valsetNonce: string;
  ethBlockHeight: string;
  members: BridgeValidator[];
  rewardAmount: string;
  rewardToken: string;
  orchestrator: string;
  evmChainPrefix: string;
}

export interface MsgValsetUpdatedClaimResponse {
}

/**
 * This call allows the sender (and only the sender)
 * to cancel a given MsgSendToEth and recieve a refund
 * of the tokens
 */
export interface MsgCancelSendToEth {
  transactionId: string;
  sender: string;
  evmChainPrefix: string;
}

export interface MsgCancelSendToEthResponse {
}

/**
 * This call allows anyone to submit evidence that a
 * validator has signed a valset, batch, or logic call that never
 * existed on the Cosmos chain.
 * Subject contains the batch, valset, or logic call.
 */
export interface MsgSubmitBadSignatureEvidence {
  subject: Any | undefined;
  signature: string;
  sender: string;
  evmChainPrefix: string;
}

export interface MsgSubmitBadSignatureEvidenceResponse {
}

export interface EventSetOperatorAddress {
  message: string;
  address: string;
}

export interface EventValsetConfirmKey {
  message: string;
  key: string;
}

export interface EventBatchCreated {
  message: string;
  batchNonce: string;
}

export interface EventBatchConfirmKey {
  message: string;
  batchConfirmKey: string;
}

export interface EventBatchSendToEthClaim {
  nonce: string;
}

export interface EventClaim {
  message: string;
  claimHash: string;
  attestationId: string;
}

export interface EventBadSignatureEvidence {
  message: string;
  badEthSignature: string;
  badEthSignatureSubject: string;
}

export interface EventERC20DeployedClaim {
  token: string;
  nonce: string;
}

export interface EventValsetUpdatedClaim {
  nonce: string;
}

export interface EventMultisigUpdateRequest {
  bridgeContract: string;
  bridgeChainId: string;
  multisigId: string;
  nonce: string;
}

export interface EventOutgoingLogicCallCanceled {
  logicCallInvalidationId: string;
  logicCallInvalidationNonce: string;
}

export interface EventSignatureSlashing {
  type: string;
  address: string;
}

export interface EventOutgoingTxId {
  message: string;
  txId: string;
}

function createBaseMsgSetOrchestratorAddress(): MsgSetOrchestratorAddress {
  return { validator: "", orchestrator: "", ethAddress: "" };
}

export const MsgSetOrchestratorAddress = {
  encode(message: MsgSetOrchestratorAddress, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.validator !== "") {
      writer.uint32(10).string(message.validator);
    }
    if (message.orchestrator !== "") {
      writer.uint32(18).string(message.orchestrator);
    }
    if (message.ethAddress !== "") {
      writer.uint32(26).string(message.ethAddress);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSetOrchestratorAddress {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetOrchestratorAddress();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.validator = reader.string();
          break;
        case 2:
          message.orchestrator = reader.string();
          break;
        case 3:
          message.ethAddress = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgSetOrchestratorAddress {
    return {
      validator: isSet(object.validator) ? String(object.validator) : "",
      orchestrator: isSet(object.orchestrator) ? String(object.orchestrator) : "",
      ethAddress: isSet(object.ethAddress) ? String(object.ethAddress) : "",
    };
  },

  toJSON(message: MsgSetOrchestratorAddress): unknown {
    const obj: any = {};
    message.validator !== undefined && (obj.validator = message.validator);
    message.orchestrator !== undefined && (obj.orchestrator = message.orchestrator);
    message.ethAddress !== undefined && (obj.ethAddress = message.ethAddress);
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgSetOrchestratorAddress>, I>>(base?: I): MsgSetOrchestratorAddress {
    return MsgSetOrchestratorAddress.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgSetOrchestratorAddress>, I>>(object: I): MsgSetOrchestratorAddress {
    const message = createBaseMsgSetOrchestratorAddress();
    message.validator = object.validator ?? "";
    message.orchestrator = object.orchestrator ?? "";
    message.ethAddress = object.ethAddress ?? "";
    return message;
  },
};

function createBaseMsgSetOrchestratorAddressResponse(): MsgSetOrchestratorAddressResponse {
  return {};
}

export const MsgSetOrchestratorAddressResponse = {
  encode(_: MsgSetOrchestratorAddressResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSetOrchestratorAddressResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetOrchestratorAddressResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): MsgSetOrchestratorAddressResponse {
    return {};
  },

  toJSON(_: MsgSetOrchestratorAddressResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgSetOrchestratorAddressResponse>, I>>(
    base?: I,
  ): MsgSetOrchestratorAddressResponse {
    return MsgSetOrchestratorAddressResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgSetOrchestratorAddressResponse>, I>>(
    _: I,
  ): MsgSetOrchestratorAddressResponse {
    const message = createBaseMsgSetOrchestratorAddressResponse();
    return message;
  },
};

function createBaseMsgValsetConfirm(): MsgValsetConfirm {
  return { nonce: "0", orchestrator: "", ethAddress: "", signature: "", evmChainPrefix: "" };
}

export const MsgValsetConfirm = {
  encode(message: MsgValsetConfirm, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.nonce !== "0") {
      writer.uint32(8).uint64(message.nonce);
    }
    if (message.orchestrator !== "") {
      writer.uint32(18).string(message.orchestrator);
    }
    if (message.ethAddress !== "") {
      writer.uint32(26).string(message.ethAddress);
    }
    if (message.signature !== "") {
      writer.uint32(34).string(message.signature);
    }
    if (message.evmChainPrefix !== "") {
      writer.uint32(42).string(message.evmChainPrefix);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgValsetConfirm {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgValsetConfirm();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.nonce = longToString(reader.uint64() as Long);
          break;
        case 2:
          message.orchestrator = reader.string();
          break;
        case 3:
          message.ethAddress = reader.string();
          break;
        case 4:
          message.signature = reader.string();
          break;
        case 5:
          message.evmChainPrefix = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgValsetConfirm {
    return {
      nonce: isSet(object.nonce) ? String(object.nonce) : "0",
      orchestrator: isSet(object.orchestrator) ? String(object.orchestrator) : "",
      ethAddress: isSet(object.ethAddress) ? String(object.ethAddress) : "",
      signature: isSet(object.signature) ? String(object.signature) : "",
      evmChainPrefix: isSet(object.evmChainPrefix) ? String(object.evmChainPrefix) : "",
    };
  },

  toJSON(message: MsgValsetConfirm): unknown {
    const obj: any = {};
    message.nonce !== undefined && (obj.nonce = message.nonce);
    message.orchestrator !== undefined && (obj.orchestrator = message.orchestrator);
    message.ethAddress !== undefined && (obj.ethAddress = message.ethAddress);
    message.signature !== undefined && (obj.signature = message.signature);
    message.evmChainPrefix !== undefined && (obj.evmChainPrefix = message.evmChainPrefix);
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgValsetConfirm>, I>>(base?: I): MsgValsetConfirm {
    return MsgValsetConfirm.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgValsetConfirm>, I>>(object: I): MsgValsetConfirm {
    const message = createBaseMsgValsetConfirm();
    message.nonce = object.nonce ?? "0";
    message.orchestrator = object.orchestrator ?? "";
    message.ethAddress = object.ethAddress ?? "";
    message.signature = object.signature ?? "";
    message.evmChainPrefix = object.evmChainPrefix ?? "";
    return message;
  },
};

function createBaseMsgValsetConfirmResponse(): MsgValsetConfirmResponse {
  return {};
}

export const MsgValsetConfirmResponse = {
  encode(_: MsgValsetConfirmResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgValsetConfirmResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgValsetConfirmResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): MsgValsetConfirmResponse {
    return {};
  },

  toJSON(_: MsgValsetConfirmResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgValsetConfirmResponse>, I>>(base?: I): MsgValsetConfirmResponse {
    return MsgValsetConfirmResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgValsetConfirmResponse>, I>>(_: I): MsgValsetConfirmResponse {
    const message = createBaseMsgValsetConfirmResponse();
    return message;
  },
};

function createBaseMsgSendToEth(): MsgSendToEth {
  return { sender: "", ethDest: "", amount: undefined, bridgeFee: undefined, chainFee: undefined, evmChainPrefix: "" };
}

export const MsgSendToEth = {
  encode(message: MsgSendToEth, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (message.ethDest !== "") {
      writer.uint32(18).string(message.ethDest);
    }
    if (message.amount !== undefined) {
      Coin.encode(message.amount, writer.uint32(26).fork()).ldelim();
    }
    if (message.bridgeFee !== undefined) {
      Coin.encode(message.bridgeFee, writer.uint32(34).fork()).ldelim();
    }
    if (message.chainFee !== undefined) {
      Coin.encode(message.chainFee, writer.uint32(42).fork()).ldelim();
    }
    if (message.evmChainPrefix !== "") {
      writer.uint32(50).string(message.evmChainPrefix);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSendToEth {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSendToEth();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.ethDest = reader.string();
          break;
        case 3:
          message.amount = Coin.decode(reader, reader.uint32());
          break;
        case 4:
          message.bridgeFee = Coin.decode(reader, reader.uint32());
          break;
        case 5:
          message.chainFee = Coin.decode(reader, reader.uint32());
          break;
        case 6:
          message.evmChainPrefix = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgSendToEth {
    return {
      sender: isSet(object.sender) ? String(object.sender) : "",
      ethDest: isSet(object.ethDest) ? String(object.ethDest) : "",
      amount: isSet(object.amount) ? Coin.fromJSON(object.amount) : undefined,
      bridgeFee: isSet(object.bridgeFee) ? Coin.fromJSON(object.bridgeFee) : undefined,
      chainFee: isSet(object.chainFee) ? Coin.fromJSON(object.chainFee) : undefined,
      evmChainPrefix: isSet(object.evmChainPrefix) ? String(object.evmChainPrefix) : "",
    };
  },

  toJSON(message: MsgSendToEth): unknown {
    const obj: any = {};
    message.sender !== undefined && (obj.sender = message.sender);
    message.ethDest !== undefined && (obj.ethDest = message.ethDest);
    message.amount !== undefined && (obj.amount = message.amount ? Coin.toJSON(message.amount) : undefined);
    message.bridgeFee !== undefined && (obj.bridgeFee = message.bridgeFee ? Coin.toJSON(message.bridgeFee) : undefined);
    message.chainFee !== undefined && (obj.chainFee = message.chainFee ? Coin.toJSON(message.chainFee) : undefined);
    message.evmChainPrefix !== undefined && (obj.evmChainPrefix = message.evmChainPrefix);
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgSendToEth>, I>>(base?: I): MsgSendToEth {
    return MsgSendToEth.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgSendToEth>, I>>(object: I): MsgSendToEth {
    const message = createBaseMsgSendToEth();
    message.sender = object.sender ?? "";
    message.ethDest = object.ethDest ?? "";
    message.amount = (object.amount !== undefined && object.amount !== null)
      ? Coin.fromPartial(object.amount)
      : undefined;
    message.bridgeFee = (object.bridgeFee !== undefined && object.bridgeFee !== null)
      ? Coin.fromPartial(object.bridgeFee)
      : undefined;
    message.chainFee = (object.chainFee !== undefined && object.chainFee !== null)
      ? Coin.fromPartial(object.chainFee)
      : undefined;
    message.evmChainPrefix = object.evmChainPrefix ?? "";
    return message;
  },
};

function createBaseMsgSendToEthResponse(): MsgSendToEthResponse {
  return {};
}

export const MsgSendToEthResponse = {
  encode(_: MsgSendToEthResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSendToEthResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSendToEthResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): MsgSendToEthResponse {
    return {};
  },

  toJSON(_: MsgSendToEthResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgSendToEthResponse>, I>>(base?: I): MsgSendToEthResponse {
    return MsgSendToEthResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgSendToEthResponse>, I>>(_: I): MsgSendToEthResponse {
    const message = createBaseMsgSendToEthResponse();
    return message;
  },
};

function createBaseMsgRequestBatch(): MsgRequestBatch {
  return { sender: "", denom: "", evmChainPrefix: "" };
}

export const MsgRequestBatch = {
  encode(message: MsgRequestBatch, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (message.denom !== "") {
      writer.uint32(18).string(message.denom);
    }
    if (message.evmChainPrefix !== "") {
      writer.uint32(26).string(message.evmChainPrefix);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgRequestBatch {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRequestBatch();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.denom = reader.string();
          break;
        case 3:
          message.evmChainPrefix = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgRequestBatch {
    return {
      sender: isSet(object.sender) ? String(object.sender) : "",
      denom: isSet(object.denom) ? String(object.denom) : "",
      evmChainPrefix: isSet(object.evmChainPrefix) ? String(object.evmChainPrefix) : "",
    };
  },

  toJSON(message: MsgRequestBatch): unknown {
    const obj: any = {};
    message.sender !== undefined && (obj.sender = message.sender);
    message.denom !== undefined && (obj.denom = message.denom);
    message.evmChainPrefix !== undefined && (obj.evmChainPrefix = message.evmChainPrefix);
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgRequestBatch>, I>>(base?: I): MsgRequestBatch {
    return MsgRequestBatch.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgRequestBatch>, I>>(object: I): MsgRequestBatch {
    const message = createBaseMsgRequestBatch();
    message.sender = object.sender ?? "";
    message.denom = object.denom ?? "";
    message.evmChainPrefix = object.evmChainPrefix ?? "";
    return message;
  },
};

function createBaseMsgRequestBatchResponse(): MsgRequestBatchResponse {
  return {};
}

export const MsgRequestBatchResponse = {
  encode(_: MsgRequestBatchResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgRequestBatchResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRequestBatchResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): MsgRequestBatchResponse {
    return {};
  },

  toJSON(_: MsgRequestBatchResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgRequestBatchResponse>, I>>(base?: I): MsgRequestBatchResponse {
    return MsgRequestBatchResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgRequestBatchResponse>, I>>(_: I): MsgRequestBatchResponse {
    const message = createBaseMsgRequestBatchResponse();
    return message;
  },
};

function createBaseMsgConfirmBatch(): MsgConfirmBatch {
  return { nonce: "0", tokenContract: "", ethSigner: "", orchestrator: "", signature: "", evmChainPrefix: "" };
}

export const MsgConfirmBatch = {
  encode(message: MsgConfirmBatch, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.nonce !== "0") {
      writer.uint32(8).uint64(message.nonce);
    }
    if (message.tokenContract !== "") {
      writer.uint32(18).string(message.tokenContract);
    }
    if (message.ethSigner !== "") {
      writer.uint32(26).string(message.ethSigner);
    }
    if (message.orchestrator !== "") {
      writer.uint32(34).string(message.orchestrator);
    }
    if (message.signature !== "") {
      writer.uint32(42).string(message.signature);
    }
    if (message.evmChainPrefix !== "") {
      writer.uint32(50).string(message.evmChainPrefix);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgConfirmBatch {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgConfirmBatch();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.nonce = longToString(reader.uint64() as Long);
          break;
        case 2:
          message.tokenContract = reader.string();
          break;
        case 3:
          message.ethSigner = reader.string();
          break;
        case 4:
          message.orchestrator = reader.string();
          break;
        case 5:
          message.signature = reader.string();
          break;
        case 6:
          message.evmChainPrefix = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgConfirmBatch {
    return {
      nonce: isSet(object.nonce) ? String(object.nonce) : "0",
      tokenContract: isSet(object.tokenContract) ? String(object.tokenContract) : "",
      ethSigner: isSet(object.ethSigner) ? String(object.ethSigner) : "",
      orchestrator: isSet(object.orchestrator) ? String(object.orchestrator) : "",
      signature: isSet(object.signature) ? String(object.signature) : "",
      evmChainPrefix: isSet(object.evmChainPrefix) ? String(object.evmChainPrefix) : "",
    };
  },

  toJSON(message: MsgConfirmBatch): unknown {
    const obj: any = {};
    message.nonce !== undefined && (obj.nonce = message.nonce);
    message.tokenContract !== undefined && (obj.tokenContract = message.tokenContract);
    message.ethSigner !== undefined && (obj.ethSigner = message.ethSigner);
    message.orchestrator !== undefined && (obj.orchestrator = message.orchestrator);
    message.signature !== undefined && (obj.signature = message.signature);
    message.evmChainPrefix !== undefined && (obj.evmChainPrefix = message.evmChainPrefix);
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgConfirmBatch>, I>>(base?: I): MsgConfirmBatch {
    return MsgConfirmBatch.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgConfirmBatch>, I>>(object: I): MsgConfirmBatch {
    const message = createBaseMsgConfirmBatch();
    message.nonce = object.nonce ?? "0";
    message.tokenContract = object.tokenContract ?? "";
    message.ethSigner = object.ethSigner ?? "";
    message.orchestrator = object.orchestrator ?? "";
    message.signature = object.signature ?? "";
    message.evmChainPrefix = object.evmChainPrefix ?? "";
    return message;
  },
};

function createBaseMsgConfirmBatchResponse(): MsgConfirmBatchResponse {
  return {};
}

export const MsgConfirmBatchResponse = {
  encode(_: MsgConfirmBatchResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgConfirmBatchResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgConfirmBatchResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): MsgConfirmBatchResponse {
    return {};
  },

  toJSON(_: MsgConfirmBatchResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgConfirmBatchResponse>, I>>(base?: I): MsgConfirmBatchResponse {
    return MsgConfirmBatchResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgConfirmBatchResponse>, I>>(_: I): MsgConfirmBatchResponse {
    const message = createBaseMsgConfirmBatchResponse();
    return message;
  },
};

function createBaseMsgConfirmLogicCall(): MsgConfirmLogicCall {
  return {
    invalidationId: "",
    invalidationNonce: "0",
    ethSigner: "",
    orchestrator: "",
    signature: "",
    evmChainPrefix: "",
  };
}

export const MsgConfirmLogicCall = {
  encode(message: MsgConfirmLogicCall, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.invalidationId !== "") {
      writer.uint32(10).string(message.invalidationId);
    }
    if (message.invalidationNonce !== "0") {
      writer.uint32(16).uint64(message.invalidationNonce);
    }
    if (message.ethSigner !== "") {
      writer.uint32(26).string(message.ethSigner);
    }
    if (message.orchestrator !== "") {
      writer.uint32(34).string(message.orchestrator);
    }
    if (message.signature !== "") {
      writer.uint32(42).string(message.signature);
    }
    if (message.evmChainPrefix !== "") {
      writer.uint32(50).string(message.evmChainPrefix);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgConfirmLogicCall {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgConfirmLogicCall();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.invalidationId = reader.string();
          break;
        case 2:
          message.invalidationNonce = longToString(reader.uint64() as Long);
          break;
        case 3:
          message.ethSigner = reader.string();
          break;
        case 4:
          message.orchestrator = reader.string();
          break;
        case 5:
          message.signature = reader.string();
          break;
        case 6:
          message.evmChainPrefix = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgConfirmLogicCall {
    return {
      invalidationId: isSet(object.invalidationId) ? String(object.invalidationId) : "",
      invalidationNonce: isSet(object.invalidationNonce) ? String(object.invalidationNonce) : "0",
      ethSigner: isSet(object.ethSigner) ? String(object.ethSigner) : "",
      orchestrator: isSet(object.orchestrator) ? String(object.orchestrator) : "",
      signature: isSet(object.signature) ? String(object.signature) : "",
      evmChainPrefix: isSet(object.evmChainPrefix) ? String(object.evmChainPrefix) : "",
    };
  },

  toJSON(message: MsgConfirmLogicCall): unknown {
    const obj: any = {};
    message.invalidationId !== undefined && (obj.invalidationId = message.invalidationId);
    message.invalidationNonce !== undefined && (obj.invalidationNonce = message.invalidationNonce);
    message.ethSigner !== undefined && (obj.ethSigner = message.ethSigner);
    message.orchestrator !== undefined && (obj.orchestrator = message.orchestrator);
    message.signature !== undefined && (obj.signature = message.signature);
    message.evmChainPrefix !== undefined && (obj.evmChainPrefix = message.evmChainPrefix);
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgConfirmLogicCall>, I>>(base?: I): MsgConfirmLogicCall {
    return MsgConfirmLogicCall.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgConfirmLogicCall>, I>>(object: I): MsgConfirmLogicCall {
    const message = createBaseMsgConfirmLogicCall();
    message.invalidationId = object.invalidationId ?? "";
    message.invalidationNonce = object.invalidationNonce ?? "0";
    message.ethSigner = object.ethSigner ?? "";
    message.orchestrator = object.orchestrator ?? "";
    message.signature = object.signature ?? "";
    message.evmChainPrefix = object.evmChainPrefix ?? "";
    return message;
  },
};

function createBaseMsgConfirmLogicCallResponse(): MsgConfirmLogicCallResponse {
  return {};
}

export const MsgConfirmLogicCallResponse = {
  encode(_: MsgConfirmLogicCallResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgConfirmLogicCallResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgConfirmLogicCallResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): MsgConfirmLogicCallResponse {
    return {};
  },

  toJSON(_: MsgConfirmLogicCallResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgConfirmLogicCallResponse>, I>>(base?: I): MsgConfirmLogicCallResponse {
    return MsgConfirmLogicCallResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgConfirmLogicCallResponse>, I>>(_: I): MsgConfirmLogicCallResponse {
    const message = createBaseMsgConfirmLogicCallResponse();
    return message;
  },
};

function createBaseMsgSendToCosmosClaim(): MsgSendToCosmosClaim {
  return {
    eventNonce: "0",
    ethBlockHeight: "0",
    tokenContract: "",
    amount: "",
    ethereumSender: "",
    cosmosReceiver: "",
    orchestrator: "",
    evmChainPrefix: "",
  };
}

export const MsgSendToCosmosClaim = {
  encode(message: MsgSendToCosmosClaim, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.eventNonce !== "0") {
      writer.uint32(8).uint64(message.eventNonce);
    }
    if (message.ethBlockHeight !== "0") {
      writer.uint32(16).uint64(message.ethBlockHeight);
    }
    if (message.tokenContract !== "") {
      writer.uint32(26).string(message.tokenContract);
    }
    if (message.amount !== "") {
      writer.uint32(34).string(message.amount);
    }
    if (message.ethereumSender !== "") {
      writer.uint32(42).string(message.ethereumSender);
    }
    if (message.cosmosReceiver !== "") {
      writer.uint32(50).string(message.cosmosReceiver);
    }
    if (message.orchestrator !== "") {
      writer.uint32(58).string(message.orchestrator);
    }
    if (message.evmChainPrefix !== "") {
      writer.uint32(66).string(message.evmChainPrefix);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSendToCosmosClaim {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSendToCosmosClaim();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.eventNonce = longToString(reader.uint64() as Long);
          break;
        case 2:
          message.ethBlockHeight = longToString(reader.uint64() as Long);
          break;
        case 3:
          message.tokenContract = reader.string();
          break;
        case 4:
          message.amount = reader.string();
          break;
        case 5:
          message.ethereumSender = reader.string();
          break;
        case 6:
          message.cosmosReceiver = reader.string();
          break;
        case 7:
          message.orchestrator = reader.string();
          break;
        case 8:
          message.evmChainPrefix = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgSendToCosmosClaim {
    return {
      eventNonce: isSet(object.eventNonce) ? String(object.eventNonce) : "0",
      ethBlockHeight: isSet(object.ethBlockHeight) ? String(object.ethBlockHeight) : "0",
      tokenContract: isSet(object.tokenContract) ? String(object.tokenContract) : "",
      amount: isSet(object.amount) ? String(object.amount) : "",
      ethereumSender: isSet(object.ethereumSender) ? String(object.ethereumSender) : "",
      cosmosReceiver: isSet(object.cosmosReceiver) ? String(object.cosmosReceiver) : "",
      orchestrator: isSet(object.orchestrator) ? String(object.orchestrator) : "",
      evmChainPrefix: isSet(object.evmChainPrefix) ? String(object.evmChainPrefix) : "",
    };
  },

  toJSON(message: MsgSendToCosmosClaim): unknown {
    const obj: any = {};
    message.eventNonce !== undefined && (obj.eventNonce = message.eventNonce);
    message.ethBlockHeight !== undefined && (obj.ethBlockHeight = message.ethBlockHeight);
    message.tokenContract !== undefined && (obj.tokenContract = message.tokenContract);
    message.amount !== undefined && (obj.amount = message.amount);
    message.ethereumSender !== undefined && (obj.ethereumSender = message.ethereumSender);
    message.cosmosReceiver !== undefined && (obj.cosmosReceiver = message.cosmosReceiver);
    message.orchestrator !== undefined && (obj.orchestrator = message.orchestrator);
    message.evmChainPrefix !== undefined && (obj.evmChainPrefix = message.evmChainPrefix);
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgSendToCosmosClaim>, I>>(base?: I): MsgSendToCosmosClaim {
    return MsgSendToCosmosClaim.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgSendToCosmosClaim>, I>>(object: I): MsgSendToCosmosClaim {
    const message = createBaseMsgSendToCosmosClaim();
    message.eventNonce = object.eventNonce ?? "0";
    message.ethBlockHeight = object.ethBlockHeight ?? "0";
    message.tokenContract = object.tokenContract ?? "";
    message.amount = object.amount ?? "";
    message.ethereumSender = object.ethereumSender ?? "";
    message.cosmosReceiver = object.cosmosReceiver ?? "";
    message.orchestrator = object.orchestrator ?? "";
    message.evmChainPrefix = object.evmChainPrefix ?? "";
    return message;
  },
};

function createBaseMsgSendToCosmosClaimResponse(): MsgSendToCosmosClaimResponse {
  return {};
}

export const MsgSendToCosmosClaimResponse = {
  encode(_: MsgSendToCosmosClaimResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSendToCosmosClaimResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSendToCosmosClaimResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): MsgSendToCosmosClaimResponse {
    return {};
  },

  toJSON(_: MsgSendToCosmosClaimResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgSendToCosmosClaimResponse>, I>>(base?: I): MsgSendToCosmosClaimResponse {
    return MsgSendToCosmosClaimResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgSendToCosmosClaimResponse>, I>>(_: I): MsgSendToCosmosClaimResponse {
    const message = createBaseMsgSendToCosmosClaimResponse();
    return message;
  },
};

function createBaseMsgExecuteIbcAutoForwards(): MsgExecuteIbcAutoForwards {
  return { forwardsToClear: "0", executor: "", evmChainPrefix: "" };
}

export const MsgExecuteIbcAutoForwards = {
  encode(message: MsgExecuteIbcAutoForwards, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.forwardsToClear !== "0") {
      writer.uint32(8).uint64(message.forwardsToClear);
    }
    if (message.executor !== "") {
      writer.uint32(18).string(message.executor);
    }
    if (message.evmChainPrefix !== "") {
      writer.uint32(26).string(message.evmChainPrefix);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgExecuteIbcAutoForwards {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgExecuteIbcAutoForwards();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.forwardsToClear = longToString(reader.uint64() as Long);
          break;
        case 2:
          message.executor = reader.string();
          break;
        case 3:
          message.evmChainPrefix = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgExecuteIbcAutoForwards {
    return {
      forwardsToClear: isSet(object.forwardsToClear) ? String(object.forwardsToClear) : "0",
      executor: isSet(object.executor) ? String(object.executor) : "",
      evmChainPrefix: isSet(object.evmChainPrefix) ? String(object.evmChainPrefix) : "",
    };
  },

  toJSON(message: MsgExecuteIbcAutoForwards): unknown {
    const obj: any = {};
    message.forwardsToClear !== undefined && (obj.forwardsToClear = message.forwardsToClear);
    message.executor !== undefined && (obj.executor = message.executor);
    message.evmChainPrefix !== undefined && (obj.evmChainPrefix = message.evmChainPrefix);
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgExecuteIbcAutoForwards>, I>>(base?: I): MsgExecuteIbcAutoForwards {
    return MsgExecuteIbcAutoForwards.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgExecuteIbcAutoForwards>, I>>(object: I): MsgExecuteIbcAutoForwards {
    const message = createBaseMsgExecuteIbcAutoForwards();
    message.forwardsToClear = object.forwardsToClear ?? "0";
    message.executor = object.executor ?? "";
    message.evmChainPrefix = object.evmChainPrefix ?? "";
    return message;
  },
};

function createBaseMsgExecuteIbcAutoForwardsResponse(): MsgExecuteIbcAutoForwardsResponse {
  return {};
}

export const MsgExecuteIbcAutoForwardsResponse = {
  encode(_: MsgExecuteIbcAutoForwardsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgExecuteIbcAutoForwardsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgExecuteIbcAutoForwardsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): MsgExecuteIbcAutoForwardsResponse {
    return {};
  },

  toJSON(_: MsgExecuteIbcAutoForwardsResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgExecuteIbcAutoForwardsResponse>, I>>(
    base?: I,
  ): MsgExecuteIbcAutoForwardsResponse {
    return MsgExecuteIbcAutoForwardsResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgExecuteIbcAutoForwardsResponse>, I>>(
    _: I,
  ): MsgExecuteIbcAutoForwardsResponse {
    const message = createBaseMsgExecuteIbcAutoForwardsResponse();
    return message;
  },
};

function createBaseMsgBatchSendToEthClaim(): MsgBatchSendToEthClaim {
  return {
    eventNonce: "0",
    ethBlockHeight: "0",
    batchNonce: "0",
    tokenContract: "",
    orchestrator: "",
    evmChainPrefix: "",
  };
}

export const MsgBatchSendToEthClaim = {
  encode(message: MsgBatchSendToEthClaim, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.eventNonce !== "0") {
      writer.uint32(8).uint64(message.eventNonce);
    }
    if (message.ethBlockHeight !== "0") {
      writer.uint32(16).uint64(message.ethBlockHeight);
    }
    if (message.batchNonce !== "0") {
      writer.uint32(24).uint64(message.batchNonce);
    }
    if (message.tokenContract !== "") {
      writer.uint32(34).string(message.tokenContract);
    }
    if (message.orchestrator !== "") {
      writer.uint32(42).string(message.orchestrator);
    }
    if (message.evmChainPrefix !== "") {
      writer.uint32(50).string(message.evmChainPrefix);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgBatchSendToEthClaim {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBatchSendToEthClaim();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.eventNonce = longToString(reader.uint64() as Long);
          break;
        case 2:
          message.ethBlockHeight = longToString(reader.uint64() as Long);
          break;
        case 3:
          message.batchNonce = longToString(reader.uint64() as Long);
          break;
        case 4:
          message.tokenContract = reader.string();
          break;
        case 5:
          message.orchestrator = reader.string();
          break;
        case 6:
          message.evmChainPrefix = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgBatchSendToEthClaim {
    return {
      eventNonce: isSet(object.eventNonce) ? String(object.eventNonce) : "0",
      ethBlockHeight: isSet(object.ethBlockHeight) ? String(object.ethBlockHeight) : "0",
      batchNonce: isSet(object.batchNonce) ? String(object.batchNonce) : "0",
      tokenContract: isSet(object.tokenContract) ? String(object.tokenContract) : "",
      orchestrator: isSet(object.orchestrator) ? String(object.orchestrator) : "",
      evmChainPrefix: isSet(object.evmChainPrefix) ? String(object.evmChainPrefix) : "",
    };
  },

  toJSON(message: MsgBatchSendToEthClaim): unknown {
    const obj: any = {};
    message.eventNonce !== undefined && (obj.eventNonce = message.eventNonce);
    message.ethBlockHeight !== undefined && (obj.ethBlockHeight = message.ethBlockHeight);
    message.batchNonce !== undefined && (obj.batchNonce = message.batchNonce);
    message.tokenContract !== undefined && (obj.tokenContract = message.tokenContract);
    message.orchestrator !== undefined && (obj.orchestrator = message.orchestrator);
    message.evmChainPrefix !== undefined && (obj.evmChainPrefix = message.evmChainPrefix);
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgBatchSendToEthClaim>, I>>(base?: I): MsgBatchSendToEthClaim {
    return MsgBatchSendToEthClaim.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgBatchSendToEthClaim>, I>>(object: I): MsgBatchSendToEthClaim {
    const message = createBaseMsgBatchSendToEthClaim();
    message.eventNonce = object.eventNonce ?? "0";
    message.ethBlockHeight = object.ethBlockHeight ?? "0";
    message.batchNonce = object.batchNonce ?? "0";
    message.tokenContract = object.tokenContract ?? "";
    message.orchestrator = object.orchestrator ?? "";
    message.evmChainPrefix = object.evmChainPrefix ?? "";
    return message;
  },
};

function createBaseMsgBatchSendToEthClaimResponse(): MsgBatchSendToEthClaimResponse {
  return {};
}

export const MsgBatchSendToEthClaimResponse = {
  encode(_: MsgBatchSendToEthClaimResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgBatchSendToEthClaimResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBatchSendToEthClaimResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): MsgBatchSendToEthClaimResponse {
    return {};
  },

  toJSON(_: MsgBatchSendToEthClaimResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgBatchSendToEthClaimResponse>, I>>(base?: I): MsgBatchSendToEthClaimResponse {
    return MsgBatchSendToEthClaimResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgBatchSendToEthClaimResponse>, I>>(_: I): MsgBatchSendToEthClaimResponse {
    const message = createBaseMsgBatchSendToEthClaimResponse();
    return message;
  },
};

function createBaseMsgERC20DeployedClaim(): MsgERC20DeployedClaim {
  return {
    eventNonce: "0",
    ethBlockHeight: "0",
    cosmosDenom: "",
    tokenContract: "",
    name: "",
    symbol: "",
    decimals: "0",
    orchestrator: "",
    evmChainPrefix: "",
  };
}

export const MsgERC20DeployedClaim = {
  encode(message: MsgERC20DeployedClaim, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.eventNonce !== "0") {
      writer.uint32(8).uint64(message.eventNonce);
    }
    if (message.ethBlockHeight !== "0") {
      writer.uint32(16).uint64(message.ethBlockHeight);
    }
    if (message.cosmosDenom !== "") {
      writer.uint32(26).string(message.cosmosDenom);
    }
    if (message.tokenContract !== "") {
      writer.uint32(34).string(message.tokenContract);
    }
    if (message.name !== "") {
      writer.uint32(42).string(message.name);
    }
    if (message.symbol !== "") {
      writer.uint32(50).string(message.symbol);
    }
    if (message.decimals !== "0") {
      writer.uint32(56).uint64(message.decimals);
    }
    if (message.orchestrator !== "") {
      writer.uint32(66).string(message.orchestrator);
    }
    if (message.evmChainPrefix !== "") {
      writer.uint32(74).string(message.evmChainPrefix);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgERC20DeployedClaim {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgERC20DeployedClaim();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.eventNonce = longToString(reader.uint64() as Long);
          break;
        case 2:
          message.ethBlockHeight = longToString(reader.uint64() as Long);
          break;
        case 3:
          message.cosmosDenom = reader.string();
          break;
        case 4:
          message.tokenContract = reader.string();
          break;
        case 5:
          message.name = reader.string();
          break;
        case 6:
          message.symbol = reader.string();
          break;
        case 7:
          message.decimals = longToString(reader.uint64() as Long);
          break;
        case 8:
          message.orchestrator = reader.string();
          break;
        case 9:
          message.evmChainPrefix = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgERC20DeployedClaim {
    return {
      eventNonce: isSet(object.eventNonce) ? String(object.eventNonce) : "0",
      ethBlockHeight: isSet(object.ethBlockHeight) ? String(object.ethBlockHeight) : "0",
      cosmosDenom: isSet(object.cosmosDenom) ? String(object.cosmosDenom) : "",
      tokenContract: isSet(object.tokenContract) ? String(object.tokenContract) : "",
      name: isSet(object.name) ? String(object.name) : "",
      symbol: isSet(object.symbol) ? String(object.symbol) : "",
      decimals: isSet(object.decimals) ? String(object.decimals) : "0",
      orchestrator: isSet(object.orchestrator) ? String(object.orchestrator) : "",
      evmChainPrefix: isSet(object.evmChainPrefix) ? String(object.evmChainPrefix) : "",
    };
  },

  toJSON(message: MsgERC20DeployedClaim): unknown {
    const obj: any = {};
    message.eventNonce !== undefined && (obj.eventNonce = message.eventNonce);
    message.ethBlockHeight !== undefined && (obj.ethBlockHeight = message.ethBlockHeight);
    message.cosmosDenom !== undefined && (obj.cosmosDenom = message.cosmosDenom);
    message.tokenContract !== undefined && (obj.tokenContract = message.tokenContract);
    message.name !== undefined && (obj.name = message.name);
    message.symbol !== undefined && (obj.symbol = message.symbol);
    message.decimals !== undefined && (obj.decimals = message.decimals);
    message.orchestrator !== undefined && (obj.orchestrator = message.orchestrator);
    message.evmChainPrefix !== undefined && (obj.evmChainPrefix = message.evmChainPrefix);
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgERC20DeployedClaim>, I>>(base?: I): MsgERC20DeployedClaim {
    return MsgERC20DeployedClaim.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgERC20DeployedClaim>, I>>(object: I): MsgERC20DeployedClaim {
    const message = createBaseMsgERC20DeployedClaim();
    message.eventNonce = object.eventNonce ?? "0";
    message.ethBlockHeight = object.ethBlockHeight ?? "0";
    message.cosmosDenom = object.cosmosDenom ?? "";
    message.tokenContract = object.tokenContract ?? "";
    message.name = object.name ?? "";
    message.symbol = object.symbol ?? "";
    message.decimals = object.decimals ?? "0";
    message.orchestrator = object.orchestrator ?? "";
    message.evmChainPrefix = object.evmChainPrefix ?? "";
    return message;
  },
};

function createBaseMsgERC20DeployedClaimResponse(): MsgERC20DeployedClaimResponse {
  return {};
}

export const MsgERC20DeployedClaimResponse = {
  encode(_: MsgERC20DeployedClaimResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgERC20DeployedClaimResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgERC20DeployedClaimResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): MsgERC20DeployedClaimResponse {
    return {};
  },

  toJSON(_: MsgERC20DeployedClaimResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgERC20DeployedClaimResponse>, I>>(base?: I): MsgERC20DeployedClaimResponse {
    return MsgERC20DeployedClaimResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgERC20DeployedClaimResponse>, I>>(_: I): MsgERC20DeployedClaimResponse {
    const message = createBaseMsgERC20DeployedClaimResponse();
    return message;
  },
};

function createBaseMsgLogicCallExecutedClaim(): MsgLogicCallExecutedClaim {
  return {
    eventNonce: "0",
    ethBlockHeight: "0",
    invalidationId: new Uint8Array(),
    invalidationNonce: "0",
    orchestrator: "",
    evmChainPrefix: "",
  };
}

export const MsgLogicCallExecutedClaim = {
  encode(message: MsgLogicCallExecutedClaim, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.eventNonce !== "0") {
      writer.uint32(8).uint64(message.eventNonce);
    }
    if (message.ethBlockHeight !== "0") {
      writer.uint32(16).uint64(message.ethBlockHeight);
    }
    if (message.invalidationId.length !== 0) {
      writer.uint32(26).bytes(message.invalidationId);
    }
    if (message.invalidationNonce !== "0") {
      writer.uint32(32).uint64(message.invalidationNonce);
    }
    if (message.orchestrator !== "") {
      writer.uint32(42).string(message.orchestrator);
    }
    if (message.evmChainPrefix !== "") {
      writer.uint32(50).string(message.evmChainPrefix);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgLogicCallExecutedClaim {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgLogicCallExecutedClaim();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.eventNonce = longToString(reader.uint64() as Long);
          break;
        case 2:
          message.ethBlockHeight = longToString(reader.uint64() as Long);
          break;
        case 3:
          message.invalidationId = reader.bytes();
          break;
        case 4:
          message.invalidationNonce = longToString(reader.uint64() as Long);
          break;
        case 5:
          message.orchestrator = reader.string();
          break;
        case 6:
          message.evmChainPrefix = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgLogicCallExecutedClaim {
    return {
      eventNonce: isSet(object.eventNonce) ? String(object.eventNonce) : "0",
      ethBlockHeight: isSet(object.ethBlockHeight) ? String(object.ethBlockHeight) : "0",
      invalidationId: isSet(object.invalidationId) ? bytesFromBase64(object.invalidationId) : new Uint8Array(),
      invalidationNonce: isSet(object.invalidationNonce) ? String(object.invalidationNonce) : "0",
      orchestrator: isSet(object.orchestrator) ? String(object.orchestrator) : "",
      evmChainPrefix: isSet(object.evmChainPrefix) ? String(object.evmChainPrefix) : "",
    };
  },

  toJSON(message: MsgLogicCallExecutedClaim): unknown {
    const obj: any = {};
    message.eventNonce !== undefined && (obj.eventNonce = message.eventNonce);
    message.ethBlockHeight !== undefined && (obj.ethBlockHeight = message.ethBlockHeight);
    message.invalidationId !== undefined &&
      (obj.invalidationId = base64FromBytes(
        message.invalidationId !== undefined ? message.invalidationId : new Uint8Array(),
      ));
    message.invalidationNonce !== undefined && (obj.invalidationNonce = message.invalidationNonce);
    message.orchestrator !== undefined && (obj.orchestrator = message.orchestrator);
    message.evmChainPrefix !== undefined && (obj.evmChainPrefix = message.evmChainPrefix);
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgLogicCallExecutedClaim>, I>>(base?: I): MsgLogicCallExecutedClaim {
    return MsgLogicCallExecutedClaim.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgLogicCallExecutedClaim>, I>>(object: I): MsgLogicCallExecutedClaim {
    const message = createBaseMsgLogicCallExecutedClaim();
    message.eventNonce = object.eventNonce ?? "0";
    message.ethBlockHeight = object.ethBlockHeight ?? "0";
    message.invalidationId = object.invalidationId ?? new Uint8Array();
    message.invalidationNonce = object.invalidationNonce ?? "0";
    message.orchestrator = object.orchestrator ?? "";
    message.evmChainPrefix = object.evmChainPrefix ?? "";
    return message;
  },
};

function createBaseMsgLogicCallExecutedClaimResponse(): MsgLogicCallExecutedClaimResponse {
  return {};
}

export const MsgLogicCallExecutedClaimResponse = {
  encode(_: MsgLogicCallExecutedClaimResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgLogicCallExecutedClaimResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgLogicCallExecutedClaimResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): MsgLogicCallExecutedClaimResponse {
    return {};
  },

  toJSON(_: MsgLogicCallExecutedClaimResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgLogicCallExecutedClaimResponse>, I>>(
    base?: I,
  ): MsgLogicCallExecutedClaimResponse {
    return MsgLogicCallExecutedClaimResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgLogicCallExecutedClaimResponse>, I>>(
    _: I,
  ): MsgLogicCallExecutedClaimResponse {
    const message = createBaseMsgLogicCallExecutedClaimResponse();
    return message;
  },
};

function createBaseMsgValsetUpdatedClaim(): MsgValsetUpdatedClaim {
  return {
    eventNonce: "0",
    valsetNonce: "0",
    ethBlockHeight: "0",
    members: [],
    rewardAmount: "",
    rewardToken: "",
    orchestrator: "",
    evmChainPrefix: "",
  };
}

export const MsgValsetUpdatedClaim = {
  encode(message: MsgValsetUpdatedClaim, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.eventNonce !== "0") {
      writer.uint32(8).uint64(message.eventNonce);
    }
    if (message.valsetNonce !== "0") {
      writer.uint32(16).uint64(message.valsetNonce);
    }
    if (message.ethBlockHeight !== "0") {
      writer.uint32(24).uint64(message.ethBlockHeight);
    }
    for (const v of message.members) {
      BridgeValidator.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    if (message.rewardAmount !== "") {
      writer.uint32(42).string(message.rewardAmount);
    }
    if (message.rewardToken !== "") {
      writer.uint32(50).string(message.rewardToken);
    }
    if (message.orchestrator !== "") {
      writer.uint32(58).string(message.orchestrator);
    }
    if (message.evmChainPrefix !== "") {
      writer.uint32(66).string(message.evmChainPrefix);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgValsetUpdatedClaim {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgValsetUpdatedClaim();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.eventNonce = longToString(reader.uint64() as Long);
          break;
        case 2:
          message.valsetNonce = longToString(reader.uint64() as Long);
          break;
        case 3:
          message.ethBlockHeight = longToString(reader.uint64() as Long);
          break;
        case 4:
          message.members.push(BridgeValidator.decode(reader, reader.uint32()));
          break;
        case 5:
          message.rewardAmount = reader.string();
          break;
        case 6:
          message.rewardToken = reader.string();
          break;
        case 7:
          message.orchestrator = reader.string();
          break;
        case 8:
          message.evmChainPrefix = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgValsetUpdatedClaim {
    return {
      eventNonce: isSet(object.eventNonce) ? String(object.eventNonce) : "0",
      valsetNonce: isSet(object.valsetNonce) ? String(object.valsetNonce) : "0",
      ethBlockHeight: isSet(object.ethBlockHeight) ? String(object.ethBlockHeight) : "0",
      members: Array.isArray(object?.members) ? object.members.map((e: any) => BridgeValidator.fromJSON(e)) : [],
      rewardAmount: isSet(object.rewardAmount) ? String(object.rewardAmount) : "",
      rewardToken: isSet(object.rewardToken) ? String(object.rewardToken) : "",
      orchestrator: isSet(object.orchestrator) ? String(object.orchestrator) : "",
      evmChainPrefix: isSet(object.evmChainPrefix) ? String(object.evmChainPrefix) : "",
    };
  },

  toJSON(message: MsgValsetUpdatedClaim): unknown {
    const obj: any = {};
    message.eventNonce !== undefined && (obj.eventNonce = message.eventNonce);
    message.valsetNonce !== undefined && (obj.valsetNonce = message.valsetNonce);
    message.ethBlockHeight !== undefined && (obj.ethBlockHeight = message.ethBlockHeight);
    if (message.members) {
      obj.members = message.members.map((e) => e ? BridgeValidator.toJSON(e) : undefined);
    } else {
      obj.members = [];
    }
    message.rewardAmount !== undefined && (obj.rewardAmount = message.rewardAmount);
    message.rewardToken !== undefined && (obj.rewardToken = message.rewardToken);
    message.orchestrator !== undefined && (obj.orchestrator = message.orchestrator);
    message.evmChainPrefix !== undefined && (obj.evmChainPrefix = message.evmChainPrefix);
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgValsetUpdatedClaim>, I>>(base?: I): MsgValsetUpdatedClaim {
    return MsgValsetUpdatedClaim.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgValsetUpdatedClaim>, I>>(object: I): MsgValsetUpdatedClaim {
    const message = createBaseMsgValsetUpdatedClaim();
    message.eventNonce = object.eventNonce ?? "0";
    message.valsetNonce = object.valsetNonce ?? "0";
    message.ethBlockHeight = object.ethBlockHeight ?? "0";
    message.members = object.members?.map((e) => BridgeValidator.fromPartial(e)) || [];
    message.rewardAmount = object.rewardAmount ?? "";
    message.rewardToken = object.rewardToken ?? "";
    message.orchestrator = object.orchestrator ?? "";
    message.evmChainPrefix = object.evmChainPrefix ?? "";
    return message;
  },
};

function createBaseMsgValsetUpdatedClaimResponse(): MsgValsetUpdatedClaimResponse {
  return {};
}

export const MsgValsetUpdatedClaimResponse = {
  encode(_: MsgValsetUpdatedClaimResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgValsetUpdatedClaimResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgValsetUpdatedClaimResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): MsgValsetUpdatedClaimResponse {
    return {};
  },

  toJSON(_: MsgValsetUpdatedClaimResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgValsetUpdatedClaimResponse>, I>>(base?: I): MsgValsetUpdatedClaimResponse {
    return MsgValsetUpdatedClaimResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgValsetUpdatedClaimResponse>, I>>(_: I): MsgValsetUpdatedClaimResponse {
    const message = createBaseMsgValsetUpdatedClaimResponse();
    return message;
  },
};

function createBaseMsgCancelSendToEth(): MsgCancelSendToEth {
  return { transactionId: "0", sender: "", evmChainPrefix: "" };
}

export const MsgCancelSendToEth = {
  encode(message: MsgCancelSendToEth, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.transactionId !== "0") {
      writer.uint32(8).uint64(message.transactionId);
    }
    if (message.sender !== "") {
      writer.uint32(18).string(message.sender);
    }
    if (message.evmChainPrefix !== "") {
      writer.uint32(26).string(message.evmChainPrefix);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCancelSendToEth {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCancelSendToEth();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.transactionId = longToString(reader.uint64() as Long);
          break;
        case 2:
          message.sender = reader.string();
          break;
        case 3:
          message.evmChainPrefix = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgCancelSendToEth {
    return {
      transactionId: isSet(object.transactionId) ? String(object.transactionId) : "0",
      sender: isSet(object.sender) ? String(object.sender) : "",
      evmChainPrefix: isSet(object.evmChainPrefix) ? String(object.evmChainPrefix) : "",
    };
  },

  toJSON(message: MsgCancelSendToEth): unknown {
    const obj: any = {};
    message.transactionId !== undefined && (obj.transactionId = message.transactionId);
    message.sender !== undefined && (obj.sender = message.sender);
    message.evmChainPrefix !== undefined && (obj.evmChainPrefix = message.evmChainPrefix);
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgCancelSendToEth>, I>>(base?: I): MsgCancelSendToEth {
    return MsgCancelSendToEth.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgCancelSendToEth>, I>>(object: I): MsgCancelSendToEth {
    const message = createBaseMsgCancelSendToEth();
    message.transactionId = object.transactionId ?? "0";
    message.sender = object.sender ?? "";
    message.evmChainPrefix = object.evmChainPrefix ?? "";
    return message;
  },
};

function createBaseMsgCancelSendToEthResponse(): MsgCancelSendToEthResponse {
  return {};
}

export const MsgCancelSendToEthResponse = {
  encode(_: MsgCancelSendToEthResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCancelSendToEthResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCancelSendToEthResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): MsgCancelSendToEthResponse {
    return {};
  },

  toJSON(_: MsgCancelSendToEthResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgCancelSendToEthResponse>, I>>(base?: I): MsgCancelSendToEthResponse {
    return MsgCancelSendToEthResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgCancelSendToEthResponse>, I>>(_: I): MsgCancelSendToEthResponse {
    const message = createBaseMsgCancelSendToEthResponse();
    return message;
  },
};

function createBaseMsgSubmitBadSignatureEvidence(): MsgSubmitBadSignatureEvidence {
  return { subject: undefined, signature: "", sender: "", evmChainPrefix: "" };
}

export const MsgSubmitBadSignatureEvidence = {
  encode(message: MsgSubmitBadSignatureEvidence, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.subject !== undefined) {
      Any.encode(message.subject, writer.uint32(10).fork()).ldelim();
    }
    if (message.signature !== "") {
      writer.uint32(18).string(message.signature);
    }
    if (message.sender !== "") {
      writer.uint32(26).string(message.sender);
    }
    if (message.evmChainPrefix !== "") {
      writer.uint32(34).string(message.evmChainPrefix);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSubmitBadSignatureEvidence {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSubmitBadSignatureEvidence();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.subject = Any.decode(reader, reader.uint32());
          break;
        case 2:
          message.signature = reader.string();
          break;
        case 3:
          message.sender = reader.string();
          break;
        case 4:
          message.evmChainPrefix = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgSubmitBadSignatureEvidence {
    return {
      subject: isSet(object.subject) ? Any.fromJSON(object.subject) : undefined,
      signature: isSet(object.signature) ? String(object.signature) : "",
      sender: isSet(object.sender) ? String(object.sender) : "",
      evmChainPrefix: isSet(object.evmChainPrefix) ? String(object.evmChainPrefix) : "",
    };
  },

  toJSON(message: MsgSubmitBadSignatureEvidence): unknown {
    const obj: any = {};
    message.subject !== undefined && (obj.subject = message.subject ? Any.toJSON(message.subject) : undefined);
    message.signature !== undefined && (obj.signature = message.signature);
    message.sender !== undefined && (obj.sender = message.sender);
    message.evmChainPrefix !== undefined && (obj.evmChainPrefix = message.evmChainPrefix);
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgSubmitBadSignatureEvidence>, I>>(base?: I): MsgSubmitBadSignatureEvidence {
    return MsgSubmitBadSignatureEvidence.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgSubmitBadSignatureEvidence>, I>>(
    object: I,
  ): MsgSubmitBadSignatureEvidence {
    const message = createBaseMsgSubmitBadSignatureEvidence();
    message.subject = (object.subject !== undefined && object.subject !== null)
      ? Any.fromPartial(object.subject)
      : undefined;
    message.signature = object.signature ?? "";
    message.sender = object.sender ?? "";
    message.evmChainPrefix = object.evmChainPrefix ?? "";
    return message;
  },
};

function createBaseMsgSubmitBadSignatureEvidenceResponse(): MsgSubmitBadSignatureEvidenceResponse {
  return {};
}

export const MsgSubmitBadSignatureEvidenceResponse = {
  encode(_: MsgSubmitBadSignatureEvidenceResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSubmitBadSignatureEvidenceResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSubmitBadSignatureEvidenceResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): MsgSubmitBadSignatureEvidenceResponse {
    return {};
  },

  toJSON(_: MsgSubmitBadSignatureEvidenceResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgSubmitBadSignatureEvidenceResponse>, I>>(
    base?: I,
  ): MsgSubmitBadSignatureEvidenceResponse {
    return MsgSubmitBadSignatureEvidenceResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgSubmitBadSignatureEvidenceResponse>, I>>(
    _: I,
  ): MsgSubmitBadSignatureEvidenceResponse {
    const message = createBaseMsgSubmitBadSignatureEvidenceResponse();
    return message;
  },
};

function createBaseEventSetOperatorAddress(): EventSetOperatorAddress {
  return { message: "", address: "" };
}

export const EventSetOperatorAddress = {
  encode(message: EventSetOperatorAddress, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.message !== "") {
      writer.uint32(10).string(message.message);
    }
    if (message.address !== "") {
      writer.uint32(18).string(message.address);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventSetOperatorAddress {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventSetOperatorAddress();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.message = reader.string();
          break;
        case 2:
          message.address = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EventSetOperatorAddress {
    return {
      message: isSet(object.message) ? String(object.message) : "",
      address: isSet(object.address) ? String(object.address) : "",
    };
  },

  toJSON(message: EventSetOperatorAddress): unknown {
    const obj: any = {};
    message.message !== undefined && (obj.message = message.message);
    message.address !== undefined && (obj.address = message.address);
    return obj;
  },

  create<I extends Exact<DeepPartial<EventSetOperatorAddress>, I>>(base?: I): EventSetOperatorAddress {
    return EventSetOperatorAddress.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<EventSetOperatorAddress>, I>>(object: I): EventSetOperatorAddress {
    const message = createBaseEventSetOperatorAddress();
    message.message = object.message ?? "";
    message.address = object.address ?? "";
    return message;
  },
};

function createBaseEventValsetConfirmKey(): EventValsetConfirmKey {
  return { message: "", key: "" };
}

export const EventValsetConfirmKey = {
  encode(message: EventValsetConfirmKey, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.message !== "") {
      writer.uint32(10).string(message.message);
    }
    if (message.key !== "") {
      writer.uint32(18).string(message.key);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventValsetConfirmKey {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventValsetConfirmKey();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.message = reader.string();
          break;
        case 2:
          message.key = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EventValsetConfirmKey {
    return {
      message: isSet(object.message) ? String(object.message) : "",
      key: isSet(object.key) ? String(object.key) : "",
    };
  },

  toJSON(message: EventValsetConfirmKey): unknown {
    const obj: any = {};
    message.message !== undefined && (obj.message = message.message);
    message.key !== undefined && (obj.key = message.key);
    return obj;
  },

  create<I extends Exact<DeepPartial<EventValsetConfirmKey>, I>>(base?: I): EventValsetConfirmKey {
    return EventValsetConfirmKey.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<EventValsetConfirmKey>, I>>(object: I): EventValsetConfirmKey {
    const message = createBaseEventValsetConfirmKey();
    message.message = object.message ?? "";
    message.key = object.key ?? "";
    return message;
  },
};

function createBaseEventBatchCreated(): EventBatchCreated {
  return { message: "", batchNonce: "" };
}

export const EventBatchCreated = {
  encode(message: EventBatchCreated, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.message !== "") {
      writer.uint32(10).string(message.message);
    }
    if (message.batchNonce !== "") {
      writer.uint32(18).string(message.batchNonce);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventBatchCreated {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventBatchCreated();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.message = reader.string();
          break;
        case 2:
          message.batchNonce = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EventBatchCreated {
    return {
      message: isSet(object.message) ? String(object.message) : "",
      batchNonce: isSet(object.batchNonce) ? String(object.batchNonce) : "",
    };
  },

  toJSON(message: EventBatchCreated): unknown {
    const obj: any = {};
    message.message !== undefined && (obj.message = message.message);
    message.batchNonce !== undefined && (obj.batchNonce = message.batchNonce);
    return obj;
  },

  create<I extends Exact<DeepPartial<EventBatchCreated>, I>>(base?: I): EventBatchCreated {
    return EventBatchCreated.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<EventBatchCreated>, I>>(object: I): EventBatchCreated {
    const message = createBaseEventBatchCreated();
    message.message = object.message ?? "";
    message.batchNonce = object.batchNonce ?? "";
    return message;
  },
};

function createBaseEventBatchConfirmKey(): EventBatchConfirmKey {
  return { message: "", batchConfirmKey: "" };
}

export const EventBatchConfirmKey = {
  encode(message: EventBatchConfirmKey, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.message !== "") {
      writer.uint32(10).string(message.message);
    }
    if (message.batchConfirmKey !== "") {
      writer.uint32(18).string(message.batchConfirmKey);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventBatchConfirmKey {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventBatchConfirmKey();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.message = reader.string();
          break;
        case 2:
          message.batchConfirmKey = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EventBatchConfirmKey {
    return {
      message: isSet(object.message) ? String(object.message) : "",
      batchConfirmKey: isSet(object.batchConfirmKey) ? String(object.batchConfirmKey) : "",
    };
  },

  toJSON(message: EventBatchConfirmKey): unknown {
    const obj: any = {};
    message.message !== undefined && (obj.message = message.message);
    message.batchConfirmKey !== undefined && (obj.batchConfirmKey = message.batchConfirmKey);
    return obj;
  },

  create<I extends Exact<DeepPartial<EventBatchConfirmKey>, I>>(base?: I): EventBatchConfirmKey {
    return EventBatchConfirmKey.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<EventBatchConfirmKey>, I>>(object: I): EventBatchConfirmKey {
    const message = createBaseEventBatchConfirmKey();
    message.message = object.message ?? "";
    message.batchConfirmKey = object.batchConfirmKey ?? "";
    return message;
  },
};

function createBaseEventBatchSendToEthClaim(): EventBatchSendToEthClaim {
  return { nonce: "" };
}

export const EventBatchSendToEthClaim = {
  encode(message: EventBatchSendToEthClaim, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.nonce !== "") {
      writer.uint32(10).string(message.nonce);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventBatchSendToEthClaim {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventBatchSendToEthClaim();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.nonce = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EventBatchSendToEthClaim {
    return { nonce: isSet(object.nonce) ? String(object.nonce) : "" };
  },

  toJSON(message: EventBatchSendToEthClaim): unknown {
    const obj: any = {};
    message.nonce !== undefined && (obj.nonce = message.nonce);
    return obj;
  },

  create<I extends Exact<DeepPartial<EventBatchSendToEthClaim>, I>>(base?: I): EventBatchSendToEthClaim {
    return EventBatchSendToEthClaim.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<EventBatchSendToEthClaim>, I>>(object: I): EventBatchSendToEthClaim {
    const message = createBaseEventBatchSendToEthClaim();
    message.nonce = object.nonce ?? "";
    return message;
  },
};

function createBaseEventClaim(): EventClaim {
  return { message: "", claimHash: "", attestationId: "" };
}

export const EventClaim = {
  encode(message: EventClaim, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.message !== "") {
      writer.uint32(10).string(message.message);
    }
    if (message.claimHash !== "") {
      writer.uint32(18).string(message.claimHash);
    }
    if (message.attestationId !== "") {
      writer.uint32(26).string(message.attestationId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventClaim {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventClaim();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.message = reader.string();
          break;
        case 2:
          message.claimHash = reader.string();
          break;
        case 3:
          message.attestationId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EventClaim {
    return {
      message: isSet(object.message) ? String(object.message) : "",
      claimHash: isSet(object.claimHash) ? String(object.claimHash) : "",
      attestationId: isSet(object.attestationId) ? String(object.attestationId) : "",
    };
  },

  toJSON(message: EventClaim): unknown {
    const obj: any = {};
    message.message !== undefined && (obj.message = message.message);
    message.claimHash !== undefined && (obj.claimHash = message.claimHash);
    message.attestationId !== undefined && (obj.attestationId = message.attestationId);
    return obj;
  },

  create<I extends Exact<DeepPartial<EventClaim>, I>>(base?: I): EventClaim {
    return EventClaim.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<EventClaim>, I>>(object: I): EventClaim {
    const message = createBaseEventClaim();
    message.message = object.message ?? "";
    message.claimHash = object.claimHash ?? "";
    message.attestationId = object.attestationId ?? "";
    return message;
  },
};

function createBaseEventBadSignatureEvidence(): EventBadSignatureEvidence {
  return { message: "", badEthSignature: "", badEthSignatureSubject: "" };
}

export const EventBadSignatureEvidence = {
  encode(message: EventBadSignatureEvidence, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.message !== "") {
      writer.uint32(10).string(message.message);
    }
    if (message.badEthSignature !== "") {
      writer.uint32(18).string(message.badEthSignature);
    }
    if (message.badEthSignatureSubject !== "") {
      writer.uint32(26).string(message.badEthSignatureSubject);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventBadSignatureEvidence {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventBadSignatureEvidence();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.message = reader.string();
          break;
        case 2:
          message.badEthSignature = reader.string();
          break;
        case 3:
          message.badEthSignatureSubject = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EventBadSignatureEvidence {
    return {
      message: isSet(object.message) ? String(object.message) : "",
      badEthSignature: isSet(object.badEthSignature) ? String(object.badEthSignature) : "",
      badEthSignatureSubject: isSet(object.badEthSignatureSubject) ? String(object.badEthSignatureSubject) : "",
    };
  },

  toJSON(message: EventBadSignatureEvidence): unknown {
    const obj: any = {};
    message.message !== undefined && (obj.message = message.message);
    message.badEthSignature !== undefined && (obj.badEthSignature = message.badEthSignature);
    message.badEthSignatureSubject !== undefined && (obj.badEthSignatureSubject = message.badEthSignatureSubject);
    return obj;
  },

  create<I extends Exact<DeepPartial<EventBadSignatureEvidence>, I>>(base?: I): EventBadSignatureEvidence {
    return EventBadSignatureEvidence.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<EventBadSignatureEvidence>, I>>(object: I): EventBadSignatureEvidence {
    const message = createBaseEventBadSignatureEvidence();
    message.message = object.message ?? "";
    message.badEthSignature = object.badEthSignature ?? "";
    message.badEthSignatureSubject = object.badEthSignatureSubject ?? "";
    return message;
  },
};

function createBaseEventERC20DeployedClaim(): EventERC20DeployedClaim {
  return { token: "", nonce: "" };
}

export const EventERC20DeployedClaim = {
  encode(message: EventERC20DeployedClaim, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.token !== "") {
      writer.uint32(10).string(message.token);
    }
    if (message.nonce !== "") {
      writer.uint32(18).string(message.nonce);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventERC20DeployedClaim {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventERC20DeployedClaim();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.token = reader.string();
          break;
        case 2:
          message.nonce = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EventERC20DeployedClaim {
    return {
      token: isSet(object.token) ? String(object.token) : "",
      nonce: isSet(object.nonce) ? String(object.nonce) : "",
    };
  },

  toJSON(message: EventERC20DeployedClaim): unknown {
    const obj: any = {};
    message.token !== undefined && (obj.token = message.token);
    message.nonce !== undefined && (obj.nonce = message.nonce);
    return obj;
  },

  create<I extends Exact<DeepPartial<EventERC20DeployedClaim>, I>>(base?: I): EventERC20DeployedClaim {
    return EventERC20DeployedClaim.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<EventERC20DeployedClaim>, I>>(object: I): EventERC20DeployedClaim {
    const message = createBaseEventERC20DeployedClaim();
    message.token = object.token ?? "";
    message.nonce = object.nonce ?? "";
    return message;
  },
};

function createBaseEventValsetUpdatedClaim(): EventValsetUpdatedClaim {
  return { nonce: "" };
}

export const EventValsetUpdatedClaim = {
  encode(message: EventValsetUpdatedClaim, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.nonce !== "") {
      writer.uint32(10).string(message.nonce);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventValsetUpdatedClaim {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventValsetUpdatedClaim();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.nonce = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EventValsetUpdatedClaim {
    return { nonce: isSet(object.nonce) ? String(object.nonce) : "" };
  },

  toJSON(message: EventValsetUpdatedClaim): unknown {
    const obj: any = {};
    message.nonce !== undefined && (obj.nonce = message.nonce);
    return obj;
  },

  create<I extends Exact<DeepPartial<EventValsetUpdatedClaim>, I>>(base?: I): EventValsetUpdatedClaim {
    return EventValsetUpdatedClaim.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<EventValsetUpdatedClaim>, I>>(object: I): EventValsetUpdatedClaim {
    const message = createBaseEventValsetUpdatedClaim();
    message.nonce = object.nonce ?? "";
    return message;
  },
};

function createBaseEventMultisigUpdateRequest(): EventMultisigUpdateRequest {
  return { bridgeContract: "", bridgeChainId: "", multisigId: "", nonce: "" };
}

export const EventMultisigUpdateRequest = {
  encode(message: EventMultisigUpdateRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.bridgeContract !== "") {
      writer.uint32(10).string(message.bridgeContract);
    }
    if (message.bridgeChainId !== "") {
      writer.uint32(18).string(message.bridgeChainId);
    }
    if (message.multisigId !== "") {
      writer.uint32(26).string(message.multisigId);
    }
    if (message.nonce !== "") {
      writer.uint32(34).string(message.nonce);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventMultisigUpdateRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventMultisigUpdateRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.bridgeContract = reader.string();
          break;
        case 2:
          message.bridgeChainId = reader.string();
          break;
        case 3:
          message.multisigId = reader.string();
          break;
        case 4:
          message.nonce = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EventMultisigUpdateRequest {
    return {
      bridgeContract: isSet(object.bridgeContract) ? String(object.bridgeContract) : "",
      bridgeChainId: isSet(object.bridgeChainId) ? String(object.bridgeChainId) : "",
      multisigId: isSet(object.multisigId) ? String(object.multisigId) : "",
      nonce: isSet(object.nonce) ? String(object.nonce) : "",
    };
  },

  toJSON(message: EventMultisigUpdateRequest): unknown {
    const obj: any = {};
    message.bridgeContract !== undefined && (obj.bridgeContract = message.bridgeContract);
    message.bridgeChainId !== undefined && (obj.bridgeChainId = message.bridgeChainId);
    message.multisigId !== undefined && (obj.multisigId = message.multisigId);
    message.nonce !== undefined && (obj.nonce = message.nonce);
    return obj;
  },

  create<I extends Exact<DeepPartial<EventMultisigUpdateRequest>, I>>(base?: I): EventMultisigUpdateRequest {
    return EventMultisigUpdateRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<EventMultisigUpdateRequest>, I>>(object: I): EventMultisigUpdateRequest {
    const message = createBaseEventMultisigUpdateRequest();
    message.bridgeContract = object.bridgeContract ?? "";
    message.bridgeChainId = object.bridgeChainId ?? "";
    message.multisigId = object.multisigId ?? "";
    message.nonce = object.nonce ?? "";
    return message;
  },
};

function createBaseEventOutgoingLogicCallCanceled(): EventOutgoingLogicCallCanceled {
  return { logicCallInvalidationId: "", logicCallInvalidationNonce: "" };
}

export const EventOutgoingLogicCallCanceled = {
  encode(message: EventOutgoingLogicCallCanceled, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.logicCallInvalidationId !== "") {
      writer.uint32(10).string(message.logicCallInvalidationId);
    }
    if (message.logicCallInvalidationNonce !== "") {
      writer.uint32(18).string(message.logicCallInvalidationNonce);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventOutgoingLogicCallCanceled {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventOutgoingLogicCallCanceled();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.logicCallInvalidationId = reader.string();
          break;
        case 2:
          message.logicCallInvalidationNonce = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EventOutgoingLogicCallCanceled {
    return {
      logicCallInvalidationId: isSet(object.logicCallInvalidationId) ? String(object.logicCallInvalidationId) : "",
      logicCallInvalidationNonce: isSet(object.logicCallInvalidationNonce)
        ? String(object.logicCallInvalidationNonce)
        : "",
    };
  },

  toJSON(message: EventOutgoingLogicCallCanceled): unknown {
    const obj: any = {};
    message.logicCallInvalidationId !== undefined && (obj.logicCallInvalidationId = message.logicCallInvalidationId);
    message.logicCallInvalidationNonce !== undefined &&
      (obj.logicCallInvalidationNonce = message.logicCallInvalidationNonce);
    return obj;
  },

  create<I extends Exact<DeepPartial<EventOutgoingLogicCallCanceled>, I>>(base?: I): EventOutgoingLogicCallCanceled {
    return EventOutgoingLogicCallCanceled.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<EventOutgoingLogicCallCanceled>, I>>(
    object: I,
  ): EventOutgoingLogicCallCanceled {
    const message = createBaseEventOutgoingLogicCallCanceled();
    message.logicCallInvalidationId = object.logicCallInvalidationId ?? "";
    message.logicCallInvalidationNonce = object.logicCallInvalidationNonce ?? "";
    return message;
  },
};

function createBaseEventSignatureSlashing(): EventSignatureSlashing {
  return { type: "", address: "" };
}

export const EventSignatureSlashing = {
  encode(message: EventSignatureSlashing, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.type !== "") {
      writer.uint32(10).string(message.type);
    }
    if (message.address !== "") {
      writer.uint32(18).string(message.address);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventSignatureSlashing {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventSignatureSlashing();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.type = reader.string();
          break;
        case 2:
          message.address = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EventSignatureSlashing {
    return {
      type: isSet(object.type) ? String(object.type) : "",
      address: isSet(object.address) ? String(object.address) : "",
    };
  },

  toJSON(message: EventSignatureSlashing): unknown {
    const obj: any = {};
    message.type !== undefined && (obj.type = message.type);
    message.address !== undefined && (obj.address = message.address);
    return obj;
  },

  create<I extends Exact<DeepPartial<EventSignatureSlashing>, I>>(base?: I): EventSignatureSlashing {
    return EventSignatureSlashing.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<EventSignatureSlashing>, I>>(object: I): EventSignatureSlashing {
    const message = createBaseEventSignatureSlashing();
    message.type = object.type ?? "";
    message.address = object.address ?? "";
    return message;
  },
};

function createBaseEventOutgoingTxId(): EventOutgoingTxId {
  return { message: "", txId: "" };
}

export const EventOutgoingTxId = {
  encode(message: EventOutgoingTxId, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.message !== "") {
      writer.uint32(10).string(message.message);
    }
    if (message.txId !== "") {
      writer.uint32(18).string(message.txId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventOutgoingTxId {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventOutgoingTxId();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.message = reader.string();
          break;
        case 2:
          message.txId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EventOutgoingTxId {
    return {
      message: isSet(object.message) ? String(object.message) : "",
      txId: isSet(object.txId) ? String(object.txId) : "",
    };
  },

  toJSON(message: EventOutgoingTxId): unknown {
    const obj: any = {};
    message.message !== undefined && (obj.message = message.message);
    message.txId !== undefined && (obj.txId = message.txId);
    return obj;
  },

  create<I extends Exact<DeepPartial<EventOutgoingTxId>, I>>(base?: I): EventOutgoingTxId {
    return EventOutgoingTxId.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<EventOutgoingTxId>, I>>(object: I): EventOutgoingTxId {
    const message = createBaseEventOutgoingTxId();
    message.message = object.message ?? "";
    message.txId = object.txId ?? "";
    return message;
  },
};

/** Msg defines the state transitions possible within gravity */
export interface Msg {
  ValsetConfirm(request: MsgValsetConfirm): Promise<MsgValsetConfirmResponse>;
  SendToEth(request: MsgSendToEth): Promise<MsgSendToEthResponse>;
  RequestBatch(request: MsgRequestBatch): Promise<MsgRequestBatchResponse>;
  ConfirmBatch(request: MsgConfirmBatch): Promise<MsgConfirmBatchResponse>;
  ConfirmLogicCall(request: MsgConfirmLogicCall): Promise<MsgConfirmLogicCallResponse>;
  SendToCosmosClaim(request: MsgSendToCosmosClaim): Promise<MsgSendToCosmosClaimResponse>;
  ExecuteIbcAutoForwards(request: MsgExecuteIbcAutoForwards): Promise<MsgExecuteIbcAutoForwardsResponse>;
  BatchSendToEthClaim(request: MsgBatchSendToEthClaim): Promise<MsgBatchSendToEthClaimResponse>;
  ValsetUpdateClaim(request: MsgValsetUpdatedClaim): Promise<MsgValsetUpdatedClaimResponse>;
  ERC20DeployedClaim(request: MsgERC20DeployedClaim): Promise<MsgERC20DeployedClaimResponse>;
  LogicCallExecutedClaim(request: MsgLogicCallExecutedClaim): Promise<MsgLogicCallExecutedClaimResponse>;
  SetOrchestratorAddress(request: MsgSetOrchestratorAddress): Promise<MsgSetOrchestratorAddressResponse>;
  CancelSendToEth(request: MsgCancelSendToEth): Promise<MsgCancelSendToEthResponse>;
  SubmitBadSignatureEvidence(request: MsgSubmitBadSignatureEvidence): Promise<MsgSubmitBadSignatureEvidenceResponse>;
}

declare var self: any | undefined;
declare var window: any | undefined;
declare var global: any | undefined;
var tsProtoGlobalThis: any = (() => {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw "Unable to locate global object";
})();

function bytesFromBase64(b64: string): Uint8Array {
  if (tsProtoGlobalThis.Buffer) {
    return Uint8Array.from(tsProtoGlobalThis.Buffer.from(b64, "base64"));
  } else {
    const bin = tsProtoGlobalThis.atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; ++i) {
      arr[i] = bin.charCodeAt(i);
    }
    return arr;
  }
}

function base64FromBytes(arr: Uint8Array): string {
  if (tsProtoGlobalThis.Buffer) {
    return tsProtoGlobalThis.Buffer.from(arr).toString("base64");
  } else {
    const bin: string[] = [];
    arr.forEach((byte) => {
      bin.push(String.fromCharCode(byte));
    });
    return tsProtoGlobalThis.btoa(bin.join(""));
  }
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function longToString(long: Long) {
  return long.toString();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}

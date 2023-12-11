/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { Metadata } from "../../cosmos/bank/v1beta1/bank";
import { Coin } from "../../cosmos/base/v1beta1/coin";

export const protobufPackage = "gravity.v1";

/** BridgeValidator represents a validator's ETH address and its power */
export interface BridgeValidator {
  power: string;
  ethereumAddress: string;
}

/**
 * Valset is the Ethereum Bridge Multsig Set, each gravity validator also
 * maintains an ETH key to sign messages, these are used to check signatures on
 * ETH because of the significant gas savings
 */
export interface Valset {
  nonce: string;
  members: BridgeValidator[];
  height: string;
  rewardAmount: string;
  /** the reward token in it's Ethereum hex address representation */
  rewardToken: string;
}

/**
 * LastObservedEthereumBlockHeight stores the last observed
 * Ethereum block height along with the Cosmos block height that
 * it was observed at. These two numbers can be used to project
 * outward and always produce batches with timeouts in the future
 * even if no Ethereum block height has been relayed for a long time
 */
export interface LastObservedEthereumBlockHeight {
  cosmosBlockHeight: string;
  ethereumBlockHeight: string;
}

/**
 * This records the relationship between an ERC20 token and the denom
 * of the corresponding Cosmos originated asset
 */
export interface ERC20ToDenom {
  erc20: string;
  denom: string;
}

/**
 * UnhaltBridgeProposal defines a custom governance proposal useful for
 * restoring the bridge after a oracle disagreement. Once this proposal is
 * passed bridge state will roll back events to the nonce provided in
 * target_nonce if and only if those events have not yet been observed (executed
 * on the Cosmos chain). This allows for easy handling of cases where for
 * example an Ethereum hardfork has occured and more than 1/3 of the vlaidtor
 * set disagrees with the rest. Normally this would require a chain halt, manual
 * genesis editing and restar to resolve with this feature a governance proposal
 * can be used instead
 */
export interface UnhaltBridgeProposal {
  title: string;
  description: string;
  targetNonce: string;
  evmChainPrefix: string;
}

/**
 * AirdropProposal defines a custom governance proposal type that allows an
 * airdrop to occur in a decentralized fashion. A list of destination addresses
 * and an amount per airdrop recipient is provided. The funds for this airdrop
 * are removed from the Community Pool, if the community pool does not have
 * sufficient funding to perform the airdrop to all provided recipients nothing
 * will occur
 */
export interface AirdropProposal {
  title: string;
  description: string;
  denom: string;
  recipients: Uint8Array;
  amounts: string[];
}

/**
 * IBCMetadataProposal defines a custom governance proposal type that allows
 * governance to set the metadata for an IBC token, this will allow Gravity to
 * deploy an ERC20 representing this token on Ethereum Name: the token name
 * Symbol: the token symbol
 * Description: the token description, not sent to ETH at all, only used on
 * Cosmos Display: the token display name (only used on Cosmos to decide ERC20
 * Decimals) Deicmals: the decimals for the display unit ibc_denom is the denom
 * of the token in question on this chain
 */
export interface IBCMetadataProposal {
  title: string;
  description: string;
  metadata: Metadata | undefined;
  ibcDenom: string;
  evmChainPrefix: string;
}

/**
 * AddEvmChainProposal
 * this types allows users to add new EVM chain through gov proposal
 */
export interface AddEvmChainProposal {
  title: string;
  description: string;
  evmChainName: string;
  evmChainPrefix: string;
  evmChainNetVersion: string;
  gravityId: string;
  bridgeEthereumAddress: string;
}

/**
 * PendingIbcAutoForward represents a SendToCosmos transaction with a foreign CosmosReceiver which will be added to the
 * PendingIbcAutoForward queue in attestation_handler and sent over IBC on some submission of a MsgExecuteIbcAutoForwards
 */
export interface PendingIbcAutoForward {
  /** the destination address. sdk.AccAddress does not preserve foreign prefixes */
  foreignReceiver: string;
  /** the token sent from ethereum to the ibc-enabled chain over `IbcChannel` */
  token:
    | Coin
    | undefined;
  /** the IBC channel to send `Amount` over via ibc-transfer module */
  ibcChannel: string;
  /** the EventNonce from the MsgSendToCosmosClaim, used for ordering the queue */
  eventNonce: string;
}

function createBaseBridgeValidator(): BridgeValidator {
  return { power: "0", ethereumAddress: "" };
}

export const BridgeValidator = {
  encode(message: BridgeValidator, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.power !== "0") {
      writer.uint32(8).uint64(message.power);
    }
    if (message.ethereumAddress !== "") {
      writer.uint32(18).string(message.ethereumAddress);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BridgeValidator {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBridgeValidator();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.power = longToString(reader.uint64() as Long);
          break;
        case 2:
          message.ethereumAddress = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): BridgeValidator {
    return {
      power: isSet(object.power) ? String(object.power) : "0",
      ethereumAddress: isSet(object.ethereumAddress) ? String(object.ethereumAddress) : "",
    };
  },

  toJSON(message: BridgeValidator): unknown {
    const obj: any = {};
    message.power !== undefined && (obj.power = message.power);
    message.ethereumAddress !== undefined && (obj.ethereumAddress = message.ethereumAddress);
    return obj;
  },

  create<I extends Exact<DeepPartial<BridgeValidator>, I>>(base?: I): BridgeValidator {
    return BridgeValidator.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<BridgeValidator>, I>>(object: I): BridgeValidator {
    const message = createBaseBridgeValidator();
    message.power = object.power ?? "0";
    message.ethereumAddress = object.ethereumAddress ?? "";
    return message;
  },
};

function createBaseValset(): Valset {
  return { nonce: "0", members: [], height: "0", rewardAmount: "", rewardToken: "" };
}

export const Valset = {
  encode(message: Valset, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.nonce !== "0") {
      writer.uint32(8).uint64(message.nonce);
    }
    for (const v of message.members) {
      BridgeValidator.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.height !== "0") {
      writer.uint32(24).uint64(message.height);
    }
    if (message.rewardAmount !== "") {
      writer.uint32(34).string(message.rewardAmount);
    }
    if (message.rewardToken !== "") {
      writer.uint32(42).string(message.rewardToken);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Valset {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseValset();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.nonce = longToString(reader.uint64() as Long);
          break;
        case 2:
          message.members.push(BridgeValidator.decode(reader, reader.uint32()));
          break;
        case 3:
          message.height = longToString(reader.uint64() as Long);
          break;
        case 4:
          message.rewardAmount = reader.string();
          break;
        case 5:
          message.rewardToken = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Valset {
    return {
      nonce: isSet(object.nonce) ? String(object.nonce) : "0",
      members: Array.isArray(object?.members) ? object.members.map((e: any) => BridgeValidator.fromJSON(e)) : [],
      height: isSet(object.height) ? String(object.height) : "0",
      rewardAmount: isSet(object.rewardAmount) ? String(object.rewardAmount) : "",
      rewardToken: isSet(object.rewardToken) ? String(object.rewardToken) : "",
    };
  },

  toJSON(message: Valset): unknown {
    const obj: any = {};
    message.nonce !== undefined && (obj.nonce = message.nonce);
    if (message.members) {
      obj.members = message.members.map((e) => e ? BridgeValidator.toJSON(e) : undefined);
    } else {
      obj.members = [];
    }
    message.height !== undefined && (obj.height = message.height);
    message.rewardAmount !== undefined && (obj.rewardAmount = message.rewardAmount);
    message.rewardToken !== undefined && (obj.rewardToken = message.rewardToken);
    return obj;
  },

  create<I extends Exact<DeepPartial<Valset>, I>>(base?: I): Valset {
    return Valset.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Valset>, I>>(object: I): Valset {
    const message = createBaseValset();
    message.nonce = object.nonce ?? "0";
    message.members = object.members?.map((e) => BridgeValidator.fromPartial(e)) || [];
    message.height = object.height ?? "0";
    message.rewardAmount = object.rewardAmount ?? "";
    message.rewardToken = object.rewardToken ?? "";
    return message;
  },
};

function createBaseLastObservedEthereumBlockHeight(): LastObservedEthereumBlockHeight {
  return { cosmosBlockHeight: "0", ethereumBlockHeight: "0" };
}

export const LastObservedEthereumBlockHeight = {
  encode(message: LastObservedEthereumBlockHeight, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.cosmosBlockHeight !== "0") {
      writer.uint32(8).uint64(message.cosmosBlockHeight);
    }
    if (message.ethereumBlockHeight !== "0") {
      writer.uint32(16).uint64(message.ethereumBlockHeight);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LastObservedEthereumBlockHeight {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLastObservedEthereumBlockHeight();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.cosmosBlockHeight = longToString(reader.uint64() as Long);
          break;
        case 2:
          message.ethereumBlockHeight = longToString(reader.uint64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): LastObservedEthereumBlockHeight {
    return {
      cosmosBlockHeight: isSet(object.cosmosBlockHeight) ? String(object.cosmosBlockHeight) : "0",
      ethereumBlockHeight: isSet(object.ethereumBlockHeight) ? String(object.ethereumBlockHeight) : "0",
    };
  },

  toJSON(message: LastObservedEthereumBlockHeight): unknown {
    const obj: any = {};
    message.cosmosBlockHeight !== undefined && (obj.cosmosBlockHeight = message.cosmosBlockHeight);
    message.ethereumBlockHeight !== undefined && (obj.ethereumBlockHeight = message.ethereumBlockHeight);
    return obj;
  },

  create<I extends Exact<DeepPartial<LastObservedEthereumBlockHeight>, I>>(base?: I): LastObservedEthereumBlockHeight {
    return LastObservedEthereumBlockHeight.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<LastObservedEthereumBlockHeight>, I>>(
    object: I,
  ): LastObservedEthereumBlockHeight {
    const message = createBaseLastObservedEthereumBlockHeight();
    message.cosmosBlockHeight = object.cosmosBlockHeight ?? "0";
    message.ethereumBlockHeight = object.ethereumBlockHeight ?? "0";
    return message;
  },
};

function createBaseERC20ToDenom(): ERC20ToDenom {
  return { erc20: "", denom: "" };
}

export const ERC20ToDenom = {
  encode(message: ERC20ToDenom, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.erc20 !== "") {
      writer.uint32(10).string(message.erc20);
    }
    if (message.denom !== "") {
      writer.uint32(18).string(message.denom);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ERC20ToDenom {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseERC20ToDenom();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.erc20 = reader.string();
          break;
        case 2:
          message.denom = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ERC20ToDenom {
    return {
      erc20: isSet(object.erc20) ? String(object.erc20) : "",
      denom: isSet(object.denom) ? String(object.denom) : "",
    };
  },

  toJSON(message: ERC20ToDenom): unknown {
    const obj: any = {};
    message.erc20 !== undefined && (obj.erc20 = message.erc20);
    message.denom !== undefined && (obj.denom = message.denom);
    return obj;
  },

  create<I extends Exact<DeepPartial<ERC20ToDenom>, I>>(base?: I): ERC20ToDenom {
    return ERC20ToDenom.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ERC20ToDenom>, I>>(object: I): ERC20ToDenom {
    const message = createBaseERC20ToDenom();
    message.erc20 = object.erc20 ?? "";
    message.denom = object.denom ?? "";
    return message;
  },
};

function createBaseUnhaltBridgeProposal(): UnhaltBridgeProposal {
  return { title: "", description: "", targetNonce: "0", evmChainPrefix: "" };
}

export const UnhaltBridgeProposal = {
  encode(message: UnhaltBridgeProposal, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.title !== "") {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    if (message.targetNonce !== "0") {
      writer.uint32(32).uint64(message.targetNonce);
    }
    if (message.evmChainPrefix !== "") {
      writer.uint32(42).string(message.evmChainPrefix);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UnhaltBridgeProposal {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUnhaltBridgeProposal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.title = reader.string();
          break;
        case 2:
          message.description = reader.string();
          break;
        case 4:
          message.targetNonce = longToString(reader.uint64() as Long);
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

  fromJSON(object: any): UnhaltBridgeProposal {
    return {
      title: isSet(object.title) ? String(object.title) : "",
      description: isSet(object.description) ? String(object.description) : "",
      targetNonce: isSet(object.targetNonce) ? String(object.targetNonce) : "0",
      evmChainPrefix: isSet(object.evmChainPrefix) ? String(object.evmChainPrefix) : "",
    };
  },

  toJSON(message: UnhaltBridgeProposal): unknown {
    const obj: any = {};
    message.title !== undefined && (obj.title = message.title);
    message.description !== undefined && (obj.description = message.description);
    message.targetNonce !== undefined && (obj.targetNonce = message.targetNonce);
    message.evmChainPrefix !== undefined && (obj.evmChainPrefix = message.evmChainPrefix);
    return obj;
  },

  create<I extends Exact<DeepPartial<UnhaltBridgeProposal>, I>>(base?: I): UnhaltBridgeProposal {
    return UnhaltBridgeProposal.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<UnhaltBridgeProposal>, I>>(object: I): UnhaltBridgeProposal {
    const message = createBaseUnhaltBridgeProposal();
    message.title = object.title ?? "";
    message.description = object.description ?? "";
    message.targetNonce = object.targetNonce ?? "0";
    message.evmChainPrefix = object.evmChainPrefix ?? "";
    return message;
  },
};

function createBaseAirdropProposal(): AirdropProposal {
  return { title: "", description: "", denom: "", recipients: new Uint8Array(), amounts: [] };
}

export const AirdropProposal = {
  encode(message: AirdropProposal, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.title !== "") {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    if (message.denom !== "") {
      writer.uint32(26).string(message.denom);
    }
    if (message.recipients.length !== 0) {
      writer.uint32(34).bytes(message.recipients);
    }
    writer.uint32(42).fork();
    for (const v of message.amounts) {
      writer.uint64(v);
    }
    writer.ldelim();
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AirdropProposal {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAirdropProposal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.title = reader.string();
          break;
        case 2:
          message.description = reader.string();
          break;
        case 3:
          message.denom = reader.string();
          break;
        case 4:
          message.recipients = reader.bytes();
          break;
        case 5:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.amounts.push(longToString(reader.uint64() as Long));
            }
          } else {
            message.amounts.push(longToString(reader.uint64() as Long));
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AirdropProposal {
    return {
      title: isSet(object.title) ? String(object.title) : "",
      description: isSet(object.description) ? String(object.description) : "",
      denom: isSet(object.denom) ? String(object.denom) : "",
      recipients: isSet(object.recipients) ? bytesFromBase64(object.recipients) : new Uint8Array(),
      amounts: Array.isArray(object?.amounts) ? object.amounts.map((e: any) => String(e)) : [],
    };
  },

  toJSON(message: AirdropProposal): unknown {
    const obj: any = {};
    message.title !== undefined && (obj.title = message.title);
    message.description !== undefined && (obj.description = message.description);
    message.denom !== undefined && (obj.denom = message.denom);
    message.recipients !== undefined &&
      (obj.recipients = base64FromBytes(message.recipients !== undefined ? message.recipients : new Uint8Array()));
    if (message.amounts) {
      obj.amounts = message.amounts.map((e) => e);
    } else {
      obj.amounts = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<AirdropProposal>, I>>(base?: I): AirdropProposal {
    return AirdropProposal.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<AirdropProposal>, I>>(object: I): AirdropProposal {
    const message = createBaseAirdropProposal();
    message.title = object.title ?? "";
    message.description = object.description ?? "";
    message.denom = object.denom ?? "";
    message.recipients = object.recipients ?? new Uint8Array();
    message.amounts = object.amounts?.map((e) => e) || [];
    return message;
  },
};

function createBaseIBCMetadataProposal(): IBCMetadataProposal {
  return { title: "", description: "", metadata: undefined, ibcDenom: "", evmChainPrefix: "" };
}

export const IBCMetadataProposal = {
  encode(message: IBCMetadataProposal, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.title !== "") {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    if (message.metadata !== undefined) {
      Metadata.encode(message.metadata, writer.uint32(26).fork()).ldelim();
    }
    if (message.ibcDenom !== "") {
      writer.uint32(34).string(message.ibcDenom);
    }
    if (message.evmChainPrefix !== "") {
      writer.uint32(42).string(message.evmChainPrefix);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): IBCMetadataProposal {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIBCMetadataProposal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.title = reader.string();
          break;
        case 2:
          message.description = reader.string();
          break;
        case 3:
          message.metadata = Metadata.decode(reader, reader.uint32());
          break;
        case 4:
          message.ibcDenom = reader.string();
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

  fromJSON(object: any): IBCMetadataProposal {
    return {
      title: isSet(object.title) ? String(object.title) : "",
      description: isSet(object.description) ? String(object.description) : "",
      metadata: isSet(object.metadata) ? Metadata.fromJSON(object.metadata) : undefined,
      ibcDenom: isSet(object.ibcDenom) ? String(object.ibcDenom) : "",
      evmChainPrefix: isSet(object.evmChainPrefix) ? String(object.evmChainPrefix) : "",
    };
  },

  toJSON(message: IBCMetadataProposal): unknown {
    const obj: any = {};
    message.title !== undefined && (obj.title = message.title);
    message.description !== undefined && (obj.description = message.description);
    message.metadata !== undefined && (obj.metadata = message.metadata ? Metadata.toJSON(message.metadata) : undefined);
    message.ibcDenom !== undefined && (obj.ibcDenom = message.ibcDenom);
    message.evmChainPrefix !== undefined && (obj.evmChainPrefix = message.evmChainPrefix);
    return obj;
  },

  create<I extends Exact<DeepPartial<IBCMetadataProposal>, I>>(base?: I): IBCMetadataProposal {
    return IBCMetadataProposal.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<IBCMetadataProposal>, I>>(object: I): IBCMetadataProposal {
    const message = createBaseIBCMetadataProposal();
    message.title = object.title ?? "";
    message.description = object.description ?? "";
    message.metadata = (object.metadata !== undefined && object.metadata !== null)
      ? Metadata.fromPartial(object.metadata)
      : undefined;
    message.ibcDenom = object.ibcDenom ?? "";
    message.evmChainPrefix = object.evmChainPrefix ?? "";
    return message;
  },
};

function createBaseAddEvmChainProposal(): AddEvmChainProposal {
  return {
    title: "",
    description: "",
    evmChainName: "",
    evmChainPrefix: "",
    evmChainNetVersion: "0",
    gravityId: "",
    bridgeEthereumAddress: "",
  };
}

export const AddEvmChainProposal = {
  encode(message: AddEvmChainProposal, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.title !== "") {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    if (message.evmChainName !== "") {
      writer.uint32(26).string(message.evmChainName);
    }
    if (message.evmChainPrefix !== "") {
      writer.uint32(34).string(message.evmChainPrefix);
    }
    if (message.evmChainNetVersion !== "0") {
      writer.uint32(40).uint64(message.evmChainNetVersion);
    }
    if (message.gravityId !== "") {
      writer.uint32(50).string(message.gravityId);
    }
    if (message.bridgeEthereumAddress !== "") {
      writer.uint32(58).string(message.bridgeEthereumAddress);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AddEvmChainProposal {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAddEvmChainProposal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.title = reader.string();
          break;
        case 2:
          message.description = reader.string();
          break;
        case 3:
          message.evmChainName = reader.string();
          break;
        case 4:
          message.evmChainPrefix = reader.string();
          break;
        case 5:
          message.evmChainNetVersion = longToString(reader.uint64() as Long);
          break;
        case 6:
          message.gravityId = reader.string();
          break;
        case 7:
          message.bridgeEthereumAddress = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AddEvmChainProposal {
    return {
      title: isSet(object.title) ? String(object.title) : "",
      description: isSet(object.description) ? String(object.description) : "",
      evmChainName: isSet(object.evmChainName) ? String(object.evmChainName) : "",
      evmChainPrefix: isSet(object.evmChainPrefix) ? String(object.evmChainPrefix) : "",
      evmChainNetVersion: isSet(object.evmChainNetVersion) ? String(object.evmChainNetVersion) : "0",
      gravityId: isSet(object.gravityId) ? String(object.gravityId) : "",
      bridgeEthereumAddress: isSet(object.bridgeEthereumAddress) ? String(object.bridgeEthereumAddress) : "",
    };
  },

  toJSON(message: AddEvmChainProposal): unknown {
    const obj: any = {};
    message.title !== undefined && (obj.title = message.title);
    message.description !== undefined && (obj.description = message.description);
    message.evmChainName !== undefined && (obj.evmChainName = message.evmChainName);
    message.evmChainPrefix !== undefined && (obj.evmChainPrefix = message.evmChainPrefix);
    message.evmChainNetVersion !== undefined && (obj.evmChainNetVersion = message.evmChainNetVersion);
    message.gravityId !== undefined && (obj.gravityId = message.gravityId);
    message.bridgeEthereumAddress !== undefined && (obj.bridgeEthereumAddress = message.bridgeEthereumAddress);
    return obj;
  },

  create<I extends Exact<DeepPartial<AddEvmChainProposal>, I>>(base?: I): AddEvmChainProposal {
    return AddEvmChainProposal.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<AddEvmChainProposal>, I>>(object: I): AddEvmChainProposal {
    const message = createBaseAddEvmChainProposal();
    message.title = object.title ?? "";
    message.description = object.description ?? "";
    message.evmChainName = object.evmChainName ?? "";
    message.evmChainPrefix = object.evmChainPrefix ?? "";
    message.evmChainNetVersion = object.evmChainNetVersion ?? "0";
    message.gravityId = object.gravityId ?? "";
    message.bridgeEthereumAddress = object.bridgeEthereumAddress ?? "";
    return message;
  },
};

function createBasePendingIbcAutoForward(): PendingIbcAutoForward {
  return { foreignReceiver: "", token: undefined, ibcChannel: "", eventNonce: "0" };
}

export const PendingIbcAutoForward = {
  encode(message: PendingIbcAutoForward, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.foreignReceiver !== "") {
      writer.uint32(10).string(message.foreignReceiver);
    }
    if (message.token !== undefined) {
      Coin.encode(message.token, writer.uint32(18).fork()).ldelim();
    }
    if (message.ibcChannel !== "") {
      writer.uint32(26).string(message.ibcChannel);
    }
    if (message.eventNonce !== "0") {
      writer.uint32(32).uint64(message.eventNonce);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PendingIbcAutoForward {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePendingIbcAutoForward();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.foreignReceiver = reader.string();
          break;
        case 2:
          message.token = Coin.decode(reader, reader.uint32());
          break;
        case 3:
          message.ibcChannel = reader.string();
          break;
        case 4:
          message.eventNonce = longToString(reader.uint64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PendingIbcAutoForward {
    return {
      foreignReceiver: isSet(object.foreignReceiver) ? String(object.foreignReceiver) : "",
      token: isSet(object.token) ? Coin.fromJSON(object.token) : undefined,
      ibcChannel: isSet(object.ibcChannel) ? String(object.ibcChannel) : "",
      eventNonce: isSet(object.eventNonce) ? String(object.eventNonce) : "0",
    };
  },

  toJSON(message: PendingIbcAutoForward): unknown {
    const obj: any = {};
    message.foreignReceiver !== undefined && (obj.foreignReceiver = message.foreignReceiver);
    message.token !== undefined && (obj.token = message.token ? Coin.toJSON(message.token) : undefined);
    message.ibcChannel !== undefined && (obj.ibcChannel = message.ibcChannel);
    message.eventNonce !== undefined && (obj.eventNonce = message.eventNonce);
    return obj;
  },

  create<I extends Exact<DeepPartial<PendingIbcAutoForward>, I>>(base?: I): PendingIbcAutoForward {
    return PendingIbcAutoForward.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<PendingIbcAutoForward>, I>>(object: I): PendingIbcAutoForward {
    const message = createBasePendingIbcAutoForward();
    message.foreignReceiver = object.foreignReceiver ?? "";
    message.token = (object.token !== undefined && object.token !== null) ? Coin.fromPartial(object.token) : undefined;
    message.ibcChannel = object.ibcChannel ?? "";
    message.eventNonce = object.eventNonce ?? "0";
    return message;
  },
};

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

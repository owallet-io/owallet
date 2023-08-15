/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { Coin } from "../../cosmos/base/v1beta1/coin";
import { Attestation } from "./attestation";
import { OutgoingLogicCall, OutgoingTransferTx, OutgoingTxBatch } from "./batch";
import { MsgConfirmBatch, MsgConfirmLogicCall, MsgSetOrchestratorAddress, MsgValsetConfirm } from "./msgs";
import { ERC20ToDenom, PendingIbcAutoForward, Valset } from "./types";

export const protobufPackage = "gravity.v1";

/**
 * The slashing fractions for the various gravity related slashing conditions.
 * The first three refer to not submitting a particular message, the third for
 * submitting a different claim for the same Ethereum event
 *
 * unbond_slashing_valsets_window
 *
 * The unbond slashing valsets window is used to determine how many blocks after
 * starting to unbond a validator needs to continue signing blocks. The goal of
 * this paramater is that when a validator leaves the set, if their leaving
 * creates enough change in the validator set to justify an update they will
 * sign a validator set update for the Ethereum bridge that does not include
 * themselves. Allowing us to remove them from the Ethereum bridge and replace
 * them with the new set gracefully.
 *
 * valset_reward
 *
 * These parameters allow for the bridge oracle to resolve a fork on the
 * Ethereum chain without halting the chain. Once set reset bridge state will
 * roll back events to the nonce provided in reset_bridge_nonce if and only if
 * those events have not yet been observed (executed on the Cosmos chain). This
 * allows for easy handling of cases where for example an Ethereum hardfork has
 * occured and more than 1/3 of the vlaidtor set disagrees with the rest.
 * Normally this would require a chain halt, manual genesis editing and restar
 * to resolve with this feature a governance proposal can be used instead
 *
 * bridge_active
 *
 * This boolean flag can be used by governance to temporarily halt the bridge
 * due to a vulnerability or other issue In this context halting the bridge
 * means prevent the execution of any oracle events from Ethereum and preventing
 * the creation of new batches that may be relayed to Ethereum.
 * This does not prevent the creation of validator sets
 * or slashing for not submitting validator set signatures as either of these
 * might allow key signers to leave the validator set and steal funds on
 * Ethereum without consequence. The practical outcome of this flag being set to
 * 'false' is that deposits from Ethereum will not show up and withdraws from
 * Cosmos will not execute on Ethereum.
 *
 * min_chain_fee_basis_points
 *
 * The minimum SendToEth `chain_fee` amount, in terms of basis points. e.g. 10%
 * fee = 1000, and 0.02% fee = 2
 */
export interface Params {
  signedValsetsWindow: string;
  signedBatchesWindow: string;
  signedLogicCallsWindow: string;
  targetBatchTimeout: string;
  averageBlockTime: string;
  slashFractionValset: Uint8Array;
  slashFractionBatch: Uint8Array;
  slashFractionLogicCall: Uint8Array;
  unbondSlashingValsetsWindow: string;
  slashFractionBadEthSignature: Uint8Array;
  valsetReward: Coin | undefined;
  minChainFeeBasisPoints: string;
  evmChainParams: EvmChainParam[];
}

/**
 * GenesisState struct, containing all persistant data required by the Gravity
 * module
 */
export interface GenesisState {
  params: Params | undefined;
  evmChains: EvmChainData[];
}

/**
 * bridge_chain_id:
 * the unique identifier of the Ethereum chain, this is a reference value
 * only and is not actually used by any Gravity code
 */
export interface EvmChainParam {
  gravityId: string;
  bridgeActive: boolean;
  contractSourceHash: string;
  /** from Ethereum to the bridge */
  bridgeEthereumAddress: string;
  /** net id of evm chain */
  bridgeChainId: string;
  averageEthereumBlockTime: string;
  /** addresses on this blacklist are forbidden from depositing or withdrawing */
  ethereumBlacklist: string[];
  /** use this for matching */
  evmChainPrefix: string;
}

/**
 * EvmChainData struct, containing all persistant data per EVM chain required by
 * the Gravity module
 */
export interface EvmChainData {
  evmChain: EvmChain | undefined;
  gravityNonces: GravityNonces | undefined;
  valsets: Valset[];
  valsetConfirms: MsgValsetConfirm[];
  batches: OutgoingTxBatch[];
  batchConfirms: MsgConfirmBatch[];
  logicCalls: OutgoingLogicCall[];
  logicCallConfirms: MsgConfirmLogicCall[];
  attestations: Attestation[];
  delegateKeys: MsgSetOrchestratorAddress[];
  erc20ToDenoms: ERC20ToDenom[];
  unbatchedTransfers: OutgoingTransferTx[];
  pendingIbcAutoForwards: PendingIbcAutoForward[];
}

/** EvmChain struct contains EVM chain specific data */
export interface EvmChain {
  evmChainPrefix: string;
  evmChainName: string;
  evmChainNetVersion: string;
}

/**
 * GravityCounters contains the many noces and counters required to maintain the
 * bridge state in the genesis
 */
export interface GravityNonces {
  /** the nonce of the last generated validator set */
  latestValsetNonce: string;
  /** the last observed Gravity.sol contract event nonce */
  lastObservedNonce: string;
  /** the last valset nonce we have slashed, to prevent double slashing */
  lastSlashedValsetNonce: string;
  /**
   * the last batch Cosmos chain block that batch slashing has completed for
   * there is an individual batch nonce for each token type so this removes
   * the need to store them all
   */
  lastSlashedBatchBlock: string;
  /** the last cosmos block that logic call slashing has completed for */
  lastSlashedLogicCallBlock: string;
  /**
   * the last transaction id from the Gravity TX pool, this prevents ID
   * duplication during chain upgrades
   */
  lastTxPoolId: string;
  /**
   * the last batch id from the Gravity batch pool, this prevents ID duplication
   * during chain upgrades
   */
  lastBatchId: string;
  /** last observed evm block height */
  lastObservedEvmBlockHeight: string;
}

function createBaseParams(): Params {
  return {
    signedValsetsWindow: "0",
    signedBatchesWindow: "0",
    signedLogicCallsWindow: "0",
    targetBatchTimeout: "0",
    averageBlockTime: "0",
    slashFractionValset: new Uint8Array(),
    slashFractionBatch: new Uint8Array(),
    slashFractionLogicCall: new Uint8Array(),
    unbondSlashingValsetsWindow: "0",
    slashFractionBadEthSignature: new Uint8Array(),
    valsetReward: undefined,
    minChainFeeBasisPoints: "0",
    evmChainParams: [],
  };
}

export const Params = {
  encode(message: Params, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.signedValsetsWindow !== "0") {
      writer.uint32(8).uint64(message.signedValsetsWindow);
    }
    if (message.signedBatchesWindow !== "0") {
      writer.uint32(16).uint64(message.signedBatchesWindow);
    }
    if (message.signedLogicCallsWindow !== "0") {
      writer.uint32(24).uint64(message.signedLogicCallsWindow);
    }
    if (message.targetBatchTimeout !== "0") {
      writer.uint32(32).uint64(message.targetBatchTimeout);
    }
    if (message.averageBlockTime !== "0") {
      writer.uint32(40).uint64(message.averageBlockTime);
    }
    if (message.slashFractionValset.length !== 0) {
      writer.uint32(50).bytes(message.slashFractionValset);
    }
    if (message.slashFractionBatch.length !== 0) {
      writer.uint32(58).bytes(message.slashFractionBatch);
    }
    if (message.slashFractionLogicCall.length !== 0) {
      writer.uint32(66).bytes(message.slashFractionLogicCall);
    }
    if (message.unbondSlashingValsetsWindow !== "0") {
      writer.uint32(72).uint64(message.unbondSlashingValsetsWindow);
    }
    if (message.slashFractionBadEthSignature.length !== 0) {
      writer.uint32(82).bytes(message.slashFractionBadEthSignature);
    }
    if (message.valsetReward !== undefined) {
      Coin.encode(message.valsetReward, writer.uint32(90).fork()).ldelim();
    }
    if (message.minChainFeeBasisPoints !== "0") {
      writer.uint32(96).uint64(message.minChainFeeBasisPoints);
    }
    for (const v of message.evmChainParams) {
      EvmChainParam.encode(v!, writer.uint32(106).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Params {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signedValsetsWindow = longToString(reader.uint64() as Long);
          break;
        case 2:
          message.signedBatchesWindow = longToString(reader.uint64() as Long);
          break;
        case 3:
          message.signedLogicCallsWindow = longToString(reader.uint64() as Long);
          break;
        case 4:
          message.targetBatchTimeout = longToString(reader.uint64() as Long);
          break;
        case 5:
          message.averageBlockTime = longToString(reader.uint64() as Long);
          break;
        case 6:
          message.slashFractionValset = reader.bytes();
          break;
        case 7:
          message.slashFractionBatch = reader.bytes();
          break;
        case 8:
          message.slashFractionLogicCall = reader.bytes();
          break;
        case 9:
          message.unbondSlashingValsetsWindow = longToString(reader.uint64() as Long);
          break;
        case 10:
          message.slashFractionBadEthSignature = reader.bytes();
          break;
        case 11:
          message.valsetReward = Coin.decode(reader, reader.uint32());
          break;
        case 12:
          message.minChainFeeBasisPoints = longToString(reader.uint64() as Long);
          break;
        case 13:
          message.evmChainParams.push(EvmChainParam.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Params {
    return {
      signedValsetsWindow: isSet(object.signedValsetsWindow) ? String(object.signedValsetsWindow) : "0",
      signedBatchesWindow: isSet(object.signedBatchesWindow) ? String(object.signedBatchesWindow) : "0",
      signedLogicCallsWindow: isSet(object.signedLogicCallsWindow) ? String(object.signedLogicCallsWindow) : "0",
      targetBatchTimeout: isSet(object.targetBatchTimeout) ? String(object.targetBatchTimeout) : "0",
      averageBlockTime: isSet(object.averageBlockTime) ? String(object.averageBlockTime) : "0",
      slashFractionValset: isSet(object.slashFractionValset)
        ? bytesFromBase64(object.slashFractionValset)
        : new Uint8Array(),
      slashFractionBatch: isSet(object.slashFractionBatch)
        ? bytesFromBase64(object.slashFractionBatch)
        : new Uint8Array(),
      slashFractionLogicCall: isSet(object.slashFractionLogicCall)
        ? bytesFromBase64(object.slashFractionLogicCall)
        : new Uint8Array(),
      unbondSlashingValsetsWindow: isSet(object.unbondSlashingValsetsWindow)
        ? String(object.unbondSlashingValsetsWindow)
        : "0",
      slashFractionBadEthSignature: isSet(object.slashFractionBadEthSignature)
        ? bytesFromBase64(object.slashFractionBadEthSignature)
        : new Uint8Array(),
      valsetReward: isSet(object.valsetReward) ? Coin.fromJSON(object.valsetReward) : undefined,
      minChainFeeBasisPoints: isSet(object.minChainFeeBasisPoints) ? String(object.minChainFeeBasisPoints) : "0",
      evmChainParams: Array.isArray(object?.evmChainParams)
        ? object.evmChainParams.map((e: any) => EvmChainParam.fromJSON(e))
        : [],
    };
  },

  toJSON(message: Params): unknown {
    const obj: any = {};
    message.signedValsetsWindow !== undefined && (obj.signedValsetsWindow = message.signedValsetsWindow);
    message.signedBatchesWindow !== undefined && (obj.signedBatchesWindow = message.signedBatchesWindow);
    message.signedLogicCallsWindow !== undefined && (obj.signedLogicCallsWindow = message.signedLogicCallsWindow);
    message.targetBatchTimeout !== undefined && (obj.targetBatchTimeout = message.targetBatchTimeout);
    message.averageBlockTime !== undefined && (obj.averageBlockTime = message.averageBlockTime);
    message.slashFractionValset !== undefined &&
      (obj.slashFractionValset = base64FromBytes(
        message.slashFractionValset !== undefined ? message.slashFractionValset : new Uint8Array(),
      ));
    message.slashFractionBatch !== undefined &&
      (obj.slashFractionBatch = base64FromBytes(
        message.slashFractionBatch !== undefined ? message.slashFractionBatch : new Uint8Array(),
      ));
    message.slashFractionLogicCall !== undefined &&
      (obj.slashFractionLogicCall = base64FromBytes(
        message.slashFractionLogicCall !== undefined ? message.slashFractionLogicCall : new Uint8Array(),
      ));
    message.unbondSlashingValsetsWindow !== undefined &&
      (obj.unbondSlashingValsetsWindow = message.unbondSlashingValsetsWindow);
    message.slashFractionBadEthSignature !== undefined &&
      (obj.slashFractionBadEthSignature = base64FromBytes(
        message.slashFractionBadEthSignature !== undefined ? message.slashFractionBadEthSignature : new Uint8Array(),
      ));
    message.valsetReward !== undefined &&
      (obj.valsetReward = message.valsetReward ? Coin.toJSON(message.valsetReward) : undefined);
    message.minChainFeeBasisPoints !== undefined && (obj.minChainFeeBasisPoints = message.minChainFeeBasisPoints);
    if (message.evmChainParams) {
      obj.evmChainParams = message.evmChainParams.map((e) => e ? EvmChainParam.toJSON(e) : undefined);
    } else {
      obj.evmChainParams = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Params>, I>>(base?: I): Params {
    return Params.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Params>, I>>(object: I): Params {
    const message = createBaseParams();
    message.signedValsetsWindow = object.signedValsetsWindow ?? "0";
    message.signedBatchesWindow = object.signedBatchesWindow ?? "0";
    message.signedLogicCallsWindow = object.signedLogicCallsWindow ?? "0";
    message.targetBatchTimeout = object.targetBatchTimeout ?? "0";
    message.averageBlockTime = object.averageBlockTime ?? "0";
    message.slashFractionValset = object.slashFractionValset ?? new Uint8Array();
    message.slashFractionBatch = object.slashFractionBatch ?? new Uint8Array();
    message.slashFractionLogicCall = object.slashFractionLogicCall ?? new Uint8Array();
    message.unbondSlashingValsetsWindow = object.unbondSlashingValsetsWindow ?? "0";
    message.slashFractionBadEthSignature = object.slashFractionBadEthSignature ?? new Uint8Array();
    message.valsetReward = (object.valsetReward !== undefined && object.valsetReward !== null)
      ? Coin.fromPartial(object.valsetReward)
      : undefined;
    message.minChainFeeBasisPoints = object.minChainFeeBasisPoints ?? "0";
    message.evmChainParams = object.evmChainParams?.map((e) => EvmChainParam.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGenesisState(): GenesisState {
  return { params: undefined, evmChains: [] };
}

export const GenesisState = {
  encode(message: GenesisState, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.evmChains) {
      EvmChainData.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GenesisState {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenesisState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.params = Params.decode(reader, reader.uint32());
          break;
        case 2:
          message.evmChains.push(EvmChainData.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GenesisState {
    return {
      params: isSet(object.params) ? Params.fromJSON(object.params) : undefined,
      evmChains: Array.isArray(object?.evmChains) ? object.evmChains.map((e: any) => EvmChainData.fromJSON(e)) : [],
    };
  },

  toJSON(message: GenesisState): unknown {
    const obj: any = {};
    message.params !== undefined && (obj.params = message.params ? Params.toJSON(message.params) : undefined);
    if (message.evmChains) {
      obj.evmChains = message.evmChains.map((e) => e ? EvmChainData.toJSON(e) : undefined);
    } else {
      obj.evmChains = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<GenesisState>, I>>(base?: I): GenesisState {
    return GenesisState.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<GenesisState>, I>>(object: I): GenesisState {
    const message = createBaseGenesisState();
    message.params = (object.params !== undefined && object.params !== null)
      ? Params.fromPartial(object.params)
      : undefined;
    message.evmChains = object.evmChains?.map((e) => EvmChainData.fromPartial(e)) || [];
    return message;
  },
};

function createBaseEvmChainParam(): EvmChainParam {
  return {
    gravityId: "",
    bridgeActive: false,
    contractSourceHash: "",
    bridgeEthereumAddress: "",
    bridgeChainId: "0",
    averageEthereumBlockTime: "0",
    ethereumBlacklist: [],
    evmChainPrefix: "",
  };
}

export const EvmChainParam = {
  encode(message: EvmChainParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.gravityId !== "") {
      writer.uint32(10).string(message.gravityId);
    }
    if (message.bridgeActive === true) {
      writer.uint32(16).bool(message.bridgeActive);
    }
    if (message.contractSourceHash !== "") {
      writer.uint32(26).string(message.contractSourceHash);
    }
    if (message.bridgeEthereumAddress !== "") {
      writer.uint32(34).string(message.bridgeEthereumAddress);
    }
    if (message.bridgeChainId !== "0") {
      writer.uint32(40).uint64(message.bridgeChainId);
    }
    if (message.averageEthereumBlockTime !== "0") {
      writer.uint32(48).uint64(message.averageEthereumBlockTime);
    }
    for (const v of message.ethereumBlacklist) {
      writer.uint32(58).string(v!);
    }
    if (message.evmChainPrefix !== "") {
      writer.uint32(66).string(message.evmChainPrefix);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EvmChainParam {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEvmChainParam();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.gravityId = reader.string();
          break;
        case 2:
          message.bridgeActive = reader.bool();
          break;
        case 3:
          message.contractSourceHash = reader.string();
          break;
        case 4:
          message.bridgeEthereumAddress = reader.string();
          break;
        case 5:
          message.bridgeChainId = longToString(reader.uint64() as Long);
          break;
        case 6:
          message.averageEthereumBlockTime = longToString(reader.uint64() as Long);
          break;
        case 7:
          message.ethereumBlacklist.push(reader.string());
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

  fromJSON(object: any): EvmChainParam {
    return {
      gravityId: isSet(object.gravityId) ? String(object.gravityId) : "",
      bridgeActive: isSet(object.bridgeActive) ? Boolean(object.bridgeActive) : false,
      contractSourceHash: isSet(object.contractSourceHash) ? String(object.contractSourceHash) : "",
      bridgeEthereumAddress: isSet(object.bridgeEthereumAddress) ? String(object.bridgeEthereumAddress) : "",
      bridgeChainId: isSet(object.bridgeChainId) ? String(object.bridgeChainId) : "0",
      averageEthereumBlockTime: isSet(object.averageEthereumBlockTime) ? String(object.averageEthereumBlockTime) : "0",
      ethereumBlacklist: Array.isArray(object?.ethereumBlacklist)
        ? object.ethereumBlacklist.map((e: any) => String(e))
        : [],
      evmChainPrefix: isSet(object.evmChainPrefix) ? String(object.evmChainPrefix) : "",
    };
  },

  toJSON(message: EvmChainParam): unknown {
    const obj: any = {};
    message.gravityId !== undefined && (obj.gravityId = message.gravityId);
    message.bridgeActive !== undefined && (obj.bridgeActive = message.bridgeActive);
    message.contractSourceHash !== undefined && (obj.contractSourceHash = message.contractSourceHash);
    message.bridgeEthereumAddress !== undefined && (obj.bridgeEthereumAddress = message.bridgeEthereumAddress);
    message.bridgeChainId !== undefined && (obj.bridgeChainId = message.bridgeChainId);
    message.averageEthereumBlockTime !== undefined && (obj.averageEthereumBlockTime = message.averageEthereumBlockTime);
    if (message.ethereumBlacklist) {
      obj.ethereumBlacklist = message.ethereumBlacklist.map((e) => e);
    } else {
      obj.ethereumBlacklist = [];
    }
    message.evmChainPrefix !== undefined && (obj.evmChainPrefix = message.evmChainPrefix);
    return obj;
  },

  create<I extends Exact<DeepPartial<EvmChainParam>, I>>(base?: I): EvmChainParam {
    return EvmChainParam.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<EvmChainParam>, I>>(object: I): EvmChainParam {
    const message = createBaseEvmChainParam();
    message.gravityId = object.gravityId ?? "";
    message.bridgeActive = object.bridgeActive ?? false;
    message.contractSourceHash = object.contractSourceHash ?? "";
    message.bridgeEthereumAddress = object.bridgeEthereumAddress ?? "";
    message.bridgeChainId = object.bridgeChainId ?? "0";
    message.averageEthereumBlockTime = object.averageEthereumBlockTime ?? "0";
    message.ethereumBlacklist = object.ethereumBlacklist?.map((e) => e) || [];
    message.evmChainPrefix = object.evmChainPrefix ?? "";
    return message;
  },
};

function createBaseEvmChainData(): EvmChainData {
  return {
    evmChain: undefined,
    gravityNonces: undefined,
    valsets: [],
    valsetConfirms: [],
    batches: [],
    batchConfirms: [],
    logicCalls: [],
    logicCallConfirms: [],
    attestations: [],
    delegateKeys: [],
    erc20ToDenoms: [],
    unbatchedTransfers: [],
    pendingIbcAutoForwards: [],
  };
}

export const EvmChainData = {
  encode(message: EvmChainData, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.evmChain !== undefined) {
      EvmChain.encode(message.evmChain, writer.uint32(10).fork()).ldelim();
    }
    if (message.gravityNonces !== undefined) {
      GravityNonces.encode(message.gravityNonces, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.valsets) {
      Valset.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    for (const v of message.valsetConfirms) {
      MsgValsetConfirm.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    for (const v of message.batches) {
      OutgoingTxBatch.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    for (const v of message.batchConfirms) {
      MsgConfirmBatch.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    for (const v of message.logicCalls) {
      OutgoingLogicCall.encode(v!, writer.uint32(58).fork()).ldelim();
    }
    for (const v of message.logicCallConfirms) {
      MsgConfirmLogicCall.encode(v!, writer.uint32(66).fork()).ldelim();
    }
    for (const v of message.attestations) {
      Attestation.encode(v!, writer.uint32(74).fork()).ldelim();
    }
    for (const v of message.delegateKeys) {
      MsgSetOrchestratorAddress.encode(v!, writer.uint32(82).fork()).ldelim();
    }
    for (const v of message.erc20ToDenoms) {
      ERC20ToDenom.encode(v!, writer.uint32(90).fork()).ldelim();
    }
    for (const v of message.unbatchedTransfers) {
      OutgoingTransferTx.encode(v!, writer.uint32(98).fork()).ldelim();
    }
    for (const v of message.pendingIbcAutoForwards) {
      PendingIbcAutoForward.encode(v!, writer.uint32(106).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EvmChainData {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEvmChainData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.evmChain = EvmChain.decode(reader, reader.uint32());
          break;
        case 2:
          message.gravityNonces = GravityNonces.decode(reader, reader.uint32());
          break;
        case 3:
          message.valsets.push(Valset.decode(reader, reader.uint32()));
          break;
        case 4:
          message.valsetConfirms.push(MsgValsetConfirm.decode(reader, reader.uint32()));
          break;
        case 5:
          message.batches.push(OutgoingTxBatch.decode(reader, reader.uint32()));
          break;
        case 6:
          message.batchConfirms.push(MsgConfirmBatch.decode(reader, reader.uint32()));
          break;
        case 7:
          message.logicCalls.push(OutgoingLogicCall.decode(reader, reader.uint32()));
          break;
        case 8:
          message.logicCallConfirms.push(MsgConfirmLogicCall.decode(reader, reader.uint32()));
          break;
        case 9:
          message.attestations.push(Attestation.decode(reader, reader.uint32()));
          break;
        case 10:
          message.delegateKeys.push(MsgSetOrchestratorAddress.decode(reader, reader.uint32()));
          break;
        case 11:
          message.erc20ToDenoms.push(ERC20ToDenom.decode(reader, reader.uint32()));
          break;
        case 12:
          message.unbatchedTransfers.push(OutgoingTransferTx.decode(reader, reader.uint32()));
          break;
        case 13:
          message.pendingIbcAutoForwards.push(PendingIbcAutoForward.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EvmChainData {
    return {
      evmChain: isSet(object.evmChain) ? EvmChain.fromJSON(object.evmChain) : undefined,
      gravityNonces: isSet(object.gravityNonces) ? GravityNonces.fromJSON(object.gravityNonces) : undefined,
      valsets: Array.isArray(object?.valsets) ? object.valsets.map((e: any) => Valset.fromJSON(e)) : [],
      valsetConfirms: Array.isArray(object?.valsetConfirms)
        ? object.valsetConfirms.map((e: any) => MsgValsetConfirm.fromJSON(e))
        : [],
      batches: Array.isArray(object?.batches) ? object.batches.map((e: any) => OutgoingTxBatch.fromJSON(e)) : [],
      batchConfirms: Array.isArray(object?.batchConfirms)
        ? object.batchConfirms.map((e: any) => MsgConfirmBatch.fromJSON(e))
        : [],
      logicCalls: Array.isArray(object?.logicCalls)
        ? object.logicCalls.map((e: any) => OutgoingLogicCall.fromJSON(e))
        : [],
      logicCallConfirms: Array.isArray(object?.logicCallConfirms)
        ? object.logicCallConfirms.map((e: any) => MsgConfirmLogicCall.fromJSON(e))
        : [],
      attestations: Array.isArray(object?.attestations)
        ? object.attestations.map((e: any) => Attestation.fromJSON(e))
        : [],
      delegateKeys: Array.isArray(object?.delegateKeys)
        ? object.delegateKeys.map((e: any) => MsgSetOrchestratorAddress.fromJSON(e))
        : [],
      erc20ToDenoms: Array.isArray(object?.erc20ToDenoms)
        ? object.erc20ToDenoms.map((e: any) => ERC20ToDenom.fromJSON(e))
        : [],
      unbatchedTransfers: Array.isArray(object?.unbatchedTransfers)
        ? object.unbatchedTransfers.map((e: any) => OutgoingTransferTx.fromJSON(e))
        : [],
      pendingIbcAutoForwards: Array.isArray(object?.pendingIbcAutoForwards)
        ? object.pendingIbcAutoForwards.map((e: any) => PendingIbcAutoForward.fromJSON(e))
        : [],
    };
  },

  toJSON(message: EvmChainData): unknown {
    const obj: any = {};
    message.evmChain !== undefined && (obj.evmChain = message.evmChain ? EvmChain.toJSON(message.evmChain) : undefined);
    message.gravityNonces !== undefined &&
      (obj.gravityNonces = message.gravityNonces ? GravityNonces.toJSON(message.gravityNonces) : undefined);
    if (message.valsets) {
      obj.valsets = message.valsets.map((e) => e ? Valset.toJSON(e) : undefined);
    } else {
      obj.valsets = [];
    }
    if (message.valsetConfirms) {
      obj.valsetConfirms = message.valsetConfirms.map((e) => e ? MsgValsetConfirm.toJSON(e) : undefined);
    } else {
      obj.valsetConfirms = [];
    }
    if (message.batches) {
      obj.batches = message.batches.map((e) => e ? OutgoingTxBatch.toJSON(e) : undefined);
    } else {
      obj.batches = [];
    }
    if (message.batchConfirms) {
      obj.batchConfirms = message.batchConfirms.map((e) => e ? MsgConfirmBatch.toJSON(e) : undefined);
    } else {
      obj.batchConfirms = [];
    }
    if (message.logicCalls) {
      obj.logicCalls = message.logicCalls.map((e) => e ? OutgoingLogicCall.toJSON(e) : undefined);
    } else {
      obj.logicCalls = [];
    }
    if (message.logicCallConfirms) {
      obj.logicCallConfirms = message.logicCallConfirms.map((e) => e ? MsgConfirmLogicCall.toJSON(e) : undefined);
    } else {
      obj.logicCallConfirms = [];
    }
    if (message.attestations) {
      obj.attestations = message.attestations.map((e) => e ? Attestation.toJSON(e) : undefined);
    } else {
      obj.attestations = [];
    }
    if (message.delegateKeys) {
      obj.delegateKeys = message.delegateKeys.map((e) => e ? MsgSetOrchestratorAddress.toJSON(e) : undefined);
    } else {
      obj.delegateKeys = [];
    }
    if (message.erc20ToDenoms) {
      obj.erc20ToDenoms = message.erc20ToDenoms.map((e) => e ? ERC20ToDenom.toJSON(e) : undefined);
    } else {
      obj.erc20ToDenoms = [];
    }
    if (message.unbatchedTransfers) {
      obj.unbatchedTransfers = message.unbatchedTransfers.map((e) => e ? OutgoingTransferTx.toJSON(e) : undefined);
    } else {
      obj.unbatchedTransfers = [];
    }
    if (message.pendingIbcAutoForwards) {
      obj.pendingIbcAutoForwards = message.pendingIbcAutoForwards.map((e) =>
        e ? PendingIbcAutoForward.toJSON(e) : undefined
      );
    } else {
      obj.pendingIbcAutoForwards = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<EvmChainData>, I>>(base?: I): EvmChainData {
    return EvmChainData.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<EvmChainData>, I>>(object: I): EvmChainData {
    const message = createBaseEvmChainData();
    message.evmChain = (object.evmChain !== undefined && object.evmChain !== null)
      ? EvmChain.fromPartial(object.evmChain)
      : undefined;
    message.gravityNonces = (object.gravityNonces !== undefined && object.gravityNonces !== null)
      ? GravityNonces.fromPartial(object.gravityNonces)
      : undefined;
    message.valsets = object.valsets?.map((e) => Valset.fromPartial(e)) || [];
    message.valsetConfirms = object.valsetConfirms?.map((e) => MsgValsetConfirm.fromPartial(e)) || [];
    message.batches = object.batches?.map((e) => OutgoingTxBatch.fromPartial(e)) || [];
    message.batchConfirms = object.batchConfirms?.map((e) => MsgConfirmBatch.fromPartial(e)) || [];
    message.logicCalls = object.logicCalls?.map((e) => OutgoingLogicCall.fromPartial(e)) || [];
    message.logicCallConfirms = object.logicCallConfirms?.map((e) => MsgConfirmLogicCall.fromPartial(e)) || [];
    message.attestations = object.attestations?.map((e) => Attestation.fromPartial(e)) || [];
    message.delegateKeys = object.delegateKeys?.map((e) => MsgSetOrchestratorAddress.fromPartial(e)) || [];
    message.erc20ToDenoms = object.erc20ToDenoms?.map((e) => ERC20ToDenom.fromPartial(e)) || [];
    message.unbatchedTransfers = object.unbatchedTransfers?.map((e) => OutgoingTransferTx.fromPartial(e)) || [];
    message.pendingIbcAutoForwards = object.pendingIbcAutoForwards?.map((e) => PendingIbcAutoForward.fromPartial(e)) ||
      [];
    return message;
  },
};

function createBaseEvmChain(): EvmChain {
  return { evmChainPrefix: "", evmChainName: "", evmChainNetVersion: "0" };
}

export const EvmChain = {
  encode(message: EvmChain, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.evmChainPrefix !== "") {
      writer.uint32(10).string(message.evmChainPrefix);
    }
    if (message.evmChainName !== "") {
      writer.uint32(18).string(message.evmChainName);
    }
    if (message.evmChainNetVersion !== "0") {
      writer.uint32(24).uint64(message.evmChainNetVersion);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EvmChain {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEvmChain();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.evmChainPrefix = reader.string();
          break;
        case 2:
          message.evmChainName = reader.string();
          break;
        case 3:
          message.evmChainNetVersion = longToString(reader.uint64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EvmChain {
    return {
      evmChainPrefix: isSet(object.evmChainPrefix) ? String(object.evmChainPrefix) : "",
      evmChainName: isSet(object.evmChainName) ? String(object.evmChainName) : "",
      evmChainNetVersion: isSet(object.evmChainNetVersion) ? String(object.evmChainNetVersion) : "0",
    };
  },

  toJSON(message: EvmChain): unknown {
    const obj: any = {};
    message.evmChainPrefix !== undefined && (obj.evmChainPrefix = message.evmChainPrefix);
    message.evmChainName !== undefined && (obj.evmChainName = message.evmChainName);
    message.evmChainNetVersion !== undefined && (obj.evmChainNetVersion = message.evmChainNetVersion);
    return obj;
  },

  create<I extends Exact<DeepPartial<EvmChain>, I>>(base?: I): EvmChain {
    return EvmChain.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<EvmChain>, I>>(object: I): EvmChain {
    const message = createBaseEvmChain();
    message.evmChainPrefix = object.evmChainPrefix ?? "";
    message.evmChainName = object.evmChainName ?? "";
    message.evmChainNetVersion = object.evmChainNetVersion ?? "0";
    return message;
  },
};

function createBaseGravityNonces(): GravityNonces {
  return {
    latestValsetNonce: "0",
    lastObservedNonce: "0",
    lastSlashedValsetNonce: "0",
    lastSlashedBatchBlock: "0",
    lastSlashedLogicCallBlock: "0",
    lastTxPoolId: "0",
    lastBatchId: "0",
    lastObservedEvmBlockHeight: "0",
  };
}

export const GravityNonces = {
  encode(message: GravityNonces, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.latestValsetNonce !== "0") {
      writer.uint32(8).uint64(message.latestValsetNonce);
    }
    if (message.lastObservedNonce !== "0") {
      writer.uint32(16).uint64(message.lastObservedNonce);
    }
    if (message.lastSlashedValsetNonce !== "0") {
      writer.uint32(24).uint64(message.lastSlashedValsetNonce);
    }
    if (message.lastSlashedBatchBlock !== "0") {
      writer.uint32(32).uint64(message.lastSlashedBatchBlock);
    }
    if (message.lastSlashedLogicCallBlock !== "0") {
      writer.uint32(40).uint64(message.lastSlashedLogicCallBlock);
    }
    if (message.lastTxPoolId !== "0") {
      writer.uint32(48).uint64(message.lastTxPoolId);
    }
    if (message.lastBatchId !== "0") {
      writer.uint32(56).uint64(message.lastBatchId);
    }
    if (message.lastObservedEvmBlockHeight !== "0") {
      writer.uint32(64).uint64(message.lastObservedEvmBlockHeight);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GravityNonces {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGravityNonces();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.latestValsetNonce = longToString(reader.uint64() as Long);
          break;
        case 2:
          message.lastObservedNonce = longToString(reader.uint64() as Long);
          break;
        case 3:
          message.lastSlashedValsetNonce = longToString(reader.uint64() as Long);
          break;
        case 4:
          message.lastSlashedBatchBlock = longToString(reader.uint64() as Long);
          break;
        case 5:
          message.lastSlashedLogicCallBlock = longToString(reader.uint64() as Long);
          break;
        case 6:
          message.lastTxPoolId = longToString(reader.uint64() as Long);
          break;
        case 7:
          message.lastBatchId = longToString(reader.uint64() as Long);
          break;
        case 8:
          message.lastObservedEvmBlockHeight = longToString(reader.uint64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GravityNonces {
    return {
      latestValsetNonce: isSet(object.latestValsetNonce) ? String(object.latestValsetNonce) : "0",
      lastObservedNonce: isSet(object.lastObservedNonce) ? String(object.lastObservedNonce) : "0",
      lastSlashedValsetNonce: isSet(object.lastSlashedValsetNonce) ? String(object.lastSlashedValsetNonce) : "0",
      lastSlashedBatchBlock: isSet(object.lastSlashedBatchBlock) ? String(object.lastSlashedBatchBlock) : "0",
      lastSlashedLogicCallBlock: isSet(object.lastSlashedLogicCallBlock)
        ? String(object.lastSlashedLogicCallBlock)
        : "0",
      lastTxPoolId: isSet(object.lastTxPoolId) ? String(object.lastTxPoolId) : "0",
      lastBatchId: isSet(object.lastBatchId) ? String(object.lastBatchId) : "0",
      lastObservedEvmBlockHeight: isSet(object.lastObservedEvmBlockHeight)
        ? String(object.lastObservedEvmBlockHeight)
        : "0",
    };
  },

  toJSON(message: GravityNonces): unknown {
    const obj: any = {};
    message.latestValsetNonce !== undefined && (obj.latestValsetNonce = message.latestValsetNonce);
    message.lastObservedNonce !== undefined && (obj.lastObservedNonce = message.lastObservedNonce);
    message.lastSlashedValsetNonce !== undefined && (obj.lastSlashedValsetNonce = message.lastSlashedValsetNonce);
    message.lastSlashedBatchBlock !== undefined && (obj.lastSlashedBatchBlock = message.lastSlashedBatchBlock);
    message.lastSlashedLogicCallBlock !== undefined &&
      (obj.lastSlashedLogicCallBlock = message.lastSlashedLogicCallBlock);
    message.lastTxPoolId !== undefined && (obj.lastTxPoolId = message.lastTxPoolId);
    message.lastBatchId !== undefined && (obj.lastBatchId = message.lastBatchId);
    message.lastObservedEvmBlockHeight !== undefined &&
      (obj.lastObservedEvmBlockHeight = message.lastObservedEvmBlockHeight);
    return obj;
  },

  create<I extends Exact<DeepPartial<GravityNonces>, I>>(base?: I): GravityNonces {
    return GravityNonces.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<GravityNonces>, I>>(object: I): GravityNonces {
    const message = createBaseGravityNonces();
    message.latestValsetNonce = object.latestValsetNonce ?? "0";
    message.lastObservedNonce = object.lastObservedNonce ?? "0";
    message.lastSlashedValsetNonce = object.lastSlashedValsetNonce ?? "0";
    message.lastSlashedBatchBlock = object.lastSlashedBatchBlock ?? "0";
    message.lastSlashedLogicCallBlock = object.lastSlashedLogicCallBlock ?? "0";
    message.lastTxPoolId = object.lastTxPoolId ?? "0";
    message.lastBatchId = object.lastBatchId ?? "0";
    message.lastObservedEvmBlockHeight = object.lastObservedEvmBlockHeight ?? "0";
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

import {
  ChainInfo,
  BIP44HDPath,
  AddressBtcType,
  HDPath,
  KeyDerivationTypeEnum,
  ChainInfoWithoutEndpoints,
} from "@owallet/types";
import bech32, { fromWords } from "bech32";
import { ETH } from "@hanchon/ethermint-address-converter";
import { NetworkType } from "@owallet/types";
import { ChainIdEnum, TRON_ID } from "./constants";
import { EmbedChainInfos } from "../config";
import { Hash } from "@owallet/crypto";
import bs58 from "bs58";
import { ethers } from "ethers";
import Web3 from "web3";
import TronWeb from "tronweb";
import "dotenv/config";

export type LedgerAppType = "cosmos" | "eth" | "trx" | "btc";
export const COINTYPE_NETWORK = {
  118: "Cosmos",
  60: "Ethereum",
  195: "Tron",
  0: "Bitcoin",
  1: "Bitcoin Testnet",
};

export const getRpcByChainId = (
  chainInfo: ChainInfo,
  chainId: string
): string => {
  if (!chainInfo || !chainId) return;
  if (chainId === ChainIdEnum.TRON) {
    return `${chainInfo.rpc}/jsonrpc`;
  }
  return chainInfo.rpc;
};
export const getEvmAddress = (base58Address) => {
  return base58Address
    ? "0x" +
        Buffer.from(bs58.decode(base58Address).slice(1, -4)).toString("hex")
    : "-";
};

export const getBase58Address = (address) => {
  if (!address) return null;
  const evmAddress = Buffer.from("41" + address.slice(2), "hex");
  const hash = Hash.sha256(Hash.sha256(evmAddress));
  const checkSum = Buffer.from(hash.slice(0, 4));
  return bs58.encode(Buffer.concat([evmAddress, checkSum]));
};

export const getAddressFromBech32 = (bech32address) => {
  const address = Buffer.from(fromWords(bech32.decode(bech32address).words));
  return ETH.encoder(address);
};

// It is recommended to use ethers4.0.47 version
// var ethers = require('ethers')

const AbiCoder = ethers.utils.AbiCoder;
const ADDRESS_PREFIX_REGEX = /^(41)/;
const ADDRESS_PREFIX = "41";

//types:Parameter type list, if the function has multiple return values, the order of the types in the list should conform to the defined order
//output: Data before decoding
//ignoreMethodHash：Decode the function return value, fill falseMethodHash with false, if decode the data field in the gettransactionbyid result, fill ignoreMethodHash with true

export const decodeParams = async (types, output, ignoreMethodHash) => {
  if (!output || typeof output === "boolean") {
    ignoreMethodHash = output;
    output = types;
  }

  if (ignoreMethodHash && output.replace(/^0x/, "").length % 64 === 8)
    output = "0x" + output.replace(/^0x/, "").substring(8);

  const abiCoder = new AbiCoder();

  if (output.replace(/^0x/, "").length % 64)
    throw new Error(
      "The encoded string is not valid. Its length must be a multiple of 64."
    );
  return abiCoder.decode(types, output).reduce((obj, arg, index) => {
    if (types[index] == "address")
      arg = ADDRESS_PREFIX + arg.substr(2).toLowerCase();
    obj.push(arg);
    return obj;
  }, []);
};

export const encodeParams = async (inputs) => {
  let typesValues = inputs;
  let parameters = "";

  if (typesValues.length == 0) return parameters;
  const abiCoder = new AbiCoder();
  let types = [];
  const values = [];

  for (let i = 0; i < typesValues.length; i++) {
    let { type, value } = typesValues[i];
    if (type == "address") value = value.replace(ADDRESS_PREFIX_REGEX, "0x");
    else if (type == "address[]")
      value = value.map((v) =>
        Web3.utils.toHex(v).replace(ADDRESS_PREFIX_REGEX, "0x")
      );
    types.push(type);
    values.push(value);
  }
  try {
    parameters = abiCoder.encode(types, values).replace(/^(0x)/, "");
  } catch (ex) {
    console.log(ex);
  }
  return parameters;
};
export const estimateBandwidthTron = (signedTxn) => {
  const DATA_HEX_PROTOBUF_EXTRA = 3;
  const MAX_RESULT_SIZE_IN_TX = 64;
  const A_SIGNATURE = 67;
  let len =
    signedTxn.raw_data_hex.length / 2 +
    DATA_HEX_PROTOBUF_EXTRA +
    MAX_RESULT_SIZE_IN_TX;
  const signatureListSize = signedTxn.signature.length;

  for (let i = 0; i < signatureListSize; i++) {
    len += A_SIGNATURE;
  }
  return len;
};
export const DEFAULT_BLOCK_TIMEOUT_HEIGHT = 90;
export const DEFAULT_BLOCK_TIME_IN_SECONDS = 2;
export const DEFAULT_TX_BLOCK_INCLUSION_TIMEOUT_IN_MS =
  DEFAULT_BLOCK_TIMEOUT_HEIGHT * DEFAULT_BLOCK_TIME_IN_SECONDS * 1000;

export const TronWebProvider = (rpc: string = "https://api.trongrid.io") => {
  try {
    if (!rpc) return;
    const tronWeb = new TronWeb({
      fullHost: rpc,
      // TODO: This is key free for test tron
      headers: { "TRON-PRO-API-KEY": "adb28290-fa79-4542-a6ee-910628cae6f1" },
    });
    return tronWeb;
  } catch (e) {
    console.log(e, "ee");
  }
};
export const getCoinTypeByChainId = (chainId) => {
  const network = EmbedChainInfos.find((nw) => nw.chainId == chainId);
  return network?.bip44?.coinType ?? network?.coinType ?? 60;
};

export const getChainInfoOrThrow = (chainId: string): ChainInfo => {
  const chainInfo = EmbedChainInfos.find((nw) => nw.chainId == chainId);
  if (!chainInfo) {
    throw new Error(`There is no chain info for ${chainId}`);
  }
  return chainInfo;
};
export const isEthermintLike = (chainInfo: ChainInfo): boolean => {
  return (
    chainInfo?.networkType === "evm" ||
    chainInfo.bip44.coinType === 60 ||
    !!chainInfo.features?.includes("eth-address-gen") ||
    !!chainInfo.features?.includes("eth-key-sign") ||
    !!chainInfo.features?.includes("isEvm")
  );
};
export const getUrlV1Beta = (isBeta: boolean) => {
  if (isBeta) return "v1beta1";
  return "v1";
};
export const bufferToHex = (buffer) => {
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
};

export function getLedgerAppNameByNetwork(
  network: string,
  chainId?: string | number
): LedgerAppType {
  switch (network) {
    case "cosmos":
      if ((chainId as string)?.startsWith("injective")) {
        return "eth";
      }
      return "cosmos";
    case "evm":
      if (chainId && chainId === TRON_ID) {
        return "trx";
      }
      return "eth";
    case "bitcoin":
      return "btc";
    default:
      return "cosmos";
  }
}

export const getNetworkTypeByChainId = (chainId) => {
  const network = EmbedChainInfos.find((nw) => nw.chainId === chainId);
  return network?.networkType ?? "cosmos";
};

export function splitPath(path: string): BIP44HDPath {
  const bip44HDPathOrder = ["coinType", "account", "change", "addressIndex"];
  const result = {} as BIP44HDPath;
  const components = path.split("/");
  if (path.startsWith("44")) {
    components.shift();
  } else if (path.startsWith("84")) {
    components.shift();
  }
  components.forEach((element, index) => {
    result[bip44HDPathOrder[index]] = element.replace("'", "");
  });

  return result;
}

export function splitPathStringToHDPath(path: string): HDPath {
  if (!path) throw Error("path is not empty");
  const bip44HDPathOrder = [
    "keyDerivation",
    "coinType",
    "account",
    "change",
    "addressIndex",
  ];
  const result = {} as HDPath;
  const components = path.split("/");

  if (components?.length < 5)
    throw Error("Array Path length is greater than 4");
  components.forEach((element, index) => {
    result[bip44HDPathOrder[index]] = element.replace("'", "");
  });
  return result;
}

export const isWeb = typeof document !== "undefined";
export const isReactNative = (): boolean => {
  if (typeof navigator !== "undefined" && navigator.product === "ReactNative") {
    return true;
  }
  return false;
};

export function getNetworkTypeByBip44HDPath(path: BIP44HDPath): LedgerAppType {
  switch (path.coinType) {
    case 118:
      return "cosmos";
    case 0:
    case 1:
      return "btc";
    case 60:
      return "eth";
    case 195:
      return "trx";
    default:
      return "cosmos";
  }
}

export const isBase58 = (value: string): boolean =>
  /^[A-HJ-NP-Za-km-z1-9]*$/.test(value);
export const typeBtcLedgerByAddress = (
  chainInfo: ChainInfoWithoutEndpoints,
  addressType: AddressBtcType
): "btc44" | "btc84" | "tbtc44" | "tbtc84" => {
  if (chainInfo.networkType === "bitcoin") {
    if (chainInfo.chainId === "bitcoinTestnet") {
      if (addressType === "bech32") {
        return "tbtc84";
      } else if (addressType === "legacy") {
        return "tbtc44";
      }
    } else {
      if (addressType === "bech32") {
        return "btc84";
      } else if (addressType === "legacy") {
        return "btc44";
      }
    }
  }
};

export function findLedgerAddress(
  AddressesLedger,
  chainInfo: ChainInfoWithoutEndpoints,
  addressType: AddressBtcType
) {
  const chainId = chainInfo.chainId;
  if (chainId === TRON_ID) {
    return AddressesLedger?.trx;
  } else {
    const networkType = getNetworkTypeByChainId(chainId);
    if (networkType === "evm") {
      return AddressesLedger?.eth;
    } else if (networkType === "bitcoin") {
      const typeBtc = typeBtcLedgerByAddress(chainInfo, addressType);
      return AddressesLedger?.[typeBtc];
    } else {
      return AddressesLedger?.cosmos;
    }
  }
}

export const getKeyDerivationFromAddressType = (
  type: AddressBtcType
): "84" | "44" => {
  if (type === AddressBtcType.Legacy) {
    return "44";
  }
  return "84";
};
export const keyDerivationToAddressType = (
  keyDerivation: KeyDerivationTypeEnum
): AddressBtcType => {
  if (keyDerivation === KeyDerivationTypeEnum.BIP44) {
    return AddressBtcType.Legacy;
  }
  return AddressBtcType.Bech32;
};
export const convertBip44ToHDPath = (
  bip44HDPath: BIP44HDPath,
  keyDerivation: number = 44
): HDPath => {
  return {
    keyDerivation,
    coinType: bip44HDPath.coinType,
    addressIndex: bip44HDPath.addressIndex,
    account: bip44HDPath.account,
    change: bip44HDPath.change,
  };
};
export const MIN_FEE_RATE = 5;
export const formatAddress = (address: string, limitFirst = 10) => {
  if (!address || address?.length < 10) return null;
  const fristLetter = address?.slice(0, limitFirst) ?? "";
  const lastLetter = address?.slice(-5) ?? "";

  return `${fristLetter}...${lastLetter}`;
};

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const isMilliseconds = (timestamp: number | string): boolean => {
  if (!timestamp) return;
  const timestampString = timestamp.toString();
  return timestampString.length === 13;
};

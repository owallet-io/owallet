import {
  ChainInfo,
  // BIP44HDPath,
  AddressBtcType,
  // HDPath,
  // KeyDerivationTypeEnum,
  ChainInfoWithoutEndpoints,
  ChainIdEVM,
} from "@owallet/types";

import { ChainIdEnum, Network, TRON_ID } from "./constants";
import { EmbedChainInfos } from "../config";
import { IntPretty } from "@keplr-wallet/unit";
import { decode, encode } from "bs58";
import { Hash } from "@owallet/crypto";
import bs58 from "bs58";
import { ethers } from "ethers";
// import Web3 from "web3";
import TronWeb from "tronweb";
import isValidDomain from "is-valid-domain";
import { Bech32Config } from "@owallet/types";
import "dotenv/config";
import { validate } from "bitcoin-address-validation";
import {
  Connection,
  Finality,
  GetVersionedTransactionConfig,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";

export const isBtcAddress = (address: string): boolean => {
  if (!address) return false;
  return validate(address);
};

export const getFavicon = (url) => {
  const serviceGG =
    "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&size=32&url=";
  if (!url) return serviceGG + "https://orai.io";
  return serviceGG + url;
};
export const deserializeTransaction = (
  serializedTx: string
): VersionedTransaction => {
  return VersionedTransaction.deserialize(decode(serializedTx));
};

export const deserializeLegacyTransaction = (serializedTx: string) => {
  return Transaction.from(decode(serializedTx));
};
export const DEFAULT_PRIORITY_FEE = 50000;
export const DEFAULT_COMPUTE_UNIT_LIMIT = 200_000;

export async function _getPriorityFeeSolana(
  transaction: string
): Promise<number> {
  try {
    const resp = await fetch(`https://backpack-api.xnfts.dev/v3/graphql`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "apollographql-client-name": "backpack-secure-ui",
      },
      body: JSON.stringify({
        query: `query GetPriorityFeeEstimate($caip2: Caip2!, $transaction: String!) {
  priorityFeeEstimate(caip2: $caip2, transaction: $transaction)
}`,
        variables: {
          caip2: {
            namespace: "solana",
            reference: "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
          },
          transaction,
        },
        operationName: "GetPriorityFeeEstimate",
      }),
    });

    const json = await resp.json();
    return json.data?.priorityFeeEstimate ?? 0;
  } catch {
    return 0;
  }
}

export async function getSimulationTxSolana(
  transactions: Array<string>,
  chainId: string,
  account_address: string,
  url: string
) {
  try {
    const resp = await fetch(
      `https://blockaid.xnftdata.com/v0/solana/message/scan`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactions: transactions,
          chain: chainId,
          account_address,
          metadata: {
            url,
          },
        }),
      }
    );

    return await resp.json();
    // if (json?.status !== "SUCCESS") return;
    // return json;
  } catch (e) {
    console.log(e, "errr fetch data");
    throw Error(e);
  }
}
export const avatarName = `https://ui-avatars.com/api/?name={name}&background=random`;
export async function confirmTransaction(
  c: Connection,
  txSig: string,
  commitmentOrConfig?: GetVersionedTransactionConfig | Finality
): Promise<ReturnType<(typeof c)["getParsedTransaction"]>> {
  return new Promise(async (resolve, reject) => {
    setTimeout(
      () =>
        reject(new Error(`30 second timeout: unable to confirm transaction`)),
      30000
    );
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const config = {
      // Support confirming Versioned Transactions
      maxSupportedTransactionVersion: 0,
      ...(typeof commitmentOrConfig === "string"
        ? {
            commitment: commitmentOrConfig,
          }
        : commitmentOrConfig),
    };

    let tx = await c.getParsedTransaction(txSig, config);
    while (tx === null) {
      tx = await c.getParsedTransaction(txSig, config);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    resolve(tx);
  });
}
export const isVersionedTransaction = (
  tx: Transaction | VersionedTransaction
): tx is VersionedTransaction => {
  return tx != null && typeof tx === "object" && "version" in tx;
};
export async function _getBalancesSolana(
  address: string,
  chainId: string = "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"
): Promise<number> {
  try {
    const resp = await fetch(`https://backpack-api.xnfts.dev/v3/graphql`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "apollographql-client-name": "backpack-secure-ui",
      },
      body: JSON.stringify({
        query: `query GetTokenBalances($address: String!, $caip2: Caip2!, $providerId: ProviderID!) {
  wallet(address: $address, caip2: $caip2, providerId: $providerId) {
    id
    balances {
      id
      aggregate {
        ...BalanceAggregateItem
        __typename
      }
      tokens {
        edges {
          node {
            ...TokenBalanceItem
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
}

fragment TokenMarketDataItem on MarketData {
  id
  marketUrl
  percentChange
  price
  value
  valueChange
  __typename
}

fragment TokenSolanaInfoItem on SolanaTokenInfo {
  id
  compressed
  extensions {
    id
    currentInterestRate
    group
    permanentDelegate
    transferFeePercentage
    transferHook
    __typename
  }
  spl20 {
    id
    amount
    ticker
    __typename
  }
  tokenProgram
  __typename
}

fragment TokenMetadataItem on TokenListEntry {
  id
  address
  decimals
  logo
  name
  symbol
  coingeckoId
  __typename
}

fragment BalanceAggregateItem on BalanceAggregate {
  id
  percentChange
  value
  valueChange
  __typename
}

fragment TokenBalanceItem on TokenBalance {
  id
  address
  amount
  decimals
  displayAmount
  marketData {
    ...TokenMarketDataItem
    __typename
  }
  solana {
    ...TokenSolanaInfoItem
    __typename
  }
  token
  tokenListEntry {
    ...TokenMetadataItem
    __typename
  }
  __typename
}`,
        variables: {
          caip2: {
            namespace: "solana",
            reference: chainId,
          },
          address,
          providerId: "SOLANA",
        },
        operationName: "GetTokenBalances",
      }),
    });

    const json = await resp.json();
    return json.data;
  } catch {
    return 0;
  }
}

export const SOL_DEV = "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1";
export const SOL_MAIN = "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp";
export const CHAIN_ID_SOL = SOL_MAIN;
export const RPC_SOL_DEV = "https://api.devnet.solana.com";
export const RPC_SOL_MAIN = "https://swr.xnftdata.com/rpc-proxy/";
export const RPC_SOL = RPC_SOL_MAIN;
export const formatAprString = (apr?: IntPretty, maxDecimals?: number) => {
  if (apr === undefined) {
    return "0.00";
  }

  const aprRate = apr?.maxDecimals(maxDecimals ?? 2).toString() ?? "0";
  return Number(aprRate) === 0 ? "0.00" : aprRate;
};
export type LedgerAppType = "cosmos" | "eth" | "trx" | "btc";
export const COINTYPE_NETWORK = {
  118: "Cosmos",
  60: "Ethereum",
  195: "Tron",
  0: "Bitcoin",
  1: "Bitcoin Testnet",
};

export const checkValidDomain = (url: string) => {
  if (isValidDomain(url)) {
    return true;
  }
  // try with URL
  try {
    const { origin } = new URL(url);
    return origin?.length > 0;
  } catch {
    return false;
  }
};
export const convertIpfsToHttp = (ipfsUrl: string) => {
  // Ensure the URL starts with "ipfs://"
  if (!ipfsUrl.startsWith("ipfs://")) {
    throw new Error("Invalid IPFS URL");
  }

  // Remove the "ipfs://" prefix
  const ipfsPath = ipfsUrl.slice(7);

  // Replace the fragment identifier '#' with '%23' for URL encoding
  const encodedPath = ipfsPath.replace(/#/g, "%23");

  // Construct the HTTP URL using the IPFS gateway
  return `https://gateway.ipfs.airight.io/ipfs/${encodedPath}`;
};

const timeoutLimit = 5000;
export const timeoutBtc = 60000;
export const withTimeout = (promise, ms = timeoutLimit) => {
  const timeout = new Promise((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error("Promise timed out"));
    }, ms);
  });

  return Promise.race([promise, timeout]);
};
export const convertObjChainAddressToString = (txsAllNetwork) => {
  const data = Object.entries(txsAllNetwork)
    .map(([key, value]) => `${key}%2B${value}`)
    .join(",");
  return data;
};
export const getDomainFromUrl = (url) => {
  if (!url) {
    return "";
  }
  return `${url?.match?.(
    // eslint-disable-next-line no-useless-escape
    /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/gim
  )}`;
};
export const formatContractAddress = (address: string, limitFirst = 10) => {
  if (!address) return "...";
  const fristLetter = address?.slice(0, limitFirst) ?? "";
  const lastLetter = address?.slice(-5) ?? "";

  return `${fristLetter}...${lastLetter}`;
};
export const getTimeMilliSeconds = (timeStamp) => {
  if (isMilliseconds(timeStamp)) {
    return timeStamp;
  }
  return timeStamp * 1000;
};
export const removeDataInParentheses = (inputString: string): string => {
  if (!inputString) return;
  return inputString.replace(/\([^)]*\)/g, "");
};
export const extractDataInParentheses = (
  inputString: string
): string | null => {
  if (!inputString) return;
  const startIndex = inputString.indexOf("(");
  const endIndex = inputString.indexOf(")");
  if (startIndex !== -1 && endIndex !== -1) {
    return inputString.substring(startIndex + 1, endIndex);
  } else {
    return null;
  }
};

export const MapChainIdToNetwork = {
  [ChainIdEnum.BNBChain]: Network.BINANCE_SMART_CHAIN,
  [ChainIdEnum.Ethereum]: Network.ETHEREUM,
  [ChainIdEVM.BNBChain]: Network.BINANCE_SMART_CHAIN,
  [ChainIdEVM.Ethereum]: Network.ETHEREUM,
  [ChainIdEVM.TRON]: Network.TRON,
  [ChainIdEnum.Bitcoin]: Network.BITCOIN,
  [ChainIdEnum.Oasis]: Network.MAINNET,
  [ChainIdEnum.OasisEmerald]: Network.EMERALD,
  [ChainIdEnum.OasisSapphire]: Network.SAPPHIRE,
  [ChainIdEnum.TRON]: Network.TRON,
  [ChainIdEnum.Oraichain]: Network.ORAICHAIN,
  [ChainIdEnum.Osmosis]: Network.OSMOSIS,
  [ChainIdEnum.CosmosHub]: Network.COSMOSHUB,
  [ChainIdEnum.Injective]: Network.INJECTIVE,
  [ChainIdEnum.CELESTIA]: Network.CELESTIA,
  [ChainIdEnum.DYDX]: Network.DYDX,
  [ChainIdEnum.Juno]: Network.JUNO,
  [ChainIdEnum.AKASH]: Network.AKASH,
  [ChainIdEnum.SEI]: Network.SEI,
  [ChainIdEnum.NEUTRON]: Network.NEUTRON,
};

export const MapNetworkToChainId = {
  [Network.BINANCE_SMART_CHAIN]: ChainIdEVM.BNBChain,
  [Network.ETHEREUM]: ChainIdEVM.Ethereum,
  [Network.BITCOIN]: ChainIdEnum.Bitcoin,
  [Network.MAINNET]: ChainIdEnum.Oasis,
  [Network.EMERALD]: ChainIdEnum.OasisEmerald,
  [Network.SAPPHIRE]: ChainIdEnum.OasisSapphire,
  [Network.TRON]: ChainIdEVM.TRON,
  [Network.ORAICHAIN]: ChainIdEnum.Oraichain,
  [Network.OSMOSIS]: ChainIdEnum.Osmosis,
  [Network.COSMOSHUB]: ChainIdEnum.CosmosHub,
  [Network.INJECTIVE]: ChainIdEnum.Injective,
  [Network.DYDX]: ChainIdEnum.DYDX,
  [Network.JUNO]: ChainIdEnum.Juno,
  [Network.AKASH]: ChainIdEnum.AKASH,
  [Network.SEI]: ChainIdEnum.SEI,
  [Network.CELESTIA]: ChainIdEnum.CELESTIA,
  [Network.NEUTRON]: ChainIdEnum.NEUTRON,
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
  return isBase58Address(base58Address)
    ? base58Address
      ? "0x" +
        Buffer.from(bs58.decode(base58Address).slice(1, -4)).toString("hex")
      : "-"
    : null;
};

export function isBase58Address(address) {
  try {
    // Attempt to decode the address
    const decoded = bs58.decode(address);

    // Check for invalid characters in the decoded result
    for (const byte of decoded) {
      if (byte < 0 || byte > 255) {
        return false;
      }
    }

    return true;
  } catch (error) {
    return false;
  }
}

export const getBase58Address = (address) => {
  if (!address) return "";
  const evmAddress = Buffer.from("41" + address.slice(2), "hex");
  const hash = Hash.sha256(Hash.sha256(evmAddress));
  const checkSum = Buffer.from(hash.slice(0, 4));
  return bs58.encode(Buffer.concat([evmAddress, checkSum]));
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

// export const encodeParams = async (inputs) => {
//   const typesValues = inputs;
//   let parameters = "";
//
//   if (typesValues.length == 0) return parameters;
//   const abiCoder = new AbiCoder();
//   const types = [];
//   const values = [];
//
//   for (let i = 0; i < typesValues.length; i++) {
//     let { type, value } = typesValues[i];
//     if (type == "address") value = value.replace(ADDRESS_PREFIX_REGEX, "0x");
//     else if (type == "address[]")
//       value = value.map((v) =>
//         Web3.utils.toHex(v).replace(ADDRESS_PREFIX_REGEX, "0x")
//       );
//     types.push(type);
//     values.push(value);
//   }
//   try {
//     parameters = abiCoder.encode(types, values).replace(/^(0x)/, "");
//   } catch (ex) {
//     console.log(ex);
//   }
//   return parameters;
// };
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
    console.log(e, "TronWebProvider error");
  }
};
export const getCoinTypeByChainId = (chainId) => {
  const network = EmbedChainInfos.find((nw) => nw.chainId == chainId);
  return network?.bip44?.coinType ?? 60;
};

export const getChainInfoOrThrow = (chainId: string): ChainInfo => {
  console.log("chainId getChainInfoOrThrow", chainId);

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

// export function splitPath(path: string): BIP44HDPath {
//   const bip44HDPathOrder = ["coinType", "account", "change", "addressIndex"];
//   const result = {} as BIP44HDPath;
//   const components = path.split("/");
//   if (path.startsWith("44")) {
//     components.shift();
//   } else if (path.startsWith("84")) {
//     components.shift();
//   }
//   components.forEach((element, index) => {
//     result[bip44HDPathOrder[index]] = element.replace("'", "");
//   });
//
//   return result;
// }

// export function splitPathStringToHDPath(path: string): HDPath {
//   if (!path) throw Error("path is not empty");
//   const bip44HDPathOrder = [
//     "keyDerivation",
//     "coinType",
//     "account",
//     "change",
//     "addressIndex",
//   ];
//   const result = {} as HDPath;
//   const components = path.split("/");
//
//   if (components?.length < 5)
//     throw Error("Array Path length is greater than 4");
//   components.forEach((element, index) => {
//     result[bip44HDPathOrder[index]] = element.replace("'", "");
//   });
//   return result;
// }

export const isWeb = typeof document !== "undefined";
export const isReactNative = (): boolean => {
  if (typeof navigator !== "undefined" && navigator.product === "ReactNative") {
    return true;
  }
  return false;
};

// export function getNetworkTypeByBip44HDPath(path: BIP44HDPath): LedgerAppType {
//   switch (path.coinType) {
//     case 118:
//       return "cosmos";
//     case 0:
//     case 1:
//       return "btc";
//     case 60:
//       return "eth";
//     case 195:
//       return "trx";
//     default:
//       return "cosmos";
//   }
// }

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

export function limitString(str, limit) {
  if (str && str.length > limit) {
    return str.slice(0, limit) + "...";
  } else {
    return str;
  }
}

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
// export const keyDerivationToAddressType = (
//   keyDerivation: KeyDerivationTypeEnum
// ): AddressBtcType => {
//   if (keyDerivation === KeyDerivationTypeEnum.BIP44) {
//     return AddressBtcType.Legacy;
//   }
//   return AddressBtcType.Bech32;
// };
// export const convertBip44ToHDPath = (
//   bip44HDPath: BIP44HDPath,
//   keyDerivation: number = 44
// ): HDPath => {
//   return {
//     keyDerivation,
//     coinType: bip44HDPath.coinType,
//     addressIndex: bip44HDPath.addressIndex,
//     account: bip44HDPath.account,
//     change: bip44HDPath.change,
//   };
// };
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

export function shortenWord(word, sliceLength = 3, length = 10) {
  /**
   * Shortens a word by replacing its middle with three dots (...).
   *
   * @param {string} word - The word to be shortened.
   * @param {number} length - The length of word to be shortened.
   * @returns {string} - The shortened version of the word.
   */
  if (word.length <= length) {
    // If the word length is equal of param length or less, return the word as is
    return word;
  } else {
    // Shorten the word by keeping the first and last letter, and replacing the middle with '...'
    return word.slice(0, sliceLength) + "..." + word.slice(-sliceLength);
  }
}

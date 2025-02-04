import Long from "long";
import { TokenItemType } from "@oraichain/oraidex-common";
import { CoinGeckoId, IBC_WASM_CONTRACT } from "@oraichain/oraidex-common";
import { HIGH_GAS_PRICE, MULTIPLIER } from "../config/constants";
import { OraiswapOracleQueryClient } from "@oraichain/oraidex-contracts-sdk";
import {
  CwIcs20LatestQueryClient,
  SigningCosmWasmClient,
} from "@oraichain/common-contracts-sdk";
import { Ratio } from "@oraichain/common-contracts-sdk/build/CwIcs20Latest.types";
import { getBase58Address } from "../../utils";
import { TaxRateResponse } from "@oraichain/oraidex-contracts-sdk/build/OraiswapOracle.types";
import { ethers } from "ethers";
import { fromBech32, toBech32 } from "@cosmjs/encoding";
import { flattenTokens, network, oraichainTokens } from "../initCommon";

export enum SwapDirection {
  From,
  To,
}

export const calculateTimeoutTimestamp = (timeout: number): string => {
  return Long.fromNumber(Math.floor(Date.now() / 1000) + timeout)
    .multiply(1000000000)
    .toString();
};

export const getAddress = (addr, prefix: string) => {
  if (!addr) return "";
  const { data } = fromBech32(addr);
  return toBech32(prefix, data);
};

export function isEvmNetworkNativeSwapSupported(chainId: string | number) {
  switch (chainId) {
    case "0x01":
    case "0x38":
      return true;
    default:
      return false;
  }
}

export const feeEstimate = (tokenInfo: TokenItemType, gasDefault: number) => {
  if (!tokenInfo) return 0;
  return (gasDefault * MULTIPLIER * HIGH_GAS_PRICE) / 10 ** tokenInfo?.decimals;
};

export function getTokenOnSpecificChainId(
  coingeckoId: CoinGeckoId,
  chainId: string | number
): TokenItemType | undefined {
  return flattenTokens.find(
    (t) => t.coinGeckoId === coingeckoId && t.chainId === chainId
  );
}

export const tronToEthAddress = (base58: string) => {
  const buffer = Buffer.from(ethers.utils.base58.decode(base58)).subarray(
    1,
    -4
  );
  const hexString = Array.prototype.map
    .call(buffer, (byte) => ("0" + byte.toString(16)).slice(-2))
    .join("");
  return "0x" + hexString;
};

export const ethToTronAddress = (address: string) => {
  return getBase58Address(address);
};

export const getTokenOnOraichain = (coingeckoId: CoinGeckoId) => {
  if (coingeckoId === "kawaii-islands" || coingeckoId === "milky-token") {
    throw new Error("KWT and MILKY not supported in this function");
  }
  return oraichainTokens.find((token) => token.coinGeckoId === coingeckoId);
};

export async function fetchTaxRate(
  client: SigningCosmWasmClient
): Promise<TaxRateResponse> {
  const oracleContract = new OraiswapOracleQueryClient(client, network.oracle);
  try {
    const data = await oracleContract.treasury({ tax_rate: {} });
    return data as TaxRateResponse;
  } catch (error) {
    throw new Error(`Error when query TaxRate using oracle: ${error}`);
  }
}
/**
 * Get transfer token fee when universal swap
 * @param param0
 * @returns
 */
export const getTransferTokenFee = async ({
  remoteTokenDenom,
  client,
}): Promise<Ratio | undefined> => {
  try {
    const ibcWasmContractAddress = IBC_WASM_CONTRACT;
    const ibcWasmContract = new CwIcs20LatestQueryClient(
      client,
      ibcWasmContractAddress
    );
    const ratio = await ibcWasmContract.getTransferTokenFee({
      remoteTokenDenom,
    });
    return ratio;
  } catch (error) {
    console.log({ error });
  }
};

export async function fetchRelayerFee(
  client: SigningCosmWasmClient
): Promise<any> {
  const ics20Contract = new CwIcs20LatestQueryClient(client, IBC_WASM_CONTRACT);
  try {
    const { relayer_fees } = await ics20Contract.config();
    return relayer_fees;
  } catch (error) {
    throw new Error(`Error when query Relayer Fee using oracle: ${error}`);
  }
}

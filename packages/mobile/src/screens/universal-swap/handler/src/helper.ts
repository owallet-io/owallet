import {
  CoinGeckoId,
  EvmChainId,
  proxyContractInfo,
  CosmosChainId,
  NetworkChainId,
  IBCInfo,
  generateError,
  ibcInfos,
  oraib2oraichain,
  KWT_BSC_CONTRACT,
  MILKY_BSC_CONTRACT,
  TokenItemType,
  parseTokenInfoRawDenom,
  getTokenOnOraichain,
  isEthAddress,
  PAIRS,
  ORAI_INFO,
  parseTokenInfo,
  toAmount,
  toDisplay,
  getTokenOnSpecificChainId,
  IUniswapV2Router02__factory,
  cosmosTokens,
  StargateMsg,
  IBC_WASM_HOOKS_CONTRACT,
  isInPairList,
  BigDecimal,
  NEUTARO_INFO,
  USDC_INFO,
} from "@oraichain/oraidex-common";
import {
  OraiBridgeRouteData,
  SimulateResponse,
  SwapDirection,
  SwapRoute,
  UniversalSwapConfig,
} from "./types";
import {
  AssetInfo,
  OraiswapRouterClient,
  OraiswapRouterReadOnlyInterface,
  OraiswapTokenQueryClient,
} from "@oraichain/oraidex-contracts-sdk";
import { SwapOperation } from "@oraichain/oraidex-contracts-sdk/build/OraiswapRouter.types";
import { isEqual } from "lodash";
import { ethers } from "ethers";
import {
  Amount,
  CwIcs20LatestQueryClient,
  CwIcs20LatestReadOnlyInterface,
} from "@oraichain/common-contracts-sdk";
import { CosmWasmClient, toBinary } from "@cosmjs/cosmwasm-stargate";
import { swapFromTokens, swapToTokens } from "./swap-filter";
import { swapEvmRoutes } from "@oraichain/oraidex-universal-swap";

const caseSwapNativeAndWrapNative = (fromCoingecko, toCoingecko) => {
  const arr = ["ethereum", "weth"];
  return arr.includes(fromCoingecko) && arr.includes(toCoingecko);
};
// evm swap helpers
export const isSupportedNoPoolSwapEvm = (coingeckoId: CoinGeckoId) => {
  switch (coingeckoId) {
    case "wbnb":
    case "binancecoin":
    case "ethereum":
      return true;
    default:
      return false;
  }
};

export const isEvmNetworkNativeSwapSupported = (chainId: NetworkChainId) => {
  switch (chainId) {
    case "0x01":
    case "0x38":
      return true;
    default:
      return false;
  }
};

export const buildSwapRouterKey = (
  fromContractAddr: string,
  toContractAddr: string
) => {
  return `${fromContractAddr}-${toContractAddr}`;
};

export const getEvmSwapRoute = (
  chainId: string,
  fromContractAddr?: string,
  toContractAddr?: string
): string[] | undefined => {
  if (!isEvmNetworkNativeSwapSupported(chainId as EvmChainId)) return undefined;
  if (!fromContractAddr && !toContractAddr) return undefined;
  const chainRoutes = swapEvmRoutes[chainId];
  const fromAddr =
    fromContractAddr || proxyContractInfo[chainId].wrapNativeAddr;
  const toAddr = toContractAddr || proxyContractInfo[chainId].wrapNativeAddr;

  // in case from / to contract addr is empty aka native eth or bnb without contract addr then we fallback to swap route with wrapped token
  // because uniswap & pancakeswap do not support simulating with native directly
  let route: string[] | undefined =
    chainRoutes[buildSwapRouterKey(fromAddr, toContractAddr)];
  if (route) return route;
  // because the route can go both ways. Eg: WBNB->AIRI, if we want to swap AIRI->WBNB, then first we find route WBNB->AIRI, then we reverse the route
  route = chainRoutes[buildSwapRouterKey(toAddr, fromContractAddr)];
  if (route) {
    return [].concat(route).reverse();
  }
  return undefined;
};

// static functions
export const isEvmSwappable = (data: {
  fromChainId: string;
  toChainId: string;
  fromContractAddr?: string;
  toContractAddr?: string;
}): boolean => {
  const { fromChainId, fromContractAddr, toChainId, toContractAddr } = data;
  // cant swap if they are not on the same evm chain
  if (fromChainId !== toChainId) return false;
  // cant swap on evm if chain id is not eth or bsc
  if (fromChainId !== "0x01" && fromChainId !== "0x38") return false;
  // if the tokens do not have contract addresses then we skip
  // if (!fromContractAddr || !toContractAddr) return false;
  // only swappable if there's a route to swap from -> to
  if (!getEvmSwapRoute(fromChainId, fromContractAddr, toContractAddr))
    return false;
  return true;
};

// ibc helpers
export const getIbcInfo = (
  fromChainId: CosmosChainId,
  toChainId: NetworkChainId
): IBCInfo => {
  if (!ibcInfos[fromChainId]) throw generateError("Cannot find ibc info");
  const ibcInfo = ibcInfos[fromChainId][toChainId];
  if (!ibcInfo)
    throw generateError(
      `Cannot find ibc info from ${fromChainId} to ${toChainId}`
    );
  return ibcInfo;
};

export const buildIbcWasmPairKey = (
  ibcPort: string,
  ibcChannel: string,
  denom: string
) => {
  return `${ibcPort}/${ibcChannel}/${denom}`;
};

/**
 * This function converts the destination address (from BSC / ETH -> Oraichain) to an appropriate format based on the BSC / ETH token contract address
 * @param oraiAddress - receiver address on Oraichain
 * @param contractAddress - BSC / ETH token contract address
 * @returns converted receiver address
 */
export const getSourceReceiver = (
  oraiAddress: string,
  contractAddress?: string
): string => {
  let sourceReceiver = `${oraib2oraichain}/${oraiAddress}`;
  // we only support the old oraibridge ibc channel <--> Oraichain for MILKY & KWT
  if (
    contractAddress === KWT_BSC_CONTRACT ||
    contractAddress === MILKY_BSC_CONTRACT
  ) {
    sourceReceiver = oraiAddress;
  }
  return sourceReceiver;
};

/**
 * This function receives fromToken and toToken as parameters to generate the destination memo for the receiver address
 * @param from - from token
 * @param to - to token
 * @param destReceiver - destination destReceiver
 * @returns destination in the format <dest-channel>/<dest-destReceiver>:<dest-denom>
 */
export const getRoute = (
  fromToken?: TokenItemType,
  toToken?: TokenItemType,
  destReceiver?: string
): SwapRoute => {
  if (!fromToken || !toToken || !destReceiver)
    return { swapRoute: "", universalSwapType: "other-networks-to-oraichain" };
  // this is the simplest case. Both tokens on the same Oraichain network => simple swap with to token denom
  if (fromToken.chainId === "Oraichain" && toToken.chainId === "Oraichain") {
    return { swapRoute: "", universalSwapType: "oraichain-to-oraichain" };
  }
  // we dont need to have any swapRoute for this case
  if (fromToken.chainId === "Oraichain") {
    if (cosmosTokens.some((t) => t.chainId === toToken.chainId))
      return { swapRoute: "", universalSwapType: "oraichain-to-cosmos" };
    return { swapRoute: "", universalSwapType: "oraichain-to-evm" };
  }
  // TODO: support 1-step swap for kwt & injective
  if (
    fromToken.chainId === "kawaii_6886-1" ||
    fromToken.chainId === "0x1ae6" ||
    fromToken.chainId === "injective-1" ||
    ((fromToken.coinGeckoId !== toToken.coinGeckoId ||
      toToken.chainId !== "Oraichain") &&
      (fromToken.chainId === "cosmoshub-4" ||
        fromToken.chainId === "osmosis-1"))
  ) {
    throw new Error(
      `chain id ${fromToken.chainId} is currently not supported in universal swap`
    );
  }
  // cosmos to cosmos case where from token is a cosmos token
  if (cosmosTokens.some((t) => t.chainId === fromToken.chainId)) {
    return { swapRoute: "", universalSwapType: "cosmos-to-cosmos" };
  }
  if (toToken.chainId === "Oraichain") {
    // if to token chain id is Oraichain, then we dont need to care about ibc msg case
    // first case, two tokens are the same, only different in network => simple swap
    if (fromToken.coinGeckoId === toToken.coinGeckoId)
      return {
        swapRoute: destReceiver,
        universalSwapType: "other-networks-to-oraichain",
      };
    // if they are not the same then we set dest denom
    return {
      swapRoute: `${destReceiver}:${parseTokenInfoRawDenom(toToken)}`,
      universalSwapType: "other-networks-to-oraichain",
    };
  }
  // the remaining cases where we have to process ibc msg
  const ibcInfo: IBCInfo = ibcInfos["Oraichain"][toToken.chainId]; // we get ibc channel that transfers toToken from Oraichain to the toToken chain
  // getTokenOnOraichain is called to get the ibc denom / cw20 denom on Oraichain so that we can create an ibc msg using it
  let receiverPrefix = "";
  // TODO: no need to use to token on Oraichain. Can simply use the swapRoute token directly. Fix this requires fixing the logic on ibc wasm as well
  const toTokenOnOraichain = getTokenOnOraichain(toToken.coinGeckoId);
  if (!toTokenOnOraichain)
    return {
      swapRoute: "",
      universalSwapType: "other-networks-to-oraichain",
    };
  if (isEthAddress(destReceiver)) receiverPrefix = toToken.prefix;
  return {
    swapRoute: `${
      ibcInfo.channel
    }/${receiverPrefix}${destReceiver}:${parseTokenInfoRawDenom(
      toTokenOnOraichain
    )}`,
    universalSwapType: "other-networks-to-oraichain",
  };
};

export const addOraiBridgeRoute = (
  sourceReceiver: string,
  fromToken: TokenItemType,
  toToken: TokenItemType,
  destReceiver?: string
): SwapRoute => {
  const source = getSourceReceiver(sourceReceiver, fromToken.contractAddress);
  const { swapRoute, universalSwapType } = getRoute(
    fromToken,
    toToken,
    destReceiver
  );
  if (swapRoute.length > 0)
    return { swapRoute: `${source}:${swapRoute}`, universalSwapType };
  return { swapRoute: source, universalSwapType };
};

export const splitOnce = (s: string, seperator: string) => {
  const i = s.indexOf(seperator);
  // cannot find seperator then return string
  if (i === -1) return [s];
  return [s.slice(0, i), s.slice(i + 1)];
};

/**
 * cases:
 * <oraibridge-destination>/<orai-receiver>:<end-destination>
 * <orai-receiver>:<end-destination>
 * <first-destination>
 * <first-destination>:<final-destination-channel>/<final-receiver>:<token-identifier-on-oraichain>
 * <first-destination>:<final-receiver>
 * <first-destination>:<final-receiver>:<token-identifier-on-oraichain>
 * */
export const unmarshalOraiBridgeRoute = (destination: string) => {
  let routeData: OraiBridgeRouteData = {
    oraiBridgeChannel: "",
    oraiReceiver: "",
    finalDestinationChannel: "",
    finalReceiver: "",
    tokenIdentifier: "",
  };
  const splittedDestination = splitOnce(destination, ":");
  if (splittedDestination.length === 0 || splittedDestination.length > 2)
    throw generateError(`The destination data is malformed: ${destination}`);
  const firstDestination = splittedDestination[0].split("/");
  if (firstDestination.length === 2) {
    routeData.oraiBridgeChannel = firstDestination[0];
    routeData.oraiReceiver = firstDestination[1];
  } else if (firstDestination.length === 1) {
    routeData.oraiReceiver = firstDestination[0];
  } else
    throw generateError(
      `First destination ${JSON.stringify(
        firstDestination
      )} of ${destination} is malformed`
    );
  // there's nothing we need to parse anymore
  if (splittedDestination.length === 1) return routeData;
  const finalDestinationData = splittedDestination[1].split(":");
  if (finalDestinationData.length === 1)
    routeData.finalReceiver = finalDestinationData[0];
  else if (finalDestinationData.length === 2) {
    routeData.tokenIdentifier = finalDestinationData[1];
    const splittedFinalDestinationData = finalDestinationData[0].split("/");
    if (splittedFinalDestinationData.length === 1)
      routeData.finalReceiver = splittedFinalDestinationData[0];
    else if (splittedFinalDestinationData.length === 2) {
      routeData.finalDestinationChannel = splittedFinalDestinationData[0];
      routeData.finalReceiver = splittedFinalDestinationData[1];
    } else
      throw generateError(
        `splitted final destination data ${JSON.stringify(
          splittedFinalDestinationData
        )} is malformed`
      );
  } else
    throw generateError(
      `Final destination data ${JSON.stringify(
        finalDestinationData
      )} is malformed`
    );
  return routeData;
};

export const generateSwapRoute = (
  offerAsset: AssetInfo,
  askAsset: AssetInfo,
  swapRoute: AssetInfo[]
) => {
  const swaps = [];
  if (swapRoute.length === 0) {
    swaps.push({
      orai_swap: {
        offer_asset_info: offerAsset,
        ask_asset_info: askAsset,
      },
    });
  } else {
    swaps.push({
      orai_swap: {
        offer_asset_info: offerAsset,
        ask_asset_info: swapRoute[0],
      },
    });
    for (let i = 0; i < swapRoute.length - 1; i++) {
      swaps.push({
        orai_swap: {
          offer_asset_info: swapRoute[i],
          ask_asset_info: swapRoute[i + 1],
        },
      });
    }
    swaps.push({
      orai_swap: {
        offer_asset_info: swapRoute[swapRoute.length - 1],
        ask_asset_info: askAsset,
      },
    });
  }
  return swaps;
};

// generate messages
export const generateSwapOperationMsgs = (
  offerInfo: AssetInfo,
  askInfo: AssetInfo
): SwapOperation[] => {
  const pairExist = PAIRS.some((pair) => {
    let assetInfos = pair.asset_infos;
    return (
      (isEqual(assetInfos[0], offerInfo) && isEqual(assetInfos[1], askInfo)) ||
      (isEqual(assetInfos[1], offerInfo) && isEqual(assetInfos[0], askInfo))
    );
  });

  if (pairExist) return generateSwapRoute(offerInfo, askInfo, []);
  // TODO: hardcode NTMPI -> USDC -> ORAI -> X
  if (isEqual(offerInfo, NEUTARO_INFO)) {
    const swapRoute = isEqual(askInfo, ORAI_INFO)
      ? [USDC_INFO]
      : [USDC_INFO, ORAI_INFO];
    return generateSwapRoute(offerInfo, askInfo, swapRoute);
  }

  // TODO: X -> ORAI -> USDC -> NTMPI
  if (isEqual(askInfo, NEUTARO_INFO)) {
    const swapRoute = isEqual(offerInfo, ORAI_INFO)
      ? [USDC_INFO]
      : [ORAI_INFO, USDC_INFO];
    return generateSwapRoute(offerInfo, askInfo, swapRoute);
  }

  // Default case: ORAI_INFO
  return generateSwapRoute(offerInfo, askInfo, [ORAI_INFO]);
};

// simulate swap functions
export const simulateSwap = async (query: {
  fromInfo: TokenItemType;
  toInfo: TokenItemType;
  amount: string;
  routerClient: OraiswapRouterReadOnlyInterface;
}) => {
  const { amount, fromInfo, toInfo, routerClient } = query;

  // check for universal-swap 2 tokens that have same coingeckoId, should return simulate data with average ratio 1-1.
  if (fromInfo.coinGeckoId === toInfo.coinGeckoId) {
    return {
      amount,
    };
  }

  // check if they have pairs. If not then we go through ORAI
  const { info: offerInfo } = parseTokenInfo(fromInfo, amount);
  const { info: askInfo } = parseTokenInfo(toInfo);
  const operations = generateSwapOperationMsgs(offerInfo, askInfo);
  console.log("operations: ", operations);
  try {
    let finalAmount = amount;
    let isSimulatingRatio = false;
    // hard-code for tron because the WTRX/USDT pool is having a simulation problem (returning zero / error when simulating too small value of WTRX)
    if (
      fromInfo.coinGeckoId === "tron" &&
      amount === toAmount(1, fromInfo.decimals).toString()
    ) {
      finalAmount = toAmount(10, fromInfo.decimals).toString();
      isSimulatingRatio = true;
    }
    const data = await routerClient.simulateSwapOperations({
      offerAmount: finalAmount,
      operations,
    });
    if (!isSimulatingRatio) return data;
    return { amount: data.amount.substring(0, data.amount.length - 1) };
  } catch (error) {
    throw new Error(
      `Error when trying to simulate swap using router v2: ${JSON.stringify(
        error
      )}`
    );
  }
};

export const simulateSwapEvm = async (query: {
  fromInfo: TokenItemType;
  toInfo: TokenItemType;
  amount: string;
}): Promise<SimulateResponse> => {
  const { amount, fromInfo, toInfo } = query;
  // check swap native and wrap native
  const isCheckSwapNativeAndWrapNative = caseSwapNativeAndWrapNative(
    fromInfo.coinGeckoId,
    toInfo.coinGeckoId
  );

  // check for universal-swap 2 tokens that have same coingeckoId, should return simulate data with average ratio 1-1.
  if (
    fromInfo.coinGeckoId === toInfo.coinGeckoId ||
    isCheckSwapNativeAndWrapNative
  ) {
    return {
      // amount: toDisplay(amount, fromInfo.decimals, toInfo.decimals).toString(),
      amount: new BigDecimal(amount)
        .mul(10n ** BigInt(toInfo.decimals))
        .div(10n ** BigInt(fromInfo.decimals))
        .toString(),
      displayAmount: toDisplay(amount, fromInfo.decimals),
    };
  }
  try {
    // get proxy contract object so that we can query the corresponding router address
    const provider = new ethers.providers.JsonRpcProvider(fromInfo.rpc);
    const toTokenInfoOnSameChainId = getTokenOnSpecificChainId(
      toInfo.coinGeckoId,
      fromInfo.chainId
    );
    const swapRouterV2 = IUniswapV2Router02__factory.connect(
      proxyContractInfo[fromInfo.chainId].routerAddr,
      provider
    );
    const route = getEvmSwapRoute(
      fromInfo.chainId,
      fromInfo.contractAddress,
      toTokenInfoOnSameChainId.contractAddress
    );
    const outs = await swapRouterV2.getAmountsOut(amount, route);
    if (outs.length === 0)
      throw new Error("There is no output amounts after simulating evm swap");
    let simulateAmount = outs.slice(-1)[0].toString();
    return {
      // to display to reset the simulate amount to correct display type (swap simulate from -> same chain id to, so we use same chain id toToken decimals)
      // then toAmount with actual toInfo decimals so that it has the same decimals as other tokens displayed
      amount: simulateAmount,
      displayAmount: toDisplay(
        simulateAmount,
        toTokenInfoOnSameChainId.decimals
      ), // get the final out amount, which is the token out amount we want
    };
  } catch (ex) {
    console.log("error simulating evm: ", ex);
  }
};

export const handleSimulateSwap = async (query: {
  originalFromInfo: TokenItemType;
  originalToInfo: TokenItemType;
  originalAmount: number;
  routerClient: OraiswapRouterReadOnlyInterface;
}): Promise<SimulateResponse> => {
  // if the from token info is on bsc or eth, then we simulate using uniswap / pancake router
  // otherwise, simulate like normal
  if (
    isSupportedNoPoolSwapEvm(query.originalFromInfo.coinGeckoId) ||
    isEvmSwappable({
      fromChainId: query.originalFromInfo.chainId,
      toChainId: query.originalToInfo.chainId,
      fromContractAddr: query.originalFromInfo.contractAddress,
      toContractAddr: query.originalToInfo.contractAddress,
    })
  ) {
    // reset previous amount calculation since now we need to deal with original from & to info, not oraichain token info
    const { amount, displayAmount } = await simulateSwapEvm({
      fromInfo: query.originalFromInfo,
      toInfo: query.originalToInfo,
      amount: toAmount(
        query.originalAmount,
        query.originalFromInfo.decimals
      ).toString(),
    });
    console.log("amount, display amount: ", { amount, displayAmount });
    return { amount, displayAmount };
  }
  const fromInfo = getTokenOnOraichain(query.originalFromInfo.coinGeckoId);
  const toInfo = getTokenOnOraichain(query.originalToInfo.coinGeckoId);
  if (!fromInfo || !toInfo)
    throw new Error(
      `Cannot find token on Oraichain for token ${query.originalFromInfo.coinGeckoId} and ${query.originalToInfo.coinGeckoId}`
    );
  const { amount } = await simulateSwap({
    fromInfo,
    toInfo,
    amount: toAmount(query.originalAmount, fromInfo.decimals).toString(),
    routerClient: query.routerClient,
  });
  return {
    amount,
    displayAmount: toDisplay(
      amount,
      getTokenOnOraichain(toInfo.coinGeckoId)?.decimals
    ),
  };
};

export const checkFeeRelayer = async (query: {
  originalFromToken: TokenItemType;
  relayerFee: {
    relayerAmount: string;
    relayerDecimals: number;
  };
  fromAmount: number;
  routerClient: OraiswapRouterReadOnlyInterface;
}): Promise<boolean> => {
  const { originalFromToken, relayerFee, fromAmount, routerClient } = query;
  if (!relayerFee || !parseInt(relayerFee.relayerAmount)) return true;
  let relayerDisplay = toDisplay(
    relayerFee.relayerAmount,
    relayerFee.relayerDecimals
  );

  // From Token is orai
  if (originalFromToken.coinGeckoId === "oraichain-token") {
    if (relayerDisplay >= fromAmount) return false;
    return true;
  }

  return checkFeeRelayerNotOrai({
    fromTokenInOrai: getTokenOnOraichain(originalFromToken.coinGeckoId),
    fromAmount,
    relayerAmount: relayerFee.relayerAmount,
    routerClient,
  });
};

export const checkFeeRelayerNotOrai = async (query: {
  fromTokenInOrai: TokenItemType;
  fromAmount: number;
  relayerAmount: string;
  routerClient: OraiswapRouterReadOnlyInterface;
}): Promise<boolean> => {
  const { fromTokenInOrai, fromAmount, routerClient, relayerAmount } = query;
  if (!fromTokenInOrai) return true;
  if (fromTokenInOrai.chainId !== "Oraichain")
    throw generateError(
      "From token on Oraichain is not on Oraichain. The developers have made a mistake. Please notify them!"
    );
  // estimate exchange token when From Token not orai. Only need to swap & check if it is swappable with ORAI. Otherwise, we ignore the fees
  if (
    isInPairList(fromTokenInOrai.denom) ||
    isInPairList(fromTokenInOrai.contractAddress)
  ) {
    const oraiToken = getTokenOnOraichain("oraichain-token");
    const { amount } = await simulateSwap({
      fromInfo: fromTokenInOrai,
      toInfo: oraiToken,
      amount: toAmount(fromAmount, fromTokenInOrai.decimals).toString(),
      routerClient: routerClient,
    });
    const amountDisplay = toDisplay(amount, fromTokenInOrai.decimals);
    const relayerAmountDisplay = toDisplay(relayerAmount);
    if (relayerAmountDisplay > amountDisplay) return false;
    return true;
  }
  return true;
};

// verify balance
export const checkBalanceChannelIbc = async (
  ibcInfo: IBCInfo,
  toToken: TokenItemType,
  toSimulateAmount: string,
  ics20Client: CwIcs20LatestReadOnlyInterface
) => {
  try {
    let pairKey = buildIbcWasmPairKey(
      ibcInfo.source,
      ibcInfo.channel,
      toToken.denom
    );
    if (toToken.prefix && toToken.contractAddress) {
      pairKey = buildIbcWasmPairKey(
        ibcInfo.source,
        ibcInfo.channel,
        `${toToken.prefix}${toToken.contractAddress}`
      );
    }
    let balance: Amount;
    try {
      const { balance: channelBalance } = await ics20Client.channelWithKey({
        channelId: ibcInfo.channel,
        denom: pairKey,
      });
      balance = channelBalance;
    } catch (error) {
      // do nothing because the given channel and key doesnt exist
      // console.log("error querying channel with key: ", error);
      return;
    }

    if ("native" in balance) {
      const pairMapping = await ics20Client.pairMapping({ key: pairKey });
      const trueBalance = toDisplay(
        balance.native.amount,
        pairMapping.pair_mapping.remote_decimals
      );
      const _toAmount = toDisplay(toSimulateAmount, toToken.decimals);
      if (trueBalance < _toAmount) {
        throw generateError(`pair key is not enough balance!`);
      }
    }
  } catch (error) {
    // console.log({ CheckBalanceChannelIbcErrors: error });
    throw generateError(
      `Error in checking balance channel ibc: ${{
        CheckBalanceChannelIbcErrors: error,
      }}`
    );
  }
};

export const getBalanceIBCOraichain = async (
  token: TokenItemType,
  client: CosmWasmClient,
  ibcWasmContract: string
) => {
  if (!token) return { balance: 0 };
  if (token.contractAddress) {
    const cw20Token = new OraiswapTokenQueryClient(
      client,
      token.contractAddress
    );
    const { balance } = await cw20Token.balance({ address: ibcWasmContract });
    return { balance: toDisplay(balance, token.decimals) };
  }
  const { amount } = await client.getBalance(ibcWasmContract, token.denom);
  return { balance: toDisplay(amount, token.decimals) };
};

// ORAI ( ETH ) -> check ORAI (ORAICHAIN - compare from amount with cw20 / native amount) (fromAmount) -> check AIRI - compare to amount with channel balance (ORAICHAIN) (toAmount) -> AIRI (BSC)
// ORAI ( ETH ) -> check ORAI (ORAICHAIN) - compare from amount with cw20 / native amount) (fromAmount) -> check wTRX - compare to amount with channel balance (ORAICHAIN) (toAmount) -> wTRX (TRON)
export const checkBalanceIBCOraichain = async (
  to: TokenItemType,
  from: TokenItemType,
  fromAmount: number,
  toSimulateAmount: string,
  client: CosmWasmClient,
  ibcWasmContract: string
) => {
  const ics20Client = new CwIcs20LatestQueryClient(client, ibcWasmContract);
  // ORAI ( ETH ) -> check ORAI (ORAICHAIN) -> ORAI (BSC)
  // no need to check this case because users will swap directly. This case should be impossible because it is only called when transferring from evm to other networks
  if (from.chainId === "Oraichain" && to.chainId === from.chainId) return;
  // always check from token in ibc wasm should have enough tokens to swap / send to destination
  const token = getTokenOnOraichain(from.coinGeckoId);
  if (!token) return;
  const { balance } = await getBalanceIBCOraichain(
    token,
    client,
    ibcWasmContract
  );
  if (balance < fromAmount) {
    throw generateError(
      `The bridge contract does not have enough balance to process this bridge transaction. Wanted ${fromAmount}, have ${balance}`
    );
  }
  // if to token is evm, then we need to evaluate channel state balance of ibc wasm
  if (
    to.chainId === "0x01" ||
    to.chainId === "0x38" ||
    to.chainId === "0x2b6653dc"
  ) {
    const ibcInfo: IBCInfo | undefined = getIbcInfo("Oraichain", to.chainId);
    if (!ibcInfo)
      throw generateError("IBC Info error when checking ibc balance");
    await checkBalanceChannelIbc(ibcInfo, to, toSimulateAmount, ics20Client);
  }
};

export const buildIbcWasmHooksMemo = (stargateMsgs: StargateMsg[]): string => {
  return JSON.stringify({
    wasm: {
      execute: {
        contract_addr: IBC_WASM_HOOKS_CONTRACT,
        msg: {
          execute_msgs: toBinary(stargateMsgs),
        },
      },
    },
  });
};

export function filterNonPoolEvmTokens(
  chainId: string,
  coingeckoId: CoinGeckoId,
  denom: string,
  searchTokenName: string,
  direction: SwapDirection // direction = to means we are filtering to tokens
) {
  // basic filter. Dont include itself & only collect tokens with searched letters
  const listTokens =
    direction === SwapDirection.From ? swapFromTokens : swapToTokens;
  let filteredToTokens = listTokens.filter(
    (token) =>
      token.denom !== denom &&
      token.name.toLowerCase().includes(searchTokenName.toLowerCase())
  );
  // special case for tokens not having a pool on Oraichain
  if (isSupportedNoPoolSwapEvm(coingeckoId)) {
    const swappableTokens = Object.keys(swapEvmRoutes[chainId]).map(
      (key) => key.split("-")[1]
    );
    const filteredTokens = filteredToTokens.filter((token) =>
      swappableTokens.includes(token.contractAddress)
    );

    // tokens that dont have a pool on Oraichain like WETH or WBNB cannot be swapped from a token on Oraichain
    if (direction === SwapDirection.To)
      return [
        ...new Set(
          filteredTokens.concat(
            filteredTokens.map((token) =>
              getTokenOnOraichain(token.coinGeckoId)
            )
          )
        ),
      ];
    filteredToTokens = filteredTokens;
  }
  // special case filter. Tokens on networks other than supported evm cannot swap to tokens, so we need to remove them
  if (!isEvmNetworkNativeSwapSupported(chainId as NetworkChainId))
    return filteredToTokens.filter((t) => {
      // one-directional swap. non-pool tokens of evm network can swap be swapped with tokens on Oraichain, but not vice versa
      const isSupported = isSupportedNoPoolSwapEvm(t.coinGeckoId);
      if (direction === SwapDirection.To) return !isSupported;
      if (isSupported) {
        // if we cannot find any matched token then we dont include it in the list since it cannot be swapped
        const sameChainId = getTokenOnSpecificChainId(
          coingeckoId,
          t.chainId as NetworkChainId
        );
        if (!sameChainId) return false;
        return true;
      }
      return true;
    });
  return filteredToTokens.filter((t) => {
    // filter out to tokens that are on a different network & with no pool because we are not ready to support them yet. TODO: support
    if (isSupportedNoPoolSwapEvm(t.coinGeckoId)) return t.chainId === chainId;
    return true;
  });
}

import { BigDecimal } from "@oraichain/oraidex-common";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { TokenItemType, IBC_WASM_CONTRACT } from "@oraichain/oraidex-common";
import { CwIcs20LatestQueryClient } from "@oraichain/common-contracts-sdk";
import { UniversalSwapHelper, isEvmNetworkNativeSwapSupported } from "@oraichain/oraidex-universal-swap";
import { OraiswapRouterQueryClient } from "@oraichain/oraidex-contracts-sdk";
import { PAIRS, USDC_CONTRACT, ORAIX_CONTRACT, PairMapping } from "@oraichain/oraidex-common";

/**
 * Interface for input parameters of getTotalFee function
 */
export interface GetTotalFeeParams {
  simulateDisplayAmount: number;
  fromTokenFee?: number;
  toTokenFee?: number;
  relayerFeeAmount?: number;
  swapFee?: number;
}

/**
 * Interface for breakdown results of different fee types
 */
export interface FeeBreakdown {
  bridgeFee: number;
  relayerFee: number;
  swapFee: number;
  totalFee: number;
}

/**
 * Interface for token fee calculation parameters
 */
export interface CalculateTokenFeeParams {
  originalFromToken: TokenItemType;
  originalToToken: TokenItemType;
  fromToken: TokenItemType;
  toToken: TokenItemType;
  client: SigningCosmWasmClient;
}

/**
 * Interface for swap fee calculation parameters
 */
export interface CalculateSwapFeeParams {
  fromToken: TokenItemType;
  toToken: TokenItemType;
}

/**
 * Interface for swap fee results
 */
export interface SwapFeeResult {
  fee: number;
  isDependOnNetwork: boolean;
}

/**
 * Interface for relayer fee calculation parameters
 */
export interface CalculateRelayerFeeParams {
  originalFromToken: TokenItemType;
  originalToToken: TokenItemType;
  client: SigningCosmWasmClient;
  network: any;
  oraichainTokens: TokenItemType[];
  flattenTokens: TokenItemType[];
}
export const getRouterConfig = (options?: {
  path?: string;
  protocols?: string[];
  dontAllowSwapAfter?: string[];
  maxSplits?: number;
  ignoreFee?: boolean;
}) => {
  return {
    url: "https://osor.oraidex.io",
    path: options?.path ?? "/smart-router/alpha-router",
    protocols: options?.protocols ?? ["Oraidex", "OraidexV3"],
    dontAllowSwapAfter: options?.dontAllowSwapAfter ?? ["Oraidex", "OraidexV3"],
    maxSplits: options?.maxSplits,
    ignoreFee: options?.ignoreFee ?? false,
  };
};
// ===== SWAP FEE CALCULATION =====
const PAIRS_CHART: PairMapping[] = PAIRS.map((pair) => {
  const assets = pair.asset_infos.map((info) => {
    if ("native_token" in info) return info.native_token.denom;
    return info.token.contract_addr;
  });

  let symbol = `${pair.symbols[0]}/${pair.symbols[1]}`;
  if (assets[0] === USDC_CONTRACT && assets[1] === ORAIX_CONTRACT) {
    symbol = `${pair.symbols[1]}/${pair.symbols[0]}`;
  }
  return {
    ...pair,
    symbol,
    info: `${assets[0]}-${assets[1]}`,
  };
});

function checkIsPairOfPool({ fromName, toName }: { fromName: string; toName: string }): boolean {
  // const pairFound = PAIRS_CHART.find((pair) => {
  //   const symbols = pair.symbols.map((symbol) => symbol.toUpperCase());
  //   return symbols.includes(fromName) && symbols.includes(toName);
  // });
  // return !!pairFound;
    // TODO: check a pair is v2
  return true;
}

/**
 * Calculate swap fee (replaces useSwapFee hook)
 */
export function calculateSwapFee(params: CalculateSwapFeeParams): SwapFeeResult {
  const { fromToken, toToken } = params;
  const SWAP_FEE_PER_ROUTE = 0.003;

  const isDependOnNetwork =
    fromToken.chainId !== "Oraichain" || toToken.chainId !== "Oraichain";

  if (!fromToken || !toToken) {
    return { fee: 0, isDependOnNetwork };
  }

  const {
    name: fromName = "",
    chainId: fromChainId,
  } = fromToken;
  const { name: toName = "", chainId: toChainId } = toToken;

  // Same chainId as evm, or bnb => swap fee = 0
  // Same Token Name and !== chainId => bridge token => swap fee = 0

  if (fromChainId === "Oraichain" && toChainId === "Oraichain") {
    if (
      checkIsPairOfPool({
        fromName: fromName?.toUpperCase(),
        toName: toName?.toUpperCase(),
      })
    ) {
      return { fee: SWAP_FEE_PER_ROUTE, isDependOnNetwork };
    }

    return { fee: SWAP_FEE_PER_ROUTE * 2, isDependOnNetwork };
  }

  // Bridge
  if (fromChainId !== toChainId && toName === fromName) {
    return { fee: 0, isDependOnNetwork };
  }

  // Swap to oraichain and bridge
  if (
    fromChainId !== toChainId &&
    toName !== fromName &&
    (fromChainId === "Oraichain" || toChainId === "Oraichain")
  ) {
    return { fee: SWAP_FEE_PER_ROUTE, isDependOnNetwork };
  }

  return { fee: SWAP_FEE_PER_ROUTE, isDependOnNetwork };
}

// ===== TOKEN FEE CALCULATION =====

/**
 * Get transfer token fee from IBC contract
 */
async function getTransferTokenFee(params: {
  remoteTokenDenom: string;
  client: SigningCosmWasmClient;
}): Promise<{ nominator: number; denominator: number } | undefined> {
  try {
    const { remoteTokenDenom, client } = params;
    const ibcWasmContract = new CwIcs20LatestQueryClient(client, IBC_WASM_CONTRACT);
    const ratio = await ibcWasmContract.getTransferTokenFee({
      remoteTokenDenom,
    });
    return ratio;
  } catch (error) {
    console.log({ error });
    return undefined;
  }
}

/**
 * Calculate token fee for a single token (replaces logic in useTokenFee)
 */
async function calculateSingleTokenFee(
  remoteTokenDenom: string,
  fromChainId: string,
  toChainId: string,
  client: SigningCosmWasmClient
): Promise<number> {
  // Since we have supported evm swap, tokens that are on the same supported evm chain id don't have any token fees
  if (
    isEvmNetworkNativeSwapSupported(fromChainId) &&
    fromChainId === toChainId
  ) {
    return 0;
  }

  if (remoteTokenDenom) {
    const ratio = await getTransferTokenFee({ remoteTokenDenom, client });
    if (ratio) {
      return (ratio.nominator / ratio.denominator) * 100;
    }
  }

  return 0;
}

/**
 * Calculate token fee for both from and to tokens (replaces useTokenFee hook)
 */
export async function calculateTokenFee(
  params: CalculateTokenFeeParams
): Promise<{ fromTokenFee: number; toTokenFee: number }> {
  const {
    originalFromToken,
    originalToToken,
    fromToken,
    toToken,
    client,
  } = params;

  const [fromTokenFee, toTokenFee] = await Promise.all([
    calculateSingleTokenFee(
      originalFromToken.prefix + originalFromToken.contractAddress,
      fromToken.chainId,
      toToken.chainId,
      client
    ),
    calculateSingleTokenFee(
      originalToToken.prefix + originalToToken.contractAddress,
      fromToken.chainId,
      toToken.chainId,
      client
    ),
  ]);

  return { fromTokenFee, toTokenFee };
}

// ===== RELAYER FEE CALCULATION =====

/**
 * Fetch fee config from IBC contract
 */
async function fetchFeeConfig(client: SigningCosmWasmClient): Promise<any> {
  const ics20Contract = new CwIcs20LatestQueryClient(client, IBC_WASM_CONTRACT);
  try {
    return await ics20Contract.config();
  } catch (error) {
    console.log(`Error when query fee config using oracle: ${error}`);
    return undefined;
  }
}

/**
 * Calculate relayer fee (replaces useRelayerFeeToken hook)
 * Logic: 
 * 1. Get relayer fee config from IBC contract
 * 2. Calculate relayerFeeInOrai based on from/to token prefix
 * 3. Simulate swap from ORAI token to target token with amount = relayerFeeInOrai
 */
export async function calculateRelayerFee(
  params: CalculateRelayerFeeParams
): Promise<{ relayerFeeInOrai: number; relayerFeeAmount: number }> {
  const {
    originalFromToken,
    originalToToken,
    client,
    network,
    oraichainTokens,
    flattenTokens,
  } = params;

  try {
    // Step 1: Check if same EVM network, then no relayer fee
    if (
      isEvmNetworkNativeSwapSupported(originalFromToken.chainId) &&
      originalFromToken.chainId === originalToToken.chainId
    ) {
      return { relayerFeeInOrai: 0, relayerFeeAmount: 0 };
    }

    // Step 2: Get relayer fee config
    const feeConfigs = await fetchFeeConfig(client);
    if (!feeConfigs) {
      return { relayerFeeInOrai: 0, relayerFeeAmount: 0 };
    }

    // Step 3: Calculate relayerFeeInOrai from config based on prefix
    const { relayer_fees: relayerFees } = feeConfigs;
    const relayerFeeInOraiRaw = relayerFees.reduce((acc, cur) => {
      const isFromToPrefix =
        cur.prefix === originalFromToken.prefix ||
        cur.prefix === originalToToken.prefix;
      if (isFromToPrefix) return +cur.amount + acc;
      return acc;
    }, 0);

    if (!relayerFeeInOraiRaw) {
      return { relayerFeeInOrai: 0, relayerFeeAmount: 0 };
    }

    // Convert to display amount (divide by 10^6 because ORAI has 6 decimals)
    const relayerFeeInOrai = Number(relayerFeeInOraiRaw) / Math.pow(10, 6);

    // Step 4: Simulate swap from ORAI token to target token
    const routerClient = new OraiswapRouterQueryClient(client, network.router);
    
    const oraiToken = oraichainTokens.find(
      (token) => token.coinGeckoId === "oraichain-token"
    );

    if (!oraiToken) {
      return { relayerFeeInOrai, relayerFeeAmount: 0 };
    }
    
    const data = await UniversalSwapHelper.handleSimulateSwap({
      flattenTokens,
      oraichainTokens,
      originalFromInfo: oraiToken, 
      originalToInfo: originalToToken, 
      originalAmount: relayerFeeInOrai, 
      routerClient,
      routerConfig: getRouterConfig({ignoreFee: true})
    });
    

    if (data) {
      return {
        relayerFeeInOrai,
        relayerFeeAmount: Number(data.displayAmount || 0),
      };
    }

    return { relayerFeeInOrai, relayerFeeAmount: 0 };
  } catch (error) {
    console.log("Error calculating relayer fee:", error);
    return { relayerFeeInOrai: 0, relayerFeeAmount: 0 };
  }
}

// ===== MAIN TOTAL FEE CALCULATION =====

/**
 * Calculate total fee for universal swap
 * 
 * @param params - Fee calculation parameters
 * @returns Detailed breakdown of different fee types
 */
export function getTotalFee(params: GetTotalFeeParams): FeeBreakdown {
  const {
    simulateDisplayAmount,
    fromTokenFee = 0,
    toTokenFee = 0,
    relayerFeeAmount = 0,
    swapFee = 0
  } = params;

  // 1. Calculate Bridge Fee: simulateDisplayAmount * (fromTokenFee + toTokenFee) / 100
  const calcBridgeFee = simulateDisplayAmount && (fromTokenFee || toTokenFee)
    ? new BigDecimal(simulateDisplayAmount)
        .mul(fromTokenFee)
        .add(new BigDecimal(simulateDisplayAmount).mul(toTokenFee))
        .div(100)
        .toNumber()
    : 0;

  // 2. Relayer Fee: use relayerFeeAmount directly
  // const calcRelayerFee = relayerFeeAmount || 0;
  
  //relayer fee is 0 for now
  const calcRelayerFee = 0;
  // 3. Calculate Swap Fee: simulateDisplayAmount * swapFee
  const calcSwapFee = new BigDecimal(simulateDisplayAmount || 0)
    .mul(swapFee || 0)
    .toNumber();

  // 4. Total Fee = Bridge Fee + Relayer Fee + Swap Fee
  const totalFee = new BigDecimal(calcBridgeFee)
    .add(calcRelayerFee)
    .add(calcSwapFee)
    .toNumber();

  return {
    bridgeFee: calcBridgeFee,
    relayerFee: calcRelayerFee,
    swapFee: calcSwapFee,
    totalFee
  };
}

/**
 * Helper function to get only total fee without breakdown
 */
export function getTotalFeeOnly(params: GetTotalFeeParams): number {
  return getTotalFee(params).totalFee;
}

/**
 * Comprehensive function to calculate all fees from tokens and return total fee
 */
export async function calculateAllFeesAndTotal(
  params: CalculateTokenFeeParams & CalculateRelayerFeeParams & {
    simulateDisplayAmount: number;
  }
): Promise<FeeBreakdown & { 
  fromTokenFee: number; 
  toTokenFee: number; 
  isDependOnNetwork: boolean;
}> {
  const { simulateDisplayAmount, fromToken, toToken } = params;

  // Calculate different fee types in parallel
  const [
    { fromTokenFee, toTokenFee },
    { fee: swapFee, isDependOnNetwork },
    { relayerFeeAmount }
  ] = await Promise.all([
    calculateTokenFee(params),
    Promise.resolve(calculateSwapFee({ fromToken, toToken })),
    calculateRelayerFee(params)
  ]);

  // Calculate total fee
  const feeBreakdown = getTotalFee({
    simulateDisplayAmount,
    fromTokenFee,
    toTokenFee,
    relayerFeeAmount,
    swapFee
  });
  console.log(feeBreakdown, "feeBreakdown");
  return {
    ...feeBreakdown,
    fromTokenFee,
    toTokenFee,
    isDependOnNetwork
  };
} 
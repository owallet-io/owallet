import {
  CHAIN_ID_MAPPING,
  TOKEN_DENOM_MAPPING,
  normalizeChainIdForSkip,
} from "../constants/skip-config";
import { Route, RouteParams } from "../types/v2";

/**
 * Skip-specific utility functions for the swap system
 */

/**
 * Check if a route is cross-chain
 */
export function isCrossChainRoute(route: Route): boolean {
  return route.provider === "skip" && route.extraParams?.operations?.length > 1;
}

/**
 * Get estimated completion time for Skip routes
 */
export function getSkipRouteEstimatedTime(route: Route): string {
  if (route.provider !== "skip") {
    return "Unknown";
  }

  // Check if it's cross-chain based on operations
  const operations = route.extraParams?.operations || [];
  const hasBridging = operations.some(
    (op: any) => op.transfer || op.bridge || op.ibc_transfer
  );

  if (!hasBridging) {
    return "~30 seconds"; // Same-chain swap
  }

  // Cross-chain estimates based on bridge type
  const bridgeTypes = operations
    .filter((op: any) => op.transfer || op.bridge || op.ibc_transfer)
    .map((op: any) => op.transfer?.bridge || "IBC");

  if (bridgeTypes.includes("CCTP")) {
    return "~2-5 minutes"; // CCTP is faster
  } else if (bridgeTypes.includes("IBC")) {
    return "~5-10 minutes"; // IBC transfers
  } else if (
    bridgeTypes.includes("AXELAR") ||
    bridgeTypes.includes("HYPERLANE")
  ) {
    return "~10-15 minutes"; // Other bridges
  }

  return "~5-10 minutes"; // Default estimate
}

/**
 * Get user-friendly description of Skip route path
 */
export function getSkipRouteDescription(route: Route): string {
  if (route.provider !== "skip") {
    return "Standard swap";
  }

  const operations = route.extraParams?.operations || [];

  if (operations.length <= 1) {
    return "Same-chain swap";
  }

  // Analyze operations to create description
  const swapOps = operations.filter((op: any) => op.swap);
  const bridgeOps = operations.filter(
    (op: any) => op.transfer || op.bridge || op.ibc_transfer
  );

  if (bridgeOps.length === 0) {
    return `Multi-step swap (${swapOps.length} swaps)`;
  }

  const bridgeTypes = bridgeOps.map((op: any) => {
    if (op.transfer?.bridge) return op.transfer.bridge;
    if (op.ibc_transfer) return "IBC";
    return "Bridge";
  });

  const uniqueBridges = [...new Set(bridgeTypes)];

  if (uniqueBridges.length === 1) {
    return `Cross-chain via ${uniqueBridges[0]}`;
  } else {
    return `Multi-hop via ${uniqueBridges.join(" + ")}`;
  }
}

/**
 * Get chains involved in a Skip route
 */
export function getSkipRouteChainsInvolved(route: Route): string[] {
  if (route.provider !== "skip") {
    return [route.chainId];
  }

  const operations = route.extraParams?.operations || [];
  const chains = new Set<string>();

  // Add source chain
  chains.add(route.chainId);

  // Extract chains from operations
  operations.forEach((op: any) => {
    if (op.chain_id) {
      chains.add(op.chain_id);
    }
    if (op.transfer?.dest_chain_id) {
      chains.add(op.transfer.dest_chain_id);
    }
    if (op.ibc_transfer?.dest_chain_id) {
      chains.add(op.ibc_transfer.dest_chain_id);
    }
  });

  return Array.from(chains);
}

/**
 * Check if Skip route requires gas on multiple chains
 */
export function requiresMultiChainGas(route: Route): boolean {
  if (route.provider !== "skip") {
    return false;
  }

  const chainsInvolved = getSkipRouteChainsInvolved(route);
  return chainsInvolved.length > 1;
}

/**
 * Get gas requirements for Skip route
 */
export function getSkipRouteGasRequirements(route: Route): {
  chainId: string;
  gasNeeded: boolean;
  estimatedAmount?: string;
}[] {
  if (route.provider !== "skip") {
    return [{ chainId: route.chainId, gasNeeded: true }];
  }

  const chainsInvolved = getSkipRouteChainsInvolved(route);
  return chainsInvolved.map((chainId) => ({
    chainId,
    gasNeeded: true,
    estimatedAmount: "~$1-5", // Rough estimate
  }));
}

/**
 * Format Skip route for display in UI
 */
export function formatSkipRouteForDisplay(route: Route) {
  const isSkip = route.provider === "skip";

  return {
    ...route,
    // Add Skip-specific display properties
    displayName: isSkip ? "Skip Protocol" : route.provider,
    isCrossChain: isCrossChainRoute(route),
    estimatedTime: getSkipRouteEstimatedTime(route),
    routeDescription: getSkipRouteDescription(route),
    chainsInvolved: getSkipRouteChainsInvolved(route),
    requiresMultiChainGas: requiresMultiChainGas(route),
    gasRequirements: getSkipRouteGasRequirements(route),
    // Add badges for Skip features
    badges: isSkip
      ? [
          ...(isCrossChainRoute(route) ? ["Cross-chain"] : []),
          "SAFE",
          "Protected",
        ]
      : [],
  };
}

/**
 * Validate Skip route parameters
 */
export function validateSkipRouteParams(params: RouteParams): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check if chains are supported by Skip
  const sourceSupported = Object.keys(CHAIN_ID_MAPPING).includes(
    params.chainId
  );
  const destSupported = Object.keys(CHAIN_ID_MAPPING).includes(
    params.chainIdOut
  );

  if (!sourceSupported) {
    errors.push(`Source chain ${params.chainId} not supported by Skip`);
  }

  if (!destSupported) {
    errors.push(`Destination chain ${params.chainIdOut} not supported by Skip`);
  }

  // Check minimum amounts
  const amount = parseFloat(params.amount);
  if (amount <= 0) {
    errors.push("Amount must be greater than 0");
  }

  // Check slippage tolerance
  if (params.slippageTolerance < 10 || params.slippageTolerance > 5000) {
    errors.push("Slippage tolerance must be between 0.1% and 50%");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get recommended settings for Skip routes
 */
export function getSkipRecommendedSettings(params: RouteParams) {
  const isCrossChain = params.chainId !== params.chainIdOut;
  const isStablecoinTransfer = isLikelyStablecoinTransfer(params);

  return {
    slippageTolerance: isCrossChain
      ? isStablecoinTransfer
        ? 100
        : 300 // 1% for stablecoins, 3% for cross-chain
      : 100, // 1% for same-chain
    allowMultiTx: isCrossChain, // Enable multi-tx for cross-chain
    allowUnsafe: false, // Always use SAFE mode
    maxOperations: isCrossChain ? 5 : 2, // More operations allowed for cross-chain
  };
}

/**
 * Helper function to detect stablecoin transfers
 */
function isLikelyStablecoinTransfer(params: RouteParams): boolean {
  const stablecoinSymbols = ["usdc", "usdt", "dai", "busd", "frax"];
  const tokenInLower = params.tokenIn.toLowerCase();
  const tokenOutLower = params.tokenOut.toLowerCase();

  return stablecoinSymbols.some(
    (symbol) => tokenInLower.includes(symbol) || tokenOutLower.includes(symbol)
  );
}

/**
 * Validate and normalize token denom for Skip API
 */
export function validateAndNormalizeTokenDenom(
  denom: string,
  chainId?: string
): string {
  if (!denom || typeof denom !== "string") {
    throw new Error(`Invalid token denom: ${denom}`);
  }

  // Remove any extra whitespace
  let cleaned = denom.trim();

  // Handle token symbol to denom mapping
  const upperDenom = cleaned.toUpperCase();

  // Check if we have a specific mapping for this token
  if (TOKEN_DENOM_MAPPING[upperDenom as keyof typeof TOKEN_DENOM_MAPPING]) {
    const mapping =
      TOKEN_DENOM_MAPPING[upperDenom as keyof typeof TOKEN_DENOM_MAPPING];

    // If mapping is an object (like USDC), use chain-specific mapping
    if (typeof mapping === "object" && chainId) {
      const normalizedChainId = normalizeChainIdForSkip(chainId);
      const chainSpecificDenom =
        mapping[normalizedChainId as keyof typeof mapping];
      if (chainSpecificDenom) {
        cleaned = chainSpecificDenom;
      }
    } else if (typeof mapping === "string") {
      cleaned = mapping;
    }
  }

  // Special handling for common cases based on chain context
  if (upperDenom === "OSMO") {
    cleaned = "uosmo"; // Always use micro denomination for Osmosis
  } else if (upperDenom === "BNB" && chainId) {
    const normalizedChainId = normalizeChainIdForSkip(chainId);
    if (normalizedChainId === "56") {
      // Native BNB on BSC - Skip API uses this format for native tokens
      cleaned = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
    }
  } else if (upperDenom === "ETH" && chainId) {
    const normalizedChainId = normalizeChainIdForSkip(chainId);
    if (normalizedChainId === "1") {
      // Native ETH on Ethereum
      cleaned = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
    }
  }

  // If the original denom already looks correct, use it as-is
  if (
    cleaned.startsWith("ibc/") ||
    cleaned.startsWith("factory/") ||
    cleaned.startsWith("0x") ||
    cleaned.match(/^u[a-z]+$/) // micro denominations like uosmo, uatom
  ) {
    // Keep the original format for properly formatted denoms
  }

  // Log the token denom for debugging
  console.log("Token denom validation:", {
    original: denom,
    cleaned: cleaned,
    chainId: chainId,
    isIBC: cleaned.startsWith("ibc/"),
    isFactory: cleaned.includes("factory/"),
    isNative: cleaned.match(/^[a-z][a-z0-9]*$/),
    isEVM: cleaned.startsWith("0x"),
    isMicroDenom: cleaned.match(/^u[a-z]+$/),
  });

  return cleaned;
}

/**
 * Create Skip route request with optimal settings
 */
export function createOptimizedSkipRequest(params: RouteParams) {
  try {
    // Normalize chain IDs for Skip API first
    const sourceChainId = normalizeChainIdForSkip(params.chainId);
    const destChainId = normalizeChainIdForSkip(params.chainIdOut);

    console.log("Chain ID normalization:", {
      original: { source: params.chainId, dest: params.chainIdOut },
      normalized: { source: sourceChainId, dest: destChainId },
    });

    // Validate and normalize token denoms with chain context
    const sourceTokenDenom = validateAndNormalizeTokenDenom(
      params.tokenIn,
      params.chainId
    );
    const destTokenDenom = validateAndNormalizeTokenDenom(
      params.tokenOut,
      params.chainIdOut
    );

    console.log("Token denomination mapping:", {
      source: { original: params.tokenIn, normalized: sourceTokenDenom },
      dest: { original: params.tokenOut, normalized: destTokenDenom },
    });

    // Validate amount
    const amount = params.amount.toString().trim();
    if (!amount || amount === "0" || isNaN(Number(amount))) {
      throw new Error(`Invalid amount: ${amount}`);
    }

    // Special validation for OSMO to BNB route
    if (
      params.tokenIn.toUpperCase() === "OSMO" &&
      params.tokenOut.toUpperCase() === "BNB"
    ) {
      console.log("🔍 OSMO to BNB route detected - using optimized settings:", {
        sourceChainId,
        destChainId,
        sourceTokenDenom,
        destTokenDenom,
        amount,
      });
    }

    // Create the correct Skip API request format
    // The /v2/fungible/route endpoint expects these specific fields
    const request = {
      amount_in: amount,
      source_asset_denom: sourceTokenDenom,
      source_asset_chain_id: sourceChainId,
      dest_asset_denom: destTokenDenom,
      dest_asset_chain_id: destChainId,
      // Optional settings for route optimization
      allow_multi_tx: true,
      allow_unsafe: false, // Use SAFE mode for better reliability
      cumulative_affiliate_fee_bps: "0", // No affiliate fees
      // Add client_id to help with debugging
      client_id: "owallet-mobile",
    };

    console.log(
      "Final Skip request structure:",
      JSON.stringify(request, null, 2)
    );
    return request;
  } catch (error) {
    console.error("Error creating Skip request:", error);
    throw error;
  }
}

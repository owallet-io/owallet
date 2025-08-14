import { BaseAdapter } from "./BaseAdapter";
import { Route, RouteParams, Transaction } from "../../types/v2";
import axios, { AxiosInstance } from "axios";
import { Dec, DecUtils, RatePretty } from "@owallet/unit";
import {
  AddressLookupTableAccount,
  Connection,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { ethers } from "ethers";
import {
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { referalAddressSol } from "../../utils";
// Solana native token address
const SOL_NATIVE_ADDRESS = "So11111111111111111111111111111111111111112";
const USDC_TOKENS = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export class JupiterAdapter extends BaseAdapter {
  supportsAbortController(): boolean {
    return true;
  }
  readonly provider = "jupiter";
  readonly supportedChains = ["solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"];
  private prices: Record<string, { usd: number }> = {};
  private apiClient: AxiosInstance;
  private abortControllers: Map<string, AbortController> = new Map();
  private lastPriceUpdate: number = 0;
  // Token metadata cache
  private tokenMetadataCache: Map<
    string,
    { decimals: number; symbol?: string; timestamp: number }
  > = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Track pending metadata requests to avoid duplicates
  private pendingMetadataRequests: Map<
    string,
    Promise<{ decimals: number; symbol?: string }>
  > = new Map();

  private swapStore: any;

  constructor(swapStore: any) {
    super();
    this.apiClient = axios.create({
      timeout: 10000,
    });

    this.swapStore = swapStore;

    // Set up periodic cache cleanup (every 2 minutes)
    setInterval(() => {
      this.cleanExpiredCache();
    }, 2 * 60 * 1000);
  }

  async getRoutes(params: RouteParams, signal?: AbortSignal): Promise<Route[]> {
    console.log("[logging] Jupiter adapter getRoutes started with params:", {
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amount: params.amount,
      chainId: params.chainId,
    });

    const { tokenIn, tokenOut, amount } = params;

    // Simplified abort controller logic
    const requestId = `${tokenIn}-${tokenOut}-${amount}-${Date.now()}`;
    this.abortPreviousRequests(tokenIn, tokenOut);

    const abortController = new AbortController();
    this.abortControllers.set(requestId, abortController);

    try {
      const tokenInAddress =
        tokenIn === "native" ? SOL_NATIVE_ADDRESS : tokenIn;
      const tokenOutAddress =
        tokenOut === "native" ? SOL_NATIVE_ADDRESS : tokenOut;

      // Execute Jupiter quote request
      const response = await this.apiClient.get(
        "https://lite-api.jup.ag/swap/v1/quote",
        {
          params: {
            inputMint: tokenInAddress,
            outputMint: tokenOutAddress,
            amount: amount,
            swapMode: "ExactIn",
          },
          signal: signal,
        }
      );

      const jupiterData = response.data;

      // Extract all unique token addresses for a single price fetch
      const feeMintIds = jupiterData.routePlan
        .map((route: any) => route.swapInfo?.feeMint)
        .filter(Boolean);

      const allTokenIds = [
        ...new Set([tokenInAddress, tokenOutAddress, ...feeMintIds]),
      ];

      // Fetch all prices and token metadata in parallel
      const [allPrices, tokenMetadata] = await Promise.all([
        this.fetchPrices(allTokenIds, signal),
        this.fetchTokenMetadataBatch(feeMintIds, signal),
      ]);

      // Calculate USD values using params data
      const fromTokenDecimals = params.tokenInDecimals || 9;
      const toTokenDecimals = params.tokenOutDecimals || 9;

      const priceOutUsd = this.calculateUsdValue(
        jupiterData.outAmount,
        toTokenDecimals,
        allPrices[tokenOutAddress]?.price || 0
      );

      const priceInUsd = this.calculateUsdValue(
        jupiterData.inAmount,
        fromTokenDecimals,
        allPrices[tokenInAddress]?.price || 0
      );

      // Calculate fees efficiently
      const feeInUsd = this.calculateTotalFeeUsd(
        jupiterData.routePlan,
        allPrices,
        tokenMetadata,
        0
      );

      // Format price impact
      const smallImpact = new Dec(jupiterData.priceImpactPct || 0);
      const formattedSmall = new RatePretty(smallImpact)
        .maxDecimals(2)
        .inequalitySymbol(true)
        .toString();

      const routes = jupiterData.routePlan.map(
        (route: any) => route.swapInfo?.label || "Unknown"
      );
      const slippageMultiplier = new Dec(1).sub(
        new Dec(
          new Dec(params.slippageTolerance).quo(new Dec(100)).toString()
        ).quo(new Dec(100))
      );
      const minimumReceived = new Dec(jupiterData.outAmount || "0").mul(
        slippageMultiplier
      );
      const minimumReceivedFormatted = minimumReceived.quo(
        DecUtils.getTenExponentN(params.tokenOutDecimals || 0)
      );

      const usdPriceMinimumReceived = new Dec(
        allPrices[tokenOutAddress]?.price || 0
      )
        .mul(minimumReceivedFormatted)
        .toString();
      const route: Route = {
        id: jupiterData.requestId,
        provider: this.provider,
        tokenIn: tokenInAddress,
        tokenOut: tokenOutAddress,
        amountIn: jupiterData.inAmount,
        amountOut: jupiterData.outAmount,
        amountInUsd: priceInUsd.toString(),
        amountOutUsd: priceOutUsd.toString(),
        priceImpact: formattedSmall?.replace("%", ""),
        estimatedGas: "0",
        estimatedGasUsd: feeInUsd?.toString() || "0",
        route: routes,
        routerAddress: "",
        chainId: "solana",
        quoteResponse: jupiterData,
        extraParams: {
          slippageBps: jupiterData.slippageBps,
          feeMint: jupiterData.feeMint,
          swapMode: jupiterData.swapMode,
        },
        minimumReceived: minimumReceivedFormatted?.toString() || "0",
        minimumReceivedUsd: usdPriceMinimumReceived || "0",
      };

      console.log("[logging] Jupiter adapter getRoutes completed with route:", {
        provider: route.provider,
        amountOut: route.amountOut,
        priceImpact: route.priceImpact,
        routes: route.route,
      });

      return [route];
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Request canceled:", error.message);
        return [];
      }

      console.error("Jupiter getRoutes error:", error);
      throw error;
    } finally {
      if (this.abortControllers.get(requestId) === abortController) {
        this.abortControllers.delete(requestId);
      }
    }
  }

  // Helper method to abort previous requests
  private abortPreviousRequests(tokenIn: string, tokenOut: string): void {
    const keysToDelete: string[] = [];
    for (const [key, controller] of this.abortControllers.entries()) {
      if (key.includes(`${tokenIn}-${tokenOut}`)) {
        controller.abort();
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => this.abortControllers.delete(key));
  }

  // Helper method to calculate USD value
  private calculateUsdValue(
    amount: string,
    decimals: number,
    price: number
  ): Dec {
    return new Dec(price).mul(
      new Dec(ethers.utils.formatUnits(amount, decimals))
    );
  }

  // Helper method to calculate total fee in USD
  private calculateTotalFeeUsd(
    routePlan: any[],
    prices: Record<string, { price: number }>,
    tokenMetadata: Map<string, { decimals: number }>,
    fallbackPrice: number
  ): Dec {
    let feeInUsd = new Dec(0);

    for (const route of routePlan) {
      const feeMint = route.swapInfo?.feeMint;
      const feeAmount = route.swapInfo?.feeAmount;

      if (!feeMint || !feeAmount) continue;

      const metadata = tokenMetadata.get(feeMint);
      const decimals = metadata?.decimals || 0;
      const price = prices[feeMint]?.price || fallbackPrice;

      const amount = ethers.utils.formatUnits(feeAmount, decimals);
      feeInUsd = feeInUsd.add(new Dec(price).mul(new Dec(amount)));
    }

    return feeInUsd;
  }

  // Improved method to fetch token metadata with proper caching and race condition handling
  private async fetchTokenMetadataBatch(
    tokenIds: string[],
    signal: AbortSignal
  ): Promise<Map<string, { decimals: number; symbol?: string }>> {
    const result = new Map<string, { decimals: number; symbol?: string }>();
    const uncachedTokens: string[] = [];
    const now = Date.now();

    // Check cache first with TTL validation
    for (const tokenId of tokenIds) {
      if (!tokenId) continue;

      const cached = this.tokenMetadataCache.get(tokenId);
      if (cached && now - cached.timestamp < this.CACHE_TTL) {
        // Cache is valid, use it
        result.set(tokenId, {
          decimals: cached.decimals,
          symbol: cached.symbol,
        });
      } else {
        // Cache is expired or doesn't exist
        if (cached) {
          this.tokenMetadataCache.delete(tokenId);
        }
        uncachedTokens.push(tokenId);
      }
    }

    // Handle uncached tokens with race condition prevention
    if (uncachedTokens.length > 0) {
      const fetchPromises: Promise<void>[] = [];

      for (const tokenId of uncachedTokens) {
        // Check if there's already a pending request for this token
        let pendingRequest = this.pendingMetadataRequests.get(tokenId);

        if (!pendingRequest) {
          // Create new request and store it
          pendingRequest = this.fetchSingleTokenMetadata(tokenId, signal);
          this.pendingMetadataRequests.set(tokenId, pendingRequest);
        }

        // Add to promises array
        fetchPromises.push(
          pendingRequest
            .then((metadata) => {
              result.set(tokenId, metadata);
            })
            .catch((error) => {
              console.warn(
                `Failed to fetch metadata for token ${tokenId}:`,
                error
              );
              // Use safe fallback decimals (6 is common for Solana tokens)
              const fallbackMetadata = {
                decimals: 6,
                symbol: `TOKEN_${tokenId.slice(0, 6)}`,
              };
              result.set(tokenId, fallbackMetadata);
            })
            .finally(() => {
              // Clean up pending request
              this.pendingMetadataRequests.delete(tokenId);
            })
        );
      }

      // Wait for all requests to complete
      await Promise.allSettled(fetchPromises);
    }

    return result;
  }

  // Helper method to fetch single token metadata
  private async fetchSingleTokenMetadata(
    tokenId: string,
    signal: AbortSignal
  ): Promise<{ decimals: number; symbol?: string }> {
    try {
      const { data } = await this.apiClient.get(
        `https://lite-api.jup.ag/tokens/v1/token/${tokenId}`,
        {
          signal: signal,
          timeout: 5000, // Shorter timeout for individual requests
        }
      );

      const metadata = {
        decimals: data.decimals || 6, // Safe default for Solana
        symbol: data.symbol || `TOKEN_${tokenId.slice(0, 6)}`,
      };

      // Cache the result with timestamp
      this.tokenMetadataCache.set(tokenId, {
        ...metadata,
        timestamp: Date.now(),
      });

      return metadata;
    } catch (error) {
      // Don't cache errors, throw to be handled by caller
      throw error;
    }
  }

  private async fetchPrices(flattenTokensIds, signal) {
    try {
      if (flattenTokensIds.length === 0) return;
      const { data } = await this.apiClient.get(
        "https://lite-api.jup.ag/price/v2",
        {
          params: {
            ids: flattenTokensIds.join(","),
          },
          signal: signal,
        }
      );
      if (!data.data) return {};
      return data.data;
    } catch (error) {
      console.error("Failed to fetch prices:", error);
    }
  }

  async buildTransaction(
    route: Route,
    userAddress: string,
    slippageTolerance: number
  ): Promise<Transaction> {
    try {
      const { tokenIn, tokenOut, amountIn, quoteResponse } = route;
      // Create a new AbortController for this request
      const requestId = `${tokenIn}-${tokenOut}-${amountIn}-${Date.now()}`;
      for (const [key, controller] of Array.from(
        this.abortControllers.entries()
      )) {
        if (key.includes(`${tokenIn}-${tokenOut}`)) {
          controller.abort();
          this.abortControllers.delete(key);
        }
      }

      const abortController = new AbortController();
      this.abortControllers.set(requestId, abortController);
      let amountUsdcFee = new Dec(0);
      const feeBps = 0.0075;
      if (quoteResponse.inputMint === USDC_TOKENS) {
        amountUsdcFee = new Dec(quoteResponse.inAmount).mul(new Dec(feeBps));
      } else if (quoteResponse.outputMint === USDC_TOKENS) {
        amountUsdcFee = new Dec(quoteResponse.outAmount).mul(new Dec(feeBps));
      }

      // For Jupiter, we need to fetch the actual transaction
      // We'll use the route ID from the previous request
      const { data: instructions } = await this.apiClient.post(
        "https://lite-api.jup.ag/swap/v1/swap-instructions",
        {
          requestId: route.id,
          userPublicKey: userAddress,
          // slippageBps is in basis points (100 = 1%)
          quoteResponse: {
            ...quoteResponse,
            slippageBps: slippageTolerance,
          },
          prioritizationFeeLamports: {
            priorityLevelWithMaxLamports: {
              maxLamports: 5000000,
              priorityLevel: "high",
            },
          },
          dynamicComputeUnitLimit: true,
        }
      );

      const {
        tokenLedgerInstruction, // If you are using `useTokenLedger = true`.
        computeBudgetInstructions, // The necessary instructions to setup the compute budget.
        setupInstructions, // Setup missing ATA for the users.
        swapInstruction: swapInstructionPayload, // The actual swap instruction.
        cleanupInstruction, // Unwrap the SOL if `wrapAndUnwrapSol = true`.
        addressLookupTableAddresses,
        otherInstructions,
      } = instructions;
      const deserializeInstruction = (instruction) => {
        return new TransactionInstruction({
          programId: new PublicKey(instruction.programId),
          keys: instruction.accounts.map((key) => ({
            pubkey: new PublicKey(key.pubkey),
            isSigner: key.isSigner,
            isWritable: key.isWritable,
          })),
          data: Buffer.from(instruction.data, "base64"),
        });
      };
      const connection = new Connection(
        "https://solana-mainnet.phantom.app/YBPpkkN4g91xDiAnTE9r0RcMkjg0sKUIWvAfoFVJ",
        "confirmed"
      );
      const getAddressLookupTableAccounts = async (
        keys: string[]
      ): Promise<AddressLookupTableAccount[]> => {
        const addressLookupTableAccountInfos =
          await connection.getMultipleAccountsInfo(
            keys.map((key) => new PublicKey(key))
          );

        return addressLookupTableAccountInfos.reduce(
          (acc, accountInfo, index) => {
            const addressLookupTableAddress = keys[index];
            if (accountInfo) {
              const addressLookupTableAccount = new AddressLookupTableAccount({
                key: new PublicKey(addressLookupTableAddress),
                state: AddressLookupTableAccount.deserialize(accountInfo.data),
              });
              acc.push(addressLookupTableAccount);
            }

            return acc;
          },
          new Array<AddressLookupTableAccount>()
        );
      };
      const addressLookupTableAccounts: AddressLookupTableAccount[] = [];

      addressLookupTableAccounts.push(
        ...(await getAddressLookupTableAccounts(
          addressLookupTableAddresses || []
        ))
      );
      const blockhash = (await connection.getLatestBlockhash()).blockhash;
      // Process Jupiter response
      // const jupiterData = response.data;

      const getFeeUsdc = await (async () => {
        if (amountUsdcFee.lte(new Dec(0))) {
          return null;
        }
        const decimalsUsdc = 6;

        const mint = new PublicKey(USDC_TOKENS); // e.g., USDC Mint Address
        const sender = await getAssociatedTokenAddress(
          mint,
          new PublicKey(userAddress)
        );

        const receiver = await getAssociatedTokenAddress(
          mint,
          referalAddressSol,
          true
        );

        return createTransferCheckedInstruction(
          sender, // Source Token Account
          mint, // Token Mint
          receiver, // Destination Token Account
          new PublicKey(userAddress), // Authority (signer)
          BigInt(amountUsdcFee.round().toString()), // Amount (including decimals)
          decimalsUsdc, // Token decimals
          [], // Multi-signers (if required)
          TOKEN_PROGRAM_ID
        );
      })();
      const instructionsData = [
        tokenLedgerInstruction
          ? deserializeInstruction(tokenLedgerInstruction)
          : null,
        ...(setupInstructions || []).map(deserializeInstruction),
        tokenIn === USDC_TOKENS ? getFeeUsdc : null,
        swapInstructionPayload
          ? deserializeInstruction(swapInstructionPayload)
          : null,
        cleanupInstruction ? deserializeInstruction(cleanupInstruction) : null,
        ...(otherInstructions || []).map(deserializeInstruction),
        ...(computeBudgetInstructions || []).map(deserializeInstruction),
        tokenOut === USDC_TOKENS ? getFeeUsdc : null,
      ].filter(Boolean);
      const messageV0 = new TransactionMessage({
        payerKey: new PublicKey(userAddress),
        recentBlockhash: blockhash,
        instructions: instructionsData,
      }).compileToV0Message(addressLookupTableAccounts);
      const versionedTx = new VersionedTransaction(messageV0);
      // const serializedTx = bs58.encode(versionedTx.serialize());
      // Jupiter returns a serialized transaction
      const transaction: Transaction = {
        to: "", // Solana transactions don't have a "to" field like EVM
        data: versionedTx.serialize(), // The serialized transaction data
        value: "0", // Solana transactions handle this differently
        gasLimit: "0", // Solana uses compute units instead
        chainId: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
        provider: this.provider,
        // Add additional Solana-specific fields
        serializeConfig: {
          requireAllSignatures: true,
          verifySignatures: true,
        },
        // ...response.data,
      };

      return transaction;
    } catch (error) {
      console.error("Jupiter buildTransaction error:", error);
      throw error;
    }
  }

  async signAndSendTransaction(
    tx: Transaction,
    userAddress: string
  ): Promise<string> {
    //@ts-ignore
    const buffer = Buffer.from(tx.data, "base64");
    const txDecoded = VersionedTransaction.deserialize(buffer);
    // const deserializedTx = VersionedTransaction.deserialize(
    //   bs58.decode(tx.data),
    // );
    //@ts-ignore
    const result = await window.owallet.solana.signAndSendTransaction({
      //@ts-ignore
      tx: txDecoded,
      publicKey: new PublicKey(userAddress),
    });
    //@ts-ignore
    return result;
  }

  addAffiliateFeeToBuildParams(params: any): any {
    // Add affiliate fee for Jupiter
    // See https://dev.jup.ag/docs/ultra-api/add-fees-to-ultra

    const newParams = { ...params };

    // Add fee parameters according to Jupiter's documentation
    // newParams.feeAccount = "0x8c7E0A841269a01c0Ab389Ce8Fb3Cf150A94E797"; // Your fee receiver address
    // newParams.feeBps = 5; // 0.05% fee

    return newParams;
  }

  abortRequests(): void {
    this.abortControllers.forEach((controller) => {
      controller.abort();
    });
    this.abortControllers.clear();

    // Also clear pending metadata requests
    this.pendingMetadataRequests.clear();
  }

  // Method to clean up expired cache entries
  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [tokenId, cached] of this.tokenMetadataCache.entries()) {
      if (now - cached.timestamp >= this.CACHE_TTL) {
        this.tokenMetadataCache.delete(tokenId);
      }
    }
  }

  // Public method to force refresh token metadata cache
  public clearTokenMetadataCache(tokenIds?: string[]): void {
    if (tokenIds && tokenIds.length > 0) {
      // Clear specific tokens
      tokenIds.forEach((tokenId) => this.tokenMetadataCache.delete(tokenId));
    } else {
      // Clear all cache
      this.tokenMetadataCache.clear();
    }
  }

  // Add required methods from BaseAdapter for Solana (not applicable but required by interface)
  async checkApprovalNeeded(
    _tokenAddress: string,
    _ownerAddress: string,
    _spenderAddress: string,
    _amount: string,
    _chainId: string | number
  ): Promise<boolean> {
    // Solana doesn't require token approvals like EVM chains
    return false;
  }

  async buildApprovalTransaction(
    _tokenAddress: string,
    _spenderAddress: string,
    _amount: string,
    _chainId: string | number
  ): Promise<Transaction> {
    // Solana doesn't require approval transactions
    throw new Error("Approval transactions not needed on Solana");
  }

  async getPriceImpact(_params: {
    tokenInAddress: string;
    tokenInDecimals: number;
    tokenOutAddress: string;
    tokenOutDecimals: number;
    amountIn: string;
    amountOut: string;
    chainId: number;
  }): Promise<{ priceImpact: string }> {
    // Price impact is calculated in getRoutes method
    return { priceImpact: "0" };
  }
}

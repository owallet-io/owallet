import { TokenFactoryCurrencyRegistrar } from "./currency-registrar";
import { ChainStore } from "../chain";
import { MemoryKVStore } from "@owallet/common";
import { AppCurrency, ChainInfo } from "@owallet/types";
import { runInAction } from "mobx";

// Mock the IQueriesStore interface
class MockQueriesStore {
  simpleQuery: {
    queryGet: jest.Mock;
  };

  constructor() {
    this.simpleQuery = {
      queryGet: jest.fn(),
    };
  }
}

describe("Test TokenFactoryCurrencyRegistrar", () => {
  let chainStore: ChainStore;
  let queriesStore: MockQueriesStore;
  let kvStore: MemoryKVStore;
  let registrar: TokenFactoryCurrencyRegistrar;

  const chainInfos: ChainInfo[] = [
    {
      rpc: "https://rpc.test1.com",
      rest: "https://rest.test1.com",
      chainId: "test-1",
      chainName: "Test Chain 1",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "TEST",
          coinMinimalDenom: "utest",
          coinDecimals: 6,
        },
      ] as AppCurrency[],
      feeCurrencies: [
        {
          coinDenom: "TEST",
          coinMinimalDenom: "utest",
          coinDecimals: 6,
        },
      ] as AppCurrency[],
    },
  ];

  beforeEach(() => {
    chainStore = new ChainStore(chainInfos);
    queriesStore = new MockQueriesStore();
    kvStore = new MemoryKVStore("test");

    // Create registrar with a short cache duration for testing
    registrar = new TokenFactoryCurrencyRegistrar(
      kvStore,
      1000, // 1 second cache duration
      "https://api.test.com",
      "/v1/factory-tokens/{chainId}/{denom}",
      chainStore,
      queriesStore as any
    );
  });

  it("should initialize with isInitialized set to true", async () => {
    // After initialization in constructor, isInitialized should be true
    await registrar.init();
    expect(registrar.isInitialized).toBe(true);
  });

  it("should return undefined for non-factory denoms", () => {
    const result = registrar["currencyRegistrar"]("test-1", "utest");
    expect(result).toBeUndefined();
  });

  it("should return undefined for invalid chain IDs", () => {
    const result = registrar["currencyRegistrar"](
      "invalid-chain",
      "factory/creator/token"
    );
    expect(result).toBeUndefined();
  });

  it("should return cached currency for factory denoms", () => {
    // Manually insert an item into the cache
    const factoryDenom = "factory/creator/token";
    const currency = {
      coinDenom: "TOKEN",
      coinMinimalDenom: factoryDenom,
      coinDecimals: 6,
    };

    runInAction(() => {
      registrar["cache"].set(factoryDenom, {
        currency,
        timestamp: Date.now(),
      });
    });

    const result = registrar["currencyRegistrar"]("test-1", factoryDenom);

    expect(result).toBeDefined();
    expect(result?.value).toEqual({
      ...currency,
      coinMinimalDenom: factoryDenom,
    });
    expect(result?.done).toBe(true);
  });

  it("should handle expired cache items", async () => {
    // Manually insert an expired item into the cache
    const factoryDenom = "factory/creator/token";
    const currency = {
      coinDenom: "TOKEN",
      coinMinimalDenom: factoryDenom,
      coinDecimals: 6,
    };

    runInAction(() => {
      registrar["cache"].set(factoryDenom, {
        currency,
        timestamp: Date.now() - 2000, // Expired (more than 1 second ago)
      });
    });

    // Mock the query response
    queriesStore.simpleQuery.queryGet.mockReturnValue({
      isFetching: false,
      response: {
        data: {
          ...currency,
        },
      },
    });

    const result = registrar["currencyRegistrar"]("test-1", factoryDenom);

    expect(result).toBeDefined();
    expect(result?.value).toEqual({
      ...currency,
      coinMinimalDenom: factoryDenom,
    });
    expect(result?.done).toBe(true);

    // Verify the cache was updated
    expect(registrar["cache"].has(factoryDenom)).toBe(true);

    // Verify the queryGet function was called with the right parameters
    expect(queriesStore.simpleQuery.queryGet).toHaveBeenCalledWith(
      "https://api.test.com",
      `/v1/factory-tokens/test-1/${encodeURIComponent(factoryDenom)}`
    );
  });

  it("should handle in-progress query fetch", () => {
    const factoryDenom = "factory/creator/token";

    // Mock a query that's still fetching
    queriesStore.simpleQuery.queryGet.mockReturnValue({
      isFetching: true,
      response: null,
    });

    const result = registrar["currencyRegistrar"]("test-1", factoryDenom);

    expect(result).toBeDefined();
    expect(result?.value).toBeUndefined();
    expect(result?.done).toBe(false);
  });

  it("should handle completed query with no data", () => {
    const factoryDenom = "factory/creator/token";

    // Mock a completed query with no data
    queriesStore.simpleQuery.queryGet.mockReturnValue({
      isFetching: false,
      response: null,
    });

    const result = registrar["currencyRegistrar"]("test-1", factoryDenom);

    expect(result).toBeDefined();
    expect(result?.value).toBeUndefined();
    expect(result?.done).toBe(true);
  });

  it("should handle query response with mismatched denom", () => {
    const factoryDenom = "factory/creator/token";

    // Mock a query response with a different denom
    queriesStore.simpleQuery.queryGet.mockReturnValue({
      isFetching: false,
      response: {
        data: {
          coinDenom: "OTHER",
          coinMinimalDenom: "factory/creator/other",
          coinDecimals: 6,
        },
      },
    });

    const result = registrar["currencyRegistrar"]("test-1", factoryDenom);

    expect(result).toBeDefined();
    expect(result?.value).toBeUndefined();
    expect(result?.done).toBe(true);
  });
});

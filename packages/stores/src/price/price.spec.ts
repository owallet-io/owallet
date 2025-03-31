import { CoinGeckoPriceStore } from "./price";
import { CoinGeckoTerminalPriceStore } from "./coingecko-terminal";
import { MemoryKVStore } from "@owallet/common";
import { FiatCurrency } from "@owallet/types";
import { CoinPretty, PricePretty } from "@owallet/unit";
import { runInAction } from "mobx";
import { DenomHelper } from "@owallet/common";
import { ChainStore } from "../chain";
import { IPriceStore, PriceStore } from "./index";
import { autorun } from "mobx";
import { Dec, DecUtils, Int } from "@owallet/unit";
import { AppCurrency, ChainInfo } from "@owallet/types";

// Mock CoinGeckoTerminalPriceStore
class MockCoinGeckoTerminalPriceStore {
  getPrice() {
    return undefined;
  }

  getPrice24hChange() {
    return undefined;
  }
}

describe("Test CoinGeckoPriceStore", () => {
  let store: CoinGeckoPriceStore;
  let kvStore: MemoryKVStore;
  const supportedVsCurrencies: Record<string, FiatCurrency> = {
    usd: {
      currency: "usd",
      symbol: "$",
      maxDecimals: 2,
      locale: "en-US",
    },
    eur: {
      currency: "eur",
      symbol: "€",
      maxDecimals: 2,
      locale: "de-DE",
    },
  };

  beforeEach(() => {
    kvStore = new MemoryKVStore("test");

    // Mock the fetch method to avoid actual network requests
    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: {
          get: () => "application/json",
        },
        json: () => {
          return Promise.resolve({
            bitcoin: {
              usd: 50000,
              eur: 45000,
            },
            atom: {
              usd: 15,
              eur: 14,
            },
          });
        },
      });
    });

    store = new CoinGeckoPriceStore(
      kvStore,
      supportedVsCurrencies,
      "usd",
      {
        throttleDuration: 10,
      },
      new MockCoinGeckoTerminalPriceStore() as unknown as CoinGeckoTerminalPriceStore
    );

    // Manually set prices for testing
    runInAction(() => {
      (store as any)._response = {
        data: {
          bitcoin: {
            usd: 50000,
            eur: 45000,
          },
          atom: {
            usd: 15,
            eur: 14,
          },
        },
      };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with default vs currency", () => {
    expect(store.defaultVsCurrency).toBe("usd");
  });

  it("should get supported vs currencies", () => {
    expect(store.supportedVsCurrencies).toEqual(supportedVsCurrencies);
  });

  it("should get fiat currency", () => {
    expect(store.getFiatCurrency("usd")).toEqual(supportedVsCurrencies.usd);
    expect(store.getFiatCurrency("eur")).toEqual(supportedVsCurrencies.eur);
    expect(store.getFiatCurrency("jpy")).toBeUndefined();
  });

  it("should fetch prices when observed", async () => {
    // Mock the fetch implementation
    (global.fetch as jest.Mock).mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: {
          get: () => "application/json",
        },
        json: () => {
          return Promise.resolve({
            bitcoin: {
              usd: 50000,
              eur: 45000,
            },
            atom: {
              usd: 15,
              eur: 14,
            },
          });
        },
      });
    });

    // Make sure store has the prices set
    expect(store.response).toBeDefined();
    expect(store.response?.data).toBeDefined();

    // Check price retrieval
    expect(store.getPrice("bitcoin", "usd")).toBe(50000);
    expect(store.getPrice("bitcoin", "eur")).toBe(45000);
    expect(store.getPrice("atom", "usd")).toBe(15);
    expect(store.getPrice("atom", "eur")).toBe(14);

    // Non-existent coin or currency should return undefined
    expect(store.getPrice("ethereum", "usd")).toBeUndefined();
    expect(store.getPrice("bitcoin", "jpy")).toBeUndefined();
  });

  it("should calculate price for CoinPretty objects", async () => {
    // Create a CoinPretty object for testing
    const bitcoinCoin = new CoinPretty(
      {
        coinDenom: "BTC",
        coinMinimalDenom: "bitcoin",
        coinDecimals: 8,
      },
      "100000000" // 1 BTC
    );

    // Calculate price
    const price = store.calculatePrice(bitcoinCoin);

    // 1 BTC at $50,000 should be $50,000
    expect(price).toBeInstanceOf(PricePretty);
    // Check if price exists and is close to 50000
    expect(price).toBeDefined();
    const priceValue = price?.toDec().toString();
    expect(priceValue).toBe("50000");

    // Calculate with a different vs currency
    const priceEur = store.calculatePrice(bitcoinCoin, "eur");
    expect(priceEur?.toDec().toString()).toBe("45000");
  });

  it("should handle unknown coins", () => {
    // Create a CoinPretty object for an unknown coin
    const ethCoin = new CoinPretty(
      {
        coinDenom: "ETH",
        coinMinimalDenom: "ethereum", // This doesn't match any coin in our mocked prices
        coinDecimals: 18,
      },
      "1000000000000000000" // 1 ETH
    );

    // Calculate price
    const price = store.calculatePrice(ethCoin);
    // For unknown coin we expect undefined
    expect(price?.toDec().toString()).toBe("0");
  });

  it("should handle setDefaultVsCurrency", () => {
    expect(store.defaultVsCurrency).toBe("usd");
    store.setDefaultVsCurrency("eur");
    expect(store.defaultVsCurrency).toBe("eur");
  });
});

describe("Test PriceStore", () => {
  let priceStore: PriceStore;
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
      ],
      stakeCurrency: {
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 6,
      },
      bech32Config: {
        bech32PrefixAccAddr: "test",
        bech32PrefixAccPub: "testpub",
        bech32PrefixValAddr: "testvaloper",
        bech32PrefixValPub: "testvaloperpub",
        bech32PrefixConsAddr: "testvalcons",
        bech32PrefixConsPub: "testvalconspub",
      },
      features: [],
    },
  ];

  let chainStore: ChainStore;
  const fiatCurrency = {
    currency: "usd",
    symbol: "$",
    maxDecimals: 2,
    locale: "en-US",
  };

  // Mock the fetcher
  const mockFetch = jest.fn();
  const fetchPrice = async (coinId: string) => {
    mockFetch(coinId);
    if (coinId === "test-currency") {
      return {
        name: "Test Currency",
        symbol: "TEST",
        market_data: {
          current_price: {
            usd: 50000,
          },
        },
      };
    }
    throw new Error("Unknown currency");
  };

  beforeEach(() => {
    jest.clearAllMocks();
    chainStore = new ChainStore(chainInfos);
    priceStore = new PriceStore(
      {
        chainStore,
        queryStore: {
          cosmos: {
            queryAccount: {
              getQueryBalance: jest.fn(),
            },
          },
        },
      } as any,
      "https://api.cointest.com",
      fetchPrice,
      fiatCurrency
    );
  });

  it("test get price from api", async () => {
    mockFetch.mockClear();
    await priceStore.waitResponse();

    expect(Object.keys(priceStore.supportedVsCurrencies).length).toBe(1);
    expect(priceStore.supportedVsCurrencies).toHaveProperty("usd");

    const priceObject = {
      price: 50000,
      isFetching: false,
    };

    expect(await priceStore.getPrice("test-currency")).toStrictEqual(
      priceObject
    );
    expect(mockFetch).toBeCalledTimes(1);
    expect(await priceStore.getPrice("test-currency")).toStrictEqual(
      priceObject
    );
    // Verify that this doesn't cause a second fetch call
    expect(mockFetch).toBeCalledTimes(1);
  });

  it("test calculating fiat value", async () => {
    mockFetch.mockClear();
    await priceStore.waitResponse();

    runInAction(() => {
      priceStore.setPrice({
        id: "test-currency",
        price: 50000,
      });
    });

    // Mock DenomHelper
    const mockHelper = {
      getCoinGeckoId: () => "test-currency",
      _denom: "utest",
      _type: "native",
      _contractAddress: "",
      denom: "utest",
      type: "native",
      contractAddress: "",
    } as unknown as DenomHelper;

    const amount = new Dec(1);
    const pricePretty = await priceStore.calculatePrice(amount, mockHelper);
    expect(pricePretty).toBeInstanceOf(PricePretty);
    expect(pricePretty?.toDec().toString()).toBe("50000");
  });

  it("test calculating price for CoinPretty", async () => {
    mockFetch.mockClear();
    await priceStore.waitResponse();

    // Set the price data for the test currency
    runInAction(() => {
      priceStore.setPrice({
        id: "test-currency",
        price: 50000,
      });
    });

    const currency = {
      coinDenom: "TEST",
      coinMinimalDenom: "utest",
      coinDecimals: 6,
      coinGeckoId: "test-currency", // Ensure this is set for the test
    };

    // Create a CoinPretty with 1 TEST (or 1000000 utest in minimal denom)
    const coinPretty = new CoinPretty(
      currency,
      new Int("1000000") // 1 TEST in minimal denom (utest)
    );

    // Calculate the price
    const pricePretty = await priceStore.calculatePrice(coinPretty);

    // Now price should be 50000 (1 TEST * $50000)
    expect(pricePretty).toBeInstanceOf(PricePretty);
    expect(pricePretty?.toDec().toString()).toBe("50000");
  });
});

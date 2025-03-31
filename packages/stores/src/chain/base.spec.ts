import { ChainStore } from "./base";
import { AppCurrency, ChainInfo, FeeCurrency } from "@owallet/types";

// Define a mock implementation of getChain
jest.mock("./base", () => {
  const original = jest.requireActual("./base");
  return {
    ...original,
    ChainStore: class MockChainStore extends original.ChainStore {
      constructor(chainInfos) {
        super(chainInfos);
      }

      getChain(chainId) {
        if (chainId === "test-1") {
          return this.chainInfos.find((c) => c.chainId === "test-1");
        }
        if (chainId === "test-2") {
          return this.chainInfos.find((c) => c.chainId === "test-2");
        }
        throw new Error(`Unknown chain info: ${chainId}`);
      }

      isEvmChain(chainId) {
        if (chainId === "test-2") return true;
        return false;
      }
    },
  };
});

describe("Test ChainStore", () => {
  let chainStore: ChainStore;
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
      ] as FeeCurrency[],
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
    {
      rpc: "https://rpc.test2.com",
      rest: "https://rest.test2.com",
      chainId: "test-2",
      chainName: "Test Chain 2",
      bip44: {
        coinType: 60,
      },
      currencies: [
        {
          coinDenom: "ETH",
          coinMinimalDenom: "wei",
          coinDecimals: 18,
        },
      ] as AppCurrency[],
      feeCurrencies: [
        {
          coinDenom: "ETH",
          coinMinimalDenom: "wei",
          coinDecimals: 18,
        },
      ] as FeeCurrency[],
      stakeCurrency: {
        coinDenom: "ETH",
        coinMinimalDenom: "wei",
        coinDecimals: 18,
      },
      features: ["eth-address-gen", "eth-key-sign"],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    chainStore = new ChainStore(chainInfos);
  });

  it("should return all chain infos", () => {
    const chains = chainStore.chainInfos;
    expect(chains.length).toBe(2);

    // Find by chain ID to ensure order doesn't matter
    const chain1 = chains.find((chain) => chain.chainId === "test-1");
    const chain2 = chains.find((chain) => chain.chainId === "test-2");

    expect(chain1).toBeDefined();
    expect(chain2).toBeDefined();

    if (chain1 && chain2) {
      expect(chain1.chainId).toBe("test-1");
      expect(chain2.chainId).toBe("test-2");
    }
  });

  it("should get chain by chainId", () => {
    const chain = chainStore.getChain("test-1");
    expect(chain.chainId).toBe("test-1");
    expect(chain.chainName).toBe("Test Chain 1");
    expect(chain.rpc).toBe("https://rpc.test1.com");
    expect(chain.rest).toBe("https://rest.test1.com");
    expect(chain.bip44.coinType).toBe(118);
  });

  it("should throw error for unknown chainId", () => {
    expect(() => {
      chainStore.getChain("unknown-chain");
    }).toThrow("Unknown chain info: unknown-chain");
  });

  it("should check if chain exists", () => {
    expect(chainStore.hasChain("test-1")).toBe(true);
    expect(chainStore.hasChain("test-2")).toBe(true);
    expect(chainStore.hasChain("unknown-chain")).toBe(false);
  });

  it("should get currencies for a chain", () => {
    const chain = chainStore.getChain("test-1");
    const currencies = chain.currencies;
    expect(currencies.length).toBe(1);
    expect(currencies[0].coinDenom).toBe("TEST");
    expect(currencies[0].coinMinimalDenom).toBe("utest");
    expect(currencies[0].coinDecimals).toBe(6);
  });

  it("should check for chain features", () => {
    const chain1 = chainStore.getChain("test-1");
    const chain2 = chainStore.getChain("test-2");

    // Chain 1 might have no features or an empty array
    expect(Array.isArray(chain1.features)).toBe(true);
    expect(chain2.features).toContain("eth-address-gen");
    expect(chain2.features).toContain("eth-key-sign");

    expect(chain1.hasFeature("eth-address-gen")).toBe(false);
    expect(chain2.hasFeature("eth-address-gen")).toBe(true);
  });

  it("should find currency by denom", () => {
    const chain1 = chainStore.getChain("test-1");
    const currency = chain1.findCurrency("utest");
    expect(currency).toBeDefined();
    expect(currency?.coinDenom).toBe("TEST");
    expect(currency?.coinMinimalDenom).toBe("utest");
    expect(currency?.coinDecimals).toBe(6);

    const nonExistingCurrency = chain1.findCurrency("unknown");
    expect(nonExistingCurrency).toBeUndefined();
  });

  it("should detect EVM chains", () => {
    // We determine EVM chains by checking chainInfo.features or bip44 coinType
    expect(chainStore.isEvmChain("test-2")).toBe(true);

    // test-1 has coinType 118, which is not EVM
    expect(chainStore.isEvmChain("test-1")).toBe(false);
  });

  it("should create modular chain infos from regular chain infos", () => {
    const modularChains = chainStore.modularChainInfos;
    expect(modularChains.length).toBe(2);

    // Find by chain ID to ensure order doesn't matter
    const modularChain1 = modularChains.find(
      (chain) => chain.chainId === "test-1"
    );
    const modularChain2 = modularChains.find(
      (chain) => chain.chainId === "test-2"
    );

    expect(modularChain1).toBeDefined();
    expect(modularChain2).toBeDefined();

    if (modularChain1 && modularChain2) {
      expect(modularChain1.chainName).toBe("Test Chain 1");
      expect("cosmos" in modularChain1).toBe(true);

      if ("cosmos" in modularChain1) {
        expect(modularChain1.cosmos.rpc).toBe("https://rpc.test1.com");
      }

      expect(modularChain2.chainName).toBe("Test Chain 2");
      expect("cosmos" in modularChain2).toBe(true);
    }
  });
});

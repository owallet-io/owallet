import { KeyRingService } from "../service";
import { ChainInfo } from "@owallet/types";

describe("KeyRingService", () => {
  describe("parseBIP44Path", () => {
    it("should parse valid BIP44 path", () => {
      const result = KeyRingService.parseBIP44Path("m/44'/118'/0'/0/0");
      expect(result.coinType).toBe(118);
      expect(result.path).toEqual({
        account: 0,
        change: 0,
        addressIndex: 0,
      });
    });

    it("should throw an error for invalid path", () => {
      expect(() => {
        KeyRingService.parseBIP44Path("invalid-path");
      }).toThrow();
    });

    it("should throw an error for non-BIP44 path", () => {
      expect(() => {
        KeyRingService.parseBIP44Path("m/43'/118'/0'/0/0");
      }).toThrow();
    });
  });

  describe("isEthermintLike", () => {
    it("should return true for Ethermint chains", () => {
      // Test with coinType 60
      const ethermintChain1: ChainInfo = {
        rpc: "https://rpc.test.com",
        rest: "https://rest.test.com",
        chainId: "test-1",
        chainName: "Test Chain",
        bip44: {
          coinType: 60,
        },
        currencies: [],
        feeCurrencies: [],
        features: [],
      };

      // Test with eth-address-gen feature
      const ethermintChain2: ChainInfo = {
        rpc: "https://rpc.test.com",
        rest: "https://rest.test.com",
        chainId: "test-2",
        chainName: "Test Chain 2",
        bip44: {
          coinType: 118,
        },
        currencies: [],
        feeCurrencies: [],
        features: ["eth-address-gen"],
      };

      // Test with eth-key-sign feature
      const ethermintChain3: ChainInfo = {
        rpc: "https://rpc.test.com",
        rest: "https://rest.test.com",
        chainId: "test-3",
        chainName: "Test Chain 3",
        bip44: {
          coinType: 118,
        },
        currencies: [],
        feeCurrencies: [],
        features: ["eth-key-sign"],
      };

      expect(KeyRingService.isEthermintLike(ethermintChain1)).toBe(true);
      expect(KeyRingService.isEthermintLike(ethermintChain2)).toBe(true);
      expect(KeyRingService.isEthermintLike(ethermintChain3)).toBe(true);
    });

    it("should return false for non-Ethermint chains", () => {
      const nonEthermintChain: ChainInfo = {
        rpc: "https://rpc.test.com",
        rest: "https://rest.test.com",
        chainId: "test-4",
        chainName: "Test Chain 4",
        bip44: {
          coinType: 118,
        },
        currencies: [],
        feeCurrencies: [],
        features: ["other-feature"],
      };

      expect(KeyRingService.isEthermintLike(nonEthermintChain)).toBe(false);
    });
  });
});

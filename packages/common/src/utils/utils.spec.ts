import { Bech32Address } from "@owallet/cosmos";
import * as utils from "./utils";
import { BIP44HDPath } from "@owallet/types";
describe("utils", () => {
  it("getChainInfoOrThrow", () => {
    const expected = {
      rpc: "https://injective.rpc.orai.io",
      rest: "https://injective.lcd.orai.io",
      chainId: "injective-1",
      chainName: "Injective",
      networkType: "cosmos",
      stakeCurrency: {
        coinDenom: "INJ",
        coinMinimalDenom: "inj",
        coinDecimals: 18,
        coinGeckoId: "injective-protocol",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png",
        gasPriceStep: {
          low: 5000000000,
          average: 25000000000,
          high: 50000000000,
        },
      },
      bip44: {
        coinType: 60,
      },
      gasPriceStep: {
        low: 5000000000,
        average: 25000000000,
        high: 50000000000,
      },
      coinType: 60,
      bech32Config: Bech32Address.defaultBech32Config("inj"),
      get currencies() {
        return [this.stakeCurrency];
      },
      get feeCurrencies() {
        return [this.stakeCurrency];
      },
      features: ["no-legacy-stdTx", "ibc-transfer", "ibc-go", "eth-key-sign"],
      chainSymbolImageUrl:
        "https://s2.coinmarketcap.com/static/img/coins/64x64/7226.png",
      txExplorer: {
        name: "Injective",
        txUrl: "https://explorer.injective.network/transaction/{txHash}",
      },
      beta: true,
    };
    const rs = utils.getChainInfoOrThrow("injective-1");
    expect(rs).toEqual(expected);
  });
  it("isEthermintLike", () => {
    const chainInfo = utils.getChainInfoOrThrow("injective-1");
    const rs = utils.isEthermintLike(chainInfo);
    expect(rs).toBe(true);
  });
  it.each([
    { cointype: 60, expected: "eth" },
    { cointype: 195, expected: "trx" },
    { cointype: 118, expected: "cosmos" },
  ])("getNetworkTypeByBip44HDPath $cointype", ({ cointype, expected }) => {
    const rs = utils.getNetworkTypeByBip44HDPath({
      coinType: cointype,
    } as BIP44HDPath);
    expect(rs).toBe(expected);
  });
});

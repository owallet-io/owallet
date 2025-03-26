// import { FeeConfig } from "../fee";
// import { Dec } from "@owallet/unit";
// import { ChainGetter } from "@owallet/stores";
// import { QueriesStore } from "../internal";
// import { ISenderConfig, IBaseAmountConfig, IGasConfig } from "../types";

// describe("FeeConfig with exchange rates", () => {
//   // Mock dependencies
//   const mockChainGetter: ChainGetter = {
//     getChain: jest.fn(() => ({
//       chainId: "osmosis-1",
//       chainIdentifier: "osmosis",
//       feeCurrencies: [
//         {
//           coinDenom: "OSMO",
//           coinMinimalDenom: "uosmo",
//           coinDecimals: 6,
//           coinGeckoId: "osmosis",
//           gasPriceStep: {
//             low: 0.01,
//             average: 0.025,
//             high: 0.04,
//           },
//         },
//         {
//           coinDenom: "ION",
//           coinMinimalDenom: "uion",
//           coinDecimals: 6,
//           coinGeckoId: "ion",
//           gasPriceStep: {
//             low: 0.01,
//             average: 0.025,
//             high: 0.04,
//           },
//           exchangeRate: 0.05, // ION is 20x more valuable than OSMO (1/0.05 = 20)
//         },
//         {
//           coinDenom: "USDC",
//           coinMinimalDenom: "ibc/usdc",
//           coinDecimals: 6,
//           coinGeckoId: "usd-coin",
//           gasPriceStep: {
//             low: 0.01,
//             average: 0.025,
//             high: 0.04,
//           },
//           exchangeRate: 20, // USDC is 20x less valuable than OSMO
//         },
//       ],
//       hasFeature: jest.fn(() => false),
//       forceFindCurrency: jest.fn((denom) => {
//         if (denom === "uosmo") {
//           return {
//             coinDenom: "OSMO",
//             coinMinimalDenom: "uosmo",
//             coinDecimals: 6,
//             coinGeckoId: "osmosis",
//           };
//         } else if (denom === "uion") {
//           return {
//             coinDenom: "ION",
//             coinMinimalDenom: "uion",
//             coinDecimals: 6,
//             coinGeckoId: "ion",
//           };
//         } else if (denom === "ibc/usdc") {
//           return {
//             coinDenom: "USDC",
//             coinMinimalDenom: "ibc/usdc",
//             coinDecimals: 6,
//             coinGeckoId: "usd-coin",
//           };
//         }
//         return {
//           coinDenom: "OSMO",
//           coinMinimalDenom: "uosmo",
//           coinDecimals: 6,
//           coinGeckoId: "osmosis",
//         };
//       }),
//       findCurrency: jest.fn((denom) => {
//         if (denom === "uosmo") {
//           return {
//             coinDenom: "OSMO",
//             coinMinimalDenom: "uosmo",
//             coinDecimals: 6,
//             coinGeckoId: "osmosis",
//           };
//         } else if (denom === "uion") {
//           return {
//             coinDenom: "ION",
//             coinMinimalDenom: "uion",
//             coinDecimals: 6,
//             coinGeckoId: "ion",
//           };
//         } else if (denom === "ibc/usdc") {
//           return {
//             coinDenom: "USDC",
//             coinMinimalDenom: "ibc/usdc",
//             coinDecimals: 6,
//             coinGeckoId: "usd-coin",
//           };
//         }
//         return null;
//       }),
//     })) as any,
//     hasChain: jest.fn(() => true),
//   };

//   // Updated mock to include the required simpleQuery property
//   const mockQueriesStore = {
//     get: jest.fn(() => ({
//       cosmos: {
//         queryFeeMarketGasPrices: {
//           gasPrices: [],
//         },
//       },
//       queryBalances: {
//         getQueryBech32Address: jest.fn(() => ({
//           balances: [],
//         })),
//       },
//     })),
//     simpleQuery: jest.fn(),
//   } as unknown as QueriesStore;

//   const mockSenderConfig: ISenderConfig = {
//     chainId: "osmosis-1",
//     setChain: jest.fn(),
//     value: "osmo1...",
//     setValue: jest.fn(),
//     sender: "osmo1...",
//     uiProperties: {},
//   };

//   const mockAmountConfig: IBaseAmountConfig = {
//     chainId: "osmosis-1",
//     setChain: jest.fn(),
//     amount: [],
//     uiProperties: {},
//   };

//   const mockGasConfig: IGasConfig = {
//     chainId: "osmosis-1",
//     setChain: jest.fn(),
//     value: "100000",
//     setValue: jest.fn(),
//     gas: 100000,
//     uiProperties: {},
//   };

//   it("should apply exchange rate when calculating fees for non-default currencies", () => {
//     const feeConfig = new FeeConfig(
//       mockChainGetter,
//       mockQueriesStore,
//       "osmosis-1",
//       mockSenderConfig,
//       mockAmountConfig,
//       mockGasConfig
//     );

//     // Set up the spy to observe the internal implementation
//     const getGasPriceSpy = jest.spyOn(feeConfig, "getGasPriceForFeeCurrency");
//     getGasPriceSpy.mockImplementation(() => {
//       // Mock the gas price - removed unused parameter
//       return new Dec(0.025); // Average gas price for all currencies
//     });

//     // Set up currencies
//     const osmoCurrency = mockChainGetter.getChain("osmosis-1").feeCurrencies[0];
//     const ionCurrency = mockChainGetter.getChain("osmosis-1").feeCurrencies[1];
//     const usdcCurrency = mockChainGetter.getChain("osmosis-1").feeCurrencies[2];

//     // Test with OSMO (no exchange rate)
//     feeConfig.setFee({
//       type: "average",
//       currency: osmoCurrency,
//     });

//     const osmoFee = feeConfig.getFeeTypePrettyForFeeCurrency(
//       osmoCurrency,
//       "average"
//     );
//     const osmoFeeAmount = new Dec(osmoFee.toCoin().amount);

//     // Expected: gas (100000) * gas price (0.025) = 2500
//     expect(osmoFeeAmount.toString()).toBe("2500");

//     // Test with ION (exchange rate 0.05 - 20x more valuable than OSMO)
//     feeConfig.setFee({
//       type: "average",
//       currency: ionCurrency,
//     });

//     const ionFee = feeConfig.getFeeTypePrettyForFeeCurrency(
//       ionCurrency,
//       "average"
//     );
//     const ionFeeAmount = new Dec(ionFee.toCoin().amount);

//     // Expected: gas (100000) * gas price (0.025) * exchange rate (0.05) = 125
//     // This means fewer ION tokens are needed since they're more valuable
//     expect(ionFeeAmount.toString()).toBe("125");

//     // Test with USDC (exchange rate 20 - 20x less valuable than OSMO)
//     feeConfig.setFee({
//       type: "average",
//       currency: usdcCurrency,
//     });

//     const usdcFee = feeConfig.getFeeTypePrettyForFeeCurrency(
//       usdcCurrency,
//       "average"
//     );
//     const usdcFeeAmount = new Dec(usdcFee.toCoin().amount);

//     // Expected: gas (100000) * gas price (0.025) * exchange rate (20) = 50000
//     // This means more USDC tokens are needed since they're less valuable
//     expect(usdcFeeAmount.toString()).toBe("50000");
//   });
// });

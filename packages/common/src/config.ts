import { ChainInfo, Currency } from "@owallet/types";
// Seperate shared config from UI config to prevent code mixup between UI and background process code.
import { FiatCurrency } from "@owallet/types";

export function defaultBech32Config(
  mainPrefix: string,
  validatorPrefix: string = "val",
  consensusPrefix: string = "cons",
  publicPrefix: string = "pub",
  operatorPrefix: string = "oper"
) {
  return {
    bech32PrefixAccAddr: mainPrefix,
    bech32PrefixAccPub: mainPrefix + publicPrefix,
    bech32PrefixValAddr: mainPrefix + validatorPrefix + operatorPrefix,
    bech32PrefixValPub:
      mainPrefix + validatorPrefix + operatorPrefix + publicPrefix,
    bech32PrefixConsAddr: mainPrefix + validatorPrefix + consensusPrefix,
    bech32PrefixConsPub:
      mainPrefix + validatorPrefix + consensusPrefix + publicPrefix,
  };
}
export const MarketAPIEndPoint = "https://price.market.orai.io";
export const CoinGeckoAPIEndPoint =
  process.env["KEPLR_EXT_COINGECKO_ENDPOINT"] ||
  "https://api.coingecko.com/api/v3";
export const unknownToken: Currency = {
  coinDecimals: 6,
  coinImageUrl: "https://img.icons8.com/pulsar-gradient/96/help.png",
  coinGeckoId: "unknown",
  coinMinimalDenom: "unknown",
  coinDenom: "UNKNOWN",
};
export const SkipBaseUrl = "https://go.skip.build";
export const CoinGeckoGetPrice =
  process.env["KEPLR_EXT_COINGECKO_GETPRICE"] || "/simple/price";
export const AutoFetchingFiatValueInterval = 300 * 1000; // 5min

export const AutoFetchingAssetsInterval = 15 * 1000; // 15sec

export const DefaultGasMsgWithdrawRewards = 240000; // Gas per messages.

// Endpoint for Ethereum node.
// This is used for ENS.
export const EthereumEndpoint =
  process.env["KEPLR_EXT_ETHEREUM_ENDPOINT"] || "https://evm-1.keplr.app";

export const TokenContractListURL =
  "https://opbaqquqruxn7fdsgcncrtfrwa0qxnoj.lambda-url.us-west-2.on.aws/";
export const TokenContractListRepoURL =
  "https://github.com/chainapsis/keplr-contract-registry";

export const FiatCurrencies: FiatCurrency[] = [
  {
    currency: "usd",
    symbol: "$",
    maxDecimals: 2,
    locale: "en-US",
  },
  {
    currency: "eur",
    symbol: "€",
    maxDecimals: 2,
    locale: "de-DE",
  },
  {
    currency: "gbp",
    symbol: "£",
    maxDecimals: 2,
    locale: "en-GB",
  },
  {
    currency: "cad",
    symbol: "CA$",
    maxDecimals: 2,
    locale: "en-CA",
  },
  {
    currency: "aud",
    symbol: "AU$",
    maxDecimals: 2,
    locale: "en-AU",
  },
  {
    currency: "rub",
    symbol: "₽",
    maxDecimals: 0,
    locale: "ru",
  },
  {
    currency: "krw",
    symbol: "₩",
    maxDecimals: 0,
    locale: "ko-KR",
  },
  {
    currency: "hkd",
    symbol: "HK$",
    maxDecimals: 1,
    locale: "en-HK",
  },
  {
    currency: "cny",
    symbol: "¥",
    maxDecimals: 1,
    locale: "zh-CN",
  },
  {
    currency: "jpy",
    symbol: "¥",
    maxDecimals: 0,
    locale: "ja-JP",
  },
  {
    currency: "inr",
    symbol: "₹",
    maxDecimals: 1,
    locale: "en-IN",
  },
];

export const AmplitudeApiKey = "";

export const ICNSInfo = {
  chainId: "osmosis-1",
  resolverContractAddress:
    "osmo1xk0s8xgktn9x5vwcgtjdxqzadg88fgn33p8u9cnpdxwemvxscvast52cdd",
};

export interface FiatOnRampServiceInfo {
  serviceId: string;
  serviceName: string;
  buyOrigin: string;
  buySupportCoinDenomsByChainId: Record<string, string[] | undefined>;
  apiKey?: string;
}

export const FiatOnRampServiceInfos: FiatOnRampServiceInfo[] = [
  {
    serviceId: "kado",
    serviceName: "Kado",
    buyOrigin: "https://app.kado.money",
    buySupportCoinDenomsByChainId: {
      "osmosis-1": ["USDC"],
      "juno-1": ["USDC"],
      "phoenix-1": ["USDC"],
      "cosmoshub-4": ["ATOM"],
      "injective-1": ["USDT"],
    },
  },
  {
    serviceId: "moonpay",
    serviceName: "Moonpay",
    buyOrigin: "https://buy.moonpay.com",
    buySupportCoinDenomsByChainId: {
      "cosmoshub-4": ["ATOM"],
      "kava_2222-10": ["KAVA"],
    },
  },
  {
    serviceId: "transak",
    serviceName: "Transak",
    buyOrigin: "https://global.transak.com",
    buySupportCoinDenomsByChainId: {
      "osmosis-1": ["OSMO"],
      "cosmoshub-4": ["ATOM"],
      "secret-4": ["SCRT"],
      "injective-1": ["INJ"],
    },
  },
];

export const SwapVenue: {
  name: string;
  chainId: string;
} = {
  name: "osmosis-poolmanager",
  chainId: "osmosis-1",
};
export const SwapFeeBps = {
  value: 75,
  receiver: "osmo1my4tk420gjmhggqwvvha6ey9390gqwfree2p4u",
};

export const EmbedChainInfos: ChainInfo[] = [
  {
    rpc: "https://orai-rpc.owallet.io",
    rest: "https://orai-rest.owallet.io",
    chainId: "Oraichain",
    chainName: "Oraichain",
    stakeCurrency: {
      coinDenom: "ORAI",
      coinMinimalDenom: "orai",
      coinDecimals: 6,
      coinGeckoId: "oraichain-token",
      coinImageUrl:
        "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/Oraichain/chain.png",
    },
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/Oraichain/chain.png",
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/cosmos-hub"
        : "http://localhost:8080/chains/cosmos-hub",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/cosmos-hub"
        : "http://localhost:8080/chains/cosmos-hub",
    bip44: {
      coinType: 118,
    },
    bech32Config: defaultBech32Config("orai"),
    currencies: [
      {
        coinDenom: "ORAI",
        coinMinimalDenom: "orai",
        coinDecimals: 6,
        coinGeckoId: "oraichain-token",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/Oraichain/chain.png",
      },
      {
        type: "cw20",
        coinDenom: "AIRI",
        coinMinimalDenom:
          "cw20:orai10ldgzued6zjp0mkqwsv2mux3ml50l97c74x8sg:aiRight Token",
        contractAddress: "orai10ldgzued6zjp0mkqwsv2mux3ml50l97c74x8sg",
        coinDecimals: 6,
        coinGeckoId: "airight",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/refs/heads/master/oraichain/images/airi.png",
      },
      {
        coinDenom: "TON",
        coinMinimalDenom:
          "factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/ton",
        coinDecimals: 9,
        coinGeckoId: "the-open-network",
        coinImageUrl:
          "https://assets.coingecko.com/coins/images/17980/standard/ton_symbol.png?1696517498",
      },
      {
        coinDenom: "PEPE",
        coinMinimalDenom:
          "factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/extPEPE",
        coinDecimals: 6,
        coinGeckoId: "pepe",
        coinImageUrl:
          "https://assets.coingecko.com/coins/images/29850/standard/pepe-token.jpeg?1696528776",
      },
      {
        coinDenom: "HMSTR",
        coinMinimalDenom:
          "factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/HMSTR",
        coinDecimals: 9,
        coinGeckoId: "hamster-kombat",
        coinImageUrl:
          "https://assets.coingecko.com/coins/images/39102/standard/hamster-removebg-preview.png?1720514486",
      },
      // {
      //   coinDenom: "CAT",
      //   coinMinimalDenom:
      //     "factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/extCAT",
      //   coinDecimals: 6,
      //   coinGeckoId: "simon-s-cat",
      //   coinImageUrl:
      //     "https://assets.coingecko.com/coins/images/39765/standard/Simon's_Cat_Logo.png?1724017505",
      // },
      {
        type: "cw20",
        coinDenom: "SCORAI",
        coinMinimalDenom:
          "cw20:orai1065qe48g7aemju045aeyprflytemx7kecxkf5m7u5h5mphd0qlcs47pclp:stake-comp-orai",
        contractAddress:
          "orai1065qe48g7aemju045aeyprflytemx7kecxkf5m7u5h5mphd0qlcs47pclp",
        coinDecimals: 6,
        coinGeckoId: "scorai",
        coinImageUrl:
          "https://assets.coingecko.com/coins/images/28897/standard/Orchai_LOGO.png",
      },
      {
        type: "cw20",
        coinDenom: "OCH",
        coinMinimalDenom:
          "cw20:orai1hn8w33cqvysun2aujk5sv33tku4pgcxhhnsxmvnkfvdxagcx0p8qa4l98q:OCH",
        contractAddress:
          "orai1hn8w33cqvysun2aujk5sv33tku4pgcxhhnsxmvnkfvdxagcx0p8qa4l98q",
        coinDecimals: 6,
        coinGeckoId: "och",
        coinImageUrl:
          "https://assets.coingecko.com/coins/images/34236/standard/orchai_logo_white_copy_4x-8_%281%29.png",
      },
      {
        type: "cw20",
        coinDenom: "BTC",
        coinMinimalDenom:
          "cw20:orai10g6frpysmdgw5tdqke47als6f97aqmr8s3cljsvjce4n5enjftcqtamzsd:orai BTC Token",
        contractAddress:
          "orai10g6frpysmdgw5tdqke47als6f97aqmr8s3cljsvjce4n5enjftcqtamzsd",
        coinDecimals: 6,
        coinGeckoId: "bitcoin",
        coinImageUrl:
          "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
      },
      {
        type: "cw20",
        coinDenom: "ORAIX",
        coinMinimalDenom:
          "cw20:orai1lus0f0rhx8s03gdllx2n6vhkmf0536dv57wfge:OraiDex Token",
        contractAddress: "orai1lus0f0rhx8s03gdllx2n6vhkmf0536dv57wfge",
        coinDecimals: 6,
        coinGeckoId: "oraidex",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/refs/heads/master/oraichain/images/oraix.png",
      },
      {
        type: "cw20",
        coinDenom: "USDT",
        coinMinimalDenom:
          "cw20:orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh:Tether",
        contractAddress: "orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh",
        coinDecimals: 6,
        coinGeckoId: "tether",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
      },
      {
        type: "cw20",
        coinDenom: "USDC",
        coinMinimalDenom:
          "cw20:orai15un8msx3n5zf9ahlxmfeqd2kwa5wm0nrpxer304m9nd5q6qq0g6sku5pdd:USDC",
        contractAddress:
          "orai15un8msx3n5zf9ahlxmfeqd2kwa5wm0nrpxer304m9nd5q6qq0g6sku5pdd",
        coinDecimals: 6,
        coinGeckoId: "usd-coin",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
      },
      {
        type: "cw20",
        coinDenom: "wTRX",
        coinMinimalDenom:
          "cw20:orai1c7tpjenafvgjtgm9aqwm7afnke6c56hpdms8jc6md40xs3ugd0es5encn0:wTRX",
        contractAddress:
          "orai1c7tpjenafvgjtgm9aqwm7afnke6c56hpdms8jc6md40xs3ugd0es5encn0",
        coinDecimals: 6,
        coinGeckoId: "tron",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png",
      },
      {
        type: "cw20",
        coinDenom: "INJ",
        coinMinimalDenom:
          "cw20:orai19rtmkk6sn4tppvjmp5d5zj6gfsdykrl5rw2euu5gwur3luheuuusesqn49:INJ",
        contractAddress:
          "orai19rtmkk6sn4tppvjmp5d5zj6gfsdykrl5rw2euu5gwur3luheuuusesqn49",
        coinDecimals: 6,
        coinGeckoId: "injective-protocol",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/7226.png",
      },
      {
        coinDenom: "WETH",
        coinGeckoId: "weth",
        coinMinimalDenom:
          "cw20:orai1dqa52a7hxxuv8ghe7q5v0s36ra0cthea960q2cukznleqhk0wpnshfegez:WETH",
        type: "cw20",
        contractAddress:
          "orai1dqa52a7hxxuv8ghe7q5v0s36ra0cthea960q2cukznleqhk0wpnshfegez",
        coinDecimals: 6,
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "ORAI",
        coinMinimalDenom: "orai",
        coinDecimals: 6,
        coinGeckoId: "oraichain-token",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/Oraichain/chain.png",
      },
    ],
    features: ["ibc-transfer", "ibc-go"],
    txExplorer: {
      name: "Oraiscan",
      txUrl: "https://scan.orai.io/txs/{txHash}",
      accountUrl: "https://scan.orai.io/account/{address}",
    },
  },
  {
    rpc: "https://swr.xnftdata.com/rpc-proxy/",
    rest: "https://swr.xnftdata.com/rpc-proxy/",
    chainId: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
    chainName: "Solana",
    bip44: {
      coinType: 501,
    },
    stakeCurrency: {
      coinDenom: "SOL",
      coinMinimalDenom: "sol",
      coinDecimals: 9,
      coinGeckoId: "solana",
      coinImageUrl:
        "https://assets.coingecko.com/coins/images/4128/standard/solana.png?1718769756",
    },
    chainSymbolImageUrl:
      "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
    currencies: [
      {
        coinDenom: "SOL",
        coinMinimalDenom: "sol",
        coinDecimals: 9,
        coinGeckoId: "solana",
        coinImageUrl:
          "https://assets.coingecko.com/coins/images/4128/standard/solana.png?1718769756",
      },
    ],
    get feeCurrencies() {
      return [
        {
          coinDenom: "SOL",
          coinMinimalDenom: "sol",
          coinDecimals: 9,
          coinGeckoId: "solana",
          coinImageUrl:
            "https://assets.coingecko.com/coins/images/4128/standard/solana.png?1718769756",
          gasPriceStep: {
            low: 1,
            average: 1.25,
            high: 1.5,
          },
        },
      ];
    },
    features: ["gen-address", "svm", "not-support-staking"],
    txExplorer: {
      name: "Sol Scan",
      txUrl: "https://solscan.io/tx/{txHash}",
      accountUrl: "https://solscan.io/address/{address}",
    },
  },
  {
    rpc: "https://api.trongrid.io",
    rest: "https://apilist.tronscanapi.com",
    chainId: "eip155:728126428",
    chainName: "Tron",
    evm: {
      rpc: "https://api.trongrid.io/jsonrpc",
      chainId: 728126428,
    },
    chainSymbolImageUrl:
      "https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png",
    stakeCurrency: {
      coinDenom: "TRX",
      coinMinimalDenom: "trx",
      coinDecimals: 6,
      coinGeckoId: "tron",
      coinImageUrl:
        "https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png",
    },
    currencies: [
      {
        coinDenom: "TRX",
        coinMinimalDenom: "trx",
        coinDecimals: 6,
        coinGeckoId: "tron",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png",
      },
      {
        contractAddress: "TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8",
        coinDenom: "USDC",
        coinMinimalDenom: "erc20:0x3487b63D30B5B2C87fb7fFa8bcfADE38EAaC1abe",
        coinGeckoId: "usd-coin",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
        coinDecimals: 6,
      },
      {
        contractAddress: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
        coinMinimalDenom: "erc20:0xa614f803B6FD780986A42c78Ec9c7f77e6DeD13C",
        coinDenom: "USDT",
        coinDecimals: 6,
        coinGeckoId: "tether",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
      },
      {
        contractAddress: "TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR",
        coinMinimalDenom: "erc20:0x891cdb91d149f23B1a45D9c5Ca78a88d0cB44C18",
        coinDenom: "WTRX",
        coinDecimals: 6,
        coinGeckoId: "wrapped-tron",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png",
      },
    ],
    bip44: {
      coinType: 195,
    },
    get feeCurrencies() {
      return [this.stakeCurrency];
    },
    features: ["base58-address", "not-support-staking", "tron"],
    txExplorer: {
      name: "Tronscan",
      txUrl: "https://tronscan.org/#/transaction/{txHash}",
      accountUrl: "https://tronscan.org/#/address/{address}",
    },
  },

  {
    rpc: "https://evm-1.keplr.app",
    rest: "https://evm-1.keplr.app",
    evm: {
      chainId: 1,
      rpc: "https://evm-1.keplr.app",
      websocket: "wss://evm-1.keplr.app/websocket",
    },
    chainId: "eip155:1",
    chainName: "Ethereum",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:1/chain.png",
    bip44: {
      coinType: 60,
    },
    currencies: [
      {
        type: "erc20",
        coinDenom: "OCH",
        coinMinimalDenom: "erc20:0x19373EcBB4B8cC2253D70F2a246fa299303227Ba",
        contractAddress: "0x19373EcBB4B8cC2253D70F2a246fa299303227Ba",
        coinDecimals: 18,
        coinGeckoId: "och",
        coinImageUrl:
          "https://assets.coingecko.com/coins/images/34236/standard/orchai_logo_white_copy_4x-8_%281%29.png",
      },
      {
        type: "erc20",
        coinDenom: "ORAI",
        coinMinimalDenom: "erc20:0x4c11249814f11b9346808179cf06e71ac328c1b5",
        contractAddress: "0x4c11249814f11b9346808179cf06e71ac328c1b5",
        coinDecimals: 18,
        coinGeckoId: "oraichain-token",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/oraichain/images/orai-token.png",
      },
      {
        type: "erc20",
        coinDenom: "ORAIX",
        coinMinimalDenom: "erc20:0x2d869aE129e308F94Cc47E66eaefb448CEe0d03e",
        contractAddress: "0x2d869aE129e308F94Cc47E66eaefb448CEe0d03e",
        coinDecimals: 18,
        coinGeckoId: "oraidex",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/refs/heads/master/oraichain/images/oraix.png",
      },
      {
        coinDenom: "ETH",
        coinMinimalDenom: "ethereum-native",
        coinDecimals: 18,
        coinGeckoId: "ethereum",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:1/chain.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "ETH",
        coinMinimalDenom: "ethereum-native",
        coinDecimals: 18,
        coinGeckoId: "ethereum",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:1/chain.png",
      },
    ],
    features: ["not-support-staking"],
  },
  {
    rpc: "https://evm-56.keplr.app",
    rest: "https://evm-56.keplr.app",
    evm: {
      chainId: 56,
      rpc: "https://evm-56.keplr.app",
      websocket: "wss://evm-56.keplr.app/websocket",
    },
    chainId: "eip155:56",
    chainName: "BNB Chain",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:56/chain.png",
    bip44: {
      coinType: 60,
    },
    currencies: [
      {
        coinDenom: "BNB",
        coinMinimalDenom: "binance-native",
        coinDecimals: 18,
        coinGeckoId: "binancecoin",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:56/chain.png",
      },
      {
        type: "erc20",
        coinDenom: "ORAI",
        coinMinimalDenom: "erc20:0xA325Ad6D9c92B55A3Fc5aD7e412B1518F96441C0",
        coinDecimals: 18,
        coinGeckoId: "oraichain-token",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/oraichain/images/orai-token.png",
      },
      {
        type: "erc20",
        coinDenom: "AIRI",
        coinMinimalDenom: "erc20:0x7e2a35c746f2f7c240b664f1da4dd100141ae71f",
        coinDecimals: 18,
        coinGeckoId: "airight",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/refs/heads/master/oraichain/images/airi.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "BNB",
        coinMinimalDenom: "binance-native",
        coinDecimals: 18,
        coinGeckoId: "binancecoin",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:56/chain.png",
      },
    ],
    features: ["not-support-staking"],
  },
  {
    rpc: "https://cosmos-rpc.owallet.io",
    rest: "https://cosmos-rest.owallet.io",
    chainId: "cosmoshub-4",
    chainName: "Cosmos Hub",
    stakeCurrency: {
      coinDenom: "ATOM",
      coinMinimalDenom: "uatom",
      coinDecimals: 6,
      coinGeckoId: "cosmos",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/cosmos-hub"
        : "http://localhost:8080/chains/cosmos-hub",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/cosmos-hub"
        : "http://localhost:8080/chains/cosmos-hub",
    bip44: {
      coinType: 118,
    },
    bech32Config: defaultBech32Config("cosmos"),
    currencies: [
      {
        coinDenom: "ATOM",
        coinMinimalDenom: "uatom",
        coinDecimals: 6,
        coinGeckoId: "cosmos",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "ATOM",
        coinMinimalDenom: "uatom",
        coinDecimals: 6,
        coinGeckoId: "cosmos",
      },
    ],
    features: ["ibc-transfer", "ibc-go"],
  },
  {
    rpc: "https://osmosis-rpc.owallet.io",
    rest: "https://osmosis-rest.owallet.io",
    chainId: "osmosis-1",
    chainName: "Osmosis",
    stakeCurrency: {
      coinDenom: "OSMO",
      coinMinimalDenom: "uosmo",
      coinDecimals: 6,
      coinGeckoId: "osmosis",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://app.osmosis.zone"
        : "https://app.osmosis.zone",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/osmosis"
        : "http://localhost:8080/chains/osmosis",
    bip44: { coinType: 118 },
    bech32Config: defaultBech32Config("osmo"),
    currencies: [
      {
        coinDenom: "OSMO",
        coinMinimalDenom: "uosmo",
        coinDecimals: 6,
        coinGeckoId: "osmosis",
      },
      {
        coinDenom: "ION",
        coinMinimalDenom: "uion",
        coinDecimals: 6,
        coinGeckoId: "ion",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "OSMO",
        coinMinimalDenom: "uosmo",
        coinDecimals: 6,
        coinGeckoId: "osmosis",
        gasPriceStep: {
          low: 0,
          average: 0.025,
          high: 0.04,
        },
      },
    ],
    features: [
      "ibc-transfer",
      "ibc-go",
      "cosmwasm",
      "wasmd_0.24+",
      "osmosis-txfees",
    ],
  },
  // {
  //   rpc: "https://sapphire.oasis.io",
  //   rest: "https://sapphire.oasis.io",
  //   grpc: "https://grpc.oasis.dev",
  //   chainId: "oasis-1",
  //   chainName: "Oasis Mainnet",
  //   chainSymbolImageUrl:
  //     "https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png",
  //   stakeCurrency: {
  //     coinDenom: "ROSE",
  //     coinMinimalDenom: "rose",
  //     coinDecimals: 9,
  //     coinGeckoId: "oasis-network",
  //     coinImageUrl:
  //       "https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png",
  //   },
  //   currencies: [
  //     {
  //       coinDenom: "ROSE",
  //       coinMinimalDenom: "rose",
  //       coinDecimals: 9,
  //       coinGeckoId: "oasis-network",
  //       coinImageUrl:
  //         "https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png",
  //     },
  //   ],
  //   bip44: {
  //     coinType: 474,
  //   },
  //   bech32Config: defaultBech32Config("oasis"),
  //   feeCurrencies: [
  //     {
  //       coinDenom: "ROSE",
  //       coinMinimalDenom: "rose",
  //       coinDecimals: 9,
  //       coinGeckoId: "oasis-network",
  //       coinImageUrl:
  //         "https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png",
  //       gasPriceStep: {
  //         high: 0,
  //         low: 0,
  //         average: 0,
  //       },
  //     },
  //   ],
  //   features: ["oasis", "gen-address", "not-support-staking"],
  //   txExplorer: {
  //     name: "Oasis scan",
  //     txUrl: "https://www.oasisscan.com/transactions/{txHash}",
  //     accountUrl: "https://www.oasisscan.com/accounts/detail/{address}",
  //   },
  // },
  // {
  //   chainId: "oraibtc-mainnet-1",
  //   chainName: "OraiBTC Bridge",
  //   rpc: "https://btc.rpc.orai.io",
  //   rest: "https://btc.lcd.orai.io",
  //   chainSymbolImageUrl:
  //     "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/Oraichain/chain.png",
  //   stakeCurrency: {
  //     coinDenom: "ORAIBTC",
  //     coinMinimalDenom: "uoraibtc",
  //     coinDecimals: 6,
  //     coinImageUrl:
  //       "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  //   },
  //   bip44: {
  //     coinType: 118,
  //   },
  //   bech32Config: defaultBech32Config("oraibtc"),
  //   // List of all coin/tokens used in this chain.
  //   get currencies() {
  //     return [this.stakeCurrency];
  //   },
  //   get feeCurrencies() {
  //     return [
  //       {
  //         ...this.stakeCurrency,
  //         gasPriceStep: {
  //           low: 0,
  //           average: 0,
  //           high: 0,
  //         },
  //       },
  //     ];
  //   },
  //   features: ["stargate", "ibc-transfer", "cosmwasm"],
  //   txExplorer: {
  //     name: "Scanium",
  //     txUrl: "https://scanium.io/OraiBtcMainnet/tx/{txHash}",
  //   },
  // },
  // {
  //   rpc: "https://blockstream.info/api",
  //   rest: "https://blockstream.info/api",
  //   chainId: "bitcoin",
  //   chainName: "Bitcoin",
  //   chainSymbolImageUrl:
  //     "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  //   bip44: {
  //     coinType: 0,
  //   },
  //   bip84: {
  //     coinType: 0,
  //   },
  //   stakeCurrency: {
  //     coinDenom: "BTC",
  //     coinMinimalDenom: "btc",
  //     coinDecimals: 8,
  //     coinGeckoId: "bitcoin",
  //     coinImageUrl:
  //       "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  //   },
  //   bech32Config: defaultBech32Config("bc"),
  //   currencies: [
  //     {
  //       type: "legacy",
  //       coinDenom: "BTC",
  //       coinMinimalDenom: "legacy:btc",
  //       coinDecimals: 8,
  //       coinGeckoId: "bitcoin",
  //       coinImageUrl:
  //         "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  //     },
  //     {
  //       type: "segwit",
  //       coinDenom: "BTC",
  //       coinMinimalDenom: "segwit:btc",
  //       coinDecimals: 8,
  //       coinGeckoId: "bitcoin",
  //       coinImageUrl:
  //         "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  //     },
  //   ],
  //   get feeCurrencies() {
  //     return [
  //       {
  //         coinDenom: "BTC",
  //         coinMinimalDenom: "segwit:btc",
  //         coinDecimals: 8,
  //         coinGeckoId: "bitcoin",
  //         coinImageUrl:
  //           "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  //         gasPriceStep: {
  //           low: 144,
  //           average: 18,
  //           high: 1,
  //         },
  //       },
  //       {
  //         type: "legacy",
  //         coinDenom: "BTC",
  //         coinMinimalDenom: "legacy:btc",
  //         coinDecimals: 8,
  //         coinGeckoId: "bitcoin",
  //         coinImageUrl:
  //           "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  //         gasPriceStep: {
  //           low: 144,
  //           average: 18,
  //           high: 1,
  //         },
  //       },
  //     ];
  //   },
  //
  //   features: ["gen-address", "btc", "not-support-staking"],
  //   txExplorer: {
  //     name: "BlockStream",
  //     txUrl: "https://blockstream.info/tx/{txHash}",
  //     accountUrl: "https://blockstream.info/address/{address}",
  //   },
  // },
  {
    chainId: "oraibridge-subnet-2",
    chainName: "OraiBridge",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/Oraichain/chain.png",
    rpc: "https://bridge-v2.rpc.orai.io",
    rest: "https://bridge-v2.lcd.orai.io",
    stakeCurrency: {
      coinDenom: "ORAIB",
      coinMinimalDenom: "uoraib",
      coinDecimals: 6,
      coinImageUrl:
        "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/Oraichain/chain.png",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: defaultBech32Config("oraib"),
    // List of all coin/tokens used in this chain.
    get currencies() {
      return [
        this.stakeCurrency,
        {
          coinDenom: "BEP20 ORAI",
          coinMinimalDenom: "oraib0xA325Ad6D9c92B55A3Fc5aD7e412B1518F96441C0",
          coinDecimals: 18,
          coinGeckoId: "oraichain-token",
          coinImageUrl:
            "https://raw.githubusercontent.com/cosmos/chain-registry/master/oraichain/images/orai-token.png",
        },
        {
          coinDenom: "BEP20 AIRI",
          coinMinimalDenom: "oraib0x7e2A35C746F2f7C240B664F1Da4DD100141AE71F",
          coinDecimals: 18,
          coinGeckoId: "airight",
          coinImageUrl:
            "https://raw.githubusercontent.com/cosmos/chain-registry/refs/heads/master/oraichain/images/airi.png",
        },
        {
          coinDenom: "BEP20 USDT",
          coinMinimalDenom: "oraib0x55d398326f99059fF775485246999027B3197955",
          coinDecimals: 18,
          coinGeckoId: "tether",
          coinImageUrl:
            "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
        },
      ];
    },
    get feeCurrencies() {
      return [
        {
          ...this.stakeCurrency,
          gasPriceStep: {
            low: 0,
            average: 0,
            high: 0,
          },
        },
      ];
    },
    features: ["stargate", "ibc-transfer", "cosmwasm"],
    txExplorer: {
      name: "Orai Bridge Scan",
      txUrl: "https://scan.bridge.orai.io/txs/{txHash}",
      accountUrl: "https://scan.bridge.orai.io/account/{address}",
    },
  },
  // {
  //   rpc: "https://sapphire.oasis.io",
  //   rest: "https://sapphire.oasis.io",
  //   chainId: "eip155:23294",
  //   evm: {
  //     websocket: "wss://sapphire.oasis.io/ws",
  //     rpc: "https://sapphire.oasis.io",
  //     chainId: 23294,
  //   },
  //   chainSymbolImageUrl:
  //     "https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png",
  //   chainName: "Oasis Sapphire",
  //   bip44: {
  //     coinType: 60,
  //   },
  //   stakeCurrency: {
  //     coinDenom: "ROSE",
  //     coinMinimalDenom: "rose",
  //     coinDecimals: 18,
  //     coinGeckoId: "oasis-network",
  //     coinImageUrl:
  //       "https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png",
  //   },
  //   currencies: [
  //     {
  //       coinDenom: "ROSE",
  //       coinMinimalDenom: "rose",
  //       coinDecimals: 18,
  //       coinGeckoId: "oasis-network",
  //       coinImageUrl:
  //         "https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png",
  //     },
  //   ],
  //   get feeCurrencies() {
  //     return [this.stakeCurrency];
  //   },
  //
  //   features: ["not-support-staking", "oasis-address"],
  //   txExplorer: {
  //     name: "Oasis Saphire Scan",
  //     txUrl: "https://explorer.oasis.io/mainnet/sapphire/tx/{txHash}",
  //     accountUrl:
  //       "https://explorer.oasis.io/mainnet/sapphire/address/{address}",
  //   },
  // },
  // {
  //   rpc: "https://emerald.oasis.dev",
  //   rest: "https://emerald.oasis.dev",
  //   chainId: "eip155:42262",
  //   chainSymbolImageUrl:
  //     "https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png",
  //   chainName: "Oasis Emerald",
  //   evm: {
  //     websocket: "wss://emerald.oasis.io/ws",
  //     rpc: "https://emerald.oasis.dev",
  //     chainId: 42262,
  //   },
  //   bip44: {
  //     coinType: 60,
  //   },
  //   stakeCurrency: {
  //     coinDenom: "ROSE",
  //     coinMinimalDenom: "rose",
  //     coinDecimals: 18,
  //     coinGeckoId: "oasis-network",
  //     coinImageUrl:
  //       "https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png",
  //   },
  //   currencies: [
  //     {
  //       coinDenom: "ROSE",
  //       coinMinimalDenom: "rose",
  //       coinDecimals: 18,
  //       coinGeckoId: "oasis-network",
  //       coinImageUrl:
  //         "https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png",
  //     },
  //   ],
  //   get feeCurrencies() {
  //     return [this.stakeCurrency];
  //   },
  //
  //   features: ["not-support-staking", "oasis-address"],
  //   txExplorer: {
  //     name: "Oasis Emerald Scan",
  //     txUrl: "https://explorer.oasis.io/mainnet/emerald/tx/{txHash}",
  //     accountUrl: "https://explorer.oasis.io/mainnet/emerald/address/{address}",
  //   },
  // },
  // {
  //   rpc: "https://rpc-stargaze.keplr.app",
  //   rest: "https://lcd-stargaze.keplr.app",
  //   chainId: "stargaze-1",
  //   chainName: "Stargaze",
  //   stakeCurrency: {
  //     coinDenom: "STARS",
  //     coinMinimalDenom: "ustars",
  //     coinDecimals: 6,
  //     coinGeckoId: "stargaze",
  //   },
  //   walletUrl:
  //     process.env.NODE_ENV === "production"
  //       ? "https://wallet.keplr.app/chains/stargaze"
  //       : "http://localhost:8080/chains/stargaze",
  //   walletUrlForStaking:
  //     process.env.NODE_ENV === "production"
  //       ? "https://wallet.keplr.app/chains/stargaze"
  //       : "http://localhost:8080/chains/stargaze",
  //   bip44: {
  //     coinType: 118,
  //   },
  //   bech32Config: defaultBech32Config("stars"),
  //   currencies: [
  //     {
  //       coinDenom: "STARS",
  //       coinMinimalDenom: "ustars",
  //       coinDecimals: 6,
  //       coinGeckoId: "stargaze",
  //     },
  //   ],
  //   feeCurrencies: [
  //     {
  //       coinDenom: "STARS",
  //       coinMinimalDenom: "ustars",
  //       coinDecimals: 6,
  //       coinGeckoId: "stargaze",
  //     },
  //   ],
  //   features: ["ibc-transfer", "ibc-go"],
  // },
  {
    rpc: "https://rpc-injective.keplr.app",
    rest: "https://lcd-injective.keplr.app",
    chainId: "injective-1",
    chainName: "Injective",
    stakeCurrency: {
      coinDenom: "INJ",
      coinMinimalDenom: "inj",
      coinDecimals: 18,
      coinGeckoId: "injective-protocol",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/injective"
        : "http://localhost:8080/chains/injective",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/injective"
        : "http://localhost:8080/chains/injective",
    bip44: {
      coinType: 60,
    },
    bech32Config: defaultBech32Config("inj"),
    currencies: [
      {
        coinDenom: "INJ",
        coinMinimalDenom: "inj",
        coinDecimals: 18,
        coinGeckoId: "injective-protocol",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "INJ",
        coinMinimalDenom: "inj",
        coinDecimals: 18,
        coinGeckoId: "injective-protocol",
        gasPriceStep: {
          low: 5000000000,
          average: 25000000000,
          high: 50000000000,
        },
      },
    ],
    features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
  },
  {
    rpc: "https://noble-rpc.owallet.io",
    rest: "https://noble-rest.owallet.io",
    chainId: "noble-1",
    chainName: "Noble",
    stakeCurrency: {
      coinDenom: "STAKE",
      coinMinimalDenom: "ustake",
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "noble",
      bech32PrefixAccPub: "noblepub",
      bech32PrefixValAddr: "noblevaloper",
      bech32PrefixValPub: "noblevaloperpub",
      bech32PrefixConsAddr: "noblevalcons",
      bech32PrefixConsPub: "noblevalconspub",
    },
    currencies: [
      {
        coinDenom: "STAKE",
        coinMinimalDenom: "ustake",
        coinDecimals: 6,
      },
      {
        coinDenom: "USDC",
        coinMinimalDenom: "uusdc",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "USDC",
        coinMinimalDenom: "uusdc",
        coinDecimals: 6,
      },
      {
        coinDenom: "ATOM",
        coinMinimalDenom:
          "ibc/EF48E6B1A1A19F47ECAEA62F5670C37C0580E86A9E88498B7E393EB6F49F33C0",
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.001,
          average: 0.001,
          high: 0.001,
        },
      },
    ],
    features: [],
  },
  {
    chainId: "Neutaro-1",
    chainName: "Neutaro",
    rpc: "https://neutaro.rpc.orai.io",
    rest: "https://neutaro.lcd.orai.io",
    bip44: {
      coinType: 118,
    },
    bech32Config: defaultBech32Config("neutaro"),
    currencies: [
      {
        coinDenom: "NTMPI",
        coinMinimalDenom: "uneutaro",
        coinDecimals: 6,
        coinGeckoId: "neutaro",
        coinImageUrl: "https://asset.brandfetch.io/idKrUw6EdO/ids9m0Bt_7.png",
      },
    ],
    get feeCurrencies() {
      return [
        {
          ...this.stakeCurrency,
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.03,
          },
        },
      ];
    },
    stakeCurrency: {
      coinDenom: "NTMPI",
      coinMinimalDenom: "uneutaro",
      coinGeckoId: "neutaro",
      coinImageUrl: "https://asset.brandfetch.io/idKrUw6EdO/ids9m0Bt_7.png",
      coinDecimals: 6,
    },
    features: ["stargate", "ibc-transfer", "cosmwasm"],
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/Neutaro/chain.png",
    txExplorer: {
      name: "Neutaro",
      txUrl: "https://explorer.neutaro.io/Neutaro/tx/{txHash}",
      //TODO: Not found account explorer for neutaro
      accountUrl: "https://nms1.neutaro.tech/account/{address}",
    },
  },
  // {
  //   rpc: "https://rpc-dydx.keplr.app",
  //   rest: "https://lcd-dydx.keplr.app",
  //   chainId: "dydx-mainnet-1",
  //   chainName: "dYdX",
  //   stakeCurrency: {
  //     coinDenom: "DYDX",
  //     coinDecimals: 18,
  //     coinMinimalDenom: "adydx",
  //   },
  //   bip44: {
  //     coinType: 118,
  //   },
  //   bech32Config: {
  //     bech32PrefixAccAddr: "dydx",
  //     bech32PrefixAccPub: "dydxpub",
  //     bech32PrefixValAddr: "dydxvaloper",
  //     bech32PrefixValPub: "dydxvaloperpub",
  //     bech32PrefixConsAddr: "dydxvalcons",
  //     bech32PrefixConsPub: "dydxvalconspub",
  //   },
  //   currencies: [
  //     {
  //       coinDenom: "DYDX",
  //       coinDecimals: 18,
  //       coinMinimalDenom: "adydx",
  //     },
  //   ],
  //   feeCurrencies: [
  //     {
  //       coinDenom: "DYDX",
  //       coinDecimals: 18,
  //       coinMinimalDenom: "adydx",
  //     },
  //   ],
  //   features: [],
  // },
];

export const ChainIdentifierToTxExplorerMap: Record<
  string,
  { name: string; txUrl: string } | undefined
> = {
  cosmoshub: {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/cosmos/tx/{txHash}",
  },
  Oraichain: {
    name: "Oraiscan",
    txUrl: "https://scan.orai.io/txs/{txHash}",
  },
  Neutaro: {
    name: "Neutaro",
    txUrl: "https://nms1.neutaro.tech/Neutaro/tx/{txHash}",
  },

  osmosis: {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/osmosis/tx/{txHash}",
  },
  secret: {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/secret/tx/{txHash}",
  },
  akashnet: {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/akash/tx/{txHash}",
  },
  mars: {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/mars-protocol/txs/{txHash}",
  },
  "crypto-org-chain-mainnet": {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/crypto-org/tx/{txHash}",
  },
  "shentu-2.2": {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/shentu/tx/{txHash}",
  },
  irishub: {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/iris/tx/{txHash}",
  },
  regen: {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/regen/tx/{txHash}",
  },
  core: {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/persistence/tx/{txHash}",
  },
  sentinelhub: {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/sentinel/tx/{txHash}",
  },
  juno: {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/juno/tx/{txHash}",
  },
  stargaze: {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/stargaze/tx/{txHash}",
  },
  "axelar-dojo": {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/axelar/tx/{txHash}",
  },
  sommelier: {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/sommelier/tx/{txHash}",
  },
  umee: {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/umee/tx/{txHash}",
  },
  "gravity-bridge": {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/gravity-bridge/tx/{txHash}",
  },
  "tgrade-mainnet": {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/tgrade/tx/{txHash}",
  },
  stride: {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/stride/tx/{txHash}",
  },
  evmos_9001: {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/evmos/tx/{txHash}",
  },
  injective: {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/injective/tx/{txHash}",
  },
  kava_2222: {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/kava/tx/{txHash}",
  },
  quicksilver: {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/quicksilver/tx/{txHash}",
  },
  phoenix: {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/terra/tx/{txHash}",
  },
  quasar: {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/quasar/tx/{txHash}",
  },
  noble: {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/noble/tx/{txHash}",
  },
  omniflixhub: {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/omniflix/tx/{txHash}",
  },
  kyve: {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/kyve/tx/{txHash}",
  },
  neutron: {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/neutron/tx/{txHash}",
  },
  "likecoin-mainnet": {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/likecoin/tx/{txHash}",
  },
  passage: {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/passage/tx/{txHash}",
  },
  dymension_1100: {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/dymension/tx/{txHash}",
  },
  chihuahua: {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/chihuahua/tx/{txHash}",
  },
  dimension_37: {
    name: "Mintscan",
    txUrl: "https://www.mintscan.io/xpla/tx/{txHash}",
  },
};

// The origins that are able to pass any permission that external webpages can have.
export const PrivilegedOrigins: string[] = [
  "https://app.oraidex.io",
  "https://futures.oraidex.io",
  "https://orderbook.oraidex.io",
  "https://hub.orai.io",
  "https://scan.orai.io",
  "https://multisig.orai.io",
  "https://develop-v3.beta-oraidex.pages.dev",
];

export const CommunityChainInfoRepo = {
  organizationName: "owallet-io",
  repoName: "keplr-chain-registry",
  branchName: "main",
  alternativeURL: undefined,
};

export const APR_API_URL =
  "https://pjld2aanw3elvteui4gwyxgx4m0ceweg.lambda-url.us-west-2.on.aws";

export const SCAMPORPOSAL_API_URL =
  "https://phishing-block-list-chainapsis.vercel.app";

export const APP_STORE_URL = "https://itunes.apple.com";
export const PLAY_STORE_URL = "https://play.google.com";

export const GovernanceV1ChainIdentifiers = [
  "kyve",
  "mars",
  "juno",
  "kava_2222",
  "evmos_9001",
  "injective",
  "quicksilver",
  "gitopia",
  "core",
  "celestia",
  "dydx-mainnet",
  "likecoin-mainnet",
  "osmosis",
];

export const NoDashboardLinkIdentifiers = ["tgrade-mainnet", "emoney"];
export const DASHBOARD_URL = "https://wallet.keplr.app";

import { Bech32Address } from "@owallet/cosmos";
import { AppChainInfo, Currency } from "@owallet/types";
import { IntlMessages, TypeLanguageToFiatCurrency } from "./languages";
import { FiatCurrency } from "@owallet/types";

export const AutoFetchingFiatValueInterval = 300 * 1000; // 5min

export const AutoFetchingAssetsInterval = 15 * 1000; // 15sec
export const AprByChain =
  "https://pjld2aanw3elvteui4gwyxgx4m0ceweg.lambda-url.us-west-2.on.aws";
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

export const LanguageToFiatCurrency: TypeLanguageToFiatCurrency = {
  default: "usd",
  ko: "krw",
  vi: "vnd",
};

export const AdditonalIntlMessages: IntlMessages = {};

// coingecko api for both evm and cosmos based networks
export const CoinGeckoAPIEndPoint = "https://api.coingecko.com/api/v3";
export const MarketAPIEndPoint = "https://price.market.orai.io";

export const EthereumEndpoint = "https://rpc.ankr.com/eth";
export const KeplrCoingecko = "https://satellite.keplr.app";
export const CoinGeckoGetPrice = "/price/simple";

// default networks
export const EmbedChainInfos: AppChainInfo[] = [
  {
    rpc: "https://rpc.orai.io",
    rest: "https://lcd.orai.io",
    chainId: "Oraichain",
    chainName: "Oraichain",
    networkType: "cosmos",
    stakeCurrency: {
      coinDenom: "ORAI",
      coinMinimalDenom: "orai",
      coinDecimals: 6,
      coinGeckoId: "oraichain-token",
      coinImageUrl:
        "https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png",
      gasPriceStep: {
        low: 0.003,
        average: 0.005,
        high: 0.007,
      },
    },
    bip44: {
      coinType: 118,
    },
    coinType: 118,
    bech32Config: Bech32Address.defaultBech32Config("orai"),
    get currencies() {
      return [
        this.stakeCurrency,
        {
          type: "cw20",
          coinDenom: "AIRI",
          coinMinimalDenom:
            "cw20:orai10ldgzued6zjp0mkqwsv2mux3ml50l97c74x8sg:aiRight Token",
          contractAddress: "orai10ldgzued6zjp0mkqwsv2mux3ml50l97c74x8sg",
          coinDecimals: 6,
          coinGeckoId: "airight",
          coinImageUrl: "https://i.ibb.co/m8mCyMr/airi.png",
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
          coinImageUrl: "https://i.ibb.co/NVP6CDZ/images-removebg-preview.png",
        },
        {
          type: "cw20",
          coinDenom: "ORAIX",
          coinMinimalDenom:
            "cw20:orai1lus0f0rhx8s03gdllx2n6vhkmf0536dv57wfge:OraiDex Token",
          contractAddress: "orai1lus0f0rhx8s03gdllx2n6vhkmf0536dv57wfge",
          coinDecimals: 6,
          coinGeckoId: "oraidex",
          coinImageUrl: "https://i.ibb.co/VmMJtf7/oraix.png",
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
          type: "cw20",
          coinDenom: "KWT",
          coinMinimalDenom:
            "cw20:orai1nd4r053e3kgedgld2ymen8l9yrw8xpjyaal7j5:Kawaii Islands",
          contractAddress: "orai1nd4r053e3kgedgld2ymen8l9yrw8xpjyaal7j5",
          coinDecimals: 6,
          coinGeckoId: "kawaii-islands",
          coinImageUrl:
            "https://s2.coinmarketcap.com/static/img/coins/64x64/12313.png",
        },
        {
          type: "cw20",
          coinDenom: "MILKY",
          coinMinimalDenom:
            "cw20:orai1gzvndtzceqwfymu2kqhta2jn6gmzxvzqwdgvjw:Milky Token",
          contractAddress: "orai1gzvndtzceqwfymu2kqhta2jn6gmzxvzqwdgvjw",
          coinDecimals: 6,
          coinGeckoId: "milky-token",
          coinImageUrl:
            "https://s2.coinmarketcap.com/static/img/coins/64x64/14418.png",
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
      ];
    },
    get feeCurrencies() {
      return [this.stakeCurrency];
    },
    features: ["stargate", "ibc-transfer", "cosmwasm", "no-legacy-stdTx"],
    chainSymbolImageUrl:
      "https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png",
    txExplorer: {
      name: "Oraiscan",
      txUrl: "https://scan.orai.io/txs/{txHash}",
      accountUrl: "https://scan.orai.io/account/{address}",
    },
    // beta: true // use v1beta1
  },

  {
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
        "https://assets.coingecko.com/coins/images/12882/standard/Secondary_Symbol.png?1696512670",
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
  },
  {
    chainId: "oraibridge-subnet-2",
    chainName: "OraiBridge",
    rpc: "https://bridge-v2.rpc.orai.io",
    rest: "https://bridge-v2.lcd.orai.io",
    networkType: "cosmos",
    stakeCurrency: {
      coinDenom: "ORAIB",
      coinMinimalDenom: "uoraib",
      coinDecimals: 6,
      coinImageUrl:
        "https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png",
      gasPriceStep: {
        low: 0,
        average: 0,
        high: 0,
      },
    },
    bip44: {
      coinType: 118,
    },
    coinType: 118,
    bech32Config: Bech32Address.defaultBech32Config("oraib"),
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
            "https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png",
        },
        {
          coinDenom: "BEP20 AIRI",
          coinMinimalDenom: "oraib0x7e2A35C746F2f7C240B664F1Da4DD100141AE71F",
          coinDecimals: 18,
          coinGeckoId: "airight",
          coinImageUrl: "https://i.ibb.co/m8mCyMr/airi.png",
        },
        {
          coinDenom: "BEP20 KWT",
          coinMinimalDenom: "oraib0x257a8d1E03D17B8535a182301f15290F11674b53",
          coinDecimals: 18,
          coinGeckoId: "kawaii-islands",
          coinImageUrl:
            "https://s2.coinmarketcap.com/static/img/coins/64x64/12313.png",
        },
        {
          coinDenom: "BEP20 MILKY",
          coinMinimalDenom: "oraib0x6fE3d0F096FC932A905accd1EB1783F6e4cEc717",
          coinDecimals: 18,
          coinGeckoId: "milky-token",
          coinImageUrl:
            "https://s2.coinmarketcap.com/static/img/coins/64x64/14418.png",
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
      return [this.stakeCurrency];
    },
    features: ["stargate", "ibc-transfer", "cosmwasm", "no-legacy-stdTx"],
    txExplorer: {
      name: "OraiBridgescan",
      txUrl: "https://scan.bridge.orai.io/txs/{txHash}",
      accountUrl: "https://scan.bridge.orai.io/account/{address}",
    },
  },
  {
    chainId: "oraibtc-mainnet-1",
    chainName: "OraiBTC Bridge",
    rpc: "https://btc.rpc.orai.io",
    rest: "https://btc.lcd.orai.io",
    networkType: "cosmos",
    stakeCurrency: {
      coinDenom: "ORAIBTC",
      coinMinimalDenom: "uoraibtc",
      coinDecimals: 6,
      gasPriceStep: {
        low: 0,
        average: 0,
        high: 0,
      },
      coinImageUrl:
        "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
    },
    bip44: {
      coinType: 118,
    },
    coinType: 118,
    bech32Config: Bech32Address.defaultBech32Config("oraibtc"),
    // List of all coin/tokens used in this chain.
    get currencies() {
      return [this.stakeCurrency];
    },
    get feeCurrencies() {
      return [this.stakeCurrency];
    },
    features: ["stargate", "ibc-transfer", "cosmwasm"],
    txExplorer: {
      name: "Scanium",
      txUrl: "https://scanium.io/OraiBtcMainnet/tx/{txHash}",
    },
  },
  {
    rpc: "https://rpc-cosmos.oraidex.io",
    rest: "https://lcd-cosmos.oraidex.io",
    chainId: "cosmoshub-4",
    chainName: "Cosmos Hub",
    networkType: "cosmos",
    stakeCurrency: {
      coinDenom: "ATOM",
      coinMinimalDenom: "uatom",
      coinDecimals: 6,
      coinGeckoId: "cosmos",
      coinImageUrl:
        "https://assets.coingecko.com/coins/images/1481/standard/cosmos_hub.png",
      gasPriceStep: {
        low: 0.02,
        average: 0.025,
        high: 0.04,
      },
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("cosmos"),
    currencies: [
      {
        coinDenom: "ATOM",
        coinMinimalDenom: "uatom",
        coinDecimals: 6,
        coinGeckoId: "cosmos",
        coinImageUrl:
          "https://assets.coingecko.com/coins/images/1481/standard/cosmos_hub.png",
      },
    ],
    get feeCurrencies() {
      return [this.stakeCurrency];
    },
    coinType: 118,
    features: ["stargate", "ibc-transfer", "no-legacy-stdTx", "ibc-go"],
    chainSymbolImageUrl:
      "https://assets.coingecko.com/coins/images/1481/standard/cosmos_hub.png",
    txExplorer: {
      name: "Scanium",
      txUrl: "https://scanium.io/cosmos/tx/{txHash}",
    },
  },

  {
    rpc: "https://osmosis.rpc.orai.io",
    rest: "https://osmosis.lcd.orai.io",
    chainId: "osmosis-1",
    chainName: "Osmosis",
    networkType: "cosmos",
    stakeCurrency: {
      coinDenom: "OSMO",
      coinMinimalDenom: "uosmo",
      coinDecimals: 6,
      coinGeckoId: "osmosis",
      coinImageUrl:
        "https://assets.coingecko.com/coins/images/16724/standard/osmo.png",
      gasPriceStep: {
        low: 0.0025,
        average: 0.025,
        high: 0.04,
      },
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("osmo"),
    currencies: [
      {
        coinDenom: "OSMO",
        coinMinimalDenom: "uosmo",
        coinDecimals: 6,
        coinGeckoId: "osmosis",
        coinImageUrl:
          "https://assets.coingecko.com/coins/images/16724/standard/osmo.png",
      },
      {
        coinDenom: "TON",
        coinMinimalDenom:
          "ibc/905889A7F0B94F1CE1506D9BADF13AE9141E4CBDBCD565E1DFC7AE418B3E3E98",
        coinDecimals: 9,
        coinGeckoId: "the-open-network",
        coinImageUrl:
          "https://assets.coingecko.com/coins/images/17980/standard/ton_symbol.png?1696517498",
      },
      {
        coinDenom: "ION",
        coinMinimalDenom: "uion",
        coinDecimals: 6,
        coinGeckoId: "ion",
        coinImageUrl:
          "https://assets.coingecko.com/coins/images/16731/standard/ion-osmosis.png",
      },
    ],
    get feeCurrencies() {
      return [this.stakeCurrency];
    },
    coinType: 118,
    features: ["stargate", "ibc-transfer", "no-legacy-stdTx", "ibc-go"],
    chainSymbolImageUrl:
      "https://assets.coingecko.com/coins/images/16724/standard/osmo.png",
    txExplorer: {
      name: "Scanium",
      txUrl: "https://scanium.io/osmosis/tx/{txHash}",
    },
  },
  {
    rpc: "https://rpc-celestia.keplr.app",
    rest: "https://lcd-celestia.keplr.app",
    chainId: "celestia",
    networkType: "cosmos",
    chainName: "Celestia",
    stakeCurrency: {
      coinDenom: "TIA",
      coinDecimals: 6,
      coinMinimalDenom: "utia",
      coinImageUrl:
        "https://assets.coingecko.com/coins/images/31967/standard/tia.jpg?1696530772",
      coinGeckoId: "celestia",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("celestia"),
    currencies: [
      {
        coinDenom: "TIA",
        coinDecimals: 6,
        coinMinimalDenom: "utia",
        coinImageUrl:
          "https://assets.coingecko.com/coins/images/31967/standard/tia.jpg?1696530772",
        coinGeckoId: "celestia",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "TIA",
        coinDecimals: 6,
        coinMinimalDenom: "utia",
        coinImageUrl:
          "https://assets.coingecko.com/coins/images/31967/standard/tia.jpg?1696530772",
        coinGeckoId: "celestia",
      },
    ],
    features: ["no-legacy-stdTx"],
    txExplorer: {
      name: "Scanium",
      txUrl: "https://scanium.io/celestia/tx/{txHash}",
    },
  },
  {
    rpc: "https://rpc-akash.keplr.app",
    rest: "https://lcd-akash.keplr.app",
    networkType: "cosmos",
    chainId: "akashnet-2",
    chainName: "Akash",
    stakeCurrency: {
      coinDenom: "AKT",
      coinMinimalDenom: "uakt",
      coinDecimals: 6,
      coinGeckoId: "akash-network",
      coinImageUrl:
        "https://s2.coinmarketcap.com/static/img/coins/64x64/7431.png",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("akash"),
    currencies: [
      {
        coinDenom: "AKT",
        coinMinimalDenom: "uakt",
        coinDecimals: 6,
        coinGeckoId: "akash-network",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/7431.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "AKT",
        coinMinimalDenom: "uakt",
        coinDecimals: 6,
        coinGeckoId: "akash-network",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/7431.png",
      },
    ],
    features: ["ibc-transfer", "no-legacy-stdTx"],
    txExplorer: {
      name: "Scanium",
      txUrl: "https://scanium.io/akash/tx/{txHash}",
    },
  },
  {
    rpc: "https://rpc-dydx.keplr.app",
    rest: "https://lcd-dydx.keplr.app",
    networkType: "cosmos",
    chainId: "dydx-mainnet-1",
    chainName: "dYdX",
    stakeCurrency: {
      coinDenom: "DYDX",
      coinDecimals: 18,
      coinMinimalDenom: "adydx",
      coinGeckoId: "dydx-chain",
      coinImageUrl:
        "https://s2.coinmarketcap.com/static/img/coins/64x64/28324.png",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "dydx",
      bech32PrefixAccPub: "dydxpub",
      bech32PrefixValAddr: "dydxvaloper",
      bech32PrefixValPub: "dydxvaloperpub",
      bech32PrefixConsAddr: "dydxvalcons",
      bech32PrefixConsPub: "dydxvalconspub",
    },
    currencies: [
      {
        coinDenom: "DYDX",
        coinDecimals: 18,
        coinMinimalDenom: "adydx",
        coinGeckoId: "dydx-chain",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/28324.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "DYDX",
        coinDecimals: 18,
        coinMinimalDenom: "adydx",
        coinGeckoId: "dydx-chain",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/28324.png",
        gasPriceStep: {
          average: 25000000000,
          high: 30000000000,
          low: 20000000000,
        },
      },
    ],
    features: ["no-legacy-stdTx"],
    txExplorer: {
      name: "Scanium",
      txUrl: "https://scanium.io/dydx/tx/{txHash}",
    },
  },
  {
    chainId: "dymension_1100-1",
    chainName: "Dymension",
    networkType: "cosmos",
    rpc: "https://rpc-dymension.keplr.app",
    rest: "https://lcd-dymension.keplr.app",
    currencies: [
      {
        coinMinimalDenom: "adym",
        coinDenom: "DYM",
        coinDecimals: 18,
        coinGeckoId: "dymension",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/dymension_1100/chain.png",
      },
    ],
    bip44: {
      coinType: 60,
    },
    bech32Config: {
      bech32PrefixAccAddr: "dym",
      bech32PrefixAccPub: "dympub",
      bech32PrefixValAddr: "dymvaloper",
      bech32PrefixValPub: "dymvaloperpub",
      bech32PrefixConsAddr: "dymvalcons",
      bech32PrefixConsPub: "dymvalconspub",
    },
    stakeCurrency: {
      coinMinimalDenom: "adym",
      coinDenom: "DYM",
      coinDecimals: 18,
      coinGeckoId: "dymension",
      coinImageUrl:
        "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/dymension_1100/chain.png",
    },
    feeCurrencies: [
      {
        coinMinimalDenom: "adym",
        coinDenom: "DYM",
        coinDecimals: 18,
        coinGeckoId: "dymension",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/dymension_1100/chain.png",
        gasPriceStep: {
          average: 25000000000,
          high: 30000000000,
          low: 20000000000,
        },
      },
    ],
    features: ["eth-address-gen", "eth-key-sign", "no-legacy-stdTx"],
    txExplorer: {
      name: "Mintscan",
      txUrl: "https://mintscan.io/dymension/tx/{txHash}",
    },
  },
  {
    rpc: "https://rpc-stargaze.keplr.app",
    rest: "https://lcd-stargaze.keplr.app",
    chainId: "stargaze-1",
    chainName: "Stargaze",
    networkType: "cosmos",
    stakeCurrency: {
      coinDenom: "STARS",
      coinMinimalDenom: "ustars",
      coinDecimals: 6,
      coinGeckoId: "stargaze",
      coinImageUrl:
        "https://assets.coingecko.com/coins/images/22363/standard/pink_star_200.png",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("stars"),
    currencies: [
      {
        coinDenom: "STARS",
        coinMinimalDenom: "ustars",
        coinDecimals: 6,
        coinGeckoId: "stargaze",
        coinImageUrl:
          "https://assets.coingecko.com/coins/images/22363/standard/pink_star_200.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "STARS",
        coinMinimalDenom: "ustars",
        coinDecimals: 6,
        coinGeckoId: "stargaze",
        coinImageUrl:
          "https://assets.coingecko.com/coins/images/22363/standard/pink_star_200.png",
        gasPriceStep: {
          low: 1,
          average: 1.5,
          high: 2,
        },
      },
    ],
    features: ["ibc-transfer", "ibc-go", "no-legacy-stdTx"],
    txExplorer: {
      name: "Scanium",
      txUrl: "https://scanium.io/stargaze/tx/{txHash}",
    },
  },
  // {
  //   rest: "https://blockstream.info/testnet/api",
  //   chainId: "bitcoinTestnet",
  //   chainName: "Bitcoin Testnet",
  //   bip44: {
  //     coinType: 1,
  //   },
  //   coinType: 1,
  //   stakeCurrency: {
  //     coinDenom: "BTC",
  //     coinMinimalDenom: "btc",
  //     coinDecimals: 8,
  //     coinGeckoId: "bitcoin",
  //     coinImageUrl:
  //       "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  //     gasPriceStep: {
  //       low: 25,
  //       average: 18,
  //       high: 1,
  //     },
  //   },
  //   bech32Config: Bech32Address.defaultBech32Config("tb"),
  //   networkType: "bitcoin",
  //   currencies: [
  //     {
  //       coinDenom: "BTC",
  //       coinMinimalDenom: "btc",
  //       coinDecimals: 8,
  //       coinGeckoId: "bitcoin",
  //       coinImageUrl:
  //         "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  //     },
  //   ],
  //   get feeCurrencies() {
  //     return this.currencies;
  //   },
  //   features: ["isBtc"],
  //   txExplorer: {
  //     name: "BlockStream",
  //     txUrl: "https://blockstream.info/testnet/tx/{txHash}",
  //     accountUrl: "https://blockstream.info/testnet/address/{address}",
  //   },
  // },
  {
    rest: "https://blockstream.info/api",
    chainId: "bitcoin",
    chainName: "Bitcoin",
    bip44: {
      coinType: 0,
    },
    coinType: 0,
    stakeCurrency: {
      coinDenom: "BTC",
      coinMinimalDenom: "btc",
      coinDecimals: 8,
      coinGeckoId: "bitcoin",
      coinImageUrl:
        "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
      gasPriceStep: {
        low: 144,
        average: 18,
        high: 1,
      },
    },
    bech32Config: Bech32Address.defaultBech32Config("bc"),
    networkType: "bitcoin",
    currencies: [
      {
        coinDenom: "BTC",
        coinMinimalDenom: "btc",
        coinDecimals: 8,
        coinGeckoId: "bitcoin",
        coinImageUrl:
          "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
      },
    ],
    get feeCurrencies() {
      return this.currencies;
    },

    features: ["isBtc"],
    txExplorer: {
      name: "BlockStream",
      txUrl: "https://blockstream.info/tx/{txHash}",
      accountUrl: "https://blockstream.info/address/{address}",
    },
  },
  {
    rpc: "https://rpc-noble.keplr.app",
    rest: "https://lcd-noble.keplr.app",
    chainId: "noble-1",
    networkType: "cosmos",
    chainName: "Noble",
    stakeCurrency: {
      coinDenom: "STAKE",
      coinMinimalDenom: "ustake",
      coinDecimals: 6,
      coinImageUrl:
        "https://www.mintscan.io/assets/chains/_rendered/noble@3x.png",
      gasPriceStep: {
        low: 1,
        average: 1.5,
        high: 2,
      },
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
        coinDenom: "USDC",
        coinMinimalDenom: "uusdc",
        coinDecimals: 6,
        coinGeckoId: "usd-coin",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
      },
      {
        coinDenom: "STAKE",
        coinMinimalDenom: "ustake",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "USDC",
        coinMinimalDenom: "uusdc",
        coinDecimals: 6,
        coinGeckoId: "usd-coin",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
        gasPriceStep: {
          low: 1,
          average: 1.5,
          high: 2,
        },
      },
      {
        coinDenom: "ATOM",
        coinMinimalDenom:
          "ibc/EF48E6B1A1A19F47ECAEA62F5670C37C0580E86A9E88498B7E393EB6F49F33C0",
        coinDecimals: 6,
        coinGeckoId: "cosmos",
        coinImageUrl:
          "https://assets.coingecko.com/coins/images/1481/standard/cosmos_hub.png",
        gasPriceStep: {
          low: 0.001,
          average: 0.001,
          high: 0.001,
        },
      },
    ],

    features: ["stargate", "ibc-transfer", "cosmwasm", "no-legacy-stdTx"],
    txExplorer: {
      name: "Scanium",
      txUrl: "https://scanium.io/noble/tx/{txHash}",
    },
  },
  {
    rpc: "https://rpc.ankr.com/eth",
    rest: "https://rpc.ankr.com/eth",
    chainId: "0x01",
    chainName: "Ethereum",
    bip44: {
      coinType: 60,
    },
    coinType: 60,
    stakeCurrency: {
      coinDenom: "ETH",
      coinMinimalDenom: "eth",
      coinDecimals: 18,
      coinGeckoId: "ethereum",
      coinImageUrl:
        "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
      gasPriceStep: {
        low: 1,
        average: 1.25,
        high: 1.5,
      },
    },
    chainSymbolImageUrl:
      "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
    bech32Config: Bech32Address.defaultBech32Config("evmos"),
    networkType: "evm",
    currencies: [
      {
        coinDenom: "ETH",
        coinMinimalDenom: "eth",
        coinDecimals: 18,
        coinGeckoId: "ethereum",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
      },
      {
        coinDenom: "OCH",
        coinMinimalDenom:
          "erc20:0x19373EcBB4B8cC2253D70F2a246fa299303227Ba:OCH Token",
        contractAddress: "0x19373EcBB4B8cC2253D70F2a246fa299303227Ba",
        coinDecimals: 18,
        coinGeckoId: "och",
        coinImageUrl:
          "https://assets.coingecko.com/coins/images/34236/standard/orchai_logo_white_copy_4x-8_%281%29.png",
      },
      {
        coinDenom: "ORAI",
        coinMinimalDenom:
          "erc20:0x4c11249814f11b9346808179cf06e71ac328c1b5:Oraichain Token",
        contractAddress: "0x4c11249814f11b9346808179cf06e71ac328c1b5",
        coinDecimals: 18,
        coinGeckoId: "oraichain-token",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png",
      },
      {
        coinDenom: "ORAIX",
        coinMinimalDenom:
          "erc20:0x2d869aE129e308F94Cc47E66eaefb448CEe0d03e:ORAIX Token",
        contractAddress: "0x2d869aE129e308F94Cc47E66eaefb448CEe0d03e",
        coinDecimals: 18,
        coinGeckoId: "oraidex",
        coinImageUrl: "https://i.ibb.co/VmMJtf7/oraix.png",
      },
    ],
    get feeCurrencies() {
      return [this.stakeCurrency];
    },

    features: ["ibc-go", "stargate", "isEvm"],
    txExplorer: {
      name: "Etherscan",
      txUrl: "https://etherscan.io/tx/{txHash}",
      accountUrl: "https://etherscan.io/address/{address}",
    },
  },
  {
    rpc: "https://bsc-dataseed1.ninicoin.io",
    rest: "https://bsc-dataseed1.ninicoin.io",
    chainId: "0x38",
    chainName: "BNB Chain",
    bip44: {
      coinType: 60,
    },
    coinType: 60,
    stakeCurrency: {
      coinDenom: "BNB",
      coinMinimalDenom: "bnb",
      coinDecimals: 18,
      coinGeckoId: "binancecoin",
      coinImageUrl:
        "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
      gasPriceStep: {
        low: 1,
        average: 1.25,
        high: 1.5,
      },
    },
    bech32Config: Bech32Address.defaultBech32Config("evmos"),
    chainSymbolImageUrl:
      "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
    networkType: "evm",
    get currencies() {
      return [
        {
          coinDenom: "BNB",
          coinMinimalDenom: "bnb",
          coinDecimals: 18,
          coinGeckoId: "binancecoin",
          coinImageUrl:
            "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
        },
        {
          coinDenom: "ORAI",
          coinMinimalDenom:
            "erc20:0xA325Ad6D9c92B55A3Fc5aD7e412B1518F96441C0:Oraichain Token",
          coinDecimals: 18,
          coinGeckoId: "oraichain-token",
          coinImageUrl:
            "https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png",
        },
        {
          coinDenom: "AIRI",
          coinMinimalDenom:
            "erc20:0x7e2a35c746f2f7c240b664f1da4dd100141ae71f:aiRight Token",
          coinDecimals: 18,
          coinGeckoId: "airight",
          coinImageUrl:
            "https://s2.coinmarketcap.com/static/img/coins/64x64/11563.png",
        },
        {
          coinDenom: "KWT",
          coinMinimalDenom:
            "erc20:0x257a8d1e03d17b8535a182301f15290f11674b53:Kawaii Islands",
          coinDecimals: 18,
          coinGeckoId: "kawaii-islands",
          coinImageUrl:
            "https://s2.coinmarketcap.com/static/img/coins/64x64/12313.png",
        },
        {
          coinDenom: "BSC-USD",
          coinMinimalDenom:
            "erc20:0x55d398326f99059fF775485246999027B3197955:Binance Bridged USDT (BNB Smart Chain)",
          coinDecimals: 18,
          coinGeckoId: "binance-bridged-usdt-bnb-smart-chain",
          coinImageUrl:
            "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
        },
        {
          coinDenom: "MILKY",
          coinMinimalDenom:
            "erc20:0x6fE3d0F096FC932A905accd1EB1783F6e4cEc717:Milky Token",
          coinDecimals: 18,
          coinGeckoId: "milky-token",
          coinImageUrl:
            "https://s2.coinmarketcap.com/static/img/coins/64x64/14418.png",
        },
      ];
    },
    get feeCurrencies() {
      return [this.stakeCurrency];
    },

    features: ["ibc-go", "stargate", "isEvm"],
    txExplorer: {
      name: "Bsc Scan",
      txUrl: "https://bscscan.com/tx/{txHash}",
      accountUrl: "https://bscscan.com/address/{address}",
    },
  },

  {
    rpc: "https://api.trongrid.io",
    rest: "https://apilist.tronscanapi.com",
    evmRpc: "https://api.trongrid.io/jsonrpc",
    // rpc: "https://nile.trongrid.io",
    // rest: "https://nileapi.tronscan.org",
    chainId: "0x2b6653dc",
    networkType: "evm",
    chainName: "Tron",
    stakeCurrency: {
      coinDenom: "TRX",
      coinMinimalDenom: "trx",
      coinDecimals: 6,
      coinGeckoId: "tron",
      coinImageUrl:
        "https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png",
      gasPriceStep: {
        low: 420,
        average: 504,
        high: 672,
      },
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
        coinMinimalDenom:
          "erc20:0x3487b63D30B5B2C87fb7fFa8bcfADE38EAaC1abe:USDC Token",
        coinGeckoId: "usd-coin",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
        coinDecimals: 6,
      },
      // {
      //   contractAddress: "TLBaRhANQoJFTqre9Nf1mjuwNWjCJeYqUL",
      //   coinDenom: "TestUSDJ",
      //   coinMinimalDenom:
      //     "erc20:0x70082243784dcdf3042034E7B044d6D342A91360:USDJ Token",
      //   // coinMinimalDenom: "usdc",
      //   coinGeckoId: "usd-coin",
      //   coinImageUrl:
      //     "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
      //   coinDecimals: 18,
      // },
      {
        contractAddress: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
        coinMinimalDenom:
          "erc20:0xa614f803B6FD780986A42c78Ec9c7f77e6DeD13C:USDT Token",
        coinDenom: "USDT",
        coinDecimals: 6,
        coinGeckoId: "tether",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
      },
      {
        contractAddress: "TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR",
        coinMinimalDenom:
          "erc20:0x891cdb91d149f23B1a45D9c5Ca78a88d0cB44C18:Wrapped Tron",
        coinDenom: "WTRX",
        coinDecimals: 6,
        coinGeckoId: "wrapped-tron",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png",
      },
    ],
    restConfig: {
      headers: {
        // TODO: This is key free for test tron
        "TRON-PRO-API-KEY": "8ab42c7c-b664-46c2-80b9-3acde86d01e3",
      },
    },
    bip44: {
      coinType: 195,
    },
    coinType: 195,
    bech32Config: Bech32Address.defaultBech32Config("evmos"),
    get feeCurrencies() {
      return [this.stakeCurrency];
    },

    features: ["ibc-go", "stargate", "isEvm"],
    txExplorer: {
      name: "Tronscan",
      txUrl: "https://tronscan.org/#/transaction/{txHash}",
      accountUrl: "https://tronscan.org/#/address/{address}",
    },
  },
  {
    rpc: "https://sapphire.oasis.io",
    rest: "https://sapphire.oasis.io",
    grpc: "https://grpc.oasis.dev",
    chainId: "native-0x5afe",
    networkType: "evm",
    chainName: "Oasis",
    stakeCurrency: {
      coinDenom: "ROSE",
      coinMinimalDenom: "rose",
      coinDecimals: 9,
      coinGeckoId: "oasis-network",
      coinImageUrl:
        "https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png",
      gasPriceStep: {
        low: 0,
        average: 0,
        high: 0,
      },
    },
    currencies: [
      {
        coinDenom: "ROSE",
        coinMinimalDenom: "rose",
        coinDecimals: 9,
        coinGeckoId: "oasis-network",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png",
      },
    ],
    restConfig: {},
    bip44: {
      coinType: 474,
    },
    coinType: 474,
    bech32Config: Bech32Address.defaultBech32Config("oasis"),
    get feeCurrencies() {
      return [this.stakeCurrency];
    },
    features: ["ibc-go", "stargate", "isEvm"],
    txExplorer: {
      name: "Oasis scan",
      txUrl: "https://www.oasisscan.com/transactions/{txHash}",
      accountUrl: "https://www.oasisscan.com/accounts/detail/{address}",
    },
  },
  {
    rpc: "https://sapphire.oasis.io",
    rest: "https://sapphire.oasis.io",
    grpc: "https://grpc.oasis.dev",
    chainId: "0x5afe",
    chainName: "Oasis Sapphire",
    bip44: {
      coinType: 60,
    },
    coinType: 60,
    stakeCurrency: {
      coinDenom: "ROSE",
      coinMinimalDenom: "rose",
      coinDecimals: 18,
      coinGeckoId: "oasis-network",
      coinImageUrl:
        "https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png",
      gasPriceStep: {
        low: 1,
        average: 1.25,
        high: 1.5,
      },
    },
    bech32Config: Bech32Address.defaultBech32Config("evmos"),
    networkType: "evm",
    currencies: [
      {
        coinDenom: "ROSE",
        coinMinimalDenom: "rose",
        coinDecimals: 18,
        coinGeckoId: "oasis-network",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png",
      },
    ],
    get feeCurrencies() {
      return [this.stakeCurrency];
    },

    features: ["ibc-go", "stargate", "isEvm"],
    txExplorer: {
      name: "Oasis Saphire Scan",
      txUrl: "https://explorer.oasis.io/mainnet/sapphire/tx/{txHash}",
      accountUrl:
        "https://explorer.oasis.io/mainnet/sapphire/address/{address}",
    },
  },
  {
    rpc: "https://emerald.oasis.dev",
    rest: "https://emerald.oasis.dev",
    grpc: "https://grpc.oasis.dev",
    chainId: "0xa516",
    chainName: "Oasis Emerald",
    bip44: {
      coinType: 60,
    },
    coinType: 60,
    stakeCurrency: {
      coinDenom: "ROSE",
      coinMinimalDenom: "rose",
      coinDecimals: 18,
      coinGeckoId: "oasis-network",
      coinImageUrl:
        "https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png",
      gasPriceStep: {
        low: 1,
        average: 1.25,
        high: 1.5,
      },
    },
    bech32Config: Bech32Address.defaultBech32Config("evmos"),
    networkType: "evm",
    currencies: [
      {
        coinDenom: "ROSE",
        coinMinimalDenom: "rose",
        coinDecimals: 18,
        coinGeckoId: "oasis-network",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png",
      },
    ],
    get feeCurrencies() {
      return [this.stakeCurrency];
    },

    features: ["ibc-go", "stargate", "isEvm"],
    txExplorer: {
      name: "Oasis Emerald Scan",
      txUrl: "https://explorer.oasis.io/mainnet/emerald/tx/{txHash}",
      accountUrl: "https://explorer.oasis.io/mainnet/emerald/address/{address}",
    },
  },
  {
    rpc: "https://tendermint1.kawaii.global",
    evmRpc: "https://endpoint1.kawaii.global",
    rest: "https://cosmos1.kawaii.global",
    chainId: "kawaii_6886-1",
    networkType: "cosmos",
    chainName: "Kawaiiverse Cosmos",
    stakeCurrency: {
      coinDenom: "ORAIE",
      coinMinimalDenom: "oraie",
      coinDecimals: 18,
      coinGeckoId: "oraie",
      coinImageUrl:
        "https://s2.coinmarketcap.com/static/img/coins/64x64/12313.png",
      gasPriceStep: {
        low: 0,
        average: 0.000025,
        high: 0.00004,
      },
    },
    bip44: {
      coinType: 60,
    },
    coinType: 60,
    bech32Config: Bech32Address.defaultBech32Config("oraie"),
    get currencies() {
      return [
        this.stakeCurrency,
        // {
        //   coinDenom: "KWT",
        //   coinMinimalDenom:
        //     "erc20:0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd:Kawaii Islands",
        //   coinDecimals: 18,
        //   coinGeckoId: "kawaii-islands",
        //   coinImageUrl:
        //     "https://s2.coinmarketcap.com/static/img/coins/64x64/12313.png",
        // },
        // {
        //   coinDenom: "MILKY",
        //   coinMinimalDenom:
        //     "erc20:0xd567B3d7B8FE3C79a1AD8dA978812cfC4Fa05e75:Milky Token",
        //   coinDecimals: 18,
        //   coinGeckoId: "milky-token",
        //   coinImageUrl:
        //     "https://s2.coinmarketcap.com/static/img/coins/64x64/14418.png",
        // },
      ];
    },
    get feeCurrencies() {
      return [this.stakeCurrency];
    },
    // features: ['ibc-transfer', 'ibc-go', 'stargate']
    features: ["isEvm"],
    txExplorer: {
      name: "Kawaii",
      txUrl: "https://scan.kawaii.global/tx/{txHash}",
    },
  },
  {
    rpc: "https://tendermint1.kawaii.global",
    rest: "https://endpoint1.kawaii.global",
    chainId: "0x1ae6",
    networkType: "evm",
    chainName: "Kawaiiverse EVM",
    stakeCurrency: {
      coinDenom: "ORAIE",
      coinMinimalDenom: "oraie",
      coinDecimals: 18,
      coinGeckoId: "oraie",
      coinImageUrl:
        "https://s2.coinmarketcap.com/static/img/coins/64x64/12313.png",
      gasPriceStep: {
        low: 0,
        average: 0.000025,
        high: 0.00004,
      },
    },
    bip44: {
      coinType: 60,
    },
    coinType: 60,
    bech32Config: Bech32Address.defaultBech32Config("evmos"),
    get currencies() {
      return [
        this.stakeCurrency,
        {
          coinDenom: "KWT",
          coinMinimalDenom:
            "erc20:0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd:Kawaii Islands",
          coinDecimals: 18,
          coinGeckoId: "kawaii-islands",
          coinImageUrl:
            "https://s2.coinmarketcap.com/static/img/coins/64x64/12313.png",
        },
        {
          coinDenom: "MILKY",
          coinMinimalDenom:
            "erc20:0xd567B3d7B8FE3C79a1AD8dA978812cfC4Fa05e75:Milky Token",
          coinDecimals: 18,
          coinGeckoId: "milky-token",
          coinImageUrl:
            "https://s2.coinmarketcap.com/static/img/coins/64x64/14418.png",
        },
      ];
    },
    get feeCurrencies() {
      return [this.stakeCurrency];
    },
    features: ["isEvm"],
  },
  {
    rpc: "https://testnet.sapphire.oasis.io",
    rest: "https://testnet.sapphire.oasis.io",
    grpc: "https://grpc.oasis.dev",
    chainId: "0x5aff",
    chainName: "Oasis Sapphire Testnet",
    bip44: {
      coinType: 60,
    },
    coinType: 60,
    stakeCurrency: {
      coinDenom: "ROSE",
      coinMinimalDenom: "rose",
      coinDecimals: 18,
      coinGeckoId: "oasis-network",
      coinImageUrl:
        "https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png",
      gasPriceStep: {
        low: 1,
        average: 1.25,
        high: 1.5,
      },
    },
    bech32Config: Bech32Address.defaultBech32Config("evmos"),
    networkType: "evm",
    currencies: [
      {
        coinDenom: "ROSE",
        coinMinimalDenom: "rose",
        coinDecimals: 18,
        coinGeckoId: "oasis-network",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png",
      },
    ],
    get feeCurrencies() {
      return [this.stakeCurrency];
    },

    features: ["ibc-go", "stargate", "isEvm"],
    txExplorer: {
      name: "Oasis Saphire Scan",
      txUrl: "https://explorer.oasis.io/mainnet/sapphire/tx/{txHash}",
      accountUrl:
        "https://explorer.oasis.io/mainnet/sapphire/address/{address}",
    },
  },
  {
    rpc: "https://rpc-neutron.keplr.app",
    rest: "https://lcd-neutron.keplr.app",
    chainId: "neutron-1",
    networkType: "cosmos",
    chainName: "Neutron",
    stakeCurrency: {
      coinDenom: "STAKE",
      coinMinimalDenom: "ustake",
      coinDecimals: 6,
      coinImageUrl:
        "https://s2.coinmarketcap.com/static/img/coins/64x64/26680.png",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "neutron",
      bech32PrefixAccPub: "neutronpub",
      bech32PrefixValAddr: "neutronvaloper",
      bech32PrefixValPub: "neutronvaloperpub",
      bech32PrefixConsAddr: "neutronvalcons",
      bech32PrefixConsPub: "neutronvalconspub",
    },
    currencies: [
      {
        coinDenom: "NTRN",
        coinMinimalDenom: "untrn",
        coinDecimals: 6,
        coinGeckoId: "neutron-3",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/26680.png",
      },
      {
        coinDenom: "STAKE",
        coinMinimalDenom: "ustake",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "NTRN",
        coinMinimalDenom: "untrn",
        coinDecimals: 6,
        coinGeckoId: "neutron-3",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/26680.png",
      },
    ],
    features: ["no-legacy-stdTx"],
    txExplorer: {
      name: "Scanium",
      txUrl: "https://scanium.io/neutron/tx/{txHash}",
    },
  },
  {
    chainId: "Neutaro-1",
    chainName: "Neutaro",
    networkType: "cosmos",
    rpc: "https://neutaro.rpc.orai.io",
    rest: "https://neutaro.lcd.orai.io",
    bip44: {
      coinType: 118,
    },
    coinType: 118,
    bech32Config: Bech32Address.defaultBech32Config("neutaro"),
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
      return [this.stakeCurrency];
    },
    stakeCurrency: {
      coinDenom: "NTMPI",
      coinMinimalDenom: "uneutaro",
      coinGeckoId: "neutaro",
      coinImageUrl: "https://asset.brandfetch.io/idKrUw6EdO/ids9m0Bt_7.png",
      coinDecimals: 6,
      gasPriceStep: {
        low: 0.01,
        average: 0.025,
        high: 0.03,
      },
    },
    features: ["stargate", "ibc-transfer", "cosmwasm", "no-legacy-stdTx"],
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/Neutaro/chain.png",
    txExplorer: {
      name: "Neutaro",
      txUrl: "https://nms1.neutaro.tech/Neutaro/tx/{txHash}",
      //TODO: Not found account explorer for neutaro
      accountUrl: "https://nms1.neutaro.tech/account/{address}",
    },
  },
  {
    rpc: "https://testnet-rpc.orai.io",
    rest: "https://testnet-lcd.orai.io",
    chainId: "Oraichain-testnet",
    chainName: "Oraichain-testnet",
    networkType: "cosmos",
    stakeCurrency: {
      coinDenom: "ORAI",
      coinMinimalDenom: "orai",
      coinDecimals: 6,
      coinGeckoId: "oraichain-token",
      coinImageUrl:
        "https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png",
      gasPriceStep: {
        low: 0.003,
        average: 0.005,
        high: 0.007,
      },
    },
    bip44: {
      coinType: 118,
    },
    coinType: 118,
    bech32Config: Bech32Address.defaultBech32Config("orai"),
    get currencies() {
      return [
        this.stakeCurrency,
        {
          type: "cw20",
          coinDenom: "AIRI",
          coinMinimalDenom:
            "cw20:orai1gwe4q8gme54wdk0gcrtsh4ykwvd7l9n3dxxas2:aiRight Token",
          contractAddress: "orai1gwe4q8gme54wdk0gcrtsh4ykwvd7l9n3dxxas2",
          coinDecimals: 6,
          coinGeckoId: "airight",
          coinImageUrl: "https://i.ibb.co/m8mCyMr/airi.png",
        },
      ];
    },
    get feeCurrencies() {
      return [this.stakeCurrency];
    },
    features: ["stargate", "no-legacy-stdTx", "ibc-transfer", "cosmwasm"],
    chainSymbolImageUrl: "https://orai.io/images/logos/logomark-dark.png",
    txExplorer: {
      name: "Oraiscan",
      txUrl: "https://testnet.scan.orai.io/txs/{txHash}",
      accountUrl: "https://testnet.scan.orai.io/account/{address}",
    },
    // beta: true // use v1beta1
  },

  {
    rest: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    rpc: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    chainId: "0x61",
    chainName: "BNB Chain Testnet",
    bip44: {
      coinType: 60,
    },
    coinType: 60,
    stakeCurrency: {
      coinDenom: "BNB",
      coinMinimalDenom: "bnb",
      coinDecimals: 18,
      coinGeckoId: "binancecoin",
      coinImageUrl:
        "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
      gasPriceStep: {
        low: 1,
        average: 1.25,
        high: 1.5,
      },
    },
    bech32Config: Bech32Address.defaultBech32Config("evmos"),
    networkType: "evm",
    get currencies() {
      return [
        {
          coinDenom: "BNB",
          coinMinimalDenom: "bnb",
          coinDecimals: 18,
          coinGeckoId: "binancecoin",
          coinImageUrl:
            "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
        },
        {
          coinDenom: "ORAI",
          coinMinimalDenom:
            "erc20:0x41E76b3b0Da96c14c4575d9aE96d73Acb6a0B903:Oraichain Token",
          coinDecimals: 18,
          coinGeckoId: "oraichain-token",
          coinImageUrl:
            "https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png",
        },
        {
          coinDenom: "AIRI",
          coinMinimalDenom:
            "erc20:0x7e2a35c746f2f7c240b664f1da4dd100141ae71f:aiRight Token",
          coinDecimals: 18,
          coinGeckoId: "airight",
          coinImageUrl:
            "https://s2.coinmarketcap.com/static/img/coins/64x64/11563.png",
        },
        {
          coinDenom: "KWT",
          coinMinimalDenom:
            "erc20:0x9da6e8a2065d5f09b9994ebc330a962721069a68:Kawaii Islands",
          coinDecimals: 18,
          coinGeckoId: "kawaii-islands",
          coinImageUrl:
            "https://s2.coinmarketcap.com/static/img/coins/64x64/12313.png",
        },
      ];
    },
    get feeCurrencies() {
      return [this.stakeCurrency];
    },
    features: ["isEvm"],
    txExplorer: {
      name: "Bsc Scan Testnet",
      txUrl: "https://testnet.bscscan.com/tx/{txHash}",
      accountUrl: "https://testnet.bscscan.com/address/{address}",
    },
  },
  {
    rpc: "https://rpc-juno.keplr.app",
    rest: "https://lcd-juno.keplr.app",
    chainId: "juno-1",
    chainName: "Juno",
    networkType: "cosmos",
    stakeCurrency: {
      coinDenom: "JUNO",
      coinMinimalDenom: "ujuno",
      coinDecimals: 6,
      coinGeckoId: "juno-network",
      coinImageUrl:
        "https://assets.coingecko.com/coins/images/19249/standard/Juno_Logo_%28Salmon%29_%282%29.png",
      gasPriceStep: {
        low: 0.1,
        average: 0.25,
        high: 0.4,
      },
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("juno"),
    currencies: [
      {
        coinDenom: "JUNO",
        coinMinimalDenom: "ujuno",
        coinDecimals: 6,
        coinGeckoId: "juno-network",
        coinImageUrl:
          "https://assets.coingecko.com/coins/images/19249/standard/Juno_Logo_%28Salmon%29_%282%29.png",
      },
    ],
    get feeCurrencies() {
      return [
        this.stakeCurrency,
        {
          coinDenom: "ATOM",
          coinMinimalDenom:
            "ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9",
          coinDecimals: 6,
          gasPriceStep: {
            low: 0.001 * 0.33,
            average: 0.0025 * 0.33,
            high: 0.004 * 0.33,
          },
        },
      ];
    },
    features: [
      "cosmwasm",
      "no-legacy-stdTx",
      "ibc-transfer",
      "ibc-go",
      "wasmd_0.24+",
    ],
    chainSymbolImageUrl:
      "https://assets.coingecko.com/coins/images/19249/standard/Juno_Logo_%28Salmon%29_%282%29.png",
    txExplorer: {
      name: "Scanium",
      txUrl: "https://scanium.io/juno/tx/{txHash}",
    },
  },
];

// The origins that are able to pass any permission that external webpages can have.
export const PrivilegedOrigins: string[] = [
  // "https://app.osmosis.zone",
  // "https://oraidex.io",
  // "https://orderbook.oraidex.io",
  // "https://futures.oraidex.io",
  // "http://10.10.20.75:3000/",
  // "https://pancakeswap.finance/",
];

// tracking ads
export const AmplitudeApiKey = "";

// default thumbnails for fix address
export const ValidatorThumbnails: { [key: string]: string } = {
  oraivaloper1mxqeldsxg60t2y6gngpdm5jf3k96dnju5el96f:
    "https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png",
  oraivaloper1h89umsrsstyeuet8kllwvf2tp630n77aymck78:
    "https://res.cloudinary.com/oraichain/image/upload/v1645501963/stakeWithOraiKingLogo.jpg",
  oraivaloper1xesqr8vjvy34jhu027zd70ypl0nnev5euy9nyl:
    "https://res.cloudinary.com/oraichain/image/upload/v1645432916/synergy.jpg",
  oraivaloper1uhcwtfntsvk8gpwfxltesyl4e28aalmq9v9z0x:
    "https://res.cloudinary.com/dcpwvhglr/image/upload/v1611912662/Superman_4_-_SAL_L_nwykie.jpg",
  oraivaloper1cp0jml5fxkdvmajcwvkue9d0sym6s0vqly88hg:
    "https://res.cloudinary.com/oraichain/image/upload/v1645501939/stakement_orai_explorer.jpg",
  oraivaloper1u2344d8jwtsx5as7u5jw7vel28puh34q7d3y64:
    "https://res.cloudinary.com/oraichain/image/upload/v1645502101/titan.jpg",
  oraivaloper130jsl66rgss6eq7qur02yfr6tzppdvxglz7n7g:
    "https://res.cloudinary.com/oraichain/image/upload/v1645501772/vaiot.png",
  oraivaloper14nz2pqskfv9kcez8u0a9gnnsgwjerzqxpmne0y:
    "https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png",
  oraivaloper16e6cpk6ycddk6208fpaya7tmmardhvr7h40yqy:
    "https://res.cloudinary.com/c-ng-ty-c-ph-n-rikkeisoft/image/upload/v1616749893/photo_2021-03-25_18-39-37_tqfsof.jpg",
  oraivaloper12ru3276mkzuuay6vhmg3t6z9hpvrsnplm2994n:
    "https://res.cloudinary.com/oraichain/image/upload/v1645502148/binnostakeLogo.png",
  oraivaloper1kh9vejqxqqccavtv2nf683mx0z85mfpd7q566q:
    "https://res.cloudinary.com/c-ng-ty-c-ph-n-rikkeisoft/image/upload/v1616994377/lux_logo_small_1_nvwpdi.png",
  oraivaloper109vcny07r3waj9sld4ejasjyal0rudskeax7uc:
    "https://res.cloudinary.com/oraichain/image/upload/v1645502209/chandraLogo.png",
  oraivaloper13ckyvg0ah9vuujtd49yner2ky92lej6nwjvrjv:
    "https://res.cloudinary.com/oraichain/image/upload/v1645501901/antOraiLogo.jpg",
  oraivaloper1xsptthm2ylfw0salut97ldfan2jt032nye7s00:
    "https://images.airight.io/validator/62641351385ee5000118de9e.png",
  oraivaloper1f6q9wjn8qp3ll8y8ztd8290vtec2yxyxxygyy2:
    "https://res.cloudinary.com/oraichain/image/upload/v1646573946/Blockval.png",
  oraivaloper1h9gg3xavqdau6uy3r36vn4juvzsg0lqvszgtvc:
    "https://res.cloudinary.com/oraichain/image/upload/v1645502659/dime.jpg",
  oraivaloper1yc9nysml8dxy447hp3aytr0nssr9pd9a47l7gx:
    "https://res.cloudinary.com/oraichain/image/upload/v1645502169/oraiBotValidatorLogo.png",
  oraivaloper1mrv57zj3dpfyc9yd5xptnz2tqfez9fss4c9r85:
    "https://images.airight.io/validator/62555944385ee500012733f0.png",
  oraivaloper1v26tdegnk79edw7xkk2xh8qn89vy6qej6yhsev:
    "https://res.cloudinary.com/oraichain/image/upload/v1645502256/TrinityLogo.jpg",
  oraivaloper17zr98cwzfqdwh69r8v5nrktsalmgs5sa83gpd9:
    "https://images.airight.io/validator/623c45bd385ee50001437260.png",
  oraivaloper1qv5jn7tueeqw7xqdn5rem7s09n7zletreera88:
    "https://images.airight.io/validator/626d483a385ee5000162832e.png",
  oraivaloper10z9f6539v0ge78xlm4yh7tddrvw445s6d7s2xq:
    "https://images.airight.io/validator/627565f6385ee5000181e778.JPG",
  oraivaloper1ch3ewye24zm094ygmxu5e4z7d0xre3vhthctpn:
    "https://images.airight.io/validator/62686b04385ee5000162832c.jpg",
  oraivaloper1m2d5uhr65p9vvlw2w29kajud5q529a76v22wyu:
    "https://images.airight.io/validator/626c1920385ee5000162832d.jpg",
  oraivaloper1ucx0gm8kca2zvyr9d39z249j62y2t8r0rwtmr6:
    "https://res.cloudinary.com/oraichain/image/upload/v1646034968/strong_node.jpg",
  oraivaloper1g0hmvzs76akv6802x0he6ladjnftp94ygsf2lc:
    "https://images.airight.io/validator/627231c8385ee5000162832f.png",
  oraivaloper1rqq57xt5r5pnuguffcrltnvkul7n0jdxxdgey0:
    "https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png",
  oraivaloper1asz5wl5c2xt8y5kyp9r04v54zh77pq90qar7e8:
    "https://images.airight.io/validator/62729055385ee50001499911.png",
  oraivaloper1djm07np8dzyg4et3d7dqtr3692l80nggvl0edh:
    "https://images.airight.io/validator/625522ca385ee50001b67f29.png",
  oraivaloper14vcw5qk0tdvknpa38wz46js5g7vrvut8ku5kaa:
    "https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png",
};

export const unknownToken: Currency = {
  coinDecimals: 6,
  coinImageUrl: "https://img.icons8.com/pulsar-gradient/96/help.png",
  coinGeckoId: "unknown",
  coinMinimalDenom: "unknown",
  coinDenom: "UNKNOWN",
};

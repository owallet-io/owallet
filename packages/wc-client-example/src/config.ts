import { Bech32Address } from "@owallet/cosmos";

export const EmbedChainInfos = [
  {
    rpc: "https://rpc-cosmos.oraidex.io",
    rest: "https://lcd-cosmos.oraidex.io",
    chainId: "cosmoshub-4",
    chainName: "Cosmos",
    stakeCurrency: {
      coinDenom: "ATOM",
      coinMinimalDenom: "uatom",
      coinDecimals: 6,
      coinGeckoId: "cosmos",
    },
    walletUrl:
      process.env["NODE_ENV"] === "production"
        ? "https://wallet.keplr.app/chains/cosmos-hub"
        : "http://localhost:8081/chains/cosmos-hub",
    walletUrlForStaking:
      process.env["NODE_ENV"] === "production"
        ? "https://wallet.keplr.app/chains/cosmos-hub"
        : "http://localhost:8081/chains/cosmos-hub",
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
    coinType: 118,
    features: ["stargate", "ibc-transfer"],
  },
  {
    rpc: "https://osmosis.rpc.orai.io",
    rest: "https://osmosis.lcd.orai.io",
    chainId: "osmosis-1",
    chainName: "Osmosis",
    stakeCurrency: {
      coinDenom: "OSMO",
      coinMinimalDenom: "uosmo",
      coinDecimals: 6,
      coinGeckoId: "osmosis",
    },
    walletUrl:
      process.env["NODE_ENV"] === "production"
        ? "https://app.osmosis.zone"
        : "https://app.osmosis.zone",
    walletUrlForStaking:
      process.env["NODE_ENV"] === "production"
        ? "https://wallet.keplr.app/chains/osmosis"
        : "http://localhost:8081/chains/osmosis",
    bip44: { coinType: 118 },
    bech32Config: Bech32Address.defaultBech32Config("osmo"),
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
      },
    ],
    gasPriceStep: {
      low: 0,
      average: 0.025,
      high: 0.035,
    },
    features: ["stargate", "ibc-transfer"],
  },
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
];

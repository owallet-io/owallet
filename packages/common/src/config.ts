import { Bech32Address } from '@owallet/cosmos';
import { AppChainInfo } from '@owallet/types';
import { IntlMessages, TypeLanguageToFiatCurrency } from './languages';
import { FiatCurrency } from '@owallet/types';

export const AutoFetchingFiatValueInterval = 300 * 1000; // 5min

export const AutoFetchingAssetsInterval = 15 * 1000; // 15sec

export const FiatCurrencies: FiatCurrency[] = [
  {
    currency: 'usd',
    symbol: '$',
    maxDecimals: 2,
    locale: 'en-US'
  },
  {
    currency: 'eur',
    symbol: '€',
    maxDecimals: 2,
    locale: 'de-DE'
  },
  {
    currency: 'gbp',
    symbol: '£',
    maxDecimals: 2,
    locale: 'en-GB'
  },
  {
    currency: 'cad',
    symbol: 'CA$',
    maxDecimals: 2,
    locale: 'en-CA'
  },
  {
    currency: 'aud',
    symbol: 'AU$',
    maxDecimals: 2,
    locale: 'en-AU'
  },
  {
    currency: 'rub',
    symbol: '₽',
    maxDecimals: 0,
    locale: 'ru'
  },
  {
    currency: 'krw',
    symbol: '₩',
    maxDecimals: 0,
    locale: 'ko-KR'
  },
  {
    currency: 'hkd',
    symbol: 'HK$',
    maxDecimals: 1,
    locale: 'en-HK'
  },
  {
    currency: 'cny',
    symbol: '¥',
    maxDecimals: 1,
    locale: 'zh-CN'
  },
  {
    currency: 'jpy',
    symbol: '¥',
    maxDecimals: 0,
    locale: 'ja-JP'
  },
  {
    currency: 'inr',
    symbol: '₹',
    maxDecimals: 1,
    locale: 'en-IN'
  }
];

export const LanguageToFiatCurrency: TypeLanguageToFiatCurrency = {
  default: 'usd',
  ko: 'krw',
  vi: 'vnd'
};

export const AdditonalIntlMessages: IntlMessages = {};

// coingecko api for both evm and cosmos based networks
export const CoinGeckoAPIEndPoint = 'https://api.coingecko.com/api/v3';
export const MarketAPIEndPoint = 'https://price.market.orai.io';

export const EthereumEndpoint = 'https://mainnet.infura.io/v3/eeb00e81cdb2410098d5a270eff9b341';

export const CoinGeckoGetPrice = '/simple/price';

// default networks
export const EmbedChainInfos: AppChainInfo[] = [
  {
    rpc: 'https://rpc.orai.io',
    rest: 'https://lcd.orai.io',
    chainId: 'Oraichain',
    chainName: 'Oraichain',
    networkType: 'cosmos',
    stakeCurrency: {
      coinDenom: 'ORAI',
      coinMinimalDenom: 'orai',
      coinDecimals: 6,
      coinGeckoId: 'oraichain-token',
      coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png',
      gasPriceStep: {
        low: 0.003,
        average: 0.005,
        high: 0.007
      }
    },
    bip44: {
      coinType: 118
    },
    coinType: 118,
    bech32Config: Bech32Address.defaultBech32Config('orai'),
    get currencies() {
      return [
        this.stakeCurrency,
        {
          type: 'cw20',
          coinDenom: 'AIRI',
          coinMinimalDenom: 'cw20:orai10ldgzued6zjp0mkqwsv2mux3ml50l97c74x8sg:aiRight Token',
          contractAddress: 'orai10ldgzued6zjp0mkqwsv2mux3ml50l97c74x8sg',
          coinDecimals: 6,
          coinGeckoId: 'airight',
          coinImageUrl: 'https://i.ibb.co/m8mCyMr/airi.png'
        },
        {
          type: 'cw20',
          coinDenom: 'oBTC',
          coinMinimalDenom: 'cw20:orai1d2hq8pzf0nswlqhhng95hkfnmgutpmz6g8hd8q7ec9q9pj6t3r2q7vc646:oBTC Token',
          contractAddress: 'orai1d2hq8pzf0nswlqhhng95hkfnmgutpmz6g8hd8q7ec9q9pj6t3r2q7vc646',
          coinDecimals: 6,
          coinGeckoId: 'bitcoin',
          coinImageUrl: 'https://i.ibb.co/NVP6CDZ/images-removebg-preview.png'
        },
        {
          type: 'cw20',
          coinDenom: 'ORAIX',
          coinMinimalDenom: 'cw20:orai1lus0f0rhx8s03gdllx2n6vhkmf0536dv57wfge:OraiDex Token',
          contractAddress: 'orai1lus0f0rhx8s03gdllx2n6vhkmf0536dv57wfge',
          coinDecimals: 6,
          coinGeckoId: 'oraidex',
          coinImageUrl: 'https://i.ibb.co/VmMJtf7/oraix.png'
        },
        {
          type: 'cw20',
          coinDenom: 'USDT',
          coinMinimalDenom: 'cw20:orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh:Tether',
          contractAddress: 'orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh',
          coinDecimals: 6,
          coinGeckoId: 'tether',
          coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
        },
        {
          type: 'cw20',
          coinDenom: 'USDC',
          coinMinimalDenom: 'cw20:orai15un8msx3n5zf9ahlxmfeqd2kwa5wm0nrpxer304m9nd5q6qq0g6sku5pdd:USDC',
          contractAddress: 'orai15un8msx3n5zf9ahlxmfeqd2kwa5wm0nrpxer304m9nd5q6qq0g6sku5pdd',
          coinDecimals: 6,
          coinGeckoId: 'usd-coin',
          coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
        },
        {
          type: 'cw20',
          coinDenom: 'wTRX',
          coinMinimalDenom: 'cw20:orai1c7tpjenafvgjtgm9aqwm7afnke6c56hpdms8jc6md40xs3ugd0es5encn0:wTRX',
          contractAddress: 'orai1c7tpjenafvgjtgm9aqwm7afnke6c56hpdms8jc6md40xs3ugd0es5encn0',
          coinDecimals: 6,
          coinGeckoId: 'tron',
          coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png'
        },
        {
          type: 'cw20',
          coinDenom: 'INJ',
          coinMinimalDenom: 'cw20:orai19rtmkk6sn4tppvjmp5d5zj6gfsdykrl5rw2euu5gwur3luheuuusesqn49:INJ',
          contractAddress: 'orai19rtmkk6sn4tppvjmp5d5zj6gfsdykrl5rw2euu5gwur3luheuuusesqn49',
          coinDecimals: 6,
          coinGeckoId: 'injective-protocol',
          coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7226.png'
        },
        {
          type: 'cw20',
          coinDenom: 'KWT',
          coinMinimalDenom: 'cw20:orai1nd4r053e3kgedgld2ymen8l9yrw8xpjyaal7j5:Kawaii Islands',
          contractAddress: 'orai1nd4r053e3kgedgld2ymen8l9yrw8xpjyaal7j5',
          coinDecimals: 6,
          coinGeckoId: 'kawaii-islands',
          coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/12313.png'
        },
        {
          type: 'cw20',
          coinDenom: 'MILKY',
          coinMinimalDenom: 'cw20:orai1gzvndtzceqwfymu2kqhta2jn6gmzxvzqwdgvjw:Milky Token',
          contractAddress: 'orai1gzvndtzceqwfymu2kqhta2jn6gmzxvzqwdgvjw',
          coinDecimals: 6,
          coinGeckoId: 'milky-token',
          coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/14418.png'
        },
        {
          coinDenom: 'WETH',
          coinGeckoId: 'weth',
          coinMinimalDenom: 'weth',
          type: 'cw20',
          contractAddress: 'orai1dqa52a7hxxuv8ghe7q5v0s36ra0cthea960q2cukznleqhk0wpnshfegez',
          coinDecimals: 6,
          coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png'
        }
      ];
    },
    get feeCurrencies() {
      return [this.stakeCurrency];
    },
    features: ['stargate', 'ibc-transfer', 'cosmwasm', 'no-legacy-stdTx'],
    chainSymbolImageUrl: 'https://orai.io/images/logos/logomark-dark.png',
    txExplorer: {
      name: 'Oraiscan',
      txUrl: 'https://scan.orai.io/txs/{txHash}',
      accountUrl: 'https://scan.orai.io/account/{address}'
    }
    // beta: true // use v1beta1
  },
  {
    rpc: 'https://testnet-rpc.orai.io',
    rest: 'https://testnet-lcd.orai.io',
    chainId: 'Oraichain-testnet',
    chainName: 'Oraichain-testnet',
    networkType: 'cosmos',
    stakeCurrency: {
      coinDenom: 'ORAI',
      coinMinimalDenom: 'orai',
      coinDecimals: 6,
      coinGeckoId: 'oraichain-token',
      coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png',
      gasPriceStep: {
        low: 0.003,
        average: 0.005,
        high: 0.007
      }
    },
    bip44: {
      coinType: 118
    },
    coinType: 118,
    bech32Config: Bech32Address.defaultBech32Config('orai'),
    get currencies() {
      return [this.stakeCurrency];
    },
    get feeCurrencies() {
      return [this.stakeCurrency];
    },
    features: ['stargate', 'no-legacy-stdTx', 'ibc-transfer', 'cosmwasm'],
    chainSymbolImageUrl: 'https://orai.io/images/logos/logomark-dark.png',
    txExplorer: {
      name: 'Oraiscan',
      txUrl: 'https://testnet.scan.orai.io/txs/{txHash}',
      accountUrl: 'https://testnet.scan.orai.io/account/{address}'
    }
    // beta: true // use v1beta1
  },
  {
    rpc: 'https://injective-rpc-global.orai.io',
    rest: 'https://sentry.lcd.injective.network',
    chainId: 'injective-1',
    chainName: 'Injective',
    networkType: 'cosmos',
    stakeCurrency: {
      coinDenom: 'INJ',
      coinMinimalDenom: 'inj',
      coinDecimals: 18,
      coinGeckoId: 'injective-protocol',
      coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png',
      gasPriceStep: {
        low: 5000000000,
        average: 25000000000,
        high: 50000000000
      }
    },
    bip44: {
      coinType: 60
    },
    gasPriceStep: {
      low: 5000000000,
      average: 25000000000,
      high: 50000000000
    },
    coinType: 60,
    bech32Config: Bech32Address.defaultBech32Config('inj'),
    get currencies() {
      return [this.stakeCurrency];
    },
    get feeCurrencies() {
      return [this.stakeCurrency];
    },
    features: ['no-legacy-stdTx', 'ibc-transfer', 'ibc-go', 'eth-key-sign'],
    chainSymbolImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7226.png',
    txExplorer: {
      name: 'Injective',
      txUrl: 'https://explorer.injective.network/transaction/{txHash}'
    },
    beta: true
  },

  {
    chainId: 'oraibridge-subnet-2',
    chainName: 'OraiBridge',
    rpc: 'https://bridge-v2.rpc.orai.io',
    rest: 'https://bridge-v2.lcd.orai.io',
    networkType: 'cosmos',
    stakeCurrency: {
      coinDenom: 'ORAIB',
      coinMinimalDenom: 'uoraib',
      coinDecimals: 6,
      gasPriceStep: {
        low: 0,
        average: 0,
        high: 0
      }
    },
    bip44: {
      coinType: 118
    },
    coinType: 118,
    bech32Config: Bech32Address.defaultBech32Config('oraib'),
    // List of all coin/tokens used in this chain.
    get currencies() {
      return [
        this.stakeCurrency,
        {
          coinDenom: 'BEP20 ORAI',
          coinMinimalDenom: 'oraib0xA325Ad6D9c92B55A3Fc5aD7e412B1518F96441C0',
          coinDecimals: 18,
          coinGeckoId: 'oraichain-token',
          coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png'
        },
        {
          coinDenom: 'BEP20 AIRI',
          coinMinimalDenom: 'oraib0x7e2A35C746F2f7C240B664F1Da4DD100141AE71F',
          coinDecimals: 18,
          coinGeckoId: 'airight',
          coinImageUrl: 'https://i.ibb.co/m8mCyMr/airi.png'
        },
        {
          coinDenom: 'BEP20 KWT',
          coinMinimalDenom: 'oraib0x257a8d1E03D17B8535a182301f15290F11674b53',
          coinDecimals: 18,
          coinGeckoId: 'kawaii-islands',
          coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/12313.png'
        },
        {
          coinDenom: 'BEP20 MILKY',
          coinMinimalDenom: 'oraib0x6fE3d0F096FC932A905accd1EB1783F6e4cEc717',
          coinDecimals: 18,
          coinGeckoId: 'milky-token',
          coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/14418.png'
        },
        {
          coinDenom: 'BEP20 USDT',
          coinMinimalDenom: 'oraib0x55d398326f99059fF775485246999027B3197955',
          coinDecimals: 18,
          coinGeckoId: 'tether',
          coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
        }
      ];
    },
    get feeCurrencies() {
      return [this.stakeCurrency];
    },
    features: ['stargate', 'ibc-transfer', 'cosmwasm']
  },
  {
    chainId: 'oraibtc-subnet-1',
    chainName: 'OraiBtc Bridge',
    rpc: 'https://oraibtc.rpc.orai.io',
    rest: 'https://oraibtc.lcd.orai.io',
    networkType: 'cosmos',
    stakeCurrency: {
      coinDenom: 'ORAIBTC',
      coinMinimalDenom: 'uoraibtc',
      coinDecimals: 6,
      gasPriceStep: {
        low: 0,
        average: 0,
        high: 0
      },
      coinImageUrl: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png'
    },
    bip44: {
      coinType: 118
    },
    coinType: 118,
    bech32Config: Bech32Address.defaultBech32Config('oraibtc'),
    // List of all coin/tokens used in this chain.
    get currencies() {
      return [
        this.stakeCurrency,
        {
          coinDenom: 'oBTC',
          coinMinimalDenom: 'usat',
          coinDecimals: 14,
          gasPriceStep: {
            low: 0,
            average: 0,
            high: 0
          },
          coinImageUrl: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png'
        }
      ];
    },
    get feeCurrencies() {
      return [
        this.stakeCurrency,
        {
          coinDenom: 'oBTC',
          coinMinimalDenom: 'usat',
          coinDecimals: 14,
          gasPriceStep: {
            low: 0,
            average: 0,
            high: 0
          },
          coinImageUrl: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png'
        }
      ];
    },
    features: ['stargate', 'ibc-transfer', 'cosmwasm']
  },
  {
    rpc: 'https://tendermint1.kawaii.global',
    evmRpc: 'https://endpoint1.kawaii.global',
    rest: 'https://cosmos1.kawaii.global',
    chainId: 'kawaii_6886-1',
    networkType: 'cosmos',
    chainName: 'Kawaiiverse Cosmos',
    stakeCurrency: {
      coinDenom: 'ORAIE',
      coinMinimalDenom: 'oraie',
      coinDecimals: 18,
      coinGeckoId: 'oraie',
      gasPriceStep: {
        low: 0,
        average: 0.000025,
        high: 0.00004
      }
    },
    bip44: {
      coinType: 60
    },
    coinType: 60,
    bech32Config: Bech32Address.defaultBech32Config('oraie'),
    get currencies() {
      return [
        this.stakeCurrency,
        {
          coinDenom: 'KWT',
          coinMinimalDenom: 'erc20:0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd:Kawaii Islands',
          coinDecimals: 18,
          coinGeckoId: 'kawaii-islands',
          coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/12313.png'
        },
        {
          coinDenom: 'MILKY',
          coinMinimalDenom: 'erc20:0xd567B3d7B8FE3C79a1AD8dA978812cfC4Fa05e75:Milky Token',
          coinDecimals: 18,
          coinGeckoId: 'milky-token',
          coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/14418.png'
        }
      ];
    },
    get feeCurrencies() {
      return [this.stakeCurrency];
    },
    // features: ['ibc-transfer', 'ibc-go', 'stargate']
    features: ['isEvm'],
    txExplorer: {
      name: 'Kawaii',
      txUrl: 'https://scan.kawaii.global/tx/{txHash}'
    }
  },
  {
    rpc: 'https://tendermint1.kawaii.global',
    rest: 'https://endpoint1.kawaii.global',
    chainId: '0x1ae6',
    networkType: 'evm',
    chainName: 'Kawaiiverse EVM',
    stakeCurrency: {
      coinDenom: 'ORAIE',
      coinMinimalDenom: 'oraie',
      coinDecimals: 18,
      coinGeckoId: 'oraie',
      gasPriceStep: {
        low: 0,
        average: 0.000025,
        high: 0.00004
      }
    },
    bip44: {
      coinType: 60
    },
    coinType: 60,
    bech32Config: Bech32Address.defaultBech32Config('evmos'),
    get currencies() {
      return [
        this.stakeCurrency,
        {
          coinDenom: 'KWT',
          coinMinimalDenom: 'erc20:0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd:Kawaii Islands',
          coinDecimals: 18,
          coinGeckoId: 'kawaii-islands',
          coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/12313.png'
        },
        {
          coinDenom: 'MILKY',
          coinMinimalDenom: 'erc20:0xd567B3d7B8FE3C79a1AD8dA978812cfC4Fa05e75:Milky Token',
          coinDecimals: 18,
          coinGeckoId: 'milky-token',
          coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/14418.png'
        }
      ];
    },
    get feeCurrencies() {
      return [this.stakeCurrency];
    },
    features: ['isEvm']
  },
  {
    rpc: 'https://rpc-cosmos.oraidex.io',
    rest: 'https://lcd-cosmos.oraidex.io',
    chainId: 'cosmoshub-4',
    chainName: 'Cosmos Hub',
    networkType: 'cosmos',
    stakeCurrency: {
      coinDenom: 'ATOM',
      coinMinimalDenom: 'uatom',
      coinDecimals: 6,
      coinGeckoId: 'cosmos',
      coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/atom.png',
      gasPriceStep: {
        low: 0,
        average: 0.025,
        high: 0.04
      }
    },
    bip44: {
      coinType: 118
    },
    bech32Config: Bech32Address.defaultBech32Config('cosmos'),
    currencies: [
      {
        coinDenom: 'ATOM',
        coinMinimalDenom: 'uatom',
        coinDecimals: 6,
        coinGeckoId: 'cosmos',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/atom.png'
      }
    ],
    get feeCurrencies() {
      return [this.stakeCurrency];
    },
    coinType: 118,
    features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx', 'ibc-go'],
    chainSymbolImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/atom.png',
    txExplorer: {
      name: 'Mintscan',
      txUrl: 'https://www.mintscan.io/cosmos/txs/{txHash}'
    }
  },

  {
    rpc: 'https://rpc.cosmos.directory/osmosis',
    rest: 'https://rest.cosmos.directory/osmosis',
    chainId: 'osmosis-1',
    chainName: 'Osmosis',
    networkType: 'cosmos',
    stakeCurrency: {
      coinDenom: 'OSMO',
      coinMinimalDenom: 'uosmo',
      coinDecimals: 6,
      coinGeckoId: 'osmosis',
      coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/osmo.png',
      gasPriceStep: {
        low: 0,
        average: 0.025,
        high: 0.04
      }
    },
    bip44: {
      coinType: 118
    },
    bech32Config: Bech32Address.defaultBech32Config('osmo'),
    currencies: [
      {
        coinDenom: 'OSMO',
        coinMinimalDenom: 'uosmo',
        coinDecimals: 6,
        coinGeckoId: 'osmosis',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/osmo.png'
      },
      {
        coinDenom: 'ION',
        coinMinimalDenom: 'uion',
        coinDecimals: 6,
        coinGeckoId: 'ion',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/osmosis-ion.png'
      }
    ],
    get feeCurrencies() {
      return [this.stakeCurrency];
    },
    coinType: 118,
    features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx', 'ibc-go'],
    chainSymbolImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/osmo.png',
    txExplorer: {
      name: 'Mintscan',
      txUrl: 'https://www.mintscan.io/osmosis/txs/{txHash}'
    }
  },
  {
    chainId: 'nomic-stakenet-3',
    chainName: 'Nomic Stakenet 3',
    rpc: 'https://stakenet-rpc.nomic.io:2096',
    rest: 'https://app.nomic.io:8443',
    bip44: {
      coinType: 118
    },
    bech32Config: {
      bech32PrefixAccAddr: 'nomic',
      bech32PrefixAccPub: 'nomicpub',
      bech32PrefixValAddr: 'nomicvaloper',
      bech32PrefixValPub: 'nomicvaloperpub',
      bech32PrefixConsAddr: 'nomicvalcons',
      bech32PrefixConsPub: 'nomicvalconspub'
    },
    currencies: [
      {
        coinDenom: 'NOM',
        coinMinimalDenom: 'unom',
        coinDecimals: 6,
        coinImageUrl: 'https://i.ibb.co/X4gbpMG/download-removebg-preview-1.png'
      },
      {
        coinDenom: 'nBTC',
        coinMinimalDenom: 'uSAT',
        coinDecimals: 14,
        coinGeckoId: 'bitcoin',
        coinImageUrl: 'https://i.ibb.co/NVP6CDZ/images-removebg-preview.png'
      }
    ],
    feeCurrencies: [
      {
        coinDenom: 'NOM',
        coinMinimalDenom: 'unom',
        coinDecimals: 6,
        coinImageUrl: 'https://i.ibb.co/X4gbpMG/download-removebg-preview-1.png',
        gasPriceStep: {
          low: 0,
          average: 0,
          high: 0
        }
      }
    ],
    stakeCurrency: {
      coinDenom: 'NOM',
      coinMinimalDenom: 'unom',
      coinDecimals: 6,
      coinImageUrl: 'https://i.ibb.co/X4gbpMG/download-removebg-preview-1.png'
    },
    coinType: 119,
    networkType: 'cosmos',
    features: ['stargate'],
    beta: true
  },
  // {
  //   chainId: 'nomic-testnet-4d',
  //   chainName: 'Nomic Testnet 4d',
  //   rpc: 'https://testnet-rpc.nomic.io:2096',
  //   rest: 'https://testnet-api.nomic.io:8443',
  //   networkType: 'cosmos',
  //   bip44: {
  //     coinType: 118
  //   },
  //   bech32Config: {
  //     bech32PrefixAccAddr: 'nomic',
  //     bech32PrefixAccPub: 'nomicpub',
  //     bech32PrefixValAddr: 'nomicvaloper',
  //     bech32PrefixValPub: 'nomicvaloperpub',
  //     bech32PrefixConsAddr: 'nomicvalcons',
  //     bech32PrefixConsPub: 'nomicvalconspub'
  //   },
  //   currencies: [
  //     {
  //       coinDenom: 'NOM',
  //       coinMinimalDenom: 'unom',
  //       coinDecimals: 6,
  //       coinImageUrl: 'https://i.ibb.co/X4gbpMG/download-removebg-preview-1.png'
  //     },
  //     {
  //       coinDenom: 'nBTC',
  //       coinMinimalDenom: 'uSAT',
  //       coinDecimals: 14,
  //       coinGeckoId: 'bitcoin',
  //       coinImageUrl: 'https://i.ibb.co/NVP6CDZ/images-removebg-preview.png'
  //     }
  //   ],
  //   feeCurrencies: [
  //     {
  //       coinDenom: 'NOM',
  //       coinMinimalDenom: 'unom',
  //       coinDecimals: 6,
  //       coinImageUrl: 'https://i.ibb.co/X4gbpMG/download-removebg-preview-1.png',
  //       gasPriceStep: {
  //         low: 0,
  //         average: 0,
  //         high: 0
  //       }
  //     }
  //   ],
  //   stakeCurrency: {
  //     coinDenom: 'NOM',
  //     coinMinimalDenom: 'unom',
  //     coinDecimals: 6,
  //     coinImageUrl: 'https://i.ibb.co/X4gbpMG/download-removebg-preview-1.png'
  //   },
  //   coinType: 119,
  //   features: ['stargate'],
  //   beta: true
  // },
  {
    rpc: 'https://rpc-juno.keplr.app',
    rest: 'https://lcd-juno.keplr.app',
    chainId: 'juno-1',
    chainName: 'Juno',
    networkType: 'cosmos',
    stakeCurrency: {
      coinDenom: 'JUNO',
      coinMinimalDenom: 'ujuno',
      coinDecimals: 6,
      coinGeckoId: 'juno-network',
      coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/juno.png',
      gasPriceStep: {
        low: 0.001,
        average: 0.0025,
        high: 0.004
      }
    },
    bip44: {
      coinType: 118
    },
    bech32Config: Bech32Address.defaultBech32Config('juno'),
    currencies: [
      {
        coinDenom: 'JUNO',
        coinMinimalDenom: 'ujuno',
        coinDecimals: 6,
        coinGeckoId: 'juno-network',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/juno.png'
      }
    ],
    get feeCurrencies() {
      return [this.stakeCurrency];
    },
    features: ['stargate', 'no-legacy-stdTx', 'cosmwasm', 'ibc-transfer', 'ibc-go'],
    chainSymbolImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/juno.png',
    txExplorer: {
      name: 'Mintscan',
      txUrl: 'https://www.mintscan.io/juno/txs/{txHash}'
    }
  },
  {
    rpc: 'https://rpc-noble.keplr.app',
    rest: 'https://lcd-noble.keplr.app',
    chainId: 'noble-1',
    networkType: 'cosmos',
    chainName: 'Noble',
    stakeCurrency: {
      coinDenom: 'STAKE',
      coinMinimalDenom: 'ustake',
      coinDecimals: 6,
      gasPriceStep: {
        low: 1,
        average: 1.5,
        high: 2
      }
    },
    bip44: {
      coinType: 118
    },
    bech32Config: {
      bech32PrefixAccAddr: 'noble',
      bech32PrefixAccPub: 'noblepub',
      bech32PrefixValAddr: 'noblevaloper',
      bech32PrefixValPub: 'noblevaloperpub',
      bech32PrefixConsAddr: 'noblevalcons',
      bech32PrefixConsPub: 'noblevalconspub'
    },
    currencies: [
      {
        coinDenom: 'STAKE',
        coinMinimalDenom: 'ustake',
        coinDecimals: 6
      },
      {
        coinDenom: 'USDC',
        coinMinimalDenom: 'uusdc',
        coinDecimals: 6,
        coinGeckoId: 'usd-coin',
        coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
      }
    ],
    feeCurrencies: [
      {
        coinDenom: 'USDC',
        coinMinimalDenom: 'uusdc',
        coinDecimals: 6,
        coinGeckoId: 'usd-coin',
        coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
      },
      {
        coinDenom: 'ATOM',
        coinMinimalDenom: 'ibc/EF48E6B1A1A19F47ECAEA62F5670C37C0580E86A9E88498B7E393EB6F49F33C0',
        coinDecimals: 6,
        coinGeckoId: 'cosmos',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/atom.png',
        gasPriceStep: {
          low: 0.001,
          average: 0.001,
          high: 0.001
        }
      }
    ],

    features: ['stargate', 'ibc-transfer', 'cosmwasm', 'no-legacy-stdTx'],
    txExplorer: {
      name: 'Mintscan',
      txUrl: 'https://www.mintscan.io/noble/txs/{txHash}',
      accountUrl: 'https://www.mintscan.io/noble/address/{address}'
    }
  },
  {
    rest: 'https://blockstream.info/testnet/api',
    chainId: 'bitcoinTestnet',
    chainName: 'Bitcoin Testnet',
    bip44: {
      coinType: 1
    },
    coinType: 1,
    stakeCurrency: {
      coinDenom: 'BTC',
      coinMinimalDenom: 'btc',
      coinDecimals: 8,
      coinGeckoId: 'bitcoin',
      coinImageUrl: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
      gasPriceStep: {
        low: 25,
        average: 18,
        high: 1
      }
    },
    bech32Config: Bech32Address.defaultBech32Config('tb'),
    networkType: 'bitcoin',
    currencies: [
      {
        coinDenom: 'BTC',
        coinMinimalDenom: 'btc',
        coinDecimals: 8,
        coinGeckoId: 'bitcoin',
        coinImageUrl: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png'
      }
    ],
    get feeCurrencies() {
      return this.currencies;
    },
    features: ['isBtc'],
    txExplorer: {
      name: 'BlockStream',
      txUrl: 'https://blockstream.info/testnet/tx/{txHash}',
      accountUrl: 'https://blockstream.info/testnet/address/{address}'
    }
  },
  {
    rest: 'https://blockstream.info/api',
    chainId: 'bitcoin',
    chainName: 'Bitcoin',
    bip44: {
      coinType: 0
    },
    coinType: 0,
    stakeCurrency: {
      coinDenom: 'BTC',
      coinMinimalDenom: 'btc',
      coinDecimals: 8,
      coinGeckoId: 'bitcoin',
      coinImageUrl: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
      gasPriceStep: {
        low: 144,
        average: 18,
        high: 1
      }
    },
    bech32Config: Bech32Address.defaultBech32Config('bc'),
    networkType: 'bitcoin',
    currencies: [
      {
        coinDenom: 'BTC',
        coinMinimalDenom: 'btc',
        coinDecimals: 8,
        coinGeckoId: 'bitcoin',
        coinImageUrl: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png'
      }
    ],
    get feeCurrencies() {
      return this.currencies;
    },

    features: ['isBtc'],
    txExplorer: {
      name: 'BlockStream',
      txUrl: 'https://blockstream.info/tx/{txHash}',
      accountUrl: 'https://blockstream.info/address/{address}'
    }
  },

  {
    rest: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    evmRpc: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    chainId: '0x61',
    chainName: 'BNB Chain Testnet',
    bip44: {
      coinType: 60
    },
    coinType: 60,
    stakeCurrency: {
      coinDenom: 'BNB',
      coinMinimalDenom: 'bnb',
      coinDecimals: 18,
      coinGeckoId: 'binancecoin',
      coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',
      gasPriceStep: {
        low: 10000000000,
        average: 25000000000,
        high: 40000000000
      }
    },
    bech32Config: Bech32Address.defaultBech32Config('evmos'),
    networkType: 'evm',
    currencies: [
      {
        coinDenom: 'BNB',
        coinMinimalDenom: 'bnb',
        coinDecimals: 18,
        coinGeckoId: 'binancecoin',
        coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png'
      },
      {
        coinDenom: 'ORAI',
        coinMinimalDenom: 'erc20:0x41E76b3b0Da96c14c4575d9aE96d73Acb6a0B903:Oraichain Token',
        coinDecimals: 18,
        coinGeckoId: 'oraichain-token',
        coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png'
      },
      {
        coinDenom: 'AIRI',
        coinMinimalDenom: 'erc20:0x7e2a35c746f2f7c240b664f1da4dd100141ae71f:aiRight Token',
        coinDecimals: 18,
        coinGeckoId: 'airight',
        coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11563.png'
      },
      {
        coinDenom: 'KWT',
        coinMinimalDenom: 'erc20:0x9da6e8a2065d5f09b9994ebc330a962721069a68:Kawaii Islands',
        coinDecimals: 18,
        coinGeckoId: 'kawaii-islands',
        coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/12313.png'
      }
    ],
    get feeCurrencies() {
      return [this.stakeCurrency];
    },
    features: ['isEvm'],
    txExplorer: {
      name: 'Bsc Scan Testnet',
      txUrl: 'https://testnet.bscscan.com/tx/{txHash}',
      accountUrl: 'https://testnet.bscscan.com/address/{address}'
    }
  },
  {
    rest: 'https://rpc.ankr.com/eth',
    chainId: '0x01',
    chainName: 'Ethereum',
    bip44: {
      coinType: 60
    },
    coinType: 60,
    stakeCurrency: {
      coinDenom: 'ETH',
      coinMinimalDenom: 'eth',
      coinDecimals: 18,
      coinGeckoId: 'ethereum',
      coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
      gasPriceStep: {
        low: 10000000000,
        average: 25000000000,
        high: 40000000000
      }
    },
    bech32Config: Bech32Address.defaultBech32Config('evmos'),
    networkType: 'evm',
    currencies: [
      {
        coinDenom: 'ETH',
        coinMinimalDenom: 'eth',
        coinDecimals: 18,
        coinGeckoId: 'ethereum',
        coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png'
      },
      {
        coinDenom: 'ORAI',
        coinMinimalDenom: 'erc20:0x4c11249814f11b9346808179cf06e71ac328c1b5:Oraichain Token',
        contractAddress: '0x4c11249814f11b9346808179cf06e71ac328c1b5',
        coinDecimals: 18,
        coinGeckoId: 'oraichain-token',
        coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png'
      }
    ],
    get feeCurrencies() {
      return [this.stakeCurrency];
    },

    features: ['ibc-go', 'stargate', 'isEvm'],
    txExplorer: {
      name: 'Etherscan',
      txUrl: 'https://etherscan.io/tx/{txHash}',
      accountUrl: 'https://etherscan.io/address/{address}'
    }
  },
  {
    rest: 'https://bsc-dataseed1.ninicoin.io',
    chainId: '0x38',
    chainName: 'BNB Chain',
    bip44: {
      coinType: 60
    },
    coinType: 60,
    stakeCurrency: {
      coinDenom: 'BNB',
      coinMinimalDenom: 'bnb',
      coinDecimals: 18,
      coinGeckoId: 'binancecoin',
      coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',
      gasPriceStep: {
        low: 10000000000,
        average: 25000000000,
        high: 40000000000
      }
    },
    bech32Config: Bech32Address.defaultBech32Config('evmos'),
    networkType: 'evm',
    currencies: [
      {
        coinDenom: 'BNB',
        coinMinimalDenom: 'bnb',
        coinDecimals: 18,
        coinGeckoId: 'binancecoin',
        coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png'
      },
      {
        coinDenom: 'ORAI',
        coinMinimalDenom: 'erc20:0xA325Ad6D9c92B55A3Fc5aD7e412B1518F96441C0:Oraichain Token',
        coinDecimals: 18,
        coinGeckoId: 'oraichain-token',
        coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png'
      },
      {
        coinDenom: 'AIRI',
        coinMinimalDenom: 'erc20:0x7e2a35c746f2f7c240b664f1da4dd100141ae71f:aiRight Token',
        coinDecimals: 18,
        coinGeckoId: 'airight',
        coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11563.png'
      },
      {
        coinDenom: 'KWT',
        coinMinimalDenom: 'erc20:0x257a8d1e03d17b8535a182301f15290f11674b53:Kawaii Islands',
        coinDecimals: 18,
        coinGeckoId: 'kawaii-islands',
        coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/12313.png'
      },
      {
        coinDenom: 'USDT',
        coinMinimalDenom: 'erc20:0x55d398326f99059fF775485246999027B3197955:Tether',
        coinDecimals: 18,
        coinGeckoId: 'tether',
        coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
      },
      {
        coinDenom: 'MILKY',
        coinMinimalDenom: 'erc20:0x6fE3d0F096FC932A905accd1EB1783F6e4cEc717:Milky Token',
        coinDecimals: 18,
        coinGeckoId: 'milky-token',
        coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/14418.png'
      }
    ],
    get feeCurrencies() {
      return [this.stakeCurrency];
    },

    features: ['ibc-go', 'stargate', 'isEvm'],
    txExplorer: {
      name: 'Bsc Scan Testnet',
      txUrl: 'https://bscscan.com/tx/${txHash}',
      accountUrl: 'https://bscscan.com/address/{address}'
    }
  },

  {
    rpc: 'https://api.trongrid.io',
    rest: 'https://api.trongrid.io/jsonrpc',
    chainId: '0x2b6653dc',
    networkType: 'evm',
    chainName: 'Tron',
    stakeCurrency: {
      coinDenom: 'TRX',
      coinMinimalDenom: 'trx',
      coinDecimals: 18,
      coinGeckoId: 'tron',
      coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png',
      gasPriceStep: {
        low: 420,
        average: 504,
        high: 672
      }
    },
    currencies: [
      {
        coinDenom: 'TRX',
        coinMinimalDenom: 'trx',
        coinDecimals: 18,
        coinGeckoId: 'tron',
        coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png'
      },
      {
        contractAddress: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8',
        coinDenom: 'USDC',
        coinMinimalDenom: 'usdc',
        coinGeckoId: 'usd-coin',
        coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
        coinDecimals: 6
      },
      {
        contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
        coinDenom: 'USDT',
        coinMinimalDenom: 'usdt',
        coinDecimals: 6,
        coinGeckoId: 'tether',
        coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
      }
    ],
    restConfig: {
      headers: {
        'x-api-key': 'e2e3f401-2137-409c-b821-bd8c29f2141c'
      }
    },
    bip44: {
      coinType: 195
    },
    coinType: 195,
    bech32Config: Bech32Address.defaultBech32Config('evmos'),
    get feeCurrencies() {
      return [this.stakeCurrency];
    },

    features: ['ibc-go', 'stargate', 'isEvm'],
    txExplorer: {
      name: 'Tronscan',
      txUrl: 'https://tronscan.org/#/transaction/{txHash}',
      accountUrl: 'https://tronscan.org/#/address/{address}'
    }
  },
  {
    rpc: 'https://sapphire.oasis.io',
    rest: 'https://sapphire.oasis.io',
    grpc: 'https://grpc.oasis.dev',
    chainId: 'native-0x5afe',
    networkType: 'evm',
    chainName: 'Oasis',
    stakeCurrency: {
      coinDenom: 'ROSE',
      coinMinimalDenom: 'rose',
      coinDecimals: 9,
      coinGeckoId: 'oasis-network',
      coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png',
      gasPriceStep: {
        low: 0,
        average: 0,
        high: 0
      }
    },
    currencies: [
      {
        coinDenom: 'ROSE',
        coinMinimalDenom: 'rose',
        coinDecimals: 9,
        coinGeckoId: 'oasis-network',
        coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png'
      }
    ],
    restConfig: {},
    bip44: {
      coinType: 474
    },
    coinType: 474,
    bech32Config: Bech32Address.defaultBech32Config('oasis'),
    get feeCurrencies() {
      return [this.stakeCurrency];
    },

    features: ['ibc-go', 'stargate', 'isEvm'],
    txExplorer: {
      name: 'Oasis scan',
      txUrl: 'https://explorer.sapphire.oasis.io/{txHash}',
      accountUrl: 'https://explorer.sapphire.oasis.io/{address}'
    }
  },
  {
    rpc: 'https://sapphire.oasis.io',
    rest: 'https://sapphire.oasis.io',
    grpc: 'https://grpc.oasis.dev',
    chainId: '0x5afe',
    chainName: 'Oasis Sapphire',
    bip44: {
      coinType: 60
    },
    coinType: 60,
    stakeCurrency: {
      coinDenom: 'ROSE',
      coinMinimalDenom: 'rose',
      coinDecimals: 18,
      coinGeckoId: 'oasis-network',
      coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png',
      gasPriceStep: {
        low: 420,
        average: 504,
        high: 672
      }
    },
    bech32Config: Bech32Address.defaultBech32Config('evmos'),
    networkType: 'evm',
    currencies: [
      {
        coinDenom: 'ROSE',
        coinMinimalDenom: 'rose',
        coinDecimals: 18,
        coinGeckoId: 'oasis-network',
        coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png'
      }
    ],
    get feeCurrencies() {
      return [this.stakeCurrency];
    },

    features: ['ibc-go', 'stargate', 'isEvm'],
    txExplorer: {
      name: 'Oasis Saphire Scan',
      txUrl: 'https://explorer.sapphire.oasis.io/tx/{txHash}',
      accountUrl: 'https://explorer.sapphire.oasis.io/address/{address}'
    }
  },
  {
    rpc: 'https://emerald.oasis.dev',
    rest: 'https://emerald.oasis.dev',
    grpc: 'https://grpc.oasis.dev',
    chainId: '0xa516',
    chainName: 'Oasis Emerald',
    bip44: {
      coinType: 60
    },
    coinType: 60,
    stakeCurrency: {
      coinDenom: 'ROSE',
      coinMinimalDenom: 'rose',
      coinDecimals: 18,
      coinGeckoId: 'oasis-network',
      coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png',
      gasPriceStep: {
        low: 420,
        average: 504,
        high: 672
      }
    },
    bech32Config: Bech32Address.defaultBech32Config('evmos'),
    networkType: 'evm',
    currencies: [
      {
        coinDenom: 'ROSE',
        coinMinimalDenom: 'rose',
        coinDecimals: 18,
        coinGeckoId: 'oasis-network',
        coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png'
      }
    ],
    get feeCurrencies() {
      return [this.stakeCurrency];
    },

    features: ['ibc-go', 'stargate', 'isEvm'],
    txExplorer: {
      name: 'Oasis Emerald Scan',
      txUrl: 'https://explorer.emerald.oasis.dev/tx/{txHash}',
      accountUrl: 'https://explorer.emerald.oasis.dev/address/{address}'
    }
  }
];

// The origins that are able to pass any permission that external webpages can have.
export const PrivilegedOrigins: string[] = ['https://app.osmosis.zone', 'https://oraidex.io'];

// tracking ads
export const AmplitudeApiKey = '879f08e23ff5926be676c19157bc4fd4';

// default thumbnails for fix address
export const ValidatorThumbnails: { [key: string]: string } = {
  oraivaloper1mxqeldsxg60t2y6gngpdm5jf3k96dnju5el96f: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png',
  oraivaloper1h89umsrsstyeuet8kllwvf2tp630n77aymck78:
    'https://res.cloudinary.com/oraichain/image/upload/v1645501963/stakeWithOraiKingLogo.jpg',
  oraivaloper1xesqr8vjvy34jhu027zd70ypl0nnev5euy9nyl:
    'https://res.cloudinary.com/oraichain/image/upload/v1645432916/synergy.jpg',
  oraivaloper1uhcwtfntsvk8gpwfxltesyl4e28aalmq9v9z0x:
    'https://res.cloudinary.com/dcpwvhglr/image/upload/v1611912662/Superman_4_-_SAL_L_nwykie.jpg',
  oraivaloper1cp0jml5fxkdvmajcwvkue9d0sym6s0vqly88hg:
    'https://res.cloudinary.com/oraichain/image/upload/v1645501939/stakement_orai_explorer.jpg',
  oraivaloper1u2344d8jwtsx5as7u5jw7vel28puh34q7d3y64:
    'https://res.cloudinary.com/oraichain/image/upload/v1645502101/titan.jpg',
  oraivaloper130jsl66rgss6eq7qur02yfr6tzppdvxglz7n7g:
    'https://res.cloudinary.com/oraichain/image/upload/v1645501772/vaiot.png',
  oraivaloper14nz2pqskfv9kcez8u0a9gnnsgwjerzqxpmne0y: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png',
  oraivaloper16e6cpk6ycddk6208fpaya7tmmardhvr7h40yqy:
    'https://res.cloudinary.com/c-ng-ty-c-ph-n-rikkeisoft/image/upload/v1616749893/photo_2021-03-25_18-39-37_tqfsof.jpg',
  oraivaloper12ru3276mkzuuay6vhmg3t6z9hpvrsnplm2994n:
    'https://res.cloudinary.com/oraichain/image/upload/v1645502148/binnostakeLogo.png',
  oraivaloper1kh9vejqxqqccavtv2nf683mx0z85mfpd7q566q:
    'https://res.cloudinary.com/c-ng-ty-c-ph-n-rikkeisoft/image/upload/v1616994377/lux_logo_small_1_nvwpdi.png',
  oraivaloper109vcny07r3waj9sld4ejasjyal0rudskeax7uc:
    'https://res.cloudinary.com/oraichain/image/upload/v1645502209/chandraLogo.png',
  oraivaloper13ckyvg0ah9vuujtd49yner2ky92lej6nwjvrjv:
    'https://res.cloudinary.com/oraichain/image/upload/v1645501901/antOraiLogo.jpg',
  oraivaloper1xsptthm2ylfw0salut97ldfan2jt032nye7s00:
    'https://images.airight.io/validator/62641351385ee5000118de9e.png',
  oraivaloper1f6q9wjn8qp3ll8y8ztd8290vtec2yxyxxygyy2:
    'https://res.cloudinary.com/oraichain/image/upload/v1646573946/Blockval.png',
  oraivaloper1h9gg3xavqdau6uy3r36vn4juvzsg0lqvszgtvc:
    'https://res.cloudinary.com/oraichain/image/upload/v1645502659/dime.jpg',
  oraivaloper1yc9nysml8dxy447hp3aytr0nssr9pd9a47l7gx:
    'https://res.cloudinary.com/oraichain/image/upload/v1645502169/oraiBotValidatorLogo.png',
  oraivaloper1mrv57zj3dpfyc9yd5xptnz2tqfez9fss4c9r85:
    'https://images.airight.io/validator/62555944385ee500012733f0.png',
  oraivaloper1v26tdegnk79edw7xkk2xh8qn89vy6qej6yhsev:
    'https://res.cloudinary.com/oraichain/image/upload/v1645502256/TrinityLogo.jpg',
  oraivaloper17zr98cwzfqdwh69r8v5nrktsalmgs5sa83gpd9:
    'https://images.airight.io/validator/623c45bd385ee50001437260.png',
  oraivaloper1qv5jn7tueeqw7xqdn5rem7s09n7zletreera88:
    'https://images.airight.io/validator/626d483a385ee5000162832e.png',
  oraivaloper10z9f6539v0ge78xlm4yh7tddrvw445s6d7s2xq:
    'https://images.airight.io/validator/627565f6385ee5000181e778.JPG',
  oraivaloper1ch3ewye24zm094ygmxu5e4z7d0xre3vhthctpn:
    'https://images.airight.io/validator/62686b04385ee5000162832c.jpg',
  oraivaloper1m2d5uhr65p9vvlw2w29kajud5q529a76v22wyu:
    'https://images.airight.io/validator/626c1920385ee5000162832d.jpg',
  oraivaloper1ucx0gm8kca2zvyr9d39z249j62y2t8r0rwtmr6:
    'https://res.cloudinary.com/oraichain/image/upload/v1646034968/strong_node.jpg',
  oraivaloper1g0hmvzs76akv6802x0he6ladjnftp94ygsf2lc:
    'https://images.airight.io/validator/627231c8385ee5000162832f.png',
  oraivaloper1rqq57xt5r5pnuguffcrltnvkul7n0jdxxdgey0: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png',
  oraivaloper1asz5wl5c2xt8y5kyp9r04v54zh77pq90qar7e8:
    'https://images.airight.io/validator/62729055385ee50001499911.png',
  oraivaloper1djm07np8dzyg4et3d7dqtr3692l80nggvl0edh:
    'https://images.airight.io/validator/625522ca385ee50001b67f29.png',
  oraivaloper14vcw5qk0tdvknpa38wz46js5g7vrvut8ku5kaa: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png'
};

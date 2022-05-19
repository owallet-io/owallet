import { Bech32Address } from '@owallet/cosmos';

export const EmbedChainInfos = [
  {
    rpc: 'https://rpc-cosmoshub.owallet.app',
    rest: 'https://lcd-cosmoshub.owallet.app',
    chainId: 'cosmoshub-4',
    chainName: 'Cosmos',
    stakeCurrency: {
      coinDenom: 'ATOM',
      coinMinimalDenom: 'uatom',
      coinDecimals: 6,
      coinGeckoId: 'cosmos'
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
        coinGeckoId: 'cosmos'
      }
    ],
    feeCurrencies: [
      {
        coinDenom: 'ATOM',
        coinMinimalDenom: 'uatom',
        coinDecimals: 6,
        coinGeckoId: 'cosmos'
      }
    ],
    coinType: 118,
    features: ['stargate', 'ibc-transfer']
  },
  {
    rpc: 'https://rpc-osmosis.owallet.app',
    rest: 'https://lcd-osmosis.owallet.app',
    chainId: 'osmosis-1',
    chainName: 'Osmosis',
    stakeCurrency: {
      coinDenom: 'OSMO',
      coinMinimalDenom: 'uosmo',
      coinDecimals: 6,
      coinGeckoId: 'osmosis'
    },
    bip44: { coinType: 118 },
    bech32Config: Bech32Address.defaultBech32Config('osmo'),
    currencies: [
      {
        coinDenom: 'OSMO',
        coinMinimalDenom: 'uosmo',
        coinDecimals: 6,
        coinGeckoId: 'osmosis'
      },
      {
        coinDenom: 'ION',
        coinMinimalDenom: 'uion',
        coinDecimals: 6,
        coinGeckoId: 'ion'
      }
    ],
    feeCurrencies: [
      {
        coinDenom: 'OSMO',
        coinMinimalDenom: 'uosmo',
        coinDecimals: 6,
        coinGeckoId: 'osmosis'
      }
    ],
    gasPriceStep: {
      low: 0,
      average: 0.025,
      high: 0.035
    },
    features: ['stargate', 'ibc-transfer']
  }
];

import { Bech32Config, ChainInfo, Currency } from '@owallet/types';

import {
  AIRI_BSC_CONTRACT,
  KWT_BSC_CONTRACT,
  KWT_DENOM,
  MILKY_BSC_CONTRACT,
  MILKY_DENOM,
  MILKY_ERC_CONTRACT,
  ORAI_BRIDGE_EVM_DENOM_PREFIX,
  ORAI_BRIDGE_EVM_ETH_DENOM_PREFIX,
  ORAI_BRIDGE_EVM_TRON_DENOM_PREFIX,
  ORAI_BSC_CONTRACT,
  ORAI_ETH_CONTRACT,
  USDC_ETH_CONTRACT,
  USDT_BSC_CONTRACT,
  USDT_TRON_CONTRACT,
  WRAP_TRON_TRX_CONTRACT
} from './constants';
import { OraiIcon } from '@src/components/icon/orai';
import { OraiLightIcon } from '@src/components/icon/orai-light';
import { AtomIcon } from '@src/components/icon/atom-cosmos';
import { AiriIcon } from '@src/components/icon/airi';
import { UsdtIcon } from '@src/components/icon/tether';
import { KwtIcon } from '@src/components/icon/kwt';
import { OsmoLightIcon } from '@src/components/icon/osmos-light';
import { OsmoIcon } from '@src/components/icon/osmos';
import { UsdcIcon } from '@src/components/icon/usd-coin';
import { ScOraiIcon } from '@src/components/icon/orchai';
import { OraixLightIcon } from '@src/components/icon/oraix-light';
import { OraixIcon } from '@src/components/icon/oraix';
import { MilkyIcon } from '@src/components/icon/milky';
import { TronIcon } from '@src/components/icon/tron';
import { ScAtomIcon } from '@src/components/icon/scatom';
import { EthIcon } from '@src/components/icon/ethereum';
import { BnbIcon } from '@src/components/icon/bnb';

export type NetworkName =
  | 'Oraichain'
  | 'Cosmos Hub'
  | 'Osmosis'
  | 'OraiBridge'
  | 'BNB Chain'
  | 'Ethereum'
  | 'Kawaiiverse'
  | 'Kawaiiverse EVM'
  | 'Tron Network';

export type CosmosChainId =
  | 'Oraichain' // oraichain
  | 'oraibridge-subnet-2' // oraibridge
  | 'osmosis-1' // osmosis
  | 'cosmoshub-4' // cosmos hub
  | 'kawaii_6886-1'; // kawaii subnetwork

export type EvmChainId =
  | '0x38' // bsc
  | '0x01' // ethereum
  | '0x1ae6' // kawaii
  | '0x2b6653dc'; // tron

export type NetworkChainId = CosmosChainId | EvmChainId;

export type CoinGeckoId =
  | 'oraichain-token'
  | 'osmosis'
  | 'cosmos'
  | 'ethereum'
  | 'bnb'
  | 'airight'
  | 'oraidex'
  | 'tether'
  | 'kawaii-islands'
  | 'milky-token'
  | 'scorai'
  | 'oraidex'
  | 'usd-coin'
  | 'tron'
  | 'weth'
  | 'wbnb'
  | 'scatom';

export type NetworkType = 'cosmos' | 'evm';
export type CoinIcon = React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
export type BridgeAppCurrency = any & {
  readonly bridgeTo?: NetworkChainId[];
  readonly coinGeckoId?: CoinGeckoId;
  readonly Icon?: any;
  readonly IconLight?: any;
  readonly bridgeNetworkIdentifier?: EvmChainId;
  readonly coinDecimals: 6 | 18;
  readonly contractAddress?: string;
  readonly prefixToken?: string;
};

export type CoinType = 118 | 60 | 195;

/**
 * A list of Cosmos chain infos. If we need to add / remove any chains, just directly update this variable.
 * some chain is already in wallet so we override some attributes as optional
 */
export interface CustomChainInfo
  extends Omit<
    ChainInfo,
    'feeCurrencies' | 'stakeCurrency' | 'currencies' | 'rest' | 'bech32Config'
  > {
  readonly chainId: NetworkChainId;
  readonly chainName: NetworkName;
  readonly Icon?: any;
  readonly IconLight?: any;
  readonly networkType: NetworkType;
  readonly bip44: {
    coinType: CoinType;
  };
  readonly bech32Config?: Bech32Config;
  readonly rest?: string; // optional, rest api tron and lcd for cosmos
  readonly txExplorer?: {
    readonly coinDenom: string;
    readonly txUrl: string;
    readonly accountUrl?: string;
  };
  readonly stakeCurrency?: Currency;
  readonly feeCurrencies?: any[];
  readonly currencies: BridgeAppCurrency[];
}

export const defaultBech32Config = (
  mainPrefix: string,
  validatorPrefix = 'val',
  consensusPrefix = 'cons',
  publicPrefix = 'pub',
  operatorPrefix = 'oper'
) => {
  return {
    bech32PrefixAccAddr: mainPrefix,
    bech32PrefixAccPub: mainPrefix + publicPrefix,
    bech32PrefixValAddr: mainPrefix + validatorPrefix + operatorPrefix,
    bech32PrefixValPub:
      mainPrefix + validatorPrefix + operatorPrefix + publicPrefix,
    bech32PrefixConsAddr: mainPrefix + validatorPrefix + consensusPrefix,
    bech32PrefixConsPub:
      mainPrefix + validatorPrefix + consensusPrefix + publicPrefix
  };
};

export const OraiToken: BridgeAppCurrency = {
  coinDenom: 'ORAI',
  coinMinimalDenom: 'orai',
  coinDecimals: 6,
  coinGeckoId: 'oraichain-token',
  Icon: OraiIcon,
  IconLight: OraiLightIcon,
  bridgeTo: ['0x38', '0x01'],
  gasPriceStep: {
    low: 0.003,
    average: 0.005,
    high: 0.007
  }
};

const OraiBToken: BridgeAppCurrency = {
  coinDenom: 'ORAIB',
  coinMinimalDenom: 'uoraib',
  coinDecimals: 6,
  gasPriceStep: {
    low: 0,
    average: 0,
    high: 0
  }
};

const KawaiiToken: BridgeAppCurrency = {
  coinDenom: 'ORAIE',
  coinMinimalDenom: 'oraie',
  coinDecimals: 18,
  coinGeckoId: 'kawaii-islands',
  Icon: KwtIcon,
  gasPriceStep: {
    low: 0,
    average: 0.000025,
    high: 0.00004
  }
};

export const oraichainNetwork: CustomChainInfo = {
  rpc: 'https://rpc.orai.io',
  rest: 'https://lcd.orai.io',
  chainId: 'Oraichain',
  chainName: 'Oraichain',
  networkType: 'cosmos',
  stakeCurrency: OraiToken,
  bip44: {
    coinType: 118
  },
  bech32Config: defaultBech32Config('orai'),
  feeCurrencies: [OraiToken],

  Icon: OraiIcon,
  IconLight: OraiLightIcon,
  features: ['ibc-transfer', 'cosmwasm', 'wasmd_0.24+'],
  currencies: [
    OraiToken,
    {
      coinDenom: 'ATOM',
      coinGeckoId: 'cosmos',
      coinMinimalDenom: process.env.REACT_APP_ATOM_ORAICHAIN_DENOM,
      bridgeTo: ['cosmoshub-4'],
      coinDecimals: 6,
      Icon: AtomIcon,
      IconLight: AtomIcon
    },
    // {
    //   coinDenom: 'BEP20 AIRI',
    //   coinGeckoId: 'airight',
    //   coinMinimalDenom: process.env.REACT_APP_AIRIBSC_ORAICHAIN_DENOM,
    //   coinDecimals: 18,
    //   Icon: AiriIcon
    // },
    {
      coinDenom: 'AIRI',
      coinGeckoId: 'airight',
      coinMinimalDenom: 'airi',
      type: 'cw20',
      contractAddress: process.env.REACT_APP_AIRI_CONTRACT,
      bridgeTo: ['0x38'],
      coinDecimals: 6,
      Icon: AiriIcon
    },
    {
      coinDenom: 'USDT',
      coinGeckoId: 'tether',
      coinMinimalDenom: 'usdt',
      type: 'cw20',
      contractAddress: process.env.REACT_APP_USDT_CONTRACT,
      bridgeTo: ['0x38', '0x2b6653dc'],
      coinDecimals: 6,
      Icon: UsdtIcon
    },
    {
      coinDenom: 'USDC',
      coinGeckoId: 'usd-coin',
      coinMinimalDenom: 'usdc',
      type: 'cw20',
      contractAddress: process.env.REACT_APP_USDC_CONTRACT,
      bridgeTo: ['0x01'],
      coinDecimals: 6,
      Icon: UsdcIcon
    },
    {
      coinDenom: 'OSMO',
      coinMinimalDenom: process.env.REACT_APP_OSMOSIS_ORAICHAIN_DENOM,
      coinDecimals: 6,
      coinGeckoId: 'osmosis',
      bridgeTo: ['osmosis-1'],
      Icon: OsmoIcon,
      IconLight: OsmoLightIcon
    },
    {
      coinDenom: 'BEP20 KWT',
      coinGeckoId: 'kawaii-islands',
      coinMinimalDenom: process.env.REACT_APP_KWTBSC_ORAICHAIN_DENOM,
      coinDecimals: 18,
      Icon: KwtIcon
    },
    {
      coinDenom: 'KWT',
      coinGeckoId: 'kawaii-islands',
      coinMinimalDenom: 'kwt',
      type: 'cw20',
      contractAddress: process.env.REACT_APP_KWT_CONTRACT,
      bridgeTo: ['kawaii_6886-1', '0x38'],
      coinDecimals: 6,
      Icon: KwtIcon
    },
    {
      coinDenom: 'BEP20 MILKY',
      coinGeckoId: 'milky-token',
      coinMinimalDenom: process.env.REACT_APP_MILKYBSC_ORAICHAIN_DENOM,
      coinDecimals: 18,
      Icon: MilkyIcon
    },
    {
      coinDenom: 'MILKY',
      coinGeckoId: 'milky-token',
      coinMinimalDenom: 'milky',
      type: 'cw20',
      contractAddress: process.env.REACT_APP_MILKY_CONTRACT,
      bridgeTo: ['kawaii_6886-1', '0x38'],
      coinDecimals: 6,
      Icon: MilkyIcon
    },
    {
      coinDenom: 'ORAIX',
      coinMinimalDenom: 'oraix',
      type: 'cw20',
      contractAddress: process.env.REACT_APP_ORAIX_CONTRACT,
      coinGeckoId: 'oraidex',
      coinDecimals: 6,
      Icon: OraixIcon,
      IconLight: OraixLightIcon
    },
    {
      coinDenom: 'scORAI',
      coinMinimalDenom: 'scorai',
      type: 'cw20',
      contractAddress: process.env.REACT_APP_SCORAI_CONTRACT,
      coinGeckoId: 'scorai',
      coinDecimals: 6,
      Icon: ScOraiIcon
    },
    {
      coinDenom: 'wTRX',
      coinGeckoId: 'tron',
      coinMinimalDenom: 'trx',
      type: 'cw20',
      contractAddress: process.env.REACT_APP_TRX_CONTRACT,
      bridgeTo: ['0x2b6653dc'],
      coinDecimals: 6,
      Icon: TronIcon
    },
    {
      coinDenom: 'scATOM',
      coinMinimalDenom: 'scatom',
      type: 'cw20',
      contractAddress: process.env.REACT_APP_SCATOM_CONTRACT,
      coinGeckoId: 'scatom',
      coinDecimals: 6,
      Icon: ScAtomIcon
    }
    // {
    //   coinDenom: 'ATOM-CW20',
    //   coinGeckoId: 'cosmos',
    //   coinMinimalDenom: 'uatom',
    //   type: 'cw20',
    //   contractAddress: 'orai17l2zk3arrx0a0fyuneyx8raln68622a2lrsz8ph75u7gw9tgz3esayqryf',
    //   bridgeTo: ['cosmoshub-4'],
    //   coinDecimals: 6,
    //   Icon: AtomIcon
    // }
  ]
};

export const chainInfos: CustomChainInfo[] = [
  // networks to add on keplr
  oraichainNetwork,
  {
    rpc: 'https://bridge-v2.rpc.orai.io',
    rest: 'https://bridge-v2.lcd.orai.io',
    chainId: 'oraibridge-subnet-2',
    chainName: 'OraiBridge',
    networkType: 'cosmos',
    bip44: {
      coinType: 118
    },
    bech32Config: defaultBech32Config('oraib'),

    features: ['ibc-transfer'],
    stakeCurrency: OraiBToken,
    feeCurrencies: [OraiBToken],
    // not use oraib as currency
    currencies: [
      OraiBToken,
      {
        coinDenom: 'ORAI',
        coinMinimalDenom: ORAI_BRIDGE_EVM_DENOM_PREFIX + ORAI_BSC_CONTRACT,
        bridgeNetworkIdentifier: '0x38',
        coinDecimals: 18,
        coinGeckoId: 'oraichain-token',
        IconLight: OraiLightIcon,
        Icon: OraiIcon
      },
      {
        coinDenom: 'ORAI',
        coinMinimalDenom: ORAI_BRIDGE_EVM_ETH_DENOM_PREFIX + ORAI_ETH_CONTRACT,
        bridgeNetworkIdentifier: '0x01',
        coinDecimals: 18,
        coinGeckoId: 'oraichain-token',
        IconLight: OraiLightIcon,
        prefixToken: ORAI_BRIDGE_EVM_ETH_DENOM_PREFIX,
        Icon: OraiIcon
      },
      {
        coinDenom: 'USDC',
        coinMinimalDenom: ORAI_BRIDGE_EVM_ETH_DENOM_PREFIX + USDC_ETH_CONTRACT,
        bridgeNetworkIdentifier: '0x01',
        coinDecimals: 6,
        coinGeckoId: 'usd-coin',
        prefixToken: ORAI_BRIDGE_EVM_ETH_DENOM_PREFIX,
        Icon: UsdcIcon
      },
      {
        coinDenom: 'AIRI',
        coinMinimalDenom: ORAI_BRIDGE_EVM_DENOM_PREFIX + AIRI_BSC_CONTRACT,
        bridgeNetworkIdentifier: '0x38',
        coinDecimals: 18,
        coinGeckoId: 'airight',
        Icon: AiriIcon
      },
      {
        coinDenom: 'USDT',
        coinMinimalDenom: ORAI_BRIDGE_EVM_DENOM_PREFIX + USDT_BSC_CONTRACT,
        bridgeNetworkIdentifier: '0x38',
        coinDecimals: 18,
        coinGeckoId: 'tether',
        Icon: UsdtIcon
      },
      {
        coinDenom: 'USDT',
        coinMinimalDenom:
          ORAI_BRIDGE_EVM_TRON_DENOM_PREFIX + USDT_TRON_CONTRACT,
        bridgeNetworkIdentifier: '0x2b6653dc',
        prefixToken: ORAI_BRIDGE_EVM_TRON_DENOM_PREFIX,
        coinDecimals: 6,
        coinGeckoId: 'tether',
        Icon: UsdtIcon
      },
      {
        coinDenom: 'wTRX',
        coinMinimalDenom:
          ORAI_BRIDGE_EVM_TRON_DENOM_PREFIX + WRAP_TRON_TRX_CONTRACT,
        bridgeNetworkIdentifier: '0x2b6653dc',
        coinDecimals: 6,
        coinGeckoId: 'tron',
        prefixToken: ORAI_BRIDGE_EVM_TRON_DENOM_PREFIX,
        Icon: TronIcon
      },
      {
        coinDenom: 'KWT',
        bridgeNetworkIdentifier: '0x38',
        coinMinimalDenom: KWT_DENOM,
        coinDecimals: 18,
        coinGeckoId: 'kawaii-islands',
        Icon: KwtIcon
      },
      {
        coinDenom: 'MILKY',
        bridgeNetworkIdentifier: '0x38',
        coinMinimalDenom: MILKY_DENOM,
        coinDecimals: 18,
        coinGeckoId: 'milky-token',
        Icon: MilkyIcon
      }
    ]
  },
  {
    rpc: 'https://tendermint1.kawaii.global',
    rest: 'https://cosmos1.kawaii.global',
    chainId: 'kawaii_6886-1',
    chainName: 'Kawaiiverse',
    networkType: 'cosmos',
    stakeCurrency: KawaiiToken,
    bip44: {
      coinType: 60
    },
    bech32Config: defaultBech32Config('oraie'),
    feeCurrencies: [KawaiiToken],

    Icon: KwtIcon,
    // features: ['ibc-transfer'],
    features: [
      'ibc-transfer',
      'ibc-go',
      'stargate',
      'eth-address-gen',
      'eth-key-sign'
    ],
    currencies: [
      KawaiiToken,
      {
        coinDenom: 'MILKY',
        coinGeckoId: 'milky-token',
        coinMinimalDenom: process.env.REACT_APP_MILKY_SUB_NETWORK_DENOM,
        coinDecimals: 18,
        bridgeTo: ['Oraichain', 'kawaii_6886-1'],
        Icon: MilkyIcon
      },
      {
        coinDenom: 'ERC20 MILKY',
        coinMinimalDenom: 'erc20_milky',
        bridgeTo: ['Oraichain', 'kawaii_6886-1'],
        contractAddress: MILKY_ERC_CONTRACT,
        coinDecimals: 18,
        coinGeckoId: 'milky-token',
        Icon: MilkyIcon
      },
      {
        coinDenom: 'KWT',
        coinMinimalDenom: process.env.REACT_APP_KWT_SUB_NETWORK_DENOM,
        coinDecimals: 18,
        bridgeTo: ['Oraichain', 'kawaii_6886-1'],
        coinGeckoId: 'kawaii-islands',
        Icon: KwtIcon
      },
      {
        coinDenom: 'ERC20 KWT',
        bridgeTo: ['Oraichain', 'kawaii_6886-1'],
        coinMinimalDenom: 'erc20_kwt',
        contractAddress: '0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd',
        coinDecimals: 18,
        coinGeckoId: 'kawaii-islands',
        Icon: KwtIcon
      }
    ]
  },

  /// popular networks already included
  {
    rpc: 'https://osmosis-rpc.polkachu.com',
    rest: 'https://osmosis-api.polkachu.com',
    chainId: 'osmosis-1',
    chainName: 'Osmosis',
    networkType: 'cosmos',
    bip44: {
      coinType: 118
    },
    Icon: OsmoIcon,
    IconLight: OsmoLightIcon,
    bech32Config: defaultBech32Config('osmo'),
    currencies: [
      {
        coinDenom: 'OSMO',
        coinMinimalDenom: 'uosmo',
        coinDecimals: 6,
        coinGeckoId: 'osmosis',
        bridgeTo: ['Oraichain'],
        Icon: OsmoIcon,
        IconLight: OsmoLightIcon
      }
    ]
  },
  {
    rpc: 'https://rpc-cosmos.oraidex.io',
    rest: 'https://lcd-cosmos.oraidex.io',
    chainId: 'cosmoshub-4',
    chainName: 'Cosmos Hub',
    networkType: 'cosmos',
    bip44: {
      coinType: 118
    },
    Icon: AtomIcon,
    bech32Config: defaultBech32Config('cosmos'),
    currencies: [
      {
        coinDenom: 'ATOM',
        coinGeckoId: 'cosmos',
        coinMinimalDenom: 'uatom',
        coinDecimals: 6,
        bridgeTo: ['Oraichain'],
        Icon: AtomIcon
      }
    ]
  },

  /// evm chain info
  {
    rpc: 'https://rpc.ankr.com/eth',
    chainId: '0x01',
    chainName: 'Ethereum',
    bip44: {
      coinType: 60
    },
    Icon: EthIcon,
    networkType: 'evm',
    currencies: [
      {
        coinDenom: 'ORAI',
        coinMinimalDenom: 'erc20_orai',
        contractAddress: ORAI_ETH_CONTRACT,
        coinDecimals: 18,
        bridgeTo: ['Oraichain'],
        coinGeckoId: 'oraichain-token',
        IconLight: OraiLightIcon,
        prefixToken: ORAI_BRIDGE_EVM_ETH_DENOM_PREFIX,
        Icon: OraiIcon
      },
      {
        coinDenom: 'USDC',
        coinMinimalDenom: 'erc20_usdc',
        contractAddress: USDC_ETH_CONTRACT,
        coinDecimals: 6,
        bridgeTo: ['Oraichain'],
        coinGeckoId: 'usd-coin',
        prefixToken: ORAI_BRIDGE_EVM_ETH_DENOM_PREFIX,
        Icon: UsdcIcon
      }
    ]
  },
  {
    rpc: 'https://api.trongrid.io/jsonrpc',
    rest: 'https://api.trongrid.io',
    chainId: '0x2b6653dc',
    networkType: 'evm',
    chainName: 'Tron Network',
    Icon: TronIcon,
    currencies: [
      {
        coinDenom: 'USDT',
        coinMinimalDenom: 'trx20_usdt',
        contractAddress: USDT_TRON_CONTRACT,
        bridgeTo: ['Oraichain'],
        coinDecimals: 6,
        coinGeckoId: 'tether',
        prefixToken: ORAI_BRIDGE_EVM_TRON_DENOM_PREFIX,
        Icon: UsdtIcon
      },
      {
        coinDenom: 'wTRX',
        coinMinimalDenom: 'trx20_trx',
        contractAddress: WRAP_TRON_TRX_CONTRACT,
        bridgeTo: ['Oraichain'],
        coinDecimals: 6,
        coinGeckoId: 'tron',
        prefixToken: ORAI_BRIDGE_EVM_TRON_DENOM_PREFIX,
        Icon: TronIcon
      }
    ],
    bip44: {
      coinType: 195
    }
  },
  {
    rpc: 'https://bsc-dataseed1.binance.org',
    networkType: 'evm',
    Icon: BnbIcon,
    chainId: '0x38',
    chainName: 'BNB Chain',
    bip44: {
      coinType: 60
    },
    currencies: [
      {
        coinDenom: 'ORAI',
        coinMinimalDenom: 'bep20_orai',
        contractAddress: ORAI_BSC_CONTRACT,
        bridgeTo: ['Oraichain'],
        coinDecimals: 18,
        coinGeckoId: 'oraichain-token',
        prefixToken: ORAI_BRIDGE_EVM_DENOM_PREFIX,
        Icon: OraiIcon,
        IconLight: OraiLightIcon
      },
      {
        coinDenom: 'AIRI',
        coinMinimalDenom: 'bep20_airi',
        contractAddress: AIRI_BSC_CONTRACT,
        bridgeTo: ['Oraichain'],
        coinDecimals: 18,
        coinGeckoId: 'airight',
        prefixToken: ORAI_BRIDGE_EVM_DENOM_PREFIX,
        Icon: AiriIcon
      },
      {
        coinDenom: 'USDT',
        coinMinimalDenom: 'bep20_usdt',
        contractAddress: USDT_BSC_CONTRACT,
        bridgeTo: ['Oraichain'],
        coinDecimals: 18,
        coinGeckoId: 'tether',
        prefixToken: ORAI_BRIDGE_EVM_DENOM_PREFIX,
        Icon: UsdtIcon
      },
      {
        coinDenom: 'KWT',
        coinMinimalDenom: 'bep20_kwt',
        contractAddress: KWT_BSC_CONTRACT,
        bridgeTo: ['Oraichain'],
        coinDecimals: 18,
        coinGeckoId: 'kawaii-islands',
        Icon: KwtIcon
      },
      {
        coinDenom: 'MILKY',
        coinMinimalDenom: 'bep20_milky',
        contractAddress: MILKY_BSC_CONTRACT,
        coinDecimals: 18,
        coinGeckoId: 'milky-token',
        bridgeTo: ['Oraichain'],
        Icon: MilkyIcon
      }
    ]
  },
  {
    rpc: 'https://endpoint1.kawaii.global',
    chainId: '0x1ae6',
    networkType: 'evm',
    chainName: 'Kawaiiverse EVM',
    Icon: KwtIcon,
    bip44: {
      coinType: 60
    },
    currencies: [
      {
        coinDenom: 'ERC20 MILKY',
        coinMinimalDenom: 'erc20_milky',
        bridgeTo: ['Oraichain', 'kawaii_6886-1'],
        contractAddress: MILKY_ERC_CONTRACT,
        coinDecimals: 18,
        coinGeckoId: 'milky-token',
        Icon: MilkyIcon
      },
      {
        coinDenom: 'ERC20 KWT',
        bridgeTo: ['Oraichain', 'kawaii_6886-1'],
        coinMinimalDenom: 'erc20_kwt',
        contractAddress: '0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd',
        coinDecimals: 18,
        coinGeckoId: 'kawaii-islands',
        Icon: KwtIcon
      }
    ]
  }
];

// exclude kawaiverse subnet and other special evm that has different cointype
export const evmChains = chainInfos.filter(
  c =>
    c.networkType === 'evm' && c.bip44.coinType === 60 && c.chainId !== '0x1ae6'
);

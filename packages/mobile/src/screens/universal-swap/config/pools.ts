import {
  CosmWasmClient,
  fromBinary,
  toBinary
} from '@cosmjs/cosmwasm-stargate';
import { flatten, uniq } from 'lodash';
import { TokenItemType, assetInfoMap } from './bridgeTokens';
import { MILKY, ORAI, STABLE_DENOM } from './constants';
import {
  AssetInfo,
  MulticallQueryClient,
  MulticallReadOnlyInterface
} from '@oraichain/common-contracts-sdk';
import { PairInfo } from '@oraichain/oraidex-contracts-sdk';
import { network } from './networks';
import { PairInfoExtend } from '../types/token';
import { parseAssetInfo } from '../helper';

export type PairMapping = {
  asset_infos: [AssetInfo, AssetInfo];
  factoryV1?: boolean;
};

export type TokensSwap = { [key: string]: TokenItemType };

export class Pairs {
  public static pairs: PairMapping[] = [
    {
      asset_infos: [
        { native_token: { denom: ORAI } },
        { token: { contract_addr: process.env.REACT_APP_AIRI_CONTRACT } }
      ],
      factoryV1: true
    },
    {
      asset_infos: [
        { native_token: { denom: ORAI } },
        { token: { contract_addr: process.env.REACT_APP_ORAIX_CONTRACT } }
      ],
      factoryV1: true
    },
    {
      asset_infos: [
        { native_token: { denom: ORAI } },
        { token: { contract_addr: process.env.REACT_APP_SCORAI_CONTRACT } }
      ]
    },
    {
      asset_infos: [
        { native_token: { denom: ORAI } },
        { native_token: { denom: process.env.REACT_APP_ATOM_ORAICHAIN_DENOM } }
      ],
      factoryV1: true
    },
    {
      asset_infos: [
        { native_token: { denom: ORAI } },
        { token: { contract_addr: process.env.REACT_APP_USDT_CONTRACT } }
      ],
      factoryV1: true
    },
    {
      asset_infos: [
        { native_token: { denom: ORAI } },
        { token: { contract_addr: process.env.REACT_APP_KWT_CONTRACT } }
      ],
      factoryV1: true
    },
    {
      asset_infos: [
        { native_token: { denom: ORAI } },
        {
          native_token: { denom: process.env.REACT_APP_OSMOSIS_ORAICHAIN_DENOM }
        }
      ],
      factoryV1: true
    },
    {
      asset_infos: [
        { token: { contract_addr: process.env.REACT_APP_MILKY_CONTRACT } },
        { token: { contract_addr: process.env.REACT_APP_USDT_CONTRACT } }
      ],
      factoryV1: true
    },
    {
      asset_infos: [
        { native_token: { denom: ORAI } },
        { token: { contract_addr: process.env.REACT_APP_USDC_CONTRACT } }
      ]
    },
    {
      asset_infos: [
        { native_token: { denom: ORAI } },
        { token: { contract_addr: process.env.REACT_APP_TRX_CONTRACT } }
      ]
    },
    {
      asset_infos: [
        { native_token: { denom: process.env.REACT_APP_ATOM_ORAICHAIN_DENOM } },
        { token: { contract_addr: process.env.REACT_APP_SCATOM_CONTRACT } }
      ]
    }
    // {
    //   asset_infos: [
    //     { native_token: { denom: ORAI } }, // or your ibc native / cw20 token pair
    //     { token: { contract_addr: 'orai17l2zk3arrx0a0fyuneyx8raln68622a2lrsz8ph75u7gw9tgz3esayqryf' } }
    //   ]
    // }
  ];

  public static getPoolTokens(): TokenItemType[] {
    return uniq(
      flatten(this.pairs.map(pair => pair.asset_infos)).map(
        info => assetInfoMap[parseAssetInfo(info)]
      )
    );
  }

  static getAllPairs = async (
    pairs: PairMapping[],
    factoryAddress: string,
    multicall: MulticallReadOnlyInterface
  ): Promise<PairInfo[]> => {
    const results = await multicall.aggregate({
      queries: pairs.map(pair => {
        return {
          address: factoryAddress,
          data: toBinary({
            pair: {
              asset_infos: pair.asset_infos
            }
          })
        };
      })
    });
    return results.return_data.map(data => fromBinary(data.data));
  };

  /**
   *
   * @param pairs pairs info from contract
   * @returns pairs info after processed to have correctly index of asset info matched with list pairs of Pairs.pairs
   * note: this case use for pair that have USDT token with other token (example: USDT/MILKY should return MILKY/USDT)
   */
  static processFetchedAllPairInfos = (pairs: PairInfo[]): PairInfoExtend[] => {
    return pairs.map(pair => {
      let firstInfoIndex = 0;
      let secondInfoIndex = 1;
      // we reverse the pair because the main asset info is not USDT, but the other token
      if (
        parseAssetInfo(pair.asset_infos[0]) ===
        process.env.REACT_APP_USDT_CONTRACT
      ) {
        firstInfoIndex = 1;
        secondInfoIndex = 0;
      }
      const { asset_infos } = pair;
      return {
        ...pair,
        asset_infos: [
          asset_infos[firstInfoIndex],
          asset_infos[secondInfoIndex]
        ],
        asset_infos_raw: [
          parseAssetInfo(asset_infos[firstInfoIndex]),
          parseAssetInfo(asset_infos[secondInfoIndex])
        ]
      };
    });
  };

  static getAllPairsFromTwoFactoryVersions = async (
    client: CosmWasmClient,
    multicallClient?: MulticallReadOnlyInterface
  ): Promise<PairInfoExtend[]> => {
    const firstVersionWhiteListPairs = this.pairs.filter(
      pair => pair.factoryV1
    );
    const secondVersionWhiteListPairs = this.pairs.filter(
      pair => !firstVersionWhiteListPairs.includes(pair)
    );
    console.dir(secondVersionWhiteListPairs, { depth: null });

    const multicall = multicallClient
      ? multicallClient
      : new MulticallQueryClient(client, network.multicall);
    const [firstVersionAllPairs, secondVersionAllPairs] = await Promise.all([
      this.getAllPairs(firstVersionWhiteListPairs, network.factory, multicall),
      this.getAllPairs(
        secondVersionWhiteListPairs,
        network.factory_v2,
        multicall
      )
    ]);
    return this.processFetchedAllPairInfos([
      ...firstVersionAllPairs,
      ...secondVersionAllPairs
    ]);
  };

  static getStakingAssetInfo = (assetInfos: AssetInfo[]): AssetInfo => {
    return parseAssetInfo(assetInfos[0]) === ORAI
      ? assetInfos[1]
      : assetInfos[0];
  };

  static getStakingInfoTokenItemTypeFromPairs = (
    pairs: PairInfo[]
  ): TokenItemType[] => {
    return pairs.map(
      p => assetInfoMap[parseAssetInfo(this.getStakingAssetInfo(p.asset_infos))]
    );
  };
}

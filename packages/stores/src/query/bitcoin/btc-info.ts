// import { BtcTokenInfo } from './types';
// import { KVStore, MyBigInt } from '@owallet/common';
// import { ObservableChainQueryMap } from '../chain-query';
// import { ChainGetter } from '../../common';
// import { computed } from 'mobx';
// import { ObservableBtcChainQuery } from './btc-query';

// export class ObservableQueryBtcInfoInner extends ObservableBtcChainQuery<{test:boolean}> {
//   constructor(
//     kvStore: KVStore,
//     chainId: string,
//     chainGetter: ChainGetter,
//     protected readonly contractAddress: string
//   ) {
//     super(kvStore, chainId, chainGetter,null);
//   }

//   @computed
//   get tokenInfo(): BtcTokenInfo | undefined {
//     // const fetchData = this.response?.data;
//     // const fetchInfo = this.response?.info;
//     // try {
//     //   if (!fetchData) {
//     //     return undefined;
//     //   }

//     //   const chainInfo = this.chainGetter.getChain(this._chainId);
//     //   const currency = chainInfo.currencies.find(curency =>
//     //     curency.coinMinimalDenom.startsWith(`erc20:${this.contractAddress}`)
//     //   );

//     //   return {
//     //     decimals: currency?.coinDecimals || fetchInfo.decimals,
//     //     name: currency?.coinMinimalDenom?.split(':')?.pop() || fetchInfo.name,
//     //     symbol: currency?.coinDenom || fetchInfo.symbol,
//     //     total_supply: new MyBigInt(fetchData.result).toString()
//     //   };
//     } catch (error) {
//       console.log('Error on getting token info: ', error);
//     }
//   }
// }

// export class ObservableQueryErc20ContractInfo extends ObservableChainQueryMap<Result> {
//   constructor(
//     protected readonly kvStore: KVStore,
//     protected readonly chainId: string,
//     protected readonly chainGetter: ChainGetter
//   ) {
//     super(kvStore, chainId, chainGetter, (contractAddress: string) => {
//       return new ObservableQueryBtcInfoInner(
//         this.kvStore,
//         this.chainId,
//         this.chainGetter,
//         contractAddress
//       );
//     });
//   }

//   getQueryContract(
//     contractAddress: string
//   ): ObservableQueryBtcInfoInner {
//     return this.get(contractAddress) as ObservableQueryBtcInfoInner;
//   }
// }

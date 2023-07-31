// import { QueriesSetBase } from '../queries';
// import { ChainGetter } from '../../common';
// import { KVStore } from '@owallet/common';
// import { DeepReadonly } from 'utility-types';
// // import { ObservableQueryErc20BalanceRegistry } from './erc20-balance';
// import { QueriesWithCosmosAndSecretAndCosmwasmAndEvm } from '../evm';
// import { OWallet } from '@owallet/types';
// // import { ObservableQueryEvmBalance } from './evm-balance';
// // import { ObservableQueryErc20ContractInfo } from './erc20-contract-info';

// export interface HasBtcQueries {
//   evm: BtcQueries;
// }

// export class QueriesWithCosmosAndSecretAndCosmwasmAndEvmAndBtc
//   extends QueriesWithCosmosAndSecretAndCosmwasmAndEvm
//   implements HasBtcQueries
// {
//   public evm: BtcQueries;

//   constructor(
//     kvStore: KVStore,
//     chainId: string,
//     chainGetter: ChainGetter,
//     apiGetter: () => Promise<OWallet | undefined>
//   ) {
//     super(kvStore, chainId, chainGetter, apiGetter);

//     this.evm = new BtcQueries(this, kvStore, chainId, chainGetter);
//   }
// }

// export class BtcQueries {
//   public readonly queryBtcInfo: DeepReadonly<ObservableQueryErc20ContractInfo>;
// //   public readonly queryEvmBalance: DeepReadonly<ObservableQueryEvmBalance>;

//   constructor(
//     base: QueriesSetBase,
//     kvStore: KVStore,
//     chainId: string,
//     chainGetter: ChainGetter
//   ) {
//     // base.queryBalances.addBalanceRegistry(
//     //   new ObservableQueryErc20BalanceRegistry(kvStore)
//     // );

//     // queryEvmBalance, we need to seperate native balance from cosmos as it is default implementation
//     // other implementations will require corresponding templates
//     // this.queryEvmBalance = new ObservableQueryEvmBalance(
//     //   kvStore,
//     //   chainId,
//     //   chainGetter
//     // );

//     this.queryBtcInfo = new ObservableQueryErc20ContractInfo(
//       kvStore,
//       chainId,
//       chainGetter
//     );
//   }
// }

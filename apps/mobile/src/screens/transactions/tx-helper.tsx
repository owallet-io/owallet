import { ChainIdEnum } from "@owallet/common";
import { EmptyTx } from "@src/screens/transactions/components/empty-tx";
import React from "react";
import { BtcDetailTx } from "@src/screens/transactions/btc/btc-detail-tx-screen";
import { EvmDetailTx } from "@src/screens/transactions/evm/evm-detail-tx-screen";
import AllNetworkTxsScreen from "@src/screens/transactions/all-network/all-network-txs-screen";
import { AllNetworkDetailTxScreen } from "@src/screens/transactions/all-network/all-network-detail-tx-screen";
import { AllNetworkTxCard } from "@src/screens/transactions/all-network/all-network-tx-card";

export enum typeTxEnum {
  DETAIL = "DETAIL",
  LIST = "LIST",
  CARD = "CARD",
}
const btcNetwork = {
  [typeTxEnum.LIST]: <AllNetworkTxsScreen />,
  [typeTxEnum.DETAIL]: <BtcDetailTx />,
  [typeTxEnum.CARD]: <AllNetworkTxCard />,
};
const oasisNetwork = {
  [typeTxEnum.LIST]: <AllNetworkTxsScreen />,
  [typeTxEnum.DETAIL]: <AllNetworkDetailTxScreen />,
  [typeTxEnum.CARD]: <AllNetworkTxCard />,
};
const tronNetwork = {
  [typeTxEnum.LIST]: <AllNetworkTxsScreen />,
  [typeTxEnum.DETAIL]: <AllNetworkDetailTxScreen />,
  [typeTxEnum.CARD]: <AllNetworkTxCard />,
};
const evmNetwork = {
  [typeTxEnum.LIST]: <AllNetworkTxsScreen />,
  [typeTxEnum.DETAIL]: <EvmDetailTx />,
  [typeTxEnum.CARD]: <AllNetworkTxCard />,
};
const oraichainNetwork = {
  [typeTxEnum.LIST]: <AllNetworkTxsScreen />,
  [typeTxEnum.DETAIL]: <AllNetworkDetailTxScreen />,
  [typeTxEnum.CARD]: <AllNetworkTxCard />,
};
const cosmosNetwork = {
  [typeTxEnum.LIST]: <AllNetworkTxsScreen />,
  [typeTxEnum.DETAIL]: <AllNetworkDetailTxScreen />,
  [typeTxEnum.CARD]: <AllNetworkTxCard />,
};
const allNetwork = {
  [typeTxEnum.LIST]: <AllNetworkTxsScreen />,
  [typeTxEnum.DETAIL]: <AllNetworkDetailTxScreen />,
  [typeTxEnum.CARD]: <AllNetworkTxCard />,
};
export const mappingChainIdToHistoryScreen = (
  network: ChainIdEnum | boolean,
  type: typeTxEnum
) => {
  if (!type || Object.values(typeTxEnum).includes(type) === false)
    return <EmptyTx />;

  switch (network) {
    case true:
      return allNetwork[type];
    case ChainIdEnum.Bitcoin:
      return btcNetwork[type];
    case ChainIdEnum.Oasis:
    case ChainIdEnum.OasisSapphire:
    case ChainIdEnum.OasisEmerald:
      return oasisNetwork[type];
    case ChainIdEnum.TRON:
      return tronNetwork[type];
    case ChainIdEnum.Ethereum:
    case ChainIdEnum.BNBChain:
      return evmNetwork[type];
    case ChainIdEnum.Oraichain:
      return oraichainNetwork[type];
    case ChainIdEnum.Injective:
    case ChainIdEnum.CosmosHub:
    case ChainIdEnum.Osmosis:
    case ChainIdEnum.CELESTIA:
    case ChainIdEnum.DYDX:
    case ChainIdEnum.AKASH:
    case ChainIdEnum.Juno:
    case ChainIdEnum.SEI:
    case ChainIdEnum.NEUTRON:
      return cosmosNetwork[type];
    default:
      return <EmptyTx />;
  }
};

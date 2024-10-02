import { ChainIdEnum } from "@owallet/common";
import BtcTxsScreen from "@src/screens/transactions/btc/btc-tx-screen";
import OasisTxsScreen from "@src/screens/transactions/oasis/oasis-txs-screen";
import TronTxsScreen from "@src/screens/transactions/tron/tron-txs-screen";
import EvmTxsScreen from "@src/screens/transactions/evm/evm-txs-screen";
import OraichainTxsScreen from "@src/screens/transactions/oraichain/oraichain-txs-screen";
import { EmptyTx } from "@src/screens/transactions/components/empty-tx";
import React from "react";
import { BtcDetailTx } from "@src/screens/transactions/btc/btc-detail-tx-screen";
import { BtcTxCard } from "@src/screens/transactions/btc/btc-tx-card";
import { OasisTxCard } from "@src/screens/transactions/oasis/oasis-tx-card";
import { OasisDetailTx } from "@src/screens/transactions/oasis/oasis-detail-tx-screen";
import { TronDetailTx } from "@src/screens/transactions/tron/tron-detail-tx-screen";
import { TronTxCard } from "@src/screens/transactions/tron/tron-tx-card";
import { EvmDetailTx } from "@src/screens/transactions/evm/evm-detail-tx-screen";
import { EvmTxCard } from "@src/screens/transactions/evm/evm-tx-card";
import { OraichainDetailTx } from "@src/screens/transactions/oraichain/oraichain-detail-tx-screen";
import { OraichainTxCard } from "@src/screens/transactions/oraichain/oraichain-tx-card";
import CosmosTxsScreen from "@src/screens/transactions/cosmos/cosmos-txs-screen";
import { CosmosDetailTx } from "@src/screens/transactions/cosmos/cosmos-detail-tx-screen";
import { CosmosTxCard } from "@src/screens/transactions/cosmos/cosmos-tx-card";
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

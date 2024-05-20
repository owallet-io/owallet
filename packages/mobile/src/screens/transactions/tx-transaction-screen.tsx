import React from "react";

import { observer } from "mobx-react-lite";
import { useStore } from "@src/stores";
import { EmptyTx } from "@src/screens/transactions/components/empty-tx";
import { ChainIdEnum } from "@owallet/common";
import BtcTxsScreen from "@src/screens/transactions/btc/btc-tx-screen";
import EvmTxsScreen from "@src/screens/transactions/evm/evm-txs-screen";
import OasisTxsScreen from "@src/screens/transactions/oasis/oasis-txs-screen";
import TronTxsScreen from "@src/screens/transactions/tron/tron-txs-screen";
import OraichainTxsScreen from "@src/screens/transactions/oraichain/oraichain-txs-screen";

const mappingChainIdToHistoryScreen = (network: ChainIdEnum) => {
  switch (network) {
    case ChainIdEnum.Bitcoin:
      return <BtcTxsScreen />;
    case ChainIdEnum.Oasis:
    case ChainIdEnum.OasisSapphire:
    case ChainIdEnum.OasisEmerald:
      return <OasisTxsScreen />;
    case ChainIdEnum.TRON:
      return <TronTxsScreen />;
    case ChainIdEnum.Ethereum:
    case ChainIdEnum.BNBChain:
      return <EvmTxsScreen />;
    case ChainIdEnum.Oraichain:
      return <OraichainTxsScreen />;
    default:
      return <EmptyTx />;
  }
};
const TxTransactionsScreen = observer(() => {
  const { chainStore } = useStore();
  const { chainId } = chainStore.current;
  return <>{mappingChainIdToHistoryScreen(chainId as ChainIdEnum)}</>;
});

export default TxTransactionsScreen;

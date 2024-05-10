import React from "react";

import { observer } from "mobx-react-lite";
import { useStore } from "@src/stores";
import { EmptyTx } from "@src/screens/transactions/components/empty-tx";
import { ChainIdEnum } from "@owallet/common";
import BtcTxsScreen from "@src/screens/transactions/btc/btc-tx-screen";
import EvmTxsScreen from "@src/screens/transactions/evm/evm-txs-screen";
import OasisTxsScreen from "@src/screens/transactions/oasis/oasis-txs-screen";

const TxTransactionsScreen = observer(() => {
  const { chainStore, accountStore, keyRingStore } = useStore();

  const { chainId } = chainStore.current;
  if (chainId === ChainIdEnum.Bitcoin) return <BtcTxsScreen />;
  if (chainId === ChainIdEnum.BNBChain || chainId === ChainIdEnum.Ethereum)
    return <EvmTxsScreen />;
  if (chainId === ChainIdEnum.Oasis) return <OasisTxsScreen />;
  return <EmptyTx />;
});

export default TxTransactionsScreen;

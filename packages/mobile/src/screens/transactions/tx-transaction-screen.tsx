import React from "react";

import { observer } from "mobx-react-lite";
import { useStore } from "@src/stores";

import { ChainIdEnum } from "@owallet/common";
import {
  mappingChainIdToHistoryScreen,
  typeTxEnum,
} from "@src/screens/transactions/tx-helper";

const TxTransactionsScreen = observer(() => {
  const { chainStore } = useStore();
  const { chainId } = chainStore.current;
  return (
    <>
      {mappingChainIdToHistoryScreen(chainId as ChainIdEnum, typeTxEnum.LIST)}
    </>
  );
});

export default TxTransactionsScreen;

import React from "react";

import { observer } from "mobx-react-lite";
import { useStore } from "@src/stores";

import { ChainIdEnum } from "@owallet/common";
import {
  mappingChainIdToHistoryScreen,
  typeTxEnum,
} from "@src/screens/transactions/tx-helper";
import { tracking } from "@src/utils/tracking";

const TxTransactionsScreen = observer(() => {
  const { chainStore, appInitStore } = useStore();
  const { chainId } = chainStore.current;
  tracking(`History Screen`);
  return (
    <>
      {mappingChainIdToHistoryScreen(
        appInitStore.getInitApp.isAllNetworks || (chainId as ChainIdEnum),
        typeTxEnum.LIST
      )}
    </>
  );
});

export default TxTransactionsScreen;

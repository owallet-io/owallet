import React from "react";

import { observer } from "mobx-react-lite";
import { useStore } from "@src/stores";

import { ChainIdEnum } from "@owallet/common";
import {
  mappingChainIdToHistoryScreen,
  typeTxEnum,
} from "@src/screens/transactions/tx-helper";
import ByteBrew from "react-native-bytebrew-sdk";

const TxTransactionsScreen = observer(() => {
  const { chainStore, appInitStore } = useStore();
  const { chainId } = chainStore.current;
  ByteBrew.NewCustomEvent(`History Screen`);
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

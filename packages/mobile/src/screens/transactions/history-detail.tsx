import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@src/stores";
import { ChainIdEnum } from "@owallet/common";
import {
  mappingChainIdToHistoryScreen,
  typeTxEnum,
} from "@src/screens/transactions/tx-helper";

export const HistoryDetail: FunctionComponent = observer((props) => {
  const { chainStore } = useStore();
  const { chainId } = chainStore.current;
  return (
    <>
      {mappingChainIdToHistoryScreen(chainId as ChainIdEnum, typeTxEnum.DETAIL)}
    </>
  );
});

import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@src/stores";
import { ChainIdEnum, MapNetworkToChainId } from "@owallet/common";
import {
  mappingChainIdToHistoryScreen,
  typeTxEnum,
} from "@src/screens/transactions/tx-helper";
import { useRoute } from "@react-navigation/native";

export const HistoryDetail: FunctionComponent = observer((props) => {
  const { chainStore, appInitStore } = useStore();
  // const { chainId } = chainStore.current;
  const params = useRoute().params;
  const chainId = MapNetworkToChainId[params?.item?.network];
  if (!chainId) return;
  return (
    <>
      {mappingChainIdToHistoryScreen(chainId as ChainIdEnum, typeTxEnum.DETAIL)}
    </>
  );
});

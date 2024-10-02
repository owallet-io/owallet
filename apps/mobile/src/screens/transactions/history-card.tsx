import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { View, ViewStyle } from "react-native";
import { useStore } from "../../stores";
import { ChainIdEnum } from "@owallet/common";
import { metrics } from "@src/themes";
import { useGetHeightHeader } from "@src/hooks";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import {
  mappingChainIdToHistoryScreen,
  typeTxEnum,
} from "@src/screens/transactions/tx-helper";
import { tracking } from "@src/utils/tracking";

export const HistoryCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(() => {
  tracking(`History Card`);
  const { chainStore, appInitStore } = useStore();
  const { chainId } = chainStore.current;
  const heightHeader = useGetHeightHeader();
  const heightBottom = useBottomTabBarHeight();
  const containerStyle = {
    minHeight: (metrics.screenHeight - (heightHeader + heightBottom + 100)) / 2,
  };
  return (
    <View style={containerStyle}>
      {mappingChainIdToHistoryScreen(
        appInitStore.getInitApp.isAllNetworks || (chainId as ChainIdEnum),
        typeTxEnum.CARD
      )}
    </View>
  );
});

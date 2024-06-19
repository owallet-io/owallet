import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { View, ViewStyle } from "react-native";
import { useStore } from "../../stores";
import { EmptyTx } from "@src/screens/transactions/components/empty-tx";
import { ChainIdEnum } from "@owallet/common";
import { metrics } from "@src/themes";
import { useGetHeightHeader } from "@src/hooks";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import {
  mappingChainIdToHistoryScreen,
  typeTxEnum,
} from "@src/screens/transactions/tx-helper";
import ByteBrew from "react-native-bytebrew-sdk";

export const HistoryCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(() => {
  ByteBrew.NewCustomEvent(`History Card`);
  const { chainStore, priceStore, appInitStore } = useStore();
  const fiat = priceStore.defaultVsCurrency;
  const { chainId } = chainStore.current;
  const price = priceStore.getPrice(
    chainStore.current.stakeCurrency.coinGeckoId,
    fiat
  );
  const heightHeader = useGetHeightHeader();
  const heightBottom = useBottomTabBarHeight();
  const containerStyle = {
    minHeight: (metrics.screenHeight - (heightHeader + heightBottom + 100)) / 2,
  };
  if (!price)
    return (
      <View style={containerStyle}>
        <EmptyTx />
      </View>
    );

  return (
    <View style={containerStyle}>
      {mappingChainIdToHistoryScreen(
        appInitStore.getInitApp.isAllNetworks || (chainId as ChainIdEnum),
        typeTxEnum.CARD
      )}
    </View>
  );
});

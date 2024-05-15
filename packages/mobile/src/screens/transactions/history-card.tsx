import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useStore } from "../../stores";
import { EmptyTx } from "@src/screens/transactions/components/empty-tx";
import { ChainIdEnum } from "@owallet/common";
import { EvmTxCard } from "@src/screens/transactions/evm/evm-tx-card";
import { BtcTxCard } from "@src/screens/transactions/btc/btc-tx-card";
import { metrics } from "@src/themes";
import { useGetHeightHeader } from "@src/hooks";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { OasisTxCard } from "@src/screens/transactions/oasis/oasis-tx-card";
import { TronTxCard } from "@src/screens/transactions/tron/tron-tx-card";

export const HistoryCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(() => {
  const { chainStore, priceStore } = useStore();
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
  if (chainId === ChainIdEnum.BNBChain || chainId === ChainIdEnum.Ethereum)
    return (
      <View style={containerStyle}>
        <EvmTxCard />
      </View>
    );
  if (
    chainId === ChainIdEnum.Oasis ||
    chainId === ChainIdEnum.OasisSapphire ||
    chainId === ChainIdEnum.OasisEmerald
  )
    return (
      <View style={containerStyle}>
        <OasisTxCard />
      </View>
    );
  if (chainId === ChainIdEnum.Bitcoin)
    return (
      <View style={containerStyle}>
        <BtcTxCard />
      </View>
    );
  if (chainId === ChainIdEnum.TRON)
    return (
      <View style={containerStyle}>
        <TronTxCard />
      </View>
    );
  return (
    <View style={containerStyle}>
      <EmptyTx />
    </View>
  );
});

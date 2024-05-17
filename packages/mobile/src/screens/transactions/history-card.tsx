import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { View, ViewStyle } from "react-native";
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
import { OraichainTxCard } from "@src/screens/transactions/oraichain/oraichain-tx-card";

const mappingChainIdToHistory = (network: ChainIdEnum) => {
  switch (network) {
    case ChainIdEnum.Bitcoin:
      return <BtcTxCard />;
    case ChainIdEnum.Oasis:
    case ChainIdEnum.OasisSapphire:
    case ChainIdEnum.OasisEmerald:
      return <OasisTxCard />;
    case ChainIdEnum.TRON:
      return <TronTxCard />;
    case ChainIdEnum.Ethereum:
    case ChainIdEnum.BNBChain:
      return <EvmTxCard />;
    case ChainIdEnum.Oraichain:
      return <OraichainTxCard />;
    default:
      return <EmptyTx />;
  }
};
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

  return (
    <View style={containerStyle}>
      {mappingChainIdToHistory(chainId as ChainIdEnum)}
    </View>
  );
});

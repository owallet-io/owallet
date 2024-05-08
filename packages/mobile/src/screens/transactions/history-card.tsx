import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useStore } from "../../stores";
import { EmptyTx } from "@src/screens/transactions/components/empty-tx";
import { ChainIdEnum } from "@owallet/common";
import { EvmTxCard } from "@src/screens/transactions/evm/evm-tx-card";
import { BtcTxCard } from "@src/screens/transactions/btc/btc-tx-card";

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
  if (!price) return <EmptyTx />;
  if (chainId === ChainIdEnum.BNBChain || chainId === ChainIdEnum.Ethereum)
    return <EvmTxCard />;
  if (chainId === ChainIdEnum.Bitcoin) return <BtcTxCard />;
  return <EmptyTx />;
});

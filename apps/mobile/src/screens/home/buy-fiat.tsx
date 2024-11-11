import { StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import { WebView } from "react-native-webview";
import { observer } from "mobx-react-lite";
import { useStore } from "@src/stores";
import { metrics } from "@src/themes";
import { ChainIdEnum } from "@owallet/common";
import { useTheme } from "@src/themes/theme-provider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tracking } from "@src/utils/tracking";
const BuyFiat = observer(() => {
  const { accountStore, appInitStore, chainStore } = useStore();
  const { colors } = useTheme();
  const safeAreaInsets = useSafeAreaInsets();

  const theme = appInitStore.getInitApp.theme;

  const [accountList, setAccounts] = useState("");

  const networkList = "ORAICHAIN".split(", ").join(",");

  const cryptoList = "ORAI, USDT, USDC".split(", ").join(",");

  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);

  useEffect(() => {
    setAccounts(`${"ORAICHAIN"}:${accountOrai.bech32Address}`);
  }, [accountOrai.bech32Address]);
  useEffect(() => {
    tracking("Buy ORAI KADO Screen");
  }, []);
  return (
    <View style={[styles.container]}>
      {accountList.length > 0 ? (
        <View style={{ flex: 1 }}>
          <WebView
            originWhitelist={["*"]}
            source={{
              uri: `https://app.kado.money/?onPayCurrency=USD&onPayAmount=200&onRevCurrency=ORAI&offPayCurrency=ORAI&offRevCurrency=USD&network=ORAICHAIN&&onToAddressMulti=${accountList}&cryptoList=${cryptoList}&networkList=${networkList}&dapiKey=${"67ee8355-a3a4-4a88-8af5-3cbc8f3eb155"}&product=BUY&productList=BUY&theme=${theme}"`,
            }}
            style={{
              backgroundColor: colors["neutral-surface-bg"],
            }}
          />
        </View>
      ) : null}
    </View>
  );
});

export default BuyFiat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: metrics.screenWidth,
    height: metrics.screenHeight,
  },
  webview: {},
});

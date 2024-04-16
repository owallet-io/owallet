import { StyleSheet, View, InteractionManager } from "react-native";
import React, { useEffect, useState } from "react";
import { WebView } from "react-native-webview";
import { observer } from "mobx-react-lite";
import { useStore } from "@src/stores";
import { metrics } from "@src/themes";
import { ChainIdEnum, KADOChainNameEnum } from "@owallet/common";
import { PageHeader } from "@src/components/header/header-new";
import { useTheme } from "@src/themes/theme-provider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const BuyFiat = observer(() => {
  const { accountStore, appInitStore, chainStore } = useStore();
  const { colors } = useTheme();
  const safeAreaInsets = useSafeAreaInsets();

  const theme = appInitStore.getInitApp.theme;

  const [accountList, setAccounts] = useState("");

  // const networkList =
  //   "BITCOIN, OSMOSIS, ETHEREUM, JUNO, INJECTIVE, COSMOS HUB, ORAICHAIN"
  //     .split(", ")
  //     .join(",");

  // const cryptoList = "ORAI, USDT, USDC, ETH, OSMO, ATOM, INJ, wETH"
  //   .split(", ")
  //   .join(",");

  const networkList = "ETHEREUM, ORAICHAIN".split(", ").join(",");

  const cryptoList = "ORAI, USDT, USDC, ETH".split(", ").join(",");

  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
  const accountEth = accountStore.getAccount(ChainIdEnum.Ethereum);

  useEffect(() => {
    // InteractionManager.runAfterInteractions(() => {
    //   let accounts = {};
    //   let defaultEvmAddress = accountEth.evmosHexAddress;
    //   Object.keys(ChainIdEnum).map((key) => {
    //     // let defaultCosmosAddress = accountStore.getAccount(
    //     //   ChainIdEnum[key]
    //     // ).bech32Address;
    //     // if (defaultCosmosAddress.startsWith("evmos")) {
    //     //   accounts[KADOChainNameEnum[ChainIdEnum[key]]] = defaultEvmAddress;
    //     // }
    //     // else {
    //     //   accounts[KADOChainNameEnum[ChainIdEnum[key]]] = defaultCosmosAddress;
    //     // }
    //   });
    //   let tmpAccounts = "";
    //   Object.keys(accounts).map((a) => {
    //     tmpAccounts += `${a}:${accounts[a]},`;
    //   });
    //   setAccounts(tmpAccounts);
    // });
    setAccounts(
      `${"ORAICHAIN"}:${accountOrai.bech32Address},${"ETHEREUM"}:${
        accountOrai.evmosHexAddress
      }`
    );
  }, [accountEth.evmosHexAddress]);

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      <PageHeader title="Buy" subtitle={chainStore.current.chainName} />
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

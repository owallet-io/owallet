import { StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import { WebView } from "react-native-webview";
import { observer } from "mobx-react-lite";
import { useStore } from "@src/stores";
import { colors, metrics } from "@src/themes";
import { ChainIdEnum, KADOChainNameEnum } from "@owallet/common";
const BuyFiat = observer(() => {
  const { accountStore, appInitStore } = useStore();

  const theme = appInitStore.getInitApp.theme;

  const [accountList, setAccounts] = useState("");

  const networkList =
    "BITCOIN, OSMOSIS, ETHEREUM, JUNO, INJECTIVE, COSMOS HUB, ORAICHAIN"
      .split(", ")
      .join(",");

  const cryptoList =
    "ORAI, USDT, USDC, ETH, OSMO, ATOM, BTC, INJ, wETH, wBTC, USDC.e"
      .split(", ")
      .join(",");

  let accounts = {};

  const delayedFunction = async () => {
    Object.keys(ChainIdEnum).map((key) => {
      if (KADOChainNameEnum[ChainIdEnum[key]]) {
        let defaultAddress = accountStore.getAccount(
          ChainIdEnum[key]
        ).bech32Address;
        if (defaultAddress.startsWith("evmos")) {
          accounts[KADOChainNameEnum[ChainIdEnum[key]]] =
            accountStore.getAccount(ChainIdEnum[key]).evmosHexAddress;
        } else {
          accounts[KADOChainNameEnum[ChainIdEnum[key]]] = defaultAddress;
        }
      }
    });

    let tmpAccounts = "";

    Object.keys(accounts).map((a) => {
      tmpAccounts += `${a}:${accounts[a]},`;
    });

    setAccounts(tmpAccounts);
  };

  useEffect(() => {
    delayedFunction();
  }, []);

  return (
    <View style={styles.container}>
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

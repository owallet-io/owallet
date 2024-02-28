import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { WebView } from "react-native-webview";
import { observer } from "mobx-react-lite";
import { useStore } from "@src/stores";
const BtcFaucet = observer(() => {
  const { chainStore, accountStore, queriesStore, keyRingStore, modalStore } =
    useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const address = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
  );
  return (
    <View
      style={{
        flex: 1,
      }}
    >
      {!!address && (
        <WebView
          javaScriptEnabled={true}
          injectedJavaScript={`
              const inputValue = document.getElementById('validationTooltipAddress');
              
              if(!!inputValue){
                  inputValue.value='${address}'   
                  }
              `}
          source={{ uri: "https://bitcoinfaucet.uo1.net/" }}
          onMessage={(event) => {}}
          style={{ flex: 1 }}
        />
      )}
    </View>
  );
});

export default BtcFaucet;

const styles = StyleSheet.create({});

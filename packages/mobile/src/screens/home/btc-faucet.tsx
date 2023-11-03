import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { WebView } from 'react-native-webview';
import { observer } from 'mobx-react-lite';
import { useStore } from '@src/stores';
const BtcFaucet = observer(() => {
  // console.log('🚀 ~ file: btc-faucet.tsx:5 ~ BtcFaucet ~ address:', address);
  const {
    chainStore,
    accountStore,
    queriesStore,

    modalStore
  } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);
  return (
    <View
      style={{
        flex: 1
      }}
    >
      {!!account.bech32Address && (
        <WebView
          javaScriptEnabled={true}
          injectedJavaScript={`
              const inputValue = document.getElementById('validationTooltipAddress');
              console.log(inputValue,"inputValue");
              if(!!inputValue){
                  inputValue.value='${account.bech32Address}'   
                  }
                  setTimeout(()=>{
                    const btnSend = document.getElementsByClassName("g-recaptcha btn btn-primary"); 
                    btnSend[0].click();
                },2000)
              `}
          source={{ uri: 'https://bitcoinfaucet.uo1.net/' }}
          onMessage={(event) => {}}
          style={{ flex: 1 }}
        />
      )}
    </View>
  );
});

export default BtcFaucet;

const styles = StyleSheet.create({});

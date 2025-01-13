import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { SendOasisScreen } from "@screens/send/send-oasis";
import { SendTronScreen } from "@screens/send/send-tron";
import { SendBtcScreen } from "@screens/send/send-btc";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { SendCosmosScreen } from "@screens/send/send-cosmos";
import { goBack } from "@src/router/root";
import { OWHeaderTitle } from "@components/header";
import { DenomHelper } from "@owallet/common";
import { capitalizedText } from "@utils/helper";
import { SendEvmScreen } from "@src/screens/send/send-evm";

export const SendScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId: string;
          recipientAddress?: string;
          coinMinimalDenom: string;
        }
      >,
      string
    >
  >();
  const { chainStore } = useStore();
  const initialChainId = route.params?.["chainId"];
  const initialCoinMinimalDenom = route.params?.["coinMinimalDenom"];
  const initialRecipientAddress = route.params?.["recipientAddress"];
  const chainIdInit = initialChainId || chainStore.current.chainId;
  const [chainId, setChainId] = useState(chainIdInit);
  const chainInfo = chainStore.getChain(chainId);
  const coinMinimalDenomInit =
    initialCoinMinimalDenom || chainInfo.currencies[0].coinMinimalDenom;
  useEffect(() => {
    if (!initialChainId || !initialCoinMinimalDenom) {
      goBack();
    }
  }, [initialChainId, initialCoinMinimalDenom]);
  const navigation = useNavigation();

  const [coinMinimalDenom, setCoinMinimalDenom] =
    useState(coinMinimalDenomInit);
  const setSelectedKey = (key) => {
    if (!key) return;
    const [chainId, coinMinimalDenom] = key.split("|");
    if (!chainId || !coinMinimalDenom) return;
    setChainId(chainId);
    setCoinMinimalDenom(coinMinimalDenom);
  };
  useEffect(() => {
    const denomHelper = new DenomHelper(coinMinimalDenom);
    const isBtc = chainInfo.features.includes("btc");
    navigation.setOptions({
      headerTitle: () => (
        <OWHeaderTitle
          title={"Send"}
          subTitle={`${chainInfo.chainName}${
            isBtc ? ` ${capitalizedText(denomHelper.type)}` : ""
          }`}
        />
      ),
    });
  }, [coinMinimalDenom, chainId]);
  const sendGetters = {
    oasis: (
      <SendOasisScreen
        setSelectedKey={setSelectedKey}
        chainId={chainId}
        coinMinimalDenom={coinMinimalDenom}
        recipientAddress={initialRecipientAddress}
      />
    ),
    tron: (
      <SendTronScreen
        setSelectedKey={setSelectedKey}
        chainId={chainId}
        coinMinimalDenom={coinMinimalDenom}
        recipientAddress={initialRecipientAddress}
      />
    ),
    btc: (
      <SendBtcScreen
        setSelectedKey={setSelectedKey}
        chainId={chainId}
        coinMinimalDenom={coinMinimalDenom}
        recipientAddress={initialRecipientAddress}
      />
    ),
  };
  for (const feature of chainInfo.features) {
    if (sendGetters[feature]) {
      return sendGetters[feature];
    }
  }
  if (chainId?.includes("eip155")) {
    return (
      <SendEvmScreen
        setSelectedKey={setSelectedKey}
        chainId={chainId}
        coinMinimalDenom={coinMinimalDenom}
        recipientAddress={initialRecipientAddress}
      />
    );
  }
  return (
    <SendCosmosScreen
      setSelectedKey={setSelectedKey}
      chainId={chainId}
      coinMinimalDenom={coinMinimalDenom}
      recipientAddress={initialRecipientAddress}
    />
  );
});

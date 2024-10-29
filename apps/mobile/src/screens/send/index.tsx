import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { SendOasisScreen } from "@screens/send/send-oasis";
import { SendTronScreen } from "@screens/send/send-tron";
import { SendBtcScreen } from "@screens/send/send-btc";
import { RouteProp, useRoute } from "@react-navigation/native";
import { SendCosmosScreen } from "@screens/send/send-cosmos";
import { goBack } from "@src/router/root";

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

  const [coinMinimalDenom, setCoinMinimalDenom] =
    useState(coinMinimalDenomInit);
  const setSelectedKey = (key) => {
    if (!key) return;
    const [chainId, coinMinimalDenom] = key.split("|");
    if (!chainId || !coinMinimalDenom) return;
    setChainId(chainId);
    setCoinMinimalDenom(coinMinimalDenom);
  };
  const sendGetters = {
    oasis: (
      <SendOasisScreen
        setSelectedKey={setSelectedKey}
        chainId={chainId}
        coinMinimalDenom={coinMinimalDenom}
        recipientAddress={initialRecipientAddress}
      />
    ),
    tron: <SendTronScreen />,
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

  return (
    <SendCosmosScreen
      setSelectedKey={setSelectedKey}
      chainId={chainId}
      coinMinimalDenom={coinMinimalDenom}
      recipientAddress={initialRecipientAddress}
    />
  );
});

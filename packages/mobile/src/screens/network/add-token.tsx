import { PageHeader } from "@src/components/header/header-new";
import { DownArrowIcon } from "@src/components/icon";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import OWText from "@src/components/text/ow-text";
import { useStore } from "@src/stores";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { NetworkModalCustom } from "../home/components/network-modal-custom";
import { AddTokenCosmosScreen } from "./add-token-cosmos";
import { AddTokenEVMScreen } from "./add-token-evm";
import ByteBrew from "react-native-bytebrew-sdk";

export const AddTokenScreen = observer(() => {
  const { modalStore } = useStore();
  const [selectedChain, setChain] = useState(null);
  const { colors } = useTheme();
  useEffect(() => {
    ByteBrew.NewCustomEvent(`Add Token Screen`);
  }, []);
  const onSelectChain = (chain) => {
    setChain(chain);
    modalStore.close();
  };

  const _onPressNetworkModal = () => {
    modalStore.setOptions({
      bottomSheetModalConfig: {
        enablePanDownToClose: false,
        enableOverDrag: false,
      },
    });
    modalStore.setChildren(
      <NetworkModalCustom
        customAction={onSelectChain}
        selectedChain={selectedChain?.chainId}
      />
    );
  };

  if (selectedChain) {
    // if (selectedChain.features.includes("cosmwasm")) {
    if (selectedChain.networkType === "cosmos") {
      return (
        <AddTokenCosmosScreen
          _onPressNetworkModal={_onPressNetworkModal}
          selectedChain={selectedChain}
        />
      );
    } else {
      return (
        <AddTokenEVMScreen
          _onPressNetworkModal={_onPressNetworkModal}
          selectedChain={selectedChain}
        />
      );
    }
  }

  return (
    <PageWithBottom showBottom={false}>
      <PageHeader title="Add Token" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          onPress={_onPressNetworkModal}
          style={{
            borderColor: colors["neutral-border-strong"],
            borderRadius: 12,
            borderWidth: 1,
            margin: 16,
            padding: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <OWText style={{ paddingRight: 4 }}>Select Chain</OWText>
            <DownArrowIcon height={10} color={colors["neutral-text-title"]} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </PageWithBottom>
  );
});

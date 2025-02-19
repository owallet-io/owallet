import { DownArrowIcon } from "@src/components/icon";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import OWText from "@src/components/text/ow-text";
import { useStore } from "@src/stores";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { AddTokenCosmosScreen } from "./add-token-cosmos";
import { AddTokenEVMScreen } from "./add-token-evm";

import { NetworkModal } from "../home/components";
import { tracking } from "@src/utils/tracking";

export const AddTokenScreen = observer(() => {
  const { modalStore, chainStore } = useStore();

  const { colors } = useTheme();
  useEffect(() => {
    tracking(`Add Token Screen`);
  }, []);

  const _onPressNetworkModal = () => {
    modalStore.setOptions({
      bottomSheetModalConfig: {
        enablePanDownToClose: false,
        enableOverDrag: false,
      },
    });
    modalStore.setChildren(<NetworkModal hideAllNetwork={true} />);
  };
  const chainId = chainStore.current["chainId"];
  if (!chainStore.isEvmOnlyChain(chainId)) {
    return <AddTokenCosmosScreen _onPressNetworkModal={_onPressNetworkModal} />;
  } else if (chainStore.isEvmOnlyChain(chainId)) {
    return <AddTokenEVMScreen _onPressNetworkModal={_onPressNetworkModal} />;
  }

  return (
    <PageWithBottom showBottom={false}>
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

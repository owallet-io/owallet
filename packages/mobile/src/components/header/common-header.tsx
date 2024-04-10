import React, { FunctionComponent } from "react";
import { View, TouchableOpacity } from "react-native";
import OWIcon from "../ow-icon/ow-icon";
import { PageHeader } from "./header-new";
import OWText from "../text/ow-text";
import { useTheme } from "@src/themes/theme-provider";
import { useStore } from "@src/stores";
import { DownArrowIcon } from "../icon";
import { NetworkModal } from "@src/screens/home/components";
import { SCREENS } from "@src/common/constants";
import { useNavigation } from "@react-navigation/native";

export const CommonPageHeader: FunctionComponent<{ title: string }> = ({
  title,
}) => {
  const navigation = useNavigation();
  const { chainStore, appInitStore, modalStore } = useStore();
  const { colors } = useTheme();

  const onScan = () => {
    navigation.navigate(SCREENS.STACK.Others, {
      screen: SCREENS.Camera,
    });
    return;
  };

  const onAddWallet = () => {
    navigation.navigate("Register", {
      screen: "Register.Intro",
    });
  };

  const _onPressNetworkModal = () => {
    modalStore.setOptions({
      bottomSheetModalConfig: {
        enablePanDownToClose: false,
        enableOverDrag: false,
      },
    });
    modalStore.setChildren(<NetworkModal />);
  };

  return (
    <View>
      <PageHeader
        left={<View style={{ width: 44, height: 44 }} />}
        middle={
          <View style={{ alignItems: "center" }}>
            <OWText color={colors["neutral-text-title"]} weight="700" size={16}>
              {title.toUpperCase()}
            </OWText>
            <TouchableOpacity
              onPress={_onPressNetworkModal}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingTop: 3,
              }}
            >
              <OWText
                style={{ paddingRight: 6 }}
                color={colors["neutral-text-title"]}
                size={13}
              >
                {appInitStore.getInitApp.isAllNetworks
                  ? "All networks"
                  : chainStore.current.chainName}
              </OWText>
              <DownArrowIcon height={10} color={colors["neutral-text-title"]} />
            </TouchableOpacity>
          </View>
        }
        colors={colors}
        right={
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={onScan}
              style={{
                backgroundColor: colors["neutral-surface-card"],
                padding: 6,
                borderRadius: 999,
                marginRight: 8,
              }}
            >
              <OWIcon size={22} name="scan" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onAddWallet}
              style={{
                backgroundColor: colors["neutral-surface-card"],
                padding: 6,
                borderRadius: 999,
              }}
            >
              <OWIcon size={22} name="wallet" />
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

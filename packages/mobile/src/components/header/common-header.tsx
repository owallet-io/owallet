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
import { metrics } from "@src/themes";
import { observer } from "mobx-react-lite";

export const CommonPageHeader: FunctionComponent<{ title: string }> = observer(
  ({ title }) => {
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
          left={<View style={{ width: metrics.screenWidth / 6 }} />}
          middle={
            <TouchableOpacity
              onPress={_onPressNetworkModal}
              style={{ alignItems: "center" }}
            >
              <OWText
                color={colors["neutral-text-title"]}
                weight="700"
                size={16}
              >
                {title.toUpperCase()}
              </OWText>
              <View
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
                <DownArrowIcon
                  height={10}
                  color={colors["neutral-text-title"]}
                />
              </View>
            </TouchableOpacity>
          }
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
                <OWIcon
                  size={22}
                  name="tdesignscan"
                  color={colors["neutral-text-title"]}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onAddWallet}
                style={{
                  backgroundColor: colors["neutral-surface-card"],
                  padding: 6,
                  borderRadius: 999,
                }}
              >
                <OWIcon
                  size={22}
                  name="tdesignwallet"
                  color={colors["neutral-text-title"]}
                />
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    );
  }
);

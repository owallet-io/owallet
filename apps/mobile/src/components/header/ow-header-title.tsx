import {
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableNativeFeedback,
  TouchableWithoutFeedbackProps,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { useTheme } from "@src/themes/theme-provider";
import { Text } from "../text";
import { observer } from "mobx-react-lite";
import { useStore } from "@src/stores";
import { NetworkModal } from "@src/screens/home/components";
import { HEADER_KEY } from "@src/common/constants";
import { DownArrowIcon } from "../icon";
import { useNavigation } from "@react-navigation/native";
import OWIcon from "../ow-icon/ow-icon";
import { unknownToken } from "@owallet/common";
import { ChainInfo } from "@owallet/types";

interface IOWHeaderTitle extends TouchableWithoutFeedbackProps {
  title?: string;
  subTitle?: string;
  chainData?: ChainInfo;
}

const OWHeaderTitle = observer(
  ({ title, subTitle, chainData, ...props }: IOWHeaderTitle) => {
    const { chainStore, modalStore, appInitStore } = useStore();
    const { colors } = useTheme();
    const chainInfo = chainStore.getChain(chainStore.current.chainId);

    const navigation = useNavigation();
    const currentTab =
      navigation.getState().routeNames[navigation.getState().index];

    const _onPressNetworkModal = () => {
      modalStore.setOptions({
        bottomSheetModalConfig: {
          enablePanDownToClose: false,
          enableOverDrag: false,
        },
      });
      modalStore.setChildren(<NetworkModal />);
    };
    if (title === HEADER_KEY.showNetworkHeader)
      return (
        <TouchableOpacity onPress={_onPressNetworkModal} {...props}>
          <View style={styles.containerTitle}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {appInitStore.getInitApp.isAllNetworks ? (
                <OWIcon
                  name={"tdesignblockchain"}
                  size={20}
                  color={colors["neutral-text-title"]}
                />
              ) : (
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 32,
                    backgroundColor: colors["neutral-icon-on-dark"],
                  }}
                >
                  <OWIcon
                    type="images"
                    source={{
                      uri: chainInfo?.chainSymbolImageUrl,
                    }}
                    style={{
                      borderRadius: 999,
                    }}
                    size={20}
                  />
                </View>
              )}
              <Text
                style={{ marginHorizontal: 6 }}
                color={colors["neutral-text-title"]}
                size={16}
                weight="600"
              >
                {appInitStore.getInitApp.isAllNetworks
                  ? "All networks"
                  : chainStore.current.chainName}
              </Text>
              <DownArrowIcon height={10} color={colors["neutral-text-title"]} />
            </View>
          </View>
        </TouchableOpacity>
      );
    if (!!chainData) {
      return (
        <View style={styles.containerTitle}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 26,
                height: 26,
                borderRadius: 999,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: colors["neutral-icon-on-dark"],
              }}
            >
              <OWIcon
                type="images"
                source={{
                  uri:
                    chainData?.chainSymbolImageUrl || unknownToken.coinImageUrl,
                }}
                style={{
                  borderRadius: 999,
                }}
                size={20}
              />
            </View>
            <Text
              style={{ marginHorizontal: 6 }}
              color={colors["neutral-text-title"]}
              size={16}
              weight="600"
            >
              {chainData?.chainName || "Unknown"}
            </Text>
          </View>
        </View>
      );
    }
    return (
      <View style={styles.containerTitle}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            lineHeight: 24,
            color: colors["neutral-text-title"],
            textTransform: "uppercase",
          }}
        >
          {title}
        </Text>
        {subTitle && typeof subTitle === "string" ? (
          <Text color={colors["neutral-text-body"]} size={13}>
            {subTitle}
          </Text>
        ) : null}
      </View>
    );
  }
);
export default OWHeaderTitle;

const styles = StyleSheet.create({
  textHeader: {
    marginHorizontal: 8,
  },
  containerTitle: {
    // flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

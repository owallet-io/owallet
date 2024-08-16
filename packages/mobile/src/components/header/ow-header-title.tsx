import { StyleSheet, TouchableWithoutFeedback, TouchableWithoutFeedbackProps, View } from "react-native";
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

interface IOWHeaderTitle extends TouchableWithoutFeedbackProps {
  title?: string;
}
const OWHeaderTitle = observer(({ title, ...props }: IOWHeaderTitle) => {
  const { chainStore, modalStore, appInitStore } = useStore();
  const { colors } = useTheme();
  const chainInfo = chainStore.getChain(chainStore.current.chainId);

  // const navigation = useNavigation();
  // const currentTab = navigation.getState().routeNames[navigation.getState().index];

  const _onPressNetworkModal = () => {
    modalStore.setOptions({
      bottomSheetModalConfig: {
        enablePanDownToClose: false,
        enableOverDrag: false
      }
    });
    modalStore.setChildren(<NetworkModal />);
  };
  if (title === HEADER_KEY.showNetworkHeader)
    return (
      <TouchableWithoutFeedback onPress={_onPressNetworkModal} {...props}>
        <View style={styles.containerTitle}>
          {/* <Text color={colors["neutral-text-title"]} weight="700" size={16}>
            {currentTab.toUpperCase() ?? "ASSETS"}
          </Text> */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center"
            }}
          >
            {appInitStore.getInitApp.isAllNetworks ? (
              <OWIcon name={"tdesignblockchain"} size={20} color={colors["neutral-text-title"]} />
            ) : (
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 32,
                  backgroundColor: colors["neutral-icon-on-dark"]
                }}
              >
                <OWIcon
                  type="images"
                  source={{
                    uri: chainInfo?.stakeCurrency?.coinImageUrl
                  }}
                  size={20}
                />
              </View>
            )}
            <Text style={{ marginHorizontal: 6 }} color={colors["neutral-text-title"]} size={16} weight="600">
              {appInitStore.getInitApp.isAllNetworks ? "All networks" : chainStore.current.chainName}
            </Text>
            <DownArrowIcon height={10} color={colors["neutral-text-title"]} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    );

  return (
    <View style={styles.containerTitle}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          lineHeight: 24,
          color: colors["neutral-text-title"],
          textTransform: "uppercase"
        }}
      >
        {title}
      </Text>
    </View>
  );
});
export default OWHeaderTitle;

const styles = StyleSheet.create({
  textHeader: {
    marginHorizontal: 8
  },
  containerTitle: {
    // flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  }
});

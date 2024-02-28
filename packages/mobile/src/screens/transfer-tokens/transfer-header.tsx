import React, { FunctionComponent } from "react";
import {
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import { Text } from "@src/components/text";
import {
  DotsIcon,
  HistoryIcon,
  LeftArrowIcon,
  Scanner,
} from "../../components/icon";
import { useStore } from "../../stores";
import { colors, spacing, typography } from "../../themes";

const styles = StyleSheet.create({
  transferHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: spacing["24"],
    marginTop: 24,
    marginBottom: 16,
  },
  transferFlex: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
});

const TransferTokensHeader: FunctionComponent<{ styleCustom?: any }> = ({
  styleCustom,
}) => {
  const { chainStore } = useStore();

  return (
    <View style={{ ...styles.transferHeader, ...styleCustom }}>
      <LeftArrowIcon />
      <TouchableWithoutFeedback>
        <View style={styles.transferFlex}>
          <DotsIcon />
          <Text
            style={{
              ...typography["h5"],
              ...colors["color-text-black-low"],
              marginLeft: spacing["8"],
              fontSize: spacing["16"],
              fontWeight: "400",
            }}
          >
            {chainStore.current.chainName + " " + "Network"}
          </Text>
        </View>
      </TouchableWithoutFeedback>
      <View style={styles.transferFlex}>
        <TouchableOpacity>
          <HistoryIcon size={24} />
        </TouchableOpacity>
        <TouchableOpacity style={{ marginLeft: 18 }}>
          <Scanner size={24} color={colors["gray-700"]} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TransferTokensHeader;

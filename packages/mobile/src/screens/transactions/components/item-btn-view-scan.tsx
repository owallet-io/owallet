import {
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import React from "react";
import { Text } from "@src/components/text";
import { colors } from "@src/themes";
import OWIcon from "@src/components/ow-icon/ow-icon";
export type IItemBtnViewOnScan = TouchableOpacityProps;
const ItemBtnViewOnScan = (props: TouchableOpacityProps) => {
  return (
    <TouchableOpacity {...props}>
      <View style={styles.container}>
        <OWIcon
          color={colors["primary-surface-default"]}
          size={20}
          name="eye"
        />
        <Text
          size={16}
          style={styles.txtView}
          weight="400"
          color={colors["primary-surface-default"]}
        >
          View on scan
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ItemBtnViewOnScan;

const styles = StyleSheet.create({
  txtView: {
    paddingLeft: 10,
  },
  container: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    height: 50,
  },
});

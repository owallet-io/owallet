import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { Card, OWBox } from "../../../components/card";
import { Text } from "@src/components/text";
import { View, ViewStyle, StyleSheet } from "react-native";
import { spacing } from "../../../themes";
import { useStore } from "../../../stores";
import { useTheme } from "@src/themes/theme-provider";

export const InfoCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({}) => {
  const { chainStore } = useStore();
  const { colors } = useTheme();
  const styles = styling(colors);
  return (
    <OWBox>
      <View style={styles.headerWrapper}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingBottom: spacing["8"],
          }}
        >
          <View
            style={{
              width: 12,
              height: 24,
              backgroundColor: "#B1E5FC",
              borderRadius: 4,
              marginRight: 8,
            }}
          />
          <Text
            style={{
              color: colors["primary-text"],
              fontWeight: "700",
              fontSize: 14,
            }}
          >
            Get more information!
          </Text>
        </View>
        <Text
          style={{
            color: colors["primary-text"],
            fontWeight: "400",
            fontSize: 14,
            lineHeight: 20,
          }}
        >
          For more details about{" "}
          <Text
            style={{
              color: colors["primary-text"],
              fontWeight: "700",
              fontSize: 14,
              lineHeight: 20,
            }}
          >
            {chainStore.current.chainName}
          </Text>{" "}
          and more, please visit{" "}
          <Text
            style={{
              color: "#4C72F9",
              fontWeight: "400",
              fontSize: 14,
              lineHeight: 20,
            }}
          >
            {"info.oraidex.io"}
          </Text>
        </Text>
      </View>
    </OWBox>
  );
});

const styling = (colors) =>
  StyleSheet.create({
    headerWrapper: {
      paddingBottom: 20,
    },
    card: {
      padding: spacing["28"],
      paddingBottom: spacing["14"],
      marginBottom: spacing["32"],
      borderRadius: spacing["24"],
      backgroundColor: colors["primary"],
    },
  });

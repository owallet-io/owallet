import { StyleSheet, View } from "react-native";
import React, { FC, ReactNode } from "react";
import { Text } from "@src/components/text";
import { useTheme } from "@src/themes/theme-provider";
import ItemDivided from "./item-divided";
import { OWTextProps } from "@src/components/text/ow-text";
import OWIcon from "@src/components/ow-icon/ow-icon";

const ItemDetail: FC<{
  label?: string;
  value?: string | ReactNode;
  borderBottom?: boolean;
  valueProps?: OWTextProps;
  iconComponent?: React.ReactNode;
}> = ({
  label = "--",
  value = "--",
  borderBottom = true,
  valueProps,
  iconComponent,
}) => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors["neutral-surface-card"],
      }}
    >
      <View style={styles.containerItemDetail}>
        <Text color={colors["neutral-text-title"]} size={16} weight={"600"}>
          {label}
        </Text>
        <View style={styles.wrapRightItem}>
          {iconComponent && (
            <View
              style={{
                paddingHorizontal: 10,
              }}
            >
              {iconComponent}
            </View>
          )}
          {typeof value === "string" ? (
            <Text
              size={16}
              color={colors["text-title-login"]}
              // variant="body1"
              {...valueProps}
            >
              {value}
            </Text>
          ) : (
            value
          )}
        </View>
      </View>
      {borderBottom && <ItemDivided />}
    </View>
  );
};

export default ItemDetail;

const styles = StyleSheet.create({
  wrapRightItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  containerItemDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 56,
  },
});

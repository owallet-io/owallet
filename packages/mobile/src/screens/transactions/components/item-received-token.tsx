import { Clipboard, StyleSheet, View } from "react-native";
import React, { FC, ReactNode, useCallback } from "react";
import { useTheme } from "@src/themes/theme-provider";
import OWButtonIcon from "@src/components/button/ow-button-icon";
import { Text } from "@src/components/text";
import ItemDivided from "./item-divided";
import { OWTextProps } from "@src/components/text/ow-text";
import { useSimpleTimer } from "@src/hooks";
import OWIcon from "@src/components/ow-icon/ow-icon";

const ItemReceivedToken: FC<{
  label?: string;
  value?: string;
  borderBottom?: boolean;
  btnCopy?: boolean;
  IconRightComponent?: ReactNode;
  valueProps?: OWTextProps;
  valueDisplay?: string | ReactNode;
  colorIconRight?: string;
}> = ({
  label = "--",
  value = "",
  valueDisplay = "--",
  borderBottom = true,
  btnCopy = true,
  valueProps,
  IconRightComponent,
  colorIconRight,
}) => {
  const { colors } = useTheme();
  const styles = styling();
  const { isTimedOut, setTimer } = useSimpleTimer();
  const onCopy = useCallback(() => {
    Clipboard.setString(value?.trim());
    setTimer(2000);
  }, [value]);
  return (
    <View
      style={{
        backgroundColor: colors["neutral-surface-card"],
      }}
    >
      <View style={styles.containerItemReceivedToken}>
        <View style={styles.flex_1}>
          <Text weight={"600"} size={16} color={colors["neutral-text-title"]}>
            {label}
          </Text>
          {typeof valueDisplay == "string" ? (
            <Text
              size={16}
              weight={"400"}
              color={colors["neutral-text-body"]}
              {...valueProps}
            >
              {valueDisplay || "--"}
            </Text>
          ) : (
            valueDisplay
          )}
        </View>
        {btnCopy && (
          <View>
            {isTimedOut ? (
              <OWIcon
                name="check_stroke"
                size={20}
                color={colors["green-500"]}
              />
            ) : (
              <OWButtonIcon
                name="tdesigncopy"
                style={styles.iconCopy}
                sizeIcon={20}
                fullWidth={false}
                onPress={onCopy}
                colorIcon={colorIconRight ?? colors["primary-surface-default"]}
              />
            )}
          </View>
        )}
        {IconRightComponent && IconRightComponent}
      </View>
      {borderBottom && <ItemDivided />}
    </View>
  );
};

export default ItemReceivedToken;

const styling = () => {
  return StyleSheet.create({
    containerItemReceivedToken: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      height: 56,
    },
    flex_1: {
      flex: 1,
    },
    iconCopy: {
      paddingRight: 0,
      padding: 18,
    },
  });
};

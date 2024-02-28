import React, { FunctionComponent } from "react";
import { useStyle } from "../../../styles";
import { StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import { Text } from "@src/components/text";
import { RightArrowIcon } from "../../../components/icon";
import { RectButton } from "../../../components/rect-button";
import { spacing, typography } from "../../../themes";
import { useTheme } from "@src/themes/theme-provider";
// useTheme
export const SettingSectionTitle: FunctionComponent<{
  title: string;
}> = ({ title }) => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: spacing["20"],
        paddingTop: spacing["16"],
        paddingBottom: spacing["4"],
      }}
    >
      <Text
        style={{
          ...typography.h4,
          color: colors["primary-text"],
          fontWeight: "700",
        }}
      >
        {title}
      </Text>
    </View>
  );
};

export const SettingItem: FunctionComponent<{
  containerStyle?: ViewStyle;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  paragraphStyle?: TextStyle;

  label: string;
  paragraph?: string;
  left?: React.ReactElement;
  right?: React.ReactElement;

  onPress?: () => void;

  topBorder?: boolean;
}> = ({
  containerStyle,
  style: propStyle,
  labelStyle,
  paragraphStyle,
  label,
  paragraph,
  left,
  right,
  onPress,
}) => {
  const { colors } = useTheme();
  const styles = styling(colors);

  const renderChildren = () => {
    return (
      <React.Fragment>
        {left}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              ...styles.defaultLabel,
              ...labelStyle,
            }}
          >
            {label}
          </Text>
          {paragraph ? (
            <Text
              style={{
                ...styles.defaultLabel,
                ...paragraphStyle,
              }}
            >
              {paragraph}
            </Text>
          ) : null}
        </View>
        {right ? (
          <React.Fragment>
            <View style={{ flex: 1 }} />
            {right}
          </React.Fragment>
        ) : null}
      </React.Fragment>
    );
  };

  return (
    <View style={containerStyle}>
      {onPress ? (
        <RectButton
          style={{
            ...styles.defaultBtn,
            ...propStyle,
          }}
          onPress={onPress}
        >
          {renderChildren()}
        </RectButton>
      ) : (
        <View
          style={{
            ...styles.defaultBtn,
            ...propStyle,
          }}
        >
          {renderChildren()}
        </View>
      )}
    </View>
  );
};

export const RightArrow: FunctionComponent<{
  paragraph?: string;
}> = ({ paragraph }) => {
  const style = useStyle();

  return (
    <React.Fragment>
      {paragraph ? (
        <Text
          style={style.flatten([
            "body1",
            "color-text-black-low",
            "margin-right-16",
          ])}
        >
          {paragraph}
        </Text>
      ) : null}
      <RightArrowIcon
        color={style.get("color-text-black-low").color}
        height={15}
      />
    </React.Fragment>
  );
};

const styling = (colors) =>
  StyleSheet.create({
    defaultLabel: {
      ...typography.h6,
      color: colors["primary-text"],
    },
    defaultBtn: {
      backgroundColor: colors["background-box"],
      height: 62,
      paddingHorizontal: spacing["20"],
      flexDirection: "row",
      alignItems: "center",
    },
  });

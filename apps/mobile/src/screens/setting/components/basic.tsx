import React, { FunctionComponent } from "react";
import {
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { Text } from "@src/components/text";
import { RectButton } from "../../../components/rect-button";
import { spacing, typography } from "../../../themes";
import { useTheme } from "@src/themes/theme-provider";
import OWIcon from "@src/components/ow-icon/ow-icon";
import OWText from "@src/components/text/ow-text";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
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

export const BasicSettingItem: FunctionComponent<{
  containerStyle?: ViewStyle;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  paragraphStyle?: TextStyle;
  icon?: string;
  paragraph?: string;
  subtitle?: string;
  left?: React.ReactElement;
  right?: React.ReactElement;
  onPress?: () => void;
  topBorder?: boolean;
}> = ({
  containerStyle,
  paragraphStyle,
  icon,
  paragraph,
  subtitle,
  right,
  left,
  onPress,
}) => {
  const { colors } = useTheme();
  const styles = styling(colors);

  const renderChildren = () => {
    return (
      <React.Fragment>
        <View style={styles.itemWrapper}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {left ?? (
              <View style={styles.icon}>
                {
                  <OWIcon
                    color={colors["neutral-icon-on-light"]}
                    name={icon ?? "wallet"}
                    size={16}
                  />
                }
              </View>
            )}
            <View>
              <OWText style={paragraphStyle} size={16} weight="600">
                {paragraph ?? ""}
              </OWText>
              {subtitle ? (
                <OWText color={colors["neutral-text-body"]}>{subtitle}</OWText>
              ) : null}
            </View>
          </View>

          <TouchableOpacity onPress={onPress}>
            {right ?? (
              <OWIcon
                name="chevron_right"
                color={colors["neutral-text-title"]}
                size={16}
              />
            )}
          </TouchableOpacity>
        </View>
      </React.Fragment>
    );
  };

  return (
    <View style={containerStyle}>
      {onPress ? (
        <TouchableWithoutFeedback onPress={onPress}>
          {renderChildren()}
        </TouchableWithoutFeedback>
      ) : (
        <View>{renderChildren()}</View>
      )}
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

const styling = (colors) =>
  StyleSheet.create({
    defaultLabel: {
      ...typography.h6,
      color: colors["primary-text"],
    },
    defaultBtn: {
      backgroundColor: colors["neutral-surface-bg2"],
      height: 62,
      paddingHorizontal: spacing["20"],
      flexDirection: "row",
      alignItems: "center",
    },
    icon: {
      borderRadius: 99,
      marginRight: 16,
      backgroundColor: colors["neutral-surface-action"],
      padding: 16,
    },
    itemWrapper: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderRadius: 12,

      paddingVertical: 8,
      backgroundColor: colors["neutral-surface-card"],
      marginBottom: 16,
    },
  });

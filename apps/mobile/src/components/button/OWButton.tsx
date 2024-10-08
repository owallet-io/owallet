import {
  TouchableOpacityProps,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  TextStyle,
  ViewStyle,
  View,
} from "react-native";
import React, { FunctionComponent } from "react";
import { useMapStyles } from "./hooks";
import { LoadingSpinner } from "../spinner";
import { useTheme } from "@src/themes/theme-provider";
import OWText, { OWTextProps } from "../text/ow-text";

export interface IOWButtonProps extends TouchableOpacityProps {
  type?: "primary" | "secondary" | "link" | "modal" | "danger";
  size?: "medium" | "small" | "large" | "default";
  textVariant?: OWTextProps["variant"];
  textTypo?: OWTextProps["typo"];
  label?: string;
  style?: StyleProp<ViewStyle | any>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
  circle?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  contentAlign?: "left" | "center" | "right";
  borderStyle?: "dashed" | "none";
  colorLoading?: TextStyle["color"];
  iconRight?: React.ReactNode;
}

const OWButton: FunctionComponent<IOWButtonProps> = ({
  label,
  type = "primary",
  size = "large",
  style,
  textVariant = "body1",
  textTypo,
  textStyle,
  disabled,
  icon,
  fullWidth = true,
  loading,
  children,
  borderStyle,
  iconRight,
  contentAlign,
  colorLoading = "white",
  ...props
}) => {
  const styleMapped = useMapStyles({ type, disabled, size, contentAlign });
  const styles = styling();
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      {...props}
      disabled={disabled}
      style={[
        styles.containerBtn,
        styleMapped.btn,
        (!fullWidth || (!!icon && !!label == false)) &&
          styles.paddingHaveIconAndNotFullwidth,
        fullWidth ? styles.fullWidth : styles.widthAuto,
        borderStyle == "dashed" && styles.dashed,
        !!icon && !label && styles.hasIcon,
        style,
      ]}
    >
      {loading ? (
        <View>
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LoadingSpinner
              color={colorLoading ?? colors["neutral-text-action-on-dark-bg"]}
              size={20}
            />
          </View>
          <View
            style={{
              opacity: 0,
            }}
          >
            {!!icon && icon}
            {!!label && (
              <OWText
                variant={textVariant}
                typo={textTypo}
                style={[
                  styles.textBtn,
                  styles.iconInBtn,
                  styleMapped.text,
                  textStyle,
                ]}
                color={colors["neutral-text-action-on-dark-bg"]}
              >
                {label}
              </OWText>
            )}
            {!!iconRight && iconRight}
          </View>
        </View>
      ) : (
        <>
          {!!icon && icon}
          {!!label && (
            <OWText
              variant={textVariant}
              typo={textTypo}
              style={[
                styles.textBtn,
                styles.iconInBtn,
                styleMapped.text,
                textStyle,
              ]}
              color={colors["neutral-text-action-on-dark-bg"]}
            >
              {label}
            </OWText>
          )}
          {!!iconRight && iconRight}
        </>
      )}
    </TouchableOpacity>
  );
};

export default OWButton;
const styling = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    paddingHaveIconAndNotFullwidth: { paddingHorizontal: 8 },
    iconInBtn: { paddingHorizontal: 6 },
    dashed: {
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: colors["neutral-border-default"],
    },
    hasIcon: { height: "auto" },
    fullWidth: { width: "100%" },
    containerBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    textBtn: {
      textAlign: "center",
      fontWeight: "700",
      fontSize: 16,
      color: colors["neutral-text-action-on-dark-bg"],
    },
    widthAuto: {
      width: "auto",
    },
  });
};

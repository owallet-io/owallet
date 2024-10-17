import React, { FunctionComponent } from "react";
import { GuideBoxProps } from "./types";
import { Column, Columns } from "../column";
import { Box } from "../box";
// import {InformationIcon} from '../icon/information';
import { useStyle } from "../../styles";
import { Stack } from "../stack";
import { StyleSheet, Text } from "react-native";
import OWIcon from "@components/ow-icon/ow-icon";
import { useTheme } from "@src/themes/theme-provider";

export const GuideBox: FunctionComponent<GuideBoxProps> = ({
  title,
  paragraph,
  color = "default",
  titleRight,
  bottom,
  hideInformationIcon,
  titleStyle,
  backgroundColor,
}) => {
  const style = useStyle();
  const { colors } = useTheme();
  const paragraphColor = (() => {
    switch (color) {
      case "safe":
        return colors["highlight-surface-active"];
      case "warning":
        return colors["warning-surface-default"];
      case "danger":
        return colors["error-surface-default"];
      default:
        return colors["highlight-surface-active"];
    }
  })();
  const titleColor = (() => {
    switch (color) {
      case "safe":
        return colors["highlight-surface-active"];
      case "warning":
        return colors["warning-surface-default"];
      case "danger":
        return colors["error-surface-default"];
      default:
        return colors["highlight-surface-active"];
    }
  })();
  const innerBackgroundColor = (() => {
    if (backgroundColor) {
      return backgroundColor;
    }

    switch (color) {
      case "safe":
        return colors["highlight-surface-active"];
      case "warning":
        return colors["warning-surface-default"];
      case "danger":
        return colors["error-surface-default"];
      default:
        return colors["highlight-surface-active"];
    }
  })();

  return (
    <Box borderRadius={8} padding={18} backgroundColor={innerBackgroundColor}>
      <Stack gutter={8}>
        <Columns sum={1} alignY="center" gutter={6}>
          {!hideInformationIcon ? (
            <OWIcon
              name={"tdesignmap-information"}
              size={20}
              color={titleColor}
            />
          ) : null}
          <Column weight={1}>
            <Text
              style={StyleSheet.flatten([
                style.flatten(["subtitle4"]),
                { color: titleColor },
                titleStyle,
              ])}
            >
              {title}
            </Text>
          </Column>
          {titleRight}
        </Columns>
        {paragraph ? (
          typeof paragraph === "string" ? (
            <Text
              style={StyleSheet.flatten([
                style.flatten(["body2"]),
                { color: paragraphColor },
              ])}
            >
              {paragraph}
            </Text>
          ) : (
            paragraph
          )
        ) : null}
        {bottom ? <Box>{bottom}</Box> : null}
      </Stack>
    </Box>
  );
};

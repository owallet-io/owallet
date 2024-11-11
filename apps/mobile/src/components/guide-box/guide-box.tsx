import React, { FunctionComponent } from "react";
import { GuideBoxProps } from "./types";
import { Column, Columns } from "../column";
import { Box } from "../box";
import { useStyle } from "../../styles";
import { Stack } from "../stack";
import { StyleSheet, Text } from "react-native";
import OWIcon from "@components/ow-icon/ow-icon";
import OWText from "@components/text/ow-text";
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
        return style.get("color-green-400").color;
      case "warning":
        return style.get("color-yellow-500").color;
      case "danger":
        return style.get("color-red-300").color;
      default:
        return colors["neutral-text-body"];
    }
  })();
  const titleColor = (() => {
    switch (color) {
      case "safe":
        return style.get("color-green-400").color;
      case "warning":
        return style.get("color-yellow-400").color;
      case "danger":
        return style.get("color-red-300").color;
      default:
        return colors["neutral-text-body"];
    }
  })();
  const innerBackgroundColor = (() => {
    if (backgroundColor) {
      return backgroundColor;
    }

    switch (color) {
      // case "safe":
      //   return style.get("color-green-800").color;
      // case "warning":
      //   return style.get("color-yellow-800").color;
      // case "danger":
      //   return style.get("color-red-800").color;
      default:
        return colors["neutral-surface-bg2"];
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
            <OWText
              style={StyleSheet.flatten([
                style.flatten(["body2"]),
                { color: paragraphColor },
              ])}
            >
              {paragraph}
            </OWText>
          ) : (
            paragraph
          )
        ) : null}
        {bottom ? <Box>{bottom}</Box> : null}
      </Stack>
    </Box>
  );
};

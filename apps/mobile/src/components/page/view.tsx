import { useTheme } from "@src/themes/theme-provider";
import React, { FunctionComponent } from "react";
import { SafeAreaView, ViewProps, StyleSheet, View } from "react-native";
import { useStyle } from "../../styles";
import { GradientBackground } from "../svg";
import { useSetFocusedScreen } from "./utils";

export const PageWithView: FunctionComponent<
  ViewProps & {
    disableSafeArea?: boolean;
    backgroundColor?: string;
  }
> = (props) => {
  const style = useStyle();

  useSetFocusedScreen();
  const { colors } = useTheme();
  const {
    style: propStyle,
    disableSafeArea,
    backgroundColor = colors["neutral-surface-bg"],
    ...restProps
  } = props;

  return (
    <React.Fragment>
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: -100,
          bottom: -100,
        }}
      >
        {backgroundColor ? (
          <View
            style={{
              width: "100%",
              height: "100%",
              backgroundColor,
            }}
          />
        ) : (
          <GradientBackground />
        )}
      </View>
      {!disableSafeArea ? (
        <SafeAreaView style={style.get("flex-1")}>
          <View
            style={StyleSheet.flatten([
              style.flatten(["flex-1", "padding-0", "overflow-visible"]),
              { paddingTop: 16 },
              propStyle,
            ])}
            {...restProps}
          />
        </SafeAreaView>
      ) : (
        <View
          style={StyleSheet.flatten([
            style.flatten(["flex-1", "padding-0", "overflow-visible"]),
            propStyle,
          ])}
          {...restProps}
        />
      )}
    </React.Fragment>
  );
};

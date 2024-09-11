import React, { FunctionComponent, ReactElement } from "react";
import { useTheme } from "@src/themes/theme-provider";
import {
  ViewProps,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  StatusBar,
} from "react-native";
import { metrics } from "@src/themes";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { isAndroid } from "@src/common/constants";

export const PageWithBottom: FunctionComponent<
  ViewProps & {
    disableSafeArea?: boolean;
    backgroundColor?: string;
    bottomGroup?: ReactElement;
    style?: object;
    showBottom?: boolean;
  }
> = ({ children, bottomGroup, style, backgroundColor, showBottom = true }) => {
  const { colors } = useTheme();
  const safeAreaInsets = useSafeAreaInsets();

  const styles = useStyle(safeAreaInsets, colors);
  const headerHeight = useHeaderHeight();
  const Wrapper = isAndroid ? View : KeyboardAvoidingView;
  const { bottom } = useSafeAreaInsets();
  return (
    <Wrapper
      keyboardVerticalOffset={headerHeight + StatusBar.currentHeight}
      behavior="padding"
      style={[
        {
          ...styles.container,
          ...style,
          backgroundColor: backgroundColor ?? colors["neutral-surface-bg"],
        },
      ]}
    >
      {children}
      {showBottom && bottomGroup ? (
        <View style={styles.aic}>
          <View style={[styles.bottom, { paddingBottom: 20 + (bottom || 0) }]}>
            {bottomGroup}
          </View>
        </View>
      ) : (
        <View />
      )}
    </Wrapper>
  );
};

const useStyle = (safeAreaInsets, colors) => {
  return StyleSheet.create({
    container: {
      // paddingTop: safeAreaInsets.top,
      justifyContent: "space-between",
      height: "100%",
    },
    bottom: {
      borderTopWidth: 1,
      borderTopColor: colors["neutral-border-default"],
      width: metrics.screenWidth,
      alignItems: "center",
    },
    aic: {
      // position: "absolute",
      // bottom: 0,
      backgroundColor: colors["neutral-surface-card"],
      width: metrics.screenWidth,
    },
    rc: {
      flexDirection: "row",
      alignItems: "center",
    },
    title: {
      paddingHorizontal: 16,
      paddingTop: 24,
    },
  });
};

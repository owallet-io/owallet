import React, { FunctionComponent, ReactElement } from "react";
import { useTheme } from "@src/themes/theme-provider";
import {
  ViewProps,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
} from "react-native";
import { metrics } from "@src/themes";
import { PageHeader } from "../header/header-new";

export const PageWithBottom: FunctionComponent<
  ViewProps & {
    disableSafeArea?: boolean;
    backgroundColor?: string;
    bottomGroup: ReactElement;
    style?: object;
    showHeader?: boolean;
  }
> = ({ children, bottomGroup, style, backgroundColor, showHeader }) => {
  const { colors } = useTheme();
  const styles = useStyle();

  return (
    <View
      style={[
        {
          ...styles.container,
          ...style,
          backgroundColor: backgroundColor ?? colors["neutral-surface-card"],
        },
      ]}
    >
      <View>
        {showHeader ? <PageHeader title="" colors={colors} /> : null}
        <View>{children}</View>
      </View>

      <View style={styles.aic}>
        <View style={styles.bottom}>{bottomGroup}</View>
      </View>
    </View>
  );
};

const useStyle = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    container: {
      paddingTop: metrics.screenHeight / 14,
      justifyContent: "space-between",
      height: "100%",
    },
    bottom: {
      width: "100%",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: colors["neutral-border-default"],
      padding: 16,
    },
    aic: {
      alignItems: "center",
      paddingBottom: 20,
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

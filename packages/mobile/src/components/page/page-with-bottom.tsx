import React, { FunctionComponent, ReactElement } from "react";
import { useTheme } from "@src/themes/theme-provider";
import { ViewProps, StyleSheet, View } from "react-native";
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
> = ({ children, bottomGroup, style, backgroundColor, showHeader = false }) => {
  const { colors } = useTheme();
  const styles = useStyle();

  return (
    <View
      style={[
        {
          ...styles.container,
          ...style,
          backgroundColor: backgroundColor ?? colors["neutral-surface-bg2"],
        },
      ]}
    >
      <View style={{ marginBottom: 100 }}>
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
      borderTopWidth: 1,
      borderTopColor: colors["neutral-border-default"],
      paddingBottom: 20,
      width: metrics.screenWidth,
      alignItems: "center",
    },
    aic: {
      position: "absolute",

      bottom: 0,
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

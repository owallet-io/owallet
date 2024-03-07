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
  }
> = ({ children, bottomGroup }) => {
  const { colors } = useTheme();
  const styles = useStyle();

  return (
    <View style={styles.container}>
      <View>
        <PageHeader title="" colors={colors} />
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
      backgroundColor: colors["neutral-surface-card"],
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

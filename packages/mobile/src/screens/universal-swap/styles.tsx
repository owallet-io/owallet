import { metrics, typography } from "@src/themes";
import { TypeTheme } from "@src/themes/theme-provider";
import { Platform, StyleSheet } from "react-native";

export const stylesUniversalSwap = StyleSheet.create({
  title: {
    textTransform: "uppercase",
    fontSize: 14,
  },
});

export const styling = (colors: TypeTheme["colors"]) =>
  StyleSheet.create({
    textBtnBalanceAtive: {
      color: colors["primary-surface-default"],
    },
    txtBtnSend: {
      fontSize: 16,
      fontWeight: "600",
      color: colors["neutral-text-action-on-dark-bg"],
    },
    bottomBtn: {
      marginTop: 20,
      width: metrics.screenWidth / 2.3,
      borderRadius: 999,
    },
    textBtnBalanceInActive: {
      color: "#7C8397",
    },
    containerInfoToken: {
      backgroundColor: colors["bg-swap-box"],
      paddingHorizontal: 16,
      borderRadius: 8,
      paddingVertical: 11,
    },
    btnBalanceActive: {
      width: metrics.screenWidth / 4 - 16,
      backgroundColor: colors["bg-swap-box"],
      height: 40,
      borderWidth: 1,
      borderColor: colors["primary-surface-default"],
    },
    btnBalanceInactive: {
      width: metrics.screenWidth / 4 - 16,
      backgroundColor: colors["bg-swap-box"],
      height: 40,
    },
    containerBtnBalance: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingTop: 16,
    },
    btnSwapBox: {
      backgroundColor: colors["bg-swap-box"],
      borderRadius: 20,
      width: 40,
      height: 40,
      borderWidth: 4,
      borderColor: colors["plain-background"],
    },
    pt30: {
      paddingTop: 30,
    },
    boxTop: {
      paddingTop: 40,
      paddingBottom: 20,
      marginTop: 4,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    buttonGroup: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    itemBottom: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 5,
    },

    theFirstLabel: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingBottom: 10,
    },
    ts10: {
      fontSize: 10,
    },
    fDr: {
      flexDirection: "row",
    },
    mr8: {
      marginRight: 8,
    },
    btnTitleRight: {
      height: 30,
      width: 30,
    },
    containerBtnLabelInputRight: {
      flexDirection: "row",
    },
    btnLabelInputRight: {
      backgroundColor: colors["bg-tonner"],
      borderRadius: 2,
      height: 22,
      borderWidth: 0,
    },
    btnSwap: {
      marginVertical: 16,
      borderRadius: 8,
    },
    container: {
      marginHorizontal: 16,
    },
    containerBtnCenter: {
      position: "absolute",
      top: "50%",
      alignSelf: "center",
      marginTop: -16,
    },
    shadowBox: {
      shadowColor: colors["splash-background"],
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowRadius: 5,
      shadowOpacity: 1.0,
    },
    containerScreen: {
      padding: 24,
      paddingTop: 76,
      borderTopLeftRadius: Platform.OS === "ios" ? 32 : 0,
      borderTopRightRadius: Platform.OS === "ios" ? 32 : 0,
    },
    contentBlock: {
      padding: 12,
      backgroundColor: colors["content-background"],
      borderRadius: 4,
    },

    title: {
      ...typography.h1,
      color: colors["icon"],
      textAlign: "center",
      fontWeight: "700",
    },
    pt2: {
      paddingTop: 2,
    },
    containerItemBottom: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    flR: {
      flexDirection: "row",
    },
    h35: {
      height: 25,
    },
    h30: {
      height: 30,
    },
    containerInfo: {
      borderRadius: 8,
      backgroundColor: colors["bg-swap-box"],
      marginTop: 4,
      width: "100%",
    },
    flr: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    ic: {
      backgroundColor: colors["content-background"],
      width: 24,
      height: 24,
      borderRadius: 4,
      marginLeft: 4,
    },
    label: {
      color: colors["label-text"],
      fontSize: 12,
      fontWeight: "600",
    },
    pt16: {
      paddingTop: 16,
    },
    jsc: {
      justifyContent: "space-between",
      alignItems: "center",
      width: "80%",
    },
    jc: {
      alignItems: "center",
    },
    borderline: {
      backgroundColor: colors["neutral-border-default"],
      height: 1,
    },
  });

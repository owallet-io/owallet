import { spacing } from "@src/themes";
import { useTheme } from "@src/themes/theme-provider";
import { StyleSheet } from "react-native";

export const useStyleMyWallet = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    containerAccount: {
      backgroundColor: colors["background-item-list"],
      paddingVertical: spacing["16"],
      borderRadius: spacing["8"],
      paddingHorizontal: spacing["16"],
      flexDirection: "row",
      marginTop: spacing["16"],
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
  });
};

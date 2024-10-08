import { spacing } from "@src/themes";
import { StyleSheet } from "react-native";

export const useStyleMyWallet = () => {
  return StyleSheet.create({
    containerAccount: {
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

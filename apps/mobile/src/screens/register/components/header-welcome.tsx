import { StyleSheet, View, ViewStyle } from "react-native";
import React from "react";
import { OWalletLogo, OWalletUnion } from "../owallet-logo";
import { Text } from "@src/components/text";
import { metrics } from "@src/themes";
interface IHeaderWelcome {
  title?: string;
  style?: ViewStyle;
}
const HeaderWelcome = ({ title, style }: IHeaderWelcome) => {
  return (
    <View style={[styles.containerHeader, style]}>
      <View>
        <OWalletLogo />
      </View>
      <View style={styles.containerUnion}>
        <OWalletUnion />
      </View>
      <Text typo="bold" variant="h3">
        {title}
      </Text>
    </View>
  );
};

export default HeaderWelcome;

const styles = StyleSheet.create({
  containerHeader: {
    alignItems: "center",
    padding: 18,
    marginTop: metrics.screenHeight * 0.08,
  },
  containerUnion: { paddingTop: 20, paddingBottom: 16 },
});

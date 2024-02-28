import React, { FunctionComponent } from "react";
import { View, Image, StyleSheet } from "react-native";

export const OWalletLogo = ({
  size,
  theme,
}: {
  size?: number;
  theme?: "dark" | "light";
}) => {
  return (
    <View style={styles.container}>
      <Image
        style={{
          width: size || 120,
          height: size || 120,
        }}
        source={require("../../assets/logo/logo_transparent.png")}
        resizeMode="contain"
        fadeDuration={0}
      />
    </View>
  );
};

export const OWalletUnion: FunctionComponent = ({ theme }) => {
  return (
    <View style={styles.container}>
      <Image
        style={{
          width: 28,
          height: 16,
        }}
        source={require("../../assets/logo/Union.png")}
        resizeMode="contain"
        fadeDuration={0}
      />
    </View>
  );
};

export const OWalletStar: FunctionComponent = () => {
  return (
    <View style={styles.container}>
      <Image
        style={{
          width: 20,
          height: 20,
        }}
        source={require("../../assets/logo/splash-star.png")}
        resizeMode="contain"
        fadeDuration={0}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

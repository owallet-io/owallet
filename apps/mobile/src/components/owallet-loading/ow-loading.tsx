import LottieView from "lottie-react-native";
import { View } from "react-native";
import React from "react";

export const OwLoading = () => {
  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <LottieView
        source={require("@src/assets/animations/loading_owallet.json")}
        style={{ width: 130, height: 130 }}
        autoPlay
        loop
      />
    </View>
  );
};

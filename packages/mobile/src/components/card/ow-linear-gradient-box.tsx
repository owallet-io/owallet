import { View, Text } from "react-native";
import React from "react";
import LinearGradient from "react-native-linear-gradient";

const OWLinearGradientBox = ({ children, ...props }) => {
  return (
    <LinearGradient
      colors={["#3B2368", "#7D52D1"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      {...props}
    >
      {children}
    </LinearGradient>
  );
};

export default OWLinearGradientBox;

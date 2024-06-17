import React from "react";
import { Image, View, Text, TouchableOpacity } from "react-native";
import { metrics } from "@src/themes";

export const ErrorBoundaryFallback = (props: {
  error: Error;
  resetError: Function;
}) => {
  return (
    <View
      style={{
        width: "100%",
        height: "70%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View>
        <Image
          style={{
            height: metrics.screenWidth / 1.4,
            width: metrics.screenWidth / 1.4,
          }}
          fadeDuration={0}
          resizeMode="contain"
          source={require("../../assets/image/img_planet.png")}
        />
      </View>
      <Text
        style={{
          textAlign: "center",
          fontWeight: "600",
          fontSize: 18,
          lineHeight: 22,
          opacity: 1,
        }}
      >
        {"Something went wrong!"}
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: "#5C00A3",
          borderRadius: 999,
          marginTop: 12,
          padding: 12,
          paddingHorizontal: 32,
        }}
        onPress={() => {
          props.resetError();
        }}
      >
        <Text
          style={{
            fontFamily: "SpaceGrotesk-Regular",
            fontWeight: "600",
            fontSize: 14,
            color: "#FBFBFB",
          }}
        >
          Try again
        </Text>
      </TouchableOpacity>
    </View>
  );
};

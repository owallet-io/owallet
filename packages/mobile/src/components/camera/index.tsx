import React, { FunctionComponent } from "react";
import { RNCamera } from "react-native-camera";
import { useIsFocused } from "@react-navigation/native";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";
import { Text } from "@src/components/text";
import { CloseIcon } from "../icon";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingSpinner } from "../spinner";
import { metrics, typography } from "../../themes";
import { useTheme } from "@src/themes/theme-provider";
import { goBack, NavigationAction } from "@src/router/root";

export const FullScreenCameraView: FunctionComponent<
  React.ComponentProps<typeof RNCamera> & {
    containerBottom?: React.ReactElement;
    isLoading?: boolean;
  }
> = (props) => {
  const { colors } = useTheme();

  const isFocused = useIsFocused();

  const {
    children,
    containerBottom,
    isLoading,
    style: propStyle,
    ...rest
  } = props;

  return (
    <React.Fragment>
      {isFocused ? (
        <RNCamera
          style={StyleSheet.flatten([
            {
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            },
            propStyle,
          ])}
          {...rest}
        />
      ) : null}
      <SafeAreaView
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          alignItems: "center",
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <View
            style={{
              flex: 1,
            }}
          />
          {/*{NavigationAction?.canGoBack() ? (*/}
          <TouchableOpacity
            onPress={() => {
              goBack();
            }}
          >
            <View
              style={{
                height: 38,
                width: 38,
                borderRadius: 64,
                backgroundColor: "#323133",
                opacity: 0.9,
                marginTop: 8,
                marginRight: 16,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CloseIcon size={16} color={colors.white} />
            </View>
          </TouchableOpacity>
          {/*) : null}*/}
        </View>
        <View
          style={{
            flex: 1,
          }}
        />
        <View>
          <View
            style={{
              alignSelf: "center",
            }}
          >
            <Image
              style={{
                width: metrics.screenWidth / 1.7,
                height: metrics.screenWidth / 1.7,
              }}
              source={require("../../assets/image/img_scan.png")}
              resizeMode="contain"
              fadeDuration={0}
            />
          </View>
          {isLoading ? (
            <View
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  paddingLeft: 32,
                  paddingRight: 48,
                  paddingBottom: 31,
                  borderRadius: 8,
                  alignItems: "center",
                  backgroundColor: colors["camera-loading-background"],
                }}
              >
                <LoadingSpinner
                  size={42}
                  color={colors["primary-surface-default"]}
                />
                <Text
                  style={{
                    ...typography["subtitle1"],
                    marginTop: 34,
                    color: colors["primary-surface-default"],
                  }}
                >
                  Loading...
                </Text>
              </View>
            </View>
          ) : null}
        </View>
        {containerBottom}
        <View
          style={{
            flex: 1,
          }}
        />
      </SafeAreaView>
      {children}
    </React.Fragment>
  );
};

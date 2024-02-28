import React, { forwardRef } from "react";
import {
  Animated,
  SafeAreaView,
  ScrollViewProps,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useStyle } from "../../styles";
import { GradientBackground } from "../svg";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { usePageRegisterScrollYValue, useSetFocusedScreen } from "./utils";
import { useTheme } from "@src/themes/theme-provider";

const AnimatedKeyboardAwareScrollView = Animated.createAnimatedComponent(
  KeyboardAwareScrollView
);

// eslint-disable-next-line react/display-name
export const PageWithScrollView = forwardRef<
  ScrollView,
  React.PropsWithChildren<
    ScrollViewProps & {
      fixed?: React.ReactNode;
      disableSafeArea?: boolean;
      backgroundColor?: string;
    }
  >
>((props, ref) => {
  const styles = useStyle();

  useSetFocusedScreen();
  const scrollY = usePageRegisterScrollYValue();
  const { colors } = useTheme();
  const {
    style,
    fixed,
    onScroll,
    disableSafeArea,
    backgroundColor = colors["background"],
    ...restProps
  } = props;

  const ContainerElement = disableSafeArea ? View : SafeAreaView;

  return (
    <React.Fragment>
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: -100,
          bottom: -100,
        }}
      >
        {backgroundColor ? (
          <View
            style={{
              width: "100%",
              height: "100%",
              backgroundColor,
            }}
          />
        ) : (
          <GradientBackground />
        )}
      </View>
      <ContainerElement style={styles.get("flex-1")}>
        <AnimatedKeyboardAwareScrollView
          innerRef={(_ref) => {
            if (ref) {
              // I don't know why the _ref's type is JSX.Element
              if (typeof ref === "function") {
                ref(_ref as any);
              } else {
                ref.current = _ref as any;
              }
            }
          }}
          style={StyleSheet.flatten([
            styles.flatten(["flex-1", "padding-0", "overflow-visible"]),
            style,
          ])}
          keyboardOpeningTime={0}
          onScroll={Animated.event(
            [
              {
                nativeEvent: { contentOffset: { y: scrollY } },
              },
            ],
            { useNativeDriver: true, listener: onScroll }
          )}
          keyboardShouldPersistTaps="handled"
          {...restProps}
        />
        <View
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
          }}
          pointerEvents="box-none"
        >
          {fixed}
        </View>
      </ContainerElement>
    </React.Fragment>
  );
});

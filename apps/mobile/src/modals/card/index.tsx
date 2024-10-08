import React, { FunctionComponent } from "react";
import { StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Text } from "@src/components/text";
import { useStyle } from "../../styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useStore } from "../../stores";
import { useTheme } from "@src/themes/theme-provider";

// CONTRACT: Use with { disableSafeArea: true, align: "bottom" } modal options.
export const CardModal: FunctionComponent<{
  title?: string;
  right?: React.ReactElement;
  childrenContainerStyle?: ViewStyle;
  disableGesture?: boolean;
  labelStyle?: TextStyle;
  disabledScrollView?: boolean;
}> = ({
  title,
  right,
  children,
  childrenContainerStyle,
  labelStyle,
  disabledScrollView = true,
}) => {
  const style = useStyle();
  const { colors } = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const { appInitStore } = useStore();

  const scheme = appInitStore.getInitApp.theme;
  const ContainerElement = disabledScrollView ? View : ScrollView;
  return (
    <ContainerElement
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      style={[
        StyleSheet.flatten([
          style.flatten([
            "border-radius-top-left-8",
            "border-radius-top-right-8",
            "overflow-hidden",
          ]),
          {
            paddingBottom: safeAreaInsets.bottom,
          },
        ]),
        {
          backgroundColor: colors["neutral-surface-card"],
        },
      ]}
    >
      {/* Below view is not animated, but to let the gesture handler to accept the animated block, you should set the children of the gesture handler as the Animated.View */}
      <View style={style.flatten(["padding-x-page"])}>
        {title ? (
          <React.Fragment>
            <View
              style={style.flatten([
                "flex-row",
                "items-center",
                "margin-bottom-16",
              ])}
            >
              <Text
                style={{
                  ...style.flatten(["h4"]),
                  color:
                    scheme === "dark"
                      ? colors["white"]
                      : colors["text-black-high"],
                  ...labelStyle,
                }}
              >
                {title}
              </Text>
              {right}
            </View>
            <View
              style={[
                style.flatten(["height-1"]),
                {
                  // borderColor: colors['border']
                },
              ]}
            />
          </React.Fragment>
        ) : null}
      </View>

      <View
        style={StyleSheet.flatten([
          style.flatten(["padding-page", "padding-top-16"]),
          childrenContainerStyle,
        ])}
      >
        {children}
      </View>
    </ContainerElement>
  );
};

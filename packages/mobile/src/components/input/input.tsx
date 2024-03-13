import React from "react";
import {
  Platform,
  StyleSheet,
  TextInput as NativeTextInput,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { Text } from "@src/components/text";
import { useStyle } from "../../styles";
import { spacing, typography } from "../../themes";
import { useTheme } from "@src/themes/theme-provider";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
// eslint-disable-next-line react/display-name
export const TextInput = React.forwardRef<
  NativeTextInput,
  React.ComponentProps<typeof NativeTextInput> & {
    labelStyle?: TextStyle;
    containerStyle?: ViewStyle;
    inputContainerStyle?: ViewStyle;
    errorLabelStyle?: TextStyle;
    inputStyle?: TextStyle;
    iconLabel?: React.ReactNode;

    label?: string;
    error?: string;

    paragraph?: React.ReactNode;

    topInInputContainer?: React.ReactNode;
    bottomInInputContainer?: React.ReactNode;

    inputLeft?: React.ReactNode;
    inputRight?: React.ReactNode;

    multiline?: boolean;
    isBottomSheet?: boolean;
  }
>((props, ref) => {
  const { style: propsStyle, ...restProps } = props;

  const style = useStyle();
  const { colors } = useTheme();
  const ElementTextInput = restProps.isBottomSheet
    ? BottomSheetTextInput
    : NativeTextInput;
  return (
    <View style={StyleSheet.flatten([props.containerStyle])}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        {props.label ? (
          <>
            <Text
              style={{
                ...typography.h7,
                color: colors["primary-text"],
                marginBottom: spacing["3"],
                ...props.labelStyle,
              }}
            >
              {props.label}
            </Text>
          </>
        ) : null}
      </View>
      <View
        style={StyleSheet.flatten([
          style.flatten(
            [
              "background-color-white",
              "padding-y-12",
              "border-radius-4",
              "border-width-1",
              "border-color-border-white",
            ],
            [
              props.error ? "border-color-error" : undefined,
              !(props.editable ?? true) && "background-color-disabled",
            ]
          ),
          {
            backgroundColor: "transparent",
            borderColor: colors["border-input-login"],
          },
          props.inputStyle,
          props.inputContainerStyle,
        ])}
      >
        {props.topInInputContainer}
        <View style={style.flatten(["flex-row", "items-center"])}>
          {props.inputLeft}
          <ElementTextInput
            multiline={props.multiline ?? false}
            style={[
              StyleSheet.flatten([
                { fontFamily: "SpaceGrotesk-Regular" },
                Platform.select({
                  ios: {},
                  android: {
                    // On android, the text input's height does not equals to the line height by strange.
                    // To fix this problem, set the height explicitly.
                    height: style.get("body2-in-text-input")?.lineHeight,
                  },
                }),
                propsStyle,
              ]),
              { color: colors["sub-primary-text"], flex: 1 },
            ]}
            {...restProps}
            placeholderTextColor={
              props.placeholderTextColor ?? colors["text-place-holder"]
            }
            ref={ref}
          />
          {props.inputRight}
        </View>
        {props.bottomInInputContainer}
      </View>
      {props.paragraph && !props.error ? (
        typeof props.paragraph === "string" ? (
          <View>
            <Text
              style={StyleSheet.flatten([
                style.flatten([
                  "absolute",
                  "text-caption2",
                  "color-primary",
                  "margin-top-2",
                  "margin-left-4",
                ]),
                props.errorLabelStyle,
              ])}
            >
              {props.paragraph}
            </Text>
          </View>
        ) : typeof props.paragraph == "function" ? (
          props.paragraph()
        ) : (
          props.paragraph
        )
      ) : null}
      {props.error ? (
        <View>
          <Text
            style={StyleSheet.flatten([
              style.flatten([
                "absolute",
                "text-caption2",
                "color-error",
                "margin-top-2",
                "margin-left-4",
              ]),
              props.errorLabelStyle,
            ])}
          >
            {props.error}
          </Text>
        </View>
      ) : null}
    </View>
  );
});

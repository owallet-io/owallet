import React, { FunctionComponent, ReactElement } from "react";
import { View, ViewStyle } from "react-native";
import { Text } from "@src/components/text";
import { colors, spacing, typography } from "../../themes";
import { Button } from "../button";
// import { RightArrowIcon } from "../icon";
import { RectButton } from "../rect-button";

export const CardHeaderWithButton: FunctionComponent<{
  title: string;
  paragraph?: string;
  buttonText: string;
  icon?: ReactElement;

  onPress?: () => void;

  buttonColor?: "primary" | "secondary" | "danger";
  buttonMode?: "fill" | "light" | "outline" | "text";
  buttonStyle?: ViewStyle;
  buttonContainerStyle?: ViewStyle;
  buttonDisabled?: boolean;
  buttonLoading?: boolean;
}> = ({
  title,
  paragraph,
  buttonText,
  icon,
  onPress,
  buttonColor = "primary",
  buttonMode = "fill",
  buttonStyle,
  buttonContainerStyle,
  buttonDisabled = false,
  buttonLoading = false,
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing["card-horizontal"],
        paddingVertical: spacing["card-vertical"],
      }}
    >
      {icon && <View style={{ marginRight: spacing["12"] }}>{icon}</View>}
      <View
        style={{
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            ...typography.h5,
            color: colors["text-black-very-high"],
          }}
        >
          {title}
        </Text>
        {paragraph ? (
          <Text
            style={{
              ...typography.body2,
              color: colors["text-black-low"],
              marginTop: spacing["4"],
            }}
          >
            {paragraph}
          </Text>
        ) : null}
      </View>
      <View style={{ flex: 1 }} />
      <View>
        <Button
          style={buttonStyle}
          containerStyle={buttonContainerStyle}
          onPress={onPress}
          size="small"
          text={buttonText}
          color={buttonColor}
          mode={buttonMode}
          disabled={buttonDisabled}
          loading={buttonLoading}
        />
      </View>
    </View>
  );
};

export const CardHeader: FunctionComponent<{
  containerStyle?: ViewStyle;
  title: string;
}> = ({ containerStyle, title }) => {
  return (
    <View
      style={{
        paddingHorizontal: spacing["card-horizontal"],
        paddingVertical: spacing["card-vertical"],
        ...containerStyle,
      }}
    >
      <Text
        style={{
          ...typography.h4,
          color: colors["text-black-very-high"],
        }}
      >
        {title}
      </Text>
    </View>
  );
};

export const CardHeaderFullButton: FunctionComponent<{
  containerStyle?: ViewStyle;

  title: string;
  buttonText?: string;
  onPress?: () => void;
}> = ({ containerStyle, title, buttonText, onPress }) => {
  return (
    <RectButton
      style={{
        paddingHorizontal: spacing["card-horizontal"],
        paddingVertical: spacing["card-vertical"],
        paddingBottom: spacing["card-vertical-half"],
        ...containerStyle,
      }}
      onPress={onPress}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            ...typography.h4,
            color: colors["text-black-very-high"],
          }}
        >
          {title}
        </Text>
        <View style={{ flex: 1 }} />
        {buttonText ? (
          <Text
            style={{
              ...typography["text-button2"],
              color: colors["text-black-very-very-low"],
              marginRight: spacing["8"],
            }}
          >
            {buttonText}
          </Text>
        ) : null}
        <Text
          style={{
            ...typography["text-button3"],
            color: colors["text-black-very-very-low"],
          }}
        >
          View all
        </Text>
      </View>
    </RectButton>
  );
};

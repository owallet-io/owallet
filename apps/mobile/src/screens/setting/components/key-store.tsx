import { Text } from "@src/components/text";
import { useTheme } from "@src/themes/theme-provider";
import React, { FunctionComponent } from "react";
import { StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Svg, { Path } from "react-native-svg";
import {
  AUDIcon,
  CADIcon,
  CNYIcon,
  EURIcon,
  GBPIcon,
  HKDIcon,
  INRIcon,
  JPYIcon,
  KRWIcon,
  NoteIcon,
  RUBIcon,
  USAIcon,
} from "../../../components/icon";
import { spacing, typography } from "../../../themes";

export const KeyStoreSectionTitle: FunctionComponent<{
  title: string;
}> = ({ title }) => {
  const { colors } = useTheme();
  const styles = styling(colors);
  return (
    <View
      style={{
        ...styles.containerSectionTitle,
      }}
    >
      <NoteIcon color={colors["primary-surface-default"]} height={20} />
      <Text
        style={{
          ...typography["subtitle1"],
          color: colors["sub-primary-text"],
          marginLeft: spacing["6"],
        }}
      >
        {title &&
          title.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
            letter.toUpperCase()
          )}
      </Text>
    </View>
  );
};

export const WalletIcon: FunctionComponent<{
  color: string;
  height: number;
}> = ({ color, height }) => {
  return (
    <Svg
      fill="none"
      viewBox="0 0 44 45"
      style={{
        height,
        aspectRatio: 44 / 45,
      }}
    >
      <Path
        fill={color}
        fillRule="evenodd"
        d="M26.15 13c-.318 0-.691.065-1.202.2-1.284.339-8.813 2.421-8.925 2.455-1.117.42-1.824.834-2.268 1.32a3.253 3.253 0 011.841-.573H27.55v-1.428c0-.69-.005-1.974-1.4-1.974zm-10.544 4.256c-1.593 0-2.571 1.492-2.571 2.561v9.125a2.411 2.411 0 002.41 2.402h13.18a2.41 2.41 0 002.41-2.402V19.75c0-1.305-1.226-2.494-2.572-2.494H15.607zM28.831 24.3a1.067 1.067 0 10-2.135 0 1.067 1.067 0 002.135 0z"
        clipRule="evenodd"
      />
    </Svg>
  );
};

export const renderFlag = (
  flagName: string = "usd",
  heightFlag: number = 24
) => {
  switch (flagName.toLowerCase()) {
    case "usd":
      return <USAIcon height={heightFlag} />;
    case "eur":
      return <EURIcon height={heightFlag} />;
    case "gbp":
      return <GBPIcon height={heightFlag} />;
    case "cad":
      return <CADIcon height={heightFlag} />;
    case "aud":
      return <AUDIcon height={heightFlag} />;
    case "rub":
      return <RUBIcon height={heightFlag} />;
    case "krw":
      return <KRWIcon height={heightFlag} />;
    case "hkd":
      return <HKDIcon height={heightFlag} />;
    case "cny":
      return <CNYIcon height={heightFlag} />;
    case "jpy":
      return <JPYIcon height={heightFlag} />;
    case "inr":
      return <INRIcon height={heightFlag} />;
    default:
      return <></>;
  }
};

export const KeyStoreItem: FunctionComponent<{
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  label: string;
  active?: boolean;
  colors: any;
  onPress?: () => void;
}> = ({ containerStyle, labelStyle, label, onPress, active, colors }) => {
  const styles = styling(colors);
  const renderChildren = () => {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
          }}
        >
          {renderFlag(label)}
          <Text
            style={{
              ...typography.h5,
              color: colors["sub-primary-text"],
              fontWeight: "700",
              marginLeft: spacing["12"],
              ...labelStyle,
            }}
          >
            {label}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            flex: 1,
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: spacing["32"],
              backgroundColor: active
                ? colors["primary-surface-default"]
                : colors["bg-circle-select-modal"],
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: spacing["32"],
                backgroundColor: colors["background-item-list"],
              }}
            />
          </View>
        </View>
        <View />
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={{
        ...styles.containerItem,
        ...containerStyle,
      }}
      onPress={onPress}
    >
      {renderChildren()}
    </TouchableOpacity>
  );
};

const styling = (colors) =>
  StyleSheet.create({
    selectBtn: {
      height: 54,
      flexDirection: "row",
      alignItems: "center",
    },
    containerItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors["neutral-surface-bg2"],
      borderRadius: spacing["12"],
      marginVertical: spacing["8"],
      paddingHorizontal: spacing["20"],
      paddingVertical: spacing["20"],
      marginHorizontal: spacing["24"],
    },
    containerSectionTitle: {
      marginHorizontal: spacing["20"],
      paddingTop: spacing["16"],
      paddingBottom: spacing["12"],
      marginTop: spacing["16"],
      flexDirection: "row",
      alignItems: "center",
    },
  });

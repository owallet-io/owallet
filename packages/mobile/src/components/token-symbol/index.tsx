import React, { FunctionComponent, useMemo } from "react";
import { View, ViewStyle, Image } from "react-native";
import { AppCurrency, Currency } from "@owallet/types";
import {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
  Svg,
} from "react-native-svg";
import FastImage from "react-native-fast-image";
import { VectorCharacter } from "../vector-character";
import { colors, spacing } from "../../themes";

export const StakedTokenSymbol: FunctionComponent<{
  size: number;
}> = ({ size = 24 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#D378FE" />
          <Stop offset="100%" stopColor="#71C4FF" />
        </LinearGradient>
      </Defs>
      <Circle cx="20" cy="20" r="20" fill="url(#grad)" opacity="0.4" />
      <Path
        fill="#fff"
        d="M20 8.8c-.303 0-.586.08-.839.208h-.016l-8.828 4.53a.93.93 0 00-.008 1.724v.018l8.843 4.516.008-.004c.253.129.536.208.84.208.304 0 .587-.08.84-.208l.008.004 8.843-4.516v-.018a.93.93 0 00-.007-1.724l-8.83-4.53h-.015A1.851 1.851 0 0020 8.8zm-7.955 9.452l-1.728.886a.93.93 0 00-.008 1.724v.018l8.843 4.516.008-.004c.253.129.536.208.84.208.304 0 .587-.08.84-.208l.008.004 8.843-4.516v-.018a.93.93 0 00-.007-1.724l-1.729-.886a1608.959 1608.959 0 01-6.455 3.292 3.653 3.653 0 01-3.006-.002c-.04-.015-3.737-1.902-6.45-3.29zm0 5.6l-1.728.886a.93.93 0 00-.008 1.724v.018l8.843 4.516.008-.004c.253.129.536.208.84.208.304 0 .587-.08.84-.208l.008.004 8.843-4.516v-.018a.93.93 0 00-.007-1.724l-1.729-.886a1608.959 1608.959 0 01-6.455 3.292 3.653 3.653 0 01-3.006-.002c-.04-.015-3.737-1.902-6.45-3.29z"
      />
    </Svg>
  );
};

export const TokenSymbol: FunctionComponent<{
  style?: ViewStyle;
  currency: AppCurrency;
  chainInfo?: {
    stakeCurrency: Currency;
  };
  size?: number;
  imageScale?: number;
}> = ({
  style: propStyle,
  size,
  currency,
  chainInfo,
  imageScale = 32 / 44,
}) => {
  const isStakeCurrency =
    currency.coinMinimalDenom === chainInfo.stakeCurrency.coinMinimalDenom;

  const profileColor = useMemo(() => {
    return "red-10";
  }, []);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: spacing["6"],
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: isStakeCurrency
          ? colors["red-10"]
          : colors[`${profileColor}`],
        ...propStyle,
      }}
    >
      {currency?.coinImageUrl ? (
        currency?.coinImageUrl?.includes("white") ? (
          <Image
            style={{
              width: size * imageScale,
              height: size * imageScale,
              tintColor: colors["black"],
            }}
            resizeMode={"contain"}
            source={{
              uri: currency.coinImageUrl,
            }}
          />
        ) : (
          <FastImage
            style={{
              width: size * imageScale,
              height: size * imageScale,
            }}
            resizeMode={FastImage.resizeMode.contain}
            source={{
              uri: currency.coinImageUrl,
            }}
          />
        )
      ) : (
        <VectorCharacter
          char={currency.coinDenom[0]}
          height={Math.floor(size * 0.35)}
          color="black"
        />
      )}
    </View>
  );
};

import { Dimensions, Platform, StyleSheet } from "react-native";
const { height, width } = Dimensions.get("window");

type FontWeightNumbers =
  | "100"
  | "200"
  | "300"
  | "400"
  | "500"
  | "600"
  | "700"
  | "800"
  | "900";

type FontWeightTypes =
  | "thin"
  | "extralight"
  | "light"
  | "normal"
  | "medium"
  | "semibold"
  | "bold"
  | "extrabold"
  | "black";

const FontWeightTypesMap: { [key in FontWeightTypes]: FontWeightNumbers } = {
  thin: "100",
  extralight: "200",
  light: "300",
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
  black: "900",
};

//iphone 13
const baseWidth = 390;
const baseHeight = 844;

export const isTablet = height / width < 1.6;

/**
 *
 * @param {number} size
 * @returns {number}
 * ex: paddingTop: scale(16), fontSize: scale(16), marginLeft: scale(8)
 */
export const scale = (size: number): number => {
  if (isTablet) {
    return (height / baseHeight) * size;
  } else {
    return (width / baseWidth) * size;
  }
};

/**
 * Apply scale to numeric values ​​in style
 * @param {Record<string, unknown>} style - The style object needs to have scale applied
 * @param {boolean} [isScale=true] - Flag to determine whether scaling is applied or not (optional), default is true
 * @returns {Record<string, unknown> | undefined} - The style object has scale applied or undefined if the style is undefined
 * ex: 
 * <OWButton
    style={styleWithScale(styles.btnOW)}
    size="default"
    label="Create a new wallet"
    onPress={handleCreateANewWallet}
  />
 */
export const styleWithScale = (
  style: Record<string, unknown>,
  isScale = true
) => {
  if (style === undefined) {
    return undefined;
  }
  const flattenedStyle = StyleSheet.flatten(style);
  const scaledEntries = Object.entries(flattenedStyle).map(([key, value]) => {
    if (typeof value === "number" && !["flex", "opacity"].includes(key)) {
      return [key, isScale ? scale(value) : value];
    }
    return [key, value];
  });

  return Object.fromEntries(scaledEntries);
};

export function getPlatformFontWeight(
  fontWeight: FontWeightTypes | FontWeightNumbers
): {
  fontFamily?: string;
  fontWeight: FontWeightNumbers;
} {
  if (fontWeight in FontWeightTypesMap) {
    fontWeight = FontWeightTypesMap[fontWeight as FontWeightTypes];
  }

  if (Platform.OS !== "android") {
    return { fontWeight: fontWeight as FontWeightNumbers };
  }

  switch (fontWeight) {
    case "100":
      return {
        fontFamily: "sans-serif-thin",
        fontWeight: "100",
      };
    case "200":
    // 200 doesn't exist on Android (Roboto).
    // 200 should be 300
    case "300":
      return {
        fontFamily: "sans-serif-light",
        fontWeight: "300",
      };
    case "400":
      return {
        fontFamily: "sans-serif",
        fontWeight: "400",
      };
    case "600":
    // 600 doesn't exist on Android (Roboto).
    // 600 should be 500
    case "500":
      return {
        fontFamily: "sans-serif-medium",
        fontWeight: "500",
      };
    case "800":
    // 800 doesn't exist on Android (Roboto).
    // 800 should be 700
    case "700":
      return {
        fontFamily: "sans-serif",
        fontWeight: "700",
      };
    case "900":
      return {
        fontFamily: "sans-serif-black",
        fontWeight: "900",
      };
  }

  throw new Error(`Invalid font weight: ${fontWeight}`);
}

import { Platform } from "react-native";

export const typography = {
  h1: {
    fontSize: 32,
    lineHeight: 56,
    letterSpacing: 0.3,
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0.3,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.3,
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.3,
  },
  h5: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  h6: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  h7: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  subtitle1: {
    fontSize: 18,
    lineHeight: 24,
  },
  subtitle2: {
    fontSize: 16,
    lineHeight: 22,
  },
  subtitle3: {
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0.1,
  },
  body1: {
    fontSize: 18,
    lineHeight: 26,
  },
  body2: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  body3: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  "text-button1": {
    fontSize: 18,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  "text-button2": {
    fontSize: 16,
    lineHeight: 19,
    letterSpacing: 0.2,
  },
  "text-button3": {
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  "text-caption1": {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.3,
  },
  "text-caption2": {
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.3,
  },
  "text-overline": {
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  "text-underline": {
    textDecorationLine: "underline",
  },
  "body2-in-text-input": Platform.select({
    ios: {
      fontSize: 16,
      lineHeight: 19,
      letterSpacing: 0.25,
      paddingTop: 1.5,
      paddingBottom: 1.5,
    },
    android: {
      fontSize: 16,
      lineHeight: 22,
      letterSpacing: 0.25,
    },
  }),
};

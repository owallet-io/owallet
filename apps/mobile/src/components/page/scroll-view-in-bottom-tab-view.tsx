import React from "react";
import { PageWithScrollView } from "./scroll-view";
import { ScrollViewProps, ScrollView, StyleSheet } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { isAndroid } from "@common/constants";

// eslint-disable-next-line react/display-name
export const PageWithScrollViewInBottomTabView = React.forwardRef<
  ScrollView,
  React.PropsWithChildren<
    ScrollViewProps & {
      fixed?: React.ReactNode;
      backgroundColor?: string;
    }
  >
>((props, ref) => {
  const bottomTabBarHeight = useBottomTabBarHeight();

  const { style, ...rest } = props;

  return (
    <PageWithScrollView
      disableSafeArea={true}
      {...rest}
      style={StyleSheet.flatten([
        {
          marginBottom: isAndroid
            ? bottomTabBarHeight
            : bottomTabBarHeight + 16,
        },
        style,
      ])}
      ref={ref}
    />
  );
});

import React from "react";
import { StyleSheet } from "react-native";
import OWHeaderTitle from "@src/components/header/ow-header-title";
import OWHeaderRight, {
  OWHeaderLeft,
} from "@src/components/header/ow-header-right";
import { useTheme } from "@src/themes/theme-provider";
import OWButtonIcon from "@src/components/button/ow-button-icon";
import {
  StackNavigationOptions,
  TransitionPresets,
} from "@react-navigation/stack";
import { HEADER_KEY, SCREENS } from "@src/common/constants";
import { getDefaultHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { metrics } from "@src/themes";
import { navigate } from "@src/router/root";

interface IUseHeaderOptions extends StackNavigationOptions {}
export const useGetNewHeaderHeight = () => {
  const { top } = useSafeAreaInsets();
  const defaultHeaderHeight = getDefaultHeaderHeight(
    {
      width: metrics.screenWidth,
      height: metrics.screenHeight,
    },
    false,
    top
  );
  return defaultHeaderHeight + 10;
};
const useHeaderOptions = (
  data?: IUseHeaderOptions,
  navigation?: any
): IUseHeaderOptions => {
  const { colors } = useTheme();

  const onGoBack = () => {
    navigation.goBack();
  };
  const onAddWallet = () => {
    navigate(SCREENS.RegisterIntro, {
      canBeBack: true,
    });
  };

  const onScan = () => {
    navigate(SCREENS.Camera);
    return;
  };
  const newHeaderHeight = useGetNewHeaderHeight();
  return {
    headerStyle: {
      backgroundColor: colors["neutral-surface-bg"],
      shadowColor: colors["neutral-border-default"],
      borderBottomWidth: 0,
      elevation: 0,
      height: newHeaderHeight,
    },
    headerTitle: () => <OWHeaderTitle title={data?.title} />,
    headerTitleAlign: "center",

    headerRight: () => {
      if (data?.title == HEADER_KEY.showNetworkHeader) {
        return <OWHeaderRight onScan={onScan} />;
      }
    },
    headerLeft: () => {
      if (data?.title == HEADER_KEY.showNetworkHeader) {
        return <OWHeaderLeft onAddWallet={onAddWallet} />;
      } else if (navigation.canGoBack()) {
        return (
          <OWButtonIcon
            colorIcon={colors["neutral-icon-on-light"]}
            onPress={onGoBack}
            name="arrow-left"
            fullWidth={false}
            style={[
              styles.btnIcon,
              {
                backgroundColor: colors["neutral-surface-card"],
              },
            ]}
            sizeIcon={16}
          />
        );
      }
    },
    ...TransitionPresets.SlideFromRightIOS,
    headerShown:
      data?.title === HEADER_KEY.notShowHeader || !!data?.title == false
        ? false
        : true,
    ...data,
  };
};

export default useHeaderOptions;

const styles = StyleSheet.create({
  btnIcon: {
    borderRadius: 999,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 16,
  },
});

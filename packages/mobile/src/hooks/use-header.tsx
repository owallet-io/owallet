import React from "react";
import { StyleSheet } from "react-native";
import OWHeaderTitle from "@src/components/header/ow-header-title";
import OWHeaderRight from "@src/components/header/ow-header-right";
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

interface IUseHeaderOptions extends StackNavigationOptions {}
const useHeaderOptions = (
  data?: IUseHeaderOptions,
  navigation?: any
): IUseHeaderOptions => {
  const { colors } = useTheme();
  const { top } = useSafeAreaInsets();
  const defaultHeaderHeight = getDefaultHeaderHeight(
    {
      width: metrics.screenWidth,
      height: metrics.screenHeight,
    },
    false,
    top
  );
  const newHeaderHeight = defaultHeaderHeight + 10;
  const onGoBack = () => {
    navigation.goBack();
  };
  const onAddWallet = () => {
    navigation.navigate("Register", {
      screen: "Register.Intro",
      params: {
        canBeBack: true,
      },
    });
  };

  const onScan = () => {
    navigation.navigate(SCREENS.STACK.Others, {
      screen: SCREENS.Camera,
    });
    return;
  };

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
        return <OWHeaderRight onAddWallet={onAddWallet} onScan={onScan} />;
      }
    },
    headerLeft: () => {
      if (navigation.canGoBack())
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
      return null;
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

import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import OWHeaderTitle from "@src/components/header/ow-header-title";
import OWHeaderRight from "@src/components/header/ow-header-right";
import { useTheme } from "@src/themes/theme-provider";
import OWButtonIcon from "@src/components/button/ow-button-icon";
import {
  StackNavigationOptions,
  TransitionPresets,
} from "@react-navigation/stack";
import { HEADER_KEY, SCREENS } from "@src/common/constants";
interface IUseHeaderOptions extends StackNavigationOptions {}
const useHeaderOptions = (
  data?: IUseHeaderOptions,
  navigation?: any
): IUseHeaderOptions => {
  const { colors } = useTheme();
  const onGoBack = () => {
    navigation.goBack();
  };
  const onTransaction = () => {
    navigation.navigate(SCREENS.STACK.Others, {
      screen: SCREENS.Transactions,
    });
    return;
  };

  const onScan = () => {
    navigation.navigate(SCREENS.STACK.Others, {
      screen: SCREENS.Camera,
    });
    return;
  };

  return {
    headerStyle: {
      backgroundColor: colors["background-box"],
      shadowColor: colors["border-gray"],
      // shadowRadius: 0,
      // elevation: 1
    },
    headerTitle: () => <OWHeaderTitle title={data?.title} />,
    headerTitleAlign: "center",
    headerRight: () => {
      if (data?.title == HEADER_KEY.showNetworkHeader) {
        return <OWHeaderRight onTransaction={onTransaction} onScan={onScan} />;
      }
    },
    headerLeft: () => {
      if (navigation.canGoBack())
        return (
          <OWButtonIcon
            colorIcon={colors["primary-text"]}
            onPress={onGoBack}
            name="arrow-left"
            fullWidth={false}
            style={styles.btnIcon}
            sizeIcon={!!data?.title ? 24 : 20}
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
    paddingRight: 20,
  },
});

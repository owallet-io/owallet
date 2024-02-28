import { useRegisterConfig } from "@owallet/hooks";
import { useHeaderHeight } from "@react-navigation/elements";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../../components/button";
import { PageWithScrollView } from "../../components/page";
import { useSmartNavigation } from "../../navigation.provider";
import { useStore } from "../../stores";
import { useStyle } from "../../styles";
import { OWalletLogo } from "./owallet-logo";

export const RegisterNewUserScreen: FunctionComponent = observer(() => {
  const { keyRingStore, analyticsStore } = useStore();

  const style = useStyle();

  const { colors } = useTheme();

  const smartNavigation = useSmartNavigation();

  const registerConfig = useRegisterConfig(keyRingStore, []);

  const safeAreaInsets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const actualHeightHeight = headerHeight - safeAreaInsets.top;

  return (
    <PageWithScrollView
      contentContainerStyle={style.get("flex-grow-1")}
      style={StyleSheet.flatten([
        style.flatten(["padding-x-42"]),
        {
          paddingTop:
            Dimensions.get("window").height * 0.22 - actualHeightHeight,
          paddingBottom: Dimensions.get("window").height * 0.11,
        },
      ])}
      backgroundColor={colors["plain-background"]}
    >
      <View
        style={style.flatten(["flex-grow-1", "items-center", "padding-x-18"])}
      >
        <OWalletLogo />
      </View>
      <Button
        text="Create new mnemonic"
        size="large"
        mode="light"
        onPress={() => {
          analyticsStore.logEvent("Create account started", {
            registerType: "seed",
          });
          smartNavigation.navigateSmart("Register.NewMnemonic", {
            registerConfig,
          });
        }}
      />
    </PageWithScrollView>
  );
});

import React, { FunctionComponent } from "react";
import { useHeaderHeight } from "@react-navigation/stack";
import { PageWithScrollView } from "../../components/page";
import { useStyle } from "../../styles";
import { View, Dimensions } from "react-native";
import { Button } from "../../components/button";
import { useSmartNavigation } from "../../navigation";
import { useRegisterConfig } from "@owallet/hooks";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OWalletLogo } from "./owallet-logo";

export const RegisterIntroScreen: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const registerConfig = useRegisterConfig(keyRingStore, []);

  const headerHeight = useHeaderHeight();

  useLogScreenView("Register");

  return (
    <PageWithScrollView
      contentContainerStyle={style.get("flex-grow-1")}
      style={{
        ...style.flatten(["padding-x-42"]),
        paddingTop: Dimensions.get("window").height * 0.22 - actualHeightHeight,
        paddingBottom: Dimensions.get("window").height * 0.11,
      }}
    >
      <View
        style={style.flatten(["flex-grow-1", "items-center", "padding-x-18"])}
      >
        <OWalletLogo />
      </View>
      <Button
        containerStyle={style.flatten(["margin-bottom-16"])}
        text="Create a new wallet"
        size="large"
        mode="light"
        onPress={() => {
          smartNavigation.navigateSmart("Register.NewUser", {
            registerConfig,
          });
        }}
      />
      <Button
        containerStyle={style.flatten(["margin-bottom-16"])}
        text="Import existing wallet"
        size="large"
        onPress={() => {
          smartNavigation.navigateSmart("Register.NotNewUser", {
            registerConfig,
          });
        }}
      />
      <Button
        text="Import Ledger Nano X"
        size="large"
        mode="text"
        onPress={() => {
          smartNavigation.navigateSmart("Register.NewLedger", {
            registerConfig,
          });
        }}
      />
    </PageWithScrollView>
  );
});

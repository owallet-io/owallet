import { RouteProp, useRoute } from "@react-navigation/native";
import { Text } from "@src/components/text";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { PageWithView } from "../../components/page";
import { Toggle } from "../../components/toggle";

import { useStore } from "../../stores";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import OWButton from "@src/components/button/OWButton";
import { useTheme } from "@src/themes/theme-provider";
import { typography } from "../../themes";
import { OWalletLogo, OWalletStar } from "./owallet-logo";
import { resetTo } from "@src/router/root";
import { SCREENS } from "@src/common/constants";

export const RegisterEndScreen: FunctionComponent = observer(() => {
  const { keychainStore, keyRingStore } = useStore();
  const { colors } = useTheme();

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          password?: string;
          type?: string;
        }
      >,
      string
    >
  >();

  const password = route.params?.password;

  const [isBiometricOn, setIsBiometricOn] = useState(false);

  useEffect(() => {
    if (password && keychainStore.isBiometrySupported) {
      setIsBiometricOn(true);
    }
  }, [keychainStore.isBiometrySupported, password]);

  const [isLoading, setIsLoading] = useState(false);
  return (
    <PageWithView
      disableSafeArea
      style={{
        paddingLeft: 50,
        paddingTop: 140,
        paddingRight: 50,
        backgroundColor: colors["background-container"],
      }}
    >
      <View />
      <View
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* <WelcomeRocket width={358} height={254} /> */}
        <View>
          <OWalletLogo size={120} />
        </View>
        <View style={{ paddingTop: 20 }}>
          <OWalletStar />
        </View>
        <Text
          style={{
            ...typography["h2"],
            color: colors["text-title-login"],
            marginTop: 18,
            fontWeight: "700",
          }}
        >
          Congratulation!
        </Text>
        <Text
          style={{
            ...typography["subtitle1"],
            color: colors["text-content-success"],
            textAlign: "center",
            paddingTop: 20,
            paddingLeft: 8,
            paddingRight: 8,
          }}
        >
          Your new wallet has been successfully
          {route?.params?.type === "recover" ? " imported" : " created"}!
        </Text>
      </View>
      {password && keychainStore.isBiometrySupported ? (
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            marginTop: 58,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              ...typography["subtitle1"],
              color: colors["text-black-medium"],
            }}
          >
            Enable Biometric
          </Text>
          <View
            style={{
              flex: 1,
            }}
          />
          <Toggle
            on={isBiometricOn}
            onChange={(value) => setIsBiometricOn(value)}
          />
        </View>
      ) : null}
      <OWButton
        label="Done"
        loading={isLoading}
        style={styles.btnDone}
        onPress={async () => {
          setIsLoading(true);
          try {
            if (password && isBiometricOn) {
              await keychainStore.turnOnBiometry(password);
            }
            // Definetly, the last key is newest keyring.
            if (keyRingStore.multiKeyStoreInfo.length > 0) {
              await keyRingStore.changeKeyRing(
                keyRingStore.multiKeyStoreInfo.length - 1
              );
            }
            resetTo(SCREENS.STACK.MainTab);
          } catch (e) {
            console.log(e);
            // alert(JSON.stringify(e));
            setIsLoading(false);
          }
        }}
      />
      <View
        style={{
          flex: 1,
        }}
      />
    </PageWithView>
  );
});

const styles = StyleSheet.create({
  btnDone: {
    marginTop: 44,
  },
});

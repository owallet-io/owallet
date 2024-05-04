import { RouteProp, useRoute } from "@react-navigation/native";
import { Text } from "@src/components/text";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { PageWithView } from "../../components/page";
import { Toggle } from "../../components/toggle";
import { useSmartNavigation } from "../../navigation.provider";
import { useStore } from "../../stores";
import OWButton from "@src/components/button/OWButton";
import { useTheme } from "@src/themes/theme-provider";
import { metrics, typography } from "../../themes";
import OWIcon from "@src/components/ow-icon/ow-icon";

export const RegisterDoneScreen: FunctionComponent = observer(() => {
  const { keychainStore, keyRingStore, appInitStore } = useStore();
  const { colors } = useTheme();
  const smartNavigation = useSmartNavigation();

  const styles = styling(colors);
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          password?: string;
          walletName?: string;
          type?: string;
        }
      >,
      string
    >
  >();

  const password = route.params?.password;
  const walletName = route.params?.walletName;

  const [isBiometricOn, setIsBiometricOn] = useState(false);

  useEffect(() => {
    if (password && keychainStore.isBiometrySupported) {
      setIsBiometricOn(true);
    }
  }, [keychainStore.isBiometrySupported, password]);

  useEffect(() => {
    appInitStore.selectAllNetworks(true);
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  return (
    <PageWithView
      disableSafeArea
      style={{
        backgroundColor: colors["neutral-surface-card"],
        justifyContent: "space-between",
      }}
    >
      <View
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <View>
          <View style={styles.container}>
            <Image
              style={{
                width: metrics.screenWidth,
                height: metrics.screenWidth,
              }}
              source={require("../../assets/image/img-bg.png")}
              resizeMode="contain"
              fadeDuration={0}
            />
          </View>
          <View style={styles.containerCheck}>
            <Image
              style={{
                width: metrics.screenWidth,
                height: metrics.screenWidth,
              }}
              source={require("../../assets/image/img-all-done.png")}
              resizeMode="contain"
              fadeDuration={0}
            />
          </View>
        </View>

        <Text
          size={28}
          weight={"700"}
          style={{
            color: colors["neutral-text-title"],
            lineHeight: 34,
          }}
        >
          ALL DONE!
        </Text>
        <Text
          style={{
            ...typography["subtitle1"],
            color: colors["neutral-text-body"],
            textAlign: "center",
            paddingTop: 20,
            paddingLeft: 8,
            paddingRight: 8,
          }}
        >
          Congratulations! Your wallet was successfully
          {route?.params?.type === "recover" ? " imported" : " created"}!
        </Text>
      </View>
      {walletName ? (
        <View
          style={{
            backgroundColor: colors["neutral-surface-action3"],
            margin: 16,
            borderRadius: 8,
          }}
        >
          <View
            style={[
              styles.rc,
              {
                padding: 16,
              },
            ]}
          >
            <Image
              style={{
                width: 32,
                height: 32,
                borderRadius: 32,
              }}
              source={require("../../assets/images/default-avatar.png")}
              resizeMode="contain"
              fadeDuration={0}
            />
            <Text
              size={16}
              weight={"500"}
              style={{
                color: colors["neutral-text-title"],
                paddingLeft: 6,
              }}
            >
              {walletName ?? "OWallet Account"}
            </Text>
          </View>
        </View>
      ) : null}

      <View>
        <View style={styles.btnDone}>
          {password && keychainStore.isBiometrySupported ? (
            <View style={styles.biometrics}>
              <View style={styles.rc}>
                <OWIcon
                  size={22}
                  name="face"
                  color={colors["neutral-text-title"]}
                />
                <Text
                  size={16}
                  weight={"500"}
                  style={{
                    color: colors["neutral-text-title"],
                    paddingLeft: 4,
                  }}
                >
                  Sign in with Biometrics
                </Text>
              </View>
              <Toggle
                on={isBiometricOn}
                onChange={(value) => setIsBiometricOn(value)}
              />
            </View>
          ) : null}
          <OWButton
            label="Continue"
            loading={isLoading}
            style={{
              borderRadius: 32,
            }}
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
                smartNavigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: "MainTab",
                    },
                  ],
                });
              } catch (e) {
                console.log(e);
                // alert(JSON.stringify(e));
                setIsLoading(false);
              }
            }}
          />
        </View>
      </View>
    </PageWithView>
  );
});

const styling = (colors) =>
  StyleSheet.create({
    btnDone: {
      width: "100%",
      alignItems: "center",
      padding: 16,
      marginBottom: 42,
    },
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      top: 0,
    },
    containerCheck: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    rc: {
      flexDirection: "row",
      alignItems: "center",
    },
    biometrics: {
      flexDirection: "row",
      marginBottom: 36,
      alignItems: "center",
      justifyContent: "space-between",
      width: metrics.screenWidth - 44,
    },
  });

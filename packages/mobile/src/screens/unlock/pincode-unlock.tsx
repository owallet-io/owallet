import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  AppStateStatus,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { observer } from "mobx-react-lite";
import { TextInput } from "../../components/input";
import delay from "delay";
import { useStore } from "../../stores";
import { StackActions, useNavigation } from "@react-navigation/native";
import { KeyRingStatus } from "@owallet/background";
import { AccountStore, KeyRingStore, WalletStatus } from "@owallet/stores";
import { autorun } from "mobx";
import { metrics, spacing } from "../../themes";
import { ProgressBar } from "../../components/progress-bar";
import CodePush from "react-native-code-push";
import messaging from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@src/themes/theme-provider";
import OWButton from "@src/components/button/OWButton";
import OWButtonIcon from "@src/components/button/ow-button-icon";
import { Text } from "@src/components/text";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { showToast } from "@src/utils/helper";
import { useAutoBiomtric } from "./index";
import SmoothPinCodeInput from "react-native-smooth-pincode-input";
import NumericPad from "react-native-numeric-pad";
import OWText from "@src/components/text/ow-text";
import { ChainStore } from "@src/stores/chain";
import { tracking } from "@src/utils/tracking";

export const waitAccountInit = async (
  chainStore: ChainStore,
  accountStore: AccountStore<any>,
  keyRingStore: KeyRingStore
) => {
  if (keyRingStore.status == KeyRingStatus.UNLOCKED) {
    for (const chainInfo of chainStore.chainInfos) {
      const account = accountStore.getAccount(chainInfo.chainId);
      if (account.walletStatus === WalletStatus.NotInit) {
        account.init();
      }
    }

    await new Promise<void>((resolve) => {
      const disposal = autorun(() => {
        // account init은 동시에 발생했을때 debounce가 되므로
        // 첫번째꺼 하나만 확인해도 된다.
        if (
          accountStore.getAccount(chainStore.chainInfos[0].chainId)
            .bech32Address
        ) {
          resolve();
          if (disposal) {
            disposal();
          }
        }
      });
    });
  }
};

enum AutoBiomtricStatus {
  NO_NEED,
  NEED,
  FAILED,
  SUCCESS,
}

// const useAutoBiomtric = (keychainStore: KeychainStore, tryEnabled: boolean) => {
//   const [status, setStatus] = useState(AutoBiomtricStatus.NO_NEED);
//   // const tryBiometricAutoOnce = useRef(false);

//   useEffect(() => {
//     if (keychainStore.isBiometryOn && status === AutoBiomtricStatus.NO_NEED) {
//       setStatus(AutoBiomtricStatus.NEED);
//     }
//   }, [keychainStore.isBiometryOn, status]);

//   return status;
// };

function DownloadCodepush({
  isLoading,
  installing,
  progress,
  setDownloading,
  setInstalling,
}) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors["neutral-surface-card"],
      }}
    >
      <View
        style={{
          marginBottom: spacing["24"],
        }}
      >
        <Image
          style={{
            height: metrics.screenWidth / 1.4,
            width: metrics.screenWidth / 1.4,
          }}
          fadeDuration={0}
          resizeMode="contain"
          source={require("../../assets/image/img_planet.png")}
        />
      </View>
      <Text
        style={{
          color: colors["primary-surface-default"],
          textAlign: "center",
          fontWeight: "600",
          fontSize: 18,
          lineHeight: 22,
          opacity: isLoading ? 0.5 : 1,
        }}
      >
        {installing ? `Installing` : `Checking for`} update
      </Text>
      <View style={{ marginVertical: 12 }}>
        <Text
          style={{
            color: colors["primary-surface-default"],
            textAlign: "center",
            fontSize: 13,
            lineHeight: 22,
          }}
        >
          {progress}%
        </Text>
        <ProgressBar progress={progress} styles={{ width: 260 }} />
      </View>
      <TouchableOpacity
        onPress={() => {
          setDownloading(false);
          setInstalling(false);
        }}
      >
        <Text
          style={{
            color: colors["primary-surface-default"],
            textAlign: "center",
            fontWeight: "600",
            fontSize: 16,
            lineHeight: 22,
            opacity: isLoading ? 0.5 : 1,
          }}
        >
          Cancel
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function PadComponent({
  isNumericPad,
  pinRef,
  code,
  showPass,
  statusPass,
  password,
  isFailed,
  setPassword,
  tryUnlock,
}) {
  const { colors } = useTheme();
  const styles = styling(colors);
  return (
    <>
      {isNumericPad ? (
        <SmoothPinCodeInput
          ref={pinRef}
          value={code}
          codeLength={6}
          cellStyle={{
            borderWidth: 0,
          }}
          cellStyleFocused={{
            borderColor: colors["neutral-surface-action"],
          }}
          placeholder={
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 48,
                backgroundColor: colors["neutral-surface-action"],
              }}
            />
          }
          mask={
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 48,
                opacity: 0.7,
                backgroundColor: colors["highlight-surface-active"],
              }}
            />
          }
          maskDelay={1000}
          password={true}
          //   onFulfill={}
          onBackspace={(code) => console.log(code)}
        />
      ) : (
        <View
          style={{
            width: metrics.screenWidth,
            paddingHorizontal: 16,
          }}
        >
          <TextInput
            accessibilityLabel="password"
            returnKeyType="done"
            secureTextEntry={statusPass}
            value={password}
            error={isFailed ? "Invalid password" : undefined}
            onChangeText={(txt) => {
              setPassword(txt);
            }}
            inputContainerStyle={{
              width: metrics.screenWidth - 32,
              borderWidth: 2,
              borderColor: colors["primary-surface-default"],
              borderRadius: 8,
              minHeight: 56,
              alignItems: "center",
              justifyContent: "center",
            }}
            onSubmitEditing={tryUnlock}
            placeholder="Enter your passcode"
            inputRight={
              <OWButtonIcon
                style={styles.padIcon}
                onPress={showPass}
                name={statusPass ? "eye" : "eye-slash"}
                colorIcon={colors["neutral-text-title"]}
                sizeIcon={22}
              />
            }
          />
        </View>
      )}
    </>
  );
}

export const PincodeUnlockScreen: FunctionComponent = observer(() => {
  const {
    keyRingStore,
    keychainStore,
    accountStore,
    chainStore,
    appInitStore,
    hugeQueriesStore,
  } = useStore();
  tracking(`Unlock Screen`);
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = styling(colors);
  const [downloading, setDownloading] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusPass, setStatusPass] = useState(true);
  const navigateToHomeOnce = useRef(false);
  const navigateToHome = useCallback(async () => {
    const chainId = chainStore.current.chainId;
    const isLedger = accountStore.getAccount(chainId).isNanoLedger;
    if (!navigateToHomeOnce.current) {
      if (
        !!accountStore.getAccount(chainId).bech32Address === false &&
        chainId?.startsWith("inj") &&
        isLedger
      ) {
        navigation.dispatch(StackActions.replace("MainTab"));
      } else {
        await waitAccountInit(chainStore, accountStore, keyRingStore);
        // setTimeout(() => {
        navigation.dispatch(StackActions.replace("MainTab"));
        // }, 1500);
      }
    }
    navigateToHomeOnce.current = true;
  }, [accountStore, chainStore, navigation]);

  const autoBiometryStatus = useAutoBiomtric(
    keychainStore,
    keyRingStore.status === KeyRingStatus.LOCKED && loaded
  );

  useEffect(() => {
    tracking("Unlock Screen");
    if (__DEV__) {
      return;
    }
    CodePush.sync(
      {
        // updateDialog: {
        //   appendReleaseDescription: true,
        //   title: 'Update available'
        // },
        installMode: CodePush.InstallMode.IMMEDIATE,
      },
      (status) => {
        switch (status) {
          case CodePush.SyncStatus.UP_TO_DATE:
            // Show "downloading" modal
            // modal.open();
            setLoaded(true);
            break;
          case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
            // Show "downloading" modal
            // modal.open();
            appInitStore?.updateDate(Date.now());
            setDownloading(true);
            break;
          case CodePush.SyncStatus.INSTALLING_UPDATE:
            // show installing
            setInstalling(true);
            break;
          case CodePush.SyncStatus.UPDATE_INSTALLED:
            setDownloading(false);
            setInstalling(false);
            setLoaded(true);
            appInitStore?.updateDate(Date.now());
            // Hide loading modal
            break;
        }
      },
      ({ receivedBytes, totalBytes }) => {
        /* Update download modal progress */
        setProgress(Math.ceil((receivedBytes / totalBytes) * 100));
      }
    );
  }, []);

  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [isNumericPad, setNumericPad] = useState(false);

  useEffect(() => {
    if (appInitStore.getInitApp.passcodeType === "numeric") {
      setNumericPad(true);
    }
  }, [appInitStore.getInitApp.passcodeType]);

  useEffect(() => {
    appInitStore.selectAllNetworks(true);
  }, []);

  const pinRef = useRef(null);
  const numpadRef = useRef(null);

  const [code, setCode] = useState("");

  const tryBiometric = useCallback(async () => {
    try {
      setIsBiometricLoading(true);
      setIsLoading(true);
      await delay(10);
      await keychainStore.tryUnlockWithBiometry();
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
      setIsBiometricLoading(false);
    }
  }, [keychainStore]);

  useEffect(() => {
    if (autoBiometryStatus && keychainStore.isBiometryOn) {
      tryBiometric();
    }
  }, [autoBiometryStatus]);

  const tryUnlock = async () => {
    try {
      tracking("Unlock Wallet");
      const passcode = isNumericPad ? code : password;
      setIsLoading(true);
      await delay(10);
      await keyRingStore.unlock(passcode, false);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
      pinRef?.current?.shake().then(() => setCode(""));
      numpadRef?.current?.clearAll();
      setIsFailed(true);
      showToast({
        type: "danger",
        message: "Invalid password",
      });
    }
  };

  const routeToRegisterOnce = useRef(false);
  useEffect(() => {
    if (
      !routeToRegisterOnce.current &&
      keyRingStore.status === KeyRingStatus.EMPTY
    ) {
      (() => {
        routeToRegisterOnce.current = true;
        navigation.dispatch(
          StackActions.replace("Register", {
            screen: "Register.Intro",
          })
        );
      })();
    }
  }, [keyRingStore.status, navigation]);

  useEffect(() => {
    const appStateHandler = (state: AppStateStatus) => {
      if (state !== "active") {
        setDownloading(false);
        setInstalling(false);
      }
    };
    const subscription = AppState.addEventListener("change", appStateHandler);

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (keyRingStore.status === KeyRingStatus.UNLOCKED) {
      (async () => {
        if (!downloading) {
          navigateToHome();
        }
      })();
    }
  }, [keyRingStore.status, navigateToHome, downloading]);

  // Notification setup section
  const regisFcmToken = useCallback(async (FCMToken) => {
    await AsyncStorage.setItem("FCM_TOKEN", FCMToken);
  }, []);

  const getToken = useCallback(async () => {
    const fcmToken = await AsyncStorage.getItem("FCM_TOKEN");

    if (!fcmToken) {
      messaging()
        .getToken()
        .then(async (FCMToken) => {
          if (FCMToken) {
            regisFcmToken(FCMToken);
          } else {
            // Alert.alert('[FCMService] User does not have a device token');
          }
        })
        .catch((error) => {
          // let err = `FCM token get error: ${error}`;
          // Alert.alert(err);
          console.log("[FCMService] getToken rejected ", error);
        });
    } else {
      // regisFcmToken(fcmToken);
    }
  }, [regisFcmToken]);

  const registerAppWithFCM = useCallback(() => {
    if (Platform.OS === "ios") {
      messaging()
        .registerDeviceForRemoteMessages()
        .then((register) => {
          getToken();
        });
      //await messaging().setAutoInitEnabled(true);
    } else {
      getToken();
    }
  }, [getToken]);

  const requestPermission = useCallback(() => {
    messaging()
      .requestPermission()
      .then(() => {
        registerAppWithFCM();
      })
      .catch((error) => {
        console.log("[FCMService] Requested persmission rejected ", error);
      });
  }, [registerAppWithFCM]);

  const checkPermission = useCallback(() => {
    messaging()
      .hasPermission()
      .then((enabled) => {
        if (enabled) {
          //user has permission
          registerAppWithFCM();
        } else {
          //user don't have permission
          requestPermission();
        }
      })
      .catch((error) => {
        requestPermission();
        let err = `check permission error${error}`;
        Alert.alert(err);
        // console.log("[FCMService] Permission rejected", error)
      });
  }, [registerAppWithFCM, requestPermission]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {});
    return unsubscribe;
  }, []);

  const onSwitchPad = (type) => {
    setCode("");
    if (type === "numeric") {
      setNumericPad(true);
    } else {
      setNumericPad(false);
    }
  };

  useEffect(() => {
    Keyboard.dismiss();
  }, []);

  useEffect(() => {
    if (code.length >= 6) {
      tryUnlock();
    }
  }, [code]);

  useEffect(() => {
    if (appInitStore.getInitApp.passcodeType === "alphabet") {
      setNumericPad(false);
    }
  }, [appInitStore.getInitApp.passcodeType]);

  // return <MaintainScreen />;
  const showPass = () => setStatusPass(!statusPass);
  if (
    !routeToRegisterOnce.current &&
    keyRingStore.status === KeyRingStatus.EMPTY
  )
    return <View />;
  if (downloading || installing)
    return (
      <DownloadCodepush
        isLoading={isLoading}
        installing={installing}
        progress={progress}
        setDownloading={setDownloading}
        setInstalling={setInstalling}
      />
    );

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
      {isLoading || isBiometricLoading ? (
        <View
          style={{
            backgroundColor: colors["neutral-surface-bg"],
            width: metrics.screenWidth,
            height: metrics.screenHeight,
            opacity: 0.8,
            position: "absolute",
            zIndex: 999,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size={"large"} />
        </View>
      ) : null}
      <View style={styles.container}>
        <View style={styles.aic}>
          <OWText
            variant="heading"
            color={colors["nertral-text-title"]}
            typo="bold"
          >
            Enter your passcode
          </OWText>
          <View
            style={{
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 32,
            }}
          >
            {isNumericPad ? (
              <SmoothPinCodeInput
                ref={pinRef}
                value={code}
                codeLength={6}
                cellStyle={{
                  borderWidth: 0,
                }}
                cellStyleFocused={{
                  borderColor: colors["neutral-surface-action"],
                }}
                placeholder={
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 48,
                      backgroundColor: colors["neutral-surface-action"],
                    }}
                  />
                }
                mask={
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 48,
                      opacity: 0.7,
                      backgroundColor: colors["highlight-surface-active"],
                    }}
                  />
                }
                maskDelay={1000}
                password={true}
                //   onFulfill={}
                onBackspace={(code) => console.log(code)}
              />
            ) : (
              <View
                style={{
                  width: metrics.screenWidth,
                  paddingHorizontal: 16,
                }}
              >
                <TextInput
                  accessibilityLabel="password"
                  returnKeyType="done"
                  secureTextEntry={statusPass}
                  value={password}
                  error={isFailed ? "Invalid password" : undefined}
                  onChangeText={(txt) => {
                    setPassword(txt);
                  }}
                  inputContainerStyle={{
                    width: metrics.screenWidth - 32,
                    borderWidth: 2,
                    borderColor: colors["primary-surface-default"],
                    borderRadius: 8,
                    minHeight: 56,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onSubmitEditing={tryUnlock}
                  placeholder="Enter your passcode"
                  inputRight={
                    <OWButtonIcon
                      style={styles.padIcon}
                      onPress={showPass}
                      name={statusPass ? "eye" : "eye-slash"}
                      colorIcon={colors["neutral-text-title"]}
                      sizeIcon={22}
                    />
                  }
                />
              </View>
            )}
          </View>
          <View style={[styles.rc, styles.switch]}>
            <TouchableOpacity
              style={[
                styles.switchText,
                isNumericPad ? styles.switchTextActive : { marginRight: 9 },
              ]}
              onPress={() => onSwitchPad("numeric")}
            >
              <OWText
                color={colors["neutral-text-action-on-light-bg"]}
                weight="500"
                size={16}
              >
                123
              </OWText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.switchText,
                !isNumericPad ? styles.switchTextActive : { marginLeft: 9 },
              ]}
              onPress={() => onSwitchPad("alphabet")}
            >
              <OWText weight="500" size={16}>
                Aa
              </OWText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.aic}>
          {keychainStore.isBiometryOn && (
            <TouchableOpacity onPress={() => tryBiometric()}>
              <View style={styles.rc}>
                <OWIcon size={14} name="face" color={colors["purple-900"]} />
                <OWText
                  style={{ paddingLeft: 8 }}
                  variant="h2"
                  weight="600"
                  size={14}
                  color={colors["purple-900"]}
                >
                  Sign in with Biometrics
                </OWText>
              </View>
            </TouchableOpacity>
          )}
          {isNumericPad ? (
            <NumericPad
              ref={numpadRef}
              numLength={6}
              buttonSize={60}
              activeOpacity={0.1}
              onValueChange={(value) => {
                setCode(value);
              }}
              allowDecimal={false}
              buttonItemStyle={styles.buttonItemStyle}
              buttonTextStyle={styles.buttonTextStyle}
              //@ts-ignore
              rightBottomButton={
                <OWIcon
                  size={30}
                  color={colors["neutral-text-title"]}
                  name="backspace-outline"
                />
              }
              onRightBottomButtonPress={() => {
                numpadRef?.current?.clear();
              }}
            />
          ) : (
            <View style={styles.signIn}>
              <OWButton
                style={{
                  borderRadius: 32,
                }}
                label="Continue"
                disabled={isLoading || !password}
                onPress={() => {
                  tryUnlock();
                }}
                loading={isLoading || isBiometricLoading}
              />
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
});

const styling = (colors) =>
  StyleSheet.create({
    useBiometric: {},
    container: {
      paddingTop: metrics.screenHeight / 19,
      justifyContent: "space-between",
      height: "100%",
      backgroundColor: colors["neutral-surface-card"],
    },
    signIn: {
      width: "100%",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: colors["neutral-border-default"],
      padding: 16,
    },
    padIcon: {
      paddingLeft: 10,
      width: "auto",
    },
    aic: {
      alignItems: "center",
      paddingBottom: 20,
    },
    rc: {
      flexDirection: "row",
      alignItems: "center",
    },
    buttonTextStyle: {
      fontSize: 22,
      color: colors["neutral-text-title"],
      fontFamily: "SpaceGrotesk-SemiBold",
    },
    buttonItemStyle: {
      backgroundColor: colors["neutral-surface-action3"],
      width: 110,
      height: 80,
      borderRadius: 8,
    },
    switch: {
      backgroundColor: colors["neutral-surface-action3"],
      padding: 4,
      borderRadius: 999,
      marginTop: 32,
    },
    switchText: {
      paddingHorizontal: 24,
      paddingVertical: 6,
    },
    switchTextActive: {
      backgroundColor: colors["neutral-surface-toggle-active"],
      borderRadius: 999,
    },
    goBack: {
      backgroundColor: colors["neutral-surface-action3"],
      borderRadius: 999,
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 16,
    },
  });

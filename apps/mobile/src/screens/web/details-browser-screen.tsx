import {
  ActivityIndicator,
  BackHandler,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { PageWithViewInBottomTabView } from "@src/components/page";
import { TextInput } from "@src/components/input";
import OWButtonIcon from "@src/components/button/ow-button-icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@src/themes/theme-provider";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import React, { useCallback, useEffect, useRef, useState } from "react";
import EventEmitter from "eventemitter3";
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useStore } from "@src/stores";
import { version, name } from "../../../package.json";
import {
  // RNInjectedBitcoin,
  // RNInjectedEthereum,
  RNInjectedOWallet,
  // RNInjectedTronWeb,
} from "@src/injected/injected-provider";
// import { Bitcoin, Ethereum, OWallet, TronWeb } from "@owallet/provider";
import { OWallet } from "@owallet/provider";
import {
  RNMessageRequesterExternal,
  RNMessageRequesterInternal,
} from "@src/router";
import { URL } from "react-native-url-polyfill";
import DeviceInfo from "react-native-device-info";
import { SCREENS } from "@src/common/constants";
import LottieView from "lottie-react-native";
import { LoadingBar } from "@src/screens/web/components/loadingBar";
import get from "lodash/get";
import { tracking } from "@src/utils/tracking";
import { navigate, popTo, popToTop } from "@src/router/root";
import { BACKGROUND_PORT } from "@owallet/router";
import { URLTempAllowOnMobileMsg } from "@owallet/background";

export const DetailsBrowserScreen = observer((props) => {
  const { top } = useSafeAreaInsets();
  const { colors } = useTheme();
  const webviewRef = useRef<WebView | null>(null);
  tracking(`Detail Browser Screen`);
  const [eventEmitter] = useState(() => new EventEmitter());
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const { keyRingStore, chainStore, browserStore } = useStore();
  const route = useRoute();
  const [useProperty, setUseProperty] = useState({
    percent: 0, //range:  0 - 1
    color: "#3B78E7",
    visible: false,
    height: 3,
  });
  const [currentURL, setCurrentURL] = useState(() => {
    if (route?.params?.url) {
      return route?.params?.url;
    }

    return "";
  });
  const { inject } = browserStore;
  const sourceCode = inject;
  // const [owallet] = useState(
  //   () =>
  //     new OWallet(
  //       `${name}-${version}`,
  //       "core",
  //       new RNMessageRequesterExternal(() => {
  //         if (!webviewRef.current) {
  //           throw new Error("Webview not initialized yet");
  //         }
  //
  //         if (!currentURL) {
  //           throw new Error("Current URL is empty");
  //         }
  //
  //         return {
  //           url: currentURL,
  //           origin: new URL(currentURL).origin,
  //         };
  //       })
  //     )
  // );
  // const [eventEmitter] = useState(() => new EventEmitter());
  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      eventEmitter.emit("message", event.nativeEvent);

      const data: { message: string; origin: string } = JSON.parse(
        event.nativeEvent.data
      );

      if (data.message === "allow-temp-blocklist-url") {
        try {
          new RNMessageRequesterInternal()
            .sendMessage(
              BACKGROUND_PORT,
              new URLTempAllowOnMobileMsg(
                new URL(currentURL).href,
                new URL(data.origin).href
              )
            )
            .then(() => {
              setCurrentURL(data.origin);
            })
            .catch((e) => {
              console.log(e);
              // ignore error
            });
        } catch (e) {
          // noop
          console.log(e);
        }
      }

      // if (data.message === 'download-image') {
      //   setImageData(data.origin);
      //   setIsSaveImageModalOpen(true);
      // }
    },
    [eventEmitter, currentURL]
  );

  // const [bitcoin] = useState(
  //   () =>
  //     new Bitcoin(
  //       version,
  //       "core",
  //       new RNMessageRequesterExternal(() => {
  //         if (!webviewRef.current) {
  //           throw new Error("Webview not initialized yet");
  //         }
  //
  //         if (!currentURL) {
  //           throw new Error("Current URL is empty");
  //         }
  //
  //         return {
  //           url: currentURL,
  //           origin: new URL(currentURL).origin,
  //         };
  //       })
  //     )
  // );
  //
  // const [ethereum] = useState(
  //   () =>
  //     new Ethereum(
  //       DeviceInfo.getVersion(),
  //       "core",
  //       chainStore.current.chainId,
  //       new RNMessageRequesterExternal(() => {
  //         if (!webviewRef.current) {
  //           throw new Error("Webview not initialized yet");
  //         }
  //
  //         if (!currentURL) {
  //           throw new Error("Current URL is empty");
  //         }
  //
  //         return {
  //           url: currentURL,
  //           origin: new URL(currentURL).origin,
  //         };
  //       })
  //     )
  // );
  //
  // const [tronWeb] = useState(
  //   () =>
  //     new TronWeb(
  //       version,
  //       "core",
  //       chainStore.current.chainId,
  //       new RNMessageRequesterExternal(() => {
  //         if (!webviewRef.current) {
  //           throw new Error("Webview not initialized yet");
  //         }
  //
  //         if (!currentURL) {
  //           throw new Error("Current URL is empty");
  //         }
  //
  //         return {
  //           url: currentURL,
  //           origin: new URL(currentURL).origin,
  //         };
  //       })
  //     )
  // );
  // const eventListener = {
  //   addMessageListener: (fn: any) => {
  //     eventEmitter.addListener("message", fn);
  //   },
  //   postMessage: (message: any) => {
  //     webviewRef.current?.injectJavaScript(
  //       `
  //           window.postMessage(${JSON.stringify(
  //             message
  //           )}, window.location.origin);
  //           true; // note: this is required, or you'll sometimes get silent failures
  //         `
  //     );
  //   },
  // };
  // Start proxy for webview
  // useEffect(() => {
  //   RNInjectedOWallet.startProxy(
  //     owallet,
  //     eventListener,
  //     RNInjectedOWallet.parseWebviewMessage
  //   );
  // }, [eventEmitter, owallet]);
  useEffect(() => {
    const unlisten = RNInjectedOWallet.startProxy(
      new OWallet(
        version,
        "core",
        new RNMessageRequesterExternal(() => {
          // const url = (() => {
          //   return recentUrl.current.startsWith('http://') ||
          //   recentUrl.current.startsWith('https://')
          //       ? recentUrl.current
          //       : uri;
          // })();
          return {
            url: currentURL,
            origin: new URL(currentURL).origin,
          };
        })
      ),
      {
        addMessageListener: (fn) => {
          eventEmitter.addListener("message", fn);
        },
        removeMessageListener: (fn) => {
          eventEmitter.removeListener("message", fn);
        },
        postMessage: (message) => {
          webviewRef.current?.injectJavaScript(
            `
                window.postMessage(${JSON.stringify(
                  message
                )}, window.location.origin);
                true; // note: this is required, or you'll sometimes get silent failures
              `
          );
        },
      },
      RNInjectedOWallet.parseWebviewMessage
    );

    return () => {
      unlisten();
    };
  }, [chainStore, currentURL, eventEmitter]);

  // useEffect(() => {
  //   RNInjectedBitcoin.startProxy(
  //     bitcoin,
  //     eventListener,
  //     RNInjectedBitcoin.parseWebviewMessage
  //   );
  // }, [eventEmitter, bitcoin]);
  // useEffect(() => {
  //   RNInjectedEthereum.startProxy(
  //     ethereum,
  //     eventListener,
  //     RNInjectedEthereum.parseWebviewMessage
  //   );
  // }, [eventEmitter, ethereum]);
  //
  // useEffect(() => {
  //   RNInjectedTronWeb.startProxy(
  //     tronWeb,
  //     eventListener,
  //     RNInjectedTronWeb.parseWebviewMessage
  //   );
  // }, [eventEmitter, tronWeb]);
  // useEffect(() => {
  //   const keyStoreChangedListener = () => {
  //     webviewRef.current?.injectJavaScript(
  //       `
  //           window.dispatchEvent(new Event("keplr_keystorechange"));
  //           true; // note: this is required, or you'll sometimes get silent failures
  //         `
  //     );
  //   };
  //
  //   keyRingStore.addKeyStoreChangedListener(keyStoreChangedListener);
  //
  //   return () => {
  //     keyRingStore.removeKeyStoreChangedListener(keyStoreChangedListener);
  //   };
  // }, [keyRingStore]);
  useEffect(() => {
    // Handle the hardware back button on the android.
    const backHandler = () => {
      if (!isFocused || webviewRef.current == null) {
        return false;
      }

      if (!canGoBack) {
        return false;
      }

      webviewRef.current.goBack();
      return true;
    };

    if (isFocused) {
      BackHandler.addEventListener("hardwareBackPress", backHandler);
    }

    return () => {
      BackHandler.removeEventListener("hardwareBackPress", backHandler);
    };
  }, [canGoBack, isFocused]);
  // const onMessage = useCallback(
  //   (event: WebViewMessageEvent) => {
  //     eventEmitter.emit("message", event.nativeEvent);
  //   },
  //   [eventEmitter]
  // );

  useEffect(() => {
    // Android disables the gesture by default.
    // If we turn on the gesture manually without checking OS,
    // the gesture will turn on even on Android.
    // So, checking platform is required.
    if (Platform.OS === "ios") {
      navigation.setOptions({
        gestureEnabled: !canGoBack,
      });
    }
  }, [canGoBack, navigation]);

  const onHomeBrowser = () => {
    popToTop();
    return;
  };
  const onReload = () => {
    webviewRef.current.reload();
  };
  const onGoback = () => {
    if (!canGoBack) navigation.goBack();
    webviewRef.current?.goBack();
  };
  const onGoForward = () => {
    if (!canGoForward) return;
    webviewRef.current?.goForward();
  };

  const onAddBookMark = (bookmark) => {
    if (!bookmark) return;
    browserStore.addBoorkmark(bookmark);
    return;
  };
  const isActiveBoorkmark = (uri) => {
    if (!uri) return false;
    const isActive = browserStore.getBookmarks.findIndex(
      (item) => item?.uri === uri
    );
    return isActive !== -1 ? true : false;
  };
  const { color, percent, visible, height } = useProperty;
  const timer = useRef();
  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  const styles = styling(colors);
  const onLoadStart = (syntheticEvent) => {
    syntheticEvent.persist();
    // update component to be aware of loading status
    setUseProperty((prev) => ({ ...prev, visible: true }));
  };
  const onLoadEnd = (syntheticEvent) => {
    syntheticEvent.persist();
    // update component to be aware of loading status
    timer.current = setTimeout(() => {
      setUseProperty((prev) => ({ ...prev, visible: false }));
    }, 300) as any;
  };
  const onLoadProgress = (e) => {
    e.persist();

    if (e.nativeEvent.url === route?.params?.url) {
      setCanGoBack(false);
    } else {
      setCanGoBack(e.nativeEvent.canGoBack);
    }
    setCanGoForward(e.nativeEvent.canGoForward);
    // const { progress } = e.nativeEvent;
    setCurrentURL(e.nativeEvent.url);
    // Strangely, `onLoadProgress` is only invoked whenever page changed only in Android.
    // Use two handlers to measure simultaneously in ios and android.
    setUseProperty((prev) => ({
      ...prev,
      percent: e.nativeEvent?.progress ?? 0.1,
    }));
  };
  const onNavStateChange = (e) => {
    // Strangely, `onNavigationStateChange` is only invoked whenever page changed only in IOS.
    // Use two handlers to measure simultaneously in ios and android.
    if (e.url === route?.params?.url) {
      setCanGoBack(false);
    } else {
      setCanGoBack(e.canGoBack);
    }
    setCanGoForward(e.canGoForward);
    setCurrentURL(e.url);
  };
  const onError = () => {
    setUseProperty((prev) => ({
      ...prev,
      percent: 1,
      color: colors["error-border-default"],
    }));
  };
  return (
    <PageWithViewInBottomTabView
      style={{
        paddingTop: top,
        backgroundColor: colors["neutral-surface-card"],
      }}
    >
      <View
        style={{
          backgroundColor: colors["neutral-surface-card"],
          flexGrow: 1,
        }}
      >
        <View style={styles.containerHeader}>
          <OWButtonIcon
            size={"medium"}
            disabled={!canGoBack}
            onPress={onGoback}
            style={styles.icon}
            fullWidth={false}
            colorIcon={
              canGoBack
                ? colors["neutral-text-action-on-light-bg"]
                : colors["neutral-icon-disable"]
            }
            name={"tdesignchevron-left"}
            sizeIcon={18}
          />

          <OWButtonIcon
            size={"medium"}
            style={styles.icon}
            onPress={onGoForward}
            disabled={!canGoForward}
            fullWidth={false}
            colorIcon={
              canGoForward
                ? colors["neutral-text-action-on-light-bg"]
                : colors["neutral-icon-disable"]
            }
            name={"tdesignchevron-right"}
            sizeIcon={18}
          />

          <View
            style={{
              flex: 1,
            }}
          >
            <TextInput
              defaultValue={currentURL}
              inputStyle={{
                backgroundColor: colors["neutral-surface-action"],
                borderWidth: 0,
                borderRadius: 999,
              }}
              containerStyle={{
                paddingBottom: 0,
                width: "100%",
              }}
              editable={false}
              inputRight={
                <OWButtonIcon
                  onPress={onReload}
                  colorIcon={colors["neutral-text-title"]}
                  fullWidth={false}
                  name={"tdesignrefresh"}
                  sizeIcon={18}
                />
              }
            />
          </View>
          <OWButtonIcon
            size={"medium"}
            style={styles.icon}
            fullWidth={false}
            onPress={() => onAddBookMark({ uri: currentURL })}
            colorIcon={
              isActiveBoorkmark(currentURL)
                ? colors["primary-surface-pressed"]
                : colors["neutral-text-title"]
            }
            name={"tdesignbookmark"}
            sizeIcon={18}
          />
          <OWButtonIcon
            size={"medium"}
            onPress={onHomeBrowser}
            style={styles.icon}
            colorIcon={colors["neutral-text-title"]}
            fullWidth={false}
            name={"tdesignhome"}
            sizeIcon={18}
          />
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: colors["neutral-surface-bg"],
          }}
        >
          {visible && percent < 1 && (
            <>
              {Platform.OS !== "android" && (
                <View style={styles.containerLoading}>
                  <LottieView
                    source={require("@src/assets/animations/loading_owallet.json")}
                    style={{ width: 130, height: 130 }}
                    autoPlay
                    loop
                  />
                </View>
              )}
              <LoadingBar height={height} color={color} percent={percent} />
            </>
          )}

          {sourceCode && route?.params?.url && (
            <>
              <WebView
                originWhitelist={["*"]} // to allowing WebView to load blob
                ref={webviewRef}
                // style={visible && percent < 1 ? { flex: 0, height: 0, opacity: 0 } : {}}
                // cacheEnabled={true}
                injectedJavaScriptBeforeContentLoadedForMainFrameOnly={false}
                injectedJavaScriptForMainFrameOnly={false}
                injectedJavaScriptBeforeContentLoaded={sourceCode}
                // onLoad={handleWebViewLoaded}
                onMessage={onMessage}
                onNavigationStateChange={onNavStateChange}
                onLoadProgress={onLoadProgress}
                onLoadStart={onLoadStart}
                onLoadEnd={onLoadEnd}
                onError={onError}
                contentInsetAdjustmentBehavior="never"
                automaticallyAdjustContentInsets={false}
                decelerationRate="normal"
                allowsBackForwardNavigationGestures={true}
                // onScroll={_onScroll}
                applicationNameForUserAgent={`OWalletMobile/${DeviceInfo.getVersion()}`}
                source={{ uri: route?.params?.url }}
              />
            </>
          )}
        </View>
      </View>
    </PageWithViewInBottomTabView>
  );
});

const styling = (colors) => {
  return StyleSheet.create({
    icon: {
      width: 44,
      height: 44,
      borderRadius: 999,

      backgroundColor: colors["neutral-surface-action3"],
    },
    containerLoading: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    containerHeader: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
  });
};

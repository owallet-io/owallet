import { ActivityIndicator, BackHandler, Platform, View } from "react-native";
import { PageWithViewInBottomTabView } from "@src/components/page";
import { TextInput } from "@src/components/input";
import OWButtonIcon from "@src/components/button/ow-button-icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@src/themes/theme-provider";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useInjectedSourceCode } from "@src/screens/web/hooks/inject-hook";
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
  RNInjectedBitcoin,
  RNInjectedEthereum,
  RNInjectedOWallet,
  RNInjectedTronWeb,
} from "@src/injected/injected-provider";
import { Bitcoin, Ethereum, OWallet, TronWeb } from "@owallet/provider";
import { RNMessageRequesterExternal } from "@src/router";
import { URL } from "react-native-url-polyfill";
import DeviceInfo from "react-native-device-info";
import { SCREENS } from "@src/common/constants";
import LottieView from "lottie-react-native";

export const DetailsBrowserScreen = observer((props) => {
  const { top } = useSafeAreaInsets();
  const { colors } = useTheme();
  const webviewRef = useRef<WebView | null>(null);

  const [eventEmitter] = useState(() => new EventEmitter());
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const { keyRingStore, chainStore, browserStore } = useStore();
  const route = useRoute();
  const [currentURL, setCurrentURL] = useState(() => {
    if (route?.params?.url) {
      return route?.params?.url;
    }

    return "";
  });
  const { inject } = browserStore;
  const sourceCode = inject;
  const [owallet] = useState(
    () =>
      new OWallet(
        `${name}-${version}`,
        "core",
        new RNMessageRequesterExternal(() => {
          if (!webviewRef.current) {
            throw new Error("Webview not initialized yet");
          }

          if (!currentURL) {
            throw new Error("Current URL is empty");
          }

          return {
            url: currentURL,
            origin: new URL(currentURL).origin,
          };
        })
      )
  );
  const [bitcoin] = useState(
    () =>
      new Bitcoin(
        version,
        "core",
        new RNMessageRequesterExternal(() => {
          if (!webviewRef.current) {
            throw new Error("Webview not initialized yet");
          }

          if (!currentURL) {
            throw new Error("Current URL is empty");
          }

          return {
            url: currentURL,
            origin: new URL(currentURL).origin,
          };
        })
      )
  );

  const [ethereum] = useState(
    () =>
      new Ethereum(
        DeviceInfo.getVersion(),
        "core",
        chainStore.current.chainId,
        new RNMessageRequesterExternal(() => {
          if (!webviewRef.current) {
            throw new Error("Webview not initialized yet");
          }

          if (!currentURL) {
            throw new Error("Current URL is empty");
          }

          return {
            url: currentURL,
            origin: new URL(currentURL).origin,
          };
        })
      )
  );

  const [tronWeb] = useState(
    () =>
      new TronWeb(
        version,
        "core",
        chainStore.current.chainId,
        new RNMessageRequesterExternal(() => {
          if (!webviewRef.current) {
            throw new Error("Webview not initialized yet");
          }

          if (!currentURL) {
            throw new Error("Current URL is empty");
          }

          return {
            url: currentURL,
            origin: new URL(currentURL).origin,
          };
        })
      )
  );
  const eventListener = {
    addMessageListener: (fn: any) => {
      eventEmitter.addListener("message", fn);
    },
    postMessage: (message: any) => {
      webviewRef.current?.injectJavaScript(
        `
            window.postMessage(${JSON.stringify(
              message
            )}, window.location.origin);
            true; // note: this is required, or you'll sometimes get silent failures
          `
      );
    },
  };
  // Start proxy for webview
  useEffect(() => {
    RNInjectedOWallet.startProxy(
      owallet,
      eventListener,
      RNInjectedOWallet.parseWebviewMessage
    );
  }, [eventEmitter, owallet]);

  useEffect(() => {
    RNInjectedBitcoin.startProxy(
      bitcoin,
      eventListener,
      RNInjectedBitcoin.parseWebviewMessage
    );
  }, [eventEmitter, bitcoin]);
  useEffect(() => {
    RNInjectedEthereum.startProxy(
      ethereum,
      eventListener,
      RNInjectedEthereum.parseWebviewMessage
    );
  }, [eventEmitter, ethereum]);

  useEffect(() => {
    RNInjectedTronWeb.startProxy(
      tronWeb,
      eventListener,
      RNInjectedTronWeb.parseWebviewMessage
    );
  }, [eventEmitter, tronWeb]);
  useEffect(() => {
    const keyStoreChangedListener = () => {
      webviewRef.current?.injectJavaScript(
        `
            window.dispatchEvent(new Event("keplr_keystorechange"));
            true; // note: this is required, or you'll sometimes get silent failures
          `
      );
    };

    keyRingStore.addKeyStoreChangedListener(keyStoreChangedListener);

    return () => {
      keyRingStore.removeKeyStoreChangedListener(keyStoreChangedListener);
    };
  }, [keyRingStore]);
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
  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      eventEmitter.emit("message", event.nativeEvent);
    },
    [eventEmitter]
  );

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
    navigation.navigate(SCREENS.Browser);
    return;
  };
  const onReload = () => {
    webviewRef.current.reload();
  };
  const onGoback = () => {
    webviewRef.current.goBack();
  };
  const onGoForward = () => {
    webviewRef.current.goForward();
  };
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
  }, []);
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
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingBottom: 8,
          }}
        >
          <OWButtonIcon
            size={"medium"}
            onPress={onGoback}
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              backgroundColor: colors["neutral-surface-action3"],
              marginRight: 3,
            }}
            fullWidth={false}
            name={"tdesignchevron-left"}
            sizeIcon={18}
          />

          <OWButtonIcon
            size={"medium"}
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              backgroundColor: colors["neutral-surface-action3"],
              marginLeft: 3,
            }}
            onPress={onGoForward}
            fullWidth={false}
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
                paddingHorizontal: 12,
                paddingBottom: 0,
                width: "100%",
              }}
              editable={false}
              inputRight={
                <OWButtonIcon
                  onPress={onReload}
                  fullWidth={false}
                  name={"tdesignrefresh"}
                  sizeIcon={18}
                />
              }
            />
          </View>
          <OWButtonIcon
            size={"medium"}
            style={{
              width: 44,
              height: 44,
              marginRight: 3,
              borderRadius: 999,
              backgroundColor: colors["neutral-surface-action3"],
            }}
            fullWidth={false}
            name={"tdesignbookmark"}
            sizeIcon={18}
          />
          <OWButtonIcon
            size={"medium"}
            onPress={onHomeBrowser}
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              marginLeft: 3,
              backgroundColor: colors["neutral-surface-action3"],
            }}
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
          {isLoading && (
            <View
              style={{
                width: "100%",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <LottieView
                source={require("@src/assets/animations/loading.json")}
                style={{ width: 200, height: 200 }}
                autoPlay
                loop
              />
            </View>
          )}
          {sourceCode && route?.params?.url ? (
            <WebView
              originWhitelist={["*"]} // to allowing WebView to load blob
              ref={webviewRef}
              // incognito={true}
              // style={pageLoaded ? {} : { flex: 0, height: 0, opacity: 0 }}
              renderLoading={() => {
                return (
                  <View
                    style={{
                      width: "100%",
                      height: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <LottieView
                      source={require("@src/assets/animations/loading.json")}
                      style={{ width: 200, height: 200 }}
                      autoPlay
                      loop
                    />
                  </View>
                );
              }}
              // containerStyle={{ marginBottom: bottomHeight }}
              cacheEnabled={true}
              injectedJavaScriptBeforeContentLoaded={sourceCode}
              // onLoad={handleWebViewLoaded}
              onMessage={onMessage}
              onNavigationStateChange={(e) => {
                // Strangely, `onNavigationStateChange` is only invoked whenever page changed only in IOS.
                // Use two handlers to measure simultaneously in ios and android.
                setCanGoBack(e.canGoBack);
                setCanGoForward(e.canGoForward);

                setCurrentURL(e.url);
              }}
              onLoadProgress={(e) => {
                // Strangely, `onLoadProgress` is only invoked whenever page changed only in Android.
                // Use two handlers to measure simultaneously in ios and android.
                setCanGoBack(e.nativeEvent.canGoBack);
                setCanGoForward(e.nativeEvent.canGoForward);

                setCurrentURL(e.nativeEvent.url);
              }}
              onLoadStart={(syntheticEvent) => {
                // update component to be aware of loading status
                // const { nativeEvent } = syntheticEvent;
                // console.log(nativeEvent.loading,"nativeEvent.loading")
                setIsLoading(true);
              }}
              onLoadEnd={(syntheticEvent) => {
                // update component to be aware of loading status
                // const { nativeEvent } = syntheticEvent;
                // console.log(nativeEvent.loading,"nativeEvent.loading")
                setIsLoading(false);
              }}
              contentInsetAdjustmentBehavior="never"
              automaticallyAdjustContentInsets={false}
              decelerationRate="normal"
              allowsBackForwardNavigationGestures={true}
              // onScroll={_onScroll}
              source={{ uri: route?.params?.url }}
            />
          ) : (
            <View
              style={{
                width: "100%",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <LottieView
                source={require("@src/assets/animations/loading.json")}
                style={{ width: 200, height: 200 }}
                autoPlay
                loop
              />
            </View>
          )}
        </View>
      </View>
    </PageWithViewInBottomTabView>
  );
});

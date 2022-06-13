import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { BackHandler, Platform } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { useStyle } from '../../../../styles';
import { OWallet, Ethereum } from '@owallet/provider';
import { RNMessageRequesterExternal } from '../../../../router';
import {
  RNInjectedEthereum,
  RNInjectedOWallet,
} from '../../../../injected/injected-provider';
import RNFS from 'react-native-fs';
import EventEmitter from 'eventemitter3';
// import { PageWithViewInBottomTabView } from "../../../../components/page";
import { PageWithView } from '../../../../components/page';
import { OnScreenWebpageScreenHeader } from '../header';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { WebViewStateContext } from '../context';
import { URL } from 'react-native-url-polyfill';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../../stores';
import DeviceInfo from 'react-native-device-info';
// import { OraiDexUrl } from '../../config';

export const useInjectedSourceCode = () => {
  const [code, setCode] = useState<string | undefined>();

  useEffect(() => {
    // if (__DEV__) {
    //   fetch(`${OraiDexUrl}/injected-provider.bundle.js`)
    //     .then((res) => res.text())
    //     .then(setCode);
    //   return;
    // }
    if (Platform.OS === 'ios') {
      RNFS.readFile(`${RNFS.MainBundlePath}/injected-provider.bundle.js`).then(
        setCode
      );
    } else {
      RNFS.readFileAssets('injected-provider.bundle.js').then(setCode);
    }
  }, []);

  return code;
};

export const WebpageScreen: FunctionComponent<
  React.ComponentProps<typeof WebView> & {
    name: string;
  }
> = observer((props) => {
  const { keyRingStore } = useStore();

  const style = useStyle();

  const webviewRef = useRef<WebView | null>(null);
  const [currentURL, setCurrentURL] = useState(() => {
    if (props.source && 'uri' in props.source) {
      return props.source.uri;
    }

    return '';
  });

  const [owallet] = useState(
    () =>
      new OWallet(
        DeviceInfo.getVersion(),
        'core',
        new RNMessageRequesterExternal(() => {
          if (!webviewRef.current) {
            throw new Error('Webview not initialized yet');
          }

          if (!currentURL) {
            throw new Error('Current URL is empty');
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
        'core',
        new RNMessageRequesterExternal(() => {
          if (!webviewRef.current) {
            throw new Error('Webview not initialized yet');
          }

          if (!currentURL) {
            throw new Error('Current URL is empty');
          }

          return {
            url: currentURL,
            origin: new URL(currentURL).origin,
          };
        })
      )
  );

  const [eventEmitter] = useState(() => new EventEmitter());
  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      if (__DEV__) {
        console.log('WebViewMessageEvent', event.nativeEvent.data);
      }
      eventEmitter.emit('message', event.nativeEvent);
    },
    [eventEmitter]
  );

  useEffect(() => {
    RNInjectedOWallet.startProxy(
      owallet,

      {
        addMessageListener: (fn) => {
          eventEmitter.addListener('message', fn);
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

    RNInjectedEthereum.startProxy(
      ethereum,
      {
        addMessageListener: (fn) => {
          eventEmitter.addListener('message', fn);
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
  }, [eventEmitter, owallet, ethereum]);

  useEffect(() => {
    const keyStoreChangedListener = () => {
      webviewRef.current?.injectJavaScript(
        `
            window.dispatchEvent(new Event("owallet_keystorechange"));
            true; // note: this is required, or you'll sometimes get silent failures
          `
      );
    };

    keyRingStore.addKeyStoreChangedListener(keyStoreChangedListener);

    return () => {
      keyRingStore.removeKeyStoreChangedListener(keyStoreChangedListener);
    };
  }, [keyRingStore]);

  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const isFocused = useIsFocused();
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
      BackHandler.addEventListener('hardwareBackPress', backHandler);
    }

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backHandler);
    };
  }, [canGoBack, isFocused]);

  const navigation = useNavigation();

  useEffect(() => {
    // Android disables the gesture by default.
    // If we turn on the gesture manually without checking OS,
    // the gesture will turn on even on Android.
    // So, checking platform is required.
    if (Platform.OS === 'ios') {
      navigation.setOptions({
        gestureEnabled: !canGoBack,
      });
    }
  }, [canGoBack, navigation]);

  const sourceCode = useInjectedSourceCode();

  return (
    <PageWithView
      style={style.flatten(['padding-0', 'padding-bottom-0'])}
      disableSafeArea
    >
      <WebViewStateContext.Provider
        value={{
          webView: webviewRef.current,
          name: props.name,
          url: currentURL,
          canGoBack,
          canGoForward,
        }}
      >
        <OnScreenWebpageScreenHeader />
      </WebViewStateContext.Provider>
      {sourceCode ? (
        <WebView
          ref={webviewRef}
          injectedJavaScriptBeforeContentLoaded={sourceCode}
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
          contentInsetAdjustmentBehavior="never"
          automaticallyAdjustContentInsets={false}
          decelerationRate="normal"
          allowsBackForwardNavigationGestures={true}
          {...props}
        />
      ) : null}
    </PageWithViewInBottomTabView>
  );
});

export * from './screen-options';

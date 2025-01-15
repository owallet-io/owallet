import React, { useEffect, useState } from "react";
import { StoreProvider, useStore } from "./stores";
import SplashScreen from "react-native-splash-screen";
import { StyleProvider } from "./styles";
import { AppNavigation } from "./navigation";
import { ModalsProvider } from "./modals/base";
import { Platform, LogBox } from "react-native";
import { AppIntlProvider } from "./languages";
import { InteractionModalsProivder } from "./providers/interaction-modals-provider";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LoadingScreenProvider } from "./providers/loading-screen";
import { ConfirmModalProvider } from "./providers/confirm-modal";
// import { AppIntlProvider } from "@owallet/common/src/languages";
import { IntlProvider } from "react-intl";
import ThemeProvider from "./themes/theme-provider";
import analytics from "@react-native-firebase/analytics";
import FlashMessage from "react-native-flash-message";
import { Root as PopupRootProvider } from "react-native-popup-confirm-toast";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LottieView from "lottie-react-native";
import { metrics } from "@src/themes";
import ErrorBoundary from "react-native-error-boundary";
import { ErrorBoundaryFallback } from "./screens/error-boundary/error-boundary";
import { ApolloProvider } from "@apollo/client";
import client from "./graphql/apollo-client";
import branch, { BranchEvent, BranchEventParams } from "react-native-branch";
import { LedgerBLEProvider } from "@src/providers/ledger-ble";
import { ModalBaseProvider } from "@src/modals/v2/provider";

const queryClient = new QueryClient();
// Call `setRequestMetadata` before `subscribe`
branch.subscribe({
  onOpenStart: (params) => {
    console.log("Subscribed to branch successfully!!" + params);
  },
  onOpenComplete: (params2) => {
    console.log("Subscribed to branch successfully!!", params2);
  },
});

// we already log in debugging tools
LogBox.ignoreAllLogs();

export const App = () => {
  const [isInit, setIsInit] = useState(true);

  const enableAnalytics = async () => {
    await analytics().setAnalyticsCollectionEnabled(true);
  };
  useEffect(() => {
    SplashScreen.hide();
    enableAnalytics();
    return () => {};
  }, []);
  // if (isInit) {
  //   return (
  //     <LottieView
  //       source={require("@src/assets/animations/splashscreen.json")}
  //       style={{ width: metrics.screenWidth, height: metrics.screenHeight }}
  //       resizeMode={"cover"}
  //       autoPlay
  //       loop={false}
  //       onAnimationFinish={() => {
  //         setIsInit(false);
  //       }}
  //     />
  //   );
  // }
  return (
    <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
      <GestureHandlerRootView
        style={{
          flex: 1,
        }}
      >
        <ApolloProvider client={client}>
          <StyleProvider>
            <StoreProvider>
              <ThemeProvider>
                <AppIntlProvider>
                  <LedgerBLEProvider>
                    <SafeAreaProvider>
                      <ModalBaseProvider>
                        <ModalsProvider>
                          <PopupRootProvider>
                            <LoadingScreenProvider>
                              <ConfirmModalProvider>
                                <InteractionModalsProivder>
                                  <QueryClientProvider client={queryClient}>
                                    <AppNavigation />
                                  </QueryClientProvider>
                                </InteractionModalsProivder>
                              </ConfirmModalProvider>
                            </LoadingScreenProvider>
                          </PopupRootProvider>
                        </ModalsProvider>
                      </ModalBaseProvider>
                    </SafeAreaProvider>
                  </LedgerBLEProvider>
                </AppIntlProvider>
                <FlashMessage position="top" />
              </ThemeProvider>
            </StoreProvider>
          </StyleProvider>
        </ApolloProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

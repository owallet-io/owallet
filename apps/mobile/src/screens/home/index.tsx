import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { PageWithScrollViewInBottomTabView } from "../../components/page";
import {
  InteractionManager,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useStore } from "../../stores";
import { observer } from "mobx-react-lite";
import { useTheme } from "@src/themes/theme-provider";
import { AccountBoxAll } from "./components/account-box-new";
import { InjectedProviderUrl } from "../web/config";
import { MainTabHome } from "./components";
import { StakeCardAll } from "./components/stake-card-all";
import { NewThemeModal } from "@src/modals/theme-modal/theme";
import messaging from "@react-native-firebase/messaging";
import { OWBox } from "@components/card";
import { metrics, spacing } from "@src/themes";
import OWIcon from "@components/ow-icon/ow-icon";
import { imagesNoel } from "@assets/images/noels";
import OWText from "@components/text/ow-text";
import OWButtonIcon from "@components/button/ow-button-icon";
import { navigate, resetTo } from "@src/router/root";
import { SCREENS } from "@common/constants";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { delay } from "@utils/helper";

export const useIsNotReady = () => {
  const { chainStore, queriesStore } = useStore();
  const query = queriesStore.get(chainStore.chainInfos[0].chainId).cosmos
    .queryRPCStatus;
  return query.response == null && query.error == null;
};
export const HomeScreen: FunctionComponent = observer((props) => {
  const { colors } = useTheme();
  const styles = styling(colors);
  const {
    chainStore,
    queriesStore,
    priceStore,
    appInitStore,
    browserStore,
    allAccountStore,
    keyRingStore,
  } = useStore();

  const scrollViewRef = useRef<ScrollView | null>(null);

  const [isThemOpen, setThemeOpen] = useState(false);
  useEffect(() => {
    if (!appInitStore.getInitApp.isSelectTheme) {
      setThemeOpen(true);
    }
  }, [appInitStore.getInitApp.isSelectTheme]);

  const isNotReady = useIsNotReady();
  const onRefresh = async () => {
    if (isNotReady) {
      return;
    }
    priceStore.fetch();
    for (const chainInfo of chainStore.chainInfosInUI) {
      let account = allAccountStore.getAccount(chainInfo.chainId);
      if (account.addressDisplay === "") {
        continue;
      }
      const queries = queriesStore.get(chainInfo.chainId);
      const queryBalance = queries.queryBalances.getQueryByAddress(
        account.addressDisplay
      );
      const queryRewards = queries.cosmos.queryRewards.getQueryBech32Address(
        account.addressDisplay
      );
      queryBalance.fetch();
      queryRewards.fetch();
      const queryUnbonding =
        queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
          account.addressDisplay
        );
      const queryDelegation =
        queries.cosmos.queryDelegations.getQueryBech32Address(
          account.addressDisplay
        );
      queryUnbonding.fetch();
      queryDelegation.fetch();
    }
  };
  const [refreshing, _] = useState(false);
  useEffect(() => {
    (async () => {
      const allExist = chainStore.chainInfos.every((item) =>
        chainStore.enabledChainIdentifiers.includes(item.chainIdentifier)
      );
      if (!allExist) {
        const chainsEnable = chainStore.chainInfos.map(
          (chainInfo, index) => chainInfo.chainIdentifier
        );
        await chainStore.enableChainInfoInUIWithVaultId(
          keyRingStore.selectedKeyInfo.id,
          ...chainsEnable
        );
      }
    })();
  }, [chainStore.enabledChainIdentifiers, keyRingStore.selectedKeyInfo.id]);
  // const getFCMToken = async () => {
  //   try {
  //     // Request permission for notifications (iOS)
  //     const authStatus = await messaging().requestPermission();
  //     const enabled =
  //       authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //       authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  //
  //     if (enabled) {
  //       console.log("Authorization status:", authStatus);
  //
  //       // Get the FCM token
  //       const fcmToken = await messaging().getToken();
  //       if (fcmToken) {
  //         console.log("FCM Token:", fcmToken);
  //         return fcmToken;
  //       } else {
  //         console.log("Failed to get FCM token");
  //       }
  //     } else {
  //       console.log("Notification permission not granted");
  //     }
  //   } catch (error) {
  //     console.error("Error getting FCM token:", error);
  //   }
  // };
  // useEffect(() => {
  //   // Get and handle the FCM token on app start
  //   const fetchToken = async () => {
  //     const token = await getFCMToken();
  //     console.log("Device FCM Token:", token);
  //
  //     // Send token to your backend server if necessary
  //   };
  //   fetchToken();
  // }, []);
  const { inject } = browserStore;
  const navigation = useNavigation();
  useEffect(() => {
    if (!inject) return;
    const unsubscribeOnNotificationOpenedApp =
      messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log("Notification opened from background:", remoteMessage);
        // Handle navigation or other actions here
        if (remoteMessage.data?.url) {
          navigation.navigate(SCREENS.STACK.MainTab, {
            screen: SCREENS.TABS.Browser,
            params: {
              screen: SCREENS.DetailsBrowser,
              params: {
                url: remoteMessage.data?.url,
              },
            },
          });
          return;
        }
      });
    // Handle notifications when app was closed
    const checkInitialNotification = async () => {
      const remoteMessage = await messaging().getInitialNotification();
      if (remoteMessage) {
        console.log("Notification opened from closed state:", remoteMessage);
        // Handle navigation or other actions here
        if (remoteMessage.data?.url) {
          navigation.navigate(SCREENS.STACK.MainTab, {
            screen: SCREENS.TABS.Browser,
            params: {
              screen: SCREENS.DetailsBrowser,
              params: {
                url: remoteMessage.data?.url,
              },
            },
          });
          return;
        }
      }
    };

    checkInitialNotification();
    // Cleanup listeners

    // (async ()=>{
    //     resetTo(SCREENS.TABS.Browser, {
    //         url: urlData,
    //     });
    //     await delay(100);
    //     navigate(SCREENS.DetailsBrowser, {
    //         url: urlData,
    //     });
    // })()
    return () => {
      // unsubscribeOnMessage();
      unsubscribeOnNotificationOpenedApp();
    };
  }, [inject]);
  return (
    <PageWithScrollViewInBottomTabView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.containerStyle}
      ref={scrollViewRef}
    >
      <NewThemeModal
        isOpen={isThemOpen}
        close={() => {
          setThemeOpen(false);
          appInitStore.updateSelectTheme();
        }}
        colors={colors}
      />
      <AccountBoxAll isLoading={false} />

      {appInitStore.getInitApp.isAllNetworks ? <StakeCardAll /> : null}
      {!appInitStore.getInitApp.hideTipNoel ? (
        <View>
          <OWBox
            style={{
              marginHorizontal: 16,
              marginTop: 8,
              width: metrics.screenWidth - 32,
              paddingHorizontal: 16,
              backgroundColor: colors["neutral-surface-card"],
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
            }}
          >
            <View>
              <OWIcon
                type={"images"}
                source={imagesNoel.img_owallet}
                size={32}
                resizeMode={"contain"}
              />
            </View>
            <View
              style={{
                maxWidth: metrics.screenWidth - 110,
              }}
            >
              <OWText weight={"600"}>’Tis the Season of ...Gaining! ✨</OWText>
              <OWText weight={"400"} size={12}>
                🎁 Deck your wallet and wrap up the year in style with OWallet!
                🎄🎉
              </OWText>
            </View>
            <View
              style={{
                position: "absolute",
                top: 16,
                right: 8,
              }}
            >
              <OWButtonIcon
                colorIcon={colors["neutral-icon-on-light"]}
                onPress={() => {
                  appInitStore.updateHideTipNoel();
                }}
                name="tdesignclose"
                fullWidth={false}
                sizeIcon={20}
              />
            </View>
          </OWBox>
        </View>
      ) : null}
      <MainTabHome />
    </PageWithScrollViewInBottomTabView>
  );
});

const styling = (colors) =>
  StyleSheet.create({
    containerStyle: {
      paddingBottom: 4,
      backgroundColor: colors["neutral-surface-bg"],
    },
    containerEarnStyle: {
      backgroundColor: colors["neutral-surface-bg2"],
    },
  });

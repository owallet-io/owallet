import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useTheme } from "@src/themes/theme-provider";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Clipboard,
} from "react-native";
import OWText from "@src/components/text/ow-text";
import { useSmartNavigation } from "@src/navigation.provider";
import { useStore } from "@src/stores";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { OWButton } from "@src/components/button";
import { metrics, spacing } from "@src/themes";
import { ScrollView } from "react-native-gesture-handler";
import { CheckIcon, CopyFillIcon, DownArrowIcon } from "@src/components/icon";
import { API } from "@src/common/api";
import { HISTORY_STATUS, openLink } from "@src/utils/helper";
import { Bech32Address } from "@owallet/cosmos";
import { getTransactionUrl } from "../universal-swap/helpers";
import { useSimpleTimer } from "@src/hooks";
import { PageHeader } from "@src/components/header/header-new";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";
import { OWBox } from "@src/components/card";
import { DashboardCard } from "./dashboard";

export const TokenDetails: FunctionComponent = observer((props) => {
  const { chainStore, accountStore } = useStore();
  const { isTimedOut, setTimer } = useSimpleTimer();
  const { colors } = useTheme();
  const styles = useStyles(colors);
  const safeAreaInsets = useSafeAreaInsets();
  const account = accountStore.getAccount(chainStore.current.chainId);

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          item: any;
        }
      >,
      string
    >
  >();

  const { item } = route.params;

  //   const onPressToken = async item => {

  //     chainStore.selectChain(item?.chainId);
  //     await chainStore.saveLastViewChainId();
  //     if (!account.isNanoLedger) {
  //       if (chainStore.current.networkType === "bitcoin") {
  //         navigate(SCREENS.STACK.Others, {
  //           screen: SCREENS.SendBtc
  //         });
  //         return;
  //       }
  //       if (chainStore.current.networkType === "evm") {
  //         if (item.chainId === ChainIdEnum.TRON) {
  //           const itemTron = tronTokens?.find(t => {
  //             return t.coinGeckoId === item.coinGeckoId;
  //           });

  //           smartNavigation.navigateSmart("SendTron", { item: itemTron });
  //           return;
  //         }
  //         if (item.chainId === ChainIdEnum.Oasis) {
  //           smartNavigation.navigateSmart("SendOasis", {
  //             currency: chainStore.current.stakeCurrency.coinMinimalDenom
  //           });
  //           return;
  //         }
  //         navigate(SCREENS.STACK.Others, {
  //           screen: SCREENS.SendEvm,
  //           params: {
  //             currency: item.denom,
  //             contractAddress: item.contractAddress,
  //             coinGeckoId: item.coinGeckoId
  //           }
  //         });
  //         return;
  //       }

  //       smartNavigation.navigateSmart("NewSend", {
  //         currency: item.denom,
  //         contractAddress: item.contractAddress,
  //         coinGeckoId: item.coinGeckoId
  //       });
  //     }
  //   };

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      <PageHeader title={item.asset} subtitle={item.chain} colors={colors} />
      <ScrollView
        contentContainerStyle={{ width: "100%" }}
        style={{}}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.containerOWBox}>
          <View style={styles.containerInfoAccount}>
            <View style={styles.btnAcc}>
              <Image
                style={styles.infoIcon}
                source={require("../../assets/images/default-avatar.png")}
                resizeMode="contain"
                fadeDuration={0}
              />
              <OWText style={styles.labelName}>{account?.name || ".."}</OWText>
            </View>
            <OWButton
              type="secondary"
              textStyle={{
                fontSize: 14,
                fontWeight: "600",
                color: colors["neutral-text-action-on-light-bg"],
              }}
              icon={
                <OWIcon
                  size={14}
                  name="copy"
                  color={colors["neutral-text-action-on-light-bg"]}
                />
              }
              style={styles.copy}
              label="Copy address"
              onPress={() => {}}
            />
          </View>
          <View style={styles.overview}>
            <OWText variant="bigText" style={styles.labelTotalAmount}>
              {item.balance} {item.asset}
            </OWText>
            <OWText style={styles.profit} color={colors["success-text-body"]}>
              ${item.value}
            </OWText>
          </View>
          <View style={styles.btnGroup}>
            <OWButton
              style={styles.getStarted}
              textStyle={{
                fontSize: 14,
                fontWeight: "600",
                color: colors["neutral-text-action-on-dark-bg"],
              }}
              label="Receive"
              onPress={() => {
                navigate(SCREENS.STACK.Others, {
                  screen: SCREENS.QRScreen,
                });
                return;
              }}
            />
            <OWButton
              textStyle={{
                fontSize: 14,
                fontWeight: "600",
                color: colors["neutral-text-action-on-dark-bg"],
              }}
              style={styles.getStarted}
              label={"Send"}
              onPress={() => {}}
            />
          </View>
        </View>
        <DashboardCard
          label={`${item.asset}`}
          canView={false}
          coinGeckoId={item.coinGeckoId}
        />
      </ScrollView>
    </View>
  );
});

const useStyles = (colors) => {
  return StyleSheet.create({
    containerOWBox: {
      marginHorizontal: 16,
      width: metrics.screenWidth - 32,
      padding: spacing["16"],
      backgroundColor: colors["neutral-surface-card"],
      borderRadius: 24,
    },
    overview: {
      marginTop: 12,
      marginBottom: 16,
    },
    labelTotalAmount: {
      color: colors["neutral-text-heading"],
      fontWeight: "500",
    },
    profit: {
      fontWeight: "400",
      lineHeight: 20,
    },
    labelName: {
      paddingLeft: spacing["6"],
      paddingRight: 10,
      fontWeight: "600",
      fontSize: 16,
      color: colors["neutral-text-title"],
    },
    infoIcon: {
      width: spacing["26"],
      borderRadius: spacing["26"],
      height: spacing["26"],
    },
    btnAcc: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      paddingBottom: spacing["2"],
    },
    containerInfoAccount: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    getStarted: {
      borderRadius: 999,
      width: metrics.screenWidth / 2.45,
      height: 32,
    },
    copy: {
      borderRadius: 999,
      width: metrics.screenWidth / 3,
      height: 32,
    },
    btnGroup: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    containerLoading: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      top: 30,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    container: {},
  });
};

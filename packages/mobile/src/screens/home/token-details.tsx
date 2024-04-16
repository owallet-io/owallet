import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useTheme } from "@src/themes/theme-provider";
import {
  StyleSheet,
  View,
  Image,
  InteractionManager,
  Clipboard,
} from "react-native";
import OWText from "@src/components/text/ow-text";
import { useStore } from "@src/stores";
import { OWButton } from "@src/components/button";
import { metrics, spacing } from "@src/themes";
import { ScrollView } from "react-native-gesture-handler";
import { API } from "@src/common/api";
import { useSimpleTimer } from "@src/hooks";
import { PageHeader } from "@src/components/header/header-new";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";
import { DashboardCard } from "./dashboard";
import { ChainIdEnum, getBase58Address, TRC20_LIST } from "@owallet/common";
import { shortenAddress } from "@src/utils/helper";
import { CheckIcon, CopyFillIcon } from "@src/components/icon";
import { LineGraph } from "react-native-graph";
import { OWBox } from "@src/components/card";
import { TokenChart } from "@src/screens/home/components/token-chart";

export const TokenDetails: FunctionComponent = observer((props) => {
  const { chainStore, accountStore, keyRingStore } = useStore();
  const { isTimedOut, setTimer } = useSimpleTimer();
  const { colors } = useTheme();
  const styles = useStyles(colors);
  const safeAreaInsets = useSafeAreaInsets();

  const accountTron = accountStore.getAccount(ChainIdEnum.TRON);
  const accountEth = accountStore.getAccount(ChainIdEnum.Ethereum);

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

  const account = accountStore.getAccount(item.chainId);

  const [tronTokens, setTronTokens] = useState([]);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      (async function get() {
        try {
          if (accountTron.evmosHexAddress) {
            const res = await API.getTronAccountInfo(
              {
                address: getBase58Address(accountTron.evmosHexAddress),
              },
              {
                baseURL: chainStore.current.rpc,
              }
            );

            if (res.data?.data.length > 0) {
              if (res.data?.data[0].trc20) {
                const tokenArr = [];
                TRC20_LIST.map((tk) => {
                  let token = res.data?.data[0].trc20.find(
                    (t) => tk.contractAddress in t
                  );
                  if (token) {
                    tokenArr.push({ ...tk, amount: token[tk.contractAddress] });
                  }
                });

                setTronTokens(tokenArr);
              }
            }
          }
        } catch (error) {}
      })();
    });
  }, [accountTron.evmosHexAddress]);

  const address = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
  );
  const onPressToken = async () => {
    chainStore.selectChain(item?.chainId);
    await chainStore.saveLastViewChainId();

    if (chainStore.current.networkType === "bitcoin") {
      navigate(SCREENS.STACK.Others, {
        screen: SCREENS.SendBtc,
      });
      return;
    }
    if (chainStore.current.networkType === "evm") {
      if (item.chainId === ChainIdEnum.TRON) {
        const itemTron = tronTokens?.find((t) => {
          return t.coinGeckoId === item.coinGeckoId;
        });

        navigate(SCREENS.STACK.Others, {
          screen: SCREENS.SendTron,
          params: {
            item: itemTron,
            currency: item.denom,
            contractAddress: item.contractAddress,
          },
        });

        return;
      }
      if (item.chainId === ChainIdEnum.Oasis) {
        navigate(SCREENS.STACK.Others, {
          screen: SCREENS.SendOasis,
          params: {
            currency: chainStore.current.stakeCurrency.coinMinimalDenom,
          },
        });
        return;
      }
      navigate(SCREENS.STACK.Others, {
        screen: SCREENS.SendEvm,
        params: {
          currency: item.denom,
          contractAddress: item.contractAddress,
          coinGeckoId: item.coinGeckoId,
        },
      });
      return;
    }

    try {
      navigate(SCREENS.STACK.Others, {
        screen: SCREENS.NewSend,
        params: {
          currency: item.denom,
          contractAddress: item.contractAddress,
          coinGeckoId: item.coinGeckoId,
        },
      });
    } catch (err) {}
  };

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      <PageHeader title={item.asset} subtitle={item.chain} colors={colors} />
      <ScrollView
        contentContainerStyle={{ width: "100%" }}
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
              <OWText style={styles.labelName}>{account?.name || "..."}</OWText>
            </View>
            <OWButton
              type="secondary"
              textStyle={{
                fontSize: 14,
                fontWeight: "600",
                color: colors["neutral-text-action-on-light-bg"],
              }}
              icon={
                isTimedOut ? (
                  <CheckIcon />
                ) : (
                  <CopyFillIcon color={colors["sub-text"]} />
                )
              }
              style={styles.copy}
              label={shortenAddress(address)}
              onPress={() => {
                Clipboard.setString(address);
                setTimer(2000);
              }}
            />
          </View>
          <View style={styles.overview}>
            <OWText variant="bigText" style={styles.labelTotalAmount}>
              {Number(item.balance.toFixed(4)).toLocaleString()} {item.asset}
            </OWText>
            <OWText style={styles.profit} color={colors["success-text-body"]}>
              ${Number(item.value.toFixed(4)).toLocaleString()}
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
              onPress={onPressToken}
            />
          </View>
        </View>
        <TokenChart coinGeckoId={item.coinGeckoId} />
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
      width: metrics.screenWidth / 2.5,
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

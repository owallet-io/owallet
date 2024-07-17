import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { spacing } from "../../themes";
import { _keyExtract } from "../../utils/helper";
import { navigate } from "../../router/root";
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
import { metrics } from "@src/themes";
import { API } from "@src/common/api";
import { useSimpleTimer } from "@src/hooks";
import { PageHeader } from "@src/components/header/header-new";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SCREENS } from "@src/common/constants";
import {
  ChainIdEnum,
  DenomHelper,
  getBase58Address,
  TRC20_LIST,
} from "@owallet/common";
import {
  maskedNumber,
  removeDataInParentheses,
  shortenAddress,
} from "@src/utils/helper";
import { CheckIcon, CopyFillIcon } from "@src/components/icon";
import { TokenChart } from "@src/screens/home/components/token-chart";
import { ViewRawToken } from "@src/stores/huge-queries";
import { CoinPretty, PricePretty } from "@owallet/unit";
import { HistoryByToken } from "@src/screens/transactions/history-by-token";
import { PageWithScrollView } from "@src/components/page";
import ByteBrew from "react-native-bytebrew-sdk";
import { RouteProp, useRoute } from "@react-navigation/native";

export const TokenDetailsScreen: FunctionComponent = observer((props) => {
  const { chainStore, priceStore, accountStore, keyRingStore } = useStore();
  const { isTimedOut, setTimer } = useSimpleTimer();
  const { colors } = useTheme();
  const styles = useStyles(colors);
  const safeAreaInsets = useSafeAreaInsets();

  const accountTron = accountStore.getAccount(ChainIdEnum.TRON);

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          item: ViewRawToken;
        }
      >,
      string
    >
  >();

  const { item } = route.params;

  const account = accountStore.getAccount(item.chainInfo.chainId);

  const [tronTokens, setTronTokens] = useState([]);

  useEffect(() => {
    ByteBrew.NewCustomEvent("Token Detail Screen");
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

            if (res.data?.data?.length > 0) {
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
    chainStore.selectChain(item.chainInfo.chainId);
    await chainStore.saveLastViewChainId();

    if (chainStore.current.networkType === "bitcoin") {
      navigate(SCREENS.STACK.Others, {
        screen: SCREENS.SendBtc,
      });
      return;
    }
    if (chainStore.current.networkType === "evm") {
      if (item.chainInfo.chainId === ChainIdEnum.TRON) {
        const itemTron = tronTokens?.find((t) => {
          return t.coinGeckoId === item.token.currency.coinGeckoId;
        });

        navigate(SCREENS.STACK.Others, {
          screen: SCREENS.SendTron,
          params: {
            item: itemTron,
            currency: item.token.currency.coinDenom,
            contractAddress: new DenomHelper(
              item.token.currency.coinMinimalDenom
            ).contractAddress,
          },
        });

        return;
      }
      if (item.chainInfo.chainId === ChainIdEnum.Oasis) {
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
          currency: item.token.currency.coinDenom,
          contractAddress: new DenomHelper(item.token.currency.coinMinimalDenom)
            .contractAddress,
          coinGeckoId: item.token.currency.coinGeckoId,
        },
      });
      return;
    }

    try {
      navigate(SCREENS.STACK.Others, {
        screen: SCREENS.NewSend,
        params: {
          currency: item.token.currency.coinDenom,
          contractAddress: new DenomHelper(item.token.currency.coinMinimalDenom)
            .contractAddress,
          coinGeckoId: item.token.currency.coinGeckoId,
        },
      });
    } catch (err) {}
  };
  const fiatCurrency = priceStore.getFiatCurrency(priceStore.defaultVsCurrency);
  const denomHelper = new DenomHelper(item.token.currency.coinMinimalDenom);
  return (
    <>
      <View
        style={{
          zIndex: 1000,
          paddingTop: useSafeAreaInsets().top,
          backgroundColor: colors["neutral-surface-bg"],
        }}
      >
        <PageHeader
          title={removeDataInParentheses(item.token.currency.coinDenom)}
          subtitle={
            item.chainInfo.chainName + `${item?.type ? ` (${item?.type})` : ""}`
          }
        />
      </View>

      <PageWithScrollView style={{}} showsVerticalScrollIndicator={false}>
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
              label={
                item?.type
                  ? item?.type?.includes("Legacy")
                    ? shortenAddress(account.legacyAddress)
                    : shortenAddress(address)
                  : shortenAddress(address)
              }
              onPress={() => {
                Clipboard.setString(address);
                setTimer(2000);
              }}
            />
          </View>
          <View style={styles.overview}>
            <OWText variant="bigText" style={styles.labelTotalAmount}>
              {maskedNumber(
                new CoinPretty(item.token.currency, item.token.amount)
                  .hideDenom(true)
                  .trim(true)
                  .toString()
              )}{" "}
              {removeDataInParentheses(item.token.currency.coinDenom)}
            </OWText>
            <OWText style={styles.profit} color={colors["neutral-text-body"]}>
              {new PricePretty(fiatCurrency, item.price)?.toString()}
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
                  params: {
                    chainId: item.chainInfo.chainId,
                  },
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
        <TokenChart coinGeckoId={item.token.currency.coinGeckoId} />
        <View
          style={{
            backgroundColor: colors["neutral-surface-card"],
            width: metrics.screenWidth,
            paddingHorizontal: 16,
            borderTopRightRadius: 24,
            borderTopLeftRadius: 24,
            marginTop: 16,
            paddingBottom: 32,
          }}
        >
          <View
            style={{
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors["neutral-border-default"],
            }}
          >
            <OWText
              color={colors["neutral-text-body"]}
              size={16}
              weight={"500"}
            >
              History
            </OWText>
          </View>
          <HistoryByToken
            tokenAddr={denomHelper.contractAddress || denomHelper.denom}
            chainId={item.chainInfo.chainId}
          />
        </View>
      </PageWithScrollView>
    </>
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

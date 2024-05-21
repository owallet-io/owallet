import { OWButton } from "@src/components/button";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
// @ts-ignore
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
  useTransition,
} from "react";
import {
  InteractionManager,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { OWBox } from "../../components/card";
import { useStore } from "../../stores";
import {
  getTokenInfos,
  getTokensFromNetwork,
  maskedNumber,
  _keyExtract,
} from "../../utils/helper";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { Text } from "@src/components/text";
import { SCREENS } from "@src/common/constants";
import { navigate } from "@src/router/root";
import { ChainIdEnum } from "@owallet/common";
import { API } from "@src/common/api";
import {
  chainIcons,
  oraichainNetwork,
  TokenItemType,
} from "@oraichain/oraidex-common";
import { metrics } from "@src/themes";
import FastImage from "react-native-fast-image";
import OWText from "@src/components/text/ow-text";
import { HistoryCard } from "@src/screens/transactions";
import { DownArrowIcon } from "@src/components/icon";
import { flatten } from "lodash";

export const TokensCardAll: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { accountStore, universalSwapStore, chainStore, appInitStore } =
    useStore();
  const { colors } = useTheme();
  const theme = appInitStore.getInitApp.theme;

  const [more, setMore] = useState(true);
  const [activeTab, setActiveTab] = useState("tokens");
  const [yesterdayAssets, setYesterdayAssets] = useState([]);
  // const [queryBalances, setQueryBalances] = useState({});
  const [isPending, startTransition] = useTransition();

  // const account = accountStore.getAccount(chainStore.current.chainId);
  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);

  // useEffect(() => {
  //   InteractionManager.runAfterInteractions(() => {
  //     const queries = queriesStore.get(chainStore.current.chainId);
  //     const address = account.getAddressDisplay(
  //       keyRingStore.keyRingLedgerAddresses
  //     );
  //     const balances = queries.queryBalances.getQueryBech32Address(address);
  //     setQueryBalances(balances);
  //   });
  // }, [chainStore.current.chainId]);

  const getYesterdayAssets = async () => {
    appInitStore.updateYesterdayPriceFeed({});
    setYesterdayAssets([]);
    const res = await API.getYesterdayAssets(
      {
        address: accountOrai.bech32Address,
        time: "YESTERDAY",
      },
      {
        baseURL: "https://staging.owallet.dev/",
      }
    );

    if (res && res.status === 200) {
      const dataKeys = Object.keys(res.data);
      const yesterday = dataKeys.find((k) => {
        // const isToday = moment(Number(k)).isSame(moment(), "day");
        // return !isToday;
        return true;
      });

      if (yesterday) {
        const yesterdayData = res.data[yesterday];
        setYesterdayAssets(yesterdayData);
        appInitStore.updateYesterdayPriceFeed(yesterdayData);
      } else {
        setYesterdayAssets([]);
        appInitStore.updateYesterdayPriceFeed([]);
      }
    }
  };

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      getYesterdayAssets();
    });
  }, [accountOrai.bech32Address]);

  const handleSaveTokenInfos = async (tokenInfos) => {
    await API.saveTokenInfos(
      {
        address: accountOrai.bech32Address,
        tokesInfos: tokenInfos,
      },
      {
        baseURL: "https://staging.owallet.dev/",
      }
    );
  };

  const otherChainTokens = flatten(
    appInitStore.getChainInfos
      .filter((chainInfo) => chainInfo.chainId !== "Oraichain")
      .map(getTokensFromNetwork)
  );
  const oraichainTokens: TokenItemType[] =
    getTokensFromNetwork(oraichainNetwork);

  const allTokens = [otherChainTokens, oraichainTokens];
  const flattenTokens = flatten(allTokens);

  let tokens = getTokenInfos(
    {
      tokens: universalSwapStore.getAmount,
      prices: appInitStore.getInitApp.prices,
      networkFilter: "",
    },
    flattenTokens
  );
  console.log("tolens", tokens);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      if (universalSwapStore.getLoadStatus.isLoad) {
        handleSaveTokenInfos(tokens);
      }
    });
  }, [
    accountOrai.bech32Address,
    tokens,
    universalSwapStore.getLoadStatus.isLoad,
  ]);

  const styles = styling(colors);

  const onPressToken = async (item) => {
    navigate(SCREENS.TokenDetails, {
      item,
    });
    return;
  };

  // const renderTokensFromQueryBalances = () => {
  //   //@ts-ignore
  //   const tokens = queryBalances?.positiveBalances;
  //   if (tokens?.length > 0) {
  //     return tokens.map((token, index) => {
  //       const priceBalance = priceStore.calculatePrice(token.balance);
  //       return (
  //         <TokenItem
  //           key={index?.toString()}
  //           chainInfo={{
  //             stakeCurrency: chainStore.current.stakeCurrency,
  //             networkType: chainStore.current.networkType,
  //             chainId: chainStore.current.chainId
  //           }}
  //           balance={token.balance}
  //           priceBalance={priceBalance}
  //         />
  //       );
  //     });
  //   } else {
  //     return <OWEmpty />;
  //   }
  // };

  const renderTokenItem = useCallback(
    ({ item, index }) => {
      if (more && index > 3) return null;

      if (item) {
        console.log("item", item);

        let profit = 0;
        let percent = "0";

        if (yesterdayAssets && yesterdayAssets.length > 0) {
          const yesterday = yesterdayAssets.find(
            (obj) => obj["denom"] === item.denom
          );
          if (yesterday && yesterday.value) {
            profit = Number(
              Number(item.value - (yesterday.value ?? 0))?.toFixed(2) ?? 0
            );
            percent = Number((profit / yesterday.value) * 100 ?? 0).toFixed(2);
          }
        }

        let chainIcon = chainIcons.find((c) => c.chainId === item.chainId);
        let tokenIcon = item.icon;

        // Hardcode for Neutaro because oraidex-common does not have icon yet
        if (item.chain?.toLowerCase().includes("neutaro")) {
          chainIcon = {
            chainId: item.chainId,
            Icon: "https://assets.coingecko.com/coins/images/36277/large/Neutaro_logo.jpg?1711371142",
          };
        }
        if (item.asset?.toLowerCase().includes("ntmpi")) {
          tokenIcon =
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPW-5R-30JcMNKXbm6vSsi5e_YfRYgQxqIuUCpTbkzpQ&s";
        }
        return (
          <TouchableOpacity
            onPress={() => {
              onPressToken(item);
            }}
            style={styles.btnItem}
          >
            <View style={[styles.wraperItem]}>
              <View style={styles.leftBoxItem}>
                <View style={styles.iconWrap}>
                  <OWIcon
                    style={{ borderRadius: 999 }}
                    type="images"
                    source={{ uri: tokenIcon }}
                    size={32}
                  />
                </View>
                <View style={styles.chainWrap}>
                  <OWIcon
                    type="images"
                    source={{ uri: chainIcon?.Icon }}
                    size={16}
                  />
                </View>

                <View style={styles.pl12}>
                  <Text
                    size={16}
                    color={colors["neutral-text-heading"]}
                    weight="600"
                  >
                    {item.asset}
                  </Text>
                  <Text weight="400" color={colors["neutral-text-body"]}>
                    {item.chain}
                  </Text>
                </View>
              </View>
              <View style={styles.rightBoxItem}>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text
                      size={16}
                      style={{ lineHeight: 24 }}
                      weight="500"
                      color={colors["neutral-text-heading"]}
                    >
                      {maskedNumber(item.balance)} {item.asset}
                    </Text>
                    <Text
                      size={14}
                      style={{ lineHeight: 24 }}
                      color={colors["neutral-text-body"]}
                    >
                      ${maskedNumber(item.value)}
                    </Text>
                    <Text
                      size={14}
                      style={styles.profit}
                      color={
                        colors[
                          profit < 0 ? "error-text-body" : "success-text-body"
                        ]
                      }
                    >
                      {profit < 0 ? "" : "+"}
                      {percent}% (${profit ?? 0})
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      }
    },
    [universalSwapStore?.getAmount, theme, more]
  );

  const renderContent = () => {
    if (activeTab === "tokens") {
      return (
        <>
          {tokens.length > 0
            ? tokens
                .filter((t) => {
                  if (appInitStore.getInitApp.isAllNetworks) {
                    return true;
                  }
                  return t.chainId === chainStore.current.chainId;
                })
                .map((token, index) => {
                  if (more) {
                    if (index < 3)
                      return renderTokenItem({ item: token, index });
                  } else {
                    return renderTokenItem({ item: token, index });
                  }
                })
            : null}
          {/* Section for empty token  */}
          {tokens.filter((t) => {
            if (appInitStore.getInitApp.isAllNetworks) {
              return true;
            }
            return t.chainId === chainStore.current.chainId;
          }).length <= 0 ? (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginVertical: 42,
              }}
            >
              <FastImage
                source={require("../../assets/images/img_money.png")}
                style={{
                  width: 150,
                  height: 150,
                }}
                resizeMode={"contain"}
              />
              <OWText
                color={colors["neutral-text-title"]}
                size={16}
                weight="700"
              >
                {"no tokens yet".toUpperCase()}
              </OWText>
              <OWButton
                style={{
                  marginTop: 8,
                  marginHorizontal: 16,
                  width: metrics.screenWidth / 2,
                  borderRadius: 999,
                }}
                label={"+ Buy ORAI with cash"}
                size="large"
                type="secondary"
                onPress={() => {
                  navigate(SCREENS.STACK.Others, {
                    screen: SCREENS.BuyFiat,
                  });
                }}
              />
            </View>
          ) : null}
          {tokens?.filter((t) => {
            if (appInitStore.getInitApp.isAllNetworks) {
              return true;
            }
            return t.chainId === chainStore.current.chainId;
          }).length > 3 ? (
            <TouchableOpacity
              onPress={() => {
                setMore(!more);
              }}
              style={{
                alignItems: "center",
                paddingTop: 30,
                flexDirection: "row",
                width: metrics.screenWidth,
                justifyContent: "center",
              }}
            >
              <OWText
                style={{ paddingRight: 4 }}
                weight="600"
                color={colors["primary-text-action"]}
              >
                {more ? "View all tokens" : "Hide"}
              </OWText>
              {more ? (
                <DownArrowIcon
                  height={10}
                  color={colors["primary-text-action"]}
                />
              ) : (
                <OWIcon
                  name="tdesignchevron-up"
                  color={colors["primary-text-action"]}
                  size={16}
                />
              )}
            </TouchableOpacity>
          ) : null}
          <OWButton
            style={{
              marginTop: Platform.OS === "android" ? 28 : 22,
              marginHorizontal: 16,
              width: metrics.screenWidth - 32,
              borderRadius: 999,
            }}
            icon={
              <OWIcon
                name="tdesignplus"
                color={colors["neutral-text-title"]}
                size={20}
              />
            }
            label={"Add token"}
            size="large"
            type="secondary"
            onPress={() => {
              navigate(SCREENS.STACK.Others, {
                screen: SCREENS.NetworkToken,
              });
              return;
            }}
          />
        </>
      );
    } else {
      return (
        <>
          <HistoryCard />
        </>
      );
    }
  };

  return (
    <View style={styles.container}>
      <OWBox
        style={{
          paddingTop: 12,
          backgroundColor: colors["neutral-surface-card"],
          paddingHorizontal: 0,
        }}
      >
        <View style={styles.wrapHeaderTitle}>
          <OWButton
            type="link"
            label={"Tokens"}
            textStyle={{
              color:
                activeTab === "tokens"
                  ? colors["primary-surface-default"]
                  : colors["neutral-text-body"],
              fontWeight: "600",
              fontSize: 16,
            }}
            onPress={() => {
              startTransition(() => {
                setActiveTab("tokens");
              });
            }}
            style={[
              {
                width: "50%",
              },
              activeTab === "tokens" ? styles.active : styles.inactive,
            ]}
          />
          <OWButton
            type="link"
            label={"History"}
            onPress={() => {
              startTransition(() => {
                setActiveTab("history");
              });
            }}
            textStyle={{
              color:
                activeTab === "history"
                  ? colors["primary-surface-default"]
                  : colors["neutral-text-body"],
              fontWeight: "600",
              fontSize: 16,
            }}
            style={[
              {
                width: "50%",
              },
              activeTab === "history" ? styles.active : styles.inactive,
            ]}
          />
        </View>

        {renderContent()}
      </OWBox>
    </View>
  );
});

const styling = (colors) =>
  StyleSheet.create({
    wrapHeaderTitle: {
      flexDirection: "row",
      paddingBottom: 12,
    },
    container: {
      marginBottom: 60,
    },
    pl12: {
      paddingLeft: 12,
    },
    leftBoxItem: {
      flexDirection: "row",
    },
    rightBoxItem: {
      alignItems: "flex-end",
    },
    wraperItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 8,
      marginHorizontal: 16,
    },
    btnItem: {
      borderBottomColor: colors["neutral-border-default"],
      borderBottomWidth: 1,
    },
    profit: {
      fontWeight: "400",
      lineHeight: 20,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      backgroundColor: colors["neutral-icon-on-dark"],
    },
    chainWrap: {
      width: 22,
      height: 22,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors["neutral-icon-on-dark"],
      position: "absolute",
      bottom: -6,
      left: 26,
      top: 26,
      borderWidth: 1,
      borderColor: colors["neutral-border-bold"],
    },
    active: {
      borderBottomColor: colors["primary-surface-default"],
      borderBottomWidth: 2,
    },
    inactive: {
      borderBottomColor: colors["neutral-border-default"],
      borderBottomWidth: 1,
    },
  });

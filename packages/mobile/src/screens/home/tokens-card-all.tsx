import { OWButton } from "@src/components/button";
import { OWEmpty } from "@src/components/empty";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  InteractionManager,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { CardBody, OWBox } from "../../components/card";
import { useStore } from "../../stores";
import { getTokenInfos, _keyExtract } from "../../utils/helper";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { Text } from "@src/components/text";
import { useSmartNavigation } from "@src/navigation.provider";
import { SCREENS } from "@src/common/constants";
import { navigate } from "@src/router/root";
import { RightArrowIcon } from "@src/components/icon";
import { ChainIdEnum, getBase58Address, TRC20_LIST } from "@owallet/common";
import { API } from "@src/common/api";
import { chainIcons } from "@oraichain/oraidex-common";
import { TokenItem } from "../tokens/components/token-item";
import { HistoryCard } from "./history-card";
import OWFlatList from "@src/components/page/ow-flat-list";
import { metrics } from "@src/themes";

export const TokensCardAll: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const {
    accountStore,
    universalSwapStore,
    chainStore,
    appInitStore,
    queriesStore,
    keyRingStore,
    priceStore,
  } = useStore();
  const { colors } = useTheme();
  const theme = appInitStore.getInitApp.theme;

  const [more, setMore] = useState(true);
  const [activeTab, setActiveTab] = useState("tokens");
  const [yesterdayAssets, setYesterdayAssets] = useState([]);
  const [queryBalances, setQueryBalances] = useState({});

  const account = accountStore.getAccount(chainStore.current.chainId);
  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
  const accountTron = accountStore.getAccount(ChainIdEnum.TRON);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      const queries = queriesStore.get(chainStore.current.chainId);
      const address = account.getAddressDisplay(
        keyRingStore.keyRingLedgerAddresses
      );
      const balances = queries.queryBalances.getQueryBech32Address(address);
      setQueryBalances(balances);
    });
  }, [chainStore.current.chainId]);

  const [tronTokens, setTronTokens] = useState([]);

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

  const tokens = getTokenInfos({
    tokens: universalSwapStore.getAmount,
    prices: appInitStore.getInitApp.prices,
    networkFilter: "",
  });

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

  const styles = styling(colors);

  const smartNavigation = useSmartNavigation();

  const onPressToken = async (item) => {
    navigate(SCREENS.TokenDetails, {
      item,
    });
    return;

    chainStore.selectChain(item?.chainId);
    await chainStore.saveLastViewChainId();
    if (!account.isNanoLedger) {
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

          smartNavigation.navigateSmart("SendTron", { item: itemTron });
          return;
        }
        if (item.chainId === ChainIdEnum.Oasis) {
          smartNavigation.navigateSmart("SendOasis", {
            currency: chainStore.current.stakeCurrency.coinMinimalDenom,
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

      smartNavigation.navigateSmart("NewSend", {
        currency: item.denom,
        contractAddress: item.contractAddress,
        coinGeckoId: item.coinGeckoId,
      });
    }
  };

  const renderTokensFromQueryBalances = () => {
    //@ts-ignore
    const tokens = queryBalances?.positiveBalances;
    if (tokens?.length > 0) {
      return tokens.map((token, index) => {
        const priceBalance = priceStore.calculatePrice(token.balance);
        return (
          <TokenItem
            key={index?.toString()}
            chainInfo={{
              stakeCurrency: chainStore.current.stakeCurrency,
              networkType: chainStore.current.networkType,
              chainId: chainStore.current.chainId,
            }}
            balance={token.balance}
            priceBalance={priceBalance}
          />
        );
      });
    } else {
      return <OWEmpty />;
    }
  };

  const renderTokenItem = useCallback(
    ({ item, index }) => {
      if (more && index > 3) return null;

      if (item) {
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
        const chainIcon = chainIcons.find((c) => c.chainId === item.chainId);

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
                  <OWIcon type="images" source={{ uri: item.icon }} size={28} />
                </View>
                <View style={styles.chainWrap}>
                  <OWIcon
                    type="images"
                    source={{ uri: chainIcon?.Icon }}
                    size={16}
                  />
                </View>

                <View style={styles.pl12}>
                  {/* <Text size={16} color={colors["neutral-text-heading"]} weight="600">
                  {item.balance.toFixed(4)} {item.asset}
                </Text> */}
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
                      {item.balance.toFixed(4)} {item.asset}
                    </Text>
                    <Text
                      size={14}
                      style={{ lineHeight: 24 }}
                      color={colors["neutral-text-body"]}
                    >
                      ${item.value.toFixed(2)}
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
                  {/* <View
                  style={{
                    flex: 0.5,
                    justifyContent: "center",
                    paddingLeft: 20,
                  }}
                >
                  <RightArrowIcon
                    height={12}
                    color={colors["neutral-text-heading"]}
                  />
                </View> */}
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
          {/* {renderTokensFromQueryBalances()} */}
          {/* <OWFlatList
            contentContainerStyle={{
              paddingHorizontal: 0,
              paddingTop: 16
            }}
            data={tokens?.filter(t => {
              if (appInitStore.getInitApp.isAllNetworks) {
                return true;
              }
              return t.chainId === chainStore.current.chainId;
            })}
            keyExtractor={_keyExtract}
            renderItem={renderTokenItem}
            ListEmptyComponent={<OWEmpty type="cash" />}
          /> */}
          {tokens.length > 0 ? (
            tokens
              .filter((t) => {
                if (appInitStore.getInitApp.isAllNetworks) {
                  return true;
                }
                return t.chainId === chainStore.current.chainId;
              })
              .map((token, index) => {
                if (more) {
                  if (index < 3) return renderTokenItem({ item: token, index });
                } else {
                  return renderTokenItem({ item: token, index });
                }
              })
          ) : (
            <OWEmpty type="cash" />
          )}
          {tokens?.filter((t) => {
            if (appInitStore.getInitApp.isAllNetworks) {
              return true;
            }
            return t.chainId === chainStore.current.chainId;
          }).length > 3 ? (
            <OWButton
              style={{ marginTop: Platform.OS === "android" ? 24 : 16 }}
              label={more ? "View all" : "Hide"}
              size="medium"
              type="secondary"
              onPress={() => {
                setMore(!more);
              }}
            />
          ) : null}
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
              color: colors["primary-surface-default"],
              fontWeight: "600",
              fontSize: 16,
            }}
            onPress={() => setActiveTab("tokens")}
            style={[
              {
                width: "50%",
              },
              activeTab === "tokens" ? styles.active : null,
            ]}
          />
          <OWButton
            type="link"
            label={"History"}
            onPress={() => setActiveTab("history")}
            textStyle={{
              color: colors["primary-surface-default"],
              fontWeight: "600",
              fontSize: 16,
            }}
            style={[
              {
                width: "50%",
              },
              activeTab === "history" ? styles.active : null,
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
      width: 32,
      height: 32,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      backgroundColor: colors["neutral-text-action-on-dark-bg"],
    },
    chainWrap: {
      width: 18,
      height: 18,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors["neutral-text-action-on-dark-bg"],
      position: "absolute",
      bottom: -6,
      left: 20,
      top: 20,
    },
    active: {
      borderBottomColor: colors["primary-surface-default"],
      borderBottomWidth: 2,
    },
  });

import React, {
  FunctionComponent,
  useState,
  useEffect,
  useMemo,
  // useTransition,
} from "react";
import { observer } from "mobx-react-lite";
import { OWBox } from "@components/card";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Clipboard,
} from "react-native";
import { Text } from "@src/components/text";
import { useStore } from "@src/stores";
import { useTheme } from "@src/themes/theme-provider";
import { CheckIcon, DownArrowIcon } from "@src/components/icon";
import { metrics, spacing } from "@src/themes";
import MyWalletModal from "./my-wallet-modal/my-wallet-modal";
import {
  ChainIdEnum,
  DenomDydx,
  removeDataInParentheses,
} from "@owallet/common";
import { OWButton } from "@src/components/button";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { CopyAddressModal } from "./copy-address/copy-address-modal";
import {
  shortenAddress,
  shuffleArray,
  sortChainsByPrice,
} from "@src/utils/helper";

import { SCREENS } from "@src/common/constants";
import { navigate } from "@src/router/root";
import OWText from "@src/components/text/ow-text";
import { useSimpleTimer } from "@src/hooks";
import images from "@src/assets/images";
import PieChart from "react-native-pie-chart";
import { CoinPretty, Dec, PricePretty } from "@owallet/unit";
import { ViewToken } from "@src/stores/huge-queries";
import { initPrice } from "../hooks/use-multiple-assets";
import MoreModal from "./more-modal";

const widthAndHeight = 100;
const colorList = [
  "#81ACEB",
  "#FFEA28",
  "#9ED275",
  "#9AB66B",
  "#F07895",
  "#9D81EB",
  "#F7931A",
  "#627EEA",
  "#E9B6E6",
  "#494949",
  "#CFE389",
  "#93C067",
  "#3E7C55",
  "#29575D",
  "#649A57",
  "#CF72B9",
  "#854EAF",
  "#5D30A5",
];

const randomColors = shuffleArray(colorList);

export const AccountBoxAll: FunctionComponent<{
  isLoading: boolean;
}> = observer(({ isLoading }) => {
  const {
    accountStore,
    modalStore,
    chainStore,
    appInitStore,
    hugeQueriesStore,
    queriesStore,
    priceStore,
    allAccountStore,
  } = useStore();

  const { colors } = useTheme();
  const styles = styling(colors);

  const [isOpen, setModalOpen] = useState(false);
  const [isMoreOpen, setMoreModalOpen] = useState(false);
  const [showChart, setShowChart] = useState(true);
  const [chainListWithBalance, setChainListWithBalance] = useState([]);
  const [series, setSeries] = useState([]);
  const [sliceColor, setSliceColor] = useState([]);

  const chainId = chainStore.current.chainId;
  const account = allAccountStore.getAccount(chainId);

  const availableTotalPrice =
    useMemo(() => {
      let result: PricePretty | undefined;
      for (const bal of hugeQueriesStore.allKnownBalances) {
        if (bal.price) {
          if (!result) {
            result = bal.price;
          } else {
            result = result.add(bal.price);
          }
        }
      }
      return result;
    }, [hugeQueriesStore.allKnownBalances]) || initPrice;
  const stakedTotalPrice =
    useMemo(() => {
      let result: PricePretty | undefined;
      for (const bal of hugeQueriesStore.delegations) {
        if (bal.price) {
          if (!result) {
            result = bal.price;
          } else {
            result = result.add(bal.price);
          }
        }
      }
      for (const bal of hugeQueriesStore.unbondings) {
        if (bal.viewToken.price) {
          if (!result) {
            result = bal.viewToken.price;
          } else {
            result = result.add(bal.viewToken.price);
          }
        }
      }
      return result;
    }, [hugeQueriesStore.delegations, hugeQueriesStore.unbondings]) ||
    initPrice;
  const totalPriceBalance =
    useMemo(() => {
      if (!availableTotalPrice)
        return new PricePretty(
          priceStore.getFiatCurrency(priceStore.defaultVsCurrency),
          new Dec(0)
        );
      return availableTotalPrice.add(stakedTotalPrice);
    }, [availableTotalPrice, stakedTotalPrice]) || initPrice;
  const availableTotalPriceByChain =
    useMemo(() => {
      let result: PricePretty | undefined;
      for (const bal of hugeQueriesStore.getAllBalancesByChainId(chainId)) {
        if (bal.price) {
          if (!result) {
            result = bal.price;
          } else {
            result = result.add(bal.price);
          }
        }
      }
      return result;
    }, [chainId]) || initPrice;
  const stakedTotalPriceByChain =
    useMemo(() => {
      let result: PricePretty | undefined;
      for (const bal of hugeQueriesStore.delegations.filter(
        (delegation) => delegation.chainInfo.chainId === chainId
      )) {
        if (bal.price) {
          if (!result) {
            result = bal.price;
          } else {
            result = result.add(bal.price);
          }
        }
      }
      for (const bal of hugeQueriesStore.unbondings.filter(
        (unbonding) => unbonding.viewToken.chainInfo.chainId === chainId
      )) {
        if (bal.viewToken.price) {
          if (!result) {
            result = bal.viewToken.price;
          } else {
            result = result.add(bal.viewToken.price);
          }
        }
      }
      return result;
    }, [hugeQueriesStore.delegations, chainId, hugeQueriesStore.unbondings]) ||
    initPrice;
  const totalPriceByChain =
    useMemo(() => {
      if (!availableTotalPriceByChain)
        return new PricePretty(
          priceStore.getFiatCurrency(priceStore.defaultVsCurrency),
          new Dec(0)
        );
      return availableTotalPriceByChain.add(stakedTotalPriceByChain);
    }, [availableTotalPriceByChain, stakedTotalPriceByChain]) || initPrice;

  useEffect(() => {
    const tmpChain = [];
    const tmpSeries = [];
    const tmpSliceColor = [];
    let otherValue = 0;

    const minimumPrice =
      (Number(totalPriceBalance.toDec().toString()) * 3) / 100;
    const chainsInfoWithBalance = chainStore.chainInfosInUI
      .map((item) => {
        let balances = hugeQueriesStore.getAllBalancesByChainId(item.chainId);
        let result: PricePretty | undefined;
        for (const bal of balances) {
          if (bal.price) {
            if (!result) {
              result = bal.price;
            } else {
              result = result.add(bal.price);
            }
          }
        }
        //@ts-ignore
        item.balance = result || initPrice;
        return item;
      })
      .filter(
        (c) =>
          !c.chainName.toLowerCase().includes("test") &&
          c.chainName.toLowerCase()
      );

    // const dataMainnet = sortChainsByPrice(chainsInfoWithBalance);
    const dataMainnet = [];

    dataMainnet.map((data) => {
      const chainName = data.chainName;
      const chainId = data.chainId;
      const chainBalance = Number(data.balance?.toDec().toString());

      if (chainBalance > minimumPrice) {
        const colorKey = Object.values(ChainIdEnum).indexOf(
          chainId as ChainIdEnum
        );
        const color = randomColors[colorKey];

        tmpChain.push({
          color,
          totalBalance: chainBalance,
          name: chainName,
        });
        tmpSeries.push(chainBalance);
        tmpSliceColor.push(color);
      } else {
        otherValue += chainBalance;
      }
    });

    tmpChain.push({
      color: "#494949",
      totalBalance: otherValue,
      name: "Other",
    });
    setChainListWithBalance(tmpChain);
    setSeries([...tmpSeries, otherValue]);
    setSliceColor([...tmpSliceColor, "#494949"]);
  }, [totalPriceBalance, account.addressDisplay]);

  const { isTimedOut, setTimer } = useSimpleTimer();
  const chainAddress = account.addressDisplay;
  const _onPressMyWallet = () => {
    modalStore.setOptions({
      bottomSheetModalConfig: {
        enablePanDownToClose: false,
        enableOverDrag: false,
      },
    });
    modalStore.setChildren(<MyWalletModal />);
  };
  const queries = queriesStore.get(chainId);

  const queryReward = queries.cosmos.queryRewards.getQueryBech32Address(
    account.bech32Address
  );
  const stakingRewards = (() => {
    const isDydx = chainStore.current.chainId?.includes("dydx");
    const targetDenom = (() => {
      if (isDydx) {
        return DenomDydx;
      }

      return chainStore.current.stakeCurrency?.coinMinimalDenom;
    })();
    if (targetDenom) {
      const currency = chainStore.current.findCurrency(targetDenom);
      if (currency) {
        const reward = queryReward.rewards.find(
          (r) => r.currency.coinMinimalDenom === targetDenom
        );
        if (!reward) {
          if (isDydx) return new CoinPretty(currency, 0);
          return queryReward.stakableReward;
        }
        return reward;
      }
    }
  })();

  const totalStakingReward = priceStore.calculatePrice(stakingRewards);
  const queryDelegated = queries.cosmos.queryDelegations.getQueryBech32Address(
    account.bech32Address
  );
  const delegated = queryDelegated.total;
  const renderTotalBalance = () => {
    return (
      <>
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            paddingBottom: 16,
          }}
        >
          <Text variant="bigText" style={styles.labelTotalAmount}>
            {appInitStore.getInitApp.isAllNetworks
              ? totalPriceBalance?.toString()
              : totalPriceByChain?.toString()}
          </Text>
        </View>
      </>
    );
  };

  const renderPieChartPortfolio = () => {
    if (series.length > 0 && series[0] > 0) {
      return (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {series.length > 0 && series[0] > 0 ? (
            <View
              style={{
                padding: 16,
              }}
            >
              <PieChart
                widthAndHeight={widthAndHeight}
                series={series}
                sliceColor={sliceColor}
                coverRadius={0.75}
                coverFill={colors["neutral-surface-card"]}
              />
            </View>
          ) : null}
          <View style={{ width: "60%" }}>
            {chainListWithBalance
              .sort((a, b) => {
                return Number(b.totalBalance) - Number(a.totalBalance);
              })
              .map((chain) => {
                return (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 2,
                          backgroundColor: chain.color,
                          marginRight: 4,
                        }}
                      />
                      <Text size={13} color={colors["neutral-text-body"]}>
                        {chain.name}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: colors["neutral-surface-bg2"],
                        borderRadius: 999,
                        paddingHorizontal: 4,
                      }}
                    >
                      <Text>
                        {(
                          (Number(chain.totalBalance) /
                            Number(totalPriceBalance.toDec().toString())) *
                          100
                        ).toFixed(2)}
                        %
                      </Text>
                    </View>
                  </View>
                );
              })}
          </View>
        </View>
      );
    }
  };

  const renderAvailableperStaked = () => {
    if (!availableTotalPrice?.toDec() || !stakedTotalPrice?.toDec()) return;
    const totalNum =
      stakedTotalPrice?.toDec()?.add(availableTotalPrice?.toDec()) ||
      new Dec(0);
    if (!totalNum || totalNum.lte(new Dec(0))) return;
    const percentAvailable = availableTotalPrice
      ?.toDec()
      ?.quo(totalNum)
      ?.mul(new Dec(100))
      ?.roundUp()
      ?.toString();
    const stakedPercent = 100 - Number(percentAvailable || 0);
    return (
      <View style={{ marginVertical: 16 }}>
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <Text color={colors["neutral-text-body"]}>Available/Staked</Text>
          <Text color={colors["neutral-text-body"]}>
            {availableTotalPrice?.toString()} /{" "}
            <Text>{stakedTotalPrice?.toString()}</Text>
          </Text>
        </View>
        <View style={{ width: "100%", flexDirection: "row" }}>
          <View
            style={{
              backgroundColor: colors["primary-surface-default"],
              width: `${Number(percentAvailable) || 0}%`,
              height: 12,
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
              borderTopRightRadius: stakedPercent <= 0.1 ? 8 : 0,
              borderBottomRightRadius: stakedPercent <= 0.1 ? 8 : 0,
              marginRight: 2,
            }}
          />
          <View
            style={{
              backgroundColor: colors["highlight-surface-active"],
              width: `${stakedPercent}%`,
              height: 12,
              borderTopLeftRadius: Number(percentAvailable) <= 0.1 ? 8 : 0,
              borderBottomLeftRadius: Number(percentAvailable) <= 0.1 ? 8 : 0,
              borderTopRightRadius: 8,
              borderBottomRightRadius: 8,
            }}
          />
        </View>
      </View>
    );
  };

  const renderAssetsByChain = () => {
    // if (
    //   (chainStore.current.networkType !== "cosmos" &&
    //     !appInitStore.getInitApp.isAllNetworks) ||
    //   appInitStore.getInitApp.isAllNetworks
    // )
    //   return;
    const available = appInitStore.getInitApp.isAllNetworks
      ? totalPriceBalance?.toString()
      : availableTotalPriceByChain?.toString();

    return (
      <View
        style={{
          paddingTop: 12,
          paddingBottom: 6,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <OWText color={colors["neutral-text-body"]}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                backgroundColor: colors["primary-surface-default"],
              }}
            />
            {"  "}
            Available
          </OWText>
          <OWText size={14} weight="500">{`${available}`}</OWText>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <OWText color={colors["neutral-text-body"]}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                backgroundColor: colors["highlight-surface-active"],
              }}
            />
            {"  "}
            Staked:{" "}
            {delegated
              ?.shrink(true)
              .maxDecimals(4)
              .trim(true)
              .upperCase(true)
              .toString()}
          </OWText>
          <OWText size={14} weight="500">
            {stakedTotalPriceByChain
              ? stakedTotalPriceByChain.toString()
              : delegated?.shrink(true).maxDecimals(6).toString()}
          </OWText>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <OWText color={colors["neutral-text-body"]}>
            <OWIcon
              name={"trending-outline"}
              size={14}
              color={colors["neutral-text-title"]}
            />
            {"  "}
            Rewards:{" "}
            {stakingRewards
              ? removeDataInParentheses(
                  stakingRewards
                    .shrink(true)
                    .maxDecimals(6)
                    .trim(true)
                    .upperCase(true)
                    .toString()
                )
              : ""}
          </OWText>
          <OWText size={14} weight="500" color={colors["success-text-body"]}>
            {" "}
            {totalStakingReward
              ? totalStakingReward.toString()
              : stakingRewards?.shrink(true).maxDecimals(6).toString()}
          </OWText>
        </View>
        {/*{chainStore.current.chainId === ChainIdEnum.TRON && (*/}
        {/*  <View style={{ paddingBottom: 8 }}>*/}
        {/*    <View*/}
        {/*      style={{*/}
        {/*        flexDirection: "row",*/}
        {/*        justifyContent: "space-between",*/}
        {/*        alignItems: "center",*/}
        {/*      }}*/}
        {/*    >*/}
        {/*      <OWText*/}
        {/*        size={15}*/}
        {/*        weight="600"*/}
        {/*        color={colors["neutral-text-title"]}*/}
        {/*      >*/}
        {/*        My Energy:*/}
        {/*      </OWText>*/}
        {/*      <OWText*/}
        {/*        size={14}*/}
        {/*        weight="600"*/}
        {/*        color={colors["neutral-text-body"]}*/}
        {/*      >{`${accountTronInfo?.energyRemaining?.toString()}/${accountTronInfo?.energyLimit?.toString()}`}</OWText>*/}
        {/*    </View>*/}
        {/*    <View*/}
        {/*      style={{*/}
        {/*        flexDirection: "row",*/}
        {/*        justifyContent: "space-between",*/}
        {/*        alignItems: "center",*/}
        {/*      }}*/}
        {/*    >*/}
        {/*      <OWText*/}
        {/*        size={15}*/}
        {/*        weight="600"*/}
        {/*        color={colors["neutral-text-title"]}*/}
        {/*      >*/}
        {/*        My Bandwidth:*/}
        {/*      </OWText>*/}
        {/*      <OWText*/}
        {/*        size={14}*/}
        {/*        weight="600"*/}
        {/*        color={colors["neutral-text-body"]}*/}
        {/*      >{`${accountTronInfo?.bandwidthRemaining?.toString()}/${accountTronInfo?.bandwidthLimit?.toString()}`}</OWText>*/}
        {/*    </View>*/}
        {/*  </View>*/}
        {/*)}*/}
      </View>
    );
  };

  return (
    <View>
      <CopyAddressModal
        close={() => setModalOpen(false)}
        isOpen={isOpen}
        bottomSheetModalConfig={{
          enablePanDownToClose: false,
          enableOverDrag: false,
        }}
      />
      <MoreModal
        close={() => setMoreModalOpen(false)}
        isOpen={isMoreOpen}
        bottomSheetModalConfig={{
          enablePanDownToClose: false,
          enableOverDrag: false,
        }}
      />
      <OWBox style={[styles.containerOWBox]}>
        <View style={styles.containerInfoAccount}>
          <TouchableOpacity
            disabled={isLoading}
            onPress={_onPressMyWallet}
            style={[
              styles.btnAcc,
              {
                opacity: isLoading ? 0.5 : 1,
              },
            ]}
          >
            <Image
              style={styles.infoIcon}
              source={images.default_avatar}
              resizeMode="contain"
              fadeDuration={0}
            />
            <Text style={styles.labelName}>{account?.name || "..."}</Text>
            <DownArrowIcon
              height={15}
              color={colors["neutral-icon-on-light"]}
            />
          </TouchableOpacity>
          {appInitStore.getInitApp.isAllNetworks ? (
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                onPress={() => {
                  // startTransition(() => {
                  //   setShowChart(!showChart);
                  // });
                  setShowChart(!showChart);
                }}
                style={styles.button}
              >
                <OWIcon
                  size={18}
                  name="tdesignchart-pie"
                  color={colors["neutral-icon-on-light"]}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setModalOpen(true);
                }}
                style={styles.button}
              >
                <OWIcon
                  size={18}
                  name="copy"
                  color={colors["neutral-icon-on-light"]}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <OWButton
              type="secondary"
              textStyle={{
                fontSize: 14,
                fontWeight: "600",
                color: colors["neutral-icon-on-light"],
              }}
              iconRight={
                isTimedOut ? (
                  <CheckIcon />
                ) : (
                  <OWIcon
                    size={18}
                    name="tdesigncopy"
                    color={colors["neutral-icon-on-light"]}
                  />
                )
              }
              style={styles.copy}
              label={shortenAddress(chainAddress)}
              onPress={() => {
                Clipboard.setString(chainAddress);
                setTimer(2000);
              }}
            />
          )}
        </View>
        <View style={styles.overview}>{renderTotalBalance()}</View>
        {!appInitStore.getInitApp.isAllNetworks ||
        appInitStore.getInitApp.isAllNetworks ? (
          <View
            style={{
              height: 1,
              width: "100%",
              backgroundColor: colors["neutral-border-default"],
            }}
          />
        ) : null}
        {appInitStore.getInitApp.isAllNetworks
          ? renderAvailableperStaked()
          : renderAssetsByChain()}

        {/*{renderAvailableperStaked()}*/}
        {appInitStore.getInitApp.isAllNetworks && showChart
          ? renderPieChartPortfolio()
          : null}
        {!appInitStore.getInitApp.isAllNetworks ? (
          <View style={styles.btnGroup}>
            <OWButton
              textStyle={{
                fontSize: 15,
                fontWeight: "600",
                color: colors["neutral-icon-on-light"],
              }}
              icon={
                <OWIcon
                  color={colors["neutral-icon-on-light"]}
                  name={
                    appInitStore.getInitApp.isAllNetworks
                      ? "tdesigncreditcard"
                      : "tdesignsend"
                  }
                  size={20}
                />
              }
              type="link"
              style={styles.getStarted}
              label={appInitStore.getInitApp.isAllNetworks ? "Buy" : "Send"}
              onPress={() => {
                if (appInitStore.getInitApp.isAllNetworks) {
                  navigate(SCREENS.BuyFiat);
                  return;
                }
                // if (chainStore.current.chainId === ChainIdEnum.TRON) {
                //   navigate(SCREENS.SendTron, {
                //     currency:
                //       chainStore.current.stakeCurrency.coinMinimalDenom,
                //   });
                // } else if (chainStore.current.chainId === ChainIdEnum.Oasis) {
                //   navigate(SCREENS.SendOasis, {
                //     currency:
                //       chainStore.current.stakeCurrency.coinMinimalDenom,
                //   });
                // } else if (chainStore.current.networkType === "bitcoin") {
                //   navigate(SCREENS.SendBtc);
                // } else if (chainStore.current.networkType === "evm") {
                //   navigate(SCREENS.SendEvm);
                // } else {
                //   navigate(SCREENS.NewSend);
                // }
                navigate(SCREENS.Send, {
                  coinMinimalDenom:
                    chainStore.current.feeCurrencies?.[0].coinMinimalDenom,
                  chainId: chainId,
                });
              }}
            />
            <View
              style={{
                width: 1,
                height: "100%",
                backgroundColor: colors["neutral-border-default"],
              }}
            />
            <OWButton
              style={styles.getStarted}
              icon={
                <OWIcon
                  color={colors["neutral-icon-on-light"]}
                  name={"tdesignqrcode"}
                  size={20}
                />
              }
              type="link"
              textStyle={{
                fontSize: 15,
                fontWeight: "600",
                color: colors["neutral-icon-on-light"],
              }}
              label="Receive"
              onPress={() => {
                navigate(SCREENS.QRScreen);
                return;
              }}
            />
            <View
              style={{
                width: 1,
                height: "100%",
                backgroundColor: colors["neutral-border-default"],
              }}
            />
            <OWButton
              textStyle={{
                fontSize: 15,
                fontWeight: "600",
                color: colors["neutral-icon-on-light"],
              }}
              icon={
                <OWIcon
                  color={colors["neutral-icon-on-light"]}
                  name={"tdesignellipsis"}
                  size={20}
                />
              }
              type="link"
              style={styles.getStarted}
              label={"More"}
              onPress={() => {
                setMoreModalOpen(true);
              }}
            />
          </View>
        ) : null}
      </OWBox>
    </View>
  );
});

const styling = (colors) =>
  StyleSheet.create({
    containerOWBox: {
      marginHorizontal: 16,
      marginTop: 0,
      width: metrics.screenWidth - 32,
      backgroundColor: colors["neutral-surface-card"],
      padding: spacing["16"],
      borderBottomLeftRadius: 6,
      borderBottomRightRadius: 6,
    },
    overview: {
      marginTop: 12,
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
      width: metrics.screenWidth / 4.45,
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
      borderTopColor: colors["neutral-border-default"],
      borderTopWidth: 1,
      paddingTop: 8,
      marginTop: 8,
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
    button: {
      padding: 8,
      paddingHorizontal: 16,
      marginLeft: 8,
      backgroundColor: colors["neutral-surface-action3"],
      borderRadius: 999,
    },
  });

import React, {
  FunctionComponent,
  useState,
  useEffect,
  useTransition,
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
import { CheckIcon, CopyFillIcon, DownArrowIcon } from "@src/components/icon";
import { metrics, spacing } from "@src/themes";
import MyWalletModal from "./my-wallet-modal/my-wallet-modal";
import { ChainIdEnum, ChainNameEnum, unknownToken } from "@owallet/common";
import { OWButton } from "@src/components/button";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { CopyAddressModal } from "./copy-address/copy-address-modal";
import { shortenAddress, shuffleArray } from "@src/utils/helper";
import { useSmartNavigation } from "@src/navigation.provider";
import { SCREENS } from "@src/common/constants";
import { navigate } from "@src/router/root";
import OWText from "@src/components/text/ow-text";
import { useSimpleTimer } from "@src/hooks";
import LottieView from "lottie-react-native";
import images from "@src/assets/images";
import PieChart from "react-native-pie-chart";
import { PricePretty } from "@owallet/unit";

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

const widthAndHeight = 100;
const colorList = [
  "#ff6c00",
  "#ff3c00",
  "#945EF8",
  "#C170FF",
  "#00AD26",
  "#ECFEEE",
  "#ffb300",
  "#ff9100",
  "#8B1BFB",
  "#FF5947",
  "#39DD47",
  "#D3FDD7",
  "#FFE1AD",
  "#B87500",
  "#F29900",
  "#9D81EB",
  "#7A4D00",
  "#E01600",
  "#CAEB60",
  "#fbd203",
  "#A81100",
  "#FFEDEB",
];

const randomColors = shuffleArray(colorList);

export const AccountBoxAll: FunctionComponent<{
  totalPriceBalance: string;
  totalBalanceByChain: string;
  isLoading: boolean;
}> = observer(({ totalPriceBalance, totalBalanceByChain, isLoading }) => {
  const { colors } = useTheme();
  const {
    accountStore,
    modalStore,
    chainStore,
    appInitStore,
    queriesStore,
    keyRingStore,
    priceStore,
  } = useStore();
  const [isOpen, setModalOpen] = useState(false);
  const [chainListWithBalance, setChainListWithBalance] = useState([]);
  const [series, setSeries] = useState([]);
  const [sliceColor, setSliceColor] = useState([]);
  const [isPending, startTransition] = useTransition();
  const smartNavigation = useSmartNavigation();

  const queries = queriesStore.get(chainStore.current.chainId);
  const styles = styling(colors);

  const { dataTokensByChain } = appInitStore.getMultipleAssets;

  useEffect(() => {
    const tmpChain = [];
    const tmpSeries = [];
    const tmpSliceColor = [];
    let otherValue = 0;
    const minimumPrice =
      (Number(appInitStore.getMultipleAssets.totalPriceBalance) * 3) / 100;
    Object.keys(dataTokensByChain).map((chainId) => {
      const chainName = ChainNameEnum[getKeyByValue(ChainIdEnum, chainId)];
      if (
        chainId.includes("test") ||
        chainName?.includes("test") ||
        chainName?.includes("Test")
      )
        return;
      if (Number(dataTokensByChain[chainId].totalBalance) > minimumPrice) {
        const colorKey = Object.values(ChainIdEnum).indexOf(
          chainId as ChainIdEnum
        );
        const color = randomColors[colorKey];
        const totalBalance = Number(dataTokensByChain[chainId].totalBalance);

        tmpChain.push({
          color,
          totalBalance,
          name: chainName,
        });
        tmpSeries.push(totalBalance);
        tmpSliceColor.push(color);
      } else {
        otherValue += Number(dataTokensByChain[chainId].totalBalance);
      }
    });

    tmpChain.push({
      color: "#F5F5F7",
      totalBalance: otherValue,
      name: "Other",
    });
    setChainListWithBalance(tmpChain);
    setSeries([...tmpSeries, otherValue]);
    setSliceColor([...tmpSliceColor, "#F5F5F7"]);
  }, [dataTokensByChain]);

  const account = accountStore.getAccount(chainStore.current.chainId);
  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);

  const { isTimedOut, setTimer } = useSimpleTimer();
  const chainAddress = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
  );

  const _onPressMyWallet = () => {
    modalStore.setOptions({
      bottomSheetModalConfig: {
        enablePanDownToClose: false,
        enableOverDrag: false,
      },
    });
    modalStore.setChildren(<MyWalletModal />);
  };
  const address = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
  );
  const accountTronInfo =
    chainStore.current.chainId === ChainIdEnum.TRON
      ? queries.tron.queryAccount.getQueryWalletAddress(address)
      : null;
  const renderTotalBalance = () => {
    return (
      <>
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <Text variant="bigText" style={styles.labelTotalAmount}>
            {totalPriceBalance}
          </Text>
          {isLoading ? (
            <View
              style={{
                maxHeight: 30,
              }}
            >
              <LottieView
                source={require("@src/assets/animations/loading.json")}
                resizeMode={"contain"}
                style={{
                  width: 70,
                  height: 70,
                  marginLeft: -10,
                  marginTop: -20,
                }}
                autoPlay
                loop
              />
            </View>
          ) : null}
        </View>
        {appInitStore.getInitApp.isAllNetworks ? null : (
          <>
            <View
              style={{
                marginVertical: 8,
                paddingVertical: 8,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: colors["neutral-icon-on-dark"],
                    borderRadius: 16,
                  }}
                >
                  <OWIcon
                    type="images"
                    source={{
                      uri:
                        chainStore.current?.stakeCurrency?.coinImageUrl ||
                        unknownToken.coinImageUrl,
                    }}
                    size={16}
                  />
                </View>
                <Text
                  style={{
                    paddingLeft: 6,
                  }}
                  size={16}
                  weight="600"
                  color={colors["neutral-text-title"]}
                >
                  {chainStore.current?.chainName || unknownToken.coinDenom}
                </Text>
              </View>

              <Text size={16} weight="600" color={colors["neutral-text-title"]}>
                {totalBalanceByChain}
              </Text>
            </View>
            {chainStore.current.chainId === ChainIdEnum.TRON && (
              <View style={{ paddingBottom: 8 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <OWText
                    size={15}
                    weight="600"
                    color={colors["neutral-text-title"]}
                  >
                    My Energy:
                  </OWText>
                  <OWText
                    size={14}
                    weight="600"
                    color={colors["neutral-text-body"]}
                  >{`${accountTronInfo?.energyRemaining?.toString()}/${accountTronInfo?.energyLimit?.toString()}`}</OWText>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <OWText
                    size={15}
                    weight="600"
                    color={colors["neutral-text-title"]}
                  >
                    My Bandwidth:
                  </OWText>
                  <OWText
                    size={14}
                    weight="600"
                    color={colors["neutral-text-body"]}
                  >{`${accountTronInfo?.bandwidthRemaining?.toString()}/${accountTronInfo?.bandwidthLimit?.toString()}`}</OWText>
                </View>
              </View>
            )}
          </>
        )}
      </>
    );
  };

  const renderPieChartPortfolio = () => {
    return (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {series.length > 0 ? (
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
          {chainListWithBalance.map((chain) => {
            return (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
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
                        Number(
                          appInitStore.getMultipleAssets.totalPriceBalance
                        )) *
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
      <OWBox style={styles.containerOWBox}>
        <View style={styles.containerInfoAccount}>
          <TouchableOpacity
            // disabled={!universalSwapStore.getLoadStatus.isLoad}
            onPress={_onPressMyWallet}
            style={styles.btnAcc}
          >
            <Image
              style={styles.infoIcon}
              source={images.default_avatar}
              resizeMode="contain"
              fadeDuration={0}
            />
            <Text style={styles.labelName}>{accountOrai?.name || ".."}</Text>
            <DownArrowIcon height={15} color={colors["primary-text"]} />
          </TouchableOpacity>
          {appInitStore.getInitApp.isAllNetworks ? (
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
              onPress={() => {
                startTransition(() => {
                  setModalOpen(true);
                });
              }}
            />
          ) : (
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
              label={shortenAddress(chainAddress)}
              onPress={() => {
                Clipboard.setString(chainAddress);
                setTimer(2000);
              }}
            />
          )}
        </View>
        <View style={styles.overview}>{renderTotalBalance()}</View>
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
              {totalPriceBalance}/<Text>$5,313.04</Text>
            </Text>
          </View>
          <View style={{ width: "100%", flexDirection: "row" }}>
            <View
              style={{
                backgroundColor: colors["primary-surface-default"],
                width: "70%",
                height: 12,
                borderTopLeftRadius: 8,
                borderBottomLeftRadius: 8,
                marginRight: 2,
              }}
            />
            <View
              style={{
                backgroundColor: colors["highlight-surface-active"],
                width: "30%",
                height: 12,
                borderTopRightRadius: 8,
                borderBottomRightRadius: 8,
              }}
            />
          </View>
        </View>
        {renderPieChartPortfolio()}
        <View style={styles.btnGroup}>
          <OWButton
            style={styles.getStarted}
            icon={
              <OWIcon
                color={colors["neutral-text-action-on-light-bg"]}
                name={"tdesignqrcode"}
                size={20}
              />
            }
            type="link"
            textStyle={{
              fontSize: 15,
              fontWeight: "600",
              color: colors["neutral-text-action-on-light-bg"],
            }}
            label="Receive"
            onPress={() => {
              navigate(SCREENS.STACK.Others, {
                screen: SCREENS.QRScreen,
              });
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
              color: colors["neutral-text-action-on-light-bg"],
            }}
            icon={
              <OWIcon
                color={colors["neutral-text-action-on-light-bg"]}
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
                navigate(SCREENS.STACK.Others, {
                  screen: SCREENS.BuyFiat,
                });
                return;
              }
              if (chainStore.current.chainId === ChainIdEnum.TRON) {
                smartNavigation.navigateSmart("SendTron", {
                  currency: chainStore.current.stakeCurrency.coinMinimalDenom,
                });
              } else if (chainStore.current.chainId === ChainIdEnum.Oasis) {
                smartNavigation.navigateSmart("SendOasis", {
                  currency: chainStore.current.stakeCurrency.coinMinimalDenom,
                });
              } else if (chainStore.current.networkType === "bitcoin") {
                navigate(SCREENS.STACK.Others, {
                  screen: SCREENS.SendBtc,
                });
              } else if (chainStore.current.networkType === "evm") {
                navigate(SCREENS.STACK.Others, {
                  screen: SCREENS.SendEvm,
                });
              } else {
                smartNavigation.navigateSmart("NewSend", {
                  currency: chainStore.current.stakeCurrency.coinMinimalDenom,
                });
              }
            }}
          />
        </View>
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
      padding: spacing["16"],
      backgroundColor: colors["neutral-surface-card"],
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
  });

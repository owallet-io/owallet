import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { OWBox } from "../../components/card";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Text } from "@src/components/text";
import { useStore } from "../../stores";
import { useTheme } from "@src/themes/theme-provider";
import { getTotalUsd, chainIcons } from "@oraichain/oraidex-common";
import { DownArrowIcon } from "@src/components/icon";
import { metrics, spacing } from "@src/themes";
import MyWalletModal from "./components/my-wallet-modal/my-wallet-modal";
import { ChainIdEnum } from "@owallet/common";
import { OWButton } from "@src/components/button";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { CopyAddressModal } from "./components/copy-address/copy-address-modal";
import { getTokenInfos } from "@src/utils/helper";
import { useSmartNavigation } from "@src/navigation.provider";
import { SCREENS } from "@src/common/constants";
import { navigate } from "@src/router/root";
import { LoadingSpinner } from "@src/components/spinner";
import OWText from "@src/components/text/ow-text";

export const AccountBoxAll: FunctionComponent<{}> = observer(({}) => {
  const { colors } = useTheme();
  const {
    universalSwapStore,
    accountStore,
    modalStore,
    chainStore,
    appInitStore,
    queriesStore,
    keyRingStore,
  } = useStore();
  const [profit, setProfit] = useState(0);
  const [isOpen, setModalOpen] = useState(false);

  const smartNavigation = useSmartNavigation();

  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);

  const chainAssets = getTokenInfos({
    tokens: universalSwapStore.getAmount,
    prices: appInitStore.getInitApp.prices,
    networkFilter: chainStore.current.chainId,
  });
  const queries = queriesStore.get(chainStore.current.chainId);
  const styles = styling(colors);
  let totalUsd: number = 0;
  if (appInitStore.getInitApp.prices) {
    totalUsd = getTotalUsd(
      universalSwapStore.getAmount,
      appInitStore.getInitApp.prices
    );
  }

  const account = accountStore.getAccount(chainStore.current.chainId);

  const _onPressMyWallet = () => {
    modalStore.setOptions({
      bottomSheetModalConfig: {
        enablePanDownToClose: false,
        enableOverDrag: false,
      },
    });
    modalStore.setChildren(<MyWalletModal />);
  };

  useEffect(() => {
    let yesterdayBalance = 0;
    const yesterdayAssets = appInitStore.getInitApp.yesterdayPriceFeed;

    if (yesterdayAssets?.length > 0) {
      yesterdayAssets.map((y) => {
        yesterdayBalance += y.value ?? 0;
      });

      setProfit(Number(Number(totalUsd - yesterdayBalance).toFixed(2)));
    } else {
      setProfit(0);
    }
    appInitStore.updateBalanceByAddress(accountOrai.bech32Address, totalUsd);
  }, [totalUsd, accountOrai.bech32Address, appInitStore]);
  const address = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
  );
  const accountTronInfo =
    chainStore.current.chainId === ChainIdEnum.TRON
      ? queries.tron.queryAccount.getQueryWalletAddress(address)
      : null;
  const renderTotalBalance = () => {
    const chainIcon = chainIcons.find(
      (c) => c.chainId === chainStore.current.chainId
    );
    let chainBalance = 0;

    chainAssets?.map((a) => {
      chainBalance += a.value;
    });

    return (
      <>
        <Text variant="bigText" style={styles.labelTotalAmount}>
          ${totalUsd.toFixed(2)}
        </Text>
        <Text
          style={styles.profit}
          color={colors[profit < 0 ? "error-text-body" : "success-text-body"]}
        >
          {profit < 0 ? "" : "+"}
          {profit && totalUsd && totalUsd > 0
            ? Number((profit / totalUsd) * 100 ?? 0).toFixed(2)
            : 0}
          % ($
          {profit?.toFixed(2) ?? 0}) Today
        </Text>

        {appInitStore.getInitApp.isAllNetworks ? null : (
          <>
            <View
              style={{
                borderTopWidth: 1,
                borderColor: colors["neutral-border-default"],
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
                    backgroundColor: colors["neutral-text-action-on-dark-bg"],
                    borderRadius: 16,
                  }}
                >
                  <OWIcon
                    type="images"
                    source={{ uri: chainIcon?.Icon }}
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
                  {chainStore.current.chainName}
                </Text>
              </View>

              <Text size={16} weight="600" color={colors["neutral-text-title"]}>
                ${chainBalance.toFixed(2)}
              </Text>
            </View>
            {chainStore.current.chainId === ChainIdEnum.TRON && (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <OWText
                    size={16}
                    weight="600"
                    color={colors["neutral-text-title"]}
                  >
                    My Energy:
                  </OWText>
                  <OWText
                    size={16}
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
                    size={16}
                    weight="600"
                    color={colors["neutral-text-title"]}
                  >
                    My Bandwidth:
                  </OWText>
                  <OWText
                    size={16}
                    weight="600"
                    color={colors["neutral-text-body"]}
                  >{`${accountTronInfo?.bandwidthRemaining?.toString()}/${accountTronInfo?.bandwidthLimit?.toString()}`}</OWText>
                </View>
              </>
            )}
          </>
        )}
      </>
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
          {!universalSwapStore.getLoadStatus.isLoad && (
            <View style={styles.containerLoading}>
              <LoadingSpinner color={colors["gray-150"]} size={22} />
            </View>
          )}
          <TouchableOpacity
            disabled={!universalSwapStore.getLoadStatus.isLoad}
            onPress={_onPressMyWallet}
            style={styles.btnAcc}
          >
            <Image
              style={styles.infoIcon}
              source={require("../../assets/images/default-avatar.png")}
              resizeMode="contain"
              fadeDuration={0}
            />
            <Text style={styles.labelName}>{account?.name || ".."}</Text>
            <DownArrowIcon height={15} color={colors["primary-text"]} />
          </TouchableOpacity>
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
              setModalOpen(true);
            }}
          />
        </View>
        <View style={styles.overview}>{renderTotalBalance()}</View>
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
            label={appInitStore.getInitApp.isAllNetworks ? "Buy" : "Send"}
            onPress={() => {
              // smartNavigation.navigateSmart("NewSend", {
              //   currency: chainStore.current.stakeCurrency.coinMinimalDenom,
              // });
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
  });

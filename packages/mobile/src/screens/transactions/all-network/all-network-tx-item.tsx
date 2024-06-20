import { StyleSheet, TouchableOpacity, View } from "react-native";
import React, { FC } from "react";
import {
  formatContractAddress,
  MapNetworkToChainId,
  maskedNumber,
} from "@src/utils/helper";
import { useTheme } from "@src/themes/theme-provider";

import { observer } from "mobx-react-lite";
import { Text } from "@src/components/text";
import OWIcon from "@src/components/ow-icon/ow-icon";

import { CoinPretty, Dec, DecUtils } from "@owallet/unit";
import moment from "moment/moment";
import { navigate } from "@src/router/root";
import { getTimeMilliSeconds, SCREENS } from "@src/common/constants";
import { RightArrowIcon } from "@src/components/icon";
import { useStore } from "@src/stores";
import { CosmosItem } from "@src/screens/transactions/cosmos/types";
import { unknownToken } from "@owallet/common";
import get from "lodash/get";
import { AllNetworkItemTx } from "@src/screens/transactions/all-network/all-network.types";

export const AllNetworkTxItem: FC<{
  item: AllNetworkItemTx;
  index: number;
  data: any;
}> = observer(({ item, index, data, ...props }) => {
  const { priceStore, chainStore } = useStore();
  const fiat = priceStore.defaultVsCurrency;
  if (!item) return;
  console.log(item, "item");
  let currency = unknownToken;

  if (item.tokenInfos?.length > 0 && item.tokenInfos[0]) {
    currency = {
      coinDenom: item.tokenInfos[0]?.abbr,
      coinImageUrl: item.tokenInfos[0]?.imgUrl,
      coinGeckoId: item.tokenInfos[0]?.coingeckoId,
      coinMinimalDenom: item.tokenInfos[0]?.denom,
      coinDecimals: item.tokenInfos[0]?.decimal,
    };
  }
  const onTransactionDetail = (item, currency) => {
    navigate(SCREENS.STACK.Others, {
      screen: SCREENS.HistoryDetail,
      params: {
        item,
        currency,
      },
    });

    return;
  };

  const amount = new CoinPretty(currency, new Dec(item.amount[0]));
  const priceAmount = priceStore.calculatePrice(amount, fiat);
  const first =
    index > 0 &&
    moment(getTimeMilliSeconds(data[index - 1].timestamp)).format(
      "MMM D, YYYY"
    );
  const now = moment(getTimeMilliSeconds(item.timestamp)).format("MMM D, YYYY");
  const { colors } = useTheme();
  const styles = styling(colors);

  const isSent =
    item.userAddress?.toLowerCase() === item.fromAddress?.toLowerCase() ||
    item.fromAddress?.toLowerCase() === item.toAddress?.toLowerCase();
  const method = isSent ? "Sent" : "Received";
  const chainInfo = chainStore.getChain(MapNetworkToChainId[item.network]);
  const { coinDenom } = chainInfo.stakeCurrency;
  const { coinDenom: denom } = currency;
  return (
    <View
      style={{
        paddingVertical: 8,
        opacity: currency === unknownToken ? 0.5 : 1,
      }}
    >
      {first != now || index === 0 ? (
        <Text size={14} color={colors["neutral-text-heading"]} weight="600">
          {now}
        </Text>
      ) : null}

      <TouchableOpacity
        onPress={() => onTransactionDetail(item, currency)}
        {...props}
        style={styles.btnItem}
      >
        <View style={styles.leftBoxItem}>
          <View style={styles.iconWrap}>
            <OWIcon
              type="images"
              source={{
                uri:
                  currency.coinImageUrl.includes("missing.png") ||
                  !currency.coinImageUrl
                    ? unknownToken.coinImageUrl
                    : currency.coinImageUrl,
              }}
              size={32}
              style={{
                borderRadius: 999,
                tintColor:
                  coinDenom === "ORAI" && (denom === "ORAI" || denom === "AIRI")
                    ? colors["neutral-text-title"]
                    : null,
              }}
            />
          </View>
          <View style={styles.chainWrap}>
            <OWIcon
              type="images"
              source={{
                uri: chainInfo.stakeCurrency.coinImageUrl,
              }}
              size={20}
              style={{
                borderRadius: 999,
                tintColor:
                  chainInfo.stakeCurrency.coinDenom === "ORAI"
                    ? colors["neutral-text-title"]
                    : null,
              }}
            />
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            borderBottomWidth: 0.5,
            borderBottomColor: colors["neutral-border-default"],
            paddingVertical: 8,
            justifyContent: "space-between",
            flex: 1,
          }}
        >
          <View style={styles.leftBoxItem}>
            <View style={styles.pl10}>
              <Text size={16} color={colors["neutral-text-title"]} weight="600">
                {method}
              </Text>
              <Text weight="400" color={colors["neutral-text-body"]}>
                {formatContractAddress(item.txhash)}
              </Text>
            </View>
          </View>
          <View style={styles.rightBoxItem}>
            <View style={{ flexDirection: "row" }}>
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  weight="500"
                  color={
                    !isSent
                      ? colors["success-text-body"]
                      : colors["error-text-body"]
                  }
                >
                  {`${!isSent ? "+" : "-"}${maskedNumber(
                    amount.hideDenom(true).toString()
                  ).replace("-", "")} ${currency.coinDenom}`}
                </Text>
                <Text style={styles.profit} color={colors["neutral-text-body"]}>
                  {priceAmount?.toString().replace("-", "")}
                </Text>
              </View>
              <View
                style={{
                  justifyContent: "center",
                  paddingLeft: 16,
                }}
              >
                <RightArrowIcon
                  height={12}
                  color={colors["neutral-text-action-on-light-bg"]}
                />
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
});

const styling = (colors) => {
  return StyleSheet.create({
    wrapHeaderTitle: {
      flexDirection: "row",
    },
    pl10: {
      paddingLeft: 10,
    },
    leftBoxItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    rightBoxItem: {
      alignItems: "flex-end",
    },
    btnItem: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 16,
    },
    profit: {
      fontWeight: "400",
      lineHeight: 20,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 44,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      backgroundColor: colors["neutral-surface-action2"],
    },
    chainWrap: {
      width: 22,
      height: 22,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors["neutral-text-action-on-dark-bg"],
      position: "absolute",
      bottom: -3,
      left: 27,
      borderWidth: 2,
      borderColor: colors["neutral-surface-action2"],
    },
    active: {
      borderBottomColor: colors["primary-surface-default"],
      borderBottomWidth: 2,
    },
  });
};

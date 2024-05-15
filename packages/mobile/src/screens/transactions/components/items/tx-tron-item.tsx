import { StyleSheet, TouchableOpacity, View } from "react-native";
import React, { FC } from "react";
import { formatContractAddress, maskedNumber } from "@src/utils/helper";
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
import { unknownToken } from "@owallet/common";
import get from "lodash/get";
import { Currency } from "@owallet/types";
import Coingecko from "@src/assets/data/coingecko.json";

export const TxTronItem: FC<{
  item: any;
  index: number;
  data: any;
}> = observer(({ item, index, data, ...props }) => {
  const { priceStore, chainStore } = useStore();
  const fiat = priceStore.defaultVsCurrency;
  if (!item) return;
  console.log(item, "item");
  let currency = unknownToken;

  if (get(item, "tokenInfo.coinDenom") === "TRX") {
    currency = chainStore.current.stakeCurrency;
  } else if (get(item, "tokenInfo.contractAddress")) {
    const itemCoingecko = Coingecko.find(
      (it, index) =>
        it.symbol.toUpperCase() == get(item, "tokenInfo.abbr").toUpperCase()
    );
    currency = {
      coinDecimals: get(item, "tokenInfo.decimal"),
      coinImageUrl: get(item, "tokenInfo.imgUrl"),
      coinDenom: get(item, "tokenInfo.abbr"),
      coinGeckoId: get(itemCoingecko, "id") || "unknown",
      coinMinimalDenom: `erc20:${get(item, "tokenInfo.contractAddress")}:${get(
        item,
        "tokenInfo.name"
      )}`,
    } as Currency;
  }
  console.log(currency, "currency");
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

  const amount = new CoinPretty(currency, new Dec(item.amount));
  const priceAmount = priceStore.calculatePrice(amount, fiat);
  const first =
    index > 0 &&
    moment(getTimeMilliSeconds(data[index - 1].timestamp)).format(
      "MMM D, YYYY"
    );
  const now = moment(getTimeMilliSeconds(item.timestamp)).format("MMM D, YYYY");
  const { colors } = useTheme();
  const styles = styling(colors);
  const method = item.transactionType === "incoming" ? "Received" : "Sent";
  const amountStr = amount.hideDenom(true).trim(true).toString();
  const checkInOut =
    amountStr !== "0" ? (item.transactionType === "incoming" ? "+" : "-") : "";
  return (
    <View style={{ paddingVertical: 8 }}>
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
              source={{ uri: currency.coinImageUrl }}
              size={32}
              style={{
                borderRadius: 999,
                tintColor:
                  currency.coinDenom === "ORAI"
                    ? colors["neutral-text-title"]
                    : null,
              }}
            />
          </View>
          <View style={styles.chainWrap}>
            <OWIcon
              type="images"
              source={{ uri: chainStore.current.stakeCurrency.coinImageUrl }}
              size={20}
              style={{
                borderRadius: 999,
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
                {formatContractAddress(item.txID)}
              </Text>
            </View>
          </View>
          <View style={styles.rightBoxItem}>
            <View style={{ flexDirection: "row" }}>
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  weight="500"
                  color={
                    item.transactionType === "incoming"
                      ? colors["success-text-body"]
                      : colors["neutral-text-title"]
                  }
                >
                  {`${checkInOut}${maskedNumber(amountStr, 6)} ${
                    currency.coinDenom
                  }`}
                </Text>
                <Text style={styles.profit} color={colors["neutral-text-body"]}>
                  {priceAmount.toString().replace("-", "")}
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
      // justifyContent: 'space-between',
      alignItems: "center",
      // flex: 1,
      flexWrap: "wrap",
      gap: 16,

      // marginVertical: 8,
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

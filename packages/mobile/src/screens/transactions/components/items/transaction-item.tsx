import { StyleSheet, TouchableOpacity, View } from "react-native";
import React, { FC } from "react";
import {
  formatContractAddress,
  getDataFromDataEvent,
  getValueFromDataEvents,
  limitString,
  maskedNumber,
} from "@src/utils/helper";
import { useTheme } from "@src/themes/theme-provider";
import { spacing } from "@src/themes";
import { observer } from "mobx-react-lite";
import { Text } from "@src/components/text";
import OWIcon from "@src/components/ow-icon/ow-icon";
import OWText from "@src/components/text/ow-text";
import { CoinPretty, Dec, DecUtils } from "@owallet/unit";
import moment from "moment/moment";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";
import { formatAddress } from "@owallet/common";
import { RightArrowIcon } from "@src/components/icon";
import { useStore } from "@src/stores";

const OWTransactionItem: FC<{
  item: any;
  index: number;
  data: any;
}> = observer(({ item, index, data, ...props }) => {
  const { priceStore, chainStore } = useStore();
  const fiat = priceStore.defaultVsCurrency;
  if (!item) return;
  const currency = chainStore.current.stakeCurrency;

  const amount = new CoinPretty(
    currency,
    new Dec(item.amount).mul(DecUtils.getTenExponentN(currency.coinDecimals))
  );
  const priceAmount = priceStore.calculatePrice(amount, fiat);
  const first =
    index > 0 && moment(data[index - 1].timestamp).format("MMM D, YYYY");
  const now = moment(item.timestamp).format("MMM D, YYYY");
  const { colors } = useTheme();
  const styles = styling(colors);
  return (
    <View style={{ paddingTop: 16 }}>
      {first !== now || index === 0 ? (
        <Text size={14} color={colors["neutral-text-heading"]} weight="600">
          {moment(item.timestamp).format("MMM D, YYYY")}
        </Text>
      ) : null}

      <TouchableOpacity {...props} style={styles.btnItem}>
        <View style={styles.leftBoxItem}>
          <View style={styles.iconWrap}>
            <OWIcon
              type="images"
              source={{ uri: chainStore.current.raw.chainSymbolImageUrl }}
              size={28}
            />
          </View>
          <View style={styles.chainWrap}>
            <OWIcon
              type="images"
              source={{ uri: chainStore.current.raw.chainSymbolImageUrl }}
              size={16}
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
              <Text
                size={16}
                color={colors["neutral-text-heading"]}
                weight="500"
              >
                {/*{item.transactionType === 'incoming' ? "Receive" : "Send"}*/}
                {new Dec(item.amount).gte(new Dec(0)) ? "Received" : "Sent"}
              </Text>
              <Text weight="400" color={colors["neutral-text-body"]}>
                {formatAddress(item.counterAddress)}
              </Text>
            </View>
          </View>
          <View style={styles.rightBoxItem}>
            <View style={{ flexDirection: "row" }}>
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  weight="500"
                  color={
                    new Dec(item.amount).gte(new Dec(0))
                      ? colors["success-text-body"]
                      : colors["neutral-text-title"]
                  }
                >
                  {`${maskedNumber(amount.hideDenom(true).toString(), 0)} ${
                    currency.coinDenom
                  }`}
                </Text>
                <Text style={styles.profit} color={colors["neutral-text-body"]}>
                  {priceAmount.toString()}
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

export default OWTransactionItem;

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
      flex: 1,
      flexWrap: "wrap",
      gap: 16,

      // marginVertical: 8,
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
    },
    active: {
      borderBottomColor: colors["primary-surface-default"],
      borderBottomWidth: 2,
    },
  });
};

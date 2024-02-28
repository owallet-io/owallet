import React, { useCallback } from "react";
import { FunctionComponent } from "react";
import { ActivityIndicator, StyleSheet, View, ViewStyle } from "react-native";
import { Text } from "@src/components/text";
import { RectButton } from "../../../../components/rect-button";
import { spacing, typography } from "../../../../themes";
import {
  convertAmount,
  formatOrai,
  getTransactionValue,
  getTxTypeNew,
  parseIbcMsgTransfer,
} from "../../../../utils/helper";
import moment from "moment";
import { useTheme } from "@src/themes/theme-provider";
// import { Buffer } from 'buffer';

interface TransactionItemProps {
  item: any;
  loading?: boolean;
  type?: string;
  address: string;
  onPress?: () => void;
  containerStyle?: ViewStyle;
}

export const TransactionItem: FunctionComponent<TransactionItemProps> = ({
  item,
  address,
  loading,
  type,
  onPress,
  containerStyle,
}) => {
  const { timestamp } = item || {};
  const { colors } = useTheme();
  const styles = styling(colors);
  const date = moment(timestamp).format("MMM DD, YYYY [at] HH:mm");

  // const { messages } = tx?.body || {};
  // const { title, isPlus, amount, denom, unbond } = getTransactionValue({
  //   data: [
  //     {
  //       type: messages?.[0]?.['@type']
  //     }
  //   ],
  //   address,
  //   logs: item.logs
  // });

  const amountDataCell = useCallback(() => {
    let amount = { amount: 0, denom: "ORAI" };
    if (
      item?.messages?.find(
        (msg) => getTxTypeNew(msg?.["@type"]) === "MsgRecvPacket"
      )
    ) {
      const msg = item?.messages?.find((m) => {
        return getTxTypeNew(m?.["@type"]) === "MsgRecvPacket";
      });

      const msgRec = JSON.parse(
        Buffer.from(msg?.packet?.data, "base64").toString("ascii")
      );
      amount = msgRec;
      // const port = item?.message?.packet?.destination_port;
      // const channel = item?.message?.packet?.destination_channel;
    } else if (
      item?.messages?.find(
        (msg) => getTxTypeNew(msg?.["@type"]) === "MsgTransfer"
      )
    ) {
      if (!item?.raw_log.startsWith("{") || !item?.raw_log.startsWith("[")) {
        return;
      }

      const rawLog = JSON.parse(item?.raw_log ?? {});
      // const rawLogParse = parseIbcMsgTransfer(rawLog);
      // const rawLogDenomSplit = rawLogParse?.denom?.split('/');
      amount = rawLog;
    } else {
      const type = getTxTypeNew(
        item?.messages?.[item?.messages?.length - 1]?.["@type"],
        item?.raw_log,
        item?.result
      );
      const msg = item?.messages?.find(
        (msg) => getTxTypeNew(msg?.["@type"]) === type
      );

      amount = msg?.amount?.length > 0 ? msg?.amount[0] : msg?.amount ?? {};
    }

    return (
      <Text
        style={{
          ...styles.textAmount,
          marginTop: spacing["8"],
          textTransform: "uppercase",
          color:
            getTxTypeNew(item?.messages?.[0]?.["@type"]) === "MsgSend" &&
            item?.messages?.[0]?.from_address &&
            address === item?.messages?.[0]?.from_address
              ? colors["red-500"]
              : colors["green-500"],
        }}
      >
        {getTxTypeNew(item?.messages?.[0]?.["@type"]) === "MsgSend" &&
        item?.messages?.[0]?.from_address &&
        address === item?.messages?.[0]?.from_address
          ? "-"
          : "+"}
        {amount && !amount?.denom?.startsWith("u")
          ? `${formatOrai(amount.amount ?? 0)} ${amount.denom ?? ""}`
          : `${formatOrai(amount.amount ?? 0)} ${
              amount.denom ? amount.denom?.substring(1) : ""
            }`}
      </Text>
    );
  }, [item]);

  const renderChildren = () => {
    return type === "cw20" ? (
      <View
        style={{
          ...styles.innerButton,
          flex: 1,
        }}
      >
        <View>
          <Text
            style={{
              ...styles.textInfo,
            }}
          >
            {item.name}
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            alignItems: "flex-end",
          }}
        >
          <Text
            style={{
              ...styles.textInfo,
              color: colors["gray-300"],
            }}
          >
            {moment(item.transaction_time).format("MMM DD, YYYY - HH:mm")}
          </Text>
          <Text
            style={{
              ...styles.textAmount,
              marginTop: spacing["8"],
              textTransform: "uppercase",
              color: colors["label"],
            }}
          >
            {/* {amount == 0 || title === 'Received Token' || title === 'Reward'
            ? '+'
            : '-'} */}
            {formatOrai(item.amount ?? 0, item.decimal)} {item.symbol}
          </Text>
        </View>
      </View>
    ) : (
      <View
        style={{
          ...styles.innerButton,
          flex: 1,
        }}
      >
        <View>
          <Text
            style={{
              ...styles.textInfo,
            }}
          >
            {getTxTypeNew(
              item?.messages?.[item?.messages?.length - 1]?.["@type"],
              item?.raw_log,
              item?.result
            )}
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            alignItems: "flex-end",
          }}
        >
          <Text
            style={{
              ...styles.textInfo,
              color: colors["gray-300"],
            }}
          >
            {date}
          </Text>
          {amountDataCell()}
        </View>
      </View>
    );
  };

  return loading ? (
    <ActivityIndicator />
  ) : (
    <RectButton
      style={{
        ...styles.container, // default style for container
        ...containerStyle,
      }}
      onPress={onPress}
    >
      {renderChildren()}
    </RectButton>
  );
};

const styling = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      marginLeft: spacing["24"],
      marginRight: spacing["24"],
      borderRadius: spacing["8"],
      backgroundColor: colors["sub-primary"],
      marginTop: spacing["4"],
      marginBottom: spacing["8"],
    },
    textInfo: {
      ...typography.h7,
      color: colors["primary-text"],
      fontWeight: "600",
      maxWidth: 200,
    },
    textAmount: {
      ...typography.h6,
      fontWeight: "800",
    },
    innerButton: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: spacing["8"],
      marginHorizontal: spacing["16"],
    },
  });

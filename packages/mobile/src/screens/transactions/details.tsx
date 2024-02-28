import React, { FunctionComponent, useCallback } from "react";
import { StyleSheet, TouchableOpacity, View, Clipboard } from "react-native";
// import { Divider } from '@rneui/base';
import { Text } from "@src/components/text";
import { RectButton } from "react-native-gesture-handler";
import { CheckIcon, CopyTransactionIcon } from "../../components/icon";
import { PageWithScrollView } from "../../components/page";
import { useStyle } from "../../styles";
import { TransactionSectionTitle } from "./components";
import { colors, metrics, spacing, typography } from "../../themes";
import {
  formatContractAddress,
  formatOrai,
  getTxTypeNew,
} from "../../utils/helper";
import { useTheme } from "@src/themes/theme-provider";
import { useRoute, RouteProp } from "@react-navigation/native";
import moment from "moment";
import { useSimpleTimer } from "../../hooks";
interface TransactionInfo {
  label: string;
  value: string;
}
interface TransactionDetail {
  amount: string;
  type?: string;
  result: "Success" | "Fail";
  height: number | string;
  size: number | string;
  gas: number | string;
  time: string;
}

const bindStyleTxInfo = (
  label: string,
  value: string
): { color?: string; textTransform?: string; fontWeight?: string } => {
  const { colors } = useTheme();
  switch (label) {
    case "Transaction hash":
      return {
        color: colors["primary-surface-default"],
        textTransform: "uppercase",
      };
    case "Fee":
      return {
        color: colors["primary-surface-default"],
        textTransform: "uppercase",
      };
    case "Amount":
      return value?.includes("-")
        ? {
            color: colors["red-500"],
            fontWeight: "800",
            textTransform: "uppercase",
          }
        : {
            color: colors["green-500"],
            fontWeight: "800",
            textTransform: "uppercase",
          };
    default:
      return { color: colors["text-title-login"] };
  }
};

const bindValueTxInfo = (label: string, value: string) => {
  switch (label) {
    case "Transaction hash":
    case "From":
    case "To":
      return formatContractAddress(value ?? "");

    default:
      return value;
  }
};

const InfoItems: FunctionComponent<{
  label: string;
  value: string;
  topBorder?: boolean;
  title?: string;
  onPress?: () => void;
}> = ({ label, value, topBorder, title }) => {
  const style = useStyle();
  const { colors } = useTheme();
  const styles = styling(colors);
  const { isTimedOut, setTimer } = useSimpleTimer();
  const renderChildren = () => {
    return (
      <View style={styles.containerDetailVertical}>
        <View
          style={{
            flex: 1,
          }}
        >
          <Text
            style={{
              color: colors["primary-text"],
              ...typography.h7,
            }}
          >
            {label}
          </Text>
          <Text
            style={{
              ...bindStyleTxInfo(label, value),
              marginTop: spacing["2"],
              ...typography.body2,
            }}
          >
            {value
              ? value?.length > 20
                ? formatContractAddress(value)
                : value
              : 0}
            {/* {label !== 'Amount'
              ? bindValueTxInfo(label, value)
              : (title === 'Received Token' ? '+' : '-') +
                bindValueTxInfo(label, value)} */}
          </Text>
        </View>
        {label !== "Amount" && (
          <View
            style={{
              flex: 1,
              alignItems: "flex-end",
            }}
          >
            {isTimedOut ? (
              <View style={{ width: 30, height: 30 }}>
                <CheckIcon />
              </View>
            ) : (
              <TouchableOpacity
                style={{ width: 30, height: 30 }}
                onPress={() => {
                  Clipboard.setString(value?.trim());
                  setTimer(2000);
                }}
              >
                <CopyTransactionIcon size={20} />
              </TouchableOpacity>
            )}
          </View>
        )}
        <View />
      </View>
    );
  };

  return (
    <View
      style={{
        paddingHorizontal: spacing["20"],
      }}
    >
      <View
        style={[
          StyleSheet.flatten([
            style.flatten([
              "height-62",
              "flex-row",
              "items-center",
              "padding-x-20",
              "background-color-white",
            ]),
          ]),
          {
            backgroundColor: colors["background-box"],
          },
        ]}
      >
        {renderChildren()}
      </View>
      {/* <Divider /> */}
    </View>
  );
};

const DetailItems: FunctionComponent<{
  label: string;
  value: string;
  topBorder?: boolean;
  onPress?: () => void;
}> = ({ label, onPress, value, topBorder }) => {
  const style = useStyle();
  const { colors } = useTheme();
  const styles = styling(colors);
  const renderChildren = () => {
    return (
      <>
        <View
          style={[
            styles.containerDetailHorizontal,
            {
              backgroundColor: colors["background-box"],
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors["primary-text"],
                ...typography.h7,
              }}
            >
              {label}
            </Text>
          </View>

          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text
              style={{
                ...bindStyleTxInfo(label, value),
                ...typography.body2,
                color:
                  value === "Success"
                    ? colors["green-500"]
                    : value === "Failed"
                    ? colors["red-500"]
                    : colors["text-title-login"],
              }}
            >
              {bindValueTxInfo(label, value)}
            </Text>
          </View>
          <View />
        </View>
      </>
    );
  };

  return (
    <View
      style={{
        paddingHorizontal: spacing["20"],
      }}
    >
      <RectButton
        style={[
          StyleSheet.flatten([
            style.flatten([
              "height-62",
              "flex-row",
              "items-center",
              "padding-x-20",
              "background-color-white",
            ]),
          ]),
          {
            backgroundColor: colors["background-box"],
          },
        ]}
        onPress={onPress}
      >
        {renderChildren()}
      </RectButton>
      {/* <Divider /> */}
    </View>
  );
};

export const TransactionDetail: FunctionComponent<any> = () => {
  const style = useStyle();
  const { colors } = useTheme();
  const styles = styling(colors);
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          item: any;
          type: string;
        }
      >,
      string
    >
  >();

  const { item, type } = route.params || {};

  const { tx_hash, tx, timestamp, gas_used, gas_wanted, height, code }: any =
    item || {};

  const amountDataCell = useCallback(() => {
    let amount = { amount: 0, denom: "ORAI" };
    let msg = item?.messages?.find(
      (msg) => getTxTypeNew(msg?.["@type"]) === "MsgRecvPacket"
    );
    if (msg) {
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
      if (!item?.raw_log?.startsWith("{") || !item?.raw_log?.startsWith("[")) {
        return;
      }
      const rawLog = JSON.parse(item?.raw_log ?? {});
      // const rawLogParse = parseIbcMsgTransfer(rawLog);
      // const rawLogDenomSplit = rawLogParse?.denom?.split('/');
      amount = rawLog;
    } else {
      const type = getTxTypeNew(
        item.messages?.[item?.messages?.length - 1]?.["@type"],
        item?.raw_log,
        item?.result
      );
      const msg = item?.messages?.find(
        (msg) => getTxTypeNew(msg?.["@type"]) === type
      );

      amount = msg?.amount?.length > 0 ? msg?.amount[0] : msg?.amount ?? {};
    }
    const prefix =
      getTxTypeNew(item?.messages?.[0]?.["@type"]) === "MsgSend" &&
      item?.messages?.[0]?.from_address &&
      item.address === item.messages?.[0]?.from_address
        ? "-"
        : "+";

    return amount && !amount?.denom?.startsWith("u")
      ? `${prefix} ${formatOrai(amount.amount ?? 0)} ${amount.denom ?? ""}`
      : `${prefix} ${formatOrai(amount.amount ?? 0)} ${
          amount.denom ? amount.denom?.substring(1) : ""
        }`;
  }, [item]);

  const date = moment(timestamp).format("MMM DD, YYYY [at] HH:mm");
  // const { messages } = tx?.body || {};
  const title =
    type === "cw20"
      ? item.name
      : getTxTypeNew(
          item?.messages?.[item?.messages?.length - 1]?.["@type"],
          item?.raw_log,
          item?.result
        );
  // const { title, isPlus, amount, denom, unbond } = getTransactionValue({
  //   data: [
  //     {
  //       type: messages?.[0]?.['@type']
  //     }
  //   ],
  //   address: route.params?.item?.address,
  //   logs: route.params?.item?.logs
  // });

  const txAddresses = () => {
    if (type === "cw20") {
      return [
        {
          label: "Contract",
          value: item?.contract_address,
        },
        {
          label: "Sender",
          value: item?.sender,
        },
        {
          label: "Receiver",
          value: item?.receiver,
        },
      ];
    }
    if (title.includes("MsgExecuteContract")) {
      return [
        {
          label: "Contract",
          value: item?.messages?.[0]?.contract,
        },
        {
          label: "Sender",
          value: item?.messages?.[0]?.sender,
        },
      ];
    }
    switch (title) {
      case "MsgSend":
        return [
          {
            label: "From",
            value: item?.messages?.[0]?.from_address,
          },
          {
            label: "To",
            value: item?.messages?.[0]?.to_address,
          },
        ];

      case "MsgRecvPacket":
        return [
          {
            label: "Signer",
            value: item?.messages?.[0]?.signer,
          },
        ];
      case "MsgVote":
        return [
          {
            label: "Voter",
            value: item?.messages?.[0]?.voter,
          },
        ];
      case "MsgSubmitProposal":
        return [
          {
            label: "Proposer",
            value: item?.messages?.[0]?.proposer,
          },
        ];
      default:
        return [
          {
            label: "Delegator address",
            value: item?.messages?.[0]?.delegator_address,
          },
          {
            label: "Validator address",
            value: item?.messages?.[0]?.validator_address,
          },
        ];
    }
  };

  const txInfos: TransactionInfo[] = [
    ...txAddresses(),
    {
      label: "Transaction hash",
      value: tx_hash,
    },
    {
      label: "Amount",
      value:
        type === "cw20"
          ? `${formatOrai(item?.amount ?? 0, item?.decimal ?? 6)} ${
              item.symbol ?? ""
            }`
          : amountDataCell(),
    },
  ];

  const txDetail: TransactionInfo[] = [
    {
      label: "Msg",
      value: title,
    },
    {
      label: "Result",
      value: code === 0 || item?.status_code === 0 ? "Success" : "Failed",
    },
    {
      label: "Block height",
      value: type === "cw20" ? "None" : height,
    },
    {
      label: "Fee",
      value: item?.fee?.amount
        ? `${formatOrai(item.fee.amount?.[0]?.amount || 0)} ${
            item.fee.amount?.[0]?.denom
          }`
        : 0,
    },
    // {
    //   label: 'Amount',
    //   value: amountDataCell()
    // },
    {
      label: "Time",
      value:
        type === "cw20"
          ? moment(item?.transaction_time).format("MMM DD, YYYY [at] HH:mm")
          : date,
    },
  ];

  return (
    <PageWithScrollView backgroundColor={colors["background"]}>
      {/* <View style={styles.containerTitle}>
        <Text style={styles.textTitle}>Transaction Detail</Text>
      </View> */}
      <TransactionSectionTitle title={title} right={<></>} />
      <View>
        {txInfos.map((item, index) => (
          <InfoItems
            key={index}
            label={item.label}
            topBorder={true}
            value={item.value}
            title={title}
          />
        ))}
      </View>
      <TransactionSectionTitle title={"Detail"} right={<></>} />

      <View>
        {txDetail.map(({ label, value }: TransactionInfo, index: number) => (
          <DetailItems
            key={index}
            label={label}
            topBorder={true}
            value={value}
          />
        ))}
      </View>

      <View style={style.flatten(["height-1", "margin-y-20"])} />
    </PageWithScrollView>
  );
};

const styling = (colors) =>
  StyleSheet.create({
    container: {},
    containerTitle: {
      paddingHorizontal: spacing["20"],
      paddingVertical: spacing["16"],
      backgroundColor: colors["primary"],
    },
    textTitle: {
      ...typography.h3,
      color: colors["primary-text"],
      lineHeight: 34,
      fontWeight: "bold",
    },
    containerDetailVertical: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: metrics.screenWidth - 40,
    },
    containerDetailHorizontal: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: metrics.screenWidth - 40,
    },
    textParagraph: {},
  });

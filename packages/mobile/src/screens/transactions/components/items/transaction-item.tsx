import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import {
  formatContractAddress,
  getDataFromDataEvent,
  getValueFromDataEvents,
  limitString,
} from "@src/utils/helper";
import { useTheme } from "@src/themes/theme-provider";
import { spacing } from "@src/themes";
import { observer } from "mobx-react-lite";
import { Text } from "@src/components/text";
import OWIcon from "@src/components/ow-icon/ow-icon";

const OWTransactionItem = observer(
  ({ item, time, ...props }: IOWTransactionItem) => {
    const itemEvents = item.transfers && getValueFromDataEvents(item.transfers);
    const itemTransfer = getDataFromDataEvent(itemEvents);
    const { colors } = useTheme();
    const styles = styling();
    return (
      <TouchableOpacity {...props}>
        <View style={styles.item}>
          <View style={[styles.flexRow, { paddingBottom: 5 }]}>
            <Text color={colors["title-modal-login-failed"]} size={12}>
              {formatContractAddress(item?.txHash, 5)}
            </Text>
            {!!itemTransfer?.typeEvent ? (
              <Text
                variant="body2"
                typo="regular"
                color={colors["title-modal-login-failed"]}
              >
                <Text color={colors["green-500"]}>
                  {item?.countTypeEvent > 0 ? `+${item?.countTypeEvent}` : null}
                </Text>{" "}
                {limitString(itemTransfer?.typeEvent, 14)}
                <View style={styles.iconstyle}>
                  <OWIcon
                    size={12}
                    color={
                      item?.status === "success"
                        ? colors["green-500"]
                        : item?.status === "pending"
                        ? colors["primary-surface-default"]
                        : colors["orange-800"]
                    }
                    name={
                      item?.status === "success"
                        ? "check_stroke"
                        : item?.status === "pending"
                        ? "history-1"
                        : "close_shape"
                    }
                  />
                </View>
              </Text>
            ) : (
              <View
                style={{
                  flexDirection: "row",
                }}
              >
                <Text>--</Text>
                <View style={styles.iconstyle}>
                  <OWIcon
                    size={12}
                    color={
                      item?.status === "success"
                        ? colors["green-500"]
                        : colors["orange-800"]
                    }
                    name={
                      item?.status === "success"
                        ? "check_stroke"
                        : "close_shape"
                    }
                  />
                </View>
              </View>
            )}
          </View>
          <View style={styles.flexRow}>
            <Text
              variant="body1"
              typo="bold"
              weight={"500"}
              size={13}
              color={
                itemTransfer?.amount &&
                itemTransfer?.isPlus &&
                !itemTransfer?.isMinus
                  ? colors["green-500"]
                  : itemTransfer?.amount &&
                    itemTransfer?.isMinus &&
                    !itemTransfer?.isPlus
                  ? colors["orange-800"]
                  : colors["title-modal-login-failed"]
              }
              style={
                itemTransfer?.amount &&
                (itemTransfer?.isPlus || itemTransfer?.isMinus) &&
                styles.amount
              }
            >
              {`${
                itemTransfer?.amount &&
                itemTransfer?.isPlus &&
                !itemTransfer?.isMinus
                  ? "+"
                  : itemTransfer?.amount &&
                    itemTransfer?.isMinus &&
                    !itemTransfer?.isPlus
                  ? "-"
                  : ""
              }${itemTransfer?.amount || 0}`}{" "}
              {limitString(itemTransfer?.token, 14)}
            </Text>
            <Text style={styles.timeStyle} color={colors["blue-300"]}>
              {item?.time?.timeShort || `Height ${item?.height}`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);

export default OWTransactionItem;

const styling = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    flexRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    amount: {
      marginLeft: -8,
      // textTransform: 'uppercase'
    },
    flex: {
      flex: 1,
    },
    timeStyle: {
      // paddingTop: 8
    },
    iconstyle: {
      paddingLeft: 8,
    },
    centerItem: {
      justifyContent: "center",
      alignItems: "flex-end",
      flex: 1.3,
    },
    item: {
      // flexDirection: 'row',
      // justifyContent: 'space-between',
      paddingHorizontal: spacing["page-pad"],
      height: 65,
      backgroundColor: colors["background-item-list"],
      marginVertical: 8,
      justifyContent: "center",
      borderRadius: 8,
    },
  });
};

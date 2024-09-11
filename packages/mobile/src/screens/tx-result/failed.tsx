import React, { FunctionComponent, useEffect } from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import _ from "lodash";
import { View, Image, ScrollView, StyleSheet } from "react-native";

import { useTheme } from "@src/themes/theme-provider";
import { capitalizedText, formatContractAddress } from "@src/utils/helper";

import { PageHeader } from "@src/components/header/header-new";

import ItemReceivedToken from "@src/screens/transactions/components/item-received-token";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import OWText from "@src/components/text/ow-text";
import OWButtonGroup from "@src/components/button/OWButtonGroup";

import OWIcon from "@src/components/ow-icon/ow-icon";
import { AppCurrency, StdFee } from "@owallet/types";
import { CoinPrimitive } from "@owallet/stores";
import { CoinPretty, Dec } from "@owallet/unit";
import { HeaderTx } from "@src/screens/tx-result/components/header-tx";
import { resetTo } from "@src/router/root";
import { SCREENS } from "@src/common/constants";

export const TxFailedResultScreen: FunctionComponent = observer(() => {
  const { chainStore, priceStore } = useStore();

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
          // Hex encoded bytes.
          txHash: string;
          data?: {
            memo: string;
            fee: StdFee;
            fromAddress: string;
            toAddress: string;
            amount: CoinPrimitive;
            currency: AppCurrency;
          };
        }
      >,
      string
    >
  >();

  const { current } = chainStore;
  const chainId = current.chainId;
  const { params } = route;

  const { colors, images } = useTheme();

  const chainInfo = chainStore.getChain(chainId);

  const onDone = () => {
    resetTo(SCREENS.STACK.MainTab);
  };

  const amount = new CoinPretty(
    params?.data?.currency,
    new Dec(params?.data?.amount?.amount)
  );
  const fee = params?.data?.fee?.amount?.[0]?.amount
    ? new CoinPretty(
        chainInfo.stakeCurrency,
        new Dec(params?.data?.fee?.amount?.[0]?.amount)
      )
    : new CoinPretty(chainInfo.stakeCurrency, new Dec(0));
  const dataItem =
    params?.data &&
    _.pickBy(params?.data, function (value, key) {
      return (
        key !== "memo" &&
        key !== "fee" &&
        key !== "amount" &&
        key !== "currency" &&
        key !== "type"
      );
    });
  const styles = styling(colors);
  return (
    <PageWithBottom
      bottomGroup={
        <View style={styles.containerBottomButton}>
          <OWButtonGroup
            labelApprove={"Retry"}
            labelClose={"Contact Us"}
            iconClose={<OWIcon name={"send"} />}
            styleApprove={{
              borderRadius: 99,
              backgroundColor: colors["primary-surface-default"],
            }}
            // onPressClose={_onPressReject}
            onPressApprove={onDone}
            styleClose={{
              borderRadius: 99,
              backgroundColor: colors["neutral-surface-action3"],
            }}
          />
        </View>
      }
    >
      <View style={styles.containerBox}>
        <PageHeader title={"Transaction details"} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <HeaderTx
            type={capitalizedText(params?.data?.type) || "Send"}
            imageType={
              <View style={styles.containerFailed}>
                <OWText
                  weight={"500"}
                  size={14}
                  color={colors["error-text-body"]}
                >
                  Failed
                </OWText>
              </View>
            }
            amount={`${params?.data?.type === "send" ? "-" : ""}${amount
              ?.shrink(true)
              ?.trim(true)
              ?.toString()}`}
            price={priceStore.calculatePrice(amount)?.toString()}
          />
          <View style={styles.cardBody}>
            {dataItem &&
              Object.keys(dataItem).map(function (key) {
                return (
                  <ItemReceivedToken
                    label={capitalizedText(key)}
                    valueDisplay={
                      dataItem?.[key] &&
                      formatContractAddress(dataItem?.[key], 20)
                    }
                    value={dataItem?.[key]}
                  />
                );
              })}
            <ItemReceivedToken
              label={"Fee"}
              valueDisplay={`${fee
                ?.shrink(true)
                ?.trim(true)
                ?.toString()} (${priceStore.calculatePrice(fee)})`}
              btnCopy={false}
            />
            <ItemReceivedToken
              label={"Memo"}
              valueDisplay={params?.data?.memo || "-"}
              btnCopy={false}
            />
          </View>
        </ScrollView>
      </View>
    </PageWithBottom>
  );
});
const styling = (colors) => {
  return StyleSheet.create({
    containerFailed: {
      backgroundColor: colors["error-surface-subtle"],
      width: "100%",
      paddingHorizontal: 12,
      paddingVertical: 2,
      borderRadius: 99,
      alignSelf: "center",
    },
    containerBottomButton: {
      width: "100%",
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    btnApprove: {
      borderRadius: 99,
      backgroundColor: colors["primary-surface-default"],
    },
    cardBody: {
      padding: 16,
      borderRadius: 24,
      marginHorizontal: 16,
      backgroundColor: colors["neutral-surface-card"],
    },
    viewNetwork: {
      flexDirection: "row",
      paddingTop: 6,
    },
    imgNetwork: {
      height: 20,
      width: 20,
      backgroundColor: colors["neutral-icon-on-dark"],
    },
    containerBox: {
      flex: 1,
    },
    txtPending: {
      textAlign: "center",
      paddingVertical: 16,
    },
    txtViewOnExplorer: {
      fontSize: 14,
      fontWeight: "600",
      color: colors["neutral-text-action-on-dark-bg"],
    },
    btnExplorer: {
      borderRadius: 99,
    },
  });
};

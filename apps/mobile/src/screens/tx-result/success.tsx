import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import {
  View,
  Image,
  ScrollView,
  InteractionManager,
  StyleSheet,
} from "react-native";
import { Text } from "@src/components/text";

import { useTheme } from "@src/themes/theme-provider";
import {
  capitalizedText,
  formatContractAddress,
  openLink,
} from "../../utils/helper";
import {
  ChainIdentifierToTxExplorerMap,
  ChainIdEnum,
  TRON_ID,
} from "@owallet/common";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import OWButtonGroup from "@src/components/button/OWButtonGroup";

import OWText from "@src/components/text/ow-text";
import ItemReceivedToken from "@src/screens/transactions/components/item-received-token";
import { CoinPretty, Dec } from "@owallet/unit";
import { AppCurrency, StdFee } from "@owallet/types";
import { CoinPrimitive } from "@owallet/stores";
import _ from "lodash";
import { HeaderTx } from "@src/screens/tx-result/components/header-tx";
import OWButtonIcon from "@src/components/button/ow-button-icon";
import { resetTo } from "@src/router/root";
import { SCREENS } from "@src/common/constants";
import { ChainIdHelper } from "@owallet/cosmos";

export const TxSuccessResultScreen: FunctionComponent = observer(() => {
  const { chainStore, priceStore, txsStore, accountStore, keyRingStore } =
    useStore();
  const { colors, images } = useTheme();
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
          // Hex encoded bytes.
          txHash?: string;
          data?: {
            memo: string;
            fee: CoinPretty;
            fromAddress: string;
            toAddress: string;
            amount: CoinPretty;
            type: string;
          };
        }
      >,
      string
    >
  >();

  const { current } = chainStore;
  const chainId = route.params.chainId || current.chainId;

  const { params } = route;
  const txHash = params?.txHash;

  const chainInfo = chainStore.getChain(chainId);
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
  const zeroCoin = new CoinPretty(chainInfo.feeCurrencies[0], new Dec(0));
  const txExplorer = useMemo(() => {
    return ChainIdentifierToTxExplorerMap[
      ChainIdHelper.parse(chainId).identifier
    ];
  }, [chainId]);
  const handleUrl = (txHash) => {
    return (chainInfo.txExplorer || txExplorer)?.txUrl.replace(
      "{txHash}",
      chainInfo.features.includes("btc") ||
        chainInfo.features.includes("oasis") ||
        chainInfo.features.includes("tron") ||
        chainId?.includes("eip155")
        ? txHash.toLowerCase()
        : txHash.toUpperCase()
    );
  };
  const handleOnExplorer = async () => {
    if ((chainInfo?.txExplorer || txExplorer) && txHash) {
      const url = handleUrl(txHash);
      await openLink(url);
    }
  };

  const amount = params?.data?.amount || zeroCoin;
  const fee = params?.data?.fee || zeroCoin;

  const onDone = () => {
    resetTo(SCREENS.STACK.MainTab);
  };
  const styles = styling(colors);
  return (
    <PageWithBottom
      bottomGroup={
        <View style={styles.containerBottomButton}>
          <OWButtonGroup
            labelApprove={"Done"}
            labelClose={"View on Explorer"}
            styleApprove={styles.btnApprove}
            onPressClose={handleOnExplorer}
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
        {/*<PageHeader title={"Transaction details"} />*/}
        <ScrollView showsVerticalScrollIndicator={false}>
          <HeaderTx
            type={capitalizedText(params?.data?.type) || "Send"}
            imageType={
              <View style={styles.containerSuccess}>
                <OWText
                  weight={"500"}
                  size={14}
                  color={colors["highlight-text-title"]}
                >
                  Success
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
              label={"Network"}
              valueDisplay={
                <View style={styles.viewNetwork}>
                  {chainInfo?.chainSymbolImageUrl && (
                    <Image
                      style={styles.imgNetwork}
                      source={{
                        uri: chainInfo?.chainSymbolImageUrl,
                      }}
                    />
                  )}
                  <Text
                    size={16}
                    color={colors["neutral-text-body"]}
                    weight={"400"}
                    style={{
                      paddingLeft: 3,
                    }}
                  >
                    {chainInfo?.chainName}
                  </Text>
                </View>
              }
              btnCopy={false}
            />
            <ItemReceivedToken
              label={"Fee"}
              valueDisplay={`${fee?.shrink(true)?.trim(true)?.toString()} (${
                priceStore.calculatePrice(fee) || "$0"
              })`}
              btnCopy={false}
            />
            {/*<ItemReceivedToken*/}
            {/*    label={"Time"}*/}
            {/*    valueDisplay={data?.time?.timeLong}*/}
            {/*    btnCopy={false}*/}
            {/*/>*/}
            <ItemReceivedToken
              label={"Memo"}
              valueDisplay={params?.data?.memo || "-"}
              btnCopy={false}
            />
            <ItemReceivedToken
              label={"Hash"}
              valueDisplay={formatContractAddress(txHash)}
              value={txHash}
              btnCopy={true}
              IconRightComponent={
                <View>
                  <OWButtonIcon
                    name="tdesignjump"
                    sizeIcon={20}
                    fullWidth={false}
                    onPress={handleOnExplorer}
                    colorIcon={colors["neutral-text-action-on-light-bg"]}
                  />
                </View>
              }
            />
          </View>
        </ScrollView>
      </View>
    </PageWithBottom>
  );
});

const styling = (colors) => {
  return StyleSheet.create({
    containerSuccess: {
      backgroundColor: colors["highlight-surface-subtle"],
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
      borderRadius: 20,
      backgroundColor: colors["neutral-icon-on-dark"],
    },
    containerBox: {
      flex: 1,
    },
  });
};

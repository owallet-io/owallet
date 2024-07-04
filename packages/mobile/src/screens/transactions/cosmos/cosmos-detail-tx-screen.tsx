import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useTheme } from "@src/themes/theme-provider";
import { StyleSheet, View, Image, RefreshControl } from "react-native";
import OWText from "@src/components/text/ow-text";
import { useStore } from "@src/stores";
import { OWButton } from "@src/components/button";
import { metrics } from "@src/themes";
import { ScrollView } from "react-native-gesture-handler";
import { API } from "@src/common/api";
import {
  capitalizedText,
  formatContractAddress,
  MapNetworkToChainId,
  maskedNumber,
  openLink,
  shortenAddress,
} from "@src/utils/helper";
import moment from "moment";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import { HeaderTx } from "@src/screens/tx-result/components/header-tx";
import ItemReceivedToken from "@src/screens/transactions/components/item-received-token";
import { Text } from "@src/components/text";
import OWButtonIcon from "@src/components/button/ow-button-icon";
import { ChainIdEnum, isMilliseconds, OasisNetwork } from "@owallet/common";

import { CoinPretty, Dec, DecUtils, Int } from "@owallet/unit";
import { OwLoading } from "@src/components/owallet-loading/ow-loading";

import { Currency } from "@owallet/types";

import { urlTxHistory } from "@src/common/constants";
import { OWEmpty } from "@src/components/empty";
import { CosmosItem } from "@src/screens/transactions/cosmos/types";
import { AllNetworkItemTx } from "@src/screens/transactions/all-network/all-network.types";

export const CosmosDetailTx: FunctionComponent = observer((props) => {
  const { chainStore, priceStore } = useStore();

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          item: AllNetworkItemTx;
          currency: Currency;
        }
      >,
      string
    >
  >();
  const [detail, setDetail] = useState<CosmosItem>();
  const [loading, setLoading] = useState(false);

  const { item, currency } = route.params;
  const { txhash: hash, network: chain } = item;

  const getHistoryDetail = async () => {
    try {
      setLoading(true);
      const { status, data } = await API.getDetailCosmosTx(
        {
          hash,
          network: chain as ChainIdEnum,
        },
        {
          baseURL: urlTxHistory,
        }
      );
      if (status !== 200) throw Error("Failed");
      setDetail(data);

      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log("getHistoryDetail err", err);
    }
  };

  useEffect(() => {
    getHistoryDetail();
  }, [hash]);
  const { colors } = useTheme();

  const styles = useStyles(colors);

  if (loading) return <OwLoading />;
  if (!detail) return <OWEmpty />;
  const chainInfo = chainStore.getChain(MapNetworkToChainId[item?.network]);
  const handleUrl = (txHash) => {
    return chainInfo.raw.txExplorer.txUrl.replace("{txHash}", txHash);
  };
  const handleOnExplorer = async () => {
    if (chainInfo.raw.txExplorer && hash) {
      const url = handleUrl(hash);
      await openLink(url);
    }
  };

  const fee = new CoinPretty(chainInfo.stakeCurrency, new Dec(item.fee[0]));
  const amount = new CoinPretty(currency, new Dec(item.amount[0]));

  const onRefresh = () => {
    getHistoryDetail();
  };
  const isSent =
    item.userAddress === item.fromAddress ||
    item.fromAddress === item.toAddress;
  const method = isSent ? "Sent" : "Received";
  return (
    <PageWithBottom
      style={{
        paddingTop: 0,
      }}
      backgroundColor={colors["neutral-surface-bg"]}
      bottomGroup={
        <View style={styles.containerBottomButton}>
          <OWButton
            style={styles.btnApprove}
            label={"View on Explorer"}
            onPress={handleOnExplorer}
          />
        </View>
      }
    >
      <View style={styles.containerBox}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          <HeaderTx
            type={method}
            colorAmount={
              !isSent
                ? colors["success-text-body"]
                : colors["neutral-text-title"]
            }
            imageType={
              <View
                style={[
                  styles.containerSuccess,
                  {
                    backgroundColor:
                      detail.code != 0
                        ? colors["error-surface-subtle"]
                        : colors["highlight-surface-subtle"],
                  },
                ]}
              >
                <OWText
                  weight={"500"}
                  size={14}
                  color={
                    detail.code != 0
                      ? colors["error-text-body"]
                      : colors["highlight-text-title"]
                  }
                >
                  {detail.code != 0 ? "Failed" : "Success"}
                </OWText>
              </View>
            }
            amount={`${!isSent ? "+" : "-"}${maskedNumber(
              amount.hideDenom(true).toString()
            )} ${currency.coinDenom}`}
            toAmount={null}
            price={priceStore
              .calculatePrice(amount)
              .toString()
              .replace("-", "")}
          />
          <View style={styles.cardBody}>
            <ItemReceivedToken
              label={capitalizedText("From")}
              valueDisplay={shortenAddress(item.fromAddress)}
              value={item.fromAddress}
              colorIconRight={colors["neutral-text-action-on-light-bg"]}
            />
            <ItemReceivedToken
              label={capitalizedText("To")}
              valueDisplay={shortenAddress(item.toAddress)}
              value={item.toAddress}
              colorIconRight={colors["neutral-text-action-on-light-bg"]}
            />
            <ItemReceivedToken
              label={"From Network"}
              valueDisplay={
                <View style={styles.viewNetwork}>
                  <Image
                    style={styles.imgNetwork}
                    source={{
                      uri: chainInfo.stakeCurrency.coinImageUrl,
                    }}
                  />
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
              valueDisplay={`${fee
                .trim(true)
                .maxDecimals(6)
                .toString()} (${priceStore.calculatePrice(fee).toString()})`}
              btnCopy={false}
            />
            <ItemReceivedToken
              label={"Time"}
              valueDisplay={moment(
                isMilliseconds(item.timestamp)
                  ? item.timestamp
                  : item.timestamp * 1000
              ).format("MMM D, YYYY [at] HH:mm")}
              btnCopy={false}
            />

            <ItemReceivedToken
              label={"Hash"}
              valueDisplay={formatContractAddress(hash)}
              value={hash}
              btnCopy={false}
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

const useStyles = (colors) => {
  return StyleSheet.create({
    padIcon: {
      width: 22,
      height: 22,
    },
    wrapper: {
      alignItems: "center",
      justifyContent: "center",
      paddingBottom: 160,
    },
    wrapperDetail: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottomColor: colors["neutral-border-default"],
      borderBottomWidth: 1,
      paddingVertical: 8,
    },
    container: {
      paddingTop: metrics.screenHeight / 14,
      height: "100%",
      backgroundColor: colors["neutral-surface-bg2"],
    },
    signIn: {
      width: "100%",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: colors["neutral-border-default"],
      padding: 16,
      position: "absolute",
      bottom: 30,
      paddingVertical: 12,
      backgroundColor: colors["neutral-surface-card"],
    },
    aic: {
      alignItems: "center",
      paddingBottom: 20,
    },
    rc: {
      flexDirection: "row",
      alignItems: "center",
    },
    goBack: {
      backgroundColor: colors["neutral-surface-card"],
      borderRadius: 999,
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      paddingHorizontal: 16,
      paddingTop: 24,
    },
    input: {
      width: metrics.screenWidth - 32,
      borderColor: colors["neutral-border-strong"],
    },
    textInput: { fontWeight: "600", paddingLeft: 4, fontSize: 15 },
    txDetail: {
      backgroundColor: colors["neutral-surface-card"],
      width: metrics.screenWidth - 32,
      borderRadius: 24,
      marginTop: 1,
      padding: 16,
    },
    status: {
      backgroundColor: colors["highlight-surface-subtle"],
      paddingHorizontal: 12,
      paddingVertical: 2,
      borderRadius: 12,
      marginBottom: 10,
    },
    headerCard: {
      backgroundColor: colors["neutral-surface-card"],
      width: metrics.screenWidth - 32,
      borderRadius: 24,
      position: "relative",
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
      overflow: "hidden",
    },
    containerSuccess: {
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
    },
    containerBox: {
      flex: 1,
    },
  });
};

export interface RootTxDetail {
  code: number;
  data: DataTxDetail;
}

export interface DataTxDetail {
  txHash: string;
  timestamp: number;
  time: number;
  height: number;
  fee: any;
  nonce: number;
  method: string;
  from: string;
  to: string;
  amount: string;
  raw: string;
  status: boolean;
  errorMessage: any;
}

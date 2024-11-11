import React, { FunctionComponent, useEffect, useMemo, useRef } from "react";
import {
  RouteProp,
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Text, View, StyleSheet, Image } from "react-native";
import { useStyle } from "../../styles";
import { ChainIdHelper, TendermintTxTracer } from "@owallet/cosmos";
import { Buffer } from "buffer/";
import LottieView from "lottie-react-native";
import { Box } from "../../components/box";
import { FormattedMessage, useIntl } from "react-intl";
import { simpleFetch } from "@owallet/simple-fetch";
import {
  ChainIdentifierToTxExplorerMap,
  Network,
  retry,
  urlTxHistory,
} from "@owallet/common";
import { navigate, resetTo } from "@src/router/root";
import { SCREENS } from "@common/constants";
import { OWButton } from "@components/button";
import OWIcon from "@components/ow-icon/ow-icon";
import { EthTxReceipt, ResDetailAllTx, TxBtcInfo } from "@owallet/types";
import { TXSLcdRest } from "@owallet/types";
import { CoinPretty, Dec } from "@owallet/unit";
import _ from "lodash";
import { PageWithBottom } from "@components/page/page-with-bottom";
import { ScrollView } from "react-native-gesture-handler";
import { HeaderTx } from "@screens/tx-result/components/header-tx";
import {
  capitalizedText,
  formatContractAddress,
  openLink,
} from "@utils/helper";
import ItemReceivedToken from "@screens/transactions/components/item-received-token";
import { useTheme } from "@src/themes/theme-provider";
import { metrics } from "@src/themes";
enum EthTxStatus {
  Success = "0x1",
  Failure = "0x0",
}
export const TxPendingResultScreen: FunctionComponent = observer(() => {
  const { chainStore, allAccountStore, priceStore } = useStore();
  const intl = useIntl();

  const isPendingGoToResult = useRef(false);
  const isPendingGotoHome = useRef(false);

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId: string;
          txHash: string;
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

  const chainId = route.params.chainId;
  const account = allAccountStore.getAccount(chainId);
  const style = useStyle();
  const params = route.params;
  const chainInfo = chainStore.getChain(chainId);
  const navigation = useNavigation();

  const isFocused = useIsFocused();
  const txHash = route.params?.txHash;
  useEffect(() => {
    if (isFocused) {
      const isEvmTx = chainId?.includes("eip155");
      console.log(txHash, "txHash");
      if (chainInfo.chainId?.includes("Oraichain") && txHash) {
        retry(
          () => {
            return new Promise<void>(async (resolve, reject) => {
              try {
                const { status, data } = await simpleFetch<TXSLcdRest>(
                  `${chainInfo.rest}/cosmos/tx/v1beta1/txs/${txHash}`
                );
                console.log(data, "data");
                if (data?.tx_response?.code === 0) {
                  isPendingGoToResult.current = true;
                  navigate(SCREENS.TxSuccessResult, {
                    chainId,
                    txHash,
                    data: params?.data,
                  });
                  resolve();
                } else {
                  isPendingGoToResult.current = true;
                  navigate(SCREENS.TxFailedResult, {
                    chainId,
                    txHash,
                    data: params?.data,
                  });
                  resolve();
                }
              } catch (error) {
                console.log("error", error);
                reject();
                throw Error(error);
              }
              reject();
            });
          },
          {
            maxRetries: 10,
            waitMsAfterError: 500,
            maxWaitMsAfterError: 1000,
          }
        );
        return;
      }
      if (chainInfo.features.includes("btc") && txHash) {
        retry(
          () => {
            return new Promise<void>(async (resolve, reject) => {
              try {
                const txReceiptResponse = await simpleFetch<TxBtcInfo>(
                  `${chainInfo.rest}/tx/${txHash}`
                );
                if (txReceiptResponse?.data) {
                  if (isPendingGotoHome.current) {
                    return resolve();
                  }
                  isPendingGoToResult.current = true;
                  navigate(SCREENS.TxSuccessResult, {
                    chainId,
                    txHash,
                    data: params?.data,
                  });
                  resolve();
                }
                reject();
              } catch (e) {
                reject();
                throw Error(e);
              }
            });
          },
          {
            maxRetries: 20,
            waitMsAfterError: 2000,
            maxWaitMsAfterError: 4000,
          }
        );
        return;
      }
      if (chainInfo.features.includes("tron") && txHash) {
        retry(
          () => {
            return new Promise<void>(async (resolve, reject) => {
              try {
                const { status, data } = await simpleFetch(
                  `https://tronscan.org/#/transaction/${txHash}`
                );
                if (data && status === 200) {
                  isPendingGoToResult.current = true;
                  navigate(SCREENS.TxSuccessResult, {
                    chainId,
                    txHash,
                    data: params?.data,
                  });
                  resolve();
                }
              } catch (error) {
                reject();
                console.log("error", error);
                isPendingGoToResult.current = true;
                navigate(SCREENS.TxFailedResult, {
                  chainId,
                  txHash,
                  data: params.data,
                });
              }
              reject();
            });
          },
          {
            maxRetries: 10,
            waitMsAfterError: 500,
            maxWaitMsAfterError: 4000,
          }
        );
        return;
      }
      if (chainInfo.features.includes("oasis") && txHash) {
        simpleFetch(
          `https://www.oasisscan.com/v2/mainnet/chain/transactions?page=1&size=5&height=&address=${account.addressDisplay}`
        )
          .then(({ data }) => {
            if (!data.data?.list) return;
            for (const itemList of data.data?.list) {
              if (!itemList?.txHash) return;
              if (itemList?.txHash === txHash && itemList.status) {
                isPendingGoToResult.current = true;
                navigate(SCREENS.TxSuccessResult, {
                  chainId,
                  txHash,
                  data: params?.data,
                });
                return;
              } else {
                isPendingGoToResult.current = true;
                navigate(SCREENS.TxFailedResult, {
                  chainId,
                  txHash,
                  data: params?.data,
                });
                return;
              }
            }
          })
          .catch((err) => console.error(err, "Err oasis"));
        return;
      }

      if (isEvmTx) {
        retry(
          () => {
            return new Promise<void>(async (resolve, reject) => {
              if (chainInfo.evm === undefined) {
                return reject();
              }
              try {
                const txReceiptResponse = await simpleFetch<{
                  result: EthTxReceipt | null;
                  error?: Error;
                }>(chainInfo.evm.rpc, {
                  method: "POST",
                  headers: {
                    "content-type": "application/json",
                  },
                  body: JSON.stringify({
                    jsonrpc: "2.0",
                    method: "eth_getTransactionReceipt",
                    params: [txHash],
                    id: 1,
                  }),
                });
                console.log(txReceiptResponse, "txReceiptResponse");
                if (txReceiptResponse.data.error) {
                  console.error(txReceiptResponse.data.error);
                  resolve();
                }

                const txReceipt = txReceiptResponse.data.result;
                if (txReceipt) {
                  if (isPendingGotoHome.current) {
                    return resolve();
                  }

                  if (txReceipt.status === EthTxStatus.Success) {
                    isPendingGoToResult.current = true;
                    navigate(SCREENS.TxSuccessResult, {
                      chainId,
                      txHash,
                      data: params?.data,
                    });
                  } else {
                    isPendingGoToResult.current = true;
                    navigate(SCREENS.TxFailedResult, {
                      chainId,
                      txHash,
                      data: params?.data,
                    });
                  }
                  resolve();
                }

                reject();
              } catch (e) {
                reject();
                throw Error(e);
              }
            });
          },
          {
            maxRetries: 10,
            waitMsAfterError: 500,
            maxWaitMsAfterError: 4000,
          }
        );
      } else {
        const txTracer = new TendermintTxTracer(chainInfo.rpc, "/websocket");
        txTracer
          .traceTx(Buffer.from(txHash, "hex"))
          .then((tx) => {
            if (isPendingGotoHome.current) {
              return;
            }

            if (tx.code == null || tx.code === 0) {
              isPendingGoToResult.current = true;
              navigate(SCREENS.TxSuccessResult, {
                chainId,
                txHash,
                data: params?.data,
              });
            } else {
              isPendingGoToResult.current = true;
              navigate(SCREENS.TxFailedResult, {
                chainId,
                txHash,
                data: params?.data,
              });
            }
          })
          .catch((e) => {
            console.log(`Failed to trace the tx (${txHash})`, e);
          });

        return () => {
          txTracer.close();
        };
      }
    }
  }, [chainId, chainStore, isFocused, navigation, route.params.txHash]);

  const { colors } = useTheme();
  const styles = styling(colors);
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
  return (
    <PageWithBottom
      bottomGroup={
        <View style={styles.containerBottomButton}>
          <Text style={styles.txtPending}>
            The transaction is still pending. {"\n"}
            You can check the status on {chainInfo?.txExplorer?.name}
          </Text>
          <OWButton
            label="View on Explorer"
            onPress={handleOnExplorer}
            style={styles.btnExplorer}
            textStyle={styles.txtViewOnExplorer}
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
              <Image
                style={styles.imageType}
                fadeDuration={0}
                resizeMode="stretch"
                source={require("../../assets/image/transactions/process_pedding.gif")}
              />
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
              valueDisplay={`${fee?.shrink(true)?.trim(true)?.toString()} (${
                priceStore.calculatePrice(fee) || "$0"
              })`}
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
    imageType: {
      width: metrics.screenWidth - 104,
      height: 12,
    },
  });
};

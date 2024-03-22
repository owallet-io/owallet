import React, { FunctionComponent, useEffect, useState } from "react";
import { RouteProp, useIsFocused, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { View, StyleSheet, Image, ScrollView } from "react-native";
import { Text } from "@src/components/text";
import { useSmartNavigation } from "../../navigation.provider";
import { Bech32Address, TendermintTxTracer } from "@owallet/cosmos";
import { Buffer } from "buffer";
import { metrics } from "../../themes";
import { useTheme } from "@src/themes/theme-provider";
import { openLink, SUCCESS } from "../../utils/helper";
import { ChainIdEnum } from "@owallet/common";
import { API } from "@src/common/api";
import { OwalletEvent, TxRestCosmosClient, TRON_ID } from "@owallet/common";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import { OWButton } from "@src/components/button";
import { PageHeader } from "@src/components/header/header-new";
import ItemReceivedToken from "@src/screens/transactions/components/item-received-token";
import OWCard from "@src/components/card/ow-card";
import image from "@src/assets/images";
import { CoinPretty, Dec, Int } from "@owallet/unit";
import { AppCurrency, StdFee } from "@owallet/types";
import { CoinPrimitive } from "@owallet/stores";

export const TxPendingResultScreen: FunctionComponent = observer(() => {
  const { chainStore, txsStore, accountStore, keyRingStore, priceStore } =
    useStore();

  const [retry, setRetry] = useState(3);
  const { colors, images } = useTheme();
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
          // Hex encoded bytes.
          txHash: string;
          tronWeb?: any;
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
  const { chainId } = current;
  const { params } = route;
  console.log(route, "route");
  const txHash = params?.txHash;
  const chainInfo = chainStore.getChain(chainId);

  const smartNavigation = useSmartNavigation();
  const isFocused = useIsFocused();

  const getTronTx = async (txHash) => {
    const transaction = await route.params.tronWeb?.trx.getTransactionInfo(
      txHash
    );
    setRetry(retry - 1);
    return transaction;
  };

  useEffect(() => {
    let txTracer: TendermintTxTracer | undefined;
    if (isFocused && chainId && chainInfo) {
      if (chainId === TRON_ID) {
        // It may take a while to confirm transaction in TRON, show we make retry few times until it is done
        if (retry >= 0) {
          setTimeout(() => {
            getTronTx(txHash).then((transaction) => {
              if (
                transaction &&
                Object.keys(transaction).length > 0 &&
                retry > 0
              ) {
                if (transaction.receipt.result === SUCCESS) {
                  smartNavigation.pushSmart("TxSuccessResult", {
                    txHash: transaction.id,
                  });
                } else {
                  smartNavigation.pushSmart("TxFailedResult", {
                    chainId: chainStore.current.chainId,
                    txHash: transaction.id,
                  });
                }
              }
              if (retry === 0) {
                smartNavigation.pushSmart("TxFailedResult", {
                  chainId: chainStore.current.chainId,
                  txHash: txHash,
                });
              }
            });
          }, 33000);
        } else {
          smartNavigation.pushSmart("TxFailedResult", {
            chainId: chainStore.current.chainId,
            txHash: txHash,
          });
        }
      } else if (chainId === ChainIdEnum.Bitcoin) {
        API.checkStatusTxBitcoinTestNet(chainInfo.rest, txHash)
          .then((res: any) => {
            if (res?.confirmed) {
              smartNavigation.pushSmart("TxSuccessResult", {
                txHash: txHash,
              });
            }
          })
          .catch((err) => console.log(err, "err data"));
      } else if (chainId.startsWith("injective")) {
        OwalletEvent.txHashListener(txHash, (txInfo) => {
          if (txInfo?.code === 0) {
            smartNavigation.replaceSmart("TxSuccessResult", {
              chainId,
              txHash,
            });
            return;
          } else {
            smartNavigation.replaceSmart("TxFailedResult", {
              chainId,
              txHash,
            });
          }
        });
      } else {
        txTracer = new TendermintTxTracer(chainInfo.rpc, "/websocket");
        txTracer
          .traceTx(Buffer.from(txHash, "hex"))
          .then((tx) => {
            if (tx.code == null || tx.code === 0) {
              smartNavigation.replaceSmart("TxSuccessResult", {
                chainId,
                txHash,
              });
            } else {
              smartNavigation.replaceSmart("TxFailedResult", {
                chainId,
                txHash,
              });
            }
          })
          .catch((e) => {
            console.log(`Failed to trace the tx (${txHash})`, e);
          });
      }
    }

    return () => {
      if (txTracer) {
        txTracer.close();
      }
    };
  }, [
    chainId,
    chainStore,
    isFocused,
    route.params.txHash,
    smartNavigation,
    retry,
  ]);
  const handleOnExplorer = async () => {
    if (chainInfo.raw.txExplorer && txHash) {
      await openLink(
        chainInfo.raw.txExplorer.txUrl.replace(
          "{txHash}",
          chainInfo.chainId === TRON_ID || chainInfo.networkType === "bitcoin"
            ? txHash
            : txHash.toUpperCase()
        )
      );
    }
  };
  const amount = new CoinPretty(
    params?.data?.currency,
    new Dec(params?.data?.amount?.amount)
  );
  const fee = new CoinPretty(
    chainInfo.stakeCurrency,
    new Dec(params?.data?.fee.amount?.[0]?.amount)
  );

  return (
    <PageWithBottom
      bottomGroup={
        <View
          style={{
            width: "100%",
            paddingHorizontal: 16,
          }}
        >
          <Text
            style={{
              textAlign: "center",
              paddingVertical: 16,
            }}
          >
            The transaction is still pending. {"\n"}
            You can check the status on OraiScan
          </Text>
          <OWButton
            label="View on Explorer"
            onPress={handleOnExplorer}
            style={[
              {
                borderRadius: 99,
              },
            ]}
            textStyle={{
              fontSize: 14,
              fontWeight: "600",
            }}
          />
        </View>
      }
    >
      <View
        style={{
          flex: 1,
        }}
      >
        <PageHeader
          title={"Transaction detail"}
          colors={colors["neutral-text-title"]}
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
            }}
          >
            <Image
              source={image.logo_owallet}
              style={{
                width: 20,
                height: 20,
              }}
            />
            <Text
              color={colors["neutral-text-title"]}
              size={18}
              weight={"600"}
              style={{
                paddingLeft: 8,
              }}
            >
              OWallet
            </Text>
          </View>
          <OWCard
            style={{
              paddingVertical: 20,
              borderRadius: 24,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 2,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                paddingBottom: 8,
              }}
              color={colors["neutral-text-title"]}
              size={16}
              weight={"500"}
            >
              Send
            </Text>
            <Image
              style={{
                width: metrics.screenWidth - 104,
                height: 12,
              }}
              fadeDuration={0}
              resizeMode="stretch"
              source={require("../../assets/image/transactions/process_pedding.gif")}
            />
            <Text
              color={colors["neutral-text-title"]}
              style={{
                textAlign: "center",
                paddingTop: 16,
              }}
              size={28}
              weight={"500"}
            >
              {`${amount?.shrink(true)?.trim(true)?.toString()}`}
            </Text>
            <Text
              color={colors["neutral-text-body"]}
              style={{
                textAlign: "center",
              }}
            >
              {priceStore.calculatePrice(amount)?.toString()}
            </Text>
          </OWCard>
          <View
            style={{
              padding: 16,
              borderRadius: 24,
              marginHorizontal: 16,
              backgroundColor: colors["neutral-surface-card"],
            }}
          >
            <ItemReceivedToken
              label={"From"}
              valueDisplay={
                params?.data?.fromAddress &&
                Bech32Address.shortenAddress(params?.data?.fromAddress, 20)
              }
              value={params?.data?.fromAddress}
            />
            <ItemReceivedToken
              label={"To"}
              valueDisplay={
                params?.data?.toAddress &&
                Bech32Address.shortenAddress(params?.data?.toAddress, 20)
              }
              value={params?.data?.toAddress}
            />
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

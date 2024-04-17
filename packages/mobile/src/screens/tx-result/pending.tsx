import React, { FunctionComponent, useEffect, useState } from "react";
import { RouteProp, useIsFocused, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import {
  View,
  Image,
  ScrollView,
  InteractionManager,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";
import { Text } from "@src/components/text";
import { useSmartNavigation } from "../../navigation.provider";
import { metrics } from "../../themes";
import { useTheme } from "@src/themes/theme-provider";
import {
  capitalizedText,
  formatContractAddress,
  openLink,
  SUCCESS,
} from "../../utils/helper";
import { ChainIdEnum, TxRestTronClient } from "@owallet/common";
import { API } from "@src/common/api";
import { OwalletEvent, TxRestCosmosClient, TRON_ID } from "@owallet/common";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import { OWButton } from "@src/components/button";
import { PageHeader } from "@src/components/header/header-new";
import ItemReceivedToken from "@src/screens/transactions/components/item-received-token";
import { CoinPretty, Dec, Int } from "@owallet/unit";
import { AppCurrency, StdFee } from "@owallet/types";
import { CoinPrimitive } from "@owallet/stores";
import _ from "lodash";
import { HeaderTx } from "@src/screens/tx-result/components/header-tx";

export const TxPendingResultScreen: FunctionComponent = observer(() => {
  const { chainStore, txsStore, accountStore, keyRingStore, priceStore } =
    useStore();

  const [retry, setRetry] = useState(3);
  const { colors, images } = useTheme();
  const [data, setData] = useState<Partial<ResTxsInfo>>();
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
          // Hex encoded bytes.
          txHash: string;
          tronWeb?: any;
          title: string;
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
  const accountAddress = accountStore
    .getAccount(chainId)
    .getAddressDisplay(keyRingStore.keyRingLedgerAddresses, false);
  const txHash = params?.txHash;
  console.log(txHash, "txHash");
  const chainInfo = chainStore.getChain(chainId);

  const smartNavigation = useSmartNavigation();
  const isFocused = useIsFocused();
  useEffect(() => {
    // let txTracer: TendermintTxTracer | undefined;
    if (isFocused && chainId && chainInfo) {
      if (chainId === ChainIdEnum.Bitcoin) {
        API.checkStatusTxBitcoinTestNet(chainInfo.rest, txHash)
          .then((res: any) => {
            if (res?.confirmed) {
              smartNavigation.pushSmart("TxSuccessResult", {
                txHash: txHash,
              });
            }
          })
          .catch((err) => console.log(err, "err data"));
      }
    }

    return () => {};
  }, [
    chainId,
    chainStore,
    isFocused,
    route.params.txHash,
    smartNavigation,
    retry,
  ]);
  const handleUrl = (txHash) => {
    return chainInfo.raw.txExplorer.txUrl.replace(
      "{txHash}",
      chainInfo.chainId === TRON_ID ||
        chainInfo.networkType === "bitcoin" ||
        chainInfo.chainId === ChainIdEnum.OasisSapphire ||
        chainInfo.chainId === ChainIdEnum.OasisEmerald ||
        chainInfo.chainId === ChainIdEnum.Oasis ||
        chainInfo.chainId === ChainIdEnum.BNBChain
        ? txHash.toLowerCase()
        : txHash.toUpperCase()
    );
  };
  const handleOnExplorer = async () => {
    if (chainInfo.raw.txExplorer && txHash) {
      const url = handleUrl(txHash);
      await openLink(url);
    }
  };
  const amount = new CoinPretty(
    params?.data?.currency,
    new Dec(params?.data?.amount?.amount)
  );
  const chainTxs =
    chainStore.current.chainId === ChainIdEnum.KawaiiEvm
      ? chainStore.getChain(ChainIdEnum.KawaiiCosmos)
      : chainStore.current;
  const txs = txsStore(chainTxs);
  const getDetailByHash = async (txHash) => {
    try {
      const tx = await txs.getTxsByHash(txHash, accountAddress);
      setData(tx);
    } catch (error) {
      console.log("error: ", error);
    }
  };
  useEffect(() => {
    if (txHash) {
      InteractionManager.runAfterInteractions(() => {
        if (chainInfo?.chainId === ChainIdEnum.Bitcoin) return;
        const data = {
          ...params?.data,
        };
        OwalletEvent.txHashListener(txHash, (txInfo) => {
          console.log(txHash, txInfo, "txInfo");
          if (txInfo?.code === 0) {
            smartNavigation.replaceSmart("TxSuccessResult", {
              chainId,
              txHash,
              data,
            });
            return;
          } else {
            smartNavigation.replaceSmart("TxFailedResult", {
              chainId,
              txHash,
              data,
            });
          }
        });
        getDetailByHash(txHash);
      });
    }
  }, [txHash, chainId]);
  const fee = () => {
    if (params?.data?.fee) {
      return new CoinPretty(
        chainInfo.stakeCurrency,
        new Dec(params?.data?.fee.amount?.[0]?.amount)
      );
    } else {
      if (data?.stdFee?.amount?.[0]?.amount) {
        return new CoinPretty(
          chainInfo.stakeCurrency,
          new Dec(data?.stdFee?.amount?.[0]?.amount)
        );
      }
      return new CoinPretty(chainInfo.stakeCurrency, new Dec(0));
    }
  };
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
          <Text style={styles.txtPending}>
            The transaction is still pending. {"\n"}
            You can check the status on {chainInfo.raw.txExplorer.name}
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
        <PageHeader title={"Transaction details"} />
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
              valueDisplay={`${fee()
                ?.shrink(true)
                ?.trim(true)
                ?.toString()} (${priceStore.calculatePrice(fee())})`}
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
      backgroundColor: colors["hightlight-surface-subtle"],
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

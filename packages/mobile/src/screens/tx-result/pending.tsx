import React, { FunctionComponent, useEffect, useState } from "react";
import { RouteProp, useIsFocused, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import {
  PageWithScrollView,
  PageWithScrollViewInBottomTabView,
  PageWithView,
} from "../../components/page";
import { View, StyleSheet, Image } from "react-native";
import { Text } from "@src/components/text";
import { Button } from "../../components/button";
import { useSmartNavigation } from "../../navigation.provider";
import { HomeOutlineIcon, RightArrowIcon } from "../../components/icon";
import { TendermintTxTracer } from "@owallet/cosmos";
import { Buffer } from "buffer";
import { metrics } from "../../themes";
import { Card, CardBody, OWBox } from "../../components/card";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CommonActions } from "@react-navigation/native";
import { useTheme } from "@src/themes/theme-provider";
import { handleSaveHistory, HISTORY_STATUS, SUCCESS } from "../../utils/helper";
import { ChainIdEnum } from "@owallet/common";
import { API } from "@src/common/api";
import { OwalletEvent, TxRestCosmosClient, TRON_ID } from "@owallet/common";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import { OWButton } from "@src/components/button";
import { Dec, DecUtils } from "@owallet/unit";
import { PageHeader } from "@src/components/header/header-new";
import ItemDetails from "@src/screens/transactions/components/item-details";
import ItemReceivedToken from "@src/screens/transactions/components/item-received-token";
import OWCard from "@src/components/card/ow-card";
import image from "@src/assets/images";

export const TxPendingResultScreen: FunctionComponent = observer(() => {
  const { chainStore } = useStore();
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
        }
      >,
      string
    >
  >();
  const chainId = route?.params?.chainId
    ? route?.params?.chainId
    : chainStore?.current?.chainId;

  const smartNavigation = useSmartNavigation();

  const isFocused = useIsFocused();
  const { bottom } = useSafeAreaInsets();
  const restApi = chainStore.current?.rest;
  const restConfig = chainStore.current?.restConfig;
  const txRestCosmos = new TxRestCosmosClient(restApi, restConfig);
  const getTronTx = async (txHash) => {
    const transaction = await route.params.tronWeb?.trx.getTransactionInfo(
      txHash
    );
    setRetry(retry - 1);

    return transaction;
  };

  // useEffect(() => {
  //   const txHash = route?.params?.txHash;
  //   const chainInfo = chainStore.getChain(chainId);
  //   let txTracer: TendermintTxTracer | undefined;
  //
  //   if (isFocused) {
  //     if (chainId === TRON_ID) {
  //       // It may take a while to confirm transaction in TRON, show we make retry few times until it is done
  //       if (retry >= 0) {
  //         setTimeout(() => {
  //           getTronTx(txHash).then((transaction) => {
  //             if (
  //               transaction &&
  //               Object.keys(transaction).length > 0 &&
  //               retry > 0
  //             ) {
  //               if (transaction.receipt.result === SUCCESS) {
  //                 smartNavigation.pushSmart('TxSuccessResult', {
  //                   txHash: transaction.id
  //                 });
  //               } else {
  //                 smartNavigation.pushSmart('TxFailedResult', {
  //                   chainId: chainStore.current.chainId,
  //                   txHash: transaction.id
  //                 });
  //               }
  //             }
  //             if (retry === 0) {
  //               smartNavigation.pushSmart('TxFailedResult', {
  //                 chainId: chainStore.current.chainId,
  //                 txHash: txHash
  //               });
  //             }
  //           });
  //         }, 33000);
  //       } else {
  //         smartNavigation.pushSmart('TxFailedResult', {
  //           chainId: chainStore.current.chainId,
  //           txHash: txHash
  //         });
  //       }
  //     } else if (chainId === ChainIdEnum.BitcoinTestnet) {
  //       API.checkStatusTxBitcoinTestNet(chainInfo.rest, txHash)
  //         .then((res: any) => {
  //           if (res?.confirmed) {
  //             smartNavigation.pushSmart('TxSuccessResult', {
  //               txHash: txHash
  //             });
  //           }
  //         })
  //         .catch((err) => console.log(err, 'err data'));
  //     } else if (chainId.startsWith('injective')) {
  //       OwalletEvent.txHashListener(txHash, (txInfo) => {
  //         if (txInfo?.code === 0) {
  //           smartNavigation.replaceSmart('TxSuccessResult', {
  //             chainId,
  //             txHash
  //           });
  //           return;
  //         } else {
  //           smartNavigation.replaceSmart('TxFailedResult', {
  //             chainId,
  //             txHash
  //           });
  //         }
  //       });
  //     } else {
  //       txTracer = new TendermintTxTracer(chainInfo.rpc, '/websocket');
  //       txTracer
  //         .traceTx(Buffer.from(txHash, 'hex'))
  //         .then((tx) => {
  //           if (tx.code == null || tx.code === 0) {
  //             smartNavigation.replaceSmart('TxSuccessResult', {
  //               chainId,
  //               txHash
  //             });
  //           } else {
  //             smartNavigation.replaceSmart('TxFailedResult', {
  //               chainId,
  //               txHash
  //             });
  //           }
  //         })
  //         .catch((e) => {
  //           console.log(`Failed to trace the tx (${txHash})`, e);
  //         });
  //     }
  //   }
  //
  //   return () => {
  //     if (txTracer) {
  //       txTracer.close();
  //     }
  //   };
  // }, [
  //   chainId,
  //   chainStore,
  //   isFocused,
  //   route.params.txHash,
  //   smartNavigation,
  //   retry
  // ]);

  return (
    // <PageWithView>
    //   <OWBox>
    //     <View
    //       style={{
    //         height: metrics.screenHeight - bottom - 74,
    //         paddingTop: 80,
    //       }}
    //     >
    //       <View
    //         style={{
    //           display: "flex",
    //           flexDirection: "row",
    //           alignItems: "center",
    //         }}
    //       >
    //         <Image
    //           style={{
    //             width: 24,
    //             height: 2,
    //           }}
    //           fadeDuration={0}
    //           resizeMode="stretch"
    //           source={images.line_pending_short}
    //         />
    //         <Image
    //           style={{
    //             width: 144,
    //             height: 32,
    //             marginLeft: 8,
    //             marginRight: 9,
    //           }}
    //           fadeDuration={0}
    //           resizeMode="stretch"
    //           source={images.pending}
    //         />
    //         <Image
    //           style={{
    //             width: metrics.screenWidth - 185,
    //             height: 2,
    //           }}
    //           fadeDuration={0}
    //           resizeMode="stretch"
    //           source={images.line_pending_long}
    //         />
    //       </View>
    //       <View
    //         style={{
    //           paddingLeft: 32,
    //           paddingRight: 72,
    //         }}
    //       >
    //         <Text
    //           style={{
    //             fontWeight: "700",
    //             fontSize: 24,
    //             lineHeight: 34,
    //             paddingTop: 44,
    //             paddingBottom: 16,
    //           }}
    //           color={colors["text-title-login"]}
    //         >
    //           Transaction Processing...
    //         </Text>
    //         <Text
    //           style={{
    //             fontWeight: "400",
    //             fontSize: 14,
    //             lineHeight: 20,
    //             color: colors["primary-text"],
    //           }}
    //         >
    //           Hang on as the process might take some time to complete.
    //         </Text>
    //         <Image
    //           style={{
    //             width: metrics.screenWidth - 104,
    //             height: 12,
    //           }}
    //           fadeDuration={0}
    //           resizeMode="stretch"
    //           source={require("../../assets/image/transactions/process_pedding.gif")}
    //         />
    //         <View
    //           style={{
    //             paddingTop: 32,
    //             display: "flex",
    //             flexDirection: "row",
    //             alignItems: "center",
    //           }}
    //         >
    //           <HomeOutlineIcon color={colors["background-btn-primary"]} />
    //           <Text
    //             style={{
    //               paddingLeft: 6,
    //               color: colors["background-btn-primary"],
    //               fontWeight: "400",
    //               fontSize: 16,
    //               lineHeight: 22,
    //             }}
    //             onPress={() => {
    //               smartNavigation.dispatch(
    //                 CommonActions.reset({
    //                   index: 1,
    //                   routes: [{ name: "MainTab" }],
    //                 })
    //               );
    //             }}
    //           >
    //             Return to home screen
    //           </Text>
    //         </View>
    //       </View>
    //     </View>
    //   </OWBox>
    // </PageWithView>
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
            size={"large"}
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
        <View>
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
              -157,088.99 ORAI
            </Text>
            <Text
              color={colors["neutral-text-body"]}
              style={{
                textAlign: "center",
              }}
            >
              $524.23
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
              valueDisplay={"orai1gh8...kszasmp"}
              value={"orai1gh8...kszasmp"}
            />
            <ItemReceivedToken
              label={"To"}
              valueDisplay={"orai1gh8...kszasmp"}
              value={"orai1gh8...kszasmp"}
            />
            <ItemReceivedToken
              label={"Fee"}
              valueDisplay={"0.006 ORAI ($0.042)"}
              value={"orai1gh8...kszasmp"}
              btnCopy={false}
            />
            <ItemReceivedToken
              label={"Memo"}
              valueDisplay={"-"}
              value={"orai1gh8...kszasmp"}
              btnCopy={false}
            />
          </View>
        </View>
      </View>
    </PageWithBottom>
  );
});

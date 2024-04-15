import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useTheme } from "@src/themes/theme-provider";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Clipboard,
} from "react-native";
import OWText from "@src/components/text/ow-text";
import { useSmartNavigation } from "@src/navigation.provider";
import { useStore } from "@src/stores";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { OWButton } from "@src/components/button";
import { metrics } from "@src/themes";
import { ScrollView } from "react-native-gesture-handler";
import { CheckIcon, CopyFillIcon, DownArrowIcon } from "@src/components/icon";
import { API } from "@src/common/api";
import {
  capitalizedText,
  formatContractAddress,
  HISTORY_STATUS,
  openLink,
} from "@src/utils/helper";
import { Bech32Address } from "@owallet/cosmos";
import { getTransactionUrl } from "../universal-swap/helpers";
import { useSimpleTimer } from "@src/hooks";
import moment from "moment";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import OWButtonGroup from "@src/components/button/OWButtonGroup";
import { PageHeader } from "@src/components/header/header-new";
import { HeaderTx } from "@src/screens/tx-result/components/header-tx";
import ItemReceivedToken from "@src/screens/transactions/components/item-received-token";
import { Text } from "@src/components/text";
import OWButtonIcon from "@src/components/button/ow-button-icon";
import { ChainIdEnum, TRON_ID } from "@owallet/common";

export const HistoryDetail: FunctionComponent = observer((props) => {
  const { chainStore } = useStore();
  const { isTimedOut, setTimer } = useSimpleTimer();

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          item: any;
        }
      >,
      string
    >
  >();
  const [detail, setDetail] = useState<any>();
  const [loading, setLoading] = useState(false);
  const history = route.params.item;
  const getHistoryDetail = async () => {
    try {
      setLoading(true);
      const res = await API.getHistoryDetail(
        {
          id: history._id,
        },
        {
          baseURL: "https://staging.owallet.dev/",
        }
      );

      if (res && res.status === 200) {
        setDetail(res.data);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.log("getHistoryDetail err", err);
    }
  };

  useEffect(() => {
    setDetail(history);
  }, [history]);

  useEffect(() => {
    getHistoryDetail();
  }, [history]);
  const { colors } = useTheme();

  const styles = useStyles(colors);

  const renderTransactionDetail = (
    title,
    content,
    action?: { type: "copy" | "share"; callback }
  ) => {
    return (
      <View style={styles.wrapperDetail}>
        <View style={{ maxWidth: metrics.screenWidth / 1.3 }}>
          <OWText weight="600">{title}</OWText>
          <OWText color={colors["neutral-text-body"]} style={{ paddingTop: 4 }}>
            {content}
          </OWText>
        </View>

        {action?.type === "copy" ? (
          <TouchableOpacity onPress={action.callback}>
            <CopyFillIcon size={24} color={colors["neutral-icon-on-light"]} />
          </TouchableOpacity>
        ) : null}
        {action?.type === "share" ? (
          <TouchableOpacity onPress={action.callback}>
            <OWIcon
              name="share"
              size={15}
              color={colors["neutral-icon-on-light"]}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  // let chainInfo = chainStore.chainInfosInUI.find((c) => {
  //   return c.chainId === detail?.fromToken?.chainId;
  // });
  const chainInfo = chainStore.getChain(
    detail?.fromToken?.chainId ?? chainStore.current.chainId
  );
  const handleUrl = (txHash) => {
    const chainInfo = chainStore.getChain(detail?.fromToken?.chainId);
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
    if (chainInfo.raw.txExplorer && detail.hash) {
      const url = handleUrl(detail.hash);
      await openLink(url);
    }
  };
  const toChainInfo = chainStore.getChain(
    detail?.toToken?.chainId ?? chainStore.current.chainId
  );
  return (
    // <View>
    //   <ScrollView
    //     contentContainerStyle={styles.wrapper}
    //     style={styles.container}
    //     showsVerticalScrollIndicator={false}
    //   >
    //     <View>
    //       <View style={styles.goBack}>
    //         <TouchableOpacity onPress={onGoBack}>
    //           <OWIcon
    //             size={16}
    //             color={colors["neutral-icon-on-light"]}
    //             name="arrow-left"
    //           />
    //         </TouchableOpacity>
    //       </View>
    //       <View style={[styles.aic, styles.title]}>
    //         <OWText
    //           variant="heading"
    //           style={{ textAlign: "center" }}
    //           typo="bold"
    //         >
    //           Transaction Details
    //         </OWText>
    //       </View>
    //
    //       <View style={styles.headerCard}>
    //         <Image
    //           style={{
    //             width: metrics.screenWidth - 32,
    //             height: 260,
    //             position: "absolute",
    //           }}
    //           source={require("../../assets/image/img-bg.png")}
    //           resizeMode="cover"
    //           fadeDuration={0}
    //         />
    //         {!detail ? (
    //           <View
    //             style={{
    //               height: metrics.screenHeight / 7,
    //               justifyContent: "center",
    //               alignItems: "center",
    //             }}
    //           >
    //             <ActivityIndicator />
    //           </View>
    //         ) : (
    //           <View
    //             style={{
    //               justifyContent: "center",
    //               alignItems: "center",
    //             }}
    //           >
    //             <OWText style={{ fontSize: 16, fontWeight: "500" }}>
    //               {detail.type.split("_").join("")}
    //             </OWText>
    //             <View style={styles.status}>
    //               <OWText
    //                 style={{
    //                   fontSize: 14,
    //                   fontWeight: "500",
    //                   color: colors["hightlight-text-title"],
    //                 }}
    //               >
    //                 {detail.status}
    //               </OWText>
    //             </View>
    //             <OWText
    //               style={{
    //                 fontSize: 28,
    //                 fontWeight: "500",
    //               }}
    //             >
    //               {detail.fromAmount} {detail.fromToken?.asset.toUpperCase()}
    //             </OWText>
    //             {detail.type === HISTORY_STATUS.SWAP ? (
    //               <>
    //                 <DownArrowIcon height={20} color={colors["primary-text"]} />
    //                 <OWText
    //                   style={{
    //                     fontSize: 28,
    //                     fontWeight: "500",
    //                     color: colors["success-text-body"],
    //                   }}
    //                 >
    //                   +{detail.toAmount} {detail.toToken.asset.toUpperCase()}
    //                 </OWText>
    //               </>
    //             ) : null}
    //
    //             {/* <OWText
    //               style={{ fontSize: 14, color: colors["neutral-text-body"] }}
    //             >
    //               ${detail.toAmount}
    //             </OWText> */}
    //           </View>
    //         )}
    //       </View>
    //       {!detail ? null : (
    //         <View style={styles.txDetail}>
    //           {renderTransactionDetail(
    //             "From",
    //             Bech32Address.shortenAddress(detail.fromAddress, 24),
    //             {
    //               type: "copy",
    //               callback: () => {
    //                 onCopy(detail.fromAddress);
    //               },
    //             }
    //           )}
    //           {renderTransactionDetail(
    //             "To",
    //             Bech32Address.shortenAddress(detail.toAddress, 24),
    //             {
    //               type: "copy",
    //               callback: () => {
    //                 onCopy(detail.toAddress);
    //               },
    //             }
    //           )}
    //           {renderTransactionDetail("From Network", chainInfo?.chainName)}
    //           {detail.type === HISTORY_STATUS.SWAP
    //             ? renderTransactionDetail("To Network", detail.toToken.chainId)
    //             : null}
    //           {renderTransactionDetail("Fee", detail.fee)}
    //           {renderTransactionDetail(
    //             "Time",
    //             moment(detail.createdAt).format("DD/MM/YYYY hh:mm:ss")
    //           )}
    //           {renderTransactionDetail("Memo", detail.memo)}
    //           {renderTransactionDetail("Hash", detail.hash, {
    //             type: "share",
    //             callback: async () => {
    //               if (chainStore.current.raw.txExplorer && detail.hash) {
    //                 await openLink(
    //                   getTransactionUrl(chainStore.current.chainId, detail.hash)
    //                 );
    //               }
    //             },
    //           })}
    //         </View>
    //       )}
    //     </View>
    //   </ScrollView>
    //
    //   <View style={styles.aic}>
    //     <View style={styles.signIn}>
    //       <OWButton
    //         style={{
    //           borderRadius: 32,
    //         }}
    //         label={"View on Explorer"}
    //         loading={false}
    //         disabled={false}
    //         onPress={async () => {
    //           if (chainStore.current.raw.txExplorer && detail.hash) {
    //             await openLink(
    //               getTransactionUrl(chainStore.current.chainId, detail.hash)
    //             );
    //           }
    //         }}
    //       />
    //     </View>
    //   </View>
    // </View>
    <PageWithBottom
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
      {!detail ? (
        <View
          style={{
            height: metrics.screenHeight / 7,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator />
        </View>
      ) : (
        <View style={styles.containerBox}>
          <PageHeader title={"Transaction details"} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <HeaderTx
              type={capitalizedText(detail.type.split("_").join("")) || "Send"}
              imageType={
                <View style={styles.containerSuccess}>
                  <OWText
                    weight={"500"}
                    size={14}
                    color={colors["hightlight-text-title"]}
                  >
                    Success
                  </OWText>
                </View>
              }
              amount={`${
                detail.fromAmount
              } ${detail.fromToken?.asset.toUpperCase()}`}
              toAmount={
                detail.type === HISTORY_STATUS.SWAP
                  ? `+${detail.toAmount} ${detail.toToken?.asset.toUpperCase()}`
                  : null
              }
              price={""}
            />
            <View style={styles.cardBody}>
              <ItemReceivedToken
                label={capitalizedText("From")}
                valueDisplay={Bech32Address.shortenAddress(
                  detail.fromAddress,
                  24
                )}
                value={detail.fromAddress}
              />
              <ItemReceivedToken
                label={capitalizedText("To")}
                valueDisplay={Bech32Address.shortenAddress(
                  detail.toAddress,
                  24
                )}
                value={detail.toAddress}
              />
              <ItemReceivedToken
                label={"From Network"}
                valueDisplay={
                  <View style={styles.viewNetwork}>
                    {chainInfo?.raw?.chainSymbolImageUrl && (
                      <Image
                        style={styles.imgNetwork}
                        source={{
                          uri: chainInfo?.raw?.chainSymbolImageUrl,
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
              {detail.type === HISTORY_STATUS.SWAP ? (
                <ItemReceivedToken
                  label={"To Network"}
                  valueDisplay={
                    <View style={styles.viewNetwork}>
                      {toChainInfo?.raw?.chainSymbolImageUrl && (
                        <Image
                          style={styles.imgNetwork}
                          source={{
                            uri: toChainInfo?.raw?.chainSymbolImageUrl,
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
                        {toChainInfo?.chainName}
                      </Text>
                    </View>
                  }
                  btnCopy={false}
                />
              ) : null}
              <ItemReceivedToken
                label={"Fee"}
                valueDisplay={`${detail.fee}`}
                value={`${detail.fee}`}
                btnCopy={false}
              />
              <ItemReceivedToken
                label={"Time"}
                valueDisplay={moment(detail.createdAt).format(
                  "DD/MM/YYYY hh:mm:ss"
                )}
                btnCopy={false}
              />
              <ItemReceivedToken
                label={"Memo"}
                valueDisplay={detail.memo || "-"}
                btnCopy={false}
              />
              <ItemReceivedToken
                label={"Hash"}
                valueDisplay={formatContractAddress(detail.hash)}
                value={detail.hash}
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
      )}
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
      backgroundColor: colors["hightlight-surface-subtle"],
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
  });
};

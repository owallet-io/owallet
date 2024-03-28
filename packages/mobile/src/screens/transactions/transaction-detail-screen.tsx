import {
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { FC, useEffect, useState } from "react";
import { PageWithScrollView } from "@src/components/page";

import TransactionBox from "./components/transaction-box";
import ItemReceivedToken from "./components/item-received-token";
import { useTheme } from "@src/themes/theme-provider";
import ItemDetail from "./components/item-details";
import { API } from "@src/common/api";
import { RouteProp, useRoute } from "@react-navigation/native";
import {
  capitalizedText,
  createTxsHelper,
  formatContractAddress,
  getValueFromDataEvents,
  limitString,
  openLink,
} from "@src/utils/helper";
import { useStore } from "@src/stores";
import moment from "moment";
import { observer } from "mobx-react-lite";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { DenomHelper } from "@owallet/common";
import { OWEmpty } from "@src/components/empty";
import { Text } from "@src/components/text";
import { ChainIdEnum } from "@owallet/common";
import { ItemBtnViewOnScan } from "./components";
const TransactionDetailScreen = observer(() => {
  const [data, setData] = useState<Partial<ResTxsInfo>>();
  const [refreshing, setIsRefreshing] = useState(false);
  const { colors } = useTheme();
  const { txsStore, chainStore, accountStore } = useStore();
  const account = accountStore.getAccount(chainStore?.current?.chainId);
  const params = useRoute<
    RouteProp<
      {
        route: {
          txHash: string;
          item?: ResTxsInfo;
          isRefreshData: boolean;
        };
      },
      "route"
    >
  >().params;
  const txHash = params?.txHash;

  const infoTransaction = params?.item?.infoTransaction;
  const txsHelper = createTxsHelper();
  const txs = txsStore(
    chainStore.current.chainId === ChainIdEnum.KawaiiEvm
      ? chainStore.getChain(ChainIdEnum.KawaiiCosmos)
      : chainStore.current
  );

  useEffect(() => {
    if (!params?.item?.isRefreshData) {
      setData(params?.item);
      return;
    }
    getDetailByHash(params?.item?.txHash);
    return () => {};
  }, [params?.item?.isRefreshData]);
  const refreshData = () => {
    if (params?.item?.isRefreshData) {
      setIsRefreshing(true);
      getDetailByHash(txHash);
    }
  };
  const getDetailByHash = async (txHash) => {
    try {
      const tx = await txs.getTxsByHash(
        txHash,
        chainStore?.current?.networkType === "cosmos"
          ? account?.bech32Address
          : account?.evmosHexAddress
      );
      setIsRefreshing(false);
      setData(tx);
    } catch (error) {
      console.log("error: ", error);
      setIsRefreshing(false);
    }
  };

  const onViewScan = async () => {
    const url = chainStore?.current?.raw?.txExplorer.txUrl.replace(
      "{txHash}",
      txHash
    );
    await openLink(url);
  };
  const itemEvents = data?.transfers && getValueFromDataEvents(data?.transfers);

  const handleMapData = (itemEv, inEv) => {
    if (itemEv?.transferInfo?.length > 0 && itemEv?.transferInfo[0]) {
      return (
        <TransactionBox
          key={`tsbox-${inEv}`}
          label={`Transaction details`}
          subLabel={itemEv?.typeEvent ? `${itemEv?.typeEvent || ""}` : ""}
        >
          {itemEv?.transferInfo?.map((itemDataTrans, inDtTransfer) => {
            if (
              itemDataTrans?.amount ||
              itemDataTrans?.amount == "0" ||
              itemDataTrans?.amount == 0
            ) {
              return (
                <View key={`itemEv-${inDtTransfer}`}>
                  {itemDataTrans?.from && (
                    <ItemReceivedToken
                      valueDisplay={formatContractAddress(
                        typeof itemDataTrans?.from === "string"
                          ? itemDataTrans?.from
                          : itemDataTrans?.from?.value
                      )}
                      value={
                        typeof itemDataTrans?.from === "string"
                          ? itemDataTrans?.from
                          : itemDataTrans?.from?.value
                      }
                      label={"From"}
                    />
                  )}
                  {itemDataTrans?.to && (
                    <ItemReceivedToken
                      valueDisplay={formatContractAddress(
                        typeof itemDataTrans?.to === "string"
                          ? itemDataTrans?.to
                          : itemDataTrans?.to?.value
                      )}
                      value={
                        typeof itemDataTrans?.to === "string"
                          ? itemDataTrans?.to
                          : itemDataTrans?.to?.value
                      }
                      label={"To"}
                    />
                  )}
                  {itemDataTrans?.address && (
                    <ItemReceivedToken
                      valueDisplay={formatContractAddress(
                        itemDataTrans?.address
                      )}
                      value={itemDataTrans?.address}
                      label={"Address"}
                    />
                  )}
                  {itemDataTrans?.txId && (
                    <ItemReceivedToken
                      valueDisplay={formatContractAddress(itemDataTrans?.txId)}
                      value={itemDataTrans?.txId}
                      label={"TxID"}
                    />
                  )}
                  {itemDataTrans?.amount ||
                  itemDataTrans?.amount == "0" ||
                  itemDataTrans?.amount == 0 ? (
                    <ItemReceivedToken
                      label="Amount"
                      btnCopy={false}
                      borderBottom={
                        inEv == itemEvents?.value?.length - 1 &&
                        inDtTransfer == itemEv?.transferInfo?.length - 1
                          ? false
                          : true
                      }
                      value={itemDataTrans?.amount}
                      valueProps={{
                        color:
                          itemDataTrans?.amount &&
                          itemDataTrans?.isPlus &&
                          !itemDataTrans?.isMinus
                            ? colors["green-500"]
                            : itemDataTrans?.amount &&
                              itemDataTrans?.isMinus &&
                              !itemDataTrans?.isPlus
                            ? colors["orange-800"]
                            : colors["title-modal-login-failed"],
                      }}
                      valueDisplay={`${
                        itemDataTrans?.amount &&
                        itemDataTrans?.isPlus &&
                        !itemDataTrans?.isMinus
                          ? "+"
                          : itemDataTrans?.amount &&
                            itemDataTrans?.isMinus &&
                            !itemDataTrans?.isPlus
                          ? "-"
                          : ""
                      }${itemDataTrans?.amount} ${
                        limitString(itemDataTrans?.token, 25) || ""
                      }`}
                    />
                  ) : null}
                </View>
              );
            }
            return (
              <OWEmpty
                style={{
                  paddingVertical: 5,
                }}
                sizeImage={70}
              />
            );
          })}
        </TransactionBox>
      );
    }
    return null;
  };
  return (
    <PageWithScrollView
      showsVerticalScrollIndicator={false}
      style={styles.container}
      refreshControl={
        <RefreshControl
          tintColor={colors["text-title-login"]}
          onRefresh={refreshData}
          refreshing={refreshing}
        />
      }
    >
      <TransactionBox label={"Information"}>
        <ItemReceivedToken
          label="Transaction hash"
          valueDisplay={
            <TouchableOpacity onPress={onViewScan}>
              <Text color={colors["primary-surface-default"]} variant="body1">
                {formatContractAddress(txHash)}
              </Text>
            </TouchableOpacity>
          }
          value={txHash}
        />
        <ItemDetail
          label="Status"
          value={data?.status ? capitalizedText(data?.status) : "--"}
          iconComponent={
            <OWIcon
              size={12}
              color={
                data?.status === "success"
                  ? colors["green-500"]
                  : data?.status === "pending"
                  ? colors["primary-surface-default"]
                  : colors["orange-800"]
              }
              name={
                data?.status === "success"
                  ? "check_stroke"
                  : data?.status === "pending"
                  ? "history-1"
                  : "close_shape"
              }
            />
          }
          valueProps={{
            color:
              data?.status === "success"
                ? colors["green-500"]
                : data?.status === "pending"
                ? colors["primary-surface-default"]
                : colors["orange-800"],
          }}
        />
        <ItemDetail
          label="Block height"
          value={data?.height === "-1" ? "0" : data?.height}
        />
        {data?.memo ? (
          <ItemDetail label="Memo" value={limitString(data?.memo, 25)} />
        ) : null}
        {/* {chainStore?.current?.networkType === 'bitcoin' ? (
          <ItemDetail
            valueProps={{
              color:
                data?.confirmations > 6
                  ? colors['green-500']
                  : data?.confirmations > 0
                  ? colors['profile-orange']
                  : colors['text-title-login'],
              weight: '900'
            }}
            label="Confirmations"
            value={`${data?.confirmations > 6 ? data?.confirmations : `${data?.confirmations}/6`}`}
          />
        ) : null} */}
        {data?.gasUsed &&
        data?.gasWanted &&
        data?.gasUsed != "0" &&
        data?.gasWanted != "0" ? (
          <ItemDetail
            label="Gas (used/ wanted)"
            value={`${data?.gasUsed}/${data?.gasWanted}`}
          />
        ) : null}
        {data?.fee && data?.fee != "0" ? (
          <ItemDetail
            label="Fee"
            value={`${data?.fee} ${data?.denomFee || ""}`}
          />
        ) : null}
        <ItemDetail
          label="Time"
          value={
            <View
              style={{
                alignItems: "flex-end",
              }}
            >
              <Text color={colors["text-title-login"]} variant="body1">
                {data?.time?.timeShort}
              </Text>
              <Text variant="body1" color={colors["blue-300"]}>
                {data?.time?.date}
              </Text>
            </View>
          }
          borderBottom={!!chainStore?.current?.raw?.txExplorer}
        />
        {chainStore?.current?.raw?.txExplorer && (
          <ItemBtnViewOnScan onPress={onViewScan} />
        )}
      </TransactionBox>

      {chainStore.current?.networkType === "evm" &&
        chainStore.current.chainId !== ChainIdEnum.KawaiiEvm &&
        itemEvents?.typeId !== 0 &&
        itemEvents?.value?.map(handleMapData)}
      {chainStore.current?.networkType === "bitcoin" &&
        itemEvents?.typeId !== 0 &&
        itemEvents?.value?.map(handleMapData)}
      {infoTransaction?.length > 0 &&
        infoTransaction?.map((item, index) => {
          return (
            <TransactionBox
              key={`title-${index}`}
              label={txsHelper.convertToWord(item?.messages?.value)}
            >
              {item?.events?.length > 0 ? (
                item?.events?.map((ev, indexEv) => {
                  return (
                    <TransactionBox
                      styleBox={{
                        marginTop: 0,
                      }}
                      style={{
                        paddingTop: 0,
                      }}
                      key={`sub-title-${indexEv}`}
                      label={
                        ev?.type == "transfer"
                          ? "Transfer Info"
                          : txsHelper.convertToWord(ev?.type)
                      }
                    >
                      {ev?.attributes?.map((attr, indexAttr) => (
                        <ItemReceivedToken
                          key={`attr-${indexAttr}`}
                          valueProps={{
                            numberOfLines: 4,
                            color: txsHelper.isAddress(
                              attr?.value,
                              chainStore?.current?.networkType
                            )
                              ? colors["primary-surface-default"]
                              : colors["text-title-login"],
                          }}
                          btnCopy={txsHelper.isAddress(
                            attr?.value,
                            chainStore?.current?.networkType
                          )}
                          value={attr?.value}
                          label={txsHelper.convertToWord(attr?.key)}
                          valueDisplay={
                            txsHelper.isAmount(attr?.value, attr?.key)
                              ? `${
                                  txsHelper.convertValueTransactionToDisplay(
                                    attr?.value,
                                    attr?.key,
                                    chainStore.current
                                  )?.amount
                                } ${
                                  txsHelper.convertValueTransactionToDisplay(
                                    attr?.value,
                                    attr?.key,
                                    chainStore.current
                                  )?.token
                                }`
                              : txsHelper.isAddress(
                                  attr?.value,
                                  chainStore?.current?.networkType
                                )
                              ? formatContractAddress(attr?.value)
                              : limitString(
                                  txsHelper.trimQuotes(attr?.value),
                                  40
                                )
                          }
                        />
                      ))}
                    </TransactionBox>
                  );
                })
              ) : (
                <OWEmpty
                  style={{
                    paddingVertical: 5,
                  }}
                  sizeImage={70}
                />
              )}
            </TransactionBox>
          );
        })}
    </PageWithScrollView>
  );
});

export default TransactionDetailScreen;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
  },
});

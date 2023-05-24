import { RefreshControl, StyleSheet, View } from 'react-native';
import React, { FC, useEffect, useState } from 'react';
import { PageWithScrollView } from '@src/components/page';

import TransactionBox from './components/transaction-box';
import ItemReceivedToken from './components/item-received-token';
import { useTheme } from '@src/themes/theme-provider';
import ItemDetail from './components/item-details';
import { API } from '@src/common/api';
import { RouteProp, useRoute } from '@react-navigation/native';
import {
  capitalizedText,
  formatContractAddress,
  getValueFromDataEvents,
  limitString
} from '@src/utils/helper';
import * as WebBrowser from 'expo-web-browser';
import { useStore } from '@src/stores';
import moment from 'moment';
import { observer } from 'mobx-react-lite';
import OWIcon from '@src/components/ow-icon/ow-icon';
import { DenomHelper } from '@owallet/common';
import { OWEmpty } from '@src/components/empty';
import { Text } from '@src/components/text';
import { ChainIdEnum } from '@src/stores/txs/helpers/txs-enums';
import { ItemBtnViewOnScan } from './components';
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
      'route'
    >
  >().params;
  const txHash = params?.txHash;

  const infoTransaction = params?.item?.infoTransaction;
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
        chainStore?.current?.networkType === 'cosmos'
          ? account?.bech32Address
          : account?.evmosHexAddress
      );
      setIsRefreshing(false);
      setData(tx);
    } catch (error) {
      console.log('error: ', error);
      setIsRefreshing(false);
    }
  };

  const onViewScan = () => {
    const url = chainStore?.current?.raw?.txExplorer.txUrl.replace(
      '{txHash}',
      txHash
    );
    WebBrowser.openBrowserAsync(url);
  };
  const itemEvents = data?.transfers && getValueFromDataEvents(data?.transfers);

  const handleMapData = (itemEv, inEv) => {
    if (itemEv?.transferInfo?.length > 0 && itemEv?.transferInfo[0]) {
      return (
        <TransactionBox
          key={`tsbox-${inEv}`}
          label={`Transaction detail`}
          subLabel={itemEv?.typeEvent ? `${itemEv?.typeEvent || ''}` : ''}
        >
          {itemEv?.transferInfo?.map((itemDataTrans, inDtTransfer) => {
            if (
              itemDataTrans?.amount ||
              itemDataTrans?.amount == '0' ||
              itemDataTrans?.amount == 0
            ) {
              return (
                <View key={`itemEv-${inDtTransfer}`}>
                  {itemDataTrans?.from && (
                    <ItemReceivedToken
                      valueDisplay={formatContractAddress(
                        typeof itemDataTrans?.from === 'string'
                          ? itemDataTrans?.from
                          : itemDataTrans?.from?.value
                      )}
                      value={
                        typeof itemDataTrans?.from === 'string'
                          ? itemDataTrans?.from
                          : itemDataTrans?.from?.value
                      }
                      label="From"
                    />
                  )}
                  {itemDataTrans?.to && (
                    <ItemReceivedToken
                      valueDisplay={formatContractAddress(
                        typeof itemDataTrans?.to === 'string'
                          ? itemDataTrans?.to
                          : itemDataTrans?.to?.value
                      )}
                      value={
                        typeof itemDataTrans?.to === 'string'
                          ? itemDataTrans?.to
                          : itemDataTrans?.to?.value
                      }
                      label="To"
                    />
                  )}
                  {itemDataTrans?.amount ||
                  itemDataTrans?.amount == '0' ||
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
                            ? colors['green-500']
                            : itemDataTrans?.amount &&
                              itemDataTrans?.isMinus &&
                              !itemDataTrans?.isPlus
                            ? colors['orange-800']
                            : colors['title-modal-login-failed']
                      }}
                      valueDisplay={`${
                        itemDataTrans?.amount &&
                        itemDataTrans?.isPlus &&
                        !itemDataTrans?.isMinus
                          ? '+'
                          : itemDataTrans?.amount &&
                            itemDataTrans?.isMinus &&
                            !itemDataTrans?.isPlus
                          ? '-'
                          : ''
                      }${itemDataTrans?.amount} ${
                        limitString(itemDataTrans?.token, 25) || ''
                      }`}
                    />
                  ) : null}
                </View>
              );
            }
            return (
              <OWEmpty
                style={{
                  paddingVertical: 5
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
          tintColor={colors['text-title-login']}
          onRefresh={refreshData}
          refreshing={refreshing}
        />
      }
    >
      <TransactionBox label={'Information'}>
        <ItemReceivedToken
          label="Transaction hash"
          valueProps={{
            color: colors['purple-700']
          }}
          valueDisplay={formatContractAddress(txHash)}
          value={txHash}
        />
        <ItemDetail
          label="Status"
          value={data?.status ? capitalizedText(data?.status) : '--'}
          iconComponent={
            <OWIcon
              size={12}
              color={
                data?.status === 'success'
                  ? colors['green-500']
                  : colors['orange-800']
              }
              name={data?.status === 'success' ? 'check_stroke' : 'close_shape'}
            />
          }
          valueProps={{
            color:
              data?.status === 'success'
                ? colors['green-500']
                : colors['orange-800']
          }}
        />
        <ItemDetail label="Block height" value={data?.height} />
        {data?.memo ? (
          <ItemDetail label="Memo" value={limitString(data?.memo, 25)} />
        ) : null}

        {data?.gasUsed &&
        data?.gasWanted &&
        data?.gasUsed != '0' &&
        data?.gasWanted != '0' ? (
          <ItemDetail
            label="Gas (used/ wanted)"
            value={`${data?.gasUsed}/${data?.gasWanted}`}
          />
        ) : null}
        {data?.fee && data?.fee != '0' ? (
          <ItemDetail
            label="Fee"
            value={`${data?.fee} ${data?.denomFee || ''}`}
          />
        ) : null}
        <ItemDetail
          label="Time"
          value={`${data?.time?.timeShort}\n ${data?.time?.date}`}
          valueProps={{
            style: {
              textAlign: 'right'
            },
            numberOfLines: 2
          }}
          borderBottom={!!chainStore?.current?.raw?.txExplorer}
        />
        {chainStore?.current?.raw?.txExplorer && (
          <ItemBtnViewOnScan onPress={onViewScan} />
        )}
      </TransactionBox>

      {chainStore.current?.networkType === 'evm' &&
        itemEvents?.typeId !== 0 &&
        itemEvents?.value?.map(handleMapData)}
      {infoTransaction?.length > 0 &&
        infoTransaction?.map((item, index) => {
          return (
            <TransactionBox
              label={txs.txsHelper.convertToWord(item?.messages?.value)}
            >
              {item?.events?.length > 0 ? (
                item?.events?.map((ev, indexEv) => {
                  return (
                    <TransactionBox
                      style={{
                        paddingTop: 0
                      }}
                      label={txs.txsHelper.convertToWord(ev?.type)}
                    >
                      {ev?.attributes?.map((attr, indexAttr) => (
                        <ItemReceivedToken
                          valueProps={{
                            numberOfLines: 4,
                            color: txs.txsHelper.isAddress(
                              attr?.value,
                              chainStore?.current?.networkType
                            )
                              ? colors['purple-700']
                              : colors['text-title-login']
                          }}
                          btnCopy={txs.txsHelper.isAddress(
                            attr?.value,
                            chainStore?.current?.networkType
                          )}
                          value={attr?.value}
                          label={txs.txsHelper.convertToWord(attr?.key)}
                          valueDisplay={
                            txs.txsHelper.isAmount(attr?.value, attr?.key) ? (
                              <View
                                style={{
                                  flexDirection: 'row'
                                }}
                              >
                                <Text
                                  color={colors['text-title-login']}
                                  variant="body1"
                                >
                                  {
                                    txs.txsHelper.convertValueTransactionToDisplay(
                                      attr?.value,
                                      attr?.key,
                                      chainStore.current
                                    )?.amount
                                  }
                                </Text>
                                <Text
                                  color={colors['purple-700']}
                                  variant="body1"
                                  style={{
                                    paddingLeft: 5
                                  }}
                                >
                                  {
                                    txs.txsHelper.convertValueTransactionToDisplay(
                                      attr?.value,
                                      attr?.key,
                                      chainStore.current
                                    )?.token
                                  }
                                </Text>
                              </View>
                            ) : (
                              attr?.value
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
                    paddingVertical: 5
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
    marginHorizontal: 20
  }
});

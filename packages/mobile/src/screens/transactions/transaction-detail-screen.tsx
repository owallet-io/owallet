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
  caculatorFee,
  capitalizedText,
  formatAmount,
  formatContractAddress,
  getDataFromDataEvent,
  getCurrencyByMinimalDenom,
  getValueFromDataEvents,
  getValueTransactionHistory,
  limitString,
  numberWithCommas
} from '@src/utils/helper';
import { useStore } from '@src/stores';
import moment from 'moment';
import { observer } from 'mobx-react-lite';
import OWIcon from '@src/components/ow-icon/ow-icon';
import { DenomHelper } from '@owallet/common';
import { OWEmpty } from '@src/components/empty';
import { Text } from '@src/components/text';
const TransactionDetailScreen = observer(() => {
  const [data, setData] = useState<ResTxsInfo>();
  const [refreshing, setIsRefreshing] = useState(false);
  const { colors } = useTheme();
  const params = useRoute<
    RouteProp<
      {
        route: {
          txHash: string;
          item?: ResTxsInfo;
        };
      },
      'route'
    >
  >().params;
  const txHash = params?.txHash;
  useEffect(() => {
    if (params?.item) {
      setData(params?.item);
    }
    // getDetailByHash(txHash);
    return () => {};
  }, [params?.item]);
  const refreshData = () => {
    // setIsRefreshing(true);
    // getDetailByHash(txHash);
  };
  const getDetailByHash = async (txHash) => {
    try {
      // const txs = await API.getTxsByLCD({
      //   method: `/txs/${txHash}`,
      //   url: rest
      // });
      setIsRefreshing(false);
      // setData(txs?.tx_response);
    } catch (error) {
      console.log('error: ', error);
      setIsRefreshing(false);
    }
  };

  const itemEvents = data?.transfers && getValueFromDataEvents(data?.transfers);

  const handleMapData = (itemEv, inEv) => {
    if (itemEv?.transferInfo?.length > 0 && itemEv?.transferInfo[0]) {
      return (
        <TransactionBox
          key={`tsbox-${inEv}`}
          label={`Transaction detail ${
            itemEv?.typeEvent ? `(${itemEv?.typeEvent || ''})` : ''
          }`}
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
        <ItemDetail label="Memo" value={limitString(data?.memo, 25)} />

        <ItemDetail
          label="Gas (used/ wanted)"
          value={`${data?.gasUsed}/${data?.gasWanted}`}
        />
        <ItemDetail
          label="Fee"
          value={`${data?.fee} ${data?.denomFee || ''}`}
        />
        <ItemDetail
          label="Time"
          borderBottom={false}
          value={data?.time?.timeLong}
        />

        {/* <ItemDetail label="View on Scan" borderBottom={false} /> */}
      </TransactionBox>

      {itemEvents?.typeId !== 0 && itemEvents?.value?.map(handleMapData)}
    </PageWithScrollView>
  );
});

export default TransactionDetailScreen;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20
  }
});

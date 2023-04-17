import {
  StyleSheet,
  TouchableOpacity,
  View,
  ListRenderItemInfo
} from 'react-native';
import React from 'react';
import {
  formatAmount,
  formatContractAddress,
  getDataFromDataEvent,
  getValueFromDataEvents,
  getValueTransactionHistory,
  limitString
} from '@src/utils/helper';
import { useTheme } from '@src/themes/theme-provider';
import { spacing } from '@src/themes';
import { observer } from 'mobx-react-lite';
import { Text } from '@src/components/text';
import { TITLE_TYPE_ACTIONS_COSMOS_HISTORY } from '@src/common/constants';
import { useStore } from '@src/stores';
import moment from 'moment';
import OWIcon from '@src/components/ow-icon/ow-icon';

const OWTransactionItem = observer(
  ({ data, time, ...props }: IOWTransactionItem) => {
    const { chainStore, accountStore } = useStore();
    const account = accountStore.getAccount(chainStore.current.chainId);
    const item = data;
    const { status, countEvent, dataEvents, txHash } =
      getValueTransactionHistory({
        item: item?.tx_result ? item?.tx_result : item,
        address: account?.bech32Address
      });
    const itemEvents = getValueFromDataEvents(dataEvents);
    const itemTransfer = getDataFromDataEvent(itemEvents);
    const { colors } = useTheme();
    const styles = styling();
    return (
      <TouchableOpacity {...props}>
        <View style={styles.item}>
          <View style={[styles.flexRow, { paddingBottom: 5 }]}>
            <Text color={colors['blue-300']} size={12}>
              {formatContractAddress(txHash, 5)}
            </Text>
            {!!itemTransfer?.eventType ? (
              <Text
                variant="body2"
                typo="regular"
                color={colors['title-modal-login-failed']}
              >
                <Text color={colors['purple-700']}>
                  {countEvent > 0 ? `+${countEvent}` : null}
                </Text>{' '}
                {itemTransfer?.isRecipient
                  ? TITLE_TYPE_ACTIONS_COSMOS_HISTORY['receive']
                  : limitString(itemTransfer?.eventType, 14)}
                <View style={styles.iconstyle}>
                  <OWIcon
                    size={12}
                    color={
                      status === 'success'
                        ? colors['green-500']
                        : colors['orange-800']
                    }
                    name={status === 'success' ? 'check_stroke' : 'close_shape'}
                  />
                </View>
              </Text>
            ) : (
              <Text>--</Text>
            )}
          </View>
          <View style={styles.flexRow}>
            <Text
              variant="body1"
              typo="bold"
              weight={'500'}
              size={15}
              color={
                itemTransfer?.isPlus
                  ? colors['green-500']
                  : itemTransfer?.isMinus
                  ? colors['orange-800']
                  : colors['title-modal-login-failed']
              }
              style={styles.amount}
            >
              {`${
                itemTransfer?.isPlus ? '+' : itemTransfer?.isMinus ? '-' : ''
              }${formatAmount(itemTransfer?.amountValue) || '--'}`}{' '}
              {limitString(itemTransfer?.denom, 7)}
            </Text>
            <Text style={styles.timeStyle} color={colors['blue-300']}>
              {(time && moment(time).format('LL')) || item?.height || '--'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);

export default OWTransactionItem;

const styling = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    flexRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    amount: {
      // paddingTop: 8,
      // textTransform: 'uppercase'
    },
    flex: {
      flex: 1
    },
    timeStyle: {
      // paddingTop: 8
    },
    iconstyle: {
      paddingLeft: 8
    },
    centerItem: {
      justifyContent: 'center',
      alignItems: 'flex-end',
      flex: 1.3
    },
    item: {
      // flexDirection: 'row',
      // justifyContent: 'space-between',
      paddingHorizontal: spacing['page-pad'],
      height: 65,
      backgroundColor: colors['background-item-list'],
      marginVertical: 8,
      justifyContent: 'center',
      borderRadius: 8
    }
  });
};

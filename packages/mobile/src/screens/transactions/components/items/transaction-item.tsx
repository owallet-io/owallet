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

const OWTransactionItem = observer(({ data, time }: IOWTransactionItem) => {
  const { chainStore, accountStore } = useStore();
  const item = data;
  const account = accountStore.getAccount(chainStore.current.chainId);
  const {
    eventType,
    status,
    countEvent,
    amount,
    denom,
    isRecipient,
    isPlus,
    isMinus
  } = getValueTransactionHistory({
    item,
    address: account?.bech32Address
  });
  const { colors } = useTheme();
  const styles = styling();
  return (
    <TouchableOpacity>
      <View style={styles.item}>
        <View>
          <Text color="#8C93A7" size={12}>
            {formatContractAddress(item?.hash, 5)}
          </Text>
          <Text
            variant="body1"
            typo="bold"
            weight={'500'}
            size={15}
            color={
              isPlus
                ? colors['green-500']
                : isMinus
                ? colors['orange-800']
                : colors['title-modal-login-failed']
            }
            style={{
              paddingTop: 8,
              textTransform: 'uppercase'
            }}
          >
            {`${
              amount && formatAmount(amount) && isPlus
                ? '+'
                : isMinus && amount && formatAmount(amount)
                ? '-'
                : ''
            }${(amount && formatAmount(amount)) || '--'}`}{' '}
            {denom}
          </Text>
        </View>
        <View style={styles.centerItem}>
          {!!eventType ? (
            <Text
              variant="body2"
              typo="regular"
              color={colors['title-modal-login-failed']}
            >
              <Text color={colors['purple-700']}>
                {countEvent > 0 ? `+${countEvent}` : null}
              </Text>{' '}
              {isRecipient
                ? TITLE_TYPE_ACTIONS_COSMOS_HISTORY['receive']
                : limitString(eventType, 20)}
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

          <Text style={styles.timeStyle} color={colors['blue-600']}>
            {(time && moment(time).format('LL')) || '--'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default OWTransactionItem;

const styling = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    timeStyle: {
      paddingTop: 8
    },
    iconstyle: {
      paddingLeft: 8
    },
    centerItem: {
      justifyContent: 'center',
      alignItems: 'flex-end'
    },
    item: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: spacing['page-pad'],
      height: 65,
      backgroundColor: colors['background-item-list'],
      marginVertical: 8,
      alignItems: 'center',
      borderRadius: 8
    }
  });
};

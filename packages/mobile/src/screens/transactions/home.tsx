import React, { FunctionComponent, useEffect, useState } from 'react';
import { CText as Text } from '../../components/text';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { StackActions, useNavigation } from '@react-navigation/native';
import { TransactionSectionTitle, TransactionItem } from './components';
import { colors, metrics, spacing, typography } from '../../themes';
import { _keyExtract } from '../../utils/helper';
import { useSmartNavigation } from '../../navigation.provider';

// hard code data to test UI
const txsTransfer = [
  {
    label: 'Send token',
    date: 'Apr 25, 2022',
    amount: '-80.02',
    denom: 'ORAI'
  },
  {
    label: 'Send token',
    date: 'Apr 25, 2022',
    amount: '-100.02',
    denom: 'ORAI'
  },
  {
    label: 'Send token',
    date: 'Apr 25, 2022',
    amount: '-100.02',
    denom: 'ORAI'
  },
  {
    label: 'Send token to adfjlajdlfjwlelnkn',
    date: 'Apr 25, 2022',
    amount: '-100.02',
    denom: 'ORAI'
  },
  {
    label: 'Send token',
    date: 'Apr 25, 2022',
    amount: '-100.02',
    denom: 'ORAI'
  },
  {
    label: 'Send token 3',
    date: 'Apr 25, 2022',
    amount: '-100.02',
    denom: 'ORAI'
  },
  {
    label: 'Send token',
    date: 'Apr 25, 2022',
    amount: '-12.02',
    denom: 'ORAI'
  },
  {
    label: 'Send token',
    date: 'Apr 25, 2022',
    amount: '-100.02',
    denom: 'ORAI'
  }
];

const txsReceiver = [
  {
    label: 'Recevier token 3',
    date: 'Apr 25, 2022',
    amount: '+100.02',
    denom: 'ORAI'
  },
  {
    label: 'Recevier token',
    date: 'Apr 25, 2022',
    amount: '+12.02',
    denom: 'ORAI'
  },
  {
    label: 'Recevier token',
    date: 'Apr 25, 2022',
    amount: '+100.02',
    denom: 'ORAI'
  }
];

export const Transactions: FunctionComponent = () => {
  const [index, setIndex] = useState<number>(0);
  const [txs, setTxs] = useState(txsTransfer);
  const tabBarTitle = ['Transfer', 'Receiver'];
  const navigation = useNavigation();
  const smartNavigation = useSmartNavigation();
  const fetchTxs = () => {
    //TODO: fetch tx with type: transfer and receiver
  };

  useEffect(() => {
    try {
    } catch (err) {}
  }, [txs]);

  const _renderItem = ({ item, index }) => {
    return (
      <TransactionItem
        item={item}
        key={index}
        onPress={() => smartNavigation.navigateSmart('Transactions.Detail', {})}
        containerStyle={{}} // customize item transaction
      />
    );
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          marginTop: spacing['12']
        }}
      >
        {['Transfer', 'Receiver'].map((title: string, i: number) => (
          <TouchableOpacity
            key={i}
            style={{
              ...styles.tabSelected,
              width: (metrics.screenWidth - 60) / 2,
              alignItems: 'center',
              paddingVertical: spacing['12'],
              borderRadius: spacing['12'],
              backgroundColor:
                index === i ? colors['primary'] : colors['transparent']
            }}
            onPress={() => {
              setIndex(i);
              setTxs(i === 0 ? txsTransfer : txsReceiver);
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: index === i ? colors['white'] : colors['gray-300']
              }}
            >
              {title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ flex: 1 }}>
        <TransactionSectionTitle title={'Transfer list'} />
        <FlatList
          showsVerticalScrollIndicator={false}
          keyExtractor={_keyExtract}
          data={txs}
          renderItem={_renderItem}
          style={styles.transactionList}
          ListFooterComponent={<View style={{ height: spacing['120'] }} />}
          ListEmptyComponent={
            <View style={styles.transactionListEmpty}>
              <Text
                style={{
                  ...typography.h4,
                  color: colors['gray-400']
                }}
              >
                {'Not found transaction'}
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors['gray-50']
  },
  tabBarHeader: {
    backgroundColor: colors['white'],
    display: 'flex',
    flexDirection: 'row',
    width: metrics.screenWidth,
    justifyContent: 'space-around',
    height: spacing['44']
    // paddingVertical: spacing['20'],
    // paddingHorizontal: spacing['16']
  },
  tabText: {
    ...typography.body2,
    fontWeight: 'normal'
  },
  tabSelected: {
    // width: metrics.screenWidth - 40,
    // marginVertical: spacing['6'],
    // marginHorizontal: spacing['8'],
    // borderRadius: spacing['12'],
    // backgroundColor: colors['gray-50'],
    // borderColor: colors['border-gray']
  },
  transactionList: {
    paddingBottom: spacing['12']
  },
  transactionListEmpty: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: metrics.screenHeight / 4
  }
});

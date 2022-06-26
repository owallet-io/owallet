import React, { FunctionComponent, useEffect, useState } from 'react'
import { Tab, Text } from '@rneui/base'
import { FlatList, StyleSheet, View } from 'react-native'
import { useStyle } from '../../styles'
import { StackActions, useNavigation } from '@react-navigation/native'
import { TransactionSectionTitle, TransactionItem } from './components'
import { colors, metrics, spacing, typography } from '../../themes'
import { _keyExtract } from '../../utils/helper'

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
    amount: '+100.02',
    denom: 'ORAI'
  }
]

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
]

export const Transactions: FunctionComponent = () => {
  const style = useStyle()
  const [index, setIndex] = useState<number>(0)
  const [txs, setTxs] = useState(txsTransfer)
  const tabBarTitle = ['Transfer', 'Receiver']
  const navigation = useNavigation()

  const fetchTxs = () => {
    //TODO: fetch tx with type: transfer and receiver
  }

  useEffect(() => {
    try {
    } catch (err) {}
  }, [txs])

  const _renderItem = ({ item, index }) => {
    return (
      <TransactionItem
        label={item.label + ' ' + index}
        paragraph={item.date}
        amount={item.amount}
        denom={item.denom}
        key={index}
        onPress={() =>
          navigation.dispatch(StackActions.replace('TransactionsDetails'))
        }
        colorStyleAmount={style.flatten(['color-profile-red'])}
      />
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabBarHeader}>
        <Tab
          value={index}
          onChange={e => {
            setIndex(e)
            setTxs(e === 0 ? txsTransfer : txsReceiver)
          }}
          indicatorStyle={{
            height: 0
          }}
          variant="default"
          containerStyle={styles.tabSelected}
        >
          {tabBarTitle.map((title: string, index: number) => (
            <Tab.Item
              key={index}
              title={title}
              titleStyle={active => ({
                fontSize: 14,
                color: active ? colors['white'] : colors['gray-400']
              })}
              containerStyle={active => ({
                ...styles.tabSelected,
                backgroundColor: active
                  ? colors['primary']
                  : colors['transparent']
              })}
              variant="default"
            />
          ))}
        </Tab>
      </View>
      <View style={{ flex: 1 }}>
        <TransactionSectionTitle title={'Transfer list'} />
        <FlatList
          keyExtractor={_keyExtract}
          data={txs}
          renderItem={_renderItem}
          style={styles.transactionList}
          ListFooterComponent={<View style={{ height: spacing['120'] }} />}
          ListEmptyComponent={
            <View style={styles.transactionListEmpty}>
              <Text
                h4
                h4Style={{
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
  )
}

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
    height: spacing['44'],
    paddingVertical: spacing['20'],
    paddingHorizontal: spacing['16']
  },
  tabText: {
    ...typography.body2,
    fontWeight: 'normal'
  },
  tabSelected: {
    width: metrics.screenWidth - 40,
    marginVertical: spacing['6'],
    marginHorizontal: spacing['8'],
    borderRadius: spacing['12'],
    backgroundColor: colors['gray-50'],
    borderColor: colors['border-gray']
  },

  transactionList: {
    paddingBottom: spacing['12']
  },
  transactionListEmpty: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: metrics.screenHeight / 4
  }
})

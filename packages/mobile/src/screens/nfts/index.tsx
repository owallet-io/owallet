import React, { FunctionComponent, ReactElement } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '../../stores'
import { StyleSheet, View, ViewStyle, Image } from 'react-native'
import { CText as Text} from "../../components/text";
import { CoinPretty } from '@owallet/unit'
import { useSmartNavigation } from '../../navigation.provider'
import { Currency } from '@owallet/types'
import { TokenSymbol } from '../../components/token-symbol'
import { DenomHelper } from '@owallet/common'
import { Bech32Address } from '@owallet/cosmos'
import { colors, metrics, spacing, typography } from '../../themes'
import { AnimatedCircularProgress } from 'react-native-circular-progress'
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler'
import { formatContractAddress, _keyExtract } from '../../utils/helper'
import {
  QuantityIcon,
  SendIcon,
  TransactionMinusIcon
} from '../../components/icon'
import LinearGradient from 'react-native-linear-gradient'
import {
  BuyIcon,
  DepositIcon,
  SendDashboardIcon
} from '../../components/icon/button'
import {
  TransactionItem,
  TransactionSectionTitle
} from '../transactions/components'
import { PageWithScrollViewInBottomTabView } from '../../components/page'

export const NtfsScreen: FunctionComponent = observer(() => {
  const _onPressBtnMain = () => {}

  return (
    <PageWithScrollViewInBottomTabView>
      <View style={styles.container}>
        <LinearGradient
          colors={['#161532', '#5E499A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            borderTopLeftRadius: spacing['11'],
            borderTopRightRadius: spacing['11'],
            borderBottomLeftRadius: spacing['11'],
            borderBottomRightRadius: spacing['11']
          }}
        >
          <View
            style={{
              marginTop: spacing['24'],
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Text
              style={{
                ...typography.h5,
                color: colors['white'],
                fontWeight: '700'
              }}
              numberOfLines={1}
            >
              {'The Empire State Building'}
            </Text>

            <Text
              style={{
                ...typography.h7,
                color: colors['purple-400'],
                fontWeight: '700'
              }}
            >
              {`#8281`}
            </Text>
          </View>

          <View style={styles.containerImage}>
            <Image
              source={{
                uri: 'https://picsum.photos/id/1002/200'
              }}
              style={{
                width: metrics.screenWidth - 110,
                height: metrics.screenWidth - 110,
                borderRadius: spacing['6']
              }}
              resizeMode="contain"
            />
            <View
              style={{
                marginTop: spacing['12'],
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}
            >
              <View>
                <Text
                  style={{
                    ...typography.h6,
                    color: colors['gray-900'],
                    fontWeight: '700'
                  }}
                >
                  {`49.14 ORAI`}
                </Text>

                <Text
                  style={{
                    ...typography.h7,
                    color: colors['gray-500'],
                    fontWeight: '700'
                  }}
                >{`$ ${58.23}`}</Text>
              </View>

              <View style={styles.containerQuantity}>
                <View
                  style={{
                    marginTop: spacing['6']
                  }}
                >
                  <QuantityIcon size={24} color={colors['gray-150']} />
                </View>
                <Text
                  style={{
                    color: colors['gray-150']
                  }}
                >
                  {`10`}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.containerBtn}>
            {['Transfer'].map((e, i) => (
              <TouchableOpacity
                style={{
                  ...styles.btn
                }}
                onPress={() => _onPressBtnMain()}
              >
                <View style={{...styles.btnTransfer}}>
                  <SendDashboardIcon />
                  <Text
                    style={{
                      ...typography['h7'],
                      lineHeight: spacing['20'],
                      color: colors['white'],
                      paddingLeft: spacing['6'],
                      fontWeight: '700'
                    }}
                  >
                    {`Transfer`}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>
      </View>

      <View
        style={{
          backgroundColor: colors['white'],
          borderRadius: spacing['24'],
          paddingBottom: spacing['24'],
          height: metrics.screenHeight / 2
        }}
      >
        <TransactionSectionTitle title={'Transaction list'} />
        <FlatList
          data={[]}
          renderItem={({ item, index }) => (
            <TransactionItem
              label={item.label + ' ' + index}
              paragraph={item.date}
              amount={item.amount}
              denom={item.denom}
              key={index}
              // onPress={() => smartNavigation.navigateSmart('Transactions.Detail', {})}
              colorStyleAmount={{
                color: colors['profile-red'],
                fontWeight: '800',
                ...typography.subtitle2
              }}
              outnerStyle={{
                backgroundColor: colors['red-50'],
                marginHorizontal: spacing['24'],
                borderRadius: spacing['8'],
                marginTop: spacing['8']
              }}
            />
          )}
          keyExtractor={_keyExtract}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => (
            <View
              style={{
                height: 12
              }}
            />
          )}
          ListEmptyComponent={
            <View style={styles.transactionListEmpty}>
              <Image
                source={require('../../assets/image/not_found.png')}
                resizeMode="contain"
                height={142}
                width={142}
              />
              <Text
                style={{
                  ...typography.subtitle2,
                  color: colors['gray-300'],
                  marginTop: spacing['8']
                }}
              >
                {`No result found`}
              </Text>
            </View>
          }
        />

        <TouchableOpacity
          style={{
            backgroundColor: colors['purple-900'],
            borderRadius: spacing['8'],
            marginHorizontal: spacing['24'],
            paddingVertical: spacing['16'],
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: spacing['12']
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <TransactionMinusIcon size={18} color={colors['white']} />
            <Text
              style={{
                ...typography.h6,
                color: colors['white'],
                fontWeight: '700',
                marginLeft: spacing['10']
              }}
            >
              View all transactions
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </PageWithScrollViewInBottomTabView>
  )
})

const styles = StyleSheet.create({
  container: {
    borderWidth: spacing['0.5'],
    borderColor: colors['gray-100'],
    borderRadius: spacing['12'],
    marginHorizontal: spacing['24'],
    marginVertical: spacing['12']
  },
  containerImage: {
    marginTop: spacing['8'],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors['white'],
    marginHorizontal: 22,
    borderRadius: spacing['12'],
    padding: spacing['8'],
    marginBottom: spacing['24']
  },
  containerQuantity: {
    backgroundColor: colors['red-50'],
    borderRadius: spacing['6'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50%'
  },
  containerBtn: {
    display: 'flex',
    flexDirection: 'row',
    paddingTop: spacing['6'],
    paddingLeft: spacing[22],
    paddingRight: spacing['22'],
    justifyContent: 'center',
    paddingBottom: spacing['24']
  },
  btn: {
    backgroundColor: colors['purple-900'],
    borderWidth: 0.5,
    borderRadius: spacing['8'],
    borderColor: colors['transparent'],
    marginLeft: 10,
    marginRight: 10
  },
  btnTransfer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing['6'],
    paddingBottom: spacing['6'],
    paddingLeft: spacing['12'],
    paddingRight: spacing['12']
  },
  transactionListEmpty: {
    justifyContent: 'center',
    alignItems: 'center'
  }
})

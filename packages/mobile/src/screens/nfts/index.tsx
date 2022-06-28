import React, { FunctionComponent, ReactElement } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '../../stores'
import { StyleSheet, View, ViewStyle, Image } from 'react-native'
import { Text } from '@rneui/base'
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
  TransactionOutlineIcon
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

// hardcode data to test UI.
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
    amount: '-100.02',
    denom: 'ORAI'
  },
  {
    label: 'Recevier token',
    date: 'Apr 25, 2022',
    amount: '-100.02',
    denom: 'ORAI'
  }
]

export const NtfsScreen: FunctionComponent = observer(() => {
  const { chainStore, queriesStore, accountStore } = useStore()

  const account = accountStore.getAccount(chainStore.current.chainId)
  const queries = queriesStore.get(chainStore.current.chainId)

  const queryStakable = queries.queryBalances.getQueryBech32Address(
    account.bech32Address
  ).stakable
  const stakable = queryStakable.balance

  const queryDelegated = queries.cosmos.queryDelegations.getQueryBech32Address(
    account.bech32Address
  )
  const delegated = queryDelegated.total

  const queryUnbonding =
    queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
      account.bech32Address
    )
  const unbonding = queryUnbonding.total
  const stakedSum = delegated.add(unbonding)
  const total = stakable.add(stakedSum)
  const queryBalances = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(
      accountStore.getAccount(chainStore.current.chainId).bech32Address
    )
  const tokens = queryBalances.positiveNativeUnstakables
    .concat(queryBalances.nonNativeBalances)
    .slice(0, 2)

  const _onPressBtnMain = () => {}

  return (
    <PageWithScrollViewInBottomTabView>
      <View
        style={{
          borderWidth: spacing['0.5'],
          borderColor: colors['gray-100'],
          borderRadius: spacing['12'],
          marginHorizontal: spacing['24'],
          marginVertical: spacing['12']
        }}
      >
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

          <View
            style={{
              marginTop: spacing['8'],
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: colors['white'],
              marginHorizontal: 22,
              borderRadius: spacing['12'],
              padding: spacing['8'],
              marginBottom: spacing['24']
            }}
          >
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

              <View
                style={{
                  backgroundColor: colors['red-50'],
                  borderRadius: spacing['6'],
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '50%'
                }}
              >
                <View style={{
                  marginTop: spacing['6']
                }}>
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

          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              paddingTop: spacing['6'],
              paddingLeft: spacing[22],
              paddingRight: spacing['22'],
              justifyContent: 'center',
              paddingBottom: spacing['24']
            }}
          >
            {['Transfer'].map((e, i) => (
              <TouchableOpacity
                style={{
                  backgroundColor: colors['purple-900'],
                  borderWidth: 0.5,
                  borderRadius: spacing['8'],
                  borderColor: colors['transparent'],
                  marginLeft: 10,
                  marginRight: 10
                }}
                onPress={() => _onPressBtnMain()}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingTop: spacing['6'],
                    paddingBottom: spacing['6'],
                    paddingLeft: spacing['12'],
                    paddingRight: spacing['12']
                  }}
                >
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
            <TransactionOutlineIcon size={18} color={colors['white']} />
            <Text
              style={{
                ...typography.h6,
                color: colors['white'],
                fontWeight: '700',
                marginLeft: spacing['16']
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

export const NftItem: FunctionComponent<{
  containerStyle?: ViewStyle
  chainInfo: {
    stakeCurrency: Currency
  }
  balance: CoinPretty
  balanceUsd?: number
  totalBalance?: number
}> = ({
  containerStyle,
  chainInfo,
  balance,
  balanceUsd = 41.39, // defautl value to test use
  totalBalance = 100
}) => {
  const smartNavigation = useSmartNavigation()

  // The IBC currency could have long denom (with the origin chain/channel information).
  // Because it is shown in the title, there is no need to show such long denom twice in the actual balance.
  let balanceCoinDenom: string
  let name = balance.currency.coinDenom

  if ('originCurrency' in balance.currency && balance.currency.originCurrency) {
    balanceCoinDenom = balance.currency.originCurrency.coinDenom
  } else {
    const denomHelper = new DenomHelper(balance.currency.coinMinimalDenom)
    balanceCoinDenom = balance.currency.coinDenom
    if (denomHelper.contractAddress) {
      name += ` (${Bech32Address.shortenAddress(
        denomHelper.contractAddress,
        24
      )})`
    }
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={{ ...styles.containerToken, ...containerStyle }}
      onPress={() => {
        smartNavigation.navigateSmart('Tokens', {})
      }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center'
        }}
      >
        <TokenSymbol
          style={{
            marginRight: spacing['12']
          }}
          size={44}
          chainInfo={chainInfo}
          currency={balance.currency}
          imageScale={0.54}
        />
        <View
          style={{
            justifyContent: 'space-between'
          }}
        >
          <Text
            style={{
              ...typography.subtitle2,
              color: colors['gray-900'],
              marginBottom: spacing['4'],
              fontWeight: '800'
            }}
          >
            {`${balance}`}
          </Text>
          <Text
            style={{
              ...typography.subtitle3,
              color: colors['text-black-low'],
              marginBottom: spacing['4']
            }}
          >
            {`$${balanceUsd}`}
          </Text>
        </View>
      </View>

      <View
        style={{
          flex: 0.5,
          justifyContent: 'center',
          alignItems: 'flex-end'
        }}
      >
        <AnimatedCircularProgress
          size={56}
          width={6}
          fill={(balanceUsd / totalBalance) * 100}
          tintColor={colors['purple-700']}
          backgroundColor={colors['gray-50']}
          rotation={0}
        >
          {fill => (
            <Text
              h4
              h4Style={{
                ...typography.h7,
                fontSize: 11
              }}
            >{`${((balanceUsd / totalBalance) * 100).toFixed(2)}%`}</Text>
          )}
        </AnimatedCircularProgress>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  containerToken: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing['4'],
    marginVertical: spacing['8'],
    paddingTop: spacing['18'],
    paddingBottom: spacing['18']
  },
  transactionListEmpty: {
    justifyContent: 'center',
    alignItems: 'center'
  }
})

import React, { FunctionComponent } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '../../stores'
import {
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableWithoutFeedbackBase,
  View,
  ViewStyle
} from 'react-native'
import { Text } from '@rneui/base'
import { CoinPretty } from '@owallet/unit'
import { useSmartNavigation } from '../../navigation.provider'
import { Card } from '../../components/card'
import { RectButton } from '../../components/rect-button'
import { Currency } from '@owallet/types'
import { TokenSymbol } from '../../components/token-symbol'
import { DenomHelper } from '@owallet/common'
import { Bech32Address } from '@owallet/cosmos'
import { colors, spacing, typography } from '../../themes'
import { AnimatedCircularProgress } from 'react-native-circular-progress'
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler'
import { _keyExtract } from '../../utils/helper'

export const TokensScreen: FunctionComponent = observer(() => {
  const { chainStore, queriesStore, accountStore } = useStore()

  const queryBalances = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(
      accountStore.getAccount(chainStore.current.chainId).bech32Address
    )

  const tokens = queryBalances.positiveNativeUnstakables
    .concat(queryBalances.nonNativeBalances)
    .sort((a, b) => {
      const aDecIsZero = a.balance.toDec().isZero()
      const bDecIsZero = b.balance.toDec().isZero()

      if (aDecIsZero && !bDecIsZero) {
        return 1
      }
      if (!aDecIsZero && bDecIsZero) {
        return -1
      }

      return a.currency.coinDenom < b.currency.coinDenom ? -1 : 1
    })

  return (
    <View>
      <Card>
        <FlatList
          data={tokens}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: colors['gray-100'],
                marginVertical: spacing['4'],
                borderRadius: spacing['12'],
                marginHorizontal: spacing['20'],
                paddingHorizontal: spacing['10']
              }}
            >
              <TokenItem
                chainInfo={{ stakeCurrency: chainStore.current.stakeCurrency }}
                balance={item.balance}
              />
            </View>
          )}
          keyExtractor={_keyExtract}
        />
      </Card>
    </View>
  )
})

export const TokenItem: FunctionComponent<{
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
        smartNavigation.navigateSmart('Send', {
          currency: balance.currency.coinMinimalDenom
        })
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
  }
})

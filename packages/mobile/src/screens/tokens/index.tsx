import React, { FunctionComponent } from 'react'
import { PageWithScrollView } from '../../components/page'
import { observer } from 'mobx-react-lite'
import { useStore } from '../../stores'
import { StyleSheet, View, ViewStyle } from 'react-native'
import { Text } from '@rneui/base'
import { CoinPretty } from '@owallet/unit'
import { useStyle } from '../../styles'
import { useSmartNavigation } from '../../navigation.provider'
import { Card } from '../../components/card'
import { RectButton } from '../../components/rect-button'
import { Currency } from '@owallet/types'
import { TokenSymbol } from '../../components/token-symbol'
import { DenomHelper } from '@owallet/common'
import { Bech32Address } from '@owallet/cosmos'
import { colors, spacing, typography } from '../../themes'

export const TokensScreen: FunctionComponent = observer(() => {
  const { chainStore, queriesStore, accountStore } = useStore()

  const style = useStyle()

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
    <PageWithScrollView>
      <Card style={style.flatten(['padding-bottom-14'])}>
        {tokens.map(token => {
          return (
            <TokenItem
              key={token.currency.coinMinimalDenom}
              chainInfo={{ stakeCurrency: chainStore.current.stakeCurrency }}
              balance={token.balance}
            />
          )
        })}
      </Card>
    </PageWithScrollView>
  )
})

export const TokenItem: FunctionComponent<{
  containerStyle?: ViewStyle

  chainInfo: {
    stakeCurrency: Currency
  }
  balance: CoinPretty
}> = ({ containerStyle, chainInfo, balance }) => {
  const style = useStyle()

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
    <RectButton
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
              marginBottom: spacing['4']
            }}
          >
            {'60,342 ORAI'}
          </Text>
          <Text
            style={{
              ...typography.subtitle3,
              color: colors['text-black-low'],
              marginBottom: spacing['4']
            }}
          >
            {'$30,358.23'}
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
        <Text>{'72.1%'}</Text>
      </View>
    </RectButton>
  )
}

const styles = StyleSheet.create({
  containerToken: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing['4'],
    paddingVertical: spacing['18']
  }
})

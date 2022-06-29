import React, { FunctionComponent } from 'react'
import { Card } from '../../components/card'
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native'
import { CText as Text} from "../../components/text";
import { observer } from 'mobx-react-lite'
import { colors, metrics, spacing, typography } from '../../themes'
import { AddIcon, GiftIcon } from '../../components/icon'
import { useSmartNavigation } from '../../navigation.provider'
import { useStore } from '../../stores'
import { Dec } from '@owallet/unit'
import { LoadingSpinner } from '../../components/spinner'
import LinearGradient from 'react-native-linear-gradient'

export const EarningCard: FunctionComponent<{
  containerStyle?: ViewStyle
}> = observer(({ containerStyle }) => {
  const smartNavigation = useSmartNavigation()
  const { chainStore, accountStore, queriesStore, priceStore, analyticsStore } =
    useStore()
  const queries = queriesStore.get(chainStore.current.chainId)
  const account = accountStore.getAccount(chainStore.current.chainId)
  const queryDelegated = queries.cosmos.queryDelegations.getQueryBech32Address(
    account.bech32Address
  )
  const delegated = queryDelegated.total
  const queryReward = queries.cosmos.queryRewards.getQueryBech32Address(
    account.bech32Address
  )

  const totalPrice = priceStore.calculatePrice(delegated)

  const stakingReward = queryReward.stakableReward
  const totalStakingReward = priceStore.calculatePrice(stakingReward)
  return (
    <View style={containerStyle}>
      <Card style={styles.card}>
        <LinearGradient
          colors={['#161532', '#5E499A']}
          style={{
            ...styles['flex-center'],
            paddingTop: spacing['24']
          }}
        >
          <Text style={{ ...styles['text-earn'] }}>Earnings</Text>
          <Image
            style={{
              width: 100,
              height: 100,
              marginTop: 30
            }}
            source={require('../../assets/image/money.png')}
            resizeMode="contain"
            fadeDuration={0}
          />
          <Text
            style={{
              ...styles['text-amount']
            }}
          >
            {stakingReward
              .shrink(true)
              .maxDecimals(6)
              .trim(true)
              .upperCase(true)
              .toString()}
          </Text>
          <Text style={styles['amount']}>
            {totalStakingReward
              ? totalStakingReward.toString()
              : stakingReward.shrink(true).maxDecimals(6).toString()}
          </Text>

          <TouchableOpacity
            style={styles['btn-claim']}
            disabled={
              !account.isReadyToSendMsgs ||
              stakingReward.toDec().equals(new Dec(0)) ||
              queryReward.pendingRewardValidatorAddresses.length === 0
            }
            onPress={async () => {
              try {
                await account.cosmos.sendWithdrawDelegationRewardMsgs(
                  queryReward.getDescendingPendingRewardValidatorAddresses(8),
                  '',
                  {},
                  {},
                  {
                    onBroadcasted: txHash => {
                      analyticsStore.logEvent('Claim reward tx broadcasted', {
                        chainId: chainStore.current.chainId,
                        chainName: chainStore.current.chainName
                      })
                      smartNavigation.pushSmart('TxPendingResult', {
                        txHash: Buffer.from(txHash).toString('hex')
                      })
                    }
                  }
                )
              } catch (e) {
                if (e?.message === 'Request rejected') {
                  return
                }
                // console.log(e);
                smartNavigation.navigateSmart('Home', {})
              }
            }}
          >
            <View
              style={{
                ...styles['flex-center'],
                flexDirection: 'row',
                padding: spacing['8']
              }}
            >
              {account.isSendingMsg === 'withdrawRewards' ? (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 50,
                    left: '50%'
                  }}
                >
                  <LoadingSpinner color={colors['gray-150']} size={22} />
                </View>
              ) : null}
              <GiftIcon color={colors['white']} />
              <Text style={styles['text-rewards']}>Claim Rewards</Text>
            </View>
          </TouchableOpacity>

          <View style={styles['view-box-staking']}>
            <Text style={{ marginBottom: 20 }}>Total staked</Text>
            <View
              style={{
                marginBottom: 20,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                <Image
                  style={{
                    width: 44,
                    height: 44
                  }}
                  source={require('../../assets/image/orai_earning.png')}
                  resizeMode="contain"
                  fadeDuration={0}
                />
                <View style={{ paddingLeft: 12 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      lineHeight: 22,
                      color: colors['gray-900'],
                      fontWeight: '600'
                    }}
                  >
                    {delegated
                      .shrink(true)
                      .maxDecimals(6)
                      .trim(true)
                      .upperCase(true)
                      .toString()}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      lineHeight: 20,
                      fontWeight: '600',
                      color: colors['gray-300']
                    }}
                  >
                    {totalPrice
                      ? totalPrice.toString()
                      : delegated.shrink(true).maxDecimals(6).toString()}
                  </Text>
                </View>
              </View>
              <AddIcon
                onPress={() => {
                  smartNavigation.navigateSmart('Staking.Dashboard', {})
                }}
                color={colors['black']}
                size={24}
              />
            </View>
            <View>
              <TouchableOpacity
                style={styles['btn-manage']}
                onPress={() => {
                  smartNavigation.navigateSmart('Staking.Dashboard', {})
                }}
              >
                <Text
                  style={{ textAlign: 'center', color: colors['purple-700'] }}
                >
                  Manage my staking
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </Card>
    </View>
  )
})

const styles = StyleSheet.create({
  card: {
    paddingBottom: spacing['20'],
    marginTop: spacing['32'],
    borderTopLeftRadius: spacing['24'],
    borderTopRightRadius: spacing['24'],
    backgroundColor: '#5E499A' //linear gradient
  },
  'flex-center': {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },

  'text-earn': {
    fontWeight: '800',
    fontSize: 16,
    lineHeight: 22,
    color: colors['white']
  },
  'text-amount': {
    fontWeight: '900',
    fontSize: 24,
    lineHeight: 34,
    color: colors['white']
  },
  'text-rewards': {
    ...typography['h7'],
    lineHeight: spacing['20'],
    color: colors['white'],
    paddingLeft: spacing['6'],
    fontWeight: '700'
  },
  amount: {
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 22,
    color: '#AE94DE'
  },
  'btn-claim': {
    backgroundColor: colors['violet'],
    borderWidth: 0.5,
    marginTop: 16,
    width: metrics.screenWidth - 48,
    borderRadius: spacing['8'],
    borderColor: colors['violet']
  },
  'btn-manage': {
    backgroundColor: '#F3F1F5',
    borderWidth: 0.5,
    padding: 10,
    width: metrics.screenWidth - 80,
    borderRadius: spacing['8'],
    borderColor: '#F3F1F5'
  },
  'view-box-staking': {
    height: 176,
    marginTop: 24,
    backgroundColor: colors['white'],
    borderWidth: 0.5,
    width: metrics.screenWidth - 48,
    borderRadius: spacing['8'],
    borderColor: colors['violet'],
    padding: 16,
    display: 'flex',
    justifyContent: 'space-around'
  }
})

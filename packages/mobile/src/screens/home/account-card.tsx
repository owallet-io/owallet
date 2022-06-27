import React, { FunctionComponent, useCallback, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { Card, CardBody } from '../../components/card'
import {
  StyleSheet,
  Text,
  View,
  ViewStyle,
  ImageBackground,
  Image,
  Touchable,
  TouchableWithoutFeedback,
  LogBox
} from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useStore } from '../../stores'
import { AddressCopyable } from '../../components/address-copyable'
// import { DoubleDoughnutChart } from "../../components/svg";
import { Button } from '../../components/button'
import { LoadingSpinner } from '../../components/spinner'
// import { StakedTokenSymbol, TokenSymbol } from "../../components/token-symbol";
import { useSmartNavigation } from '../../navigation.provider'
import { NetworkErrorView } from './network-error-view'
import { ProgressBar } from '../../components/progress-bar'
import {
  DotsIcon,
  DownArrowIcon,
  HistoryIcon,
  RightArrowIcon,
  ScanIcon,
  Scanner,
  SendIcon,
  SettingDashboardIcon
} from '../../components/icon'
import { useNavigation, DrawerActions } from '@react-navigation/native'
import { FormattedMessage, useIntl } from 'react-intl'
import {
  BuyIcon,
  DepositIcon,
  SendDashboardIcon
} from '../../components/icon/button'
import { colors, metrics, spacing, typography } from '../../themes'
import { navigate } from '../../router/root'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { NamespaceModal, NetworkModal } from './components'
import { Hash } from '@owallet/crypto'

export const AccountCard: FunctionComponent<{
  containerStyle?: ViewStyle
}> = observer(({ containerStyle }) => {
  const { chainStore, accountStore, queriesStore, priceStore, modalStore } =
    useStore()

  const deterministicNumber = useCallback(chainInfo => {
    const bytes = Hash.sha256(
      Buffer.from(chainInfo.stakeCurrency.coinMinimalDenom)
    )
    return (
      (bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24)) >>> 0
    )
  }, [])

  const profileColor = useCallback(
    chainInfo => {
      const colors = [
        'sky-blue',
        'mint',
        'red',
        'orange',
        'blue-violet',
        'green',
        'sky-blue',
        'mint',
        'red',
        'purple',
        'red',
        'orange',
        'yellow'
      ]

      return colors[deterministicNumber(chainInfo) % colors.length]
    },
    [deterministicNumber]
  )

  const smartNavigation = useSmartNavigation()
  const navigation = useNavigation()

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

  const totalPrice = priceStore.calculatePrice(total)

  const data: [number, number] = [
    parseFloat(stakable.toDec().toString()),
    parseFloat(stakedSum.toDec().toString())
  ]
  const safeAreaInsets = useSafeAreaInsets()
  const onPressBtnMain = name => {
    if (name === 'Buy') {
      navigate('Browser', { path: 'https://oraidex.io' })
    }
    if (name === 'Deposit') {
    }
    if (name === 'Send') {
      smartNavigation.navigateSmart('Send', {
        currency: chainStore.current.stakeCurrency.coinMinimalDenom
      })
    }
  }

  const _onPressNetworkModal = () => {
    modalStore.setOpen()
    modalStore.setChildren(
      NetworkModal({
        profileColor,
        chainStore,
        modalStore
      })
    )
  }

  const _onPressNamespace = () => {
    modalStore.setOpen()
    modalStore.setChildren(NamespaceModal(account))
  }

  const onPressMyWallet = () => {
    modalStore.setOpen()
    modalStore.setChildren(MyWalletModal(account))
  }

  const RenderBtnMain = ({ name }) => {
    let icon
    switch (name) {
      case 'Buy':
        icon = <BuyIcon />
        break
      case 'Deposit':
        icon = <DepositIcon />
        break
      case 'Send':
        icon = <SendDashboardIcon />
        break
    }
    return (
      <TouchableOpacity
        style={{
          backgroundColor: colors['gray-900'],
          borderWidth: 0.5,
          borderRadius: spacing['8'],
          borderColor: colors['violet']
        }}
        onPress={() => onPressBtnMain(name)}
      >
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing['8']
          }}
        >
          {icon}
          <Text
            style={{
              ...typography['h7'],
              lineHeight: spacing['20'],
              color: colors['white'],
              paddingLeft: spacing['6'],
              fontWeight: '700'
            }}
          >
            {name}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <Card style={containerStyle}>
      <CardBody
        style={{
          paddingBottom: spacing['0'],
          paddingTop: safeAreaInsets.top + 10
        }}
      >
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingBottom: spacing['26']
          }}
        >
          <Text />

          <TouchableWithoutFeedback onPress={_onPressNetworkModal}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                paddingLeft: 50
              }}
            >
              <DotsIcon />
              <Text
                style={{
                  ...typography['h5'],
                  ...colors['color-text-black-low'],
                  marginLeft: spacing['8']
                }}
              >
                {chainStore.current.chainName + ' Network'}
              </Text>
            </View>
          </TouchableWithoutFeedback>

          <View style={{ display: 'flex', flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={() => {
                smartNavigation.navigateSmart('Transactions', {})
              }}
              style={{ paddingRight: 15 }}
            >
              <HistoryIcon size={28} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Others', {
                  screen: 'Camera'
                })
              }}
            >
              <Scanner size={28} color={'#5064fb'} />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            height: 256,
            borderWidth: spacing['0.5'],
            borderColor: colors['gray-100'],
            borderRadius: spacing['12']
          }}
        >
          <View
            style={{
              borderTopLeftRadius: spacing['11'],
              borderTopRightRadius: spacing['11'],
              height: 179,
              backgroundColor: '#5E499A' //linear-gradient(112.91deg, #161532 0%, #5E499A 89.85%)
            }}
          >
            <View
              style={{
                marginTop: 28,
                marginBottom: 16
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  color: '#AEAEB2',
                  fontSize: 14,
                  lineHeight: 20
                }}
              >
                Total Balance
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: 'white',
                  fontWeight: '900',
                  fontSize: 34,
                  lineHeight: 50
                }}
              >
                {totalPrice
                  ? totalPrice.toString()
                  : total.shrink(true).maxDecimals(6).toString()}
              </Text>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingTop: 6,
                paddingLeft: 20,
                paddingRight: 20
              }}
            >
              {['Buy', 'Deposit', 'Send'].map((e, i) => (
                <RenderBtnMain key={i} name={e} />
              ))}
            </View>
          </View>
          <View
            style={{
              backgroundColor: colors['white'],
              display: 'flex',
              height: 75,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: spacing['12'],
              paddingRight: spacing['18'],
              borderBottomLeftRadius: spacing['11'],
              borderBottomRightRadius: spacing['11'],
              shadowColor: 'rgba(24, 39, 75, 0.12)',
              shadowOffset: {
                width: 0,
                height: 12
              },
              shadowOpacity: 1,
              shadowRadius: 16.0
            }}
          >
            <View
              style={{
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingBottom: spacing['2']
                }}
              >
                <Image
                  style={{
                    width: spacing['26'],
                    height: spacing['26']
                  }}
                  source={require('../../assets/image/address_default.png')}
                  fadeDuration={0}
                />
                <Text style={{ paddingLeft: spacing['6'] }}>
                  {account.name || '...'}
                </Text>
              </View>

              <AddressCopyable
                address={account.bech32Address}
                maxCharacters={22}
              />
            </View>
            <View>
              <DownArrowIcon height={30} color={colors['gray-150']} />
            </View>
          </View>
          {queryStakable.isFetching ? (
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
        </View>
      </CardBody>

      <NetworkErrorView />

      <CardBody>
        <View
          style={{
            height: 75,
            borderWidth: spacing['0.5'],
            borderColor: colors['gray-100'],
            borderRadius: spacing['12'],
            backgroundColor: colors['white'],
            shadowColor: 'rgba(24, 39, 75, 0.12)',
            shadowOffset: {
              width: 0,
              height: 12
            },
            shadowOpacity: 1,
            shadowRadius: 16.0
          }}
        >
          <View
            style={{
              display: 'flex',
              height: 75,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: spacing['12'],
              paddingRight: spacing['8']
            }}
          >
            <View
              style={{
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <Text style={{ paddingBottom: spacing['6'] }}>Namespace</Text>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                <Image
                  style={{
                    width: 26,
                    height: 26
                  }}
                  source={require('../../assets/image/namespace_default.png')}
                  fadeDuration={0}
                />
                <Text
                  style={{
                    paddingLeft: spacing['6'],
                    fontWeight: '700',
                    fontSize: spacing['18'],
                    lineHeight: 26,
                    textAlign: 'center',
                    color: colors['gray-900']
                  }}
                >
                  {account.name || 'Harris.orai'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={{ paddingTop: spacing['10'] }}
              onPress={_onPressNamespace}
            >
              <SettingDashboardIcon size={30} color={colors['gray-150']} />
            </TouchableOpacity>
          </View>
        </View>
      </CardBody>
    </Card>
  )
})

import React, { FunctionComponent } from 'react'
import { PageWithScrollViewInBottomTabView } from '../../../components/page'
import { MyRewardCard } from './reward-card'
import { DelegationsCard } from './delegations-card'
import { UndelegationsCard } from './undelegations-card'
import { useStyle } from '../../../styles'
import { useStore } from '../../../stores'
import { StyleSheet, View, FlatList } from 'react-native'
import { colors, typography, spacing, metrics } from '../../../themes'
import { CText as Text } from '../../../components/text'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { DownArrowIcon } from '../../../components/icon'
import { _keyExtract } from '../../../utils/helper'
import {ValidatorItem} from '../components/validator-item'

const validators = [
  {
    imageUri: "",
    amount: "200,000.8",
    denom: "ORAI"
  },
  {
    imageUri: "",
    amount: "36.03",
    denom: "ORAI"
  },
  {
    imageUri: "",
    amount: "12.01",
    denom: "ORAI"
  }
]

export const StakingDashboardScreen: FunctionComponent = () => {
  const { chainStore, accountStore, queriesStore } = useStore()

  const style = useStyle()
  const safeAreaInsets = useSafeAreaInsets()

  const account = accountStore.getAccount(chainStore.current.chainId)
  const queries = queriesStore.get(chainStore.current.chainId)

  const unbondings =
    queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
      account.bech32Address
    ).unbondingBalances

  useLogScreenView("Staking dashboard", {
    chainId: chainStore.current.chainId,
    chainName: chainStore.current.chainName,
  });

  return (
    <PageWithScrollViewInBottomTabView>
      {/* <MyRewardCard containerStyle={style.flatten(['margin-y-card-gap'])} />
      <DelegationsCard
        containerStyle={style.flatten(['margin-bottom-card-gap'])}
      />
      {unbondings.length > 0 ? (
        <UndelegationsCard
          containerStyle={style.flatten(['margin-bottom-card-gap'])}
        />
      ) : null} */}
      <View
        style={{
          marginTop: safeAreaInsets.top
        }}
      >
        <Text
          style={{
            ...styles.title
          }}
        >
          {`My staking`}
        </Text>

        <View
          style={{
            ...styles.containerMyStaking,
            flex: 1
          }}
        >
          <View
            style={{
              flex: 1,
            }}
          >
            <Text
              style={{
                ...typography.h6,
                color: colors['gray-900'],
                fontWeight: '700'
              }}
            >{`Pending rewards`}</Text>
            <Text
              style={{
                ...typography.h4,
                color: colors['gray-900'],
                fontWeight: '400',
                marginTop: spacing['4']
              }}
            >{`0.0004 ORAI`}</Text>

            <View
              style={{
                flexDirection: 'row'
              }}
            >
              <Text
                style={{
                  ...typography.h6,
                  color: colors['purple-700'],
                  marginTop: spacing['8'],
                  marginRight: spacing['12']
                }}
              >{`Claim`}</Text>

              <View
                style={{
                  marginTop: spacing['10']
                }}
              >
                <DownArrowIcon color={colors['purple-900']} height={18} />
              </View>
            </View>
          </View>
          <View style={{
            flex: 1,
            alignItems: 'flex-start',
            justifyContent: 'center',
            marginTop: spacing['32']
          }}>
            <TouchableOpacity
              style={{
                ...styles.containerBtnClaim,
                height: 40,
              }}
            >
              <Text
                style={{
                  ...typography.h7,
                  fontWeight: '700',
                  color: colors['white'],
                }}
              >{`Stake now`}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View>
          <View></View>

          <FlatList 
            data={validators}
            renderItem={({item, index}) => (
              <ValidatorItem validator={item}/>
            )}
            keyExtractor={_keyExtract}
          />
        </View>
      </View>
    </PageWithScrollViewInBottomTabView>
  )
}

const styles = StyleSheet.create({
  container: {},
  title: {
    ...typography.h3,
    fontWeight: '700',
    textAlign: 'center',
    color: colors['gray-900'],
    marginTop: spacing['12'],
    marginBottom: spacing['12']
  },
  containerMyStaking: {
    marginTop: spacing['32'],
    backgroundColor: colors['white'],
    borderRadius: spacing['24'],
    width: metrics.screenWidth,
    paddingVertical: spacing['20'],
    paddingHorizontal: spacing['24']
  },
  containerBtnClaim: {
    justifyContent: 'center',
    paddingHorizontal: spacing['24'],
    paddingVertical: spacing['10'],
    borderRadius: spacing['8'],
    backgroundColor: colors['purple-900']
  }
})

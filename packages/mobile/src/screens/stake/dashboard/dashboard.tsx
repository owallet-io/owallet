import React, { FunctionComponent, useMemo } from 'react';
import { PageWithScrollViewInBottomTabView } from '../../../components/page';
import { StyleSheet, View, Image } from 'react-native';
import { colors, typography, spacing, metrics } from '../../../themes';
import { CText as Text } from '../../../components/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ArrowOpsiteUpDownIcon } from '../../../components/icon';
import { _keyExtract } from '../../../utils/helper';
import { useSmartNavigation } from '../../../navigation.provider';
import { MyRewardCard } from './reward-card';
import { DelegationsCard } from './delegations-card';
import { useStore } from '../../../stores';

export const StakingDashboardScreen: FunctionComponent = () => {
  const smartNavigation = useSmartNavigation();
  const safeAreaInsets = useSafeAreaInsets();
  const { chainStore, accountStore, queriesStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const staked = queries.cosmos.queryDelegations.getQueryBech32Address(
    account.bech32Address
  ).total;

  return (
    <PageWithScrollViewInBottomTabView>
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
            ...styles.containerMyStaking
          }}
        >
          <MyRewardCard />
          <View
            style={{
              alignItems: 'flex-start',
              justifyContent: 'center',
              marginTop: spacing['32']
            }}
          >
            <TouchableOpacity
              style={{
                ...styles.containerBtnClaim,
                height: 40
              }}
              onPress={() => {
                smartNavigation.navigate('Validator.List', {});
              }}
            >
              <Text
                style={{
                  ...typography.h7,
                  fontWeight: '700',
                  color: colors['white']
                }}
              >{`Stake now`}</Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              position: 'absolute',
              right: -10,
              bottom: 0
            }}
          >
            <Image
              style={{
                width: 148,
                height: 148
              }}
              source={require('../../../assets/image/stake_gift.png')}
              resizeMode="contain"
              fadeDuration={0}
            />
          </View>
        </View>

        <View>
          <View
            style={{
              ...styles.containerTitle
            }}
          >
            <Text
              style={{
                ...typography.h6,
                fontWeight: '400'
              }}
            >
              {`Total: ${staked
                .maxDecimals(6)
                .trim(true)
                .shrink(true)
                .toString()}`}
            </Text>

            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row'
              }}
            >
              <Text
                style={{
                  ...typography.h6,
                  fontWeight: '400',
                  marginRight: spacing['10']
                }}
              >
                Amount
              </Text>
              <View
                style={{
                  marginTop: spacing['5']
                }}
              >
                <ArrowOpsiteUpDownIcon size={24} color={colors['gray-900']} />
              </View>
            </View>
          </View>
          <DelegationsCard />
        </View>
      </View>
    </PageWithScrollViewInBottomTabView>
  );
};

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
  },
  containerTitle: {
    marginHorizontal: spacing['24'],
    marginTop: spacing['32'],
    marginBottom: spacing['16'],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});

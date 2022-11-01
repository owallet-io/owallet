import React, { FunctionComponent, useEffect, useState } from 'react';
import { PageWithScrollViewInBottomTabView } from '../../../components/page';
import { StyleSheet, View, Image } from 'react-native';
import { typography, spacing, metrics } from '../../../themes';
import { CText as Text } from '../../../components/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { _keyExtract } from '../../../utils/helper';
import { useSmartNavigation } from '../../../navigation.provider';
import { MyRewardCard } from './reward-card';
import { DelegationsCard } from './delegations-card';
import { useStore } from '../../../stores';
import { observer } from 'mobx-react-lite';
import { API } from '../../../common/api';
import { useTheme } from '@react-navigation/native';

export const StakingDashboardScreen: FunctionComponent = observer(() => {
  const smartNavigation = useSmartNavigation();
  const safeAreaInsets = useSafeAreaInsets();
  const { chainStore, accountStore, queriesStore } = useStore();
  const [validators, setValidators] = useState([]);
  const { colors } = useTheme();
  const styles = styling(colors);
  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  useEffect(() => {
    (async function get() {
      try {
        const res = await API.getValidatorList(
          {},
          {
            baseURL: 'https://api.scan.orai.io'
          }
        );
        setValidators(res.data.data);
      } catch (error) {}
    })();
  }, []);

  const staked =
    chainStore.current.networkType === 'cosmos'
      ? queries.cosmos.queryDelegations.getQueryBech32Address(
          account.bech32Address
        ).total
      : null;

  return (
    <PageWithScrollViewInBottomTabView backgroundColor={colors['background']}>
      <View
        style={{
          marginTop: safeAreaInsets.top
        }}
      >
        <Text
          style={{
            ...styles.title,
            color: colors['primary-text']
          }}
        >
          {`My staking`}
        </Text>

        <View
          style={{
            ...styles.containerMyStaking
          }}
        >
          {chainStore.current.networkType === 'cosmos' ? (
            <MyRewardCard />
          ) : (
            <View
              style={{
                alignItems: 'center',
                backgroundColor: colors['background']
              }}
            >
              <Image
                source={require('../../../assets/image/not_found.png')}
                resizeMode="contain"
                height={142}
                width={142}
              />
              <Text
                style={{
                  ...typography.h4,
                  fontWeight: '400',
                  marginVertical: spacing['52'],
                  color: colors['sub-primary-text']
                }}
              >{`No result found`}</Text>
            </View>
          )}

          {chainStore.current.networkType === 'cosmos' ? (
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
          ) : null}

          <View
            style={{
              position: 'absolute',
              right: -10,
              bottom: 0
            }}
          >
            {chainStore.current.networkType === 'cosmos' ? (
              <Image
                style={{
                  width: 148,
                  height: 148
                }}
                source={require('../../../assets/image/stake_gift.png')}
                resizeMode="contain"
                fadeDuration={0}
              />
            ) : null}
          </View>
        </View>

        <View>
          {chainStore.current.networkType === 'cosmos' ? (
            <View
              style={{
                ...styles.containerTitle
              }}
            >
              <Text
                style={{
                  ...typography.h6,
                  fontWeight: '600'
                }}
              >
                <Text
                  style={{
                    fontWeight: '400'
                  }}
                >
                  Total stake:{' '}
                </Text>
                {`${staked.maxDecimals(6).trim(true).shrink(true).toString()}`}
              </Text>
            </View>
          ) : null}

          {chainStore.current.networkType === 'cosmos' ? (
            <DelegationsCard validatorList={validators} />
          ) : null}
        </View>
      </View>
    </PageWithScrollViewInBottomTabView>
  );
});

const styling = colors =>
  StyleSheet.create({
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
      backgroundColor: colors['primary'],
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
      justifyContent: 'flex-start',
      alignItems: 'center'
    }
  });

import { OWButton } from '@src/components/button';
import { OWBox } from '@src/components/card';
import { OWEmpty } from '@src/components/empty';
import { OWSubTitleHeader } from '@src/components/header';
import { Text } from '@src/components/text';
import { useTheme } from '@src/themes/theme-provider';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { API } from '../../../common/api';
import { PageWithScrollViewInBottomTabView } from '../../../components/page';
import { useSmartNavigation } from '../../../navigation.provider';
import { useStore } from '../../../stores';
import { metrics, spacing, typography } from '../../../themes';
import { DelegationsCard } from './delegations-card';
import { MyRewardCard } from './reward-card';
export const StakingDashboardScreen: FunctionComponent = observer(() => {
  const smartNavigation = useSmartNavigation();
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
      ? queries.cosmos.queryDelegations.getQueryBech32Address(account.bech32Address).total
      : null;

  return (
    <PageWithScrollViewInBottomTabView backgroundColor={colors['background']}>
      <View>
        <OWSubTitleHeader title="My staking" />
        <OWBox>
          {chainStore.current.networkType === 'cosmos' ? <MyRewardCard /> : <OWEmpty />}

          {chainStore.current.networkType === 'cosmos' ? (
            <View
              style={{
                alignItems: 'flex-start',
                justifyContent: 'center',
                marginTop: spacing['12']
              }}
            >
              <OWButton
                label="Stake now"
                onPress={() => {
                  smartNavigation.navigate('Validator.List', {});
                }}
                size="small"
                fullWidth={false}
              />
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
        </OWBox>

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

          {chainStore.current.networkType === 'cosmos' ? <DelegationsCard validatorList={validators} /> : null}
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
      backgroundColor: colors['background-box'],
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
      backgroundColor: colors['primary-surface-default']
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

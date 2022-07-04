import { ValidatorThumbnails } from '@owallet/common';
import { BondStatus } from '@owallet/stores';
import { Dec } from '@owallet/unit';
import { useRoute, RouteProp } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { CText as Text } from '../../../components/text';
import { ValidatorThumbnail } from '../../../components/thumbnail';
import { useSmartNavigation } from '../../../navigation.provider';
import { useStore } from '../../../stores';
import { typography, colors, spacing } from '../../../themes';

interface DelegateDetailProps {}

export const DelegateDetailScreen: FunctionComponent<DelegateDetailProps> =
  observer(({}) => {
    const route = useRoute<
      RouteProp<
        Record<
          string,
          {
            validatorAddress: string;
          }
        >,
        string
      >
    >();
    const { chainStore, queriesStore, accountStore } = useStore();
    const validatorAddress = route?.params?.validatorAddress;

    const account = accountStore.getAccount(chainStore.current.chainId);
    const queries = queriesStore.get(chainStore.current.chainId);

    const smartNavigation = useSmartNavigation();
    const staked = queries.cosmos.queryDelegations
      .getQueryBech32Address(account.bech32Address)
      .getDelegationTo(validatorAddress);

    const rewards = queries.cosmos.queryRewards
      .getQueryBech32Address(account.bech32Address)
      .getStakableRewardOf(validatorAddress);

    const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
      BondStatus.Bonded
    );
    const unbondingValidators = queries.cosmos.queryValidators.getQueryStatus(
      BondStatus.Unbonding
    );
    const unbondedValidators = queries.cosmos.queryValidators.getQueryStatus(
      BondStatus.Unbonded
    );
    const thumbnail = ValidatorThumbnails[validatorAddress] ||
      bondedValidators.getValidatorThumbnail(validatorAddress) ||
      unbondingValidators.getValidatorThumbnail(validatorAddress) ||
      unbondedValidators.getValidatorThumbnail(validatorAddress);
    const validator = useMemo(() => {
      return bondedValidators.validators
        .concat(unbondingValidators.validators)
        .concat(unbondedValidators.validators)
        .find(val => val.operator_address === validatorAddress);
    }, [
      bondedValidators.validators,
      unbondingValidators.validators,
      unbondedValidators.validators,
      validatorAddress
    ]);

    return (
      <View>
        <View>
          <Text
            style={{
              ...styles.title,
              marginVertical: spacing['16']
            }}
          >{`Staking details`}</Text>
        </View>

        <View
          style={{
            ...styles.containerInfo
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <ValidatorThumbnail
              style={styles.validatorThumbnail}
              size={38}
              url={thumbnail}
            />
            <Text
              style={{
                ...styles.textInfo,
                marginLeft: spacing['12'],
                flexShrink: 1
              }}
            >
              {validator.description.moniker}
            </Text>
          </View>

          <View
            style={{
              marginTop: spacing['20'],
              flexDirection: 'row'
            }}
          >
            <View
              style={{
                flex: 1
              }}
            >
              <Text
                style={{
                  ...styles.textInfo,
                  marginBottom: spacing['4']
                }}
              >
                Staking
              </Text>
              <Text style={{ ...styles.textBlock }}>
                {staked.trim(true).shrink(true).maxDecimals(6).toString()}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                alignItems: 'flex-end'
              }}
            >
              <Text style={{ ...styles.textInfo, marginBottom: spacing['4'] }}>
                APY
              </Text>
              <Text style={{ ...styles.textBlock }}>
                {queries.cosmos.queryInflation.inflation
                  .mul(
                    new Dec(1).sub(
                      new Dec(validator.commission.commission_rates.rate)
                    )
                  )
                  .maxDecimals(2)
                  .trim(true)
                  .toString() + '%'}
              </Text>
            </View>
          </View>

          <View
            style={{
              marginTop: spacing['20'],
              flexDirection: 'row'
            }}
          >
            <View
              style={{
                flex: 1
              }}
            >
              <Text
                style={{
                  ...styles.textInfo,
                  marginBottom: spacing['4']
                }}
              >
                Rewards
              </Text>
              <Text style={{ ...styles.textBlock }}>
                {rewards.trim(true).shrink(true).maxDecimals(6).toString()}
              </Text>
            </View>
            <TouchableOpacity
              style={{
                flex: 1,
                alignItems: 'flex-end',
                justifyContent: 'center'
              }}
              onPress={() => {
                smartNavigation.navigateSmart('Validator.Details', {
                  validatorAddress
                });
              }}
            >
              <Text
                style={{
                  ...typography.h7,
                  color: colors['purple-900']
                }}
              >{`Validator details`}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <RectButton
          style={{ ...styles.containerBtn }}
          onPress={() => {
            smartNavigation.navigateSmart('Delegate', {
              validatorAddress
            });
          }}
        >
          <Text
            style={{
              ...styles.textBtn,
              textAlign: 'center',
              color: colors['white']
            }}
          >{`Stake more`}</Text>
        </RectButton>
        <RectButton
          style={{
            ...styles.containerBtn,
            backgroundColor: colors['purple-50']
          }}
          onPress={() => {
            smartNavigation.navigateSmart('Redelegate', { validatorAddress });
          }}
        >
          <Text
            style={{
              ...styles.textBtn,
              textAlign: 'center',
              color: colors['purple-900']
            }}
          >{`Switch validator`}</Text>
        </RectButton>
        <RectButton
          style={{ ...styles.containerBtn, backgroundColor: colors['gray-10'] }}
          onPress={() => {
            smartNavigation.navigateSmart('Undelegate', { validatorAddress });
          }}
        >
          <Text
            style={{
              ...styles.textBtn,
              textAlign: 'center',
              color: colors['red-500']
            }}
          >{`Unstake`}</Text>
        </RectButton>
      </View>
    );
  });

const styles = StyleSheet.create({
  title: {
    ...typography.h3,
    fontWeight: '700',
    color: colors['gray-900'],
    textAlign: 'center'
  },
  containerInfo: {
    backgroundColor: colors['white'],
    borderRadius: spacing['24'],
    padding: spacing['24']
  },
  textInfo: {
    ...typography.h6,
    fontWeight: '700'
  },
  textBlock: {
    ...typography.h7,
    fontWeight: '400'
  },
  containerBtn: {
    backgroundColor: colors['purple-900'],
    marginLeft: spacing['24'],
    marginRight: spacing['24'],
    borderRadius: spacing['8'],
    marginTop: spacing['20'],
    paddingVertical: spacing['16']
  },
  textBtn: {
    ...typography.h6,
    color: colors['white'],
    fontWeight: '700'
  },
  validatorThumbnail: {
    borderRadius: spacing['6']
  }
});

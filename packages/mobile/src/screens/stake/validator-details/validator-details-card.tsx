import React, { FunctionComponent, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../stores';
import { useTheme } from '@src/themes/theme-provider';
import { BondStatus } from '@owallet/stores';
import { StyleSheet, View, ViewStyle, TouchableOpacity } from 'react-native';
import { Text } from '@src/components/text';
import { CoinPretty, Dec, IntPretty } from '@owallet/unit';
// import { Button } from '../../../components/button';
import { useSmartNavigation } from '../../../navigation.provider';
import { ValidatorThumbnail } from '../../../components/thumbnail';
import { colors, metrics, spacing, typography } from '../../../themes';
import {
  ValidatorAPYIcon,
  ValidatorBlockIcon,
  ValidatorCommissionIcon,
  ValidatorVotingIcon
} from '../../../components/icon';
import { ValidatorThumbnails } from '@owallet/common';
// import { DelegatedCard } from './delegated-card';
import { OWBox } from '@src/components/card';
const renderIconValidator = (label: string, size?: number, styles?: any) => {
  switch (label) {
    case 'Website':
      return (
        <View
          style={{
            ...styles.containerIcon
          }}
        >
          <ValidatorBlockIcon color={'#1E1E1E'} size={size} />
        </View>
      );
    case 'APR':
      return (
        <View
          style={{
            ...styles.containerIcon
          }}
        >
          <ValidatorAPYIcon color={'#1E1E1E'} size={size} />
        </View>
      );
    case 'Commission':
      return (
        <View
          style={{
            ...styles.containerIcon
          }}
        >
          <ValidatorCommissionIcon color={'#1E1E1E'} size={size} />
        </View>
      );
    case 'Voting power':
      return (
        <View
          style={{
            ...styles.containerIcon
          }}
        >
          <ValidatorVotingIcon color={'#1E1E1E'} size={size} />
        </View>
      );
  }
};

export const ValidatorDetailsCard: FunctionComponent<{
  containerStyle?: ViewStyle;
  validatorAddress: string;
  apr?: number;
}> = observer(({ containerStyle, validatorAddress, apr }) => {
  const { chainStore, queriesStore } = useStore();
  const { colors } = useTheme();
  const styles = styling(colors);
  const queries = queriesStore.get(chainStore.current.chainId);
  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Bonded
  );
  const unbondingValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Unbonding
  );
  const unbondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Unbonded
  );
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
  const smartNavigation = useSmartNavigation();
  const thumbnail =
    bondedValidators.getValidatorThumbnail(validatorAddress) ||
    unbondingValidators.getValidatorThumbnail(validatorAddress) ||
    unbondedValidators.getValidatorThumbnail(validatorAddress) ||
    ValidatorThumbnails[validatorAddress];

  const renderTextDetail = (label: string) => {
    switch (label) {
      case 'Website':
        return (
          <Text style={{ ...styles.textDetail }}>
            {validator?.description.website}
          </Text>
        );
      case 'APR':
        return (
          <Text style={{ ...styles.textDetail }}>
            {apr ? apr?.toFixed(2).toString() + '%' : '0' + '%'}
          </Text>
        );
      case 'Commission':
        return (
          <Text style={{ ...styles.textDetail }}>
            {new IntPretty(new Dec(validator.commission.commission_rates.rate))
              .moveDecimalPointRight(2)
              .maxDecimals(2)
              .trim(true)
              .toString() + '%'}
          </Text>
        );
      case 'Voting power':
        return (
          <Text style={{ ...styles.textDetail }}>
            {new CoinPretty(
              chainStore.current.stakeCurrency,
              new Dec(validator.tokens)
            )
              .maxDecimals(0)
              .toString()}
          </Text>
        );
      default:
        return null;
    }
  };

  return (
    <View>
      <Text
        style={{
          ...typography.h3,
          fontWeight: '700',
          color: colors['primary-text'],
          textAlign: 'center',
          marginTop: spacing['16']
        }}
      >
        Validator details
      </Text>
      
      {validator ? (
        <OWBox>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: spacing['16'],
            }}
          >
            <ValidatorThumbnail size={44} url={thumbnail} />
            <Text
              style={{
                ...styles.textInfo,
                fontWeight: '700',
                color: colors['primary-text']
              }}
            >
              {validator?.description.moniker}
            </Text>
          </View>

          <View
            style={{
              flexWrap: 'wrap',
              flexDirection: 'row',
              justifyContent: 'space-between'
            }}
          >
            {['Website', 'APR', 'Commission', 'Voting power'].map(
              (label: string, index: number) => (
                <View
                  style={{
                    ...styles.containerItem
                  }}
                >
                  {renderIconValidator(label, 24, styles)}
                  <Text
                    style={{
                      ...typography.h7,
                      fontWeight: '700',
                      textAlign: 'center',
                      marginTop: spacing['6'],
                      color: colors['primary-text']
                    }}
                  >
                    {label}
                  </Text>
                  {renderTextDetail(label)}
                </View>
              )
            )}
          </View>
          <View
            style={{
              marginBottom: spacing['14']
            }}
          >
            <Text
              style={{
                ...typography.h7,
                fontWeight: '700',
                marginTop: spacing['24'],
                marginBottom: spacing['4'],
                color: colors['sub-primary-text']
              }}
            >
              Description
            </Text>
            <Text
              style={{
                ...styles.textDetail,
                textAlign: 'left',
                fontWeight: '400'
                // marginBottom: spacing['28']
              }}
              selectable={true}
            >
              {validator?.description.details}
            </Text>
          </View>
          
        
        </OWBox>
      ) : null}
      {/* </OWBox> */}
      <TouchableOpacity
            style={{
              marginBottom: 16,
              backgroundColor: colors['purple-700'],
              borderRadius: 8,
              marginHorizontal:24,
              marginTop:20
            }}
            onPress={() => {
              smartNavigation.navigateSmart('Delegate', {
                validatorAddress
              });
            }}
          >
            <Text
              style={{
                color: colors['white'],
                textAlign: 'center',
                fontWeight: '700',
                fontSize: 16,
                padding: 16
              }}
            >
              Stake now
            </Text>
          </TouchableOpacity>
    </View>
  );
});

const styling = colors =>
  StyleSheet.create({
    containerIcon: {
      borderRadius: spacing['8'],
      padding: spacing['10'],
      alignItems: 'center',
      backgroundColor: colors['gray-10']
    },
    textInfo: {
      ...typography.h5,
      fontWeight: '400',
      marginLeft: spacing['12']
    },
    containerItem: {
      borderWidth: 1,
      borderColor: colors['purple-50'],
      borderRadius: spacing['8'],
      width: (metrics.screenWidth - 60) / 2,
      marginVertical: spacing['6'],
      paddingVertical: spacing['16'],
      paddingHorizontal: spacing['16'],
      alignItems: 'center'
    },
    textDetail: {
      ...typography.h7,
      fontWeight: '700',
      color: colors['gray-300'],
      textAlign: 'center'
    }
  });

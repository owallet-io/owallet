import React, { FunctionComponent, useMemo, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../stores';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { CText as Text } from '../../../components/text';
import { BondStatus, Validator } from '@owallet/stores';
import { useSmartNavigation } from '../../../navigation.provider';
import { ValidatorThumbnail } from '../../../components/thumbnail';
import { colors, spacing, typography } from '../../../themes';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ValidatorThumbnails } from '@owallet/common';

export const DelegationsCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const queryDelegations =
    queries.cosmos.queryDelegations.getQueryBech32Address(
      account.bech32Address
    );
  const delegations = queryDelegations.delegations;

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Bonded
  );
  const unbondingValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Unbonding
  );
  const unbondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Unbonded
  );

  const validators = useMemo(() => {
    return bondedValidators.validators
      .concat(unbondingValidators.validators)
      .concat(unbondedValidators.validators);
  }, [
    bondedValidators.validators,
    unbondingValidators.validators,
    unbondedValidators.validators
  ]);

  const validatorsMap = useMemo(() => {
    const map: Map<string, Validator> = new Map();

    for (const val of validators) {
      map.set(val.operator_address, val);
    }

    return map;
  }, [validators]);

  const smartNavigation = useSmartNavigation();
  useEffect(() => {}, []);

  return (
    <View>
      {delegations && delegations.length > 0 && (
        <View
          style={{
            ...containerStyle
          }}
        >
          {delegations.map(del => {
            const val = validatorsMap.get(del.validator_address);
            if (!val) {
              return null;
            }

            const thumbnail =
              ValidatorThumbnails[val.operator_address] ||
              bondedValidators.getValidatorThumbnail(val.operator_address) ||
              unbondingValidators.getValidatorThumbnail(val.operator_address) ||
              unbondedValidators.getValidatorThumbnail(val.operator_address);

            const amount = queryDelegations.getDelegationTo(
              val.operator_address
            );

            return (
              <TouchableOpacity
                key={del.validator_address}
                style={{
                  ...styles.containerItem,
                  marginTop: 8,
                  marginBottom: 8
                }}
                onPress={() => {
                  smartNavigation.navigate('Delegate.Detail', {
                    validatorAddress: del.validator_address
                  });
                }}
              >
                <ValidatorThumbnail
                  style={{
                    marginRight: spacing['12']
                  }}
                  size={40}
                  url={thumbnail}
                />
                <Text
                  style={{
                    ...styles.textInfo,
                    fontWeight: '700',
                    fontSize: 16
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {val.description.moniker}
                </Text>
                <View style={{ flex: 1 }} />
                <Text
                  style={{
                    ...styles.textInfo
                  }}
                >
                  {amount.maxDecimals(4).trim(true).shrink(true).toString()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  containerItem: {
    backgroundColor: colors['white'],
    borderRadius: spacing['8'],
    flexDirection: 'row',
    marginHorizontal: spacing['24'],
    padding: spacing['8'],
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  textInfo: {
    ...typography.h5,
    fontWeight: '400',
    color: colors['gray-900']
  }
});

import React, { FunctionComponent, useMemo } from 'react';
import { PageWithScrollView } from '../../../components/page';
import { RouteProp, useRoute } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../stores';
import { Dec } from '@owallet/unit';
import { StyleSheet, View } from 'react-native';
import { colors, spacing, typography } from '../../../themes';
import { BondStatus } from '@owallet/stores';
import { useSmartNavigation } from '../../../navigation.provider';
import { DelegatedCard } from './delegated-card';
import { ValidatorDetailsCard } from './validator-details-card';

export const ValidatorDetailsScreen: FunctionComponent = observer(() => {
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

  const validatorAddress = route.params.validatorAddress;

  const { chainStore, queriesStore, accountStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const smartNavigation = useSmartNavigation();

  const staked = queries.cosmos.queryDelegations
    .getQueryBech32Address(account.bech32Address)
    .getDelegationTo(validatorAddress);

  const unbondings = queries.cosmos.queryUnbondingDelegations
    .getQueryBech32Address(account.bech32Address)
    .unbondingBalances.find(
      unbonding => unbonding.validatorAddress === validatorAddress
    );

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

  const thumbnail =
    bondedValidators.getValidatorThumbnail(validatorAddress) ||
    unbondingValidators.getValidatorThumbnail(validatorAddress) ||
    unbondedValidators.getValidatorThumbnail(validatorAddress);

  useLogScreenView("Validator detail", {
    chainId: chainStore.current.chainId,
    chainName: chainStore.current.chainName,
    validatorName: validator?.description.moniker,
  });

  return (
    <PageWithScrollView>
      <ValidatorDetailsCard
        containerStyle={{
          ...styles.containerCard
        }}
        validatorAddress={validatorAddress}
      />
      {staked.toDec().gt(new Dec(0)) ? (
        <DelegatedCard validatorAddress={validatorAddress} />
      ) : null}
    </PageWithScrollView>
  );
});

const styles = StyleSheet.create({
  containerCard: {
    backgroundColor: colors['white'],
    borderRadius: spacing['24'],
    paddingVertical: spacing['20'],
    paddingHorizontal: spacing['24'],
    marginTop: spacing['16']
  }
});

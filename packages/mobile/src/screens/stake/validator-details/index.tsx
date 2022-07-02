import React, { FunctionComponent, useMemo } from 'react';
import { PageWithScrollView } from '../../../components/page';
import { RouteProp, useRoute } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../stores';
import { CoinPretty, Dec, IntPretty } from '@owallet/unit';
import { StyleSheet, View } from 'react-native';
import { CText as Text } from '../../../components/text';
import { colors, spacing, typography } from '../../../themes';
import { RectButton } from '../../../components/rect-button';
import { BondStatus } from '@owallet/stores';
import { ValidatorThumbnail } from '../../../components/thumbnail';
import { useSmartNavigation } from '../../../navigation.provider';

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
      (unbonding) => unbonding.validatorAddress === validatorAddress
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
      .find((val) => val.operator_address === validatorAddress);
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
      {/* <ValidatorDetailsCard
        containerStyle={style.flatten(['margin-y-card-gap'])}
        validatorAddress={validatorAddress}
      />
      {staked.toDec().gt(new Dec(0)) ? (
        <DelegatedCard
          containerStyle={style.flatten(['margin-bottom-card-gap'])}
          validatorAddress={validatorAddress}
        />
      ) : null}
      {unbondings ? (
        <UnbondingCard validatorAddress={validatorAddress} />
      ) : null} */}
      <View>
        <Text
          style={{
            ...styles.title,
            marginVertical: spacing['16']
          }}
        >{`Validator details`}</Text>
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
            {`${validatorAddress}`}
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
              Blocks
            </Text>
            <Text style={{ ...styles.textBlock }}>{`${115.002} blocks`}</Text>
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
            <Text style={{ ...styles.textBlock }}>{`${24.5}%`}</Text>
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
              Commission
            </Text>
            <Text style={{ ...styles.textBlock }}>
              {new IntPretty(
                new Dec(validator.commission.commission_rates.rate)
              )
                .moveDecimalPointRight(2)
                .maxDecimals(2)
                .trim(true)
                .toString() + '%'}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              alignItems: 'flex-end'
            }}
          >
            <Text style={{ ...styles.textInfo, marginBottom: spacing['4'] }}>
              Voting power
            </Text>
            <Text style={{ ...styles.textBlock }}>
              {new CoinPretty(
                chainStore.current.stakeCurrency,
                new Dec(validator.tokens)
              )
                .maxDecimals(0)
                .toString()}
            </Text>
          </View>
        </View>

        <View
          style={{
            marginTop: spacing['20']
          }}
        >
          <Text
            style={{ ...styles.textInfo, marginBottom: spacing['4'] }}
          >{`Description`}</Text>
          <Text style={{ ...styles.textBlock }}>
            {validator.description.details}
          </Text>
        </View>
      </View>
      <RectButton
        style={{ ...styles.containerBtn }}
        onPress={() => {
          smartNavigation.navigateSmart('Delegate', {
            validatorAddress: validatorAddress
          });
        }}
      >
        <Text
          style={{ ...styles.textBtn, textAlign: 'center' }}
        >{`Stake now`}</Text>
      </RectButton>
    </PageWithScrollView>
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

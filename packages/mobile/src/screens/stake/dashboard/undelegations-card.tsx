import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../stores';
import { Card, CardBody } from '../../../components/card';
import { ViewStyle, View, StyleSheet } from 'react-native';
import { Text } from '@src/components/text';
import { useStyle } from '../../../styles';
import { useIntl } from 'react-intl';
import { ValidatorThumbnail } from '../../../components/thumbnail';
import { ProgressBar } from '../../../components/progress-bar';
import { BondStatus } from '@owallet/stores';
import { spacing } from '../../../themes';
import { useTheme } from '@src/themes/theme-provider';
export const UndelegationsCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, accountStore, queriesStore } = useStore();
  const { colors } = useTheme();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const unbondings =
    queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
      account.bech32Address
    ).unbondingBalances;

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Bonded
  );
  const unbondingValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Unbonding
  );
  const unbondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Unbonded
  );
  const stakingParams = queries.cosmos.queryStakingParams.response;

  const style = useStyle();

  const intl = useIntl();

  return (
    <Card
      style={{
        padding: spacing['28'],
        paddingBottom: spacing['14'],
        paddingTop: spacing['14'],
        marginTop: spacing['32'],
        borderRadius: spacing['24'],
        backgroundColor: colors['primary']
      }}
    >
      <CardBody
        style={{
          backgroundColor: colors['primary']
        }}
      >
        <Text
          style={[
            { color: colors['primary-text'] },
            style.flatten(['h6', 'self-center'])
          ]}
        >
          My Unstaking
        </Text>
        {unbondings.length > 0 ? null : (
          <Text
            style={[
              { color: colors['primary-text'] },
              style.flatten(['body2', 'color-text-black-low', 'padding-top-18'])
            ]}
          >
            {"You don't have any unbonding assets yet"}
          </Text>
        )}
        {unbondings.map((unbonding, unbondingIndex) => {
          const validator = bondedValidators.validators
            .concat(unbondingValidators.validators)
            .concat(unbondedValidators.validators)
            .find(val => val.operator_address === unbonding.validatorAddress);
          const thumbnail =
            bondedValidators.getValidatorThumbnail(
              unbonding.validatorAddress
            ) ||
            unbondingValidators.getValidatorThumbnail(
              unbonding.validatorAddress
            ) ||
            unbondedValidators.getValidatorThumbnail(
              unbonding.validatorAddress
            );
          const entries = unbonding.entries;
          const isLastUnbondingIndex = unbondingIndex === unbondings.length - 1;

          return (
            <React.Fragment key={unbondingIndex}>
              <View
                key={unbonding.validatorAddress}
                style={style.flatten(
                  ['padding-y-16'],
                  [isLastUnbondingIndex && 'padding-bottom-8']
                )}
              >
                <View style={style.flatten(['flex-row', 'items-center'])}>
                  <ValidatorThumbnail
                    size={32}
                    url={thumbnail}
                    style={{
                      backgroundColor: colors['purple-100'],
                      borderRadius: 32
                    }}
                  />
                  <Text
                    style={[
                      { color: colors['primary-text'] },
                      style.flatten(['margin-left-16', 'h7'])
                    ]}
                  >
                    {validator?.description.moniker ?? '...'}
                  </Text>
                </View>

                {entries.map((entry, i) => {
                  const remainingText = (() => {
                    const current = new Date().getTime();

                    const relativeEndTime =
                      (new Date(entry.completionTime).getTime() - current) /
                      1000;
                    const relativeEndTimeDays = Math.floor(
                      relativeEndTime / (3600 * 24)
                    );
                    const relativeEndTimeHours = Math.ceil(
                      relativeEndTime / 3600
                    );

                    if (relativeEndTimeDays) {
                      return (
                        intl
                          .formatRelativeTime(relativeEndTimeDays, 'days', {
                            numeric: 'always'
                          })
                          .replace('in ', '') + ' left'
                      );
                    } else if (relativeEndTimeHours) {
                      return (
                        intl
                          .formatRelativeTime(relativeEndTimeHours, 'hours', {
                            numeric: 'always'
                          })
                          .replace('in ', '') + ' left'
                      );
                    }

                    return '';
                  })();
                  const progress = (() => {
                    const currentTime = new Date().getTime();
                    const endTime = new Date(entry.completionTime).getTime();
                    const remainingTime = Math.floor(
                      (endTime - currentTime) / 1000
                    );
                    const unbondingTime = stakingParams
                      ? parseFloat(stakingParams.data.result.unbonding_time) /
                        10 ** 9
                      : 3600 * 24 * 21;

                    return 100 - (remainingTime / unbondingTime) * 100;
                  })();

                  return (
                    <View
                      key={i.toString()}
                      style={style.flatten(['padding-top-12'])}
                    >
                      <View
                        style={style.flatten([
                          'flex-row',
                          'items-center',
                          'margin-bottom-8'
                        ])}
                      >
                        <Text
                          style={[
                            { color: colors['primary-text'] },
                            ,
                            style.flatten(['subtitle2'])
                          ]}
                        >
                          {entry.balance
                            .shrink(true)
                            .trim(true)
                            .maxDecimals(6)
                            .toString()}
                        </Text>
                        <View style={style.get('flex-1')} />
                        <Text
                          style={style.flatten([
                            'body2',
                            'color-text-black-low'
                          ])}
                        >
                          {remainingText}
                        </Text>
                      </View>
                      <View>
                        <ProgressBar progress={progress} />
                      </View>
                    </View>
                  );
                })}
              </View>
              {!isLastUnbondingIndex && (
                <View
                  style={[
                    style.flatten(['height-1']),
                    {
                      backgroundColor: colors['divider']
                    }
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </CardBody>
    </Card>
  );
});

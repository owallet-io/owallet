import React, { FunctionComponent, useEffect } from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../../../themes';
import { ValidatorDetailsCard } from './validator-details-card';
import { useTheme } from '@src/themes/theme-provider';
import { tracking } from '@src/utils/tracking';
export const ValidatorDetailsScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          validatorAddress: string;
          apr: number;
          percentageVote: number;
        }
      >,
      string
    >
  >();
  const validatorAddress = route.params.validatorAddress;
  const apr = route.params.apr;
  const percentageVote = route.params.percentageVote;

  useEffect(() => {
    tracking(`Validator Detail Screen`);

    return () => {};
  }, []);

  return (
    <View>
      <ValidatorDetailsCard
        containerStyle={{
          ...styles.containerCard
        }}
        validatorAddress={validatorAddress}
        apr={apr}
        percentageVote={percentageVote}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  containerCard: {
    borderRadius: spacing['24'],
    paddingVertical: spacing['20'],
    paddingHorizontal: spacing['24'],
    marginTop: spacing['16']
  }
});

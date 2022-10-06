import React, { FunctionComponent } from 'react';
import {
  PageWithScrollView,
  PageWithScrollViewInBottomTabView
} from '../../../components/page';
import { RouteProp, useRoute } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '../../../themes';
import { ValidatorDetailsCard } from './validator-details-card';

export const ValidatorDetailsScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          validatorAddress: string;
          apr: number;
        }
      >,
      string
    >
  >();

  const validatorAddress = route.params.validatorAddress;
  const apr = route.params.apr;

  return (
    <PageWithScrollViewInBottomTabView>
      <ValidatorDetailsCard
        containerStyle={{
          ...styles.containerCard
        }}
        validatorAddress={validatorAddress}
        apr={apr}
      />
    </PageWithScrollViewInBottomTabView>
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

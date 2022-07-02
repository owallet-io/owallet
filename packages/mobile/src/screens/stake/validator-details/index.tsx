import React, { FunctionComponent } from 'react';
import { PageWithScrollView } from '../../../components/page';
import { RouteProp, useRoute } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import { StyleSheet } from 'react-native';
import { colors, spacing } from '../../../themes';
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
  return (
    <PageWithScrollView>
      <ValidatorDetailsCard
        containerStyle={{
          ...styles.containerCard
        }}
        validatorAddress={validatorAddress}
      />
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

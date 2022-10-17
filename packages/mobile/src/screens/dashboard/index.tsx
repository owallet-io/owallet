import React, { FunctionComponent, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { PageWithScrollView } from '../../components/page';
import { StyleSheet, View } from 'react-native';

import {
  AddressInput,
  AmountInput,
  MemoInput,
  CurrencySelector,
  FeeButtons,
  TextInput
} from '../../components/input';
import { colors, spacing, typography } from '../../themes';
import { CText as Text } from '../../components/text';
import { DashboardCard } from '../home/dashboard';

const styles = StyleSheet.create({});

export const DashBoardScreen: FunctionComponent = observer(() => {
  return (
    <PageWithScrollView>
      <View style={{ paddingVertical: spacing['24'] }}>
        <Text
          style={{
            ...typography['h3'],
            textAlign: 'center'
          }}
        >
          Dashboard
        </Text>
        <DashboardCard canView={false} />
      </View>
    </PageWithScrollView>
  );
});

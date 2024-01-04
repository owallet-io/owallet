import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { OWBox } from '../../components/card';
import { View, StyleSheet } from 'react-native';
import { Text } from '@src/components/text';
import { useStore } from '../../stores';
import { useTheme } from '@src/themes/theme-provider';
import { useCoinGeckoPrices } from '@owallet/hooks';
import { getTotalUsd } from '@oraichain/oraidex-common';

export const AccountBoxAll: FunctionComponent<{
  totalBalance?: string | React.ReactNode;
}> = observer(({ totalBalance }) => {
  const { colors } = useTheme();

  const styles = styling(colors);
  const { data: prices } = useCoinGeckoPrices();
  const { universalSwapStore } = useStore();
  let totalUsd: number = getTotalUsd(universalSwapStore.getAmount, prices);

  return (
    <View
      style={{
        marginHorizontal: 24
      }}
    >
      <OWBox type="gradient">
        <View style={styles.overview}>
          <Text style={styles.titleTotalBalance}>Total Balance</Text>
          {!!totalBalance ? (
            <Text variant="h1" style={styles.textCenter} color={colors['white']}>
              {totalBalance || 0}
            </Text>
          ) : null}
          {!!totalUsd && <Text style={styles.labelTotalAmount}>${totalUsd.toFixed(6)}</Text>}
        </View>
      </OWBox>
    </View>
  );
});

const styling = colors =>
  StyleSheet.create({
    overview: {
      marginBottom: 16
    },

    titleTotalBalance: {
      textAlign: 'center',
      color: colors['purple-400'],
      fontSize: 14,
      lineHeight: 20
    },
    labelTotalAmount: {
      textAlign: 'center',
      color: colors['neutral-surface-card'],
      fontSize: 28
    },
    textCenter: {
      textAlign: 'center'
    }
  });

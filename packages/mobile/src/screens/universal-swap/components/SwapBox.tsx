import { View, StyleSheet } from 'react-native';
import React, { FunctionComponent, ReactNode, useMemo } from 'react';
import { TypeTheme, useTheme } from '@src/themes/theme-provider';
import { observer } from 'mobx-react-lite';
import { OWBox } from '@src/components/card';
import { ISwapBox } from '../types';
import InputSelectToken from './InputSelectToken';
import { BalanceText } from './BalanceText';

export const SwapBox: FunctionComponent<ISwapBox> = observer(
  ({ feeValue, tokenActive, currencyValue, balanceValue, ...props }) => {
    console.log('balanceValue', balanceValue);

    const { colors } = useTheme();
    const styles = styling(colors);
    return (
      <OWBox
        style={{
          ...styles.containerInfo
        }}
      >
        <InputSelectToken tokenActive={tokenActive} {...props} />
        <View style={styles.containerItemBottom}>
          <View>
            <BalanceText weight="500">
              Balance: {balanceValue || 0.0}
            </BalanceText>
            {/* <BalanceText size={13} style={styles.pt2} weight="500">
              Fee: {feeValue || 0}%
            </BalanceText> */}
          </View>
          <BalanceText weight="500">≈ ${currencyValue || 0}</BalanceText>
        </View>
      </OWBox>
    );
  }
);

const styling = (colors: TypeTheme['colors']) =>
  StyleSheet.create({
    pt2: {
      paddingTop: 2
    },
    containerItemBottom: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    flR: {
      flexDirection: 'row'
    },
    h35: {
      height: 25
    },
    h30: {
      height: 30
    },
    containerInfo: {
      borderRadius: 8,
      padding: 16,
      backgroundColor: colors['bg-swap-box'],
      marginTop: 4
    },
    flr: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    ic: {
      backgroundColor: colors['content-background'],
      width: 24,
      height: 24,
      borderRadius: 4,
      marginLeft: 4
    },
    label: {
      color: colors['label-text'],
      fontSize: 12,
      fontWeight: '600'
    },
    pt16: {
      paddingTop: 16
    },
    jsc: {
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '80%'
    },
    jc: {
      alignItems: 'center'
    }
  });

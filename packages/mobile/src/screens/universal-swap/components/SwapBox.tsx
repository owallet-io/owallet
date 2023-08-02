import { View, StyleSheet } from 'react-native';
import React, { FunctionComponent, ReactNode, useMemo } from 'react';
import { Text } from '@src/components/text';
import { TypeTheme, useTheme } from '@src/themes/theme-provider';
import { observer } from 'mobx-react-lite';
import { OWBox } from '@src/components/card';
import { checkFnComponent } from '../helpers';
import { BalanceTextProps, ISwapBox } from '../types';
import InputSelectToken from './InputSelectToken';
import { OWTextProps } from '@src/components/text/ow-text';
import { BalanceText } from './BalanceText';

export const SwapBox: FunctionComponent<ISwapBox> = observer(
  ({
    titleLeft,
    titleRight,
    labelInputLeft,
    labelInputRight,
    feeLabel,
    feeValue,
    tokensData
  }) => {
    const { colors } = useTheme();
    const styles = styling(colors);
    const handleShowTitle = useMemo(() => {
      return checkFnComponent(
        titleRight,
        <BalanceText>{titleRight}</BalanceText>
      );
    }, [titleRight]);
    const handleShowLabelRight = useMemo(() => {
      return checkFnComponent(
        labelInputRight,
        <BalanceText>{labelInputRight}</BalanceText>
      );
    }, [labelInputRight]);
    const handleShowfeeLabel = useMemo(() => {
      return checkFnComponent(feeLabel, <BalanceText>{feeLabel}</BalanceText>);
    }, [feeLabel]);
    return (
      <OWBox
        style={{
          ...styles.containerInfo
        }}
      >
        {/* <View style={[styles.flr, styles.h35]}>
          {!!labelInputLeft && (
            <View style={styles.flR}>
              <BalanceText>Balance:</BalanceText>
              <BalanceText> {labelInputLeft}</BalanceText>
            </View>
          )}
          {handleShowLabelRight}
        </View> */}

        <InputSelectToken />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          {/* {handleShowfeeLabel} */}
          <View>
            <BalanceText size={12}>Balance: 1000000000</BalanceText>
            <BalanceText size={12}>Fee: 0.1%</BalanceText>
          </View>
          {/* {!!feeValue && <BalanceText>{feeValue}%</BalanceText>} */}
          <BalanceText>≈ $2000</BalanceText>
        </View>
      </OWBox>
    );
  }
);

const styling = (colors: TypeTheme['colors']) =>
  StyleSheet.create({
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
    },
    priceInput: {
      justifyContent: 'space-between',
      paddingVertical: 10
    },
    swapIcon: {
      width: 32,
      height: 32,
      borderRadius: 32,
      backgroundColor: colors['content-background'],
      position: 'absolute',
      bottom: -16,
      alignSelf: 'center'
    }
  });

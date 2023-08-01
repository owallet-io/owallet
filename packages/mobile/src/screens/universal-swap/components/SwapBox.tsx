import { View, StyleSheet } from 'react-native';
import React, { FunctionComponent, ReactNode, useMemo } from 'react';
import { Text } from '@src/components/text';
import { useTheme } from '@src/themes/theme-provider';
import { observer } from 'mobx-react-lite';
import { OWBox } from '@src/components/card';
import { checkFnComponent } from '../helpers';
import { ISwapBox } from '../types';

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
        <Text color="#777E90">{titleRight}</Text>
      );
    }, [titleRight]);
    const handleShowLabelRight = useMemo(() => {
      return checkFnComponent(
        labelInputRight,
        <Text color="#777E90">{labelInputRight}</Text>
      );
    }, [labelInputRight]);
    const handleShowfeeLabel = useMemo(() => {
      return checkFnComponent(
        feeLabel,
        <Text color="#777E90">{feeLabel}</Text>
      );
    }, [feeLabel]);
    return (
      <OWBox
        style={{
          ...styles.containerInfo
        }}
      >
        <View style={[styles.flr, styles.h30]}>
          <Text weight="900">{titleLeft}</Text>
          {handleShowTitle}
        </View>
        <View style={[styles.flr, styles.pt16, styles.h40]}>
          {!!labelInputLeft && (
            <Text color={'#777E90'}>Balance: {labelInputLeft}</Text>
          )}
          {handleShowLabelRight}
        </View>
        <View style={[styles.flr, styles.priceInput]}>
          <View style={[styles.flr, styles.pt16]}>
            <View style={styles.ic} />
            <View style={styles.ic} />
          </View>
          <View style={styles.ic} />
        </View>
        <View style={[styles.flr, styles.pt16]}>
          {handleShowfeeLabel}
          {!!feeValue && <Text color={'#777E90'}>{feeValue}%</Text>}
        </View>
      </OWBox>
    );
  }
);

const styling = (colors: object) =>
  StyleSheet.create({
    h40: {
      height: 40
    },
    h30: {
      height: 30
    },
    containerInfo: {
      borderRadius: 12,
      padding: 20,
      backgroundColor: colors['background-box'],
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
      backgroundColor: colors['content-background'],
      marginTop: 16
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

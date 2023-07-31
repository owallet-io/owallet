import { View, StyleSheet } from 'react-native';
import React, { FunctionComponent } from 'react';
import { Text } from '@src/components/text';
import { useTheme } from '@src/themes/theme-provider';
import { observer } from 'mobx-react-lite';
import { OWBox } from '@src/components/card';

export const SwapBox: FunctionComponent<{
  token: unknown;
  withSwapIcon?: boolean;
}> = observer(({ token, withSwapIcon }) => {
  const { colors } = useTheme();
  const styles = styling(colors);
  return (
    <OWBox
      type="shadow"
      style={{
        ...styles.containerInfo,
        zIndex: withSwapIcon ? 999 : 1
      }}
    >
      <View style={styles.flr}>
        <Text style={styles.label}>FROM</Text>
        <View style={styles.flr}>
          <View style={styles.ic} />
          <View style={styles.ic} />
        </View>
      </View>
      <View style={[styles.flr, styles.pt16, styles.jc]}>
        <View style={[styles.flr, styles.jsc]}>
          <Text style={styles.label}>Balance: 8.888 ORAI</Text>
          <View style={styles.ic} />
          <View style={styles.ic} />
        </View>
        <Text style={styles.label}>~$0.00</Text>
      </View>
      <View style={[styles.flr, styles.priceInput]}>
        <View style={[styles.flr, styles.pt16]}>
          <View style={styles.ic} />
          <View style={styles.ic} />
        </View>
        <View style={styles.ic} />
      </View>
      <View style={[styles.flr, styles.pt16]}>
        <Text style={styles.label}>Token Fee</Text>
        <Text style={styles.label}>0%</Text>
      </View>
      {withSwapIcon ? <View style={styles.swapIcon} /> : null}
    </OWBox>
  );
});

const styling = (colors: object) =>
  StyleSheet.create({
    containerInfo: {
      borderRadius: 12,
      padding: 20,
      paddingTop: 20,
      backgroundColor: colors['background-box'],
      marginTop: 4
    },
    flr: {
      flexDirection: 'row',
      justifyContent: 'space-between'
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

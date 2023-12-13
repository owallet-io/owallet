import { View } from 'react-native';
import React, { FunctionComponent } from 'react';
import { colors, spacing } from '../../themes';

export const ProgressBar: FunctionComponent<{
  progress: number;
  styles?: object;
}> = ({ progress = 0, styles = [] }) => {
  return (
    <View
      style={{
        height: spacing['8'],
        backgroundColor: colors['primary-50'],
        borderRadius: spacing['32'],
        overflow: 'hidden',
        ...styles
      }}
    >
      <View
        style={{
          height: spacing['8'],
          backgroundColor: colors['purple-700'],
          borderRadius: spacing['32'],
          width: `${progress}%`
        }}
      />
    </View>
  );
};

import { View } from 'react-native';
import React, { FunctionComponent } from 'react';
import { colors, spacing } from '../../themes';

export const ProgressBar: FunctionComponent<{
  progress: number;
  styles?: Array<string>;
}> = ({ progress = 0, styles = [] }) => {
  return (
    <View
      style={{
        height: spacing['12'],
        backgroundColor: colors['secondary-500'],
        borderRadius: spacing['32'],
        overflow: 'hidden',
        ...styles
      }}
    >
      <View
        style={{
          height: spacing['12'],
          backgroundColor: colors['primary'],
          borderRadius: spacing['32'],
          width: `${progress}%`
        }}
      />
    </View>
  );
};

import { metrics } from '@src/themes';
import { useTheme } from '@src/themes/theme-provider';
import React, { FunctionComponent } from 'react';
import { View, ViewStyle } from 'react-native';
import OWIcon from '../ow-icon/ow-icon';
import { Text } from '../text';

export const WarningBox: FunctionComponent<{
  style?: ViewStyle;
  url?: string;
  size: number;
}> = ({ style: propStyle }) => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        overflow: 'hidden',
        justifyContent: 'center',
        borderRadius: 8,
        margin: 16,
        marginBottom: 0
      }}
    >
      <View
        style={{
          borderRadius: 12,
          backgroundColor: colors['warning-surface-subtle'],
          padding: 12,
          borderWidth: 1,
          borderColor: colors['warning-border-default']
        }}
      >
        <View style={{ flexDirection: 'row', paddingBottom: 6, alignItems: 'center' }}>
          <OWIcon name="tdesignerror-triangle" color={colors['warning-text-body']} size={16} />
          <Text style={{ paddingLeft: 4 }} color={colors['warning-border-default']} weight="600" size={16}>
            Warning
          </Text>
        </View>
        <Text color={colors['warning-border-default']} weight="500" size={14}>
          Please backup your mnemonic / private key!
        </Text>
      </View>
    </View>
  );
};

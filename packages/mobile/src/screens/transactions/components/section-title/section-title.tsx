import React, { FunctionComponent } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from '@src/components/text';
import { RefreshIcon } from '../../../../components/icon/refresh';
import { spacing, typography } from '../../../../themes';
import { useTheme } from '@src/themes/theme-provider';

export const TransactionSectionTitle: FunctionComponent<{
  title: string;
  right?: React.ReactElement;
  containerStyle?: ViewStyle;

  onPress?: () => void;
}> = ({ title, right, onPress, containerStyle }) => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        ...styles.container,
        ...containerStyle
      }}
    >
      <Text style={[styles.textTitle, { color: colors['text-label-list'] }]}>
        {title && title.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())}
      </Text>
      {right ?? <RefreshIcon onPress={onPress} color={colors['primary-surface-default']} size={24} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing['20'],
    paddingTop: spacing['16'],
    paddingBottom: spacing['12'],
    marginTop: spacing['16'],
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  textTitle: {
    ...typography.body2
  }
});

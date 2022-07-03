import React, { FunctionComponent } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { CText as Text } from '../../../../components/text';
import { RefreshIcon } from '../../../../components/icon/refresh';
import { colors, spacing, typography } from '../../../../themes';

export const TransactionSectionTitle: FunctionComponent<{
  title: string;
  right?: React.ReactElement;
  containerStyle?: ViewStyle;

  onPress?: () => void;
}> = ({ title, right, onPress, containerStyle }) => {
  return (
    <View
      style={{
        ...styles.container,
        ...containerStyle
      }}
    >
      <Text style={styles.textTitle}>
        {title &&
          title.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())}
      </Text>
      <RefreshIcon onPress={onPress} color={'#4334F1'} size={24} />
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
    color: colors['gray-300'],
    ...typography.body2
  }
});

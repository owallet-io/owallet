import { StyleSheet, View, ViewStyle } from 'react-native';
import React, { FC } from 'react';
import { Text } from '@src/components/text';
import { OWBox } from '@src/components/card';
import { useTheme } from '@src/themes/theme-provider';

const TransactionBox: FC<{
  label?: string;
  style?: ViewStyle;
  styleBox?: ViewStyle;
  subLabel?: string;
}> = ({ label, children, subLabel, style, styleBox }) => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        paddingTop: 20,
        ...style
      }}
    >
      <Text color={colors['blue-300']} typo="regular" variant="body1">
        {label}
        {subLabel ? (
          <>
            {' '}
            (
            <Text weight="400" size={14.5} color={colors['primary-surface-default']}>
              {subLabel}
            </Text>
            )
          </>
        ) : null}
      </Text>
      <OWBox style={[styles.containerBox, styleBox]}>{children}</OWBox>
    </View>
  );
};

export default TransactionBox;

const styles = StyleSheet.create({
  containerBox: {
    width: '100%',
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 11
  },
  title: {
    marginTop: 24
  }
});

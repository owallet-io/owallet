import { StyleSheet, View } from 'react-native';
import React, { FC } from 'react';
import { Text } from '@src/components/text';
import { OWBox } from '@src/components/card';
import { useTheme } from '@src/themes/theme-provider';

const TransactionBox: FC<{
  label?: string;
  subLabel?: string;
}> = ({ label, children, subLabel }) => {
  const { colors } = useTheme();
  return (
    <>
      <Text
        color={colors['icon-text']}
        style={styles.title}
        typo="regular"
        variant="body1"
      >
        {label}
        {subLabel ? (
          <>{' '}(
            <Text weight='400' size={14.5} color={colors['purple-700']}>
              {subLabel}
            </Text>
            )
          </>
        ) : null}
      </Text>
      <OWBox style={styles.containerBox}>{children}</OWBox>
    </>
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

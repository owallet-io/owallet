import { StyleSheet, View } from 'react-native';
import React, { FC } from 'react';
import { Text } from '@src/components/text';
import { useTheme } from '@src/themes/theme-provider';
import ItemDivided from './item-divided';
import { OWTextProps } from '@src/components/text/ow-text';
import OWIcon from '@src/components/ow-icon/ow-icon';

const ItemDetail: FC<{
  label?: string;
  value?: string;
  borderBottom?: boolean;
  valueProps?: OWTextProps;
  iconComponent?: React.ReactNode;
}> = ({
  label = '--',
  value = '--',
  borderBottom = true,
  valueProps,
  iconComponent
}) => {
  const { colors } = useTheme();
  return (
    <View>
      <View style={styles.containerItemDetail}>
        <Text color={colors['text-label-transaction-detail']} variant="body2">
          {label}
        </Text>
        <View style={styles.wrapRightItem}>
          {iconComponent && (
            <View
              style={{
                paddingHorizontal: 10
              }}
            >
              {iconComponent}
            </View>
          )}
          <Text
            color={colors['text-title-login']}
            variant="body1"
            {...valueProps}
          >
            {value}
          </Text>
        </View>
      </View>
      {borderBottom && <ItemDivided />}
    </View>
  );
};

export default ItemDetail;

const styles = StyleSheet.create({
  wrapRightItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  containerItemDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50
  }
});

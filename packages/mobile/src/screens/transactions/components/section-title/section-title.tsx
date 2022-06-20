import React, { FunctionComponent } from 'react';
import { Text, View } from 'react-native';
import { RefreshIcon } from '../../../../components/icon/refresh';
import { useStyle } from '../../../../styles';

export const TransactionSectionTitle: FunctionComponent<{
  title: string;
  right?: React.ReactElement;

  onPress?: () => void
}> = ({ title , right , onPress }) => {
  const style = useStyle();
  return (
    <View
      style={style.flatten([
        'padding-x-20',
        'padding-top-16',
        'padding-bottom-12',
        'margin-top-16',
        'flex-row',
        'items-center',
        'justify-between',
      ])}
    >
      <Text style={style.flatten(['color-text-black-low','body2'])}>
        {title &&
          title.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
            letter.toUpperCase()
          )}
      </Text>
      {right ? right : <RefreshIcon onPress={onPress} color={'#4334F1'} size={24} />}
    </View>
  );
};

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import OWHeaderTitle from '@src/components/header/ow-header-title';
import OWHeaderRight from '@src/components/header/ow-header-right';
import { useTheme } from '@src/themes/theme-provider';
import OWButtonIcon from '@src/components/button/ow-button-icon';
import { StackNavigationOptions } from '@react-navigation/stack';
import { useSmartNavigation } from '@src/navigation.provider';
interface IUseHeaderOptions extends StackNavigationOptions {}
const useHeaderOptions = (data?: IUseHeaderOptions) => {
  const navigation = useNavigation();
  const smartNavigation = useSmartNavigation();
  const { colors } = useTheme();
  const [options, setOptions] = useState<any>({
    headerStyle: {
      backgroundColor: colors['background']
    },
    headerTitle: <OWHeaderTitle title={data?.title} />,
    headerTitleAlign: 'center',
    headerRight: () => {
      if (!!data?.title == false) {
        return <OWHeaderRight onTransaction={onTransaction} onScan={onScan} />;
      }
    },
    headerBackTitle: () => (
      <OWButtonIcon onPress={onGoBack} name="arrow-left" sizeIcon={24} />
    ),
    ...data
  });
  const onGoBack = () => {
    if (navigation.canGoBack) {
        navigation.goBack();
        return;
      }
      if (smartNavigation.canGoBack) {
        smartNavigation.goBack();
        return;
      }
      navigation.navigate('MainTab');
  };
  const onTransaction = () => {
    navigation.navigate('Others', {
      screen: 'Transactions'
    });
  };
  const onScan = () => {
    navigation.navigate('Others', {
      screen: 'Camera'
    });
  };

  return {
    ...options
  };
};

export default useHeaderOptions;

const styles = StyleSheet.create({});

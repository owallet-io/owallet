import { View, Text } from 'react-native';
import React, { FC } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { useStyle } from '@src/styles';
import { useTheme } from '@src/themes/theme-provider';
import { useStore } from '@src/stores';
import {
  BlurredHeaderScreenOptionsPreset,
  getPlainHeaderScreenOptionsPresetWithBackgroundColor,
  HeaderRightButton,
  PlainHeaderScreenOptionsPreset
} from '@src/components/header';
import { SCREENS, SCREENS_OPTIONS } from '@src/common/constants';
import { SettingScreen } from '@src/screens/setting';
import { OWalletVersionScreen } from '@src/screens/setting/screens/version';
import { ViewPrivateDataScreen } from '@src/screens/setting/screens/view-private-data';
import { SettingSelectAccountScreen } from '@src/screens/setting/screens/select-account';
import { HeaderAddIcon } from '@src/components/header/icon';
import useHeaderOptions from '@src/hooks/use-header';
import { UniversalSwapScreen } from '@src/screens/universal-swap';
const Stack = createStackNavigator();
export const UniversalSwapStackScreen: FC = () => {
  const style = useStyle();

  const navigation = useNavigation();
  const { colors } = useTheme();
  const { analyticsStore, appInitStore } = useStore();
  const handleScreenOptions = ({ route, navigation }) => {
    appInitStore.updateVisibleTabBar(route?.name);
    const headerOptions = useHeaderOptions(
      { title: SCREENS_OPTIONS[route?.name].title },
      navigation
    );
    return headerOptions;
  };
  return (
    <Stack.Navigator
      screenOptions={handleScreenOptions}
      initialRouteName={SCREENS.UniversalSwap}
    >
      <Stack.Screen
        options={{
          headerLeft: null
        }}
        name={SCREENS.UniversalSwap}
        component={UniversalSwapScreen}
      />
    </Stack.Navigator>
  );
};

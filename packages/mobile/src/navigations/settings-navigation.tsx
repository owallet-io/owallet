import { View, Text } from "react-native";
import React, { FC } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { useStyle } from "@src/styles";
import { useTheme } from "@src/themes/theme-provider";
import { useStore } from "@src/stores";
import {
  BlurredHeaderScreenOptionsPreset,
  getPlainHeaderScreenOptionsPresetWithBackgroundColor,
  HeaderRightButton,
  PlainHeaderScreenOptionsPreset,
} from "@src/components/header";
import { SCREENS, SCREENS_OPTIONS } from "@src/common/constants";
import { SettingScreen } from "@src/screens/setting";
import { OWalletVersionScreen } from "@src/screens/setting/screens/version";
import { ViewPrivateDataScreen } from "@src/screens/setting/screens/view-private-data";
import { SettingSelectAccountScreen } from "@src/screens/setting/screens/select-account";
import { HeaderAddIcon } from "@src/components/header/icon";
import useHeaderOptions from "@src/hooks/use-header";
import { BackupMnemonicScreen } from "@src/screens/register/mnemonic/backup-mnemonic";
import { NewSettingScreen } from "@src/screens/setting/setting";
import { navigate } from "@src/router/root";
const Stack = createStackNavigator();
export const SettingStackScreen: FC = () => {
  const style = useStyle();

  const navigation = useNavigation();
  const { colors } = useTheme();
  const { analyticsStore, appInitStore } = useStore();
  const handleScreenOptions = ({ route, navigation }) => {
    appInitStore.updateVisibleTabBar(route?.name);
    const headerOptions = useHeaderOptions(
      { title: SCREENS_OPTIONS[route?.name]?.title },
      navigation
    );
    return headerOptions;
  };
  return (
    <Stack.Navigator screenOptions={handleScreenOptions}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
        name={SCREENS.Setting}
        // component={SettingScreen}
        component={NewSettingScreen}
      />
      <Stack.Screen
        name={SCREENS.SettingSelectAccount}
        options={{
          headerRight: () => (
            <HeaderRightButton
              onPress={() => {
                analyticsStore.logEvent("Add additional account started");
                navigate(SCREENS.RegisterIntro, {
                  canBeBack: true,
                });
              }}
            >
              <HeaderAddIcon />
            </HeaderRightButton>
          ),
        }}
        component={SettingSelectAccountScreen}
      />

      <Stack.Screen
        name={SCREENS.SettingViewPrivateData}
        component={ViewPrivateDataScreen}
      />
      <Stack.Screen
        name={SCREENS.SettingBackupMnemonic}
        component={BackupMnemonicScreen}
      />
      <Stack.Screen
        name={SCREENS.SettingVersion}
        component={OWalletVersionScreen}
      />
    </Stack.Navigator>
  );
};

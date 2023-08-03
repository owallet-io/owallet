// import React, { FC } from 'react';
// import { createStackNavigator } from '@react-navigation/stack';
// import { useNavigation } from '@react-navigation/native';
// import { useStyle } from '@src/styles';
// import { useTheme } from '@src/themes/theme-provider';
// import { useStore } from '@src/stores';
// import { getPlainHeaderScreenOptionsPresetWithBackgroundColor } from '@src/components/header';
// import { SCREENS, SCREENS_OPTIONS } from '@src/common/constants';

// import useHeaderOptions from '@src/hooks/use-header';
// import { UniversalSwapScreen } from '@src/screens/universal-swap';
// const Stack = createStackNavigator();
// export const UniversalSwapStackScreen: FC = () => {
//   const style = useStyle();

//   const navigation = useNavigation();
//   const { colors } = useTheme();
//   const { analyticsStore, appInitStore } = useStore();
//   const handleScreenOptions = ({ route, navigation }) => {
//     appInitStore.updateVisibleTabBar(route?.name);
//     const headerOptions = useHeaderOptions(
//       { title: SCREENS_OPTIONS[route?.name].title },
//       navigation
//     );
//     return headerOptions;
//   };
//   return (
//     <Stack.Navigator screenOptions={handleScreenOptions} headerMode="screen">
//       <Stack.Screen
//         options={{
//           headerShown: false,
//           title: 'Universal Swap',
//           ...getPlainHeaderScreenOptionsPresetWithBackgroundColor(
//             style.get('color-setting-screen-background').color
//           ),
//           headerTitleStyle: style.flatten(['h3', 'color-text-black-high'])
//         }}
//         name={SCREENS.UniversalSwap}
//         component={UniversalSwapScreen}
//       />
//     </Stack.Navigator>
//   );
// };

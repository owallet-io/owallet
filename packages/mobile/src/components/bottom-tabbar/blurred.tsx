// import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
// import { BottomTabBar, BottomTabBarProps } from '@react-navigation/bottom-tabs';
// import { Animated, Platform, StyleSheet, View } from 'react-native';
// import { BlurView } from '@react-native-community/blur';
// import { useFocusedScreen } from '../../providers/focused-screen';
// import { useTheme } from '@src/themes/theme-provider';

// export const BlurredBottomTabBar: FunctionComponent<
//   BottomTabBarProps & {
//     enabledScreens?: string[];
//   }
// > = (props) => {
//   if (Platform.OS === 'android') {
//     return <AndroidAlternativeBlurredBottomTabBar {...props} />;
//   }

//   const { style, enabledScreens = [], visibleTabBar, ...rest } = props;
//   const [opacity] = useState(new Animated.Value(0));
//   const [isDoneAnimated, setIsDoneAnimated] = useState(false);
//   useEffect(() => {
//     if (visibleTabBar) {
//       setIsDoneAnimated(false);
//       Animated.timing(opacity, {
//         toValue: 1,
//         duration: 200,
//         useNativeDriver: true
//       }).start(() => {
//         setIsDoneAnimated(true);
//       });
//     } else {
//       setIsDoneAnimated(false);
//       Animated.timing(opacity, {
//         toValue: 0,
//         duration: 200,
//         useNativeDriver: true
//       }).start(() => {
//         setIsDoneAnimated(true);
//       });
//     }
//     return () => {};
//   }, [visibleTabBar]);
//   const { colors } = useTheme();

//   // eslint-disable-next-line react-hooks/rules-of-hooks
//   const focusedScreen = useFocusedScreen();

//   const containerOpacity = (() => {
//     if (enabledScreens.length === 0) {
//       return 0.75;
//     }

//     if (focusedScreen.name && enabledScreens.includes(focusedScreen.name)) {
//       return 0.75;
//     }

//     return 1;
//   })();
//   return (
//     <View>
//       <BlurView
//         style={{
//           position: 'absolute',
//           width: '100%',
//           bottom: 0
//         }}
//         blurType="light"
//         blurAmount={80}
//         reducedTransparencyFallbackColor={colors['primary']}
//       >
//         <View
//           style={{
//             position: 'absolute',
//             top: 0,
//             bottom: 0,
//             left: 0,
//             right: 0,
//             backgroundColor: colors['primary'],

//           }}
//         />
//         <BottomTabBar
//           // Why type error??
//           // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//           // @ts-ignore
//           style={StyleSheet.flatten([
//             style,
//             {
//               backgroundColor: '#FFFFFF00',
//               display: !visibleTabBar && isDoneAnimated ? 'none' : 'flex'
//             }
//           ])}
//           {...rest}
//         />
//       </BlurView>
//     </View>
//   );
// };

// const AndroidAlternativeBlurredBottomTabBar: FunctionComponent<
//   BottomTabBarProps
// > = (props) => {
//   return (
//     <View
//       style={{
//         position: 'absolute',
//         width: '100%',
//         bottom: 0,
//       }}
//     >
//       <BottomTabBar {...props} />
//     </View>
//   );
// };

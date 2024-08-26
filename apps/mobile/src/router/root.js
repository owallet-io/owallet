import { StackActions } from '@react-navigation/routers';
import * as React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const navigationRef = React.createRef();

export const NavigationAction = navigationRef.current;

export function navigate(name, params) {
  // This action accept push same screen but it's can be push duplicate when user press so fast
  const pushAction = StackActions.push(name, params);
  navigationRef.current.dispatch(pushAction);
  // navigationRef.current.navigate(name, params);
}

export function getRouteName() {
  return navigationRef.current.getCurrentRoute().name;
}

export function goBack() {
  if (navigationRef.current?.canGoBack?.()) {
    navigationRef.current?.goBack?.();
  }
}

export const popToTop = () => {
  const routeLength =
    navigationRef.current.getRootState()?.routes?.[0]?.state?.routes?.[0]?.state
      ?.routes?.length;

  if (routeLength && routeLength > 1) {
    navigationRef.current.dispatch(StackActions.popToTop());
    return;
  }
  goBack();
};

export const checkRouter = (uri, route) => {
  return uri == route;
};

function BottomTabBar() {
  // const bottomTabBarHeight = useBottomTabBarHeight();
  const { bottom } = useSafeAreaInsets();
  return bottom + 100;
}

export const checkRouterPaddingBottomBar = (uri, route) => {
  if (BottomTabBar()) return uri == route ? BottomTabBar() : 0;
  return 0;
};

import * as React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// eslint-disable-next-line import/no-extraneous-dependencies
import { StackActions } from "@react-navigation/routers";
import { SCREENS } from "@src/common/constants";
import { HeaderOptions } from "@react-navigation/elements";
import { StackNavigationOptions } from "@react-navigation/stack";

interface Params {
  params?: any;
  screen?: string | "Other";
}
export const navigationRef: any = React.createRef();

export const NavigationAction = navigationRef.current;

export const setOptions = (options: StackNavigationOptions) => {
  // Ensure `NavigationAction` exists before calling `setOptions`
  if (NavigationAction) {
    NavigationAction.setOptions(options);
  }
};
export function navigate(name, params?: any) {
  if (
    !Object.values(SCREENS).includes(name) &&
    Object.values(SCREENS.TABS).includes(name)
  ) {
    return navigate(SCREENS.STACK.MainTab, { screen: name });
  }
  const pushAction = StackActions.push(name, params);
  const { routes = [] } = navigationRef.current?.getRootState?.() || {};
  const isExist =
    routes.findIndex((item) => {
      if (
        item.name === name
        //   &&
        // JSON.stringify(item.params) === JSON.stringify(params)
      ) {
        return true;
      }
      return false;
    }) >= 0;
  if (isExist || params?.forceNavigate) {
    navigationRef.current?.navigate?.(name, params);
    return;
  }
  navigationRef.current?.dispatch?.(pushAction);
}

export function resetTo(name: string, params?: any) {
  navigationRef.current?.reset({
    index: 0,
    routes: [
      {
        name: name,
        params,
      },
    ],
  });
}

export function getRouteName() {
  return navigationRef.current.getCurrentRoute().name;
}

export function goBack(fallback?: any) {
  if (navigationRef.current?.canGoBack?.()) {
    navigationRef.current?.goBack?.();
  } else {
    fallback?.();
  }
}

export const popTo = (screenName) => {
  const { routes = [] } = navigationRef.current?.getRootState?.() || {};

  const index = routes.reverse().findIndex((item) => item.name === screenName);
  if (navigationRef.current?.canGoBack?.() && index > 0) {
    navigationRef.current?.dispatch(StackActions.pop(index));
  }
};

export const popToTop = () => {
  const { routes = [] } = navigationRef.current?.getRootState?.() || {};

  if (routes?.length > 1) {
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

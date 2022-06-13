import { StackActions } from '@react-navigation/routers';
import * as React from 'react';

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

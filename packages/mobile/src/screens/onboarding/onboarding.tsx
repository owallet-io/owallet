import React , { FunctionComponent } from "react";
import { observer } from 'mobx-react-lite';
import { GatewayIntroScreen } from './gateway_intro';
import { WelcomeIntroScreen } from './welcome_intro';
import { ManageIntroScreen } from './manage_intro';

export const OnboardingIntroScreen: FunctionComponent = observer(() => {
  return <>
    <GatewayIntroScreen />
    <WelcomeIntroScreen />
    <ManageIntroScreen />
  </>;
});

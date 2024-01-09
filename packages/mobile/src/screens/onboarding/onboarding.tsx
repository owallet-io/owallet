import React, { FunctionComponent, useState } from 'react';
import { observer } from 'mobx-react-lite';
import GatewayIntroScreen from './gateway_intro';
import ManageIntroScreen from './manage_intro';
import WelcomeIntroScreen from './welcome_intro';
import AppIntroSlider from 'react-native-app-intro-slider';
import { View, Image, StyleSheet, Platform } from 'react-native';
import { colors, metrics } from '../../themes';
import { PageWithScrollView } from '../../components/page';
import { useGetHeightHeader } from '@src/hooks/use-height-header';
import { useStore } from '@src/stores';
import { useSmartNavigation } from '@src/navigation.provider';
import { useSimpleTimer } from '@src/hooks';
import { OWButton } from '@src/components/button';
import { ProgressBar } from '@src/components/progress-bar';

const slides = [
  {
    key: 1,
    component: <WelcomeIntroScreen />
  },
  {
    key: 2,
    component: <ManageIntroScreen />
  }
  // {
  //   key: 3,
  //   component: <GatewayIntroScreen />
  // }
];

const styling = () => {
  return StyleSheet.create({
    onBoardingRoot: {
      height: metrics.screenHeight,
      backgroundColor: colors['white']
    },
    getStarted: {
      position: 'absolute',
      bottom: 20,
      width: metrics.screenWidth - 32,
      marginHorizontal: 16,
      borderRadius: 999
    },
    progress: {
      position: 'absolute',
      top: 60,
      zIndex: 9,
      marginHorizontal: 16
    }
  });
};

export const OnboardingIntroScreen: FunctionComponent = observer(() => {
  const { appInitStore } = useStore();
  const [slide, setSlide] = useState(0);
  const smartNavigation = useSmartNavigation();
  const { isTimedOut, setTimer } = useSimpleTimer();
  const onGetStarted = async () => {
    await appInitStore.updateInitApp();
    setTimer(1000);
    setTimeout(() => {
      smartNavigation.navigateSmart('Register.Intro', {});
    }, 1000);
  };
  const renderItem = ({ item }) => {
    return <View>{item.component}</View>;
  };

  const styles = styling();
  return (
    <View>
      <View style={[{ ...styles.onBoardingRoot }]}>
        <View style={styles.progress}>
          <ProgressBar
            progress={(slide + 1) * 50}
            styles={{
              width: metrics.screenWidth - 32,
              height: 6,
              backgroundColor: colors['gray-250']
            }}
            progressColor={colors['green-active']}
          />
        </View>

        <AppIntroSlider
          renderItem={renderItem}
          data={slides}
          showNextButton={false}
          dotStyle={{ display: 'none' }}
          onSlideChange={s => {
            setSlide(s);
          }}
          showDoneButton={false}
        />
      </View>
      <OWButton
        style={styles.getStarted}
        label="Get started!"
        onPress={onGetStarted}
        disabled={isTimedOut}
        loading={isTimedOut}
      />
    </View>
  );
});

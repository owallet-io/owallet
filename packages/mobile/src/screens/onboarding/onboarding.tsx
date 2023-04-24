import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import GatewayIntroScreen from './gateway_intro';
import ManageIntroScreen from './manage_intro';
import WelcomeIntroScreen from './welcome_intro';
import AppIntroSlider from 'react-native-app-intro-slider';
import { View, Image, StyleSheet, Platform } from 'react-native';
import { colors, metrics } from '../../themes';
import { PageWithScrollView } from '../../components/page';
import { useGetHeightHeader } from '@src/hooks/use-height-header';

const slides = [
  {
    key: 1,
    component: <WelcomeIntroScreen />
  },
  {
    key: 2,
    component: <ManageIntroScreen />
  },
  {
    key: 3,
    component: <GatewayIntroScreen />
  }
];

const styling = () => {
  const height = useGetHeightHeader();
  return StyleSheet.create({
    onBoardingRoot: {
      position: 'relative',
      height:
        Platform.OS == 'ios'
          ? metrics.screenHeight - (height + 20)
          : metrics.screenHeight
    },
    onBoardingImgFooter: {
      position: 'absolute',
      bottom: -50,
      zIndex: -1,
      alignItems: 'flex-end'
    }
  });
};

export const OnboardingIntroScreen: FunctionComponent = observer(() => {
  const renderItem = ({ item }) => {
    return <View>{item.component}</View>;
  };
  const styles = styling();
  return (
    <PageWithScrollView backgroundColor="white">
      <View style={[{ ...styles.onBoardingRoot }, { paddingTop: 50 }]}>
        <AppIntroSlider
          renderItem={renderItem}
          data={slides}
          showNextButton={false}
          dotStyle={{ backgroundColor: colors['purple-100'], marginTop: 60 }}
          activeDotStyle={{
            backgroundColor: colors['purple-700'],
            marginTop: 60
          }}
          showDoneButton={false}
        />
        <Image
          source={require('../../assets/image/onboarding-footer-img.png')}
          fadeDuration={0}
          style={styles.onBoardingImgFooter}
          width={metrics.screenWidth}
        />
      </View>
    </PageWithScrollView>
  );
});

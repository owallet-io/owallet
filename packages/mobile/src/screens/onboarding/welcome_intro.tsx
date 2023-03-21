import React, { FunctionComponent } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { ShootingStarIcon } from '../../components/icon/shooting-star';
import { colors, spacing } from '../../themes';
import OWText from '@src/components/text/ow-text';

const styles = StyleSheet.create({
  img: {
    width: '100%'
  },
  viewImg: { alignItems: 'center' },
  container: {
    paddingHorizontal: spacing['32']
  },
  boardingTitleContainer: {
    flexDirection: 'row',
    marginBottom: spacing['12']
  },
  boardingIcon: {
    marginLeft: spacing['4']
  }
});

const WelcomeIntroScreen: FunctionComponent = () => {
  return (
    <View style={styles.container}>
      <View style={styles.boardingTitleContainer}>
        <View>
          <OWText variant="h1" typo = 'bold' color={colors['purple-h1']}>
            Welcome to
          </OWText>
          <OWText variant="h2" typo = 'bold' color={colors['black']}>
            OWallet
          </OWText>
        </View>
        <View style={styles.boardingIcon}>
          <ShootingStarIcon size={34} />
        </View>
      </View>
      <OWText variant="body2" typo="regular" color={colors['gray-150']}>
        OWallet is a secure wallet, routing you cross the world of blockchains:
        Oraichain, Cosmos, Ethereum, BNB smart chain, and Bitcoin.
      </OWText>
      <View style={styles.viewImg}>
        <Image
          source={require('../../assets/image/onboarding-welcome.png')}
          fadeDuration={0}
          resizeMode="contain"
          style={styles.img}
        />
      </View>
    </View>
  );
};

export default WelcomeIntroScreen;

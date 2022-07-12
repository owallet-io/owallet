import React, { FunctionComponent } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { ShootingStarIcon } from '../../components/icon/shooting-star';
import { colors, metrics, spacing, typography } from '../../themes';
import { CText as Text } from '../../components/text';

const styles = StyleSheet.create({
  boardingRoot: {},
  boardingTitleContainer: {
    flexDirection: 'row',
    marginBottom: spacing['12']
  },
  boardingIcon: {
    marginLeft: spacing['4']
  },
  boardingTitle: {
    ...typography['h1'],
    color: colors['purple-h1'],
    fontWeight: '700',
    fontSize: 28,
    lineHeight: spacing['50']
  },
  boardingContent: {
    ...typography['h6'],
    color: colors['gray-150'],
    fontWeight: '400',
    fontSize: 14,
    lineHeight: spacing['20']
  }
});

const WelcomeIntroScreen: FunctionComponent = () => {
  return (
    <View
      style={{
        paddingHorizontal: spacing['32'],
      }}
    >
      <View style={styles.boardingTitleContainer}>
        <View>
          <Text style={{
            ...styles.boardingTitle,
            fontSize: 34
          }}>Welcome to</Text>
          <Text
            style={{
              ...styles.boardingTitle,
              color: colors['black']
            }}
          >
            OWallet
          </Text>
        </View>
        <View style={styles.boardingIcon}>
          <ShootingStarIcon size={34} />
        </View>
      </View>

      <View>
        <Text style={styles.boardingContent}>
          OWallet is a secure wallet, routing you cross the world of
          blockchains: Oraichain, Cosmos, Ethereum, BNB smart chain, and
          Bitcoin.
        </Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Image
          source={require('../../assets/image/onboarding-welcome.png')}
          fadeDuration={0}
          resizeMode="contain"
          style={{
            width: '100%'
          }}
        />
      </View>
    </View>
  );
};

export default WelcomeIntroScreen;

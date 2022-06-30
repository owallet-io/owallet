
import React, { FunctionComponent } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { ShootingStarIcon } from '../../components/icon/shooting-star';
import { colors, metrics, spacing, typography } from '../../themes';

const styles = StyleSheet.create({
  boardingRoot: {
    padding: spacing['32'],
    marginTop: spacing['15'],
  },
  boardingTitleContainer: {
    flexDirection: 'row',
    marginBottom: spacing['12'],
  },
  boardingIcon: {
    marginLeft: spacing['4']
  },
  boardingTitle: {
    ...typography['h1'],
    color: colors['purple-h1'],
    fontWeight: '700',
    fontSize: 34,
    lineHeight: spacing['50'],
  },
  boardingContent: {
    ...typography['h6'],
    color: colors['gray-150'],
    fontWeight: '400',
    fontSize: 14,
    lineHeight: spacing['20'],
  },
});

const WelcomeIntroScreen: FunctionComponent = () => {
  return (
    <>
      <View style={styles.boardingRoot}>
        <View style={styles.boardingTitleContainer}>
          <View>
            <Text style={styles.boardingTitle}>Welcome to</Text>
            <Text
              style={{
                ...styles.boardingTitle,
                color: colors['black'],
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

        <View>
          <Image
            source={require('../../assets/image/onboarding-welcome.png')}
            resizeMode="contain"
            fadeDuration={0}
            height={1}
          />
        </View>
      </View>
    </>
  );
};

export default WelcomeIntroScreen;

import React, { FunctionComponent } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { RectButton } from '../../components/rect-button';
import { colors, metrics, spacing, typography } from '../../themes';
import { CText as Text } from '../../components/text';
import { useStore } from '../../stores';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSmartNavigation } from '../../navigation.provider';
const styles = StyleSheet.create({
  boardingRoot: {
    padding: spacing['32'],
    marginTop: spacing['15']
  },
  boardingTitleContainer: {
    flexDirection: 'row',
    marginBottom: spacing['12']
  },
  boardingIcon: {},
  boardingTitle: {
    ...typography['h1'],
    color: colors['purple-h1'],
    fontWeight: '700',
    fontSize: 28,
    lineHeight: spacing['40']
  },
  boardingContent: {
    ...typography['h6'],
    color: colors['gray-150'],
    fontWeight: '400',
    fontSize: 14,
    lineHeight: spacing['20']
  }
});

const GatewayIntroScreen: FunctionComponent = () => {
  const { appInitStore } = useStore();
  const smartNavigation = useSmartNavigation();

  return (
    <View
      style={{
        paddingHorizontal: spacing['32'],
      }}
    >
      <View style={styles.boardingTitleContainer}>
        <View>
          <Text
            style={{
              ...styles.boardingTitle,
              fontSize: 34
            }}
          >
            Gateway to
          </Text>
          <Text
            style={{
              ...styles.boardingTitle,
              color: colors['black'],
            }}
          >
            Oraichain Ecosystem
          </Text>
        </View>
      </View>

      <View>
        <Text style={styles.boardingContent}>
          OWallet brings the richness of Oraichain to your hand.
        </Text>
      </View>

      <View>
        <Image
          source={require('../../assets/image/onboarding-gateway.png')}
          fadeDuration={0}
          resizeMode="contain"
          style={{
            width: '100%'
          }}
        />
      </View>
      <TouchableOpacity
        style={{
          backgroundColor: colors['purple-900'],
          paddingHorizontal: spacing['8'],
          paddingVertical: spacing['16'],
          borderRadius: spacing['8'],
          alignItems: 'center'
        }}
        onPress={() => {
          appInitStore.updateInitApp();
          smartNavigation.navigateSmart('Register.Intro', {});
        }}
      >
        <Text
          style={{
            color: colors['white'],
            fontWeight: '700',
            fontSize: 16
          }}
        >
          Get started!
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default GatewayIntroScreen;

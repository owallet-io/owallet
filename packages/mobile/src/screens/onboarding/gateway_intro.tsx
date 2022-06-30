import React, { FunctionComponent } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { RectButton } from '../../components/rect-button'
import { colors, metrics, spacing, typography } from '../../themes'

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
})

const GatewayIntroScreen: FunctionComponent = () => {
  return (
    <>
      <View style={styles.boardingRoot}>
        <View style={styles.boardingTitleContainer}>
          <View>
            <Text style={styles.boardingTitle}>Gateway to</Text>
            <Text
              style={{
                ...styles.boardingTitle,
                color: colors['black']
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
              width: '100%',
            }}
          />
        </View>
        <View style={{ marginTop: spacing['25'] }}>
          <RectButton
            style={{
              backgroundColor: colors['purple-900'],
              paddingHorizontal: spacing['8'],
              paddingVertical: spacing['16'],
              borderRadius: spacing['8'],
              alignItems: 'center'
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
          </RectButton>
        </View>
      </View>
    </>
  )
}

export default GatewayIntroScreen

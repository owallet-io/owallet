import React, { FunctionComponent } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { colors, metrics, spacing, typography } from '../../themes';
import { CText as Text } from '../../components/text';
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

const ManageIntroScreen: FunctionComponent = () => {
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
            Manage both
          </Text>
          <Text
            style={{
              ...styles.boardingTitle,
              color: colors['black']
            }}
          >
            fugible
          </Text>
          <Text
            style={{
              ...styles.boardingTitle,
              color: colors['black']
            }}
          >
            {`& non-fungible tokens`}
          </Text>
        </View>
      </View>

      <View>
        <Text style={styles.boardingContent}>
          Store, send, receive, stake, and bridge your digital assets across
          chains.
        </Text>
      </View>

      <View style={{ alignItems: 'center' }}>
        <Image
          source={require('../../assets/image/onboarding-manage.png')}
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

export default ManageIntroScreen;

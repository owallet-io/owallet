import React, { FunctionComponent } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../../themes';
import OWText from '@src/components/text/ow-text';
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing['32']
  },
  img: {
    width: '100%'
  },
  viewImg: { alignItems: 'center' },
  boardingRoot: {
    padding: spacing['32'],
    marginTop: spacing['15']
  },
  boardingTitleContainer: {
    flexDirection: 'row',
    marginBottom: spacing['12']
  }
});

const ManageIntroScreen: FunctionComponent = () => {
  return (
    <View style={styles.container}>
      <View style={styles.boardingTitleContainer}>
        <View>
          <OWText variant="h1" typo="bold" color={colors['purple-h1']}>
            Manage both
          </OWText>
          <OWText variant="h2" typo="bold" color={colors['black']}>
            fungible
          </OWText>
          <OWText variant="h2" typo="bold" color={colors['black']}>
            {`& non-fungible tokens`}
          </OWText>
        </View>
      </View>

      <OWText variant="body2" typo="regular" color={colors['gray-150']}>
        Store, send, receive, stake, and bridge your digital assets across
        chains.
      </OWText>
      <Image
        source={require('../../assets/image/onboarding-manage.png')}
        fadeDuration={0}
        resizeMode="contain"
        style={styles.img}
      />
    </View>
  );
};

export default ManageIntroScreen;

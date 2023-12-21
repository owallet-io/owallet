import React, { FunctionComponent } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { ShootingStarIcon } from '../../components/icon/shooting-star';
import { colors, metrics, spacing } from '../../themes';
import OWText from '@src/components/text/ow-text';
import { ProgressBar } from '@src/components/progress-bar';

const styles = StyleSheet.create({
  img: {
    width: '100%'
  },
  logo: {
    width: 22,
    height: 22,
    marginRight: 4
  },
  viewImg: { alignItems: 'center' },
  container: {
    paddingHorizontal: spacing['16'],
    paddingTop: 60,
    justifyContent: 'space-between',
    height: metrics.screenHeight
  },
  boardingTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16
  },
  boardingIcon: {
    marginLeft: spacing['4']
  },
  containerCheck: {
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    zIndex: -1
  },
  content: {
    alignItems: 'center'
  },
  label: {
    fontSize: 28
  },
  subtitle: {
    textAlign: 'center'
  }
});

const ManageIntroScreen: FunctionComponent = () => {
  return (
    <View style={styles.container}>
      <View style={styles.containerCheck}>
        <Image
          style={{
            width: metrics.screenWidth,
            height: metrics.screenWidth
          }}
          source={require('../../assets/image/img-bg.png')}
          resizeMode="contain"
          fadeDuration={0}
        />
      </View>

      <View>
        <View style={styles.boardingTitleContainer}>
          <View style={styles.boardingIcon}>
            <Image source={require('../../assets/logo/splash-image.png')} style={styles.logo} />
          </View>

          <View>
            <OWText size={18} weight={'800'} color={colors['nertural-text-title']}>
              OWallet
            </OWText>
          </View>
        </View>
        <View style={styles.viewImg}>
          <Image
            source={require('../../assets/image/img_leverage.png')}
            fadeDuration={0}
            resizeMode="contain"
            style={styles.img}
          />
        </View>
        <View style={styles.content}>
          <OWText style={styles.label} weight="800" color={colors['nertural-text-title']}>
            LEVERAGE EXPERIENCES
          </OWText>
          <OWText style={styles.label} weight="800" color={colors['nertural-text-title']}>
            WITH POWER OF AI
          </OWText>
          <OWText style={styles.subtitle} variant="body2" typo="regular" color={colors['gray-150']}>
            Built on Oraichain.
          </OWText>
          <OWText style={styles.subtitle} variant="body2" typo="regular" color={colors['gray-150']}>
            The world’s first layer 1 of AI oracle.
          </OWText>
        </View>
      </View>
      <View />
    </View>
  );
};

export default ManageIntroScreen;

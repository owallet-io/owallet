import React, { FunctionComponent, useMemo } from 'react';
import { PageWithScrollViewInBottomTabView } from '../../components/page';
import { Text } from '@src/components/text';
import { TypeTheme, useTheme } from '@src/themes/theme-provider';
import { observer } from 'mobx-react-lite';
import { Platform, StyleSheet, View } from 'react-native';
import { useStore } from '../../stores';
import { typography } from '../../themes';
import { SwapBox } from './components/SwapBox';
import { OWButton } from '@src/components/button';
import { OWBox } from '@src/components/card';
import OWButtonGroup from '@src/components/button/OWButtonGroup';
import OWButtonIcon from '@src/components/button/ow-button-icon';
import OWIcon from '@src/components/ow-icon/ow-icon';
import { BalanceText } from './components/BalanceText';

export const UniversalSwapScreen: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();
  const { colors, images } = useTheme();

  const styles = styling(colors);
  const renderSetting = () => {
    return (
      <View style={styles.fDr}>
        <OWButtonIcon
          fullWidth={false}
          style={[styles.btnTitleRight]}
          sizeIcon={16}
          colorIcon="#777E90"
          name="setting-bold"
        />
        {/* <OWButtonIcon
          fullWidth={false}
          style={styles.btnTitleRight}
          colorIcon="#777E90"
          sizeIcon={16}
          name="round_refresh"
        /> */}
      </View>
    );
  };
  const renderLabelInputRight = () => {
    return (
      <View style={styles.containerBtnLabelInputRight}>
        <OWButton
          style={[styles.btnLabelInputRight, styles.mr8]}
          type="secondary"
          textStyle={{
            fontSize: 10
          }}
          size="small"
          label="MAX"
          fullWidth={false}
          onPress={() => {
            alert('ok');
          }}
        />
        <OWButton
          textStyle={{
            fontSize: 10
          }}
          style={styles.btnLabelInputRight}
          type="secondary"
          size="small"
          label="HALF"
          fullWidth={false}
        />
      </View>
    );
  };
  return (
    <PageWithScrollViewInBottomTabView
      backgroundColor={colors['plain-background']}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <OWBox type="swap">
        <OWBox
          style={{
            borderRadius: 12,
            padding: 10,
            backgroundColor: colors['background-box'],
            marginTop: 4,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <BalanceText weight="600" size={13}>
            1 0RAI ≈ 352347.32 AIRI
          </BalanceText>
          {renderSetting()}
        </OWBox>
        <View>
          <SwapBox
            titleRight={renderSetting}
            feeValue="0.1"
            feeLabel={'Token Fee'}
            titleLeft={'FROM'}
            tokensData={[]}
            labelInputRight={renderLabelInputRight}
            labelInputLeft={'8,291.09 ORAI'}
          />
          <SwapBox
            feeValue="0"
            feeLabel={'Token Fee'}
            titleLeft={'TO'}
            tokensData={[]}
            labelInputLeft={'8,291.09 AIRI'}
          />

          <View style={styles.containerBtnCenter}>
            <OWButtonIcon
              fullWidth={false}
              typeIcon="images"
              source={images.swap_center}
              circle
              sizeIcon={35}
            />
          </View>
        </View>

        <OWButton
          label="Swap"
          style={styles.btnSwap}
          loading={false}
          onPress={() => {}}
        />
      </OWBox>
    </PageWithScrollViewInBottomTabView>
  );
});

const styling = (colors: TypeTheme['colors']) =>
  StyleSheet.create({
    fDr: {
      flexDirection: 'row'
    },
    mr8: {
      marginRight: 8
    },
    btnTitleRight: {
      backgroundColor: colors['box-nft'],
      height: 30,
      width: 30,
      borderRadius: 5
    },
    containerBtnLabelInputRight: {
      flexDirection: 'row'
    },
    btnLabelInputRight: {
      backgroundColor: '#EFE7F8',
      borderRadius: 2,
      height: 22,
      borderWidth: 0
    },
    btnSwap: {
      marginTop: 16
    },
    container: {
      marginHorizontal: 16
    },
    containerBtnCenter: {
      position: 'absolute',
      top: '50%',
      alignSelf: 'center',
      marginTop: -16
    },
    shadowBox: {
      shadowColor: colors['splash-background'],
      shadowOffset: {
        width: 0,
        height: 3
      },
      shadowRadius: 5,
      shadowOpacity: 1.0
    },
    containerScreen: {
      padding: 24,
      paddingTop: 76,
      borderTopLeftRadius: Platform.OS === 'ios' ? 32 : 0,
      borderTopRightRadius: Platform.OS === 'ios' ? 32 : 0
    },
    contentBlock: {
      padding: 12,
      backgroundColor: colors['content-background'],
      borderRadius: 4
    },

    title: {
      ...typography.h1,
      color: colors['icon'],
      textAlign: 'center',
      fontWeight: '700'
    }
  });

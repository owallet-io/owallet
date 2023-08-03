import React, { FunctionComponent, useMemo, useState } from 'react';
import { PageWithScrollViewInBottomTabView } from '../../components/page';
import { Text } from '@src/components/text';
import { TypeTheme, useTheme } from '@src/themes/theme-provider';
import { observer } from 'mobx-react-lite';
import { Platform, StyleSheet, View } from 'react-native';
import { useStore } from '../../stores';
import { metrics, typography } from '../../themes';
import { SwapBox } from './components/SwapBox';
import { OWButton } from '@src/components/button';
import { OWBox } from '@src/components/card';
import OWButtonGroup from '@src/components/button/OWButtonGroup';
import OWButtonIcon from '@src/components/button/ow-button-icon';
import OWIcon from '@src/components/ow-icon/ow-icon';
import { BalanceText } from './components/BalanceText';
import { SelectTokenModal, SlippageModal } from './modals/';
import { SafeAreaView } from 'react-native-safe-area-context';

export const UniversalSwapScreen: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();
  const { colors, images } = useTheme();
  const [isModalSetting, setIsModalSetting] = useState(false);
  const [isSelectTokenModal, setIsSelectTokenModal] = useState(false);
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
          onPress={() => {
            setIsModalSetting(true);
          }}
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
          textStyle={styles.ts10}
          size="small"
          label="MAX"
          fullWidth={false}
          onPress={() => {
            alert('ok');
          }}
        />
        <OWButton
          textStyle={styles.ts10}
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
    //  <SafeAreaView>
    <PageWithScrollViewInBottomTabView
      backgroundColor={colors['plain-background']}
      style={[
        styles.container,
        Platform.OS === 'android'
          ? {
              paddingTop: 30
            }
          : {}
      ]}
      disableSafeArea={false}
      showsVerticalScrollIndicator={false}
    >
      <SlippageModal
        close={() => {
          setIsModalSetting(false);
        }}
        isOpen={isModalSetting}
      />
      <SelectTokenModal
        close={() => {
          setIsSelectTokenModal(false);
        }}
        isOpen={isSelectTokenModal}
      />
      <View>
        <View style={styles.boxTop}>
          <Text variant="h3" weight="700">
            Universal Swap
          </Text>
          <OWButtonIcon
            fullWidth={false}
            style={[styles.btnTitleRight]}
            sizeIcon={24}
            colorIcon={'#7C8397'}
            name="setting-bold"
            onPress={() => {
              setIsModalSetting(true);
            }}
          />
        </View>
        <View>
          <SwapBox
            titleRight={renderSetting}
            feeValue="0.1"
            feeLabel={'Fee: 0.1%'}
            titleLeft={'FROM'}
            tokensData={[]}
            labelInputRight={renderLabelInputRight}
            labelInputLeft={'8,291.09 ORAI'}
          />
          <SwapBox
            feeValue="0"
            feeLabel={'Fee: 0.1%'}
            titleLeft={'TO'}
            tokensData={[]}
            labelInputLeft={'8,291.09 AIRI'}
          />

          <View style={styles.containerBtnCenter}>
            <OWButtonIcon
              fullWidth={false}
              name="arrow_down_2"
              circle
              style={{
                backgroundColor: colors['bg-swap-box'],
                borderRadius: 20,
                width: 40,
                height: 40,
                borderWidth: 4,
                borderColor: 'white'
              }}
              colorIcon={'#7C8397'}
              sizeIcon={24}
            />
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingTop: 16
          }}
        >
          {[25, 50, 75].map((item, index) => {
            return (
              <OWButton
                key={item}
                size="small"
                style={{
                  width: metrics.screenWidth / 4 - 16,
                  backgroundColor: colors['bg-swap-box'],
                  height: 40
                }}
                textStyle={{
                  color: '#7C8397'
                }}
                label={`${item}%`}
                fullWidth={false}
              />
            );
          })}
          <OWButton
            // key={item}
            size="small"
            style={{
              width: metrics.screenWidth / 4 - 16,
              backgroundColor: colors['bg-swap-box'],
              height: 40,
              borderWidth: 1,
              borderColor: colors['purple-700']
            }}
            textStyle={{
              color: colors['purple-700']
            }}
            label={'100%'}
            fullWidth={false}
          />
        </View>
        <OWButton
          label="Swap"
          style={styles.btnSwap}
          loading={false}
          textStyle={styles.textBtnSwap}
          onPress={() => {}}
        />
        <View
          style={{
            backgroundColor: colors['bg-swap-box'],
            paddingHorizontal: 16,
            borderRadius: 8,
            paddingVertical: 11
          }}
        >
          <View style={styles.itemBottom}>
            <BalanceText>Quote</BalanceText>
            <BalanceText>1 0RAI ≈ 357.32 AIRI</BalanceText>
          </View>
          <View style={styles.itemBottom}>
            <BalanceText>Minimum Received</BalanceText>
            <BalanceText>0 USDT</BalanceText>
          </View>
          <View style={styles.itemBottom}>
            <BalanceText>Tax rate</BalanceText>
            <BalanceText>0</BalanceText>
          </View>
        </View>
      </View>
    </PageWithScrollViewInBottomTabView>
    //  </SafeAreaView>
  );
});

const styling = (colors: TypeTheme['colors']) =>
  StyleSheet.create({
    boxTop: {
      // borderRadius: 8,
      paddingTop: 10,
      paddingBottom: 20,
      // backgroundColor: colors['background-box'],
      marginTop: 4,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    textBtnSwap: {
      fontWeight: '700',
      fontSize: 16
    },
    itemBottom: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 5
    },
    theFirstLabel: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: 10
    },
    ts10: {
      fontSize: 10
    },
    fDr: {
      flexDirection: 'row'
    },
    mr8: {
      marginRight: 8
    },
    btnTitleRight: {
      // backgroundColor: colors['box-nft'],
      height: 30,
      width: 30
      // borderRadius: 5
    },
    containerBtnLabelInputRight: {
      flexDirection: 'row'
    },
    btnLabelInputRight: {
      backgroundColor: colors['bg-tonner'],
      borderRadius: 2,
      height: 22,
      borderWidth: 0
    },
    btnSwap: {
      marginVertical: 16,
      borderRadius: 8
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

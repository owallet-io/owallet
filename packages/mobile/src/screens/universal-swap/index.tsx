import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState
} from 'react';
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
import { isAndroid } from '@src/utils/helper';
import { TokenInfo } from './types';
import imagesGlobal from '@src/assets/images';

export const UniversalSwapScreen: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();
  const { colors, images } = useTheme();
  const [isModalSetting, setIsModalSetting] = useState(false);
  const [isSelectTokenModal, setIsSelectTokenModal] = useState(false);
  const styles = styling(colors);
  const [amount, setAmount] = useState({
    from: '1.273',
    to: '0.26'
  });
  const [fee, setFee] = useState({
    from: '0.1',
    to: '0.001'
  });
  const [currencyAmount, setCurrencyAmount] = useState({
    from: '100',
    to: '2000'
  });
  const [balance, setBalance] = useState({
    from: '10',
    to: '200'
  });
  const [activeToken, setActiveToken] = useState<{
    from:TokenInfo,
    to:TokenInfo
  }>({
    from:{
      symbol:'ORAI',
      logo:imagesGlobal.push,
      network:'Oraichain'
    },
    to:{
      symbol:'ETH',
      logo:imagesGlobal.crypto,
      network:'Ethereum'
    }
  });
  const handleAmountFrom = useCallback(
    (valueAmount) => {
      setAmount((prevAmount) => ({
        ...prevAmount,
        from: valueAmount
      }));
    },
    [amount?.from]
  );
  const handleAmountTo = useCallback(
    (valueAmount) => {
      setAmount((prevAmount) => ({
        ...prevAmount,
        to: valueAmount
      }));
    },
    [amount?.to]
  );
  return (
    <PageWithScrollViewInBottomTabView
      backgroundColor={colors['plain-background']}
      style={[styles.container, isAndroid ? styles.pt30 : {}]}
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
        onSlippage={() => {
          console.log('ok');
        }}
        isOpen={isSelectTokenModal}
      />
      <View>
        <View style={styles.boxTop}>
          <Text variant="h3" weight="700">
            Universal Swap
          </Text>
          <OWButtonIcon
            isBottomSheet
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
            feeValue={fee?.from}
            amount={amount?.from}
            tokensData={[]}
            balanceValue={balance?.from}
            currencyValue={currencyAmount?.from}
            onAmount={handleAmountFrom}
            tokenActive={activeToken?.from}
          />
          <SwapBox
            feeValue={fee?.to}
            amount={amount?.to}
            balanceValue={balance?.to}
            currencyValue={currencyAmount?.to}
            tokenActive={activeToken?.to}
            onAmount={handleAmountTo}
            tokensData={[]}
          />

          <View style={styles.containerBtnCenter}>
            <OWButtonIcon
              fullWidth={false}
              name="arrow_down_2"
              circle
              style={styles.btnSwapBox}
              colorIcon={'#7C8397'}
              sizeIcon={24}
            />
          </View>
        </View>
        <View style={styles.containerBtnBalance}>
          {[25, 50, 75].map((item, index) => {
            return (
              <OWButton
                key={item}
                size="small"
                style={styles.btnBalanceInactive}
                textStyle={styles.textBtnBalanceInActive}
                label={`${item}%`}
                fullWidth={false}
              />
            );
          })}
          <OWButton
            // key={item}
            size="small"
            style={styles.btnBalanceActive}
            textStyle={styles.textBtnBalanceAtive}
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
        <View style={styles.containerInfoToken}>
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
  );
});

const styling = (colors: TypeTheme['colors']) =>
  StyleSheet.create({
    textBtnBalanceAtive: {
      color: colors['purple-700']
    },
    textBtnBalanceInActive: {
      color: '#7C8397'
    },
    containerInfoToken: {
      backgroundColor: colors['bg-swap-box'],
      paddingHorizontal: 16,
      borderRadius: 8,
      paddingVertical: 11
    },
    btnBalanceActive: {
      width: metrics.screenWidth / 4 - 16,
      backgroundColor: colors['bg-swap-box'],
      height: 40,
      borderWidth: 1,
      borderColor: colors['purple-700']
    },
    btnBalanceInactive: {
      width: metrics.screenWidth / 4 - 16,
      backgroundColor: colors['bg-swap-box'],
      height: 40
    },
    containerBtnBalance: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 16
    },
    btnSwapBox: {
      backgroundColor: colors['bg-swap-box'],
      borderRadius: 20,
      width: 40,
      height: 40,
      borderWidth: 4,
      borderColor: 'white'
    },
    pt30: {
      paddingTop: 30
    },
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

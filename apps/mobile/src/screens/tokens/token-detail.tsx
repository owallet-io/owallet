import React, { FunctionComponent, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { spacing } from '../../themes';
import { _keyExtract } from '../../utils/helper';
import { navigate, setOptions } from '../../router/root';
import { useTheme } from '@src/themes/theme-provider';
import { StyleSheet, View, InteractionManager, Clipboard } from 'react-native';
import OWText from '@src/components/text/ow-text';
import { useStore } from '@src/stores';
import { OWButton } from '@src/components/button';
import { metrics } from '@src/themes';
import { API } from '@src/common/api';
import { useSimpleTimer } from '@src/hooks';
// import { PageHeader } from "@src/components/header/header-new";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SCREENS } from '@src/common/constants';
import { ChainIdEnum, DenomHelper, getBase58Address, TRC20_LIST, unknownToken } from '@owallet/common';
import { maskedNumber, removeDataInParentheses, shortenAddress } from '@src/utils/helper';
import { CheckIcon } from '@src/components/icon';
import { TokenChart } from '@src/screens/home/components/token-chart';
import { ViewToken } from '@src/stores/huge-queries';
import { CoinPretty, PricePretty } from '@owallet/unit';
import { HistoryByToken } from '@src/screens/transactions/history-by-token';
import { PageWithScrollView } from '@src/components/page';
import { tracking } from '@src/utils/tracking';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { OWBox } from '@src/components/card';
import OWIcon from '@src/components/ow-icon/ow-icon';
import MoreModal from '../home/components/more-modal';
import { HeaderOptions } from '@react-navigation/elements';
import { StackNavigationOptions } from '@react-navigation/stack';
import { OWHeaderTitle } from '@components/header';

export const TokenDetailsScreen: FunctionComponent = observer(props => {
  const { chainStore, priceStore, accountStore, keyRingStore } = useStore();
  const { isTimedOut, setTimer } = useSimpleTimer();
  const { colors } = useTheme();
  const styles = useStyles(colors);
  const navigation = useNavigation();

  // const accountTron = accountStore.getAccount(ChainIdEnum.TRON);

  const [isMoreOpen, setMoreModalOpen] = useState(false);

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          item: ViewToken;
        }
      >,
      string
    >
  >();

  const { item } = route.params;

  const account = accountStore.getAccount(item.chainInfo.chainId);

  const [tronTokens, setTronTokens] = useState([]);

  // useEffect(() => {
  //   tracking("Token Detail Screen");
  //   InteractionManager.runAfterInteractions(() => {
  //     (async function get() {
  //       try {
  //         if (accountTron.evmosHexAddress) {
  //           const res = await API.getTronAccountInfo(
  //             {
  //               address: getBase58Address(accountTron.evmosHexAddress),
  //             },
  //             {
  //               baseURL: chainStore.current.rpc,
  //             }
  //           );
  //
  //           if (res.data?.data?.length > 0) {
  //             if (res.data?.data[0].trc20) {
  //               const tokenArr = [];
  //               TRC20_LIST.map((tk) => {
  //                 let token = res.data?.data[0].trc20.find(
  //                   (t) => tk.contractAddress in t
  //                 );
  //                 if (token) {
  //                   tokenArr.push({ ...tk, amount: token[tk.contractAddress] });
  //                 }
  //               });
  //
  //               setTronTokens(tokenArr);
  //             }
  //           }
  //         }
  //       } catch (error) {}
  //     })();
  //   });
  // }, [accountTron.evmosHexAddress]);

  const address = account.addressDisplay;
  const onPressToken = async () => {
    // chainStore.selectChain(item.chainInfo.chainId);
    // await chainStore.saveLastViewChainId();

    // if (chainStore.current.networkType === "bitcoin") {
    //   navigate(SCREENS.SendBtc);
    //   return;
    // }
    // if (chainStore.current.networkType === "evm") {
    //   if (item.chainInfo.chainId === ChainIdEnum.TRON) {
    //     const itemTron = tronTokens?.find((t) => {
    //       return t.coinGeckoId === item.token.currency.coinGeckoId;
    //     });

    //     navigate(SCREENS.SendTron, {
    //       item: itemTron,
    //       currency: item.token.currency.coinDenom,
    //       contractAddress: new DenomHelper(item.token.currency.coinMinimalDenom)
    //         .contractAddress,
    //     });

    //     return;
    //   }
    //   if (item.chainInfo.chainId === ChainIdEnum.Oasis) {
    //     navigate(SCREENS.SendOasis, {
    //       currency: chainStore.current.stakeCurrency.coinMinimalDenom,
    //     });
    //     return;
    //   }
    //   navigate(SCREENS.SendEvm, {
    //     currency: item.token.currency.coinDenom,
    //     contractAddress: new DenomHelper(item.token.currency.coinMinimalDenom)
    //       .contractAddress,
    //     coinGeckoId: item.token.currency.coinGeckoId,
    //   });
    //   return;
    // }

    try {
      // console.log(new DenomHelper(item.token.currency.coinMinimalDenom).denom, "denom helper");
      if (chainStore.current.evm) {
        if (item.chainInfo.chainId === ChainIdEnum.TRON) {
          const itemTron = tronTokens?.find(t => {
            return t.coinGeckoId === item.token.currency.coinGeckoId;
          });

          navigate(SCREENS.SendTron, {
            item: itemTron,
            currency: item.token.currency.coinDenom,
            contractAddress: new DenomHelper(item.token.currency.coinMinimalDenom).contractAddress
          });

          return;
        }
        if (item.chainInfo.chainId === ChainIdEnum.Oasis) {
          navigate(SCREENS.SendOasis, {
            currency: chainStore.current.stakeCurrency.coinMinimalDenom
          });
          return;
        }
        navigate(SCREENS.SendEvm, {
          currency: item.token.currency.coinDenom,
          contractAddress: new DenomHelper(item.token.currency.coinMinimalDenom).contractAddress,
          coinGeckoId: item.token.currency.coinGeckoId
        });
        return;
      }
      navigate(SCREENS.NewSend, {
        currency: item.token.currency.coinDenom,
        contractAddress: new DenomHelper(item.token.currency.coinMinimalDenom).contractAddress,
        coinGeckoId: item.token.currency.coinGeckoId,
        denom: new DenomHelper(item.token.currency.coinMinimalDenom).denom
      });
    } catch (err) {}
  };
  const fiatCurrency = priceStore.getFiatCurrency(priceStore.defaultVsCurrency);
  const denomHelper = new DenomHelper(item.token.currency.coinMinimalDenom);
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => <OWHeaderTitle chainData={item.chainInfo} />
    });
  }, [item.chainInfo]);
  console.log(item.token.toCoin().amount, 'item.token');
  return (
    <>
      <MoreModal
        close={() => setMoreModalOpen(false)}
        isOpen={isMoreOpen}
        bottomSheetModalConfig={{
          enablePanDownToClose: false,
          enableOverDrag: false
        }}
      />

      <PageWithScrollView
        style={{
          marginBottom: 60
        }}
        showsVerticalScrollIndicator={false}
      >
        <OWBox style={styles.containerOWBox}>
          <View style={styles.containerInfoAccount}>
            <OWButton
              type="secondary"
              textStyle={{
                fontSize: 14,
                fontWeight: '600',
                color: colors['neutral-text-action-on-light-bg']
              }}
              iconRight={
                isTimedOut ? (
                  <CheckIcon />
                ) : (
                  <OWIcon size={18} name="tdesigncopy" color={colors['neutral-text-action-on-light-bg']} />
                )
              }
              style={styles.copy}
              label={shortenAddress(address)}
              onPress={() => {
                Clipboard.setString(address);
                setTimer(2000);
              }}
            />
          </View>
          <View style={styles.overview}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <View style={styles.iconWrap}>
                <OWIcon
                  style={{ borderRadius: 999 }}
                  type="images"
                  source={{
                    uri:
                      item.token?.currency?.coinImageUrl?.includes('missing.png') || !item.token?.currency?.coinImageUrl
                        ? unknownToken.coinImageUrl
                        : item.token?.currency?.coinImageUrl
                  }}
                  size={24}
                />
              </View>

              <OWText variant="bigText" style={styles.labelTotalAmount}>
                {' '}
                {maskedNumber(
                  new CoinPretty(item.token.currency, item.token.toCoin().amount).hideDenom(true).trim(true).toString()
                )}{' '}
                {removeDataInParentheses(item.token.currency.coinDenom)}
              </OWText>
            </View>

            <OWText style={styles.profit} color={colors['neutral-text-body']}>
              {new PricePretty(fiatCurrency, item.price)?.toString()}
            </OWText>
          </View>

          <View
            style={{
              height: 1,
              width: '100%',
              backgroundColor: colors['neutral-border-default'],
              marginBottom: 8
            }}
          />

          <View style={styles.btnGroup}>
            <OWButton
              textStyle={{
                fontSize: 15,
                fontWeight: '600',
                color: colors['neutral-text-action-on-light-bg']
              }}
              icon={<OWIcon color={colors['neutral-text-action-on-light-bg']} name={'tdesignsend'} size={20} />}
              type="link"
              style={styles.getStarted}
              label={'Send'}
              onPress={onPressToken}
            />
            <View
              style={{
                width: 1,
                height: '100%',
                backgroundColor: colors['neutral-border-default']
              }}
            />
            <OWButton
              style={styles.getStarted}
              icon={<OWIcon color={colors['neutral-text-action-on-light-bg']} name={'tdesignqrcode'} size={20} />}
              type="link"
              textStyle={{
                fontSize: 15,
                fontWeight: '600',
                color: colors['neutral-text-action-on-light-bg']
              }}
              label="Receive"
              onPress={() => {
                navigate(SCREENS.QRScreen, {
                  chainId: item.chainInfo.chainId
                });
                return;
              }}
            />
            <View
              style={{
                width: 1,
                height: '100%',
                backgroundColor: colors['neutral-border-default']
              }}
            />
            <OWButton
              textStyle={{
                fontSize: 15,
                fontWeight: '600',
                color: colors['neutral-text-action-on-light-bg']
              }}
              icon={<OWIcon color={colors['neutral-text-action-on-light-bg']} name={'tdesignellipsis'} size={20} />}
              type="link"
              style={styles.getStarted}
              label={'More'}
              onPress={() => {
                setMoreModalOpen(true);
              }}
            />
          </View>
        </OWBox>
        <TokenChart
          denom={removeDataInParentheses(item.token.currency.coinDenom)}
          coinGeckoId={item.token.currency.coinGeckoId}
        />
        <OWBox
          style={{
            width: metrics.screenWidth,
            paddingHorizontal: 16,
            borderTopRightRadius: 24,
            borderTopLeftRadius: 24,
            marginTop: 16,
            paddingBottom: 32
          }}
        >
          <View
            style={{
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors['neutral-border-default']
            }}
          >
            <OWText color={colors['neutral-text-body']} size={16} weight={'500'}>
              History
            </OWText>
          </View>
          {/*<HistoryByToken*/}
          {/*  tokenAddr={denomHelper.contractAddress || denomHelper.denom}*/}
          {/*  chainId={item.chainInfo.chainId}*/}
          {/*/>*/}
        </OWBox>
      </PageWithScrollView>
      <View
        style={{
          position: 'absolute',
          bottom: 50,
          alignSelf: 'center'
        }}
      >
        <OWButton
          label="Swap"
          onPress={() => {
            navigation.navigate('SendNavigation', {
              params: {
                chain: item.chainInfo.chainId
              }
            });
          }}
          icon={
            <View style={{ transform: [{ rotate: '130deg' }] }}>
              <OWIcon color={colors['neutral-text-action-on-dark-bg']} name={'tdesign_swap'} size={20} />
            </View>
          }
          style={[
            styles.bottomBtn,
            {
              width: metrics.screenWidth - 32
            }
          ]}
          textStyle={styles.txtBtnSend}
        />
      </View>
    </>
  );
});

const useStyles = colors => {
  return StyleSheet.create({
    containerOWBox: {
      marginTop: 0,
      marginHorizontal: 16,
      width: metrics.screenWidth - 32,
      padding: spacing['16'],
      borderRadius: 24
    },
    overview: {
      marginTop: 12,
      marginBottom: 16,
      alignItems: 'center'
    },
    labelTotalAmount: {
      color: colors['neutral-text-heading'],
      fontWeight: '500'
    },
    profit: {
      fontWeight: '400',
      lineHeight: 20
    },
    labelName: {
      paddingLeft: spacing['6'],
      paddingRight: 10,
      fontWeight: '600',
      fontSize: 16,
      color: colors['neutral-text-title']
    },
    infoIcon: {
      width: spacing['26'],
      borderRadius: spacing['26'],
      height: spacing['26']
    },
    btnAcc: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: spacing['2']
    },
    containerInfoAccount: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignSelf: 'center'
    },
    getStarted: {
      borderRadius: 999,
      width: metrics.screenWidth / 4.45,
      height: 32
    },
    copy: {
      borderRadius: 999,
      width: metrics.screenWidth / 2.5,
      height: 32
    },
    btnGroup: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    containerLoading: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      top: 30,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    container: {},
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor: colors['neutral-icon-on-dark']
    },
    bottomBtn: {
      marginTop: 20,
      width: metrics.screenWidth / 2.3,
      borderRadius: 999
    },
    txtBtnSend: {
      fontSize: 16,
      fontWeight: '600',
      color: colors['neutral-text-action-on-dark-bg']
    }
  });
};

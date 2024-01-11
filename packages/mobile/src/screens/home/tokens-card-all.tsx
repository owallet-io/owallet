import { OWButton } from '@src/components/button';
import { OWEmpty } from '@src/components/empty';
import { useTheme } from '@src/themes/theme-provider';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { CardBody, OWBox } from '../../components/card';
import { useStore } from '../../stores';
import { spacing } from '../../themes';
import { getTokenInfos, _keyExtract } from '../../utils/helper';
import OWIcon from '@src/components/ow-icon/ow-icon';
import { Text } from '@src/components/text';
import { useSmartNavigation } from '@src/navigation.provider';
import { SCREENS } from '@src/common/constants';
import { navigate } from '@src/router/root';
import { RightArrowIcon } from '@src/components/icon';
import { ChainIdEnum, getBase58Address, TRC20_LIST } from '@owallet/common';
import { API } from '@src/common/api';

export const TokensCardAll: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { accountStore, universalSwapStore, chainStore, appInitStore } = useStore();
  const { colors } = useTheme();
  const [more, setMore] = useState(true);

  const account = accountStore.getAccount(chainStore.current.chainId);
  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
  const accountTron = accountStore.getAccount(ChainIdEnum.TRON);

  const tokenInfos = getTokenInfos({ tokens: universalSwapStore.getAmount, prices: appInitStore.getInitApp.prices });

  let yesterdayAssets = [];
  if (accountOrai.bech32Address) {
    yesterdayAssets = appInitStore.getPriceFeedByAddress(accountOrai.bech32Address, 'yesterday');
  }

  const [tronTokens, setTronTokens] = useState([]);

  useEffect(() => {
    (async function get() {
      try {
        if (accountTron.evmosHexAddress) {
          const res = await API.getTronAccountInfo(
            {
              address: getBase58Address(accountTron.evmosHexAddress)
            },
            {
              baseURL: chainStore.current.rpc
            }
          );

          if (res.data?.data.length > 0) {
            if (res.data?.data[0].trc20) {
              const tokenArr = [];
              TRC20_LIST.map(tk => {
                let token = res.data?.data[0].trc20.find(t => tk.contractAddress in t);
                if (token) {
                  tokenArr.push({ ...tk, amount: token[tk.contractAddress] });
                }
              });

              setTronTokens(tokenArr);
            }
          }
        }
      } catch (error) {}
    })();
  }, [accountTron.evmosHexAddress]);

  const styles = styling();

  const smartNavigation = useSmartNavigation();

  const onPressToken = async item => {
    chainStore.selectChain(item?.chainId);
    await chainStore.saveLastViewChainId();
    if (!account.isNanoLedger) {
      if (chainStore.current.networkType === 'bitcoin') {
        navigate(SCREENS.STACK.Others, {
          screen: SCREENS.SendBtc
        });
        return;
      }
      if (item.chainId === ChainIdEnum.TRON) {
        const itemTron = tronTokens?.find(t => {
          return t.coinGeckoId === item.coinGeckoId;
        });

        console.log('itemTron', itemTron);

        smartNavigation.navigateSmart('SendTron', { item: itemTron });
        return;
      }
      smartNavigation.navigateSmart('Send', {
        currency: item.denom,
        contractAddress: item.contractAddress
      });
    }
  };

  const renderTokenItem = useCallback(
    item => {
      if (item) {
        const yesterday = yesterdayAssets.find(obj => obj['denom'] === item.denom);

        return (
          <TouchableOpacity
            onPress={() => {
              onPressToken(item);
            }}
            style={styles.btnItem}
          >
            <View style={styles.leftBoxItem}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  backgroundColor: colors['gray-10']
                }}
              >
                <OWIcon type="images" source={{ uri: item.icon }} size={35} />
              </View>
              <View style={styles.pl10}>
                <Text size={16} color={colors['neutral-text-title']} weight="500">
                  {item.asset}
                </Text>
                <Text weight="500" color={colors['neutral-text-body']}>
                  {item.chain}
                </Text>
              </View>
            </View>
            <View style={styles.rightBoxItem}>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text color={colors['neutral-text-title']}>{item.balance}</Text>
                  <Text weight="500" color={colors['neutral-text-body']}>
                    ${item.value.toFixed(6)}({Number(item.value - yesterday?.value)}){/* ${item.value.toFixed(6)} */}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 0.5,
                    justifyContent: 'center',
                    paddingLeft: 20
                  }}
                >
                  <RightArrowIcon height={12} color={colors['primary-text']} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      }
    },
    [universalSwapStore?.getAmount, yesterdayAssets]
  );

  return (
    <View style={containerStyle}>
      <OWBox
        style={{
          paddingTop: 12
        }}
      >
        <View style={styles.wrapHeaderTitle}>
          <OWButton
            type="link"
            label={'Tokens'}
            textStyle={{
              color: colors['primary-text'],
              fontWeight: '700'
            }}
            style={{
              width: '100%',
              borderBottomColor: colors['primary-text'],
              borderBottomWidth: 2
            }}
          />
        </View>

        <CardBody>
          {tokenInfos.length > 0 ? (
            tokenInfos.map((token, index) => {
              if (more) {
                if (index < 3) return renderTokenItem(token);
              } else {
                return renderTokenItem(token);
              }
            })
          ) : (
            <OWEmpty />
          )}
        </CardBody>
        <OWButton
          label={more ? 'View all' : 'Hide'}
          size="medium"
          type="secondary"
          onPress={() => {
            setMore(!more);
          }}
        />
      </OWBox>
    </View>
  );
});

const styling = () =>
  StyleSheet.create({
    wrapHeaderTitle: {
      flexDirection: 'row',
      marginHorizontal: spacing['page-pad']
    },
    pl10: {
      paddingLeft: 10
    },
    leftBoxItem: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    rightBoxItem: {
      alignItems: 'flex-end'
    },
    btnItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 10
    }
  });

import { OWButton } from '@src/components/button';
import { OWEmpty } from '@src/components/empty';
import { useTheme } from '@src/themes/theme-provider';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { CardBody, OWBox } from '../../components/card';
import { useStore } from '../../stores';
import { getTokenInfos, _keyExtract } from '../../utils/helper';
import OWIcon from '@src/components/ow-icon/ow-icon';
import { Text } from '@src/components/text';
import { useSmartNavigation } from '@src/navigation.provider';
import { SCREENS } from '@src/common/constants';
import { navigate } from '@src/router/root';
import { RightArrowIcon } from '@src/components/icon';
import { ChainIdEnum, getBase58Address, TRC20_LIST } from '@owallet/common';
import { API } from '@src/common/api';
import moment from 'moment';
import { chainIcons } from '../universal-swap/helpers';
import { Bech32Address } from '@owallet/cosmos';
import { TokenItem } from '../tokens/components/token-item';

const mockHistoryItems = [
  {
    type: 'Swap',
    address: 'orai1hvr9d72r5um9lvt0rpkd4r75vrsqtw6yujhqs2',
    amount: 43,
    value: 103,
    fromChainId: ChainIdEnum.Oraichain,
    toChainId: ChainIdEnum.TRON,
    asset: 'BNB'
  },
  {
    type: 'Send',
    address: 'orai1hvr9d72r5um9lvt0rpkd4r75vrsqtw6yujhqs2',
    amount: 87,
    value: 234,
    fromChainId: ChainIdEnum.BNBChain,
    toChainId: ChainIdEnum.Ethereum,
    asset: 'ETH'
  },
  {
    type: 'Receive',
    address: 'orai1hvr9d72r5um9lvt0rpkd4r75vrsqtw6yujhqs2',
    amount: 12,
    value: 67,
    fromChainId: ChainIdEnum.Oraichain,
    toChainId: ChainIdEnum.Oraichain,
    asset: 'ORAI'
  }
];

export const TokensCardAll: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { accountStore, universalSwapStore, chainStore, appInitStore, queriesStore, keyRingStore, priceStore } =
    useStore();
  const { colors } = useTheme();
  const theme = appInitStore.getInitApp.theme;

  const [more, setMore] = useState(true);
  const [activeTab, setActiveTab] = useState('tokens');
  const [yesterdayAssets, setYesterdayAssets] = useState([]);
  const [queryBalances, setQueryBalances] = useState({});

  const account = accountStore.getAccount(chainStore.current.chainId);
  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
  const accountTron = accountStore.getAccount(ChainIdEnum.TRON);

  const tokenInfos = getTokenInfos({
    tokens: universalSwapStore.getAmount,
    prices: appInitStore.getInitApp.prices,
    networkFilter: appInitStore.getInitApp.isAllNetworks ? '' : chainStore.current.chainId
  });

  useEffect(() => {
    const queries = queriesStore.get(chainStore.current.chainId);
    const address = account.getAddressDisplay(keyRingStore.keyRingLedgerAddresses);
    const balances = queries.queryBalances.getQueryBech32Address(address);
    setQueryBalances(balances);
  }, [chainStore.current.chainId]);

  const [tronTokens, setTronTokens] = useState([]);

  const handleSaveTokenInfos = async tokenInfos => {
    const res = await API.saveTokenInfos(
      {
        address: accountOrai.bech32Address,
        tokesInfos: tokenInfos
      },
      {
        baseURL: 'http://10.10.20.183:4000/'
      }
    );
  };

  const getYesterdayAssets = async () => {
    const res = await API.getYesterdayAssets(
      {
        address: accountOrai.bech32Address,
        time: 'YESTERDAY'
      },
      {
        baseURL: 'http://10.10.20.183:4000/'
      }
    );

    if (res && res.status === 200) {
      const dataKeys = Object.keys(res.data);

      const yesterday = dataKeys.find(k => {
        const isToday = moment(Number(k)).isSame(moment(), 'day');
        return !isToday;
      });

      if (yesterday) {
        const yesterdayData = res.data[yesterday];

        setYesterdayAssets(yesterdayData);
        appInitStore.updateYesterdayPriceFeed(yesterdayData);
      }
    }
  };

  useEffect(() => {
    getYesterdayAssets();
  }, [accountOrai.bech32Address]);

  useEffect(() => {
    if (tokenInfos.length > 0) {
      setTimeout(() => {
        handleSaveTokenInfos(tokenInfos);
      }, 5000);
    }
  }, [accountOrai.bech32Address]);

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

  const styles = styling(colors);

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

        smartNavigation.navigateSmart('SendTron', { item: itemTron });
        return;
      }
      smartNavigation.navigateSmart('Send', {
        currency: item.denom,
        contractAddress: item.contractAddress,
        coinGeckoId: item.coinGeckoId
      });
    }
  };

  const renderTokensFromQueryBalances = () => {
    //@ts-ignore
    const tokens = queryBalances?.positiveBalances;
    if (tokens?.length > 0) {
      return tokens.map((token, index) => {
        const priceBalance = priceStore.calculatePrice(token.balance);
        return (
          <TokenItem
            key={index?.toString()}
            chainInfo={{
              stakeCurrency: chainStore.current.stakeCurrency,
              networkType: chainStore.current.networkType,
              chainId: chainStore.current.chainId
            }}
            balance={token.balance}
            priceBalance={priceBalance}
          />
        );
      });
    } else {
      return <OWEmpty />;
    }
  };

  const renderHistoryItem = useCallback(
    item => {
      if (item) {
        const fromChainIcon = chainIcons.find(c => c.chainId === item.fromChainId);
        const toChainIcon = chainIcons.find(c => c.chainId === item.toChainId);

        return (
          <TouchableOpacity
            onPress={() => {
              onPressToken(item);
            }}
            style={styles.btnItem}
          >
            <View style={styles.leftBoxItem}>
              <View style={styles.iconWrap}>
                <OWIcon type="images" source={{ uri: fromChainIcon?.Icon }} size={28} />
              </View>
              <View style={styles.chainWrap}>
                <OWIcon type="images" source={{ uri: toChainIcon?.Icon }} size={16} />
              </View>

              <View style={styles.pl10}>
                <Text size={14} color={colors['neutral-text-heading']} weight="600">
                  {item.type}
                </Text>
                <Text weight="400" color={colors['neutral-text-body']}>
                  {Bech32Address.shortenAddress(item.address, 16)}
                </Text>
              </View>
            </View>
            <View style={styles.rightBoxItem}>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text weight="500" color={colors['neutral-text-heading']}>
                    {item.amount} {item.asset}
                  </Text>
                  <Text style={styles.profit} color={colors['success-text-body']}>
                    {'+'}${item.value.toFixed(6)}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 0.5,
                    justifyContent: 'center',
                    paddingLeft: 20
                  }}
                >
                  <RightArrowIcon height={12} color={colors['neutral-text-heading']} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      }
    },
    [theme]
  );

  const renderTokenItem = useCallback(
    item => {
      if (item) {
        let profit = 0;
        let percent = '0';

        if (yesterdayAssets && yesterdayAssets.length > 0) {
          const yesterday = yesterdayAssets.find(obj => obj['denom'] === item.denom);
          if (yesterday && yesterday.value) {
            profit = Number(Number(item.value - (yesterday.value ?? 0))?.toFixed(2) ?? 0);
            percent = Number((profit / yesterday.value) * 100 ?? 0).toFixed(2);
          }
        }
        const chainIcon = chainIcons.find(c => c.chainId === item.chainId);

        return (
          <TouchableOpacity
            onPress={() => {
              onPressToken(item);
            }}
            style={styles.btnItem}
          >
            <View style={styles.leftBoxItem}>
              <View style={styles.iconWrap}>
                <OWIcon type="images" source={{ uri: item.icon }} size={28} />
              </View>
              <View style={styles.chainWrap}>
                <OWIcon type="images" source={{ uri: chainIcon?.Icon }} size={16} />
              </View>

              <View style={styles.pl10}>
                <Text size={14} color={colors['neutral-text-heading']} weight="600">
                  {item.balance.toFixed(4)} {item.asset}
                </Text>
                <Text weight="400" color={colors['neutral-text-body']}>
                  {item.chain}
                </Text>
              </View>
            </View>
            <View style={styles.rightBoxItem}>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text weight="500" color={colors['neutral-text-heading']}>
                    ${item.value.toFixed(6)}
                  </Text>
                  <Text style={styles.profit} color={colors[profit < 0 ? 'error-text-body' : 'success-text-body']}>
                    {profit < 0 ? '' : '+'}
                    {percent}% (${profit ?? 0})
                  </Text>
                </View>
                <View
                  style={{
                    flex: 0.5,
                    justifyContent: 'center',
                    paddingLeft: 20
                  }}
                >
                  <RightArrowIcon height={12} color={colors['neutral-text-heading']} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      }
    },
    [universalSwapStore?.getAmount, theme]
  );

  const renderContent = () => {
    if (activeTab === 'tokens') {
      return (
        <>
          <CardBody style={{ paddingHorizontal: 0, paddingTop: 16 }}>
            {/* {renderTokensFromQueryBalances()} */}
            {tokenInfos.length > 0 ? (
              tokenInfos.map((token, index) => {
                if (more) {
                  if (index < 3) return renderTokenItem(token);
                } else {
                  return renderTokenItem(token);
                }
              })
            ) : (
              <OWEmpty type="cash" />
            )}
          </CardBody>
          {tokenInfos.length > 3 ? (
            <OWButton
              style={{
                marginTop: 16
              }}
              label={more ? 'View all' : 'Hide'}
              size="medium"
              type="secondary"
              onPress={() => {
                setMore(!more);
              }}
            />
          ) : null}
        </>
      );
    } else {
      return (
        <>
          <View style={{ paddingTop: 16 }}>
            <Text size={14} color={colors['neutral-text-heading']} weight="600">
              {'Dec 8, 2024'}
            </Text>
          </View>

          <CardBody style={{ paddingHorizontal: 0, paddingTop: 8 }}>
            {renderTokensFromQueryBalances()}
            {mockHistoryItems.length > 0 ? (
              mockHistoryItems.map((token, index) => {
                if (more) {
                  if (index < 3) return renderHistoryItem(token);
                } else {
                  return renderHistoryItem(token);
                }
              })
            ) : (
              <OWEmpty type="cash" />
            )}
          </CardBody>
          {mockHistoryItems.length > 3 ? (
            <OWButton
              style={{
                marginTop: 16
              }}
              label={more ? 'View all' : 'Hide'}
              size="medium"
              type="secondary"
              onPress={() => {
                setMore(!more);
              }}
            />
          ) : null}
        </>
      );
    }
  };

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
              color: colors['primary-surface-default'],
              fontWeight: '600',
              fontSize: 16
            }}
            onPress={() => setActiveTab('tokens')}
            style={[
              {
                width: '50%'
              },
              activeTab === 'tokens' ? styles.active : null
            ]}
          />
          <OWButton
            type="link"
            label={'History'}
            onPress={() => setActiveTab('history')}
            textStyle={{
              color: colors['primary-surface-default'],
              fontWeight: '600',
              fontSize: 16
            }}
            style={[
              {
                width: '50%'
              },
              activeTab === 'history' ? styles.active : null
            ]}
          />
        </View>

        {renderContent()}
      </OWBox>
    </View>
  );
});

const styling = colors =>
  StyleSheet.create({
    wrapHeaderTitle: {
      flexDirection: 'row'
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
      marginVertical: 8
    },
    profit: {
      fontWeight: '400',
      lineHeight: 20
    },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor: colors['neutral-text-action-on-dark-bg']
    },
    chainWrap: {
      width: 18,
      height: 18,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors['neutral-text-action-on-dark-bg'],
      position: 'absolute',
      bottom: -6,
      left: 20
    },
    active: { borderBottomColor: colors['primary-surface-default'], borderBottomWidth: 2 }
  });

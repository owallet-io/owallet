import { OWButton } from '@src/components/button';
import { OWEmpty } from '@src/components/empty';
import { useTheme } from '@src/themes/theme-provider';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { CardBody, OWBox } from '../../components/card';
import { useStore } from '../../stores';
import { spacing } from '../../themes';
import { showToast, _keyExtract } from '../../utils/helper';
import { ChainIdEnum, getAddress, getBase58Address, tokensIcon } from '@owallet/common';
import { useCoinGeckoPrices, useLoadTokens } from '@owallet/hooks';
import {
  flattenTokens,
  getSubAmountDetails,
  oraichainNetwork,
  toAmount,
  toDisplay,
  toSumDisplay
} from '@oraichain/oraidex-common';
import OWIcon from '@src/components/ow-icon/ow-icon';
import { Text } from '@src/components/text';
import { useSmartNavigation } from '@src/navigation.provider';
import { SCREENS } from '@src/common/constants';
import { navigate } from '@src/router/root';

export const TokensCardAll: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { accountStore, universalSwapStore, chainStore } = useStore();
  const { colors } = useTheme();
  const [more, setMore] = useState(true);

  let accounts = {};

  Object.keys(ChainIdEnum).map(key => {
    let defaultAddress = accountStore.getAccount(ChainIdEnum[key]).bech32Address;
    if (ChainIdEnum[key] === ChainIdEnum.TRON) {
      accounts[ChainIdEnum[key]] = getBase58Address(accountStore.getAccount(ChainIdEnum[key]).evmosHexAddress);
    } else if (defaultAddress.startsWith('evmos')) {
      accounts[ChainIdEnum[key]] = accountStore.getAccount(ChainIdEnum[key]).evmosHexAddress;
    } else {
      accounts[ChainIdEnum[key]] = defaultAddress;
    }
  });

  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);

  const loadTokenAmounts = useLoadTokens(universalSwapStore);
  // handle fetch all tokens of all chains
  const handleFetchAmounts = async accounts => {
    let loadTokenParams = {};
    console.log('being call', accounts);

    try {
      if (
        accounts?.[ChainIdEnum.TRON] &&
        accounts?.[ChainIdEnum.Ethereum] &&
        accountOrai.bech32Address &&
        accounts?.[ChainIdEnum.Oraichain] &&
        accounts?.[ChainIdEnum.Injective]
      ) {
        const cwStargate = {
          account: accountOrai,
          chainId: ChainIdEnum.Oraichain,
          rpc: oraichainNetwork.rpc
        };
        loadTokenParams = {
          ...loadTokenParams,
          oraiAddress: accounts[ChainIdEnum.Oraichain],
          cwStargate
        };
        loadTokenParams = {
          ...loadTokenParams,
          metamaskAddress: accounts[ChainIdEnum.Ethereum]
        };
        loadTokenParams = {
          ...loadTokenParams,
          kwtAddress: getAddress(accounts[ChainIdEnum.Injective], 'oraie')
        };
        loadTokenParams = {
          ...loadTokenParams,
          tronAddress: accounts[ChainIdEnum.TRON]
        };
        loadTokenAmounts(loadTokenParams);
      }
    } catch (error) {
      console.log('error loadTokenAmounts', error);
      showToast({
        message: error?.message ?? error?.ex?.message,
        type: 'danger'
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      // Call your function here
      handleFetchAmounts(accounts);
    }, 1000);

    // Clean up the timer when the component unmounts
    return () => clearTimeout(timer);
  }, [
    accounts[ChainIdEnum.Ethereum],
    accounts[ChainIdEnum.Injective],
    accounts[ChainIdEnum.TRON],
    accounts[ChainIdEnum.CosmosHub]
  ]);

  let networkFilter;

  const { data: prices } = useCoinGeckoPrices();

  const dataTokens = flattenTokens
    .reduce((result, token) => {
      // not display because it is evm map and no bridge to option, also no smart contract and is ibc native
      if (token.bridgeTo || token.contractAddress) {
        const isValidNetwork = !networkFilter || token.chainId === networkFilter;
        if (isValidNetwork) {
          const amount = BigInt(universalSwapStore.getAmount?.[token.denom] ?? 0);

          const isHaveSubAmounts = token.contractAddress && token.evmDenoms;
          const subAmounts = isHaveSubAmounts ? getSubAmountDetails(universalSwapStore.getAmount, token) : {};
          const totalAmount = amount + (isHaveSubAmounts ? toAmount(toSumDisplay(subAmounts), token.decimals) : 0n);
          const value = toDisplay(totalAmount.toString(), token.decimals) * (prices?.[token.coinGeckoId] || 0);

          const SMALL_BALANCE = 0.01;
          const isHide = value < SMALL_BALANCE;
          if (isHide) return result;

          const tokenIcon = tokensIcon.find(tIcon => tIcon.coinGeckoId === token.coinGeckoId);
          result.push({
            asset: token.name,
            chain: token.org,
            chainId: token.chainId,
            cosmosBased: token.cosmosBased,
            contractAddress: token.contractAddress,
            decimals: token.decimals,
            coinType: token.coinType,
            coinGeckoId: token.coinGeckoId,
            icon: tokenIcon?.Icon,
            iconLight: tokenIcon?.IconLight,
            price: prices[token.coinGeckoId] || 0,
            balance: toDisplay(totalAmount.toString(), token.decimals),
            denom: token.denom,
            value,
            coeff: 0,
            coeffType: 'increase'
          });
        }
      }
      return result;
    }, [])
    .sort((a, b) => b.value - a.value);

  const styles = styling();

  const smartNavigation = useSmartNavigation();

  const onPressToken = async item => {
    chainStore.selectChain(item?.chainId);
    await chainStore.saveLastViewChainId();
    if (!accountOrai.isNanoLedger) {
      if (chainStore.current.networkType === 'bitcoin') {
        navigate(SCREENS.STACK.Others, {
          screen: SCREENS.SendBtc
        });
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
                <Text size={16} color={colors['text-title']} weight="500">
                  {item.asset}
                </Text>
                <Text weight="500" color={colors['blue-400']}>
                  {item.chain}
                </Text>
              </View>
            </View>
            <View style={styles.rightBoxItem}>
              <Text color={colors['text-title']}>{item.balance}</Text>
              <Text weight="500" color={colors['blue-400']}>
                ${item.value.toFixed(6)}
              </Text>
            </View>
          </TouchableOpacity>
        );
      }
    },
    [universalSwapStore?.getAmount]
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
          {dataTokens?.length > 0 ? (
            dataTokens.map((token, index) => {
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

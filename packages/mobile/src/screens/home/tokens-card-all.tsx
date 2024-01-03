import { OWButton } from '@src/components/button';
import { OWEmpty } from '@src/components/empty';
import { useTheme } from '@src/themes/theme-provider';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { CardBody, OWBox } from '../../components/card';
import { useSmartNavigation } from '../../navigation.provider';
import { useStore } from '../../stores';
import { spacing } from '../../themes';
import { capitalizedText, showToast, _keyExtract } from '../../utils/helper';
import { TokenItem } from '../tokens/components/token-item';
import { ChainIdEnum, getBase58Address } from '@owallet/common';
import { useLoadTokens } from '@owallet/hooks';
import { oraichainNetwork } from '@oraichain/oraidex-common';

export const TokensCardAll: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, queriesStore, accountStore, priceStore, keyRingStore, universalSwapStore } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const { colors } = useTheme();

  console.log('amounts', universalSwapStore.getAmount);

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
  const handleFetchAmounts = async () => {
    let loadTokenParams = {};
    try {
      const cwStargate = {
        account: accountOrai,
        chainId: ChainIdEnum.Oraichain,
        rpc: oraichainNetwork.rpc
      };

      loadTokenParams = {
        ...loadTokenParams,
        oraiAddress: accountOrai.bech32Address,
        cwStargate
      };
      loadTokenParams = {
        ...loadTokenParams,
        metamaskAddress: accounts[ChainIdEnum.Ethereum]
      };
      loadTokenParams = {
        ...loadTokenParams,
        kwtAddress: accountOrai.bech32Address
      };
      if (accounts[ChainIdEnum.TRON]) {
        loadTokenParams = {
          ...loadTokenParams,
          tronAddress: accounts[ChainIdEnum.TRON]
        };
      }

      loadTokenAmounts(loadTokenParams);
    } catch (error) {
      console.log('error loadTokenAmounts', error);
      showToast({
        message: error?.message ?? error?.ex?.message,
        type: 'danger'
      });
    }
  };

  useEffect(() => {
    setTimeout(() => {
      handleFetchAmounts();
    }, 2000);
  }, []);

  const styles = styling();
  const smartNavigation = useSmartNavigation();
  const [index, setIndex] = useState<number>(0);

  const queries = queriesStore.get(chainStore.current.chainId);
  const address = account.getAddressDisplay(keyRingStore.keyRingLedgerAddresses);
  const queryBalances = queries.queryBalances.getQueryBech32Address(address);

  // TODO: Add sorting rule
  const tokens = queryBalances.positiveBalances.slice(0, 3);

  const onActiveType = i => {
    setIndex(i);
  };

  return (
    <View style={containerStyle}>
      <OWBox
        style={{
          paddingTop: 12
        }}
      >
        <View style={styles.wrapHeaderTitle}>
          {['Tokens'].map((title: string, i: number) => (
            <View key={i}>
              <OWButton
                type="link"
                onPress={() => onActiveType(i)}
                label={title}
                textStyle={{
                  color: index === i ? colors['primary-text'] : colors['gray-300'],
                  fontWeight: '700'
                }}
                style={{
                  width: '90%',
                  borderBottomColor: index === i ? colors['primary-text'] : colors['primary'],
                  borderBottomWidth: 2
                }}
              />
            </View>
          ))}
        </View>

        <CardBody>
          {tokens?.length > 0 ? (
            tokens.map((token, index) => {
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
            })
          ) : (
            <OWEmpty />
          )}
        </CardBody>

        <OWButton
          label={capitalizedText('view all')}
          size="medium"
          type="secondary"
          onPress={() => {
            if (index === 0) {
              smartNavigation.navigateSmart('Tokens', {});
            } else {
              smartNavigation.navigateSmart('Nfts', null);
            }
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
    }
  });

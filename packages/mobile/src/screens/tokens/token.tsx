import { OWBox } from '@src/components/card';
import { OWSubTitleHeader } from '@src/components/header';
import { useTheme } from '@src/themes/theme-provider';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useMemo } from 'react';
import { FlatList } from 'react-native';
import { PageWithScrollViewInBottomTabView } from '../../components/page';
import { useStore } from '../../stores';
import { _keyExtract } from '../../utils/helper';
import { TokenItem } from './components/token-item';

export const TokensScreen: FunctionComponent = observer(() => {
  const { chainStore, queriesStore, accountStore, priceStore } = useStore();
  const { colors } = useTheme();
  const account = accountStore.getAccount(chainStore.current.chainId);

  const queryBalances = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(
      chainStore.current.networkType === 'evm'
        ? account.evmosHexAddress
        : account.bech32Address
    );

  const tokens = queryBalances.balances.concat(
    queryBalances.nonNativeBalances,
    queryBalances.positiveNativeUnstakables
  );

  const unique = useMemo(() => {
    const uniqTokens = [];
    tokens.map(token =>
      uniqTokens.filter(
        ut => ut.balance.currency.coinDenom == token.balance.currency.coinDenom
      ).length > 0
        ? null
        : uniqTokens.push(token)
    );
    return uniqTokens;
  }, [chainStore.current.chainId]);

  return (
    <PageWithScrollViewInBottomTabView backgroundColor={colors['background']}>
      <OWSubTitleHeader title="My Tokens" />
      <OWBox>
        <FlatList
          data={unique}
          renderItem={({ item }) => {
            const priceBalance = priceStore.calculatePrice(item.balance);

            return (
              <TokenItem
                key={item.currency.coinMinimalDenom}
                chainInfo={{
                  stakeCurrency: chainStore.current.stakeCurrency
                }}
                balance={item.balance}
                priceBalance={priceBalance}
              />
            );
          }}
          keyExtractor={_keyExtract}
        />
      </OWBox>
    </PageWithScrollViewInBottomTabView>
  );
});

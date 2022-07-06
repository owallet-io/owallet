import React, { FunctionComponent, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { StyleSheet, View } from 'react-native';
import { Text } from '@rneui/base';
import { colors, spacing, typography } from '../../themes';
import { FlatList } from 'react-native-gesture-handler';
import { _keyExtract } from '../../utils/helper';
import { PageWithScrollViewInBottomTabView } from '../../components/page';
import { TokenItem } from './components/token-item';

export const TokensScreen: FunctionComponent = observer(() => {
  const { chainStore, queriesStore, accountStore, priceStore } = useStore();
  const queryBalances = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(
      accountStore.getAccount(chainStore.current.chainId).bech32Address
    );

  const tokens = queryBalances.balances.concat(
    queryBalances.nonNativeBalances,
    queryBalances.positiveNativeUnstakables
  );

  const unique = useMemo(() => {
    const uniqTokens = [];
    tokens.map((token) =>
      uniqTokens.filter(
        (ut) =>
          ut.balance.currency.coinDenom == token.balance.currency.coinDenom
      ).length > 0
        ? null
        : uniqTokens.push(token)
    );
    return uniqTokens;
  }, [chainStore.current.chainId]);

  return (
    <PageWithScrollViewInBottomTabView>
      <Text
        style={{
          ...styles.title
        }}
      >
        {`My Tokens`}
      </Text>

      <View
        style={{
          ...styles.containerTokens
        }}
      >
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
      </View>
    </PageWithScrollViewInBottomTabView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  containerToken: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing['4'],
    marginVertical: spacing['8'],
    paddingTop: spacing['18'],
    paddingBottom: spacing['18']
  },
  transactionListEmpty: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    ...typography.h3,
    fontWeight: '700',
    textAlign: 'center',
    color: colors['gray-900'],
    marginTop: spacing['12']
  },
  containerTokens: {
    backgroundColor: colors['white'],
    borderRadius: spacing['24'],
    marginTop: spacing['16'],
    paddingVertical: spacing['12'],
    paddingHorizontal: spacing['24']
  },
  containerTokenItem: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing['8'],
    marginVertical: spacing['4']
  }
});

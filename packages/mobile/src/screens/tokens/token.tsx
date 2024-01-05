import React, { FunctionComponent, useMemo } from 'react';
import { useTheme } from '@src/themes/theme-provider';
import { OWBox } from '@src/components/card';
import { OWSubTitleHeader } from '@src/components/header';
import { observer } from 'mobx-react-lite';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { PageWithView } from '../../components/page';
import { useStore } from '../../stores';
import { _keyExtract } from '../../utils/helper';
import { TokenItem } from './components/token-item';
import OWFlatList from '@src/components/page/ow-flat-list';
import { Text } from '@src/components/text';
import { useSmartNavigation } from '@src/navigation.provider';

export const TokensScreen: FunctionComponent = observer(() => {
  const { chainStore, queriesStore, accountStore, priceStore, keyRingStore } = useStore();
  const { colors } = useTheme();
  const smartNavigation = useSmartNavigation();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const address = account.getAddressDisplay(keyRingStore.keyRingLedgerAddresses);
  const queryBalances = queriesStore.get(chainStore.current.chainId).queryBalances.getQueryBech32Address(address);

  const tokens = queryBalances.positiveBalances;

  return (
    <PageWithView backgroundColor={colors['background']}>
      <OWSubTitleHeader title="Tokens" />
      <OWBox
        style={{
          flex: 1
        }}
      >
        <View
          style={{
            alignItems: 'flex-end',
            width: '100%'
          }}
        >
          <TouchableOpacity
            onPress={() => {
              smartNavigation.navigateSmart('Network.token', {});
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: colors['primary-surface-default']
              }}
            >
              + Add token
            </Text>
          </TouchableOpacity>
        </View>
        <OWFlatList
          data={tokens}
          showsVerticalScrollIndicator={false}
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
    </PageWithView>
  );
});

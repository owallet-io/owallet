import { StyleSheet, TextInput, View, TouchableOpacity } from 'react-native';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { registerModal } from '@src/modals/base';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OWFlatList from '@src/components/page/ow-flat-list';
import OWIcon from '@src/components/ow-icon/ow-icon';
import { Text } from '@src/components/text';
import { TypeTheme, useTheme } from '@src/themes/theme-provider';
import { metrics } from '@src/themes';
import { TokenItemType, toDisplay } from '@oraichain/oraidex-common';
import { useStore } from '@src/stores';
import { ChainIdEnum } from '@owallet/common';
import { CoinGeckoPrices } from '@owallet/hooks';
import { find } from 'lodash';
import { AddressCopyable } from '@src/components/address-copyable';
import { CustomAddressCopyable } from '@src/components/address-copyable/custom';
import { ScrollView } from 'react-native-gesture-handler';
import { chainIcons } from '@src/screens/universal-swap/helpers';

export const CopyAddressModal: FunctionComponent<{
  accounts: object;
}> = ({ accounts }) => {
  const safeAreaInsets = useSafeAreaInsets();
  const [keyword, setKeyword] = useState('');

  // useEffect(() => {
  //   if (keyword === '' || !keyword) {
  //     setTokens(data);
  //   } else {
  //     const tmpData = data.filter(d => {
  //       return (d.chainId + d.denom + d.name + d.org + d.coinGeckoId)
  //         .toString()
  //         .toLowerCase()
  //         .includes(keyword.toLowerCase());
  //     });

  //     setTokens(tmpData);
  //   }
  // }, [data, keyword]);

  const { colors } = useTheme();
  const styles = styling(colors);

  return (
    <View style={[styles.containerModal, { paddingBottom: safeAreaInsets.bottom }]}>
      <View>
        <TextInput
          style={styles.textInput}
          placeholderTextColor={colors['text-place-holder']}
          placeholder="Search for a chain"
          onChangeText={t => setKeyword(t)}
          value={keyword}
        />
        <View style={styles.iconSearch}>
          <OWIcon color={colors['blue-400']} text name="search" size={16} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {Object.keys(accounts).map(k => {
          if (accounts[k]) {
            const chainIcon = chainIcons.find(c => c.chainName === k);

            return (
              <CustomAddressCopyable
                icon={<OWIcon type="images" source={{ uri: chainIcon?.Icon }} size={28} />}
                chain={k}
                address={accounts[k]}
                maxCharacters={22}
              />
            );
          }
        })}
      </ScrollView>
    </View>
  );
};

const styling = (colors: TypeTheme['colors']) =>
  StyleSheet.create({
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
    },
    txtNetwork: {
      paddingHorizontal: 4
    },
    btnNetwork: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    containerTitle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10
    },
    iconSearch: {
      position: 'absolute',
      left: 12,
      top: 22
    },
    textInput: {
      paddingVertical: 0,
      height: 40,
      backgroundColor: colors['box-nft'],
      borderRadius: 999,
      paddingLeft: 35,
      fontSize: 14,
      fontWeight: '500',
      color: colors['neutral-text-body'],
      marginVertical: 10
    },
    containerModal: {
      height: metrics.screenHeight / 1.3
    }
  });

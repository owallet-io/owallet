import { StyleSheet, TextInput, View, TouchableOpacity } from 'react-native';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState
} from 'react';
import { registerModal } from '@src/modals/base';
import images from '@src/assets/images';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OWFlatList from '@src/components/page/ow-flat-list';
import OWIcon from '@src/components/ow-icon/ow-icon';
import { Text } from '@src/components/text';
import { TypeTheme, useTheme } from '@src/themes/theme-provider';
import { metrics } from '@src/themes';
import { TokenItemType, tokenMap } from '@owallet/common';
import { useStore } from '@src/stores';
import { getTotalUsd, toDisplay } from '@owallet/common';
import { AmountDetails } from '@owallet/common';
import { CoinGeckoPrices } from '@src/hooks/use-coingecko';

export const SelectTokenModal: FunctionComponent<{
  onNetworkModal?: () => void;
  close?: () => void;
  data: TokenItemType[];
  isOpen?: boolean;
  prices: CoinGeckoPrices<string>;
  bottomSheetModalConfig?: unknown;
  setToken: (denom: string) => void;
  setSearchTokenName: Function;
}> = registerModal(({ close, onNetworkModal, data, setToken, prices }) => {
  const safeAreaInsets = useSafeAreaInsets();
  const { universalSwapStore } = useStore();
  const [filteredTokens, setTokens] = useState([]);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    if (
      keyword === '' ||
      keyword === null ||
      keyword === undefined ||
      !keyword
    ) {
      setTokens(data);
    } else {
      const tmpData = data.filter(
        d =>
          d.chainId.toString().includes(keyword) ||
          d.denom.toString().includes(keyword) ||
          d.name.toString().includes(keyword) ||
          d.org.toString().includes(keyword) ||
          d.coinGeckoId.toString().includes(keyword)
      );

      setTokens(tmpData);
    }
  }, [data, keyword]);

  const { colors } = useTheme();
  const styles = styling(colors);

  const renderTokenItem = useCallback(
    item => {
      if (item) {
        //@ts-ignore
        const subAmounts = Object.fromEntries(
          Object?.entries(universalSwapStore?.getAmount ?? {}).filter(
            ([denom]) => tokenMap?.[denom]?.chainId === item.chainId
          )
        ) as AmountDetails;

        const totalUsd = getTotalUsd(subAmounts, prices, item);
        return (
          <TouchableOpacity
            onPress={() => {
              close();
              setToken(item.denom);
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
                <OWIcon type="images" source={{ uri: item.Icon }} size={35} />
              </View>
              <View style={styles.pl10}>
                <Text size={16} color={colors['text-title']} weight="500">
                  {item.name}
                </Text>
                <Text weight="500" color={colors['blue-400']}>
                  {item.org}
                </Text>
              </View>
            </View>
            <View style={styles.rightBoxItem}>
              <Text color={colors['text-title']}>
                {toDisplay(
                  universalSwapStore?.getAmount?.[item.denom],
                  item.decimals
                )}
              </Text>
              <Text weight="500" color={colors['blue-400']}>
                ${totalUsd.toFixed(2) ?? 0}
              </Text>
            </View>
          </TouchableOpacity>
        );
      }
    },
    [universalSwapStore?.getAmount]
  );

  return (
    <View
      style={[styles.containerModal, { paddingBottom: safeAreaInsets.bottom }]}
    >
      <View>
        <TextInput
          style={styles.textInput}
          placeholderTextColor={colors['text-place-holder']}
          placeholder="Search Token"
          onChangeText={t => setKeyword(t)}
          value={keyword}
        />
        <View style={styles.iconSearch}>
          <OWIcon color={colors['blue-400']} text name="search" size={16} />
        </View>
      </View>

      <View style={styles.containerTitle}>
        <Text color={colors['blue-400']} weight="500">
          List Token
        </Text>
        <TouchableOpacity
          onPress={() => {
            onNetworkModal();
          }}
          style={styles.btnNetwork}
        >
          <OWIcon type="images" source={images.push} size={16} />
          <Text
            style={styles.txtNetwork}
            color={colors['blue-400']}
            weight="500"
          >
            Network
          </Text>
          <OWIcon size={16} color={colors['blue-400']} name="down" />
        </TouchableOpacity>
      </View>
      <OWFlatList
        isBottomSheet
        keyboardShouldPersistTaps="handled"
        data={filteredTokens}
        renderItem={({ item }) => {
          return renderTokenItem(item);
        }}
      />
    </View>
  );
});

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
      borderRadius: 8,
      paddingLeft: 35,
      fontSize: 16,
      color: colors['text-title'],
      marginVertical: 10
    },
    containerModal: {
      paddingHorizontal: 24,
      height: metrics.screenHeight
    }
  });

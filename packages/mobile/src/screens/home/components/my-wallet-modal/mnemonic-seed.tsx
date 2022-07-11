import React, { useMemo } from 'react';
import { FlatList, Image, View } from 'react-native';
import { CText as Text } from '../../../../components/text';
import { RectButton } from '../../../../components/rect-button';
import { colors, metrics, spacing, typography } from '../../../../themes';
import { _keyExtract } from '../../../../utils/helper';

const MnemonicSeed = ({ styles }) => {
  const { keyRingStore, analyticsStore, modalStore } = useStore();
  const mnemonicKeyStores = useMemo(() => {
    return keyRingStore.multiKeyStoreInfo.filter(
      (keyStore) => !keyStore.type || keyStore.type === 'mnemonic'
    );
  }, [keyRingStore.multiKeyStoreInfo]);

  const privateKeyStores = useMemo(() => {
    return keyRingStore.multiKeyStoreInfo.filter(
      (keyStore) => keyStore.type === 'privateKey'
    );
  }, [keyRingStore.multiKeyStoreInfo]);

  const ledgerKeyStores = useMemo(() => {
    return keyRingStore.multiKeyStoreInfo.filter(
      (keyStore) => keyStore.type === 'ledger'
    );
  }, [keyRingStore.multiKeyStoreInfo]);

  const selectKeyStore = async (
    keyStore: MultiKeyStoreInfoWithSelectedElem
  ) => {
    const index = keyRingStore.multiKeyStoreInfo.indexOf(keyStore);
    if (index >= 0) {
      await keyRingStore.changeKeyRing(index);
    }
  };

  const renderItem = ({ item }) => {
    return (
      <RectButton
        style={{
          ...styles.containerAccount
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <Image
            style={{
              width: spacing['38'],
              height: spacing['38']
            }}
            source={require("../../../../assets/image/address_default.png")}
            fadeDuration={0}
          />
          <View
            style={{
              marginLeft: spacing['12']
            }}
          >
            {item.address && (
              <Text
                style={{
                  ...typography.h7,
                  color: colors['gray-300'],
                  fontWeight: '800',
                  fontSize: 12
                }}
              >
                {item.address}
              </Text>
            )}
          </View>
        </View>

        <View>
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: spacing['32'],
              backgroundColor:
                colors[`${item.selected ? 'purple-700' : 'gray-100'}`],
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: spacing['32'],
                backgroundColor: colors['white']
              }}
            />
          </View>
        </View>
      </RectButton>
    );
  };
  return (
    <View
      style={{
        width: metrics.screenWidth - 36,
        height: metrics.screenHeight / 4
      }}
    >
      <FlatList
        data={[...mnemonicKeyStores, ...privateKeyStores, ...ledgerKeyStores]}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={_keyExtract}
        ListFooterComponent={() => (
          <View
            style={{
              height: spacing['16']
            }}
          />
        )}
      />
    </View>
  );
};

export default MnemonicSeed;
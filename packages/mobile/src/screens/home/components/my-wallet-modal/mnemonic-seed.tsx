import React, { useMemo, useState } from 'react';
import { FlatList, Image, View } from 'react-native';
import { Text } from '@src/components/text';
import { RectButton } from '../../../../components/rect-button';
import { useStore } from '../../../../stores';
import { metrics, spacing, typography } from '../../../../themes';
import { _keyExtract } from '../../../../utils/helper';
import { MultiKeyStoreInfoWithSelectedElem } from '@owallet/background';
import { LoadingSpinner } from '../../../../components/spinner';
import { useTheme } from '@src/themes/theme-provider';
import { useStyleMyWallet } from './styles';


const MnemonicSeed = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { keyRingStore, analyticsStore, modalStore } = useStore();
  const styles = useStyleMyWallet();
  const { colors } = useTheme();
  const mnemonicKeyStores = useMemo(() => {
    return keyRingStore.multiKeyStoreInfo.filter(
      (keyStore) => !keyStore.type || keyStore.type === 'mnemonic'
    );
  }, [keyRingStore.multiKeyStoreInfo]);

  const privateKeyStores = useMemo(() => {
    return keyRingStore.multiKeyStoreInfo.filter(
      (keyStore) => keyStore.type === 'privateKey' && !keyStore.meta?.email
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
      <>
        <RectButton
          style={{
            ...styles.containerAccount
          }}
          onPress={async () => {
            setIsLoading(true);
            analyticsStore.logEvent('Account changed');
            await selectKeyStore(item);
            await modalStore.close();
            setIsLoading(false);
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
              source={require('../../../../assets/image/address_default.png')}
              fadeDuration={0}
            />
            <View
              style={{
                marginLeft: spacing['12']
              }}
            >
              <Text
                style={{
                  ...typography.h6,
                  color: colors['text-title-login'],
                  fontWeight: '900'
                }}
                numberOfLines={1}
              >
                {item.meta?.name}
              </Text>
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
      </>
    );
  };
  return (
    <View
      style={{
        width: metrics.screenWidth - 36,
        height: metrics.screenHeight / 4
      }}
    >
      <View style={{ position: 'relative' }}>
        <FlatList
          data={[...mnemonicKeyStores, ...privateKeyStores, ...ledgerKeyStores]}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          keyExtractor={_keyExtract}
        />
        <View
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            zIndex: 1
          }}
        >
          {isLoading && (
            <LoadingSpinner size={24} color={colors['purple-700']} />
          )}
        </View>
      </View>
    </View>
  );
};

export default MnemonicSeed;

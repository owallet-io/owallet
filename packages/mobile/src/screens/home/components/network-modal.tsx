import React from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Alert,
  TouchableOpacity
} from 'react-native';
import { metrics, spacing, typography } from '../../../themes';
import { _keyExtract } from '../../../utils/helper';
import FastImage from 'react-native-fast-image';
import { VectorCharacter } from '../../../components/vector-character';
import { Text } from '@src/components/text';

const COINTYPE_NETWORK = {
  118: 'Cosmos',
  60: 'Ethereum',
  195: 'Tron'
};

export const NetworkModal = ({
  profileColor,
  chainStore,
  modalStore,
  smartNavigation,
  colors,
  keyRingStore,
  bip44Option
}) => {
  const styles = styling(colors);

  const handleSwitchNetwork = item => {
    try {
      if (keyRingStore.keyRingType === 'ledger') {
        console.log('get here', keyRingStore.keyRingType);
        Alert.alert(
          'Switch network',
          `You are switching to ${
            COINTYPE_NETWORK[item.bip44.coinType]
          } network. Please confirm that you have ${
            COINTYPE_NETWORK[item.bip44.coinType]
          } App opened before switch network`,
          [
            {
              text: 'Cancel',
              onPress: () => {
                modalStore.close();
              },
              style: 'cancel'
            },
            {
              text: 'Switch',
              onPress: () => {
                chainStore.selectChain(item?.chainId);
                chainStore.saveLastViewChainId();
                keyRingStore.setkeyRingStoreLedgerAddress(
                  `44'/${item.bip44.coinType ?? item.coinType}'/${
                    bip44Option.bip44HDPath.account
                  }'/${bip44Option.bip44HDPath.change}/${
                    bip44Option.bip44HDPath.addressIndex
                  }`,
                  item?.chainId
                );
                modalStore.close();
              }
            }
          ]
        );
      } else {
        chainStore.selectChain(item?.chainId);
        chainStore.saveLastViewChainId();
        modalStore.close();
      }
    } catch (error) {
      alert(JSON.stringify(error.message));
      modalStore.close();
    }
  };

  const _renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={{
          ...styles.containerBtn
        }}
        onPress={async () => {
          handleSwitchNetwork(item);
        }}
      >
        <View
          style={{
            justifyContent: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <View
            style={{
              height: 38,
              width: 38,
              padding: spacing['2'],
              borderRadius: spacing['12'],
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: profileColor?.(item) ?? colors['purple-400']
            }}
          >
            {item.raw.chainSymbolImageUrl ? (
              <FastImage
                style={{
                  width: 24,
                  height: 24
                }}
                resizeMode={FastImage.resizeMode.contain}
                source={{
                  uri: item.raw.chainSymbolImageUrl
                }}
              />
            ) : (
              <VectorCharacter
                char={item.chainName[0]}
                height={15}
                color={colors['white']}
              />
            )}
          </View>

          <View
            style={{
              justifyContent: 'space-between',
              marginLeft: spacing['12']
            }}
          >
            <Text
              style={{
                ...typography.h6,
                color: colors['sub-primary-text'],
                fontWeight: '900'
              }}
              numberOfLines={1}
            >
              {item.chainName}
            </Text>
          </View>
        </View>

        <View>
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: spacing['32'],
              backgroundColor:
                item?.chainId === chainStore.current.chainId
                  ? colors['purple-700']
                  : colors['gray-100'],
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
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{
        alignItems: 'center'
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
            smartNavigation.navigateSmart('Network.select', {});
            modalStore.close();
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: colors['purple-700']
            }}
          >
            + Add more
          </Text>
        </TouchableOpacity>
      </View>
      <Text
        style={{
          ...typography.h6,
          fontWeight: '900',
          color: colors['primary-text']
        }}
      >
        {`Select networks`}
      </Text>

      <View
        style={{
          marginTop: spacing['12'],
          width: metrics.screenWidth - 48,
          justifyContent: 'space-between',
          height: metrics.screenHeight / 2
        }}
      >
        <FlatList
          showsVerticalScrollIndicator={false}
          data={chainStore.chainInfosInUI}
          renderItem={_renderItem}
          keyExtractor={_keyExtract}
          ListFooterComponent={() => (
            <View
              style={{
                height: spacing['10']
              }}
            />
          )}
        />
      </View>
    </View>
  );
};

const styling = colors =>
  StyleSheet.create({
    containerBtn: {
      backgroundColor: colors['sub-primary'],
      paddingVertical: spacing['16'],
      borderRadius: spacing['8'],
      paddingHorizontal: spacing['16'],
      flexDirection: 'row',
      marginTop: spacing['16'],
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  });

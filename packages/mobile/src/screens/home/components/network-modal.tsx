import React from 'react';
import { StyleSheet, View } from 'react-native';
import { metrics, spacing, typography } from '../../../themes';
import { _keyExtract, showToast, getTokenInfos } from '../../../utils/helper';
import FastImage from 'react-native-fast-image';
import { VectorCharacter } from '../../../components/vector-character';
import { Text } from '@src/components/text';
import { TRON_ID, COINTYPE_NETWORK, getKeyDerivationFromAddressType, ChainIdEnum } from '@owallet/common';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useBIP44Option } from '@src/screens/register/bip44';
import { useStore } from '@src/stores';
import { useTheme } from '@src/themes/theme-provider';
import { navigate } from '@src/router/root';
import { SCREENS } from '@src/common/constants';
import { Popup } from 'react-native-popup-confirm-toast';
import { getTotalUsd } from '@oraichain/oraidex-common';

export const NetworkModal = () => {
  const { colors } = useTheme();

  const bip44Option = useBIP44Option();
  const { modalStore, chainStore, keyRingStore, accountStore, appInitStore, universalSwapStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const styles = styling(colors);
  let totalUsd: number = 0;
  let todayAssets;
  if (Object.keys(appInitStore.getInitApp.prices).length > 0 && Object.keys(universalSwapStore.getAmount).length > 0) {
    totalUsd = getTotalUsd(universalSwapStore.getAmount, appInitStore.getInitApp.prices);
    todayAssets = getTokenInfos({ tokens: universalSwapStore.getAmount, prices: appInitStore.getInitApp.prices });
  }

  const onConfirm = async (item: any) => {
    const { networkType } = chainStore.getChain(item?.chainId);
    const keyDerivation = (() => {
      const keyMain = getKeyDerivationFromAddressType(account.addressType);
      if (networkType === 'bitcoin') {
        return keyMain;
      }
      return '44';
    })();
    chainStore.selectChain(item?.chainId);
    await chainStore.saveLastViewChainId();
    Popup.hide();

    await keyRingStore.setKeyStoreLedgerAddress(
      `${keyDerivation}'/${item.bip44.coinType ?? item.coinType}'/${bip44Option.bip44HDPath.account}'/${
        bip44Option.bip44HDPath.change
      }/${bip44Option.bip44HDPath.addressIndex}`,
      item?.chainId
    );
  };
  const groupedData = todayAssets?.reduce((result, element) => {
    const key = element.chainId;

    if (!result[key]) {
      result[key] = {
        sum: 0
      };
    }

    result[key].sum += element.value;

    return result;
  }, {});

  const handleSwitchNetwork = async item => {
    try {
      if (account.isNanoLedger) {
        modalStore.close();
        Popup.show({
          type: 'confirm',
          title: 'Switch network!',
          textBody: `You are switching to ${
            COINTYPE_NETWORK[item.bip44.coinType]
          } network. Please confirm that you have ${
            COINTYPE_NETWORK[item.bip44.coinType]
          } App opened before switch network`,
          buttonText: `I have switched ${COINTYPE_NETWORK[item.bip44.coinType]} App`,
          confirmText: 'Cancel',
          okButtonStyle: {
            backgroundColor: colors['orange-800']
          },
          callback: () => onConfirm(item),
          cancelCallback: () => {
            Popup.hide();
          },
          bounciness: 0,
          duration: 10
        });
        return;
      } else {
        if (!item.isAll) {
          chainStore.selectChain(item?.chainId);
          await chainStore.saveLastViewChainId();
          appInitStore.selectAllNetworks(false);
        } else {
          appInitStore.selectAllNetworks(true);
        }

        modalStore.close();
      }
    } catch (error) {
      showToast({
        type: 'danger',
        message: JSON.stringify(error)
      });
    }
  };

  const _renderItem = ({ item }) => {
    let isSelectedColor =
      item?.chainId === chainStore.current.chainId && !appInitStore.getInitApp.isAllNetworks
        ? colors['primary-surface-default']
        : colors['bg-circle-select-modal'];
    if (item.isAll && appInitStore.getInitApp.isAllNetworks) {
      isSelectedColor = colors['primary-surface-default'];
    }
    return (
      <TouchableOpacity
        style={{
          ...styles.containerBtn
        }}
        onPress={() => {
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
              backgroundColor: colors['primary-surface-default']
            }}
          >
            {item?.raw?.chainSymbolImageUrl ? (
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
              <VectorCharacter char={item.chainName[0]} height={15} color={colors['white']} />
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
            <Text
              style={{
                color: colors['neutral-text-body']
              }}
              numberOfLines={1}
            >
              ${!item.chainId ? totalUsd?.toFixed(6) : Number(groupedData?.[item.chainId]?.sum ?? 0).toFixed(6)}
            </Text>
          </View>
        </View>

        <View>
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: spacing['32'],
              backgroundColor: isSelectedColor,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: spacing['32'],
                backgroundColor: colors['background-item-list']
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
        {chainStore.current.chainId === TRON_ID ? null : (
          <TouchableOpacity
            onPress={() => {
              navigate(SCREENS.STACK.Others, {
                screen: SCREENS.NetworkSelect
              });
              modalStore.close();
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: colors['primary-surface-default']
              }}
            >
              + Add network
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <Text
        style={{
          ...typography.h6,
          fontWeight: '900',
          color: colors['primary-text'],
          width: '100%',
          textAlign: 'center'
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
        {account.isNanoLedger ? null : _renderItem({ item: { chainName: 'All networks', isAll: true } })}
        <BottomSheetFlatList data={chainStore.chainInfosInUI} renderItem={_renderItem} keyExtractor={_keyExtract} />
      </View>
    </View>
  );
};

const styling = colors =>
  StyleSheet.create({
    containerBtn: {
      backgroundColor: colors['background-item-list'],
      paddingVertical: spacing['16'],
      borderRadius: spacing['8'],
      paddingHorizontal: spacing['16'],
      flexDirection: 'row',
      marginTop: spacing['16'],
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  });

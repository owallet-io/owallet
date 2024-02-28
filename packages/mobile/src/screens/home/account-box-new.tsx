import React, { FunctionComponent, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { OWBox } from '../../components/card';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text } from '@src/components/text';
import { useStore } from '../../stores';
import { useTheme } from '@src/themes/theme-provider';
import { getTotalUsd } from '@oraichain/oraidex-common';
import { DownArrowIcon } from '@src/components/icon';
import { metrics, spacing } from '@src/themes';
import MyWalletModal from './components/my-wallet-modal/my-wallet-modal';
import { chainIcons, ChainIdEnum, ChainNameEnum, getBase58Address } from '@owallet/common';
import { OWButton } from '@src/components/button';
import OWIcon from '@src/components/ow-icon/ow-icon';
import { CopyAddressModal } from './components/copy-address/copy-address-modal';
import { getTokenInfos } from '@src/utils/helper';

export const AccountBoxAll: FunctionComponent<{}> = observer(({}) => {
  const { colors } = useTheme();
  const { universalSwapStore, accountStore, modalStore, chainStore, appInitStore } = useStore();
  const [profit, setProfit] = useState(0);
  const [accountAddresses, settAddresses] = useState({});

  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
  const accountEth = accountStore.getAccount(ChainIdEnum.Ethereum);

  const chainAssets = getTokenInfos({
    tokens: universalSwapStore.getAmount,
    prices: appInitStore.getInitApp.prices,
    networkFilter: chainStore.current.chainId
  });

  const styles = styling(colors);
  let totalUsd: number;
  if (appInitStore.getInitApp.prices) {
    totalUsd = getTotalUsd(universalSwapStore.getAmount, appInitStore.getInitApp.prices);
  }

  const account = accountStore.getAccount(chainStore.current.chainId);

  useEffect(() => {
    let accounts = {};
    let defaultEvmAddress = accountStore.getAccount(ChainIdEnum.Ethereum).evmosHexAddress;
    setTimeout(() => {
      Object.keys(ChainIdEnum).map(key => {
        let defaultCosmosAddress = accountStore.getAccount(ChainIdEnum[key]).bech32Address;

        if (defaultCosmosAddress.startsWith('evmos')) {
          accounts[ChainNameEnum[key]] = defaultEvmAddress;
        } else {
          accounts[ChainNameEnum[key]] = defaultCosmosAddress;
        }
      });
    }, 2000);

    accounts[ChainNameEnum.TRON] = getBase58Address(accountStore.getAccount(ChainIdEnum.TRON).evmosHexAddress);

    settAddresses(accounts);
  }, [accountEth.evmosHexAddress]);

  const _onPressMyWallet = () => {
    modalStore.setOptions({
      bottomSheetModalConfig: {
        enablePanDownToClose: false,
        enableOverDrag: false
      }
    });
    modalStore.setChildren(MyWalletModal());
  };

  const _onPressAddressModal = () => {
    modalStore.setOptions();
    modalStore.setChildren(<CopyAddressModal accounts={accountAddresses} />);
  };

  useEffect(() => {
    let yesterdayBalance = 0;
    const yesterdayAssets = appInitStore.getInitApp.yesterdayPriceFeed;

    if (yesterdayAssets?.length > 0) {
      yesterdayAssets.map(y => {
        yesterdayBalance += y.value ?? 0;
      });
    }

    setProfit(Number(Number(totalUsd - yesterdayBalance).toFixed(6)));
  }, [totalUsd, accountOrai.bech32Address]);

  const renderTotalBalance = () => {
    const chainIcon = chainIcons.find(c => c.chainId === chainStore.current.chainId);
    let chainBalance = 0;

    chainAssets?.map(a => {
      chainBalance += a.value;
    });

    return (
      <>
        <Text variant="bigText" style={styles.labelTotalAmount}>
          ${totalUsd?.toFixed(6) ?? 0}
        </Text>
        <Text style={styles.profit} color={colors[profit < 0 ? 'error-text-body' : 'success-text-body']}>
          {profit < 0 ? '' : '+'}
          {profit && totalUsd ? Number((profit / totalUsd) * 100 ?? 0).toFixed(2) : 0}% (${profit ?? 0}) Today
        </Text>
        {appInitStore.getInitApp.isAllNetworks ? null : (
          <View
            style={{
              borderTopWidth: 1,
              borderColor: colors['neutral-border-default'],
              marginVertical: 8,
              paddingVertical: 8,
              flexDirection: 'row',
              justifyContent: 'space-between'
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <View style={{ backgroundColor: colors['neutral-text-action-on-dark-bg'], borderRadius: 16 }}>
                <OWIcon type="images" source={{ uri: chainIcon?.Icon }} size={16} />
              </View>
              <Text
                style={{
                  paddingLeft: 6
                }}
                size={16}
                weight="600"
                color={colors['neutral-text-title']}
              >
                {chainStore.current.chainName}
              </Text>
            </View>

            <Text size={16} weight="600" color={colors['neutral-text-title']}>
              ${chainBalance.toFixed(6)}
            </Text>
          </View>
        )}
      </>
    );
  };

  return (
    <View>
      <OWBox style={styles.containerOWBox}>
        <View style={styles.containerInfoAccount}>
          <TouchableOpacity onPress={_onPressMyWallet} style={styles.btnAcc}>
            <Image
              style={styles.infoIcon}
              source={require('../../assets/images/default-avatar.png')}
              resizeMode="contain"
              fadeDuration={0}
            />
            <Text style={styles.labelName}>{account?.name || '..'}</Text>
            <DownArrowIcon height={15} color={colors['primary-text']} />
          </TouchableOpacity>
          <OWButton
            type="secondary"
            textStyle={{
              fontSize: 14,
              fontWeight: '600',
              color: colors['neutral-text-action-on-light-bg']
            }}
            icon={<OWIcon size={14} name="copy" color={colors['neutral-text-action-on-light-bg']} />}
            style={styles.copy}
            label="Copy address"
            onPress={() => {
              _onPressAddressModal();
            }}
          />
        </View>
        <View style={styles.overview}>{renderTotalBalance()}</View>
        <View style={styles.btnGroup}>
          <OWButton
            style={styles.getStarted}
            textStyle={{
              fontSize: 14,
              fontWeight: '600',
              color: colors['neutral-text-action-on-dark-bg']
            }}
            label="Receive"
            onPress={() => {}}
          />
          <OWButton
            textStyle={{
              fontSize: 14,
              fontWeight: '600',
              color: colors['neutral-text-action-on-dark-bg']
            }}
            style={styles.getStarted}
            label="Send"
            onPress={() => {}}
          />
        </View>
      </OWBox>
    </View>
  );
});

const styling = colors =>
  StyleSheet.create({
    containerOWBox: {
      marginHorizontal: 16,
      width: metrics.screenWidth - 32,
      padding: spacing['16']
    },
    overview: {
      marginTop: 12,
      marginBottom: 16
    },
    labelTotalAmount: {
      color: colors['neutral-text-heading'],
      fontWeight: '500'
    },
    profit: {
      fontWeight: '400',
      lineHeight: 20
    },
    labelName: {
      paddingLeft: spacing['6'],
      paddingRight: 10,
      fontWeight: '600',
      fontSize: 16,
      color: colors['neutral-text-title']
    },
    infoIcon: {
      width: spacing['26'],
      borderRadius: spacing['26'],
      height: spacing['26']
    },
    btnAcc: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: spacing['2']
    },
    containerInfoAccount: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    getStarted: {
      borderRadius: 999,
      width: metrics.screenWidth / 2.45,
      height: 32
    },
    copy: {
      borderRadius: 999,
      width: metrics.screenWidth / 3,
      height: 32
    },
    btnGroup: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    }
  });

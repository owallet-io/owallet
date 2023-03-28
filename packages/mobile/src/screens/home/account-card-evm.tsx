import React, {
  FunctionComponent,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import { observer } from 'mobx-react-lite';
import { Card, CardBody } from '../../components/card';
import { View, ViewStyle, Image } from 'react-native';
import { Text } from '@src/components/text';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useStore } from '../../stores';
import { AddressCopyable } from '../../components/address-copyable';
import { useSmartNavigation } from '../../navigation.provider';
import { DownArrowIcon, SettingDashboardIcon } from '../../components/icon';
import {
  BuyIcon,
  DepositIcon,
  SendDashboardIcon
} from '../../components/icon/button';
import { spacing, typography } from '../../themes';
import { navigate } from '../../router/root';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NamespaceModal, AddressQRCodeModal } from './components';
import Big from 'big.js';
import LinearGradient from 'react-native-linear-gradient';
import MyWalletModal from './components/my-wallet-modal/my-wallet-modal';
import { NetworkErrorViewEVM } from './network-error-view-evm';
import { useTheme } from '@src/themes/theme-provider';
import { getBase58Address, TRON_ID } from '../../utils/helper';
import { AccountBox } from './account-box';

export const AccountCardEVM: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    priceStore,
    modalStore,
    keyRingStore
  } = useStore();
  const { colors } = useTheme();
  const [evmAddress, setEvmAddress] = useState(null);

  const smartNavigation = useSmartNavigation();
  // const navigation = useNavigation();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);
  const selected = keyRingStore?.multiKeyStoreInfo.find(
    (keyStore) => keyStore?.selected
  );

  // const queryStakable = queries.queryBalances.getQueryBech32Address(
  //   account.bech32Address
  // ).stakable;
  // const stakable = queryStakable?.balance;
  let totalPrice;
  let total;
  if (account.evmosHexAddress) {
    total = queries.evm.queryEvmBalance.getQueryBalance(
      account.evmosHexAddress
    )?.balance;

    if (total) {
      totalPrice = priceStore?.calculatePrice(total, 'USD');
    }
  }
  
  const onPressBtnMain = (name) => {
    if (name === 'Buy') {
      navigate('MainTab', { screen: 'Browser', path: 'https://oraidex.io' });
    }
    if (name === 'Receive') {
      _onPressReceiveModal();
    }
    if (name === 'Send') {
      if (chainStore.current.chainId === TRON_ID) {
        smartNavigation.navigateSmart('SendTron', {
          currency: chainStore.current.stakeCurrency.coinMinimalDenom
        });
      } else {
        smartNavigation.navigateSmart('Send', {
          currency: chainStore.current.stakeCurrency.coinMinimalDenom
        });
      }
    }
  };

  
  const _onPressReceiveModal = () => {
    modalStore.setOpen();
    modalStore.setChildren(
      AddressQRCodeModal({
        account,
        chainStore: chainStore.current
      })
    );
  };

  const handleTotalBalance = useMemo(() => {
    if (chainStore.current.chainId !== TRON_ID) {
      if (totalPrice) {
        return totalPrice.toString();
      } else {
        return total?.shrink(true).maxDecimals(6).toString();
      }
    } else if (chainStore.current.chainId === TRON_ID && total) {
      return (
        new Big(parseInt(total.amount.int.value)).div(new Big(10).pow(24)) +
        ` ${chainStore.current?.stakeCurrency.coinDenom}`
      );
    }
  }, [
    total?.amount?.int?.value,
    chainStore?.current?.chainId,
    totalPrice,
    total,
    chainStore.current?.stakeCurrency?.coinDenom
  ]);
  return (
    <AccountBox
      name={account.name || '...'}
      onPressBtnMain={onPressBtnMain}
      totalBalance={handleTotalBalance}
      address={
        account.evmosHexAddress
          ? chainStore.current.networkType === 'cosmos'
            ? account.bech32Address
            : chainStore.current.chainId === TRON_ID
            ? getBase58Address(account.evmosHexAddress)
            : account.evmosHexAddress
          : '..'
      }
      coinType={
        selected?.bip44HDPath?.coinType ?? chainStore?.current?.bip44?.coinType
      }
    />
  );
});

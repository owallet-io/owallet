import React, {
  FunctionComponent,
  ReactElement,
  useCallback,
  useEffect,
  useState
} from 'react';
import { observer } from 'mobx-react-lite';
import { Card, CardBody } from '../../components/card';
import { View, ViewStyle, Image } from 'react-native';
import { CText as Text } from '../../components/text';
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
import { colors, metrics, spacing, typography } from '../../themes';
import { navigate } from '../../router/root';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NamespaceModal, AddressQRCodeModal } from './components';
import { Hash } from '@owallet/crypto';
import LinearGradient from 'react-native-linear-gradient';
import MyWalletModal from './components/my-wallet-modal/my-wallet-modal';
import { NetworkErrorViewEVM } from './network-error-view-evm';

import { Base58 } from '@ethersproject/basex';
import { sha256 } from '@ethersproject/sha2';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';

const getEvmAddress = base58Address =>
  '0x' + Buffer.from(Base58.decode(base58Address)).slice(1, -4).toString('hex');

const getBase58Address = address => {
  console.log('address', address);

  const evmAddress = '0x41' + address.substring(2);
  const hash = sha256(sha256(evmAddress));
  const checkSum = hash.substring(2, 10);
  return Base58.encode(evmAddress + checkSum);
};

const privateKey =
  '4975143b17cb704090c925ed228d76b90f4c642bcad616439c7b7daa432d9a3f';

const provider = new StaticJsonRpcProvider(
  {
    url: 'https://trx.getblock.io/mainnet/fullnode/jsonrpc',
    headers: { 'x-api-key': 'e2e3f401-2137-409c-b821-bd8c29f2141c' }
  },
  Number('0x2b6653dc')
);

(async () => {
  const signer = new Wallet(privateKey, provider);
})();

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

  const [evmAddress, setEvmAddress] = useState(null);

  const smartNavigation = useSmartNavigation();
  // const navigation = useNavigation();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);
  const selected = keyRingStore?.multiKeyStoreInfo.find(
    keyStore => keyStore?.selected
  );

  useEffect(() => {
    setEvmAddress(account.evmosHexAddress);
    console.log('base58', getBase58Address(account.evmosHexAddress));
  }, [account?.evmosHexAddress]);

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
      console.log(
        ' total.amount.int.value',
        Number(total.amount.int.value) / 10 ** 18 / 10 ** 6
      );

      totalPrice = priceStore?.calculatePrice(total, 'USD');
    }
  }
  // const data: [number, number] = [
  //   parseFloat(stakable.toDec().toString()),
  //   parseFloat(stakedSum.toDec().toString())
  // ];

  const safeAreaInsets = useSafeAreaInsets();
  const onPressBtnMain = name => {
    if (name === 'Buy') {
      navigate('MainTab', { screen: 'Browser', path: 'https://oraidex.io' });
    }
    if (name === 'Receive') {
      _onPressReceiveModal();
    }
    if (name === 'Send') {
      smartNavigation.navigateSmart('Send', {
        currency: chainStore.current.stakeCurrency.coinMinimalDenom
      });
    }
  };

  const _onPressNamespace = () => {
    modalStore.setOpen();
    modalStore.setChildren(NamespaceModal(account));
  };
  const _onPressMyWallet = () => {
    modalStore.setOpen();
    modalStore.setChildren(MyWalletModal());
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

  const RenderBtnMain = ({ name }) => {
    let icon: ReactElement;
    switch (name) {
      case 'Buy':
        icon = <BuyIcon />;
        break;
      case 'Receive':
        icon = <DepositIcon />;
        break;
      case 'Send':
        icon = <SendDashboardIcon />;
        break;
    }
    return (
      <TouchableOpacity
        style={{
          backgroundColor: colors['purple-700'],
          borderRadius: spacing['8'],
          marginLeft: 8,
          marginRight: 8
        }}
        onPress={() => onPressBtnMain(name)}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: spacing['6'],
            paddingBottom: spacing['6'],
            paddingLeft: spacing['12'],
            paddingRight: spacing['12']
          }}
        >
          {icon}
          <Text
            style={{
              ...typography['h7'],
              lineHeight: spacing['20'],
              color: colors['white'],
              paddingLeft: spacing['6'],
              fontWeight: '700'
            }}
          >
            {name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Card
      style={{
        ...containerStyle
      }}
    >
      <CardBody
        style={{
          paddingBottom: spacing['0'],
          paddingTop: safeAreaInsets.top + 10
        }}
      >
        <View
          style={{
            height: 256,
            borderWidth: spacing['0.5'],
            borderColor: colors['gray-100'],
            borderRadius: spacing['12']
          }}
        >
          <LinearGradient
            colors={['#3B2368', '#7D52D1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderTopLeftRadius: spacing['11'],
              borderTopRightRadius: spacing['11'],
              height: 179
            }}
          >
            <View
              style={{
                marginTop: 28,
                marginBottom: 16
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  color: colors['purple-400'],
                  fontSize: 14,
                  lineHeight: 20
                }}
              >
                Total Balance
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: 'white',
                  fontWeight: '900',
                  fontSize: 34,
                  lineHeight: 50
                }}
              >
                {/* {totalPrice
                  ? totalPrice?.toString()
                  : total?.shrink(true).maxDecimals(6).toString()} */}
                {total
                  ? Number(total.amount.int.value) / 10 ** 18 / 10 ** 6
                  : null}
              </Text>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                paddingTop: spacing['6'],
                paddingLeft: spacing['22'],
                paddingRight: spacing['22'],
                justifyContent: 'center'
              }}
            >
              {['Buy', 'Receive', 'Send'].map((e, i) => (
                <RenderBtnMain key={i} name={e} />
              ))}
            </View>
          </LinearGradient>
          <View
            style={{
              backgroundColor: colors['white'],
              display: 'flex',
              height: 95,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: spacing['12'],
              paddingRight: spacing['18'],
              borderBottomLeftRadius: spacing['11'],
              borderBottomRightRadius: spacing['11'],
              shadowColor: colors['gray-150'],
              shadowOffset: {
                width: 0,
                height: 6
              },
              shadowOpacity: 0.3,
              shadowRadius: 4
            }}
          >
            <View
              style={{
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingBottom: spacing['2']
                }}
              >
                <Image
                  style={{
                    width: spacing['26'],
                    height: spacing['26']
                  }}
                  source={require('../../assets/image/address_default.png')}
                  fadeDuration={0}
                />
                <Text
                  style={{
                    paddingLeft: spacing['6'],
                    fontWeight: '700',
                    fontSize: 16
                  }}
                >
                  {account.name || '...'}
                </Text>
              </View>

              <AddressCopyable
                address={
                  chainStore.current.networkType === 'cosmos'
                    ? account.bech32Address
                    : evmAddress
                }
                maxCharacters={22}
                networkType={chainStore.current.networkType}
              />

              {/* {evmAddress ? (
                <AddressCopyable
                  address={
                    chainStore.current.networkType === 'cosmos'
                      ? account.bech32Address
                      : getBase58Address(evmAddress)
                  }
                  maxCharacters={22}
                  networkType={chainStore.current.networkType}
                />
              ) : null} */}

              {/* chainInfo.bip44.coinType */}
              <Text
                style={{
                  paddingLeft: spacing['6'],
                  fontSize: 14
                }}
              >
                {`Coin type: ${
                  selected?.bip44HDPath?.coinType ??
                  chainStore?.current?.bip44?.coinType
                }`}
              </Text>
            </View>
            <TouchableOpacity onPress={_onPressMyWallet}>
              <DownArrowIcon height={28} color={colors['gray-150']} />
            </TouchableOpacity>
          </View>

          {/* {queryStakable?.isFetching ? (
            <View
              style={{
                position: 'absolute',
                bottom: 50,
                left: '50%'
              }}
            >
              <LoadingSpinner color={colors['gray-150']} size={22} />
            </View>
          ) : null} */}
        </View>
      </CardBody>

      {/* <NetworkErrorViewEVM /> */}
      <View style={{ height: 20 }} />
      {/* <CardBody>
        <View
          style={{
            height: 75,
            borderWidth: spacing['0.5'],
            borderColor: colors['gray-100'],
            borderRadius: spacing['12'],
            backgroundColor: colors['white'],
            shadowColor: colors['gray-150'],
            shadowOffset: {
              width: 0,
              height: 6
            },
            shadowOpacity: 0.3,
            shadowRadius: 4
          }}
        >
          <View
            style={{
              display: 'flex',
              height: 75,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: spacing['12'],
              paddingRight: spacing['8']
            }}
          >
            <View
              style={{
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <Text style={{ paddingBottom: spacing['6'] }}>Namespace</Text>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                <Image
                  style={{
                    width: 26,
                    height: 26
                  }}
                  source={require('../../assets/image/namespace_default.png')}
                  fadeDuration={0}
                />
                <Text
                  style={{
                    paddingLeft: spacing['6'],
                    fontWeight: '700',
                    fontSize: spacing['18'],
                    lineHeight: 26,
                    textAlign: 'center',
                    color: colors['gray-900']
                  }}
                >
                  {account.name || 'Harris.orai'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={{ paddingTop: spacing['10'] }}
              onPress={_onPressNamespace}
            >
              <SettingDashboardIcon size={30} color={colors['gray-150']} />
            </TouchableOpacity>
          </View>
        </View>
      </CardBody> */}
    </Card>
  );
});

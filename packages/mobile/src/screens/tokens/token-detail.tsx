import { Text } from '@rneui/base';
import { OWButton } from '@src/components/button';
import { OWBox } from '@src/components/card';
import { OWEmpty } from '@src/components/empty';
import OWIcon from '@src/components/ow-icon/ow-icon';
import { useTheme } from '@src/themes/theme-provider';
import { observer } from 'mobx-react-lite';
import React, {
  FunctionComponent,
  ReactElement,
  useEffect,
  useRef,
  useState
} from 'react';
import { FlatList, View } from 'react-native';
import { API } from '../../common/api';
import {
  BuyIcon,
  DepositIcon,
  SendDashboardIcon
} from '../../components/icon/button';
import { PageWithScrollViewInBottomTabView } from '../../components/page';
import { TokenSymbol } from '../../components/token-symbol';
import { TokenSymbolEVM } from '../../components/token-symbol/token-symbol-evm';
import { useSmartNavigation } from '../../navigation.provider';
import { useLoadingScreen } from '../../providers/loading-screen';
import { navigate } from '../../router/root';
import { useStore } from '../../stores';
import { metrics, spacing, typography } from '../../themes';
import { _keyExtract } from '../../utils/helper';
import { AddressQRCodeModal } from '../home/components';
import {
  TransactionItem,
  TransactionSectionTitle
} from '../transactions/components';

export const TokenDetailScreen: FunctionComponent = observer(props => {
  const { chainStore, queriesStore, accountStore, modalStore } = useStore();
  const smartNavigation = useSmartNavigation();
  const { colors } = useTheme();
  const { amountBalance, balanceCoinDenom, priceBalance, balanceCoinFull } =
    props?.route?.params ?? {};
  const account = accountStore.getAccount(chainStore.current.chainId);
  const queryBalances = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(
      chainStore.current.networkType === 'evm'
        ? account.evmosHexAddress
        : account.bech32Address
    );

  const tokens = queryBalances.balances
    .concat(
      queryBalances.nonNativeBalances,
      queryBalances.positiveNativeUnstakables
    )
    .slice(0, 2);
  const page = useRef(1);
  const [data, setData] = useState([]);
  const offset = useRef(0);
  const hasMore = useRef(true);
  const fetchData = async (isLoadMore = false) => {
    const res = await API.getTransactions(
      {
        address: account.bech32Address,
        page: page.current,
        limit: 10,
        type: 'native'
      },
      // { baseURL: chainStore.current.rest }
      { baseURL: 'https://api.scan.orai.io' }
    );

    const value = res.data?.data || [];
    let newData = isLoadMore ? [...data, ...value] : value;
    hasMore.current = value?.length === 10;
    page.current = res.data?.page?.page_id + 1;
    if (page.current === res.data?.page.total_page) {
      hasMore.current = false;
    }

    setData(newData);
  };

  useEffect(() => {
    offset.current = 0;
    fetchData();
  }, [account.bech32Address, chainStore.current.chainId]);
  const loadingScreen = useLoadingScreen();

  const _onPressReceiveModal = () => {
    modalStore.setOpen();
    modalStore.setChildren(
      AddressQRCodeModal({
        account,
        chainStore: chainStore.current
      })
    );
  };

  const _onPressBtnMain = name => {
    if (name === 'Buy') {
      navigate('MainTab', { screen: 'Browser', path: 'https://oraidex.io' });
    }
    if (name === 'Receive') {
      _onPressReceiveModal();
    }
    if (name === 'Send') {
      smartNavigation.navigateSmart('Send', {
        currency:
          balanceCoinFull ??
          balanceCoinDenom ??
          chainStore.current.stakeCurrency.coinMinimalDenom
      });
    }
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
      <OWButton
        size="small"
        type="primary"
        onPress={() => _onPressBtnMain(name)}
        icon={icon}
        label={name}
        fullWidth={false}
      />
    );
  };
  return (
    <PageWithScrollViewInBottomTabView backgroundColor={colors['background']}>
      <View
        style={{
          marginHorizontal: 24,
          marginBottom: 24
        }}
      >
        <OWBox style={{}} type="gradient">
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {chainStore.current.networkType === 'evm' ? (
              <TokenSymbolEVM
                size={44}
                chainInfo={{
                  stakeCurrency: chainStore.current.stakeCurrency
                }}
                currency={tokens?.[0]?.balance?.currency}
                imageScale={0.54}
              />
            ) : (
              <TokenSymbol
                size={44}
                chainInfo={{
                  stakeCurrency: chainStore.current.stakeCurrency
                }}
                currency={tokens?.[0]?.balance?.currency}
                imageScale={0.54}
              />
            )}

            <View
              style={{
                alignItems: 'center'
              }}
            >
              <Text
                style={{
                  ...typography.h3,
                  color: colors['white'],
                  marginTop: spacing['8'],
                  fontWeight: '800'
                }}
              >
                {`${amountBalance} ${balanceCoinDenom}`}
              </Text>
              <Text
                style={{
                  ...typography.h6,
                  color: colors['purple-400']
                }}
              >
                {`${priceBalance?.toString() ?? '$0'}`}
              </Text>
            </View>
          </View>

          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              paddingTop: spacing['6'],
              justifyContent: 'space-around'
            }}
          >
            {['Buy', 'Receive', 'Send'].map((e, i) => (
              <RenderBtnMain key={i} name={e} />
            ))}
          </View>
        </OWBox>
      </View>
      <OWBox
        style={{
          paddingHorizontal: 0,
          marginTop: 0,
          paddingBottom: 24,
          paddingTop: 0,
          height: metrics.screenHeight / 2.1
        }}
      >
        <TransactionSectionTitle
          containerStyle={{
            paddingTop: 0
          }}
          title={'Transaction list'}
          onPress={async () => {
            await loadingScreen.openAsync();
            await fetchData();
            loadingScreen.setIsLoading(false);
          }}
        />
        <FlatList
          data={data}
          renderItem={({ item, index }) => (
            <TransactionItem
              type={'native'}
              item={item}
              address={account.bech32Address}
              key={index}
              onPress={() =>
                smartNavigation.navigateSmart('Transactions.Detail', {
                  item: {
                    ...item,
                    address: account.bech32Address
                  }
                })
              }
            />
          )}
          keyExtractor={_keyExtract}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => (
            <View
              style={{
                height: 12
              }}
            />
          )}
          ListEmptyComponent={<OWEmpty />}
        />
        <OWButton
          onPress={() => smartNavigation.navigateSmart('Transactions', {})}
          label="View all transactions"
          style={{
            marginHorizontal: spacing['24'],
            marginTop: 10
          }}
          icon={
            <OWIcon name="transactions" color={colors['white']} size={18} />
          }
          fullWidth={false}
        />
      </OWBox>
    </PageWithScrollViewInBottomTabView>
  );
});

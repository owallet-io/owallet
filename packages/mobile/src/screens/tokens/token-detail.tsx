import React, {
  FunctionComponent,
  ReactElement,
  useEffect,
  useRef,
  useState
} from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  FlatList
} from 'react-native';
import { Text } from '@rneui/base';
import { useSmartNavigation } from '../../navigation.provider';
import { TokenSymbol } from '../../components/token-symbol';
import { metrics, spacing, typography } from '../../themes';
import { _keyExtract } from '../../utils/helper';
import { TransactionMinusIcon } from '../../components/icon';
import LinearGradient from 'react-native-linear-gradient';
import {
  BuyIcon,
  DepositIcon,
  SendDashboardIcon
} from '../../components/icon/button';
import {
  TransactionItem,
  TransactionSectionTitle
} from '../transactions/components';
import {
  PageWithScrollViewInBottomTabView,
  PageWithView,
  PageWithViewInBottomTabView
} from '../../components/page';
import { navigate } from '../../router/root';
import { API } from '../../common/api';
import { useLoadingScreen } from '../../providers/loading-screen';
import { AddressQRCodeModal } from '../home/components';
import { TokenSymbolEVM } from '../../components/token-symbol/token-symbol-evm';
import { useTheme } from '@src/themes/theme-provider';
import { OWBox } from '@src/components/card';
import { OWButton } from '@src/components/button';
import OWIcon from '@src/components/ow-icon/ow-icon';
import { OWEmpty } from '@src/components/empty';
import OWTransactionItem from '../transactions/components/items/transaction-item';

export const TokenDetailScreen: FunctionComponent = observer((props) => {
  const { chainStore, queriesStore, accountStore, modalStore } = useStore();
  const smartNavigation = useSmartNavigation();
  const { colors } = useTheme();
  const styles = styling(colors);
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
  const fetchData = async (isLoadMore = false, denom, rpc) => {
    const res = await API.getTransactionsByToken({
      address: account.bech32Address,
      page: `${page.current}`,
      per_page: '10',
      rpcUrl: rpc,
      token: denom && denom.toLowerCase()
    });

    console.log('res: ', res);
    let newData = isLoadMore ? [...data, ...res?.txs] : res;
    hasMore.current = res?.txs?.length === 10;
    page.current += 1;
    if (page.current === res?.total_count) {
      hasMore.current = false;
    }
    setData(newData);
  };

  useEffect(() => {
    offset.current = 0;
    fetchData(true, balanceCoinDenom, chainStore.current.rpc);
  }, [account.bech32Address, chainStore.current.rpc, balanceCoinDenom]);
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

  const _onPressBtnMain = (name) => {
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
  console.log(balanceCoinDenom);
  return (
    <PageWithView>
      <View
        style={{
          flex: 1
        }}
      >
        <View
          style={{
            marginHorizontal: 24
          }}
        >
          <OWBox type="gradient">
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
            flex: 1
          }}
        >
          <TransactionSectionTitle
            containerStyle={{
              paddingTop: 0
            }}
            title={'Transaction list'}
            onPress={async () => {
              await loadingScreen.openAsync();
              // await fetchData();
              loadingScreen.setIsLoading(false);
            }}
          />
          <FlatList
            data={data}
            renderItem={({ item }) => {
              console.log('item: ', item);
              return <OWTransactionItem data={item} />;
            }}
            keyExtractor={_keyExtract}
            showsVerticalScrollIndicator={false}
            // ListFooterComponent={() => (
            //   <View
            //     style={{
            //       height: 12
            //     }}
            //   />
            // )}

            ListEmptyComponent={<OWEmpty />}
          />
          {/* <OWButton
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
        /> */}
        </OWBox>
      </View>
    </PageWithView>
  );
});

const styling = (colors) =>
  StyleSheet.create({
    containerToken: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: spacing['4'],
      marginVertical: spacing['8'],
      paddingTop: spacing['18'],
      paddingBottom: spacing['18']
    },
    transactionListEmpty: {
      justifyContent: 'center',
      alignItems: 'center'
    }
  });

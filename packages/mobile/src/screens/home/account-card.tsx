import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { Card, CardBody } from '../../components/card';
import {
  StyleSheet,
  Text,
  View,
  ViewStyle,
  ImageBackground,
  Image,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useStore } from '../../stores';
import { AddressCopyable } from '../../components/address-copyable';
// import { DoubleDoughnutChart } from "../../components/svg";
import { Button } from '../../components/button';
import { LoadingSpinner } from '../../components/spinner';
// import { StakedTokenSymbol, TokenSymbol } from "../../components/token-symbol";
import { useSmartNavigation } from '../../navigation.provider';
import { NetworkErrorView } from './network-error-view';
import { ProgressBar } from '../../components/progress-bar';
import {
  DownArrowIcon,
  RightArrowIcon,
  Scanner,
  SendIcon,
  SettingDashboardIcon,
} from '../../components/icon';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  BuyIcon,
  DepositIcon,
  SendDashboardIcon,
} from '../../components/icon/button';
import { typography } from '../../themes';

export const AccountCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();
  const intl = useIntl();

  const smartNavigation = useSmartNavigation();
  const navigation = useNavigation();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  let data: [number, number];
  let total: CoinPretty;
  let stakedSum: CoinPretty;
  let stakable: CoinPretty;
  let balanceQuery:
    | ObservableQueryEvmBalanceInner
    | ObservableQueryBalanceInner;

  if (chainStore.current.networkType === 'evm') {
    balanceQuery = queries.evm.queryEvmBalance.getQueryBalance(
      account.evmosHexAddress
    );

  const queryDelegated = queries.cosmos.queryDelegations.getQueryBech32Address(
    account.bech32Address
  );
  const delegated = queryDelegated.total;

  const queryUnbonding =
    queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
      account.bech32Address
    );
  const unbonding = queryUnbonding.total;

  const stakedSum = delegated.add(unbonding);

  const total = stakable.add(stakedSum);

  const totalPrice = priceStore.calculatePrice(total);

  const data: [number, number] = [
    parseFloat(stakable.toDec().toString()),
    parseFloat(stakedSum.toDec().toString()),
  ];

  const onPressBtnMain = (name) => {
    if (name === 'Buy') {
    }
    if (name === 'Deposit') {
    }
    if (name === 'Send') {
      smartNavigation.navigateSmart('Send', {
        currency: chainStore.current.stakeCurrency.coinMinimalDenom,
      });
    }
  };

  const RenderBtnMain = ({ name }) => {
    let icon;
    switch (name) {
      case 'Buy':
        icon = <BuyIcon />;
        break;
      case 'Deposit':
        icon = <DepositIcon />;
        break;
      case 'Send':
        icon = <SendDashboardIcon />;
        break;
    }
    return (
      <TouchableOpacity
        style={{
          backgroundColor: '#8B1BFB',
          borderWidth: 0.5,
          borderRadius: 8,
          borderColor: '#8B1BFB',
        }}
        onPress={() => onPressBtnMain(name)}
      >
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: 8,
          }}
        >
          {icon}
          <Text
            style={{
              fontSize: 14,
              lineHeight: 20,
              color: '#FFFFFF',
              paddingLeft: 6,
              fontWeight: '700',
            }}
          >
            {name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Card style={containerStyle}>
      <CardBody style={{ paddingBottom: 0 }}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingBottom: 26,
          }}
        >
          <Text
            onPress={() => {
              navigation.dispatch(DrawerActions.toggleDrawer());
            }}
            style={typography['h4']}
          >
            {account.name || '...'}
          </Text>
          {/* {chainStore.current.chainName + ' '} */}
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Others', {
                screen: 'Camera',
              });
            }}
          >
            <Scanner size={28} color={'#5064fb'} />
          </TouchableOpacity>
        </View>

        <View
          style={{
            height: 256,
            borderWidth: 0.5,
            borderColor: '#F2F6FA',
            borderRadius: 12,
          }}
        >
          <View
            style={{
              borderTopLeftRadius: 11,
              borderTopRightRadius: 11,
              height: 179,
              backgroundColor: '#4C4C56',
            }}
          >
            <View
              style={{
                marginTop: 28,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  color: '#AEAEB2',
                  fontSize: 14,
                  lineHeight: 20,
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
                  lineHeight: 50,
                }}
              >
                {totalPrice
                  ? totalPrice.toString()
                  : total.shrink(true).maxDecimals(6).toString()}
              </Text>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingTop: 6,
                paddingLeft: 20,
                paddingRight: 20,
              }}
            >
              {['Buy', 'Deposit', 'Send'].map((e, i) => (
                <RenderBtnMain key={i} name={e} />
              ))}
            </View>
          </View>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              display: 'flex',
              height: 75,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: 12,
              paddingRight: 18,
              borderBottomLeftRadius: 11,
              borderBottomRightRadius: 11,
              shadowColor: 'rgba(24, 39, 75, 0.12)',
              shadowOffset: {
                width: 0,
                height: 12,
              },
              shadowOpacity: 1,
              shadowRadius: 16.0,
            }}
          >
            <View
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingBottom: 2,
                }}
              >
                <Image
                  style={{
                    width: 26,
                    height: 26,
                  }}
                  source={require('../../assets/image/address_default.png')}
                  fadeDuration={0}
                />
                <Text style={{ paddingLeft: 6 }}>{account.name || '...'}</Text>
              </View>

              <AddressCopyable
                address={account.bech32Address}
                maxCharacters={22}
              />
            </View>
            <View>
              <DownArrowIcon height={30} color={'#5F5E77'} />
            </View>
          </View>
          {queryStakable.isFetching ? (
            <View
              style={{
                position: 'absolute',
                bottom: 50,
                left: '50%',
              }}
            >
              <LoadingSpinner color={'gray'} size={22} />
            </View>
          ) : null}
        </View>
      </CardBody>
      <NetworkErrorView />
      <CardBody>
        <View
          style={{
            height: 75,
            borderWidth: 0.5,
            borderColor: '#F2F6FA',
            borderRadius: 12,
            backgroundColor: 'white',
            shadowColor: 'rgba(24, 39, 75, 0.12)',
            shadowOffset: {
              width: 0,
              height: 12,
            },
            shadowOpacity: 1,
            shadowRadius: 16.0,
          }}
        >
          <View
            style={{
              display: 'flex',
              height: 75,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: 12,
              paddingRight: 8,
            }}
          >
            <View
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ paddingBottom: 6 }}>Namespace</Text>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Image
                  style={{
                    width: 26,
                    height: 26,
                  }}
                  source={require('../../assets/image/namespace_default.png')}
                  fadeDuration={0}
                />
                <Text
                  style={{
                    paddingLeft: 6,
                    fontWeight: '700',
                    fontSize: 18,
                    lineHeight: 26,
                    textAlign: 'center',
                    color: '#1C1C1E',
                  }}
                >
                  Harris.orai
                </Text>
              </View>
            </View>
            <View style={{ paddingTop: 10 }}>
              <SettingDashboardIcon size={30} color={'#5F5E77'} />
            </View>
          </View>
        </View>
      </CardBody>
      {/* <CardBody style={{
        paddingTop: 16
      }}>
        <View style={{
          display: 'flex',
          alignItems: 'center'
        }}>
          <View
            style={style.flatten([
              'flex-row',
              'items-center',
              'margin-bottom-28',
            ])}
          >
            <TokenSymbol
              size={44}
              chainInfo={chainStore.current}
              currency={chainStore.current.stakeCurrency}
            />
            <View style={{
              marginLeft: 12
            }}>
              <View
                style={style.flatten([
                  'flex-row',
                  'items-center',
                  'margin-bottom-4',
                ])}
              >
                <View
                  style={style.flatten([
                    'width-8',
                    'height-8',
                    'background-color-primary',
                    'border-radius-8',
                    'margin-right-4',
                  ])}
                />
                <Text
                  style={style.flatten([
                    'subtitle3',
                    'color-text-black-very-low',
                  ])}
                >
                  Available
                </Text>
              </View>
              <Text style={style.flatten(['h5', 'color-text-black-medium'])}>
                {stakable.maxDecimals(6).trim(true).shrink(true).toString()}
              </Text>
            </View>
            <View style={style.flatten(['flex-1'])} />
            <Button
              text={intl.formatMessage({ id: 'send.button.send' })}
              mode="outline"
              size="small"
              containerStyle={style.flatten(['min-width-72'])}
              onPress={() => {
                smartNavigation.navigateSmart('Send', {
                  currency: chainStore.current.stakeCurrency.coinMinimalDenom,
                });
              }}
            />
          </View>
          <View
            style={style.flatten([
              'flex-row',
              'items-center',
              'margin-bottom-8',
            ])}
          >
            <StakedTokenSymbol size={44} />
            <View style={style.flatten(['margin-left-12'])}>
              <View
                style={style.flatten([
                  'flex-row',
                  'items-center',
                  'margin-bottom-4',
                ])}
              >
                <View
                  style={style.flatten([
                    'width-8',
                    'height-8',
                    'background-color-secondary-500',
                    'border-radius-8',
                    'margin-right-4',
                  ])}
                />
                <Text
                  style={style.flatten([
                    'subtitle3',
                    'color-text-black-very-low',
                  ])}
                >
                  Staking
                </Text>
              </View>
              <Text style={style.flatten(['h5', 'color-text-black-medium'])}>
                {stakedSum.maxDecimals(6).trim(true).shrink(true).toString()}
              </Text>
            </View>
            <View style={style.flatten(['flex-1'])} />
            <Button
              text="Stake"
              mode="outline"
              size="small"
              containerStyle={style.flatten(['min-width-72'])}
              onPress={() => {
                smartNavigation.navigateSmart('Validator.List', {});
              }}
            />
          </View>
        </View>
      </CardBody> */}
    </Card>
  );
});

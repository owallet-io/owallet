import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { Card, CardBody } from '../../components/card';
import {
  StyleSheet,
  Text,
  View,
  ViewStyle,
  ImageBackground,
  TouchableOpacity
} from 'react-native';
import { useStore } from '../../stores';
import { useStyle } from '../../styles';
import { AddressCopyable } from '../../components/address-copyable';
// import { DoubleDoughnutChart } from "../../components/svg";
import { Button } from '../../components/button';
import { LoadingSpinner } from '../../components/spinner';
// import { StakedTokenSymbol, TokenSymbol } from "../../components/token-symbol";
import { useSmartNavigation } from '../../navigation.provider';
import { NetworkErrorView } from './network-error-view';
import { ProgressBar } from '../../components/progress-bar';
import { Scanner } from '../../components/icon';
import { useNavigation } from '@react-navigation/native';
import { FormattedMessage, useIntl } from 'react-intl';
export const AccountCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    priceStore,
    analyticsStore,
  } = useStore();

  const style = useStyle();

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
    parseFloat(stakedSum.toDec().toString())
  ];

  return (
    <Card style={containerStyle}>
      <CardBody style={style.flatten(['padding-bottom-0'])}>
        <View style={style.flatten(['flex-row', 'justify-between'])}>
          <Text style={style.flatten(['h4'])}>{account.name || '...'}</Text>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Others', {
                screen: 'Camera'
              });
            }}
          >
            <Scanner size={28} color={style.get('color-primary').color} />
          </TouchableOpacity>
        </View>

        <View style={style.flatten(['flex', 'items-center'])}>
          <View
            style={style.flatten([
              'margin-top-28',
              'margin-bottom-16',
              'width-full'
            ])}
          >
            {/* <DoubleDoughnutChart data={data} /> */}
            <ImageBackground
              resizeMode={'contain'}
              source={require('../../assets/image/background-card.png')}
              style={style.flatten(['width-full', 'height-214'])}
            />
            <ProgressBar
              progress={(data?.[0] / data?.reduce((a, b) => a + b, 0)) * 100}
              styles={['margin-top-24']}
            />
            <View
              style={style.flatten([
                'absolute-fill',
                'items-center',
                'justify-center'
              ])}
            >
              <Text
                style={style.flatten([
                  'subtitle2',
                  'color-text-black-very-very-very-low',
                  'margin-bottom-4'
                ])}
              >
                Total Balance
              </Text>
              <Text style={style.flatten(['h1', 'color-white'])}>
                {totalPrice
                  ? totalPrice.toString()
                  : total.shrink(true).maxDecimals(6).toString()}
              </Text>
              {queryStakable.isFetching ? (
                <View
                  style={StyleSheet.flatten([
                    style.flatten(['absolute']),
                    {
                      bottom: 33
                    }
                  ])}
                >
                  <LoadingSpinner
                    color={style.get('color-loading-spinner').color}
                    size={22}
                  />
                </View>
              ) : null}
              <AddressCopyable
                style={style.flatten(['margin-24'])}
                address={account.bech32Address}
                maxCharacters={22}
              />
            </View>
          </View>
        </View>
      </CardBody>
      <NetworkErrorView />
      <CardBody style={style.flatten(['padding-top-16'])}>
        <View style={style.flatten(['flex', 'items-center'])}>
          <View
            style={style.flatten([
              'flex-row',
              'items-center',
              'margin-bottom-28'
            ])}
          >
            {/* <TokenSymbol
              size={44}
              chainInfo={chainStore.current}
              currency={chainStore.current.stakeCurrency}
            /> */}
            <View style={style.flatten(['margin-left-12'])}>
              <View
                style={style.flatten([
                  'flex-row',
                  'items-center',
                  'margin-bottom-4'
                ])}
              >
                <View
                  style={style.flatten([
                    'width-8',
                    'height-8',
                    'background-color-primary',
                    'border-radius-8',
                    'margin-right-4'
                  ])}
                />
                <Text
                  style={style.flatten([
                    'subtitle3',
                    'color-text-black-very-low'
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
                  currency: chainStore.current.stakeCurrency.coinMinimalDenom
                });
              }}
            />
          </View>
          <View
            style={style.flatten([
              'flex-row',
              'items-center',
              'margin-bottom-8'
            ])}
          >
            {/* <StakedTokenSymbol size={44} /> */}
            <View style={style.flatten(['margin-left-12'])}>
              <View
                style={style.flatten([
                  'flex-row',
                  'items-center',
                  'margin-bottom-4'
                ])}
              >
                <View
                  style={style.flatten([
                    'width-8',
                    'height-8',
                    'background-color-secondary-500',
                    'border-radius-8',
                    'margin-right-4'
                  ])}
                />
                <Text
                  style={style.flatten([
                    'subtitle3',
                    'color-text-black-very-low'
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
      </CardBody>
    </Card>
  );
});

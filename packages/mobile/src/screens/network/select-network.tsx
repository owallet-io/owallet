import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { PageWithScrollView } from '../../components/page';
import { colors } from '../../themes';
import { OWalletLogo } from '../register/owallet-logo';
import { CText as Text } from '../../components/text';
import { Controller, useForm } from 'react-hook-form';
import { TextInput } from '../../components/input';
import { LoadingSpinner } from '../../components/spinner';
import { useSimpleTimer } from '../../hooks';
import { useSmartNavigation } from '../../navigation.provider';
import { useStore } from '../../stores';
import { Bech32Address } from '@owallet/cosmos';
import { EmbedChainInfos } from '@owallet/common';

interface FormData {
  name: string;
  url_rpc: string;
  code: string;
  url_block: string;
  symbol: string;
}

export const SelectNetworkScreen = () => {
  const {
    control,
    handleSubmit,
    setFocus,
    getValues,
    formState: { errors }
  } = useForm<FormData>();
  const { isTimedOut, setTimer } = useSimpleTimer();
  const { chainStore, embedChainInfosStore } = useStore();
  const smartNavigation = useSmartNavigation();
  const submit = handleSubmit(async () => {
    const { name, url_rpc, code, url_block, symbol } = getValues();
    setTimer(2000);
    const chainInfo = {
      rpc: 'https://rpc.orai.io',
      rest: 'https://lcd.orai.io',
      chainId: 'Oraichain-plus',
      chainName: 'Oraichain Plus',
      networkType: 'cosmos',
      stakeCurrency: {
        coinDenom: 'ORAI',
        coinMinimalDenom: 'orai',
        coinDecimals: 6,
        coinGeckoId: 'oraichain-token',
        coinImageUrl:
          'https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png'
      },
      bip44: {
        coinType: 118
      },
      bech32Config: Bech32Address.defaultBech32Config('orai'),
      get currencies() {
        return [
          this.stakeCurrency,
          {
            type: 'cw20',
            coinDenom: 'AIRI',
            coinMinimalDenom:
              'cw20:orai10ldgzued6zjp0mkqwsv2mux3ml50l97c74x8sg:aiRight Token',
            contractAddress: 'orai10ldgzued6zjp0mkqwsv2mux3ml50l97c74x8sg',
            coinDecimals: 6,
            coinGeckoId: 'airight',
            coinImageUrl: 'https://i.ibb.co/m8mCyMr/airi.png'
          },
          {
            type: 'cw20',
            coinDenom: 'ORAIX',
            coinMinimalDenom:
              'cw20:orai1lus0f0rhx8s03gdllx2n6vhkmf0536dv57wfge:OraiDex Token',
            contractAddress: 'orai1lus0f0rhx8s03gdllx2n6vhkmf0536dv57wfge',
            coinDecimals: 6,
            // coinGeckoId: 'oraix',
            coinImageUrl: 'https://i.ibb.co/VmMJtf7/oraix.png'
          },
          {
            type: 'cw20',
            coinDenom: 'USDT',
            coinMinimalDenom:
              'cw20:orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh:Tether',
            contractAddress: 'orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh',
            coinDecimals: 6,
            coinGeckoId: 'tether',
            coinImageUrl:
              'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
          }
        ];
      },
      get feeCurrencies() {
        return [this.stakeCurrency];
      },
      gasPriceStep: {
        low: 0,
        average: 0.000025,
        high: 0.00004
      },
      features: ['stargate', 'ibc-transfer', 'cosmwasm'],
      chainSymbolImageUrl: 'https://orai.io/images/logos/logomark-dark.png',
      txExplorer: {
        name: 'Oraiscan',
        txUrl: 'https://scan.orai.io/txs/{txHash}',
        accountUrl: 'https://scan.orai.io/account/{address}'
      },
      beta: true // use v1beta1
    };
    await chainStore.addChain(chainInfo);
    await embedChainInfosStore.addChain(chainInfo);
    await chainStore.tryUpdateChain(chainInfo.chainId);
  });

  return (
    <PageWithScrollView
      contentContainerStyle={{
        paddingLeft: 20,
        paddingRight: 20
      }}
      backgroundColor={colors['white']}
    >
      <View
        style={{
          height: 72,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Text
          style={{
            fontSize: 24,
            lineHeight: 34,
            fontWeight: '700',
            color: colors['gray-900']
          }}
        >
          New RPC network
        </Text>
        <View>
          <OWalletLogo size={72} />
        </View>
      </View>
      <Text style={{ paddingTop: 10 }}>
        Use a custom network that supports RPC via URL instead of some of the
        networks provided
      </Text>
      <View style={{ height: 20 }} />
      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              label="Network name"
              labelStyle={{
                fontWeight: '700'
              }}
              placeholder={'Network name (Optional)'}
              inputStyle={{
                ...styles.borderInput
              }}
              onSubmitEditing={() => {
                submit();
              }}
              error={errors.name?.message}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              ref={ref}
            />
          );
        }}
        name="name"
        defaultValue=""
      />
      <Controller
        control={control}
        // rules={{
        //   required: 'New RPC network is required',
        //   validate: (value: string) => {
        //     const values = value.toLowerCase();
        //     if (!/^https?:\/\//.test(values)) {
        //       return 'The url must have a proper https prefix';
        //     }
        //   }
        // }}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              label="URL RPC"
              inputStyle={{
                ...styles.borderInput
              }}
              placeholder={'New RPC network'}
              labelStyle={{
                fontWeight: '700'
              }}
              onSubmitEditing={() => {
                setFocus('url_rpc');
              }}
              error={errors.url_rpc?.message}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              ref={ref}
            />
          );
        }}
        name="url_rpc"
        defaultValue=""
      />
      <Controller
        control={control}
        // rules={{
        //   required: 'Code is required',
        //   validate: (value: string) => {
        //     const values = value.toLowerCase();
        //     if (!/\b(0x[0-9a-fA-F]+|[0-9]+)\b/.test(values)) {
        //       return 'Invalid number. Please enter a decimal or hexadecimal number starting with "0x".';
        //     }
        //   }
        // }}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              label="Code"
              inputStyle={{
                ...styles.borderInput
              }}
              placeholder={'Code'}
              labelStyle={{
                fontWeight: '700'
              }}
              onSubmitEditing={() => {
                submit();
              }}
              error={errors.code?.message}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              ref={ref}
            />
          );
        }}
        name="code"
        defaultValue=""
      />
      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              label="Symbol"
              inputStyle={{
                ...styles.borderInput
              }}
              labelStyle={{
                fontWeight: '700'
              }}
              placeholder={'Symbol (Optional)'}
              onSubmitEditing={() => {
                submit();
              }}
              error={errors.symbol?.message}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              ref={ref}
            />
          );
        }}
        name="symbol"
        defaultValue=""
      />

      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              label="Block explorer URL"
              inputStyle={{
                ...styles.borderInput
              }}
              labelStyle={{
                fontWeight: '700'
              }}
              onSubmitEditing={() => {
                submit();
              }}
              placeholder={'Block explorer URL (Optional)'}
              error={errors.url_block?.message}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              ref={ref}
            />
          );
        }}
        name="url_block"
        defaultValue=""
      />
      <TouchableOpacity
        disabled={isTimedOut}
        onPress={submit}
        style={{
          marginBottom: 24,
          marginTop: 20,
          backgroundColor: colors['purple-900'],
          borderRadius: 8
        }}
      >
        {isTimedOut ? (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <LoadingSpinner color={colors['white']} size={20} />
          </View>
        ) : (
          <Text
            style={{
              color: 'white',
              textAlign: 'center',
              fontWeight: '700',
              fontSize: 16,
              padding: 16
            }}
          >
            Next
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        disabled={isTimedOut}
        onPress={() => {
          smartNavigation.goBack();
        }}
      >
        <Text
          style={{
            color: colors['purple-900'],
            textAlign: 'center',
            fontWeight: '700',
            fontSize: 16
          }}
        >
          Go back
        </Text>
      </TouchableOpacity>
    </PageWithScrollView>
  );
};

const styles = StyleSheet.create({
  borderInput: {
    borderColor: colors['purple-100'],
    borderWidth: 1,
    backgroundColor: colors['white'],
    paddingLeft: 11,
    paddingRight: 11,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 8
  }
});

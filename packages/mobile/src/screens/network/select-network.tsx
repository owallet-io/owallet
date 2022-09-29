import React from 'react';
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

interface FormData {
  name: string;
  chainId: string;
  url_rpc: string;
  url_rest: string;
  code: string;
  coinMinimal: string;
  coingecko: string;
  url_block: string;
  networkType: string;
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
  const { chainStore } = useStore();
  const smartNavigation = useSmartNavigation();
  const submit = handleSubmit(async () => {
    const {
      name,
      chainId,
      url_rpc,
      url_rest,
      code,
      url_block,
      symbol,
      coingecko,
      coinMinimal,
      networkType
    } = getValues();

    setTimer(2000);
    const block = url_block ?? 'https://scan.orai.io';
    const chainInfo = {
      rpc: `${url_rpc}`,
      rest: `${url_rest}`,
      chainId: `${chainId ?? name.split(' ').join('-')}`,
      chainName: `${name}`,
      networkType: networkType.toLocaleLowerCase(),
      stakeCurrency: {
        coinDenom: `${code.split(' ').join('').toLocaleUpperCase()}`,
        coinMinimalDenom: `${coinMinimal
          .split(' ')
          .join('')
          .toLocaleLowerCase()}`,
        coinDecimals: 6,
        coinGeckoId: `${
          coingecko.split(' ').join('-').toLocaleLowerCase() ??
          code.split(' ').join('-').toLocaleLowerCase()
        }`,
        coinImageUrl:
          symbol !== ''
            ? symbol
            : 'https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png'
      },
      bip44: {
        coinType: 118
      },
      bech32Config: Bech32Address.defaultBech32Config(
        `${
          coingecko.split(' ').join('-').toLocaleLowerCase() ??
          code.split(' ').join('-').toLocaleLowerCase()
        }`
      ),
      get currencies() {
        return [this.stakeCurrency];
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
      chainSymbolImageUrl:
        symbol !== ''
          ? symbol
          : 'https://orai.io/images/logos/logomark-dark.png',
      txExplorer: {
        name: 'Scan',
        txUrl: `${block}/txs/{txHash}`,
        accountUrl: `${block}/account/{address}`
      },
      beta: true // use v1beta1
    };
    await chainStore.addChain(chainInfo);
    alert('Network added successfully!');
    smartNavigation.goBack();
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
              placeholder={'Network name'}
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
        rules={{
          required: 'Chain Id is required'
        }}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              label="Chain Id"
              labelStyle={{
                fontWeight: '700'
              }}
              placeholder={'Chain Id'}
              inputStyle={{
                ...styles.borderInput
              }}
              onSubmitEditing={() => {
                submit();
              }}
              error={errors.chainId?.message}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              ref={ref}
            />
          );
        }}
        name="chainId"
        defaultValue=""
      />
      <Controller
        control={control}
        rules={{
          required: 'New RPC network is required',
          validate: (value: string) => {
            const values = value.toLowerCase();
            if (!/^https?:\/\//.test(values)) {
              return 'The url must have a proper https prefix';
            }
          }
        }}
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
        rules={{
          required: 'New Rest network is required',
          validate: (value: string) => {
            const values = value.toLowerCase();
            if (!/^https?:\/\//.test(values)) {
              return 'The url must have a proper https prefix';
            }
          }
        }}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              label="URL Rest"
              inputStyle={{
                ...styles.borderInput
              }}
              placeholder={'New Rest network'}
              labelStyle={{
                fontWeight: '700'
              }}
              onSubmitEditing={() => {
                setFocus('url_rest');
              }}
              error={errors.url_rest?.message}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              ref={ref}
            />
          );
        }}
        name="url_rest"
        defaultValue=""
      />
      <Controller
        control={control}
        rules={{
          required: 'Coin Denom is required',
          // validate: (value: string) => {
          //   const values = value.toLowerCase();
          //   if (!/\b(0x[0-9a-fA-F]+|[0-9]+)\b/.test(values)) {
          //     return 'Invalid number. Please enter a decimal or hexadecimal number starting with "0x".';
          //   }
          // }
          validate: (value: string) => {
            const values = value.toLowerCase();
            if (!values) {
              return 'Coin Denom is required';
            }
          }
        }}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              label="Coin Denom"
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
        rules={{
          required: 'Coin Minimnal Denom is required',
          validate: (value: string) => {
            const values = value.toLowerCase();
            if (!values) {
              return 'Coin Minimnal is required';
            }
          }
        }}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              label="Coin Minimal Denom"
              inputStyle={{
                ...styles.borderInput
              }}
              placeholder={'Coin Minimal Denom'}
              labelStyle={{
                fontWeight: '700'
              }}
              onSubmitEditing={() => {
                submit();
              }}
              error={errors.coinMinimal?.message}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              ref={ref}
            />
          );
        }}
        name="coinMinimal"
        defaultValue=""
      />
      <Controller
        control={control}
        rules={{
          required: 'Network type is required',
          validate: (value: string) => {
            const values = value.toLowerCase();
            if (!/^(cosmos|evm)/.test(values)) {
              return 'Network type must be cosmos or evm';
            }
          }
        }}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              label="Network type"
              inputStyle={{
                ...styles.borderInput
              }}
              placeholder={'Network type (Cosmos or EVM)'}
              labelStyle={{
                fontWeight: '700'
              }}
              onSubmitEditing={() => {
                submit();
              }}
              error={errors.networkType?.message}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              ref={ref}
            />
          );
        }}
        name="networkType"
        defaultValue=""
      />
      <Controller
        control={control}
        rules={{
          required: 'Coingecko ID is required',

          validate: (value: string) => {
            const values = value.toLowerCase();
            if (!values) {
              return 'Coingecko ID is required';
            }
          }
        }}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              label="Coingecko ID"
              inputStyle={{
                ...styles.borderInput
              }}
              placeholder={'Coingecko ID'}
              labelStyle={{
                fontWeight: '700'
              }}
              onSubmitEditing={() => {
                submit();
              }}
              error={errors.coingecko?.message}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              ref={ref}
            />
          );
        }}
        name="coingecko"
        defaultValue=""
      />

      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              label="Symbol (Optional)"
              inputStyle={{
                ...styles.borderInput
              }}
              labelStyle={{
                fontWeight: '700'
              }}
              placeholder={'Symbol'}
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
              label="Block explorer URL (Optional)"
              inputStyle={{
                ...styles.borderInput
              }}
              labelStyle={{
                fontWeight: '700'
              }}
              onSubmitEditing={() => {
                submit();
              }}
              placeholder={'Block explorer URL'}
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

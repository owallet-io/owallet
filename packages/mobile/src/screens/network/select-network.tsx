import React, { useState } from 'react';
import { Keyboard, StyleSheet, TouchableOpacity, View } from 'react-native';
import { PageWithScrollView } from '../../components/page';
import { colors, typography } from '../../themes';
import { OWalletLogo } from '../register/owallet-logo';
import { CText as Text } from '../../components/text';
import { Controller, useForm } from 'react-hook-form';
import { TextInput } from '../../components/input';
import { LoadingSpinner } from '../../components/spinner';
import { useSimpleTimer } from '../../hooks';
import { useSmartNavigation } from '../../navigation.provider';
import { useStore } from '../../stores';
import { Bech32Address } from '@owallet/cosmos';
import RadioGroup from 'react-native-radio-buttons-group';

interface FormData {
  name: string;
  chainId: string;
  url_rpc: string;
  url_rest: string;
  code: string;
  bech32Config: string;
  coinMinimal: string;
  coingecko: string;
  url_block: string;
  networkType: string;
  features: string;
  symbol: string;
  feeLow: number;
  feeMedium: number;
  feeHigh: number;
}

export const SelectNetworkType = ({ onSelectNetworkType, modalStore }) => {
  const [radioButtons, setRadioButtons] = useState([
    {
      id: 'cosmos',
      label: 'Cosmos',
      value: 'cosmos'
    },
    {
      id: 'evm',
      label: 'EVM',
      value: 'evm'
    }
  ]);

  function onPressRadioButton(radioButtonsArray) {
    setRadioButtons(radioButtonsArray);
    onSelectNetworkType && onSelectNetworkType(radioButtonsArray);
    modalStore.close();
  }

  return (
    <RadioGroup radioButtons={radioButtons} onPress={onPressRadioButton} />
  );
};

export const SelectNetworkScreen = () => {
  const {
    control,
    handleSubmit,
    setFocus,
    getValues,
    formState: { errors }
  } = useForm<FormData>();
  const { isTimedOut, setTimer } = useSimpleTimer();
  const { chainStore, modalStore } = useStore();
  const smartNavigation = useSmartNavigation();
  // const navigation = useNavigation();
  const _onPressNetworkType = onChange => {
    Keyboard.dismiss();
    modalStore.setOpen();
    modalStore.setChildren(
      <SelectNetworkType
        onSelectNetworkType={onChange}
        modalStore={modalStore}
      />
    );
  };
  const submit = handleSubmit(async () => {
    const {
      name,
      chainId,
      url_rpc,
      url_rest,
      code,
      bech32Config,
      url_block,
      symbol,
      coingecko,
      coinMinimal,
      networkType,
      features,
      feeLow,
      feeMedium,
      feeHigh
    } = getValues();

    setTimer(2000);
    const block = url_block;
    const chainInfo = {
      rpc: `${url_rpc}`,
      rest: `${url_rest}`,
      chainId:
        chainId.split(' ').join('-').toLocaleLowerCase() ??
        `${name.split(' ').join('-')}`,
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
          bech32Config.split(' ').join('').toLocaleLowerCase() ??
          code.split(' ').join('').toLocaleLowerCase()
        }`
      ),
      get currencies() {
        return [this.stakeCurrency];
      },
      get feeCurrencies() {
        return [this.stakeCurrency];
      },
      gasPriceStep: {
        low: feeLow,
        average: feeMedium,
        high: feeHigh
      },
      features: features.replace(/ /g, '').split(','),
      chainSymbolImageUrl:
        symbol !== ''
          ? symbol
          : 'https://orai.io/images/logos/logomark-dark.png',
      txExplorer: {
        name: 'Scan',
        txUrl: `${block}/txs/{txHash}`,
        accountUrl: `${block}/account/{address}`
      }
      // beta: true // use v1beta1
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
      <Text
        style={{
          ...typography.h3,
          fontWeight: '900',
          color: colors['gray-900'],
          paddingBottom: 20
        }}
      >
        {`Network Info`}
      </Text>
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
              // onSubmitEditing={() => {
              //   submit();
              // }}
              error={errors.networkType?.message}
              // onBlur={onBlur}
              // onChangeText={onChange}
              onFocus={() => _onPressNetworkType(onChange)}
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
          required: 'Bech32 Prefix is required'
        }}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              label="Bech32 Prefix"
              inputStyle={{
                ...styles.borderInput
              }}
              placeholder={'Bech32 Prefix'}
              labelStyle={{
                fontWeight: '700'
              }}
              onSubmitEditing={() => {
                submit();
              }}
              error={errors.bech32Config?.message}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              ref={ref}
            />
          );
        }}
        name="bech32Config"
        defaultValue=""
      />
      <Controller
        control={control}
        rules={{
          required: 'Features is required'
        }}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              label="Features"
              inputStyle={{
                ...styles.borderInput
              }}
              placeholder={`Features(ex: stargate, ibc-transfer, no-legacy-stdTx, ibc-go)`}
              labelStyle={{
                fontWeight: '700'
              }}
              onSubmitEditing={() => {
                submit();
              }}
              error={errors.features?.message}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              ref={ref}
            />
          );
        }}
        name="features"
        defaultValue=""
      />
      <Text
        style={{
          ...typography.h3,
          fontWeight: '900',
          color: colors['gray-900'],
          paddingBottom: 20
        }}
      >
        {`Fee config`}
      </Text>
      <Controller
        control={control}
        rules={{
          required: 'Fee(Low) is required'
        }}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              label="Fee (Low)"
              keyboardType="numeric"
              inputStyle={{
                ...styles.borderInput
              }}
              placeholder={'Fee (Low)'}
              labelStyle={{
                fontWeight: '700'
              }}
              onSubmitEditing={() => {
                submit();
              }}
              error={errors.feeLow?.message}
              onBlur={onBlur}
              onChangeText={txt => onChange(txt.replace(/,/g, '.'))}
              value={value.toString()}
              ref={ref}
            />
          );
        }}
        name="feeLow"
        defaultValue={0}
      />
      <Controller
        control={control}
        rules={{
          required: 'Fee(Average) is required'
        }}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              label="Fee (Average)"
              keyboardType="numeric"
              inputStyle={{
                ...styles.borderInput
              }}
              placeholder={'Fee (Average)'}
              labelStyle={{
                fontWeight: '700'
              }}
              onSubmitEditing={() => {
                submit();
              }}
              error={errors.feeMedium?.message}
              onBlur={onBlur}
              onChangeText={txt => onChange(txt.replace(/,/g, '.'))}
              value={value.toString()}
              ref={ref}
            />
          );
        }}
        name="feeMedium"
        defaultValue={0}
      />
      <Controller
        control={control}
        rules={{
          required: 'Fee(High) is required'
        }}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              label="Fee (High)"
              keyboardType="numeric"
              inputStyle={{
                ...styles.borderInput
              }}
              placeholder={'Fee (High)'}
              labelStyle={{
                fontWeight: '700'
              }}
              onSubmitEditing={() => {
                submit();
              }}
              error={errors.feeHigh?.message}
              onBlur={onBlur}
              onChangeText={txt => onChange(txt.replace(/,/g, '.'))}
              value={value.toString()}
              ref={ref}
            />
          );
        }}
        name="feeHigh"
        defaultValue={0}
      />
      <Text
        style={{
          ...typography.h3,
          fontWeight: '900',
          color: colors['gray-900'],
          paddingBottom: 20
        }}
      >
        {`Token Info`}
      </Text>
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

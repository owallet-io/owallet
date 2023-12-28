import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { PageWithScrollView } from '../../components/page';
import { colors, typography } from '../../themes';
import { OWalletLogo } from '../register/owallet-logo';
import { Text } from '@src/components/text';
import { Controller, useForm } from 'react-hook-form';
import { TextInput } from '../../components/input';
import { LoadingSpinner } from '../../components/spinner';
import { useSimpleTimer } from '../../hooks';
import { useSmartNavigation } from '../../navigation.provider';
import { useStore } from '../../stores';
import { Bech32Address } from '@owallet/cosmos';
import RadioGroup from 'react-native-radio-buttons-group';
import CheckBox from 'react-native-check-box';
import { useTheme } from '@src/themes/theme-provider';

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
  features: Array<string>;
  symbol: string;
  feeLow: number;
  feeMedium: number;
  feeHigh: number;
}

export const SelectNetworkType = ({ onChange }) => {
  const { colors } = useTheme();
  const radioButtons = [
    {
      id: 'cosmos',
      label: 'Cosmos',
      value: 'cosmos',
      borderColor: colors['primary-text'],
      labelStyle: {
        color: colors['primary-text']
      }
    },
    {
      id: 'evm',
      label: 'EVM',
      value: 'evm',
      borderColor: colors['primary-text'],
      labelStyle: {
        color: colors['primary-text']
      }
    }
  ];

  const [selectedId, setSelectedId] = useState('cosmos');
  function onPressRadioButton(idRadio) {
    setSelectedId(idRadio);
    const selected = radioButtons.find(rb => rb.id == idRadio);
    onChange && onChange(selected);
  }

  return <RadioGroup layout={'row'} radioButtons={radioButtons} onPress={onPressRadioButton} selectedId={selectedId} />;
};

const features = ['stargate', 'ibc-transfer', 'cosmwasm', 'secretwasm', 'ibc-go', 'isEvm', 'no-legacy-stdTx'];

export const SelectFeatures = ({ onChange, networkType }) => {
  const [selected, setSelected] = useState([]);
  const { colors } = useTheme();
  useEffect(() => {
    if (networkType === 'evm') {
      setSelected(['ibc-go', 'stargate', 'isEvm']);
    } else {
      setSelected(['stargate', 'ibc-go', 'ibc-transfer', 'cosmwasm', 'no-legacy-stdTx']);
    }
  }, [networkType]);

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        maxHeight: 150
      }}
    >
      {features.map(f => {
        return (
          <View key={f} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <CheckBox
              disabled={
                (networkType === 'cosmos' && (f === 'isEvm' || f === 'secretwasm')) ||
                (networkType === 'evm' && f === 'cosmwasm')
              }
              style={{ flex: 1, padding: 14 }}
              checkBoxColor={colors['primary-text']}
              checkedCheckBoxColor={colors['primary-text']}
              onClick={() => {
                const tempArr = [...selected];
                if (selected.includes(f)) {
                  const index = selected.indexOf(f);
                  if (index > -1) {
                    tempArr.splice(index, 1);
                    setSelected(tempArr);
                  }
                } else {
                  tempArr.push(f);
                  setSelected(tempArr);
                }
                onChange(tempArr);
              }}
              isChecked={selected.includes(f)}
            />
            <Text style={{ paddingLeft: 16 }}>{f}</Text>
          </View>
        );
      })}
    </View>
  );
};

export const SelectNetworkScreen = () => {
  const {
    control,
    handleSubmit,
    setFocus,
    getValues,
    setValue,
    formState: { errors }
  } = useForm<FormData>();
  const { isTimedOut, setTimer } = useSimpleTimer();
  const { chainStore } = useStore();
  const smartNavigation = useSmartNavigation();
  const [networkType, setNetworkType] = useState('cosmos');

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
      coingecko = '',
      coinMinimal,
      networkType,
      features,
      feeLow,
      feeMedium,
      feeHigh
    } = getValues();

    setTimer(2000);
    const block = url_block;
    let chainInfo;

    try {
      chainInfo = {
        rpc: url_rpc.endsWith('/') ? `${url_rpc.slice(0, -1)}` : `${url_rpc}`,
        rest: url_rest.endsWith('/') ? `${url_rest.slice(0, -1)}` : `${url_rest}`,
        chainId: chainId.split(' ').join('-').toLocaleLowerCase() ?? `${name.split(' ').join('-')}`,
        chainName: `${name}`,
        networkType: networkType?.toLocaleLowerCase() ?? 'cosmos',
        stakeCurrency: {
          coinDenom: `${code.split(' ').join('').toLocaleUpperCase()}`,
          coinMinimalDenom: `${coinMinimal.split(' ').join('').toLocaleLowerCase()}`,
          coinDecimals: 6,
          coinGeckoId: `${
            coingecko?.split(' ').join('-').toLocaleLowerCase() ?? code.split(' ').join('-').toLocaleLowerCase()
          }`,
          coinImageUrl: symbol !== '' ? symbol : 'https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png'
        },
        bip44: {
          coinType: 118
        },
        bech32Config: Bech32Address.defaultBech32Config(
          `${bech32Config.split(' ').join('').toLocaleLowerCase() ?? code.split(' ').join('').toLocaleLowerCase()}`
        ),
        get currencies() {
          return [this.stakeCurrency];
        },
        get feeCurrencies() {
          return [this.stakeCurrency];
        },
        gasPriceStep: {
          low: feeLow ?? 0,
          average: feeMedium ?? 0,
          high: feeHigh ?? 0
        },
        features: features?.length > 0 ? features : ['stargate'],
        chainSymbolImageUrl: symbol !== '' ? symbol : 'https://orai.io/images/logos/logomark-dark.png',
        txExplorer: {
          name: 'Scan',
          txUrl: `${block}/txs/{txHash}`,
          accountUrl: `${block}/account/{address}`
        }
        // beta: true // use v1beta1
      };

      await chainStore.addChain(chainInfo);
      smartNavigation.goBack();
    } catch (err) {
      console.log('err: ', err);
      // alert('Oops! Something went wrong!');
      // alert(err.message);
    }
  });

  const handleChangeNetwork = selected => {
    setValue('networkType', selected.value);

    setNetworkType(selected.value);
  };

  const handleSelectFeatures = features => {
    setValue('features', features);
  };

  return (
    <PageWithScrollView
      contentContainerStyle={{
        paddingLeft: 20,
        paddingRight: 20
      }}
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
            fontWeight: '700'
          }}
        >
          New RPC network
        </Text>
        <View>
          <OWalletLogo size={72} />
        </View>
      </View>
      <Text style={{ paddingTop: 10 }}>
        Use a custom network that supports RPC via URL instead of some of the networks provided
      </Text>
      <View style={{ height: 20 }} />
      <Text
        style={{
          ...typography.h3,
          fontWeight: '900',
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
              placeholder={'e.g: Oraichain'}
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
              placeholder={'e.g: https://rpc.orai.io'}
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
              placeholder={'e.g: https://lcd.orai.io'}
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
        render={({ field: {} }) => {
          return (
            <View style={{ paddingBottom: 20 }}>
              <Text
                style={{
                  ...typography.h6,
                  fontWeight: '600',
                  paddingBottom: 8
                }}
              >
                {`Network Type`}
              </Text>
              <SelectNetworkType onChange={handleChangeNetwork} />
            </View>
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
              placeholder={'e.g: orai'}
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
      <View style={{ paddingBottom: 20 }}>
        <Text
          style={{
            ...typography.h6,
            fontWeight: '600',
            paddingBottom: 8
          }}
        >
          {`Features`}
        </Text>
        <SelectFeatures onChange={handleSelectFeatures} networkType={networkType} />
      </View>
      <Text
        style={{
          ...typography.h3,
          fontWeight: '900',
          paddingBottom: 20
        }}
      >
        {`Fee config`}
      </Text>
      <Controller
        control={control}
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
          paddingBottom: 20
        }}
      >
        {`Token Info`}
      </Text>
      <Controller
        control={control}
        rules={{
          required: 'Coin Denom is required',
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
        // rules={{
        //   required: 'Coingecko ID is required',

        //   validate: (value: string) => {
        //     const values = value.toLowerCase();
        //     if (!values) {
        //       return 'Coingecko ID is required';
        //     }
        //   }
        // }}
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
          backgroundColor: colors['primary-surface-default'],
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
            color: colors['primary-surface-default'],
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
    borderWidth: 1,
    paddingLeft: 11,
    paddingRight: 11,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 8
  }
});

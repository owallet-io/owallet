import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { PageWithScrollView } from '../../components/page';
import { colors, typography } from '../../themes';
import { OWalletLogo } from '../register/owallet-logo';
import { Text } from '@src/components/text';
import { Controller, useForm } from 'react-hook-form';
import { TextInput } from '../../components/input';
import { LoadingSpinner } from '../../components/spinner';
import { useSmartNavigation } from '../../navigation.provider';
import { observer } from 'mobx-react-lite';
import { TRON_ID, isBase58, showToast } from '@src/utils/helper';
import { API } from '@src/common/api';
import { Address } from '@owallet/crypto';

interface FormData {
  contractAddress: string;
  decimals: string;
  denom: string;
  name: string;
  coinGeckoId: string;
}

export const AddTokenTronScreen = observer(() => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>();
  const smartNavigation = useSmartNavigation();

  const [loading, setLoading] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<any>();

  const form = useForm<FormData>({
    defaultValues: {
      contractAddress: ''
    }
  });

  // const contractAddress = watch('contractAddress');

  // const getContractDetail = async (contractAddress: string) => {
  //   try {
  //     const res = await API.getContractTron(
  //       chainStore.current.rpc,
  //       chainStore.current.chainId === TRON_ID && isBase58(contractAddress)
  //         ? Address.getHexStringFromBase58(contractAddress)
  //         : contractAddress
  //     );
  //   } catch (error) {
  //     console.log('error ===', error);
  //   }
  // };

  // useEffect(() => {
  //   getContractDetail(contractAddress);
  // }, [contractAddress]);

  const addTokenSuccess = () => {
    setLoading(false);
    smartNavigation.navigateSmart('Home', {});
    showToast({
      text1: 'Success',
      text2: 'Token added',
      onPress: () => {}
    });
  };

  const submit = handleSubmit(async (data: any) => {
    try {
      if (tokenInfo?.decimals != null && tokenInfo.name && tokenInfo.symbol) {
        setLoading(true);

        addTokenSuccess();
      }
    } catch (err) {
      setLoading(false);
      smartNavigation.navigateSmart('Home', {});
      showToast({
        text1: 'Error',
        text2: JSON.stringify(err.message),
        type: 'error',
        onPress: () => {}
      });
    }
  });

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
          Add Token (Tron)
        </Text>
        <View>
          <OWalletLogo size={72} />
        </View>
      </View>

      <View style={{ height: 20 }} />
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
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              label="Contract Address"
              labelStyle={{
                fontWeight: '700'
              }}
              placeholder={'Contract Address'}
              inputStyle={{
                ...styles.borderInput
              }}
              error={errors.contractAddress?.message}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              ref={ref}
            />
          );
        }}
        name="contractAddress"
        defaultValue=""
      />

      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              label="Name"
              labelStyle={{
                fontWeight: '700'
              }}
              inputStyle={{
                ...styles.borderInput
              }}
              onChangeText={onChange}
              value={value}
              ref={ref}
              error={errors.name?.message}
              defaultValue={''}
            />
          );
        }}
        name="name"
        defaultValue=""
      />

      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              label="denom"
              labelStyle={{
                fontWeight: '700'
              }}
              inputStyle={{
                ...styles.borderInput
              }}
              error={errors.denom?.message}
              onChangeText={onChange}
              value={value}
              ref={ref}
              defaultValue={''}
            />
          );
        }}
        name="denom"
        defaultValue=""
      />

      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              label="Decimals"
              labelStyle={{
                fontWeight: '700'
              }}
              inputStyle={{
                ...styles.borderInput
              }}
              error={errors.decimals?.message}
              onChangeText={onChange}
              value={value}
              ref={ref}
              defaultValue={''}
            />
          );
        }}
        name="decimals"
        defaultValue=""
      />

      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              label="CoinGecko Id"
              labelStyle={{
                fontWeight: '700'
              }}
              inputStyle={{
                ...styles.borderInput
              }}
              error={errors.coinGeckoId?.message}
              onChangeText={onChange}
              value={value}
              ref={ref}
              defaultValue={''}
            />
          );
        }}
        name="coinGeckoId"
        defaultValue=""
      />

      <TouchableOpacity
        disabled={loading}
        onPress={submit}
        style={{
          marginBottom: 24,
          marginTop: 20,
          backgroundColor: colors['purple-700'],
          borderRadius: 8
        }}
      >
        {loading ? (
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
            Submit
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          smartNavigation.goBack();
        }}
      >
        <Text
          style={{
            color: colors['purple-700'],
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
});

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

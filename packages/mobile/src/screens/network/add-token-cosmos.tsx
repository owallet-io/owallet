import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { PageWithScrollView } from '../../components/page';
import { colors, typography } from '../../themes';
import { OWalletLogo } from '../register/owallet-logo';
import { Text } from '@src/components/text';
import { Controller, useForm } from 'react-hook-form';
import { TextInput } from '../../components/input';
import { LoadingSpinner } from '../../components/spinner';
import { useSmartNavigation } from '../../navigation.provider';
import { useStore } from '../../stores';
import CheckBox from 'react-native-check-box';
import { CW20Currency, Secret20Currency } from '@owallet/types';
import { observer } from 'mobx-react-lite';
import { showToast } from '@src/utils/helper';

interface FormData {
  viewingKey: string;
  contractAddress: string;
}

export const AddTokenCosmosScreen = observer(() => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,

    formState: { errors }
  } = useForm<FormData>();
  const smartNavigation = useSmartNavigation();

  const { chainStore, queriesStore, accountStore, tokensStore } = useStore();
  const tokensOf = tokensStore.getTokensOf(chainStore.current.chainId);

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      contractAddress: '',
      viewingKey: ''
    }
  });

  const contractAddress = watch('contractAddress');

  useEffect(() => {
    if (tokensStore.waitingSuggestedToken) {
      chainStore.selectChain(tokensStore.waitingSuggestedToken.data.chainId);
      if (contractAddress !== tokensStore.waitingSuggestedToken.data.contractAddress) {
        setValue('contractAddress', tokensStore.waitingSuggestedToken.data.contractAddress);
      }
    }
  }, [chainStore, contractAddress, form, tokensStore.waitingSuggestedToken]);

  const isSecret20 = (chainStore.current.features ?? []).find(feature => feature === 'secretwasm') != null;

  const queries = queriesStore.get(chainStore.current.chainId);
  const query = isSecret20 ? queries.secret.querySecret20ContractInfo : queries.cosmwasm.querycw20ContractInfo;
  const queryContractInfo = query.getQueryContract(contractAddress);

  const tokenInfo = queryContractInfo.tokenInfo;

  const [isOpenSecret20ViewingKey, setIsOpenSecret20ViewingKey] = useState(false);

  const addTokenSuccess = () => {
    setLoading(false);
    smartNavigation.navigateSmart('Home', {});
    showToast({
      message: 'Token added'
    });
  };

  const createViewingKey = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      accountInfo.secret
        .createSecret20ViewingKey(contractAddress, '', {}, {}, (_, viewingKey) => {
          resolve(viewingKey);
        })
        .then(() => {})
        .catch(reject);
    });
  };

  const submit = handleSubmit(async data => {
    try {
      if (tokenInfo?.decimals != null && tokenInfo.name && tokenInfo.symbol) {
        setLoading(true);
        if (!isSecret20) {
          const currency: CW20Currency = {
            type: 'cw20',
            contractAddress: data.contractAddress,
            coinMinimalDenom: tokenInfo.name,
            coinDenom: tokenInfo.symbol,
            coinDecimals: tokenInfo.decimals
          };

          await tokensOf.addToken(currency);
          addTokenSuccess();
        } else {
          let viewingKey = data.viewingKey;
          if (!viewingKey && !isOpenSecret20ViewingKey) {
            try {
              viewingKey = await createViewingKey();
            } catch (e) {
              if (tokensStore.waitingSuggestedToken) {
                await tokensStore.rejectAllSuggestedTokens();
              }

              return;
            }
          }

          if (!viewingKey) {
            setLoading(false);
            smartNavigation.navigateSmart('Home', {});
            showToast({
              message: 'Failed to create the viewing key',
              type: 'danger'
            });
          } else {
            const currency: Secret20Currency = {
              type: 'secret20',
              contractAddress: data.contractAddress,
              viewingKey,
              coinMinimalDenom: tokenInfo.name,
              coinDenom: tokenInfo.symbol,
              coinDecimals: tokenInfo.decimals
            };

            await tokensOf.addToken(currency);
            addTokenSuccess();
          }
        }
      }
    } catch (err) {
      setLoading(false);
      smartNavigation.navigateSmart('Home', {});
      showToast({
        message: JSON.stringify(err.message),
        type: 'danger'
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
          Add Token (Cosmos)
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
              onSubmitEditing={() => {
                submit();
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

      <TextInput
        label="Name"
        labelStyle={{
          fontWeight: '700'
        }}
        inputStyle={{
          ...styles.borderInput
        }}
        onSubmitEditing={() => {
          submit();
        }}
        error={errors.contractAddress?.message}
        value={tokenInfo?.name ?? '-'}
        defaultValue={'-'}
        editable={false}
      />

      <TextInput
        label="Symbol"
        labelStyle={{
          fontWeight: '700'
        }}
        inputStyle={{
          ...styles.borderInput
        }}
        onSubmitEditing={() => {
          submit();
        }}
        error={errors.contractAddress?.message}
        value={tokenInfo?.symbol ?? '-'}
        defaultValue={'-'}
        editable={false}
      />

      <TextInput
        label="Decimals"
        labelStyle={{
          fontWeight: '700'
        }}
        inputStyle={{
          ...styles.borderInput
        }}
        onSubmitEditing={() => {
          submit();
        }}
        error={errors.contractAddress?.message}
        value={tokenInfo?.decimals.toString() ?? '-'}
        defaultValue={'-'}
        editable={false}
      />

      {isSecret20 ? (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <CheckBox
            style={{ flex: 1, padding: 14 }}
            checkBoxColor={colors['primary-text']}
            checkedCheckBoxColor={colors['primary-text']}
            onClick={() => {
              setIsOpenSecret20ViewingKey(value => !value);
            }}
            isChecked={isOpenSecret20ViewingKey}
          />
          <Text style={{ paddingLeft: 16 }}>{'Viewing key'}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        disabled={loading}
        onPress={submit}
        style={{
          marginBottom: 24,
          marginTop: 20,
          backgroundColor: colors['primary-surface-default'],
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

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
import { CW20Currency, Secret20Currency } from '@owallet/types';

interface FormData {
  viewingKey: string;
  contractAddress: string;
}

export const SelectNetworkType = ({ onChange }) => {
  const { colors } = useTheme();
  const [radioButtons, setRadioButtons] = useState([
    {
      id: 'cosmos',
      label: 'Cosmos',
      value: 'cosmos',
      selected: true,
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
  ]);

  function onPressRadioButton(radioButtonGroup) {
    setRadioButtons(radioButtonGroup);
    const selected = radioButtonGroup.find(rb => rb.selected);
    onChange && onChange(selected);
  }

  return (
    <RadioGroup
      layout={'row'}
      radioButtons={radioButtons}
      onPress={onPressRadioButton}
    />
  );
};

const features = [
  'stargate',
  'ibc-transfer',
  'cosmwasm',
  'secretwasm',
  'ibc-go',
  'isEvm',
  'no-legacy-stdTx'
];

export const SelectFeatures = ({ onChange, networkType }) => {
  const [selected, setSelected] = useState([]);
  const { colors } = useTheme();
  useEffect(() => {
    if (networkType === 'evm') {
      setSelected(['ibc-go', 'stargate', 'isEvm']);
    } else {
      setSelected([
        'stargate',
        'ibc-go',
        'ibc-transfer',
        'cosmwasm',
        'no-legacy-stdTx'
      ]);
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
                (networkType === 'cosmos' &&
                  (f === 'isEvm' || f === 'secretwasm')) ||
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

export const AddTokenScreen = () => {
  const {
    control,
    handleSubmit,
    setFocus,
    getValues,
    setValue,
    formState: { errors }
  } = useForm<FormData>();
  const smartNavigation = useSmartNavigation();

  const { chainStore, queriesStore, accountStore, tokensStore } = useStore();
  const tokensOf = tokensStore.getTokensOf(chainStore.current.chainId);

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const form = useForm<FormData>({
    defaultValues: {
      contractAddress: '',
      viewingKey: ''
    }
  });

  // const contractAddress = form.watch('contractAddress');
  const contractAddress = '';

  useEffect(() => {
    if (tokensStore.waitingSuggestedToken) {
      chainStore.selectChain(tokensStore.waitingSuggestedToken.data.chainId);
      if (
        contractAddress !==
        tokensStore.waitingSuggestedToken.data.contractAddress
      ) {
        form.setValue(
          'contractAddress',
          tokensStore.waitingSuggestedToken.data.contractAddress
        );
      }
    }
  }, [chainStore, contractAddress, form, tokensStore.waitingSuggestedToken]);

  const isSecret20 =
    (chainStore.current.features ?? []).find(
      feature => feature === 'secretwasm'
    ) != null;

  const queries = queriesStore.get(chainStore.current.chainId);
  const query = isSecret20
    ? queries.secret.querySecret20ContractInfo
    : queries.cosmwasm.querycw20ContractInfo;
  const queryContractInfo = query.getQueryContract(contractAddress);

  const tokenInfo = queryContractInfo.tokenInfo;
  const [isOpenSecret20ViewingKey, setIsOpenSecret20ViewingKey] =
    useState(false);

  const createViewingKey = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      accountInfo.secret
        .createSecret20ViewingKey(
          contractAddress,
          '',
          {},
          {},
          (_, viewingKey) => {
            resolve(viewingKey);
          }
        )
        .then(() => {})
        .catch(reject);
    });
  };

  const submit = handleSubmit(async data => {
    const { contractAddress } = getValues();

    try {
      if (tokenInfo?.decimals != null && tokenInfo.name && tokenInfo.symbol) {
        if (!isSecret20) {
          const currency: CW20Currency = {
            type: 'cw20',
            contractAddress: data.contractAddress,
            coinMinimalDenom: tokenInfo.name,
            coinDenom: tokenInfo.symbol,
            coinDecimals: tokenInfo.decimals
          };

          await tokensOf.addToken(currency);
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
          }
        }
      }
    } catch (err) {
      // alert('Oops! Something went wrong!');
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
          Add Token
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
        // value={'value'}
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
        // value={'value'}
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
        // value={'value'}
        defaultValue={'-'}
        editable={false}
      />

      <TouchableOpacity
        disabled={false}
        onPress={submit}
        style={{
          marginBottom: 24,
          marginTop: 20,
          backgroundColor: colors['purple-700'],
          borderRadius: 8
        }}
      >
        {false ? (
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
        disabled={false}
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

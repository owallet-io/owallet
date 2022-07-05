import React, { FunctionComponent, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { CText as Text } from '../../../components/text';
import { RectButton } from '../../../components/rect-button';
import { useStore } from '../../../stores';
import { colors, metrics, spacing, typography } from '../../../themes';
import { _keyExtract } from '../../../utils/helper';
import { BondStatus } from '@owallet/stores';
import { ValidatorThumbnail } from '../../../components/thumbnail';
import { ValidatorThumbnails } from '@owallet/common';
import { CoinPretty, Dec } from '@owallet/unit';

const Validators = ({
  onPressSelectValidator,
  styles,
  dstValidatorAddress
}) => {
  const { chainStore, queriesStore, accountStore, modalStore } = useStore();
  const queries = queriesStore.get(chainStore.current.chainId);
  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Bonded
  );
  // const account = accountStore.getAccount(chainStore.current.chainId);
  // const queryDelegations =
  //   queries.cosmos.queryDelegations.getQueryBech32Address(
  //     account.bech32Address
  //   );
  const dataAll = bondedValidators.validators;
  const data = [...dataAll];
  const renderItem = ({ item }) => {
    let validatorsAddress = item.operator_address || item?.validator_address;
    // const amount = queryDelegations.getDelegationTo(validatorsAddress);
    return (
      <RectButton
        style={{
          ...styles.containerAccount
        }}
        onPress={() =>
          onPressSelectValidator(
            validatorsAddress,
            ValidatorThumbnails[validatorsAddress] ??
              bondedValidators.getValidatorThumbnail(validatorsAddress),
            item.description?.moniker
          )
        }
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <ValidatorThumbnail
            style={{
              marginRight: spacing['8']
            }}
            size={38}
            url={
              ValidatorThumbnails[validatorsAddress] ??
              bondedValidators.getValidatorThumbnail(validatorsAddress)
            }
          />
          <View
            style={{
              marginLeft: spacing['12']
            }}
          >
            <Text
              style={{
                ...typography.h6,
                color: colors['gray-900'],
                fontWeight: '900'
              }}
              numberOfLines={1}
            >
              {item.description?.moniker}
            </Text>
            {item.tokens && (
              <Text
                style={{
                  ...typography.h7,
                  color: colors['gray-300'],
                  fontWeight: '900',
                  fontSize: 13
                }}
              >
                {/* Stake {amount.maxDecimals(4).trim(true).shrink(true).toString()} */}
                {new CoinPretty(
                  chainStore.current.stakeCurrency,
                  new Dec(item.tokens)
                )
                  .maxDecimals(0)
                  .hideDenom(true)
                  .toString() + ' staked'}
              </Text>
            )}
          </View>
        </View>

        <View>
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: spacing['32'],
              backgroundColor:
                colors[
                  `${
                    item.operator_address == dstValidatorAddress
                      ? 'purple-700'
                      : 'gray-100'
                  }`
                ],
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: spacing['32'],
                backgroundColor: colors['white']
              }}
            />
          </View>
        </View>
      </RectButton>
    );
  };
  return (
    <View
      style={{
        width: metrics.screenWidth - 36,
        height: metrics.screenHeight / 2
      }}
    >
      <FlatList
        data={[...data]}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={_keyExtract}
        ListFooterComponent={() => (
          <View
            style={{
              height: spacing['16']
            }}
          />
        )}
      />
    </View>
  );
};

export default Validators;

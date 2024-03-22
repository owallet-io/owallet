import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { View, ViewStyle } from "react-native";
import { useStore } from "../../stores";
import { AddressCopyable } from "../../components/address-copyable";
import { useSmartNavigation } from "../../navigation.provider";
import { navigate } from "../../router/root";
import { AddressQRCodeModal } from "./components";
import Big from "big.js";
import { Text } from "@src/components/text";
import { AccountBox } from "./account-box";
import { ChainIdEnum, TRON_ID } from "@owallet/common";

import { SCREENS } from "@src/common/constants";

export const AccountCardEVM: FunctionComponent<{
  containerStyle?: ViewStyle;
  refreshDate?: number;
}> = observer(({ refreshDate }) => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    priceStore,
    modalStore,
    keyRingStore,
  } = useStore();

  const smartNavigation = useSmartNavigation();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);
  const selected = keyRingStore?.multiKeyStoreInfo.find(
    (keyStore) => keyStore?.selected
  );
  const addressDisplay = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
  );
  const addressCore = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses,
    false
  );
  let total: any =
    queries.queryBalances.getQueryBech32Address(addressCore)?.stakable;

  const queryBalances =
    queries.queryBalances.getQueryBech32Address(addressCore);

  const balanceStakableQuery = queryBalances.stakable;

  const stakable = balanceStakableQuery?.balance;

  const tokens = queryBalances.positiveNativeUnstakables.concat(
    queryBalances.nonNativeBalances
  );
  const fiat = priceStore.defaultVsCurrency;
  const totalPrice = useMemo(() => {
    const fiatCurrency = priceStore.getFiatCurrency(
      priceStore.defaultVsCurrency
    );
    if (!fiatCurrency) {
      return undefined;
    }
    // if (!stakable.isReady) {
    //   return undefined;
    // }
    let res = priceStore.calculatePrice(stakable, fiat);
    for (const token of tokens) {
      const price = priceStore.calculatePrice(token.balance, fiat);
      if (price) {
        res = res.add(price);
      }
    }

    return res;
  }, [stakable, fiat]);
  const onPressBtnMain = (name) => {
    if (name === "Buy") {
      // navigate('MainTab', { screen: 'Browser', path: 'https://oraidex.io' });
      navigate(SCREENS.STACK.Others, {
        screen: SCREENS.BuyFiat,
      });
    }
    if (name === "Receive") {
      _onPressReceiveModal();
    }
    if (name === "Send") {
      if (chainStore.current.chainId === ChainIdEnum.TRON) {
        smartNavigation.navigateSmart("SendTron", {
          currency: chainStore.current.stakeCurrency.coinMinimalDenom,
        });
      } else if (chainStore.current.chainId === ChainIdEnum.Oasis) {
        smartNavigation.navigateSmart("SendOasis", {
          currency: chainStore.current.stakeCurrency.coinMinimalDenom,
        });
      } else {
        // smartNavigation.navigateSmart("Send", {
        //   currency: chainStore.current.stakeCurrency.coinMinimalDenom,
        // });
        navigate(SCREENS.STACK.Others, {
          screen: SCREENS.SendEvm,
          params: {
            currency: chainStore.current.stakeCurrency.coinMinimalDenom,
          },
        });
      }
    }
  };

  const _onPressReceiveModal = () => {
    modalStore.setOptions();
    modalStore.setChildren(
      AddressQRCodeModal({
        account,
        chainStore: chainStore.current,
        keyRingStore: keyRingStore,
        address: addressDisplay,
      })
    );
  };

  const renderAddress = () => {
    if (chainStore.current.chainId === TRON_ID) {
      return (
        <View>
          <View>
            <Text>Base58: </Text>
            <AddressCopyable address={addressDisplay} maxCharacters={22} />
          </View>
          <View>
            <Text>Evmos: </Text>
            <AddressCopyable address={addressCore} maxCharacters={22} />
          </View>
        </View>
      );
    }

    return <AddressCopyable address={addressDisplay} maxCharacters={22} />;
  };
  // const totalAmount = () => {
  //   if (chainStore.current.chainId !== ChainIdEnum.TRON && total) {
  //     return priceStore?.calculatePrice(total).toString();
  //   }
  //   if (chainStore.current.chainId === ChainIdEnum.TRON && total) {
  //     return (
  //       "$" +
  //       (
  //         parseFloat(
  //           new Big(parseInt(total.amount?.int))
  //             .div(new Big(10).pow(24))
  //             .toString()
  //         ) *
  //         priceStore?.getPrice(chainStore?.current?.stakeCurrency?.coinGeckoId)
  //       ).toFixed(6)
  //     );
  //   }

  //   return 0;
  // };

  // const totalBalance = () => {
  //   if (!total) return "0";
  //   if (chainStore.current.chainId !== TRON_ID && total) {
  //     return total?.trim(true).shrink(true).maxDecimals(6).toString();
  //   }
  //   if (chainStore.current.chainId === TRON_ID && total) {
  //     return (
  //       `${Number(
  //         new Big(parseInt(total?.amount?.int))
  //           .div(new Big(10).pow(24))
  //           .toFixed(6)
  //       )}` + ` ${chainStore.current?.stakeCurrency.coinDenom}`
  //     );
  //   }

  //   return null;
  // };

  return (
    <AccountBox
      totalBalance={
        <Text
          style={{
            textAlign: "center",
            color: "white",
            fontWeight: "900",
            fontSize: 34,
            lineHeight: 50,
          }}
        >
          {totalPrice
            ? totalPrice.toString()
            : stakable.shrink(true).trim(true).maxDecimals(6).toString()}
        </Text>
      }
      name={account.name || "..."}
      onPressBtnMain={onPressBtnMain}
      // totalAmount={`${totalBalance()}`}
      addressComponent={renderAddress()}
    />
  );
});

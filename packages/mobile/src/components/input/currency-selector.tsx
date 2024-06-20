import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { IAmountConfig } from "@owallet/hooks";
import { ChainIdEnum, DenomHelper } from "@owallet/common";
import { Bech32Address } from "@owallet/cosmos";
import { InteractionManager, TextStyle, ViewStyle } from "react-native";
import { Selector } from "./selector";
import { TokensSelector } from "./tokens-selector";
import { useStore } from "@src/stores";
import {
  ObservableQueryBalanceInner,
  ObservableQueryBalancesInner,
} from "@owallet/stores";

export const CurrencySelector: FunctionComponent<{
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  selectorContainerStyle?: ViewStyle;
  textStyle?: TextStyle;
  type?: "legacy" | "new";
  label: string;
  chainId?: string;
  placeHolder?: string;

  amountConfig: IAmountConfig;
}> = observer(
  ({
    labelStyle,
    containerStyle,
    selectorContainerStyle,
    textStyle,
    label,
    placeHolder,
    chainId,
    amountConfig,
    type = "legacy",
  }) => {
    const { queriesStore, accountStore, keyRingStore } = useStore();
    const [displayTokens, setDisplayTokens] = useState<
      ObservableQueryBalanceInner[]
    >([]);
    const accountInfo = accountStore.getAccount(chainId);
    const addressToFetch = accountInfo.getAddressDisplay(
      keyRingStore.keyRingLedgerAddresses,
      false
    );

    const items = amountConfig.sendableCurrencies.map((currency) => {
      let label = currency.coinDenom;

      // if is cw20 contract
      if ("originCurrency" in currency === false) {
        // show address if needed, maybe erc20 address so need check networkType later
        const denomHelper = new DenomHelper(currency.coinMinimalDenom);
        if (denomHelper.contractAddress) {
          label += ` (${Bech32Address.shortenAddress(
            denomHelper.contractAddress,
            24
          )})`;
        }
      }

      return {
        key: currency.coinMinimalDenom,
        label,
      };
    });
    useEffect(() => {
      InteractionManager.runAfterInteractions(() => {
        const queryBalances = queriesStore
          .get(chainId)
          .queryBalances.getQueryBech32Address(addressToFetch);
        const tokens = queryBalances.balances;
        const displayTokens = tokens
          .filter((v, i, obj) => {
            return (
              v?.balance &&
              obj.findIndex(
                (v2) =>
                  v2.balance.currency?.coinDenom ===
                  v.balance.currency?.coinDenom
              ) === i
            );
          })
          .sort((a, b) => {
            const aDecIsZero = a.balance?.toDec()?.isZero();
            const bDecIsZero = b.balance?.toDec()?.isZero();

            if (aDecIsZero && !bDecIsZero) {
              return 1;
            }
            if (!aDecIsZero && bDecIsZero) {
              return -1;
            }

            return a.currency.coinDenom < b.currency.coinDenom ? -1 : 1;
          });
        setDisplayTokens(displayTokens);
      });
    }, [chainId, addressToFetch]);

    const selectedKey = amountConfig.sendCurrency.coinMinimalDenom;
    const setSelectedKey = (key: string | undefined) => {
      const currency = amountConfig.sendableCurrencies.find(
        (cur) => cur.coinMinimalDenom === key
      );

      amountConfig.setSendCurrency(currency);
    };

    return type !== "legacy" ? (
      <TokensSelector
        chainId={chainId}
        labelStyle={labelStyle}
        containerStyle={containerStyle}
        selectorContainerStyle={selectorContainerStyle}
        textStyle={textStyle}
        label={label}
        placeHolder={placeHolder}
        maxItemsToShow={4}
        items={displayTokens}
        selectedKey={selectedKey}
        currencyActive={amountConfig.sendCurrency}
        setSelectedKey={setSelectedKey}
      />
    ) : (
      <Selector
        labelStyle={labelStyle}
        containerStyle={containerStyle}
        selectorContainerStyle={selectorContainerStyle}
        textStyle={textStyle}
        label={label}
        placeHolder={placeHolder}
        maxItemsToShow={4}
        items={items}
        selectedKey={selectedKey}
        setSelectedKey={setSelectedKey}
      />
    );
  }
);

import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { IAmountConfig } from "@owallet/hooks";
import { DenomHelper } from "@owallet/common";
import { Bech32Address } from "@owallet/cosmos";
import { TextStyle, ViewStyle } from "react-native";
import { Selector } from "./selector";
import { TokensSelector } from "./tokens-selector";

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

    const tokens = amountConfig.sendableCurrencies.map((currency) => {
      let label = currency.coinDenom;
      let contractAddress;
      // if is cw20 contract
      if ("originCurrency" in currency === false) {
        // show address if needed, maybe erc20 address so need check networkType later
        const denomHelper = new DenomHelper(currency.coinMinimalDenom);
        if (denomHelper.contractAddress) {
          label += `(${Bech32Address.shortenAddress(
            denomHelper.contractAddress,
            24
          )})`;
          contractAddress = denomHelper.contractAddress;
        }
      }

      return {
        key: currency.coinMinimalDenom,
        denom: currency.coinDenom,
        image: currency.coinImageUrl,
        contractAddress: contractAddress ?? "",
      };
    });

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
        items={tokens}
        selectedKey={selectedKey}
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

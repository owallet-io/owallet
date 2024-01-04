import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { IAmountConfig } from '@owallet/hooks';
import { DenomHelper } from '@owallet/common';
import { Bech32Address } from '@owallet/cosmos';
import { TextStyle, ViewStyle } from 'react-native';
import { Selector } from './selector';

export const CurrencySelector: FunctionComponent<{
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  selectorContainerStyle?: ViewStyle;
  textStyle?: TextStyle;

  label: string;
  placeHolder?: string;

  amountConfig: IAmountConfig;
}> = observer(({ labelStyle, containerStyle, selectorContainerStyle, textStyle, label, placeHolder, amountConfig }) => {
  const items = amountConfig.sendableCurrencies.map(currency => {
    let label = currency.coinDenom;

    // if is cw20 contract
    if ('originCurrency' in currency === false) {
      // show address if needed, maybe erc20 address so need check networkType later
      const denomHelper = new DenomHelper(currency.coinMinimalDenom);
      if (denomHelper.contractAddress) {
        label += ` (${Bech32Address.shortenAddress(denomHelper.contractAddress, 24)})`;
      }
    }

    return {
      key: currency.coinMinimalDenom,
      label
    };
  });

  const selectedKey = amountConfig.sendCurrency.coinMinimalDenom;
  const setSelectedKey = (key: string | undefined) => {
    console.log('key', setSelectedKey);

    const currency = amountConfig.sendableCurrencies.find(cur => cur.coinMinimalDenom === key);

    console.log('currency', currency);

    amountConfig.setSendCurrency(currency);
  };

  return (
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
});

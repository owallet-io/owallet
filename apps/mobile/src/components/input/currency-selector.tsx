import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { IAmountConfig } from "@owallet/hooks";
import { TextStyle, ViewStyle } from "react-native";
import { TokensSelector } from "./tokens-selector";
import { useStore } from "@src/stores";
import { Dec } from "@owallet/unit";
// import { ObservableQueryBalanceInner } from "@owallet/stores";

export const CurrencySelector: FunctionComponent<{
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  selectorContainerStyle?: ViewStyle;
  textStyle?: TextStyle;
  label: string;
  chainId: string;
  placeHolder?: string;
  setSelectedKey: (key: string | undefined) => void;
  selectedKey: string;
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
    setSelectedKey,
    selectedKey,
  }) => {
    const { hugeQueriesStore, appInitStore } = useStore();

    const tokens = appInitStore.getInitApp.isAllNetworks
      ? hugeQueriesStore.getAllBalances(true)
      : hugeQueriesStore.getAllBalancesByChainId(chainId);

    const _filteredTokens = useMemo(() => {
      const zeroDec = new Dec(0);
      return tokens.filter((token) => {
        return token.token.toDec().gt(zeroDec);
      });
    }, [tokens]);
    return (
      <TokensSelector
        chainId={chainId}
        labelStyle={labelStyle}
        containerStyle={containerStyle}
        selectorContainerStyle={selectorContainerStyle}
        textStyle={textStyle}
        label={label}
        placeHolder={placeHolder}
        maxItemsToShow={6}
        items={_filteredTokens}
        selectedKey={selectedKey}
        currencyActive={amountConfig.currency}
        setSelectedKey={setSelectedKey}
      />
    );
  }
);

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
  }) => {
    const {
      queriesStore,
      accountStore,
      keyRingStore,
      hugeQueriesStore,
      appInitStore,
    } = useStore();
    // const [displayTokens, setDisplayTokens] = useState<
    //   ObservableQueryBalanceInner[]
    // >([]);
    // const accountInfo = accountStore.getAccount(chainId);
    // const addressToFetch = accountInfo.getAddressDisplay(
    //   keyRingStore.keyRingLedgerAddresses,
    //   false
    // );
    //
    // const items = amountConfig.sendableCurrencies.map((currency) => {
    //   let label = currency.coinDenom;
    //
    //   // if is cw20 contract
    //   if ("originCurrency" in currency === false) {
    //     // show address if needed, maybe erc20 address so need check networkType later
    //     const denomHelper = new DenomHelper(currency.coinMinimalDenom);
    //     if (denomHelper.contractAddress) {
    //       label += ` (${Bech32Address.shortenAddress(
    //         denomHelper.contractAddress,
    //         24
    //       )})`;
    //     }
    //   }
    //
    //   return {
    //     key: currency.coinMinimalDenom,
    //     label,
    //   };
    // });
    //
    // function filterTokens(tokens) {
    //   return tokens.filter(isUniqueToken);
    // }
    //
    // function isUniqueToken(token, index, tokens) {
    //   return (
    //     token?.balance && tokens.findIndex(hasMatchingDenom(token)) === index
    //   );
    // }
    //
    // function hasMatchingDenom(token) {
    //   return (token2) =>
    //     token2.balance.currency?.coinDenom ===
    //     token.balance.currency?.coinDenom;
    // }
    //
    // function sortTokens(tokens) {
    //   return tokens.sort(compareTokens);
    // }
    //
    // function compareTokens(a, b) {
    //   const aDecIsZero = isDecZero(a.balance);
    //   const bDecIsZero = isDecZero(b.balance);
    //
    //   if (aDecIsZero && !bDecIsZero) {
    //     return 1;
    //   }
    //   if (!aDecIsZero && bDecIsZero) {
    //     return -1;
    //   }
    //
    //   return compareByDenom(a, b);
    // }
    //
    // function isDecZero(balance) {
    //   return balance?.toDec()?.isZero();
    // }
    //
    // function compareByDenom(a, b) {
    //   return a.currency.coinDenom < b.currency.coinDenom ? -1 : 1;
    // }
    //
    // useEffect(() => {
    //   const queryBalances = queriesStore
    //     .get(chainId)
    //     .queryBalances.getQueryBech32Address(addressToFetch);
    //   const tokens = queryBalances.balances;
    //   const displayTokens = sortTokens(filterTokens(tokens));
    //
    //   setDisplayTokens(displayTokens);
    // }, [chainId, addressToFetch]);
    //

    const tokens = hugeQueriesStore.getAllBalances(true);

    const _filteredTokens = useMemo(() => {
      const zeroDec = new Dec(0);
      return tokens.filter((token) => {
        return token.token.toDec().gt(zeroDec);
      });
    }, [tokens]);

    const selectedKey = amountConfig.currency.coinMinimalDenom;
    console.log(selectedKey, "selectedKey");
    const setSelectedKey = (key: string | undefined) => {
      // console.log(key,"key kaka");
      const token = tokens.find(
        (cur) => cur.token.currency.coinMinimalDenom === key
      );
      // console.log(token.token.currency,"token kaka2")
      amountConfig.setCurrency(token.token.currency);
    };
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

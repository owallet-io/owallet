import { StyleSheet, Text, View } from "react-native";
import React, { useMemo } from "react";
import { useTheme } from "@src/themes/theme-provider";
import { useStore } from "@src/stores";
import { ContainerModal, ItemModal } from "./type-modal";
import { TokenSymbol } from "@src/components/token-symbol";
import { spacing } from "@src/themes";
import { DenomHelper } from "@owallet/common";
import { Bech32Address } from "@owallet/cosmos";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { defaultAll } from "@src/common/constants";

const TokenModal = ({ onActionCoin, active }) => {
  const { chainStore, queriesStore, accountStore, priceStore } = useStore();
  const { colors } = useTheme();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const queryBalances = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(
      chainStore.current.networkType === "evm"
        ? account.evmosHexAddress
        : account.bech32Address
    );

  const tokens = queryBalances.balances.concat(
    queryBalances.nonNativeBalances,
    queryBalances.positiveNativeUnstakables
  );

  const unique = useMemo(() => {
    const uniqTokens = [];
    tokens.map((token) =>
      uniqTokens.filter(
        (ut) =>
          ut.balance.currency.coinDenom == token.balance.currency.coinDenom
      ).length > 0
        ? null
        : uniqTokens.push(token)
    );
    return [defaultAll, ...uniqTokens];
  }, [chainStore.current.chainId]);

  const renderItem = ({ item }) => {
    return (
      <ItemModal
        iconComponent={
          item?.label ? (
            <View
              style={{
                marginRight: 20,
                marginLeft: 10,
              }}
            >
              <OWIcon type="images" source={item?.image} size={30} />
            </View>
          ) : (
            <TokenSymbol
              style={{
                marginRight: 20,
                marginLeft: 10,
                backgroundColor: colors["bg-icon-token"],
              }}
              size={30}
              chainInfo={{
                stakeCurrency: chainStore.current.stakeCurrency,
              }}
              currency={item.balance?.currency}
            />
          )
        }
        onPress={onActionCoin}
        item={item}
        label={item?.label ? item?.label : getCoinDenom(item)}
        active={active}
        value={item?.value ? item?.value : getCoinDenom(item)}
      />
    );
  };
  return (
    <ContainerModal
      title="Transaction Coin"
      renderItem={renderItem}
      data={unique}
    />
  );
};

export const getCoinDenom = (item) => {
  if (!item?.label) {
    const balance = item?.balance;
    if (
      "originCurrency" in balance.currency &&
      balance.currency.originCurrency
    ) {
      return balance.currency.originCurrency.coinDenom;
    } else {
      return balance.currency.coinDenom;
    }
  }
};
export default TokenModal;

const styles = StyleSheet.create({});

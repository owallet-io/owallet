import { NftItem } from "@src/screens/nfts/components/nft-item";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useQuery } from "@apollo/client";
import { observer } from "mobx-react-lite";
import { OwnedTokens } from "@src/graphql/queries";
import { useStore } from "@src/stores";
import { ChainIdEnum } from "@owallet/common";
export const NftCard = observer(() => {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getAccount(ChainIdEnum.Stargaze);
  console.log(account.bech32Address, "account.bech32Address");
  const { loading, error, data } = useQuery(OwnedTokens, {
    variables: {
      filterForSale: null,
      owner: account.bech32Address,
      limit: 50,
      filterByCollectionAddrs: null,
      sortBy: "ACQUIRED_DESC",
    },
  });
  const nfts = data?.tokens?.tokens;
  console.log(data, "data graphql");
  return (
    <View style={styles.container}>
      {nfts &&
        nfts.map((item, index) => {
          return <NftItem key={index} item={item} />;
        })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
});

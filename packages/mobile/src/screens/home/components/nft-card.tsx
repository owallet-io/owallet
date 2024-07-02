import { NftItem } from "@src/screens/nfts/components/nft-item";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useQuery } from "@apollo/client";
import { observer } from "mobx-react-lite";
import { OwnedTokens } from "@src/graphql/queries";
export const NftCard = observer(() => {
  const { loading, error, data } = useQuery(OwnedTokens, {
    variables: {
      filterForSale: null,
      owner: "stars1hvr9d72r5um9lvt0rpkd4r75vrsqtw6ymak76g",
      limit: 50,
      filterByCollectionAddrs: null,
      sortBy: "ACQUIRED_DESC",
    },
  });
  const nfts = data?.tokens?.tokens;
  console.log(nfts, "data graphql");
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

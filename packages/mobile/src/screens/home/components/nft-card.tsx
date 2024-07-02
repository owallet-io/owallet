import { NftItem } from "@src/screens/nfts/components/nft-item";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useQuery } from "@apollo/client";
import { observer } from "mobx-react-lite";
import { OwnedTokens } from "@src/graphql/queries";
import { useStore } from "@src/stores";
import { ChainIdEnum, unknownToken } from "@owallet/common";
import OWText from "@components/text/ow-text";
import { useTheme } from "@src/themes/theme-provider";
import { CoinPretty, PricePretty } from "@owallet/unit";
import { OWEmpty } from "@src/components/empty";
export const NftCard = observer(() => {
  const { chainStore, accountStore, priceStore, keyRingStore } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const address = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses,
    true
  );
  const { loading, error, data } = useQuery(OwnedTokens, {
    variables: {
      filterForSale: null,
      owner: address,
      limit: 50,
      filterByCollectionAddrs: null,
      sortBy: "ACQUIRED_DESC",
    },
  });
  const nfts = data?.tokens?.tokens || [];
  const nftsFilter = nfts.filter(
    (item, index) => item?.media?.type === "image"
  );
  const { colors } = useTheme();
  const fiatCurrency = priceStore.getFiatCurrency(priceStore.defaultVsCurrency);
  const tokenInfo =
    chainStore.getChain(ChainIdEnum.Stargaze).stakeCurrency || unknownToken;
  console.log(data, "data graphql");
  let totalPrice = new PricePretty(fiatCurrency, "0");
  for (const nft of nftsFilter) {
    const balance = new CoinPretty(
      tokenInfo,
      nft?.collection?.floorPrice || "0"
    );
    totalPrice = totalPrice.add(priceStore.calculatePrice(balance));
  }

  const styles = styling(colors);
  return (
    <View style={styles.container}>
      {nftsFilter?.length > 0 ? (
        <>
          <View style={styles.sectionHeader}>
            <OWText style={styles.txtTitle}>Total value</OWText>
            <OWText style={styles.price}>{totalPrice?.toString()}</OWText>
          </View>
          <View style={styles.containerList}>
            {nftsFilter.map((item, index) => {
              return <NftItem key={index} item={item} />;
            })}
          </View>
        </>
      ) : (
        <OWEmpty type="nft" label="NO NFTs YET" />
      )}
    </View>
  );
});

const styling = (colors) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 16,
    },
    txtTitle: {
      fontSize: 15,
      fontWeight: "400",
      lineHeight: 20,
      color: colors["neutral-text-body"],
    },
    price: {
      fontWeight: "500",
      fontSize: 28,
      color: colors["neutral-text-heading"],
      lineHeight: 34,
    },
    sectionHeader: {
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    containerList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
      justifyContent: "space-between",
    },
  });

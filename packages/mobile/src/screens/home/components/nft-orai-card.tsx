import { NftItem } from "@src/screens/nfts/components/nft-item";
import React from "react";
import { StyleSheet, View } from "react-native";

import { observer } from "mobx-react-lite";
import { OwnedTokens } from "@src/graphql/queries";
import { useStore } from "@src/stores";
import { ChainIdEnum, unknownToken } from "@owallet/common";
import OWText from "@components/text/ow-text";
import { useTheme } from "@src/themes/theme-provider";
import { CoinPretty, PricePretty } from "@owallet/unit";
import { OWEmpty } from "@src/components/empty";
import { useQuery } from "@tanstack/react-query";
import { API } from "@src/common/api";
import { urlAiRight } from "@src/common/constants";
import { IItemNft } from "./nft-card";
export const NftOraiCard = observer(() => {
  const { chainStore, accountStore, priceStore, keyRingStore, appInitStore } =
    useStore();
  const account = accountStore.getAccount(
    appInitStore.getInitApp.isAllNetworks
      ? ChainIdEnum.Stargaze
      : chainStore.current.chainId
  );
  const address = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses,
    true
  );
  const { data, refetch } = useQuery({
    queryKey: ["nft-orai", address, chainStore.current.chainId],
    queryFn: () => {
      return API.getNftsOraichain(
        {
          address,
        },
        { baseURL: "https://developers.airight.io" }
      );
    },
    ...{
      initialData: null,
    },
  });

  console.log(data, "data");
  const nfts = data?.data?.items || [];

  const { colors } = useTheme();
  const fiatCurrency = priceStore.getFiatCurrency(priceStore.defaultVsCurrency);

  // const tokenInfo = chainStore.current.stakeCurrency || unknownToken;
  let totalPrice = new PricePretty(fiatCurrency, "0");
  for (const nft of nfts) {
    const tokenInfo = nft?.offer
      ? chainStore.current.currencies.find(
          (item, index) =>
            item?.coinDenom?.toUpperCase() === nft?.offer?.denom?.toUpperCase()
        )
      : unknownToken;
    const balance = new CoinPretty(tokenInfo, nft?.offer?.amount || "0");
    totalPrice = totalPrice.add(priceStore.calculatePrice(balance));
  }

  const styles = styling(colors);
  return (
    <View style={styles.container}>
      {nfts?.length > 0 ? (
        <>
          <View style={styles.sectionHeader}>
            <OWText style={styles.txtTitle}>Total value</OWText>
            <OWText style={styles.price}>{totalPrice?.toString()}</OWText>
          </View>
          <View style={styles.containerList}>
            {nfts.map((it, index) => {
              const tokenFound =
                it?.offer &&
                chainStore.current.currencies.find(
                  (item, index) =>
                    item?.coinDenom?.toUpperCase() ===
                    it?.offer?.denom?.toUpperCase()
                );
              const item: IItemNft = {
                floorPrice: it?.offer?.amount ? it?.offer?.amount : "0",
                tokenId: it?.id,
                url: it?.url,
                name: `${it?.name || ""} #${it?.id}`,
                tokenInfo: tokenFound || unknownToken,
              };
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

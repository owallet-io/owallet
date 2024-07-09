import { NftItem } from "@src/screens/nfts/components/nft-item";
import React from "react";
import { StyleSheet, View } from "react-native";

import { observer } from "mobx-react-lite";

import { useStore } from "@src/stores";

import OWText from "@components/text/ow-text";
import { useTheme } from "@src/themes/theme-provider";

import { OWEmpty } from "@src/components/empty";
import { useNfts } from "@screens/nfts/hooks/useNfts";
export const NftCard = observer(() => {
  const { chainStore, accountStore, keyRingStore, appInitStore } = useStore();
  const { colors } = useTheme();
  const styles = styling(colors);
  const account = accountStore.getAccount(chainStore.current.chainId);
  const address = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses,
    true
  );
  const nfts = useNfts(
    chainStore.current,
    address,
    appInitStore.getInitApp.isAllNetworks
  );

  return (
    <View style={styles.container}>
      {nfts?.length > 0 ? (
        <>
          {/* <View style={styles.sectionHeader}>
            <OWText style={styles.txtTitle}>Total value</OWText>
            <OWText style={styles.price}>{totalPrice?.toString()}</OWText>
          </View> */}
          <View style={styles.containerList}>
            {nfts.map((it, index) => {
              return <NftItem key={index} item={it} />;
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

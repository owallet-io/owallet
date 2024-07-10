import { NftItem } from "@src/screens/nfts/components/nft-item";
import React from "react";
import { StyleSheet, View } from "react-native";

import { observer } from "mobx-react-lite";

import { useStore } from "@src/stores";

import OWText from "@components/text/ow-text";
import { useTheme } from "@src/themes/theme-provider";

import { OWEmpty } from "@src/components/empty";
import { useNfts } from "@screens/nfts/hooks/useNfts";
import { OWButton } from "@src/components/button";
export const NftCard = observer(() => {
  const { chainStore, accountStore, keyRingStore, appInitStore } = useStore();
  const { colors } = useTheme();
  const styles = styling(colors);
  const nfts = useNfts(
    chainStore,
    accountStore,
    appInitStore.getInitApp.isAllNetworks
  );
  const emptyDataCount =
    nfts && nfts.filter((item) => item.data.length === 0).length;
  return (
    <View style={styles.container}>
      {emptyDataCount === nfts.length && (
        <OWEmpty type="nft" label="NO NFTs YET" />
      )}
      {nfts.map((it, index) => {
        if (it?.data?.length > 0) {
          return (
            <>
              <View style={styles.sectionHeader}>
                <OWText style={styles.txtTitle}>
                  {it?.chainInfo.chainName}
                </OWText>
                {/* <OWText style={styles.price}>{"ok"}</OWText> */}
              </View>
              <View style={styles.containerList}>
                {it?.data?.map((nft, indexNft) => (
                  <NftItem key={indexNft} item={nft} />
                ))}
              </View>
              {it?.data?.length > 3 && (
                <OWButton
                  style={{
                    marginTop: 16,
                  }}
                  label={"View all"}
                  size="medium"
                  type="secondary"
                  onPress={() => {
                    // setMore(!more);
                    // navigate(SCREENS.STACK.Others, {
                    //   screen: SCREENS.Transactions,
                    // });
                    return;
                  }}
                />
              )}
            </>
          );
        }
      })}
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

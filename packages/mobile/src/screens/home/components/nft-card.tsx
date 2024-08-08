import { NftItem } from "@src/screens/nfts/components/nft-item";
import React from "react";
import { Image, StyleSheet, View } from "react-native";

import { observer } from "mobx-react-lite";

import { useStore } from "@src/stores";

import OWText from "@components/text/ow-text";
import { useTheme } from "@src/themes/theme-provider";

import { OWEmpty } from "@src/components/empty";
import { useNfts } from "@screens/nfts/hooks/useNfts";
import { OWButton } from "@src/components/button";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { unknownToken } from "@owallet/common";
import { maskedNumber } from "@src/utils/helper";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";
import { useNavigation } from "@react-navigation/native";
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
      {emptyDataCount === nfts?.length && (
        <OWEmpty type="nft" label="NO NFTs YET" />
      )}

      {nfts.map((it, index) => {
        const coinDenom = it?.chainInfo?.stakeCurrency?.coinDenom;
        if (it?.data?.length > 0) {
          return (
            <View
              style={{
                paddingBottom: 16,
              }}
            >
              <View style={styles.sectionHeader}>
                <View style={styles.leftHeader}>
                  <OWIcon
                    type="images"
                    resizeMode="cover"
                    size={22}
                    style={{
                      borderRadius: 999,
                      tintColor:
                        coinDenom === "ORAI" || coinDenom === "AIRI"
                          ? colors["neutral-text-title"]
                          : null,
                    }}
                    source={{
                      uri:
                        it?.chainInfo?.stakeCurrency?.coinImageUrl ||
                        unknownToken.coinImageUrl,
                    }}
                  />
                  <View>
                    <OWText style={styles.txtTitle}>
                      {`${it?.chainInfo?.chainName}`}
                    </OWText>
                    <OWText size={10}>{it?.title}</OWText>
                  </View>
                </View>

                <OWText style={styles.price}>
                  {`${maskedNumber(it?.count)} NFT${
                    Number(it?.count) > 0 ? "s" : ""
                  }`}{" "}
                </OWText>
              </View>
              <View style={styles.containerList}>
                {it?.data?.map((nft, indexNft) => (
                  <NftItem key={indexNft} item={nft} />
                ))}
              </View>
              {Number(it?.count) > 4 && (
                <OWButton
                  style={{
                    marginTop: 16,
                  }}
                  label={"View all"}
                  size="medium"
                  type="secondary"
                  onPress={() => {
                    navigate(SCREENS.Nfts, {
                      chainInfo: it?.chainInfo,
                      ecosystem: it?.ecosystem,
                      contractAddress: it?.contractAddress,
                    });

                    return;
                  }}
                />
              )}
            </View>
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
    leftHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors["neutral-surface-action3"],
      height: 44,
      paddingHorizontal: 12,
      borderRadius: 999,
    },
    txtTitle: {
      fontSize: 14,
      fontWeight: "600",
      lineHeight: 20,
      color: colors["neutral-text-title"],
    },
    price: {
      fontWeight: "500",
      fontSize: 16,
      color: colors["neutral-text-heading"],
      borderWidth: 0.5,
      borderColor: colors["neutral-border-default"],
      paddingHorizontal: 8,
      paddingVertical: 4,
      // lineHeight: 20
    },
    sectionHeader: {
      paddingVertical: 8,
      paddingHorizontal: 4,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    containerList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
      justifyContent: "space-between",
    },
  });

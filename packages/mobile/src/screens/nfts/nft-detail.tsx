import React, { FC, FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { ScrollView, StyleSheet, View } from "react-native";

import {
  _keyExtract,
  formatContractAddress,
  maskedNumber,
  openLink,
} from "../../utils/helper";
import { PageWithView } from "../../components/page";
import { useTheme } from "@src/themes/theme-provider";

import { metrics } from "@src/themes";
import OWIcon from "@src/components/ow-icon/ow-icon";
import OWText from "@src/components/text/ow-text";

import { ChainIdEnum, unknownToken } from "@owallet/common";

import { useStore } from "@src/stores";
import ProgressiveFastImage from "@freakycoder/react-native-progressive-fast-image";
import images from "@src/assets/images";
import LottieView from "lottie-react-native";
import ItemReceivedToken from "../transactions/components/item-received-token";
import OWButtonIcon from "@src/components/button/ow-button-icon";

import { PageHeader } from "@src/components/header/header-new";
import { useNft } from "./hooks/useNft";
import { CoinPretty } from "@owallet/unit";
export const NftDetailScreen: FunctionComponent = observer((props) => {
  const { chainStore, priceStore, appInitStore } = useStore();
  const { item } = props.route?.params;
  const nft = useNft(
    chainStore.getChain(item?.network),
    item?.tokenId,
    item?.contractAddress
  );
  const onBrowser = async () => {
    if (!nft?.explorer) return;
    await openLink(nft.explorer);
  };
  const { colors } = useTheme();
  const styles = styling();

  const balance = new CoinPretty(
    nft?.tokenInfo || unknownToken,
    nft?.floorPrice || "0"
  );
  const chainInfo = chainStore.getChain(nft?.network || ChainIdEnum.Oraichain);
  return (
    <PageWithView>
      <PageHeader title="NFT" subtitle={chainInfo?.chainName || "Oraichain"} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <ProgressiveFastImage
            style={styles.image}
            source={{ uri: item?.url || nft?.url }}
            onLoad={() => console.log("loaded")}
            onError={() => console.log("error")}
            thumbnailSource={images.thumnail_nft}
            thumbnailImageStyle={styles.image}
            loadingImageComponent={
              <View style={styles.imgWrap}>
                <LottieView
                  source={require("@src/assets/animations/loading_owallet.json")}
                  style={{ width: 200, height: 200 }}
                  autoPlay
                  loop
                  speed={0.5}
                />
              </View>
            }
            loadingSource={require("@assets/animations/loading.gif")}
          />
          <View style={styles.containerBox}>
            <View style={styles.topHeader}>
              <View style={styles.headerLeft}>
                <OWIcon
                  type="images"
                  source={{
                    uri: nft?.creatorImage,
                  }}
                  resizeMode="cover"
                  size={24}
                  style={{
                    borderRadius: 999,
                  }}
                />
                <OWText style={styles.txtTitleTop}>{nft?.name}</OWText>
              </View>
              <View style={styles.headerRight}>
                <OWText
                  style={{
                    backgroundColor: colors["neutral-surface-bg2"],
                    paddingHorizontal: 4,
                    paddingVertical: 2,
                    borderRadius: 2,
                  }}
                  color={colors["neutral-text-title"]}
                  size={16}
                  weight="600"
                >
                  #{nft?.tokenId}
                </OWText>
              </View>
            </View>
            <OWText style={styles.txtFloorPrice}>Floor price</OWText>
            <OWText style={styles.txtAmount}>
              {balance.denom !== unknownToken.coinDenom
                ? `${maskedNumber(
                    balance?.trim(true)?.hideDenom(true)?.toString()
                  )} ${balance?.denom}`
                : "Not for sale"}
            </OWText>
            <OWText style={styles.txtPrice}>
              {priceStore.calculatePrice(balance)?.toString()}
            </OWText>
          </View>
          <View style={styles.containerBox}>
            {nft?.version ? (
              <ItemReceivedToken
                btnCopy={false}
                label="Standard"
                valueDisplay={`CW-${nft?.version}`}
              />
            ) : null}
            <ItemReceivedToken
              btnCopy={false}
              IconRightComponent={
                <View>
                  <OWButtonIcon
                    name="tdesignjump"
                    sizeIcon={20}
                    fullWidth={false}
                    onPress={onBrowser}
                    colorIcon={colors["neutral-text-action-on-light-bg"]}
                  />
                </View>
              }
              label="Contract address"
              valueDisplay={formatContractAddress(nft?.contractAddress)}
              value={nft?.contractAddress}
            />
            <ItemReceivedToken
              label="Token ID"
              valueDisplay={`${nft?.tokenId}` || "0"}
              value={`${nft?.tokenId}` || "0"}
            />
          </View>
        </View>
        <View style={styles.containerBox}>
          <View style={styles.topDes}>
            <OWText style={styles.txtTitleDes}>Description</OWText>
          </View>
          <View
            style={{
              paddingVertical: 16,
            }}
          >
            <OWText style={styles.txtDes}>{nft?.description}</OWText>
          </View>
        </View>
      </ScrollView>
    </PageWithView>
  );
});

const styling = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    imgWrap: {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      position: "absolute",
      alignItems: "center",
      alignSelf: "center",
      justifyContent: "center",
    },
    image: {
      width: "100%",
      height: metrics.screenWidth - 32,
      borderRadius: 24,
    },
    container: {
      paddingHorizontal: 16,
    },
    txtTitleTop: {
      color: colors["neutral-text-title"],
      fontSize: 16,
      fontWeight: "600",
      lineHeight: 24,
    },
    topDes: {
      borderBottomWidth: 1,
      borderBottomColor: colors["neutral-border-default"],
      paddingBottom: 16,
    },
    txtTitleDes: {
      fontSize: 15,
      fontWeight: "400",
      lineHeight: 20,
      color: colors["neutral-text-body"],
    },
    txtDes: {
      lineHeight: 24,
      fontWeight: "400",
      fontSize: 16,
      color: colors["neutral-text-body"],
    },
    leftItem: {},
    rightItem: {},
    itemBox: {
      borderBottomWidth: 1,
      borderColor: colors["neutral-border-default"],
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
    },
    txtPrice: {
      color: colors["neutral-text-body"],
      fontSize: 14,
      fontWeight: "400",
      lineHeight: 20,
    },
    txtFloorPrice: {
      color: colors["neutral-text-body2"],
      fontSize: 14,
      fontWeight: "400",
      lineHeight: 20,
    },
    txtAmount: {
      fontSize: 28,
      fontWeight: "500",
      lineHeight: 34,
    },
    containerBox: {
      backgroundColor: colors["neutral-surface-card"],
      padding: 16,
      borderRadius: 24,
      marginTop: 16,
    },
    topHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    headerRight: {},
  });
};

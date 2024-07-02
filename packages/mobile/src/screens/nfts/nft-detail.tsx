import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { StyleSheet, View } from "react-native";
import { useSmartNavigation } from "../../navigation.provider";
import { _keyExtract, formatContractAddress } from "../../utils/helper";
import {
  PageWithScrollView,
  PageWithScrollViewInBottomTabView,
} from "../../components/page";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Text } from "@src/components/text";
import { useTheme } from "@src/themes/theme-provider";
// import FastImage from "react-native-fast-image";
import { metrics } from "@src/themes";
import OWIcon from "@src/components/ow-icon/ow-icon";
import OWText from "@src/components/text/ow-text";
import { useQuery } from "@apollo/client";
import { Token } from "@src/graphql/queries";
import { ChainIdEnum, unknownToken } from "@owallet/common";
import { CoinPretty } from "@owallet/unit";
import { useStore } from "@src/stores";
import ProgressiveFastImage from "@freakycoder/react-native-progressive-fast-image";
import images from "@src/assets/images";
import LottieView from "lottie-react-native";
import { OwLoading } from "@src/components/owallet-loading/ow-loading";
export const NftDetailScreen: FunctionComponent = observer((props) => {
  const { chainStore, accountStore, priceStore, queriesStore, modalStore } =
    useStore();
  const { colors } = useTheme();

  const { item } = props.route?.params;
  const { loading, error, data } = useQuery(Token, {
    variables: {
      collectionAddr: item?.collection?.contractAddress,
      tokenId: item?.tokenId,
    },
  });
  console.log(data, "dataa");
  console.log(item, "item");
  const styles = styling();
  const token = data?.token;
  const tokenInfo =
    chainStore.getChain(ChainIdEnum.Stargaze).stakeCurrency || unknownToken;
  const balance = new CoinPretty(
    tokenInfo,
    token?.collection?.floorPrice || "0"
  );
  return (
    <PageWithScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <ProgressiveFastImage
          style={styles.image}
          source={{ uri: item?.media?.url || token?.media?.url }}
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
                  uri: item?.media?.url,
                }}
                size={24}
                style={{
                  borderRadius: 999,
                }}
              />
              <OWText style={styles.txtTitleTop}>
                {token?.collection?.name}
              </OWText>
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
                #{token?.tokenId}
              </OWText>
            </View>
          </View>
          <OWText style={styles.txtFloorPrice}>Floor price</OWText>
          <OWText style={styles.txtAmount}>
            {balance?.trim(true)?.toString()}
          </OWText>
          <OWText style={styles.txtPrice}>
            {priceStore.calculatePrice(balance)?.toString()}
          </OWText>
        </View>
        <View style={styles.containerBox}>
          {/* <View style={styles.itemBox}>
            <View style={styles.leftItem}>
              <Text>Standard</Text>
              <Text>ERC-721</Text>
            </View>
            <View style={styles.rightItem}></View>
          </View> */}
          <View style={styles.itemBox}>
            <View style={styles.leftItem}>
              <Text
                style={{
                  lineHeight: 24,
                }}
                weight="600"
                color={colors["neutral-text-title"]}
              >
                Contract address
              </Text>
              <Text
                style={{
                  lineHeight: 24,
                }}
                weight="400"
                size={16}
                color={colors["neutral-text-body"]}
              >
                {formatContractAddress(token?.collection?.contractAddress)}
              </Text>
            </View>
            <View style={styles.rightItem}>
              <OWIcon name="tdesignjump" size={20} />
            </View>
          </View>
          <View style={styles.itemBox}>
            <View style={styles.leftItem}>
              <Text
                style={{
                  lineHeight: 24,
                }}
                weight="600"
                color={colors["neutral-text-title"]}
              >
                Token ID
              </Text>
              <Text
                style={{
                  lineHeight: 24,
                }}
                weight="400"
                size={16}
                color={colors["neutral-text-body"]}
              >
                {token?.tokenId}
              </Text>
            </View>
            <View style={styles.rightItem}>
              <OWIcon name="tdesigncopy" size={20} />
            </View>
          </View>
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
          <OWText style={styles.txtDes}>{token?.description}</OWText>
        </View>
      </View>
    </PageWithScrollView>
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

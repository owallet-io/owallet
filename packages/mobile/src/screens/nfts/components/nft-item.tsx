import React from "react";
import { TouchableOpacity, Image, View, Text, StyleSheet } from "react-native";
import { spacing, typography, metrics } from "../../../themes";
import {
  formatContractAddress,
  limitString,
  maskedNumber,
} from "../../../utils/helper";
import { useTheme } from "@src/themes/theme-provider";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { useStore } from "@src/stores";
import { ChainIdEnum, unknownToken } from "@owallet/common";
import { CoinPretty, Dec } from "@owallet/unit";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";
import { useSmartNavigation } from "@src/navigation.provider";
import { useNavigation } from "@react-navigation/native";
import ProgressiveFastImage from "@freakycoder/react-native-progressive-fast-image";
import images from "@src/assets/images";
import LottieView from "lottie-react-native";
import { IItemNft } from "@src/screens/home/components";
export const NftItem = ({ item }: { item: IItemNft }) => {
  const { colors } = useTheme();

  const styles = styling(colors);

  const balance = new CoinPretty(item.tokenInfo, item?.floorPrice || "0");
  const smartNavigation = useSmartNavigation();

  return (
    <TouchableOpacity
      style={styles.flatListItem}
      onPress={() => {
        smartNavigation.pushSmart("Nfts.Detail", {
          item,
        });
      }}
    >
      <ProgressiveFastImage
        style={styles.itemPhoto}
        source={{ uri: item?.url }}
        onLoad={() => console.log("loaded")}
        onError={() => console.log("error")}
        thumbnailSource={images.thumnail_nft}
        thumbnailImageStyle={styles.itemPhoto}
        loadingImageComponent={
          <View style={styles.imgWrap}>
            <LottieView
              source={require("@src/assets/animations/loading_owallet.json")}
              style={{ width: 120, height: 120 }}
              autoPlay
              loop
              speed={0.5}
            />
          </View>
        }
        loadingSource={require("@assets/animations/loading.gif")}
      />
      <View
        style={{
          margin: 8,
        }}
      >
        <Text style={styles.title}>{limitString(item?.name, 24)}</Text>
        <Text style={styles.txtFloorPrice}>Floor price</Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <OWIcon
            type="images"
            source={{
              uri: item?.tokenInfo?.coinImageUrl,
            }}
            size={16}
          />
          <Text style={styles.title}>
            {balance.denom !== unknownToken.coinDenom
              ? `${maskedNumber(
                  balance?.trim(true)?.hideDenom(true)?.toString()
                )} ${balance?.denom}`
              : "Not for sale"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styling = (colors) =>
  StyleSheet.create({
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
    flatListItem: {
      backgroundColor: colors["neutral-surface-card"],
      borderRadius: 18,
      width: (metrics.screenWidth - 48) / 2,
      justifyContent: "center",
      padding: 4,
      borderWidth: 1,
      borderColor: colors["neutral-border-default"],
    },
    itemPhoto: {
      borderRadius: 18,
      width: "100%",
      height: (metrics.screenWidth - 32) / 2,
      resizeMode: "cover",
    },
    itemText: {
      color: colors["gray-800"],
    },
    title: {
      fontSize: 15,
      fontWeight: "600",
      lineHeight: 24,
      color: colors["neutral-text-title"],
    },
    txtFloorPrice: {
      fontSize: 14,
      fontWeight: "400",
      lineHeight: 20,
      color: colors["neutral-text-body2"],
    },
  });

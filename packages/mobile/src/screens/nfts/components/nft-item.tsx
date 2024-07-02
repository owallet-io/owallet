import React from "react";
import { TouchableOpacity, Image, View, Text, StyleSheet } from "react-native";
import { spacing, typography, metrics } from "../../../themes";
import { formatContractAddress, limitString } from "../../../utils/helper";
import { useTheme } from "@src/themes/theme-provider";
import OWIcon from "@src/components/ow-icon/ow-icon";

export const NftItem = ({ item }) => {
  console.log(item?.media?.url, "item nft");
  const { colors } = useTheme();
  const styles = styling(colors);
  return (
    <TouchableOpacity
      style={styles.flatListItem}
      onPress={() => {
        // smartNavigation.navigateSmart('Nfts',{})
      }}
    >
      <Image
        source={{
          uri: item?.media?.url,
        }}
        style={styles.itemPhoto}
        resizeMode="cover"
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
              uri: "https://",
            }}
            size={16}
          />
          <Text style={styles.title}>{`0.00083`}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styling = (colors) =>
  StyleSheet.create({
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
      height: (metrics.screenWidth - 48) / 2,
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

import React from "react";
import { TouchableOpacity, Image, View, Text, StyleSheet } from "react-native";
import { spacing, typography, colors, metrics } from "../../../themes";
import { formatContractAddress } from "../../../utils/helper";

export const NftItem = ({ item }) => {
  return (
    <TouchableOpacity
      style={styles.flatListItem}
      onPress={() => {
        // smartNavigation.navigateSmart('Nfts',{})
      }}
    >
      <Image
        source={{
          uri: item.uri,
        }}
        style={styles.itemPhoto}
        resizeMode="cover"
      />
      <View
        style={{
          flexDirection: "column",
          justifyContent: "space-between",
          marginTop: spacing["12"],
          alignItems: "flex-start",
        }}
      >
        <Text
          style={{
            ...typography.h7,
            color: colors["gray-900"],
            fontWeight: "900",
          }}
        >
          {formatContractAddress(item.title)}
        </Text>

        <Text
          style={{
            ...typography.h5,
            color: colors["gray-900"],
            fontWeight: "900",
          }}
        >
          {item.oraiPrice}
        </Text>

        <Text
          style={{
            ...typography.h5,
            color: colors["gray-900"],
            fontWeight: "900",
          }}
        >{`$ ${58.23}`}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  textLoadMore: {
    ...typography["h7"],
    color: colors["primary-surface-default"],
  },
  containerBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors["gray-50"],
    width: metrics.screenWidth - 48,
    height: spacing["40"],
    paddingVertical: spacing["10"],
    borderRadius: spacing["12"],
  },
  sectionHeader: {
    ...typography.h7,
    color: colors["gray-800"],
    marginBottom: spacing["8"],
    marginRight: spacing["10"],
  },
  flatListItem: {
    backgroundColor: colors["gray-50"],
    borderRadius: spacing["12"],
    width: (metrics.screenWidth - 60) / 2,
    marginRight: spacing["12"],
    padding: spacing["12"],
  },
  itemPhoto: {
    width: (metrics.screenWidth - 84) / 2,
    height: (metrics.screenWidth - 84) / 2,
    borderRadius: spacing["6"],
  },
  itemText: {
    color: colors["gray-800"],
  },
});

import { StyleSheet, View } from "react-native";
import React, { FunctionComponent } from "react";
import { registerModal } from "@src/modals/base";
import { Text } from "@src/components/text";
import OWFlatList from "@src/components/page/ow-flat-list";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { TypeTheme, useTheme } from "@src/themes/theme-provider";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import { metrics } from "@src/themes";
import { chainIcons } from "@oraichain/oraidex-common";
import { KADOChainNameEnum } from "@owallet/common";

//@ts-ignore
export const SelectNetworkModal: FunctionComponent<{
  setChainFilter: (chainId: string) => void;
  close?: () => void;
  isOpen?: boolean;
  selectedChainFilter: string;
}> = registerModal(({ close, selectedChainFilter, setChainFilter }) => {
  const { colors } = useTheme();
  const styles = styling(colors);
  return (
    <View style={styles.container}>
      <Text style={styles.title} weight="500" size={16}>
        Select Network
      </Text>
      <TouchableOpacity
        style={styles.clear}
        onPress={() => {
          setChainFilter(null);
          close();
        }}
      >
        <Text size={16} color={colors["blue-400"]} weight="500">
          Clear
        </Text>
      </TouchableOpacity>
      <OWFlatList
        data={chainIcons}
        isBottomSheet
        renderItem={({ item }) => {
          if (item) {
            return (
              <TouchableOpacity
                onPress={() => {
                  setChainFilter(item.chainId);
                  close();
                }}
                style={styles.btn}
              >
                <View style={styles.logo}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      backgroundColor: colors["gray-10"],
                    }}
                  >
                    <OWIcon
                      type="images"
                      source={{ uri: item.Icon }}
                      size={35}
                    />
                  </View>
                  <Text
                    style={styles.pl24}
                    size={16}
                    weight="500"
                    color={colors["gray-500"]}
                  >
                    {KADOChainNameEnum[item.chainId]}
                  </Text>
                </View>
                {selectedChainFilter === item.chainId && (
                  <OWIcon
                    name="check_stroke"
                    color={colors["green-500"]}
                    size={18}
                  />
                )}
              </TouchableOpacity>
            );
          }
        }}
      />
    </View>
  );
});

const styling = (colors: TypeTheme["colors"]) =>
  StyleSheet.create({
    pl24: {
      paddingLeft: 24,
    },
    logo: {
      flexDirection: "row",
      alignItems: "center",
    },
    clear: {
      alignSelf: "flex-end",
      marginHorizontal: 24,
      marginBottom: 16,
    },
    btn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 35,
      paddingVertical: 15,
      borderTopWidth: 0.5,
      borderColor: colors["border-network-modal"],
    },
    title: {
      textAlign: "center",
      paddingBottom: 20,
      paddingTop: 10,
      color: colors["text-title"],
    },
    container: {
      height: metrics.screenHeight / 2,
    },
  });

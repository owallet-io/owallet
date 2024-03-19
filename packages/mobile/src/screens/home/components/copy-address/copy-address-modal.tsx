import { StyleSheet, Text, TextInput, View } from "react-native";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import OWFlatList from "@src/components/page/ow-flat-list";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { TypeTheme, useTheme } from "@src/themes/theme-provider";
import { metrics } from "@src/themes";
import { CustomAddressCopyable } from "@src/components/address-copyable/custom";
import { chainIcons } from "@oraichain/oraidex-common";
import { ChainIdEnum, ChainNameEnum } from "@owallet/common";
import OWText from "@src/components/text/ow-text";

export const CopyAddressModal: FunctionComponent<{
  accounts: object;
  copyable?: boolean;
  onPress?: Function;
}> = ({ accounts, copyable = true, onPress }) => {
  const safeAreaInsets = useSafeAreaInsets();
  const [keyword, setKeyword] = useState("");
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    const data = [];
    Object.keys(accounts).map((k) => {
      if (k && k !== undefined && k !== "undefined") {
        data.push({
          name: k,
          address: accounts[k],
        });
      }
    });

    if (keyword === "" || !keyword) {
      setAddresses(data);
    } else {
      const tmpData = data.filter((d) => {
        return d.name.toString().toLowerCase().includes(keyword.toLowerCase());
      });

      setAddresses(tmpData);
    }
  }, [keyword]);

  const { colors } = useTheme();
  const styles = styling(colors);

  return (
    <View
      style={[styles.containerModal, { paddingBottom: safeAreaInsets.bottom }]}
    >
      <View>
        <TextInput
          style={styles.textInput}
          placeholderTextColor={colors["text-place-holder"]}
          placeholder="Search for a chain"
          onChangeText={(t) => setKeyword(t)}
          value={keyword}
        />
        <View style={styles.iconSearch}>
          <OWIcon color={colors["blue-400"]} name="search" size={16} />
        </View>
      </View>
      <OWFlatList
        isBottomSheet
        keyboardShouldPersistTaps="handled"
        data={addresses}
        renderItem={({ item }) => {
          const chainNameKey = Object.keys(ChainNameEnum).find(
            (key) => ChainNameEnum[key] === item.name
          );
          const chainId = ChainIdEnum[chainNameKey];

          const chainIcon = chainIcons.find((c) => c.chainId === chainId);

          return (
            <CustomAddressCopyable
              onPress={() => onPress({ ...item, chainIcon: chainIcon?.Icon })}
              icon={
                chainIcon ? (
                  <OWIcon
                    type="images"
                    source={{ uri: chainIcon.Icon }}
                    size={28}
                  />
                ) : (
                  <OWText>{item.name.charAt(0)}</OWText>
                )
              }
              chain={item.name}
              address={item.address}
              maxCharacters={22}
            />
          );
        }}
      />
    </View>
  );
};

const styling = (colors: TypeTheme["colors"]) =>
  StyleSheet.create({
    iconSearch: {
      position: "absolute",
      left: 12,
      top: 22,
    },
    textInput: {
      paddingVertical: 0,
      height: 40,
      backgroundColor: colors["box-nft"],
      borderRadius: 999,
      paddingLeft: 35,
      fontSize: 14,
      fontWeight: "500",
      color: colors["neutral-text-body"],
      marginVertical: 10,
      paddingRight: 12,
    },
    containerModal: {
      height: metrics.screenHeight / 1.3,
    },
  });

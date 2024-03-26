import { Image, ScrollView, StyleSheet, TextInput, View } from "react-native";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { TypeTheme, useTheme } from "@src/themes/theme-provider";
import { metrics } from "@src/themes";
import { CustomAddressCopyable } from "@src/components/address-copyable/custom";
import { chainIcons } from "@oraichain/oraidex-common";
import { ChainIdEnum, ChainNameEnum, getBase58Address } from "@owallet/common";
import OWText from "@src/components/text/ow-text";
import { useStore } from "@src/stores";

export const CopyAddressModal: FunctionComponent<{
  copyable?: boolean;
  onPress?: Function;
}> = ({ onPress }) => {
  const safeAreaInsets = useSafeAreaInsets();
  const [keyword, setKeyword] = useState("");
  const [addresses, setAddresses] = useState({});

  const { accountStore } = useStore();

  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
  const accountEth = accountStore.getAccount(ChainIdEnum.Ethereum);
  const accountBtc = accountStore.getAccount(ChainIdEnum.Bitcoin);

  useEffect(() => {
    let accounts = {};

    let defaultEvmAddress = accountEth.evmosHexAddress;

    Object.keys(ChainIdEnum).map((key) => {
      let defaultCosmosAddress = accountStore.getAccount(
        ChainIdEnum[key]
      ).bech32Address;

      if (defaultCosmosAddress.startsWith("evmos")) {
        accounts[ChainNameEnum[key]] = defaultEvmAddress;
      } else if (key === "TRON") {
        return;
      } else {
        accounts[ChainNameEnum[key]] = defaultCosmosAddress;
      }
    });
    accounts[ChainNameEnum.TRON] = getBase58Address(
      accountStore.getAccount(ChainIdEnum.TRON).evmosHexAddress
    );
    accounts[ChainNameEnum.BitcoinLegacy] = accountBtc.allBtcAddresses.legacy;
    accounts[ChainNameEnum.BitcoinSegWit] = accountBtc.allBtcAddresses.bech32;

    setAddresses(accounts);
  }, [accountOrai.bech32Address, accountEth.evmosHexAddress]);

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
          <OWIcon color={colors["blue-400"]} name="tdesign_search" size={16} />
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {addresses && Object.keys(addresses).length > 0 ? (
          Object.keys(addresses).map((key) => {
            const item = { name: key, address: addresses[key] };
            const chainNameKey = Object.keys(ChainNameEnum).find(
              (k) => ChainNameEnum[k] === key
            );
            const chainId = ChainIdEnum[chainNameKey];

            const chainIcon = chainIcons.find((c) => c.chainId === chainId);
            if (key !== "undefined") {
              if (keyword === "") {
                return (
                  <CustomAddressCopyable
                    onPress={() =>
                      onPress &&
                      onPress({ ...item, chainIcon: chainIcon?.Icon })
                    }
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
              }

              if (
                keyword !== "" &&
                key.toString().toLowerCase().includes(keyword.toLowerCase())
              ) {
                return (
                  <CustomAddressCopyable
                    onPress={() =>
                      onPress &&
                      onPress({ ...item, chainIcon: chainIcon?.Icon })
                    }
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
              }
            }
          })
        ) : (
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Image
              style={{
                width: metrics.screenWidth / 1.7,
                height: metrics.screenWidth / 1.7,
              }}
              source={require("../../../../assets/image/img_planet.png")}
              resizeMode="contain"
              fadeDuration={0}
            />
          </View>
        )}
      </ScrollView>
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
      height: metrics.screenHeight / 1.6,
    },
  });

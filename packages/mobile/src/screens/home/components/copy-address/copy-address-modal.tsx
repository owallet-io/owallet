import {
  Image,
  StyleSheet,
  View,
  TextInput,
  InteractionManager,
} from "react-native";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { TypeTheme, useTheme } from "@src/themes/theme-provider";
import { metrics } from "@src/themes";
import { CustomAddressCopyable } from "@src/components/address-copyable/custom";
import { chainIcons } from "@oraichain/oraidex-common";
import {
  ChainIdEnum,
  ChainNameEnum,
  getBase58Address,
  KADOChainNameEnum,
} from "@owallet/common";
import OWText from "@src/components/text/ow-text";
import { useStore } from "@src/stores";
import { registerModal } from "@src/modals/base";
import { BottomSheetProps } from "@gorhom/bottom-sheet";
import { ScrollView } from "react-native-gesture-handler";
import ByteBrew from "react-native-bytebrew-sdk";

export const CopyAddressModal: FunctionComponent<{
  copyable?: boolean;
  onPress?: Function;
  isOpen: boolean;
  close: () => void;
  bottomSheetModalConfig?: Omit<BottomSheetProps, "snapPoints" | "children">;
}> = registerModal(({ onPress, copyable = true, close }) => {
  const safeAreaInsets = useSafeAreaInsets();
  const [keyword, setKeyword] = useState("");
  const [addresses, setAddresses] = useState({});
  const [refresh, setRefresh] = useState(Date.now());
  const { colors } = useTheme();

  const styles = styling(colors);

  const { accountStore, keyRingStore } = useStore();

  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
  const accountTron = accountStore.getAccount(ChainIdEnum.TRON);
  const accountEth = accountStore.getAccount(ChainIdEnum.Ethereum);
  const accountBtc = accountStore.getAccount(ChainIdEnum.Bitcoin);

  useEffect(() => {
    ByteBrew.NewCustomEvent(`Copy Address Modal`);
    setTimeout(() => {
      setRefresh(Date.now());
    }, 300);
  }, []);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      let accounts = {};

      let defaultEvmAddress;
      if (
        accountEth.isNanoLedger &&
        keyRingStore?.keyRingLedgerAddresses?.eth
      ) {
        defaultEvmAddress = keyRingStore.keyRingLedgerAddresses.eth;
      } else {
        defaultEvmAddress = accountEth.evmosHexAddress;
      }
      Object.keys(ChainIdEnum).map((key) => {
        let defaultCosmosAddress = accountStore.getAccount(
          ChainIdEnum[key]
        ).bech32Address;

        if (defaultCosmosAddress.startsWith("evmos")) {
          accounts[ChainNameEnum[key]] = defaultEvmAddress;
        } else if (key === KADOChainNameEnum[ChainIdEnum.TRON]) {
          accounts[ChainNameEnum.TRON] = null;
        } else {
          accounts[ChainNameEnum[key]] = defaultCosmosAddress;
        }
      });

      if (
        accountTron.isNanoLedger &&
        keyRingStore?.keyRingLedgerAddresses?.trx
      ) {
        accounts[ChainNameEnum.TRON] = keyRingStore.keyRingLedgerAddresses.trx;
      } else {
        if (accountTron) {
          accounts[ChainNameEnum.TRON] = getBase58Address(
            accountTron.evmosHexAddress
          );
        }
      }

      accounts[ChainNameEnum.BitcoinLegacy] = accountBtc.allBtcAddresses.legacy;
      accounts[ChainNameEnum.BitcoinSegWit] = accountBtc.allBtcAddresses.bech32;

      setAddresses(accounts);
    });
  }, [accountOrai.bech32Address, accountEth.evmosHexAddress, refresh]);

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.searchInput}>
          <View style={{ paddingRight: 4 }}>
            <OWIcon
              color={colors["neutral-icon-on-light"]}
              name="tdesign_search"
              size={16}
            />
          </View>
          <TextInput
            style={{
              fontFamily: "SpaceGrotesk-Regular",
              width: "100%",
              color: colors["neutral-icon-on-light"],
            }}
            onChangeText={(t) => setKeyword(t)}
            value={keyword}
            placeholderTextColor={colors["neutral-text-body"]}
            placeholder="Search by name"
          />
        </View>
      </View>
      <ScrollView
        style={[
          {
            paddingBottom: safeAreaInsets.bottom,
            height: metrics.screenHeight / 1.5,
          },
        ]}
        showsVerticalScrollIndicator={false}
        persistentScrollbar={true}
      >
        {addresses && Object.keys(addresses).length > 0 ? (
          Object.keys(addresses).map((key) => {
            const item = { name: key, address: addresses[key] };
            if (item.name.toLowerCase().includes("testnet")) {
              return;
            }
            const chainNameKey = Object.keys(ChainNameEnum).find(
              (k) => ChainNameEnum[k] === key
            );
            const chainId = ChainIdEnum[chainNameKey];

            let chainIcon = chainIcons.find((c) => c.chainId === chainId);

            // Hardcode for Oasis because oraidex-common does not have icon yet
            if (item.name.includes("Oasis")) {
              chainIcon = {
                chainId: chainId,
                Icon: "https://s2.coinmarketcap.com/static/img/coins/200x200/7653.png",
              };
            }
            // Hardcode for BTC because oraidex-common does not have icon yet
            if (item.name.includes("Bit")) {
              chainIcon = {
                chainId: chainId,
                Icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/1200px-Bitcoin.svg.png",
              };
            }

            // Hardcode for Neutaro because oraidex-common does not have icon yet
            if (item.name.toLowerCase().includes("neutaro")) {
              chainIcon = {
                chainId: chainId,
                Icon: "https://assets.coingecko.com/coins/images/36277/large/Neutaro_logo.jpg?1711371142",
              };
            }

            if (!chainIcon) {
              chainIcon = chainIcons.find(
                (c) => c.chainId === ChainIdEnum.Oraichain
              );
            }

            if (key !== "undefined") {
              if (keyword === "") {
                return (
                  <CustomAddressCopyable
                    copyable={copyable}
                    onPress={() => {
                      if (onPress) {
                        onPress({ ...item, chainIcon: chainIcon?.Icon });
                        close();
                      }
                    }}
                    icon={
                      <OWIcon
                        type="images"
                        source={{ uri: chainIcon.Icon }}
                        size={28}
                      />
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
                    copyable={copyable}
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
});

const styling = (colors: TypeTheme["colors"]) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
      alignSelf: "center",
    },
    searchInput: {
      flexDirection: "row",
      backgroundColor: colors["neutral-surface-action"],
      height: 40,
      borderRadius: 999,
      width: metrics.screenWidth - 32,
      alignItems: "center",
      paddingHorizontal: 12,
    },
  });

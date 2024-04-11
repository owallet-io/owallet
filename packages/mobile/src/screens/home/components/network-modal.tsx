import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { metrics, spacing, typography } from "../../../themes";
import { _keyExtract, showToast, getTokenInfos } from "../../../utils/helper";
import FastImage from "react-native-fast-image";
import { VectorCharacter } from "../../../components/vector-character";
import { Text } from "@src/components/text";
import {
  COINTYPE_NETWORK,
  getKeyDerivationFromAddressType,
} from "@owallet/common";
import { TouchableOpacity } from "react-native-gesture-handler";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useBIP44Option } from "@src/screens/register/bip44";
import { useStore } from "@src/stores";
import { useTheme } from "@src/themes/theme-provider";
import { Popup } from "react-native-popup-confirm-toast";
import {
  chainIcons,
  ChainIdEnum,
  getTotalUsd,
} from "@oraichain/oraidex-common";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { OWButton } from "@src/components/button";
import { RadioButton } from "react-native-radio-buttons-group";

export const NetworkModal = () => {
  const { colors } = useTheme();
  const [keyword, setKeyword] = useState("");
  const [activeTab, setActiveTab] = useState<"mainnet" | "testnet">("mainnet");

  const bip44Option = useBIP44Option();
  const {
    modalStore,
    chainStore,
    keyRingStore,
    accountStore,
    appInitStore,
    universalSwapStore,
  } = useStore();
  const [chains, setChains] = useState(chainStore.chainInfosInUI);

  const account = accountStore.getAccount(chainStore.current.chainId);
  const styles = styling(colors);
  let totalUsd: number = 0;
  let todayAssets;
  if (
    Object.keys(appInitStore.getInitApp.prices).length > 0 &&
    Object.keys(universalSwapStore.getAmount).length > 0
  ) {
    totalUsd = getTotalUsd(
      universalSwapStore.getAmount,
      appInitStore.getInitApp.prices
    );
    todayAssets = getTokenInfos({
      tokens: universalSwapStore.getAmount,
      prices: appInitStore.getInitApp.prices,
    });
  }

  const onConfirm = async (item: any) => {
    const { networkType } = chainStore.getChain(item?.chainId);
    const keyDerivation = (() => {
      const keyMain = getKeyDerivationFromAddressType(account.addressType);
      if (networkType === "bitcoin") {
        return keyMain;
      }
      return "44";
    })();
    chainStore.selectChain(item?.chainId);
    await chainStore.saveLastViewChainId();
    appInitStore.selectAllNetworks(false);
    modalStore.close();
    Popup.hide();

    await keyRingStore.setKeyStoreLedgerAddress(
      `${keyDerivation}'/${item.bip44.coinType ?? item.coinType}'/${
        bip44Option.bip44HDPath.account
      }'/${bip44Option.bip44HDPath.change}/${
        bip44Option.bip44HDPath.addressIndex
      }`,
      item?.chainId
    );
  };
  const groupedData = todayAssets?.reduce((result, element) => {
    const key = element.chainId;

    if (!result[key]) {
      result[key] = {
        sum: 0,
      };
    }

    result[key].sum += element.value;

    return result;
  }, {});

  useEffect(() => {
    if (activeTab === "mainnet") {
      const tmpChainInfos = [];
      chainStore.chainInfosInUI.map((c) => {
        if (!c.chainName.toLowerCase().includes("test")) {
          tmpChainInfos.push(c);
        }
      });
      setChains(tmpChainInfos);
    } else {
      const tmpChainInfos = [];
      chainStore.chainInfosInUI.map((c) => {
        if (c.chainName.toLowerCase().includes("test")) {
          tmpChainInfos.push(c);
        }
      });
      setChains(tmpChainInfos);
    }
  }, [activeTab]);

  useEffect(() => {
    if (chainStore.current.chainName.toLowerCase().includes("test")) {
      setActiveTab("testnet");
    }
  }, [chainStore.current.chainName]);

  const handleSwitchNetwork = useCallback(async (item) => {
    try {
      if (account.isNanoLedger) {
        modalStore.close();
        if (!item.isAll) {
          Popup.show({
            type: "confirm",
            title: "Switch network!",
            textBody: `You are switching to ${
              COINTYPE_NETWORK[item.bip44.coinType]
            } network. Please confirm that you have ${
              COINTYPE_NETWORK[item.bip44.coinType]
            } App opened before switch network`,
            buttonText: `I have switched ${
              COINTYPE_NETWORK[item.bip44.coinType]
            } App`,
            confirmText: "Cancel",
            okButtonStyle: {
              backgroundColor: colors["orange-800"],
            },
            callback: () => onConfirm(item),
            cancelCallback: () => {
              Popup.hide();
            },
            bounciness: 0,
            duration: 10,
          });
          return;
        } else {
          appInitStore.selectAllNetworks(true);
        }
      } else {
        modalStore.close();
        if (!item.isAll) {
          chainStore.selectChain(item?.chainId);
          await chainStore.saveLastViewChainId();
          appInitStore.selectAllNetworks(false);
          modalStore.close();
        } else {
          appInitStore.selectAllNetworks(true);
        }
      }
    } catch (error) {
      showToast({
        type: "danger",
        message: JSON.stringify(error),
      });
    }
  }, []);

  const _renderItem = ({ item }) => {
    let selected =
      item?.chainId === chainStore.current.chainId &&
      !appInitStore.getInitApp.isAllNetworks;

    if (item.isAll && appInitStore.getInitApp.isAllNetworks) {
      selected = true;
    }

    let chainIcon = chainIcons.find((c) => c.chainId === item.chainId);

    // Hardcode for Oasis because oraidex-common does not have icon yet
    if (item.chainName.includes("Oasis")) {
      chainIcon = {
        chainId: item.chainId,
        Icon: "https://s2.coinmarketcap.com/static/img/coins/200x200/7653.png",
      };
    }
    // Hardcode for BTC because oraidex-common does not have icon yet
    if (item.chainName.includes("Bit")) {
      chainIcon = {
        chainId: item.chainId,
        Icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/1200px-Bitcoin.svg.png",
      };
    }

    if (!chainIcon) {
      chainIcon = chainIcons.find((c) => c.chainId === ChainIdEnum.Oraichain);
    }

    return (
      <TouchableOpacity
        style={{
          paddingLeft: 12,
          paddingRight: 8,
          paddingVertical: 9.5,
          borderRadius: 12,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: selected ? colors["neutral-surface-bg2"] : null,
        }}
        onPress={() => {
          handleSwitchNetwork(item);
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: 44,
              backgroundColor: colors["neutral-surface-action"],
              marginRight: 16,
            }}
          >
            {chainIcon ? (
              <OWIcon
                type="images"
                source={{ uri: chainIcon.Icon }}
                size={28}
              />
            ) : (
              <VectorCharacter
                char={item.chainName[0]}
                height={15}
                color={colors["white"]}
              />
            )}
          </View>
          <View>
            <Text
              style={{
                fontSize: 14,
                color: colors["neutral-text-title"],
                fontWeight: "600",
              }}
            >
              {item.chainName}
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: colors["sub-text"],
                fontWeight: "400",
              }}
            >
              $
              {!item.chainId
                ? totalUsd?.toFixed(2)
                : Number(groupedData?.[item.chainId]?.sum ?? 0).toFixed(2)}
            </Text>
          </View>
        </View>

        <View>
          <RadioButton
            color={
              selected
                ? colors["hightlight-surface-active"]
                : colors["neutral-text-body"]
            }
            id={item.chainId}
            selected={selected}
            onPress={() => handleSwitchNetwork(item)}
          />
        </View>
      </TouchableOpacity>
    );

    return (
      <TouchableOpacity
        style={{
          ...styles.containerBtn,
        }}
        onPress={() => {
          handleSwitchNetwork(item);
        }}
      >
        <View
          style={{
            justifyContent: "flex-start",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              height: 38,
              width: 38,
              padding: spacing["2"],
              borderRadius: spacing["12"],
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: selected
                ? colors["primary-surface-default"]
                : null,
            }}
          >
            {item?.raw?.chainSymbolImageUrl ? (
              <FastImage
                style={{
                  width: 24,
                  height: 24,
                }}
                resizeMode={FastImage.resizeMode.contain}
                source={{
                  uri: item.raw.chainSymbolImageUrl,
                }}
              />
            ) : (
              <VectorCharacter
                char={item.chainName[0]}
                height={15}
                color={colors["white"]}
              />
            )}
          </View>

          <View
            style={{
              justifyContent: "space-between",
              marginLeft: spacing["12"],
            }}
          >
            <Text
              style={{
                ...typography.h6,
                color: colors["sub-primary-text"],
                fontWeight: "900",
              }}
              numberOfLines={1}
            >
              {item.chainName}
            </Text>
            <Text
              style={{
                color: colors["neutral-text-body"],
              }}
              numberOfLines={1}
            >
              $
              {!item.chainId
                ? totalUsd?.toFixed(2)
                : Number(groupedData?.[item.chainId]?.sum ?? 0).toFixed(2)}
            </Text>
          </View>
        </View>

        <View>
          <RadioButton
            color={
              selected
                ? colors["hightlight-surface-active"]
                : colors["neutral-text-body"]
            }
            id={item.chainId}
            selected={selected}
            onPress={() => handleSwitchNetwork(item)}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{
        alignItems: "center",
      }}
    >
      {/* <View
        style={{
          alignItems: "flex-end",
          width: "100%",
        }}
      >
        {chainStore.current.chainId === TRON_ID ? null : (
          <TouchableOpacity
            onPress={() => {
              navigate(SCREENS.STACK.Others, {
                screen: SCREENS.NetworkSelect,
              });
              modalStore.close();
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: colors["primary-surface-default"],
              }}
            >
              + Add network
            </Text>
          </TouchableOpacity>
        )}
      </View> */}
      <Text
        style={{
          ...typography.h6,
          fontWeight: "900",
          color: colors["primary-text"],
          width: "100%",
          textAlign: "center",
        }}
      >
        {`choose networks`.toUpperCase()}
      </Text>
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
            }}
            onChangeText={(t) => setKeyword(t)}
            value={keyword}
            placeholderTextColor={colors["neutral-text-body"]}
            placeholder="Search by name"
          />
        </View>
      </View>
      <View style={styles.wrapHeaderTitle}>
        <OWButton
          type="link"
          label={"Mainnet"}
          textStyle={{
            color: colors["primary-surface-default"],
            fontWeight: "600",
            fontSize: 16,
          }}
          onPress={() => setActiveTab("mainnet")}
          style={[
            {
              width: "50%",
            },
            activeTab === "mainnet" ? styles.active : null,
          ]}
        />
        <OWButton
          type="link"
          label={"Testnet"}
          onPress={() => setActiveTab("testnet")}
          textStyle={{
            color: colors["primary-surface-default"],
            fontWeight: "600",
            fontSize: 16,
          }}
          style={[
            {
              width: "50%",
            },
            activeTab === "testnet" ? styles.active : null,
          ]}
        />
      </View>
      <View
        style={{
          marginTop: spacing["12"],
          width: metrics.screenWidth - 48,
          justifyContent: "space-between",
          height: metrics.screenHeight / 2,
        }}
      >
        {_renderItem({ item: { chainName: "All networks", isAll: true } })}
        <BottomSheetFlatList
          showsVerticalScrollIndicator={false}
          data={chains}
          renderItem={_renderItem}
          keyExtractor={_keyExtract}
        />
      </View>
    </View>
  );
};

const styling = (colors) =>
  StyleSheet.create({
    containerBtn: {
      backgroundColor: colors["background-item-list"],
      paddingVertical: spacing["16"],
      borderRadius: spacing["8"],
      paddingHorizontal: spacing["16"],
      flexDirection: "row",
      marginTop: spacing["16"],
      alignItems: "center",
      justifyContent: "space-between",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
      alignSelf: "center",
      marginTop: 16,
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
    wrapHeaderTitle: {
      flexDirection: "row",
      paddingBottom: 12,
    },
    active: {
      borderBottomColor: colors["primary-surface-default"],
      borderBottomWidth: 2,
    },
  });

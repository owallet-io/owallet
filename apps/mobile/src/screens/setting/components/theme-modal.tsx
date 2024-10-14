import React, { FunctionComponent } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { typography, metrics } from "../../../themes";
import { capitalizeFirstLetter, _keyExtract } from "../../../utils/helper";
import { Text } from "@src/components/text";
import { AppInit } from "@src/stores/app_init";
import { ModalStore } from "../../../stores/modal";
import OWIcon from "@src/components/ow-icon/ow-icon";
import OWFlatList from "@src/components/page/ow-flat-list";

interface ThemeModalProps {
  modalStore: ModalStore;
  appInitStore: AppInit;
  colors: object;
}

const themes = [
  { label: "light", isNew: false },
  { label: "dark", isNew: false },
  { label: "osmosis", isNew: true },
  { label: "injective", isNew: true },
];

export const ThemeModal: FunctionComponent<ThemeModalProps> = ({
  appInitStore,
  modalStore,
  colors,
}) => {
  const onChooseTheme = (item) => {
    if (item.label !== "light" && item.label !== "dark") {
      appInitStore.updateTheme("dark");
      appInitStore.updateWalletTheme(item.label);
    } else {
      appInitStore.updateTheme(item.label);
      appInitStore.updateWalletTheme("owallet");
    }
    modalStore.close();
  };

  const renderTheme = ({ item }) => {
    let icon;

    let selected = false;

    if (appInitStore.getInitApp.wallet === "owallet") {
      if (appInitStore.getInitApp.theme === item.label) {
        selected = true;
      }
    } else {
      if (appInitStore.getInitApp.wallet === item.label) {
        selected = true;
      }
    }

    switch (item.label) {
      case "light":
        icon = (
          <OWIcon
            name="tdesignsunny"
            color={colors["neutral-text-title"]}
            size={18}
          />
        );
        break;
      case "dark":
        icon = (
          <OWIcon
            name="tdesign_moon"
            color={colors["neutral-text-title"]}
            size={18}
          />
        );
        break;
      case "osmosis":
        icon = (
          <OWIcon
            type={"images"}
            size={18}
            style={{
              borderRadius: 999,
              tintColor: colors["neutral-text-title"],
            }}
            source={{
              uri: "https://assets.coingecko.com/coins/images/16724/standard/osmo.png",
            }}
          />
        );
        break;
      case "injective":
        icon = (
          <OWIcon
            type={"images"}
            size={18}
            style={{
              borderRadius: 999,
              tintColor: colors["neutral-text-title"],
            }}
            source={{
              uri: "https://assets.coingecko.com/coins/images/12882/standard/Secondary_Symbol.png?1696512670",
            }}
          />
        );
        break;

      default:
        icon = <OWIcon name="tdesign_moon" color={colors["white"]} size={18} />;
        break;
    }

    return (
      <TouchableOpacity
        onPress={() => {
          onChooseTheme(item);
        }}
        style={{
          width: metrics.screenWidth / 2.3,
          padding: 16,
          borderRadius: 16,
          borderWidth: 3,
          marginBottom: 12,
          borderColor: !selected
            ? colors["neutral-border-default"]
            : colors["neutral-surface-pressed"],
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <View>
          <View
            style={{
              backgroundColor: colors["neutral-surface-action3"],
              borderRadius: 999,
              padding: 7,
              width: 32,
              height: 32,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 6,
            }}
          >
            {icon}
          </View>
          <View>
            <Text weight="600" size={16} color={colors["neutral-text-title"]}>
              {capitalizeFirstLetter(item.label)}
            </Text>
          </View>
        </View>
        <View>
          {item.isNew ? (
            <View
              style={{
                borderRadius: 4,
                backgroundColor: colors["highlight-surface-subtle"],
                padding: 4,
              }}
            >
              <Text
                weight="600"
                size={12}
                color={colors["highlight-text-title"]}
              >
                NEW
              </Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{
        backgroundColor: colors["neutral-surface-card"],
      }}
    >
      <View
        style={{
          alignSelf: "center",
        }}
      >
        <Text
          style={{
            ...typography.h6,
            fontWeight: "900",
            color: colors["neutral-text-title"],
          }}
        >
          {`THEME`}
        </Text>
      </View>
      <View
        style={{
          marginTop: 16,
        }}
      >
        <OWFlatList
          data={themes}
          renderItem={renderTheme}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          ListFooterComponent={
            <View style={{ marginTop: 12 }}>
              <Text color={colors["neutral-text-body"]} size={13}>
                Seamlessly experience the Osmosis and Injective themes on
                OWallet
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    justifyContent: "space-between",
  },
  itemContainer: {
    padding: 24,
    alignItems: "center",
  },
});

import React, { FunctionComponent } from "react";
import { View, FlatList } from "react-native";
import { metrics, spacing, typography } from "../../../themes";
import { _keyExtract } from "../../../utils/helper";
import { Text } from "@src/components/text";
import { KeyStoreItem } from ".";
import { CoinGeckoPriceStore } from "@owallet/stores";
import { ModalStore } from "../../../stores/modal";
import OWFlatList from "@src/components/page/ow-flat-list";

interface CountryModalProps {
  data: any;
  current: any;
  priceStore: CoinGeckoPriceStore;
  modalStore: ModalStore;
  colors: object;
}

export const CountryModal: FunctionComponent<CountryModalProps> = ({
  data,
  current,
  priceStore,
  modalStore,
  colors,
}) => {
  const _renderItem = ({ item, index }) => {
    return (
      <KeyStoreItem
        colors={colors}
        key={index.toString()}
        containerStyle={{
          backgroundColor: colors["background-item-list"],
        }}
        label={item.label || "USD"}
        active={current === item.key ? true : false}
        onPress={() => {
          priceStore.setDefaultVsCurrency(item.key || "usd");
          modalStore.close();
        }}
      />
    );
  };

  return (
    // container
    <View
      style={{
        alignItems: "center",
        // backgroundColor: colors['primary']
      }}
    >
      <View
        style={{
          justifyContent: "flex-start",
        }}
      >
        <Text
          style={{
            ...typography.h6,
            fontWeight: "900",
            color: colors["primary-text"],
          }}
        >
          {`Select Currency`}
        </Text>
      </View>

      <View
        style={{
          marginTop: spacing["12"],
          height: metrics.screenHeight / 2,
        }}
      >
        <OWFlatList
          isBottomSheet
          // showsVerticalScrollIndicator={false}
          data={data}
          renderItem={_renderItem}
          keyExtractor={_keyExtract}
          // ListFooterComponent={() => (
          //   <View
          //     style={{
          //       height: spacing['10']
          //     }}
          //   />
          // )}
        />
      </View>
    </View>
  );
};

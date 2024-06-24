import React, { FunctionComponent, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { SelectorModal } from "../../../components/input";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@src/components/text";
import OWIcon from "@src/components/ow-icon/ow-icon";

export const SettingFiatCurrencyTopItem: FunctionComponent<{
  style?: any;
}> = observer(({ style }) => {
  const { priceStore } = useStore();

  const [isOpenModal, setIsOpenModal] = useState(false);

  const currencyItems = useMemo(() => {
    return Object.keys(priceStore.supportedVsCurrencies).map((key) => {
      return {
        key,
        label: key?.toUpperCase(),
      };
    });
  }, [priceStore.supportedVsCurrencies]);

  return (
    <React.Fragment>
      <SelectorModal
        isOpen={isOpenModal}
        close={() => setIsOpenModal(false)}
        maxItemsToShow={4}
        selectedKey={priceStore.defaultVsCurrency}
        setSelectedKey={(key) => key && priceStore.setDefaultVsCurrency(key)}
        items={currencyItems}
      />
      <TouchableOpacity
        onPress={() => setIsOpenModal(true)}
        style={style.flatten([
          "flex-row",
          "items-center",
          "justify-between",
          "padding-top-20",
        ])}
      >
        <View>
          <Text
            style={style.flatten([
              "text-caption2",
              "color-text-black-very-low",
            ])}
          >
            CURRENCY
          </Text>
          <Text
            style={style.flatten(["text-caption2", "color-black", "body1"])}
          >
            {priceStore.defaultVsCurrency.toUpperCase()}
          </Text>
        </View>
        <OWIcon name="tdesignarrow-right" size={16} />
      </TouchableOpacity>
    </React.Fragment>
  );
});

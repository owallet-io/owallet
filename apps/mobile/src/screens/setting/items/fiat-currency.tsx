import React, { FunctionComponent, useMemo, useState } from "react";
import { SettingItem } from "../components";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { SelectorModal } from "../../../components/input";
import OWIcon from "@src/components/ow-icon/ow-icon";

export const SettingFiatCurrencyItem: FunctionComponent<{
  topBorder?: boolean;
}> = observer(({ topBorder }) => {
  const { priceStore } = useStore();

  const [isOpenModal, setIsOpenModal] = useState(false);

  const currencyItems = useMemo(() => {
    return Object.keys(priceStore.supportedVsCurrencies).map((key) => {
      return {
        key,
        label: key.toUpperCase(),
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
      <SettingItem
        topBorder={topBorder}
        label="Currency"
        right={<OWIcon name="tdesignarrow-right" size={16} />}
        onPress={() => {
          setIsOpenModal(true);
        }}
      />
    </React.Fragment>
  );
});

import React, { FC, useState } from "react";
import styles from "./styles.module.scss";
import { HeaderModal } from "../../home/components/header-modal";
import { SearchInput } from "../../home/components/search-input";
import classnames from "classnames";
import SlidingPane from "react-sliding-pane";
import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { useStore } from "../../../stores";

export const ModalCurrency: FC<{
  isOpen: boolean;
  onRequestClose: () => void;
}> = observer(({ isOpen, onRequestClose }) => {
  const intl = useIntl();

  const [keyword, setKeyword] = useState<string>("");
  const { priceStore } = useStore();
  const onChangeInput = (e) => {
    e.preventDefault();
    setKeyword(e.target.value);
  };
  const switchFiat = async (currency) => {
    priceStore.setDefaultVsCurrency(currency);
    // await priceStore.saveDefaultVsCurrency();
    onRequestClose();
    return;
  };
  const data = Object.keys(priceStore.supportedVsCurrencies).filter((item) =>
    item?.toLowerCase().includes(keyword.toLowerCase())
  );
  return (
    <SlidingPane
      isOpen={isOpen}
      from="bottom"
      width="100vw"
      onRequestClose={onRequestClose}
      hideHeader={true}
      className={styles.modalCurrency}
    >
      <div className={styles.contentWrap}>
        <HeaderModal
          title={"CHOOSE CURRENCY"}
          onRequestClose={onRequestClose}
        />
        <SearchInput
          containerClassNames={styles.containerSearchInput}
          onChange={onChangeInput}
          placeholder={"Search for a currency"}
        />
        <div className={styles.containerListChain}>
          {data.map((currency, index) => {
            const fiatCurrency = priceStore.supportedVsCurrencies[currency]!;
            console.log(currency, fiatCurrency, "currency");
            return (
              <div
                onClick={() => switchFiat(currency)}
                key={fiatCurrency.currency}
                className={classnames([
                  styles.itemChain,
                  currency === priceStore.defaultVsCurrency
                    ? styles.activeItemChain
                    : null,
                ])}
              >
                <div className={styles.leftBlockHuge}>
                  <div className={styles.rightBlock}>
                    <span className={styles.titleName}>
                      {`${fiatCurrency.currency.toUpperCase()}`}
                    </span>
                  </div>
                </div>
                <div className={styles.rightBlockHuge}>
                  <input
                    id={currency}
                    defaultChecked={currency === priceStore.defaultVsCurrency}
                    name={"currency"}
                    className={styles.radioInput}
                    type={"radio"}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SlidingPane>
  );
});

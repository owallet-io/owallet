import React, { FC } from "react";
import SlidingPane from "react-sliding-pane";
import styles from "./style.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { HeaderModal } from "../home/components/header-modal";
import { ChainIdEnum } from "@owallet/common";
import { useMultipleAssets } from "../../hooks/use-multiple-assets";
import { TokensCard } from "../home/components/tokens-card";
import { IAmountConfig } from "@owallet/hooks";

export const ModalChooseTokens: FC<{
  isOpen: boolean;
  onRequestClose: () => void;
  amountConfig: IAmountConfig;
  onSelectToken?: (item) => void;
}> = observer(({ isOpen, onRequestClose, onSelectToken, amountConfig }) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const { chainStore, accountStore, priceStore, keyRingStore } = useStore();
  const totalSizeChain = chainStore.chainInfos.length;
  const allChainMap = new Map();
  if (allChainMap.size < totalSizeChain) {
    chainStore.chainInfos.map((item, index) => {
      const acc = accountStore.getAccount(item.chainId);
      const address = acc.getAddressDisplay(
        keyRingStore.keyRingLedgerAddresses,
        false
      );
      if (!address) return;
      allChainMap.set(item.chainId, {
        address: address,
        chainInfo: item,
      });
    });
  }
  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
  const { dataTokens } = useMultipleAssets(
    accountStore,
    priceStore,
    allChainMap,
    chainStore,
    refreshing,
    accountOrai.bech32Address,
    totalSizeChain
  );

  const onSelect = (item) => {
    const selectedKey = item?.token?.currency?.coinMinimalDenom;
    const currency = amountConfig.sendableCurrencies.find(
      (cur) => cur.coinMinimalDenom === selectedKey
    );
    amountConfig.setSendCurrency(currency);
    onRequestClose();
    onSelectToken(currency);
  };

  return (
    <SlidingPane
      isOpen={isOpen}
      from="bottom"
      width="100vw"
      onRequestClose={onRequestClose}
      hideHeader={true}
      className={styles.modalNetwork}
    >
      <div className={styles.contentWrap}>
        <HeaderModal
          title={"Select token".toUpperCase()}
          onRequestClose={onRequestClose}
        />
        <TokensCard
          onSelectToken={onSelect}
          dataTokens={dataTokens.filter(
            (token) => token.chainInfo.chainId === chainStore.current.chainId
          )}
        />
      </div>
    </SlidingPane>
  );
});

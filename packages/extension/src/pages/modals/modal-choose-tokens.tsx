import React, { FC } from "react";
import SlidingPane from "react-sliding-pane";
import styles from "./style.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { HeaderModal } from "../home/components/header-modal";
import { ChainIdEnum } from "@owallet/common";
import { useMultipleAssets } from "../../hooks/use-multiple-assets";
import { TokensCard } from "../home/components/tokens-card";

export const ModalChooseTokens: FC<{
  isOpen: boolean;
  onRequestClose: () => void;
  onSelectToken?: (item) => void;
}> = observer(({ isOpen, onRequestClose, onSelectToken }) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const {
    chainStore,
    accountStore,
    priceStore,
    keyRingStore,
    queriesStore,
    analyticsStore,
  } = useStore();
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
  const { totalPriceBalance, dataTokens, dataTokensByChain, isLoading } =
    useMultipleAssets(
      accountStore,
      priceStore,
      allChainMap,
      chainStore,
      refreshing,
      accountOrai.bech32Address,
      totalSizeChain
    );

  console.log("dataTokens", dataTokens);

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
        <TokensCard onSelectToken={onSelectToken} dataTokens={dataTokens} />
      </div>
    </SlidingPane>
  );
});

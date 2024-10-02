import React, { FC, useRef, useState } from "react";
import SlidingPane from "react-sliding-pane";
import styles from "./style.module.scss";
import { SearchInput } from "../components/search-input";
import classnames from "classnames";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { ChainIdEnum, formatAddress, unknownToken } from "@owallet/common";
import { HeaderModal } from "../components/header-modal";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";

export const ModalCopyAddress: FC<{
  isOpen: boolean;
  onRequestClose: () => void;
}> = observer(({ isOpen, onRequestClose }) => {
  const [keyword, setKeyword] = useState("");
  const { chainStore, accountStore, priceStore, keyRingStore } = useStore();
  const onChangeInput = (e) => {
    setKeyword(e.target.value);
  };

  const intl = useIntl();

  const copyAddress = async (address: string) => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    toast(
      intl.formatMessage({
        id: "main.address.copied",
      }),
      {
        type: "success",
      }
    );
    onRequestClose();
  };
  const btcLegacyChain = chainStore.chainInfos.find(
    (chainInfo) => chainInfo.chainId === ChainIdEnum.Bitcoin
  );
  const chains = chainStore.chainInfos.filter(
    (item, index) =>
      item?.chainName?.toLowerCase()?.includes(keyword?.toLowerCase()) &&
      !item?.chainName?.toLowerCase()?.includes("test")
  );
  const chainsData = btcLegacyChain ? [...chains, btcLegacyChain] : [...chains];
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
        <HeaderModal title={"COPY ADDRESS"} onRequestClose={onRequestClose} />
        <SearchInput
          containerClassNames={styles.containerSearchInput}
          onChange={onChangeInput}
          placeholder={"Search for a chain"}
        />
        <div className={styles.containerListChain}>
          {chainsData?.length > 0 &&
            chainsData.map((item, index) => {
              let address;
              if (index === chainsData.length - 1) {
                address = accountStore.getAccount(item.chainId).legacyAddress;
              } else {
                address = accountStore
                  .getAccount(item.chainId)
                  .getAddressDisplay(keyRingStore.keyRingLedgerAddresses, true);
              }

              return (
                <div
                  onClick={() => copyAddress(address)}
                  key={index.toString()}
                  className={classnames([styles.itemChain])}
                >
                  <div className={styles.leftBlockHuge}>
                    <div className={styles.wrapImgChain}>
                      <img
                        className={styles.imgChain}
                        src={
                          item?.stakeCurrency?.coinImageUrl ||
                          unknownToken.coinImageUrl
                        }
                      />
                    </div>
                    <div className={styles.rightBlock}>
                      <span className={styles.titleName}>{`${
                        index === chainsData.length - 1
                          ? item.chainName + " Legacy"
                          : item.chainName
                      }`}</span>
                      <span className={styles.subTitlePrice}>
                        {formatAddress(address)}
                      </span>
                    </div>
                  </div>
                  <div className={styles.rightBlockHuge}>
                    <img
                      style={{
                        width: 24,
                        height: 24,
                      }}
                      src={require("assets/svg/owallet-copy.svg")}
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

const typeNetwork = [
  {
    title: "Mainnet",
    id: 1,
  },
  {
    title: "Testnet",
    id: 2,
  },
];

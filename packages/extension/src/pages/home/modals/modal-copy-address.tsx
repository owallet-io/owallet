import React, { FC, useCallback, useRef, useState } from "react";
import SlidingPane from "react-sliding-pane";
import styles from "./style.module.scss";
import { SearchInput } from "../components/search-input";
import classnames from "classnames";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { formatAddress, unknownToken } from "@owallet/common";
import { HeaderModal } from "../components/header-modal";
import { useNotification } from "../../../components/notification";
import { useIntl } from "react-intl";

export const ModalCopyAddress: FC<{
  isOpen: boolean;
  onRequestClose: () => void;
}> = observer(({ isOpen, onRequestClose }) => {
  const [keyword, setKeyword] = useState("");
  const { chainStore, accountStore, priceStore, keyRingStore } = useStore();
  const copyRef = useRef<HTMLDivElement>();
  const onChangeInput = (e) => {
    setKeyword(e.target.value);
  };

  const intl = useIntl();
  const notification = useNotification();

  const copyAddress = async (address: string) => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    notification.push({
      placement: "top-center",
      type: "success",
      duration: 2,
      content: intl.formatMessage({
        id: "main.address.copied",
      }),
      canDelete: true,
      transition: {
        duration: 0.25,
      },
    });
  };
  const chains = chainStore.chainInfos.filter((item, index) =>
    item?.chainName?.toLowerCase()?.includes(keyword?.toLowerCase())
  );

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
          {chains?.length > 0 &&
            chains.map((item, index) => {
              const address = accountStore
                .getAccount(item.chainId)
                .getAddressDisplay(keyRingStore.keyRingLedgerAddresses, true);
              return (
                <div
                  onClick={() => {
                    copyAddress(address);
                    onRequestClose();
                  }}
                  key={item.chainId}
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
                      <span className={styles.titleName}>{item.chainName}</span>
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
                      src={require("../../../public/assets/svg/owallet-copy.svg")}
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

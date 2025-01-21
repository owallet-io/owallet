import React, { FC, ReactNode } from "react";
import { observer } from "mobx-react-lite";
import styles from "./style.module.scss";
import { HeaderModal } from "../components/header-modal";
import SlidingPane from "react-sliding-pane";
import { formatAddress, getFavicon } from "@owallet/common";
import classnames from "classnames";
import { Button } from "components/common/button";
import style from "pages/sign/style.module.scss";
import { toast } from "react-toastify";

export const ModalNoti: FC<{
  isOpen: boolean;
  onRequestClose: () => void;
  content: ReactNode;
  onSubmit: any;
}> = observer(({ isOpen, onRequestClose, content, onSubmit }) => {
  return (
    <SlidingPane
      isOpen={isOpen}
      from="bottom"
      width="100vw"
      onRequestClose={onRequestClose}
      hideHeader={true}
      className={classnames(styles.modalNetwork, styles.modalConfirm)}
    >
      <div>
        <HeaderModal title={"News"} onRequestClose={onRequestClose} />
        {content ? content : null}
        <div
          style={{
            flexDirection: "row",
            display: "flex",
            paddingTop: 16
          }}
        >
          <Button
            containerStyle={{ marginRight: 8 }}
            className={classnames(style.button, style.rejectBtn)}
            color={"reject"}
            onClick={onRequestClose}
          >
            Close
          </Button>
          <Button
            className={classnames(style.button, style.approveBtn)}
            // data-loading={signInteractionStore.isLoading}
            // loading={signInteractionStore.isLoading}
            onClick={onSubmit}
          >
            Confirmed
          </Button>
        </div>
      </div>
    </SlidingPane>
  );
});

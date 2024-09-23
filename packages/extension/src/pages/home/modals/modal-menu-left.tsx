import React, { FC, useEffect, useState } from "react";
import SlidingPane from "react-sliding-pane";
import styles from "./style.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { useHistory } from "react-router";
import { ChainIdEnum } from "@owallet/common";
import { toast } from "react-toastify";
import Switch from "react-switch";
import colors from "theme/colors";
import {
  GetSidePanelEnabledMsg,
  GetSidePanelIsSupportedMsg,
  SetSidePanelEnabledMsg,
} from "@owallet/background";
import { InExtensionMessageRequester } from "@owallet/router-extension";
import { BACKGROUND_PORT } from "@owallet/router";

export const ModalMenuLeft: FC<{
  isOpen: boolean;
  onRequestClose: () => void;
}> = observer(({ isOpen, onRequestClose }) => {
  const { keyRingStore, chainStore } = useStore();
  const history = useHistory();

  const [sidePanelSupported, setSidePanelSupported] = useState(false);
  const [sidePanelEnabled, setSidePanelEnabled] = useState(false);

  useEffect(() => {
    const msg = new GetSidePanelIsSupportedMsg();
    new InExtensionMessageRequester()
      .sendMessage(BACKGROUND_PORT, msg)
      .then((res) => {
        setSidePanelSupported(res.supported);

        const msg = new GetSidePanelEnabledMsg();
        new InExtensionMessageRequester()
          .sendMessage(BACKGROUND_PORT, msg)
          .then((res) => {
            setSidePanelEnabled(res.enabled);
          });
      });
  }, []);

  const lock = async () => {
    await keyRingStore.lock();
    history.push("/");
    onRequestClose();
  };
  const actionMenu = (item) => {
    switch (item.id) {
      case MenuEnum.LOCK:
        lock();
        break;
      case MenuEnum.CONNECTED_DAPP:
        history.push("/connected-dapp");
        break;
      case MenuEnum.ADD_TOKEN:
        if (chainStore.current.chainId === ChainIdEnum.Bitcoin) {
          toast(
            "Add token in Bitcoin chain not supported yet! Please try again with another chain.",
            {
              type: "warning",
            }
          );

          return;
        }
        history.push("/add-token");
        break;
      case MenuEnum.PREFERENCES:
        history.push("/preferences");
        break;
      case MenuEnum.FEEDBACK:
        window.open(item.link);
        break;
      default:
      // code block
    }
  };
  return (
    <SlidingPane
      isOpen={isOpen}
      title={<span>CHOOSE NETWORK</span>}
      from="left"
      width="80vw"
      onRequestClose={onRequestClose}
      hideHeader={true}
      className={styles.modalMenuLeft}
    >
      <div className={styles.containerSliderLeft}>
        <div
          style={{
            cursor: "auto",
          }}
          className={styles.itemMenu}
        >
          <div
            style={{
              width: 32,
              height: 32,
              cursor: "pointer",
            }}
            onClick={onRequestClose}
            className={styles.btnIcon}
          >
            <img
              className={styles.imgIcon}
              src={require("assets/svg/tdesign_arrow_left.svg")}
            />
          </div>
        </div>
        {dataItem.map((item, index) => (
          <div
            onClick={() => actionMenu(item)}
            key={item.id}
            style={{
              borderBottom: item.isBorderBottom ? "1px solid #EBEDF2" : null,
            }}
            className={styles.itemMenu}
          >
            <div className={styles.leftBlock}>
              <div className={styles.btnIcon}>
                <img className={styles.imgIcon} src={item.icon} />
              </div>
              <span className={styles.nameMenu}>{item.name}</span>
            </div>
            {item.value && <span className={styles.version}>{item.value}</span>}
            {item.type === "switch" && (
              <Switch
                onColor={colors["highlight-surface-active"]}
                uncheckedIcon={false}
                checkedIcon={false}
                height={20}
                width={35}
                onChange={async (value) => {
                  const msg = new SetSidePanelEnabledMsg(!sidePanelEnabled);
                  new InExtensionMessageRequester()
                    .sendMessage(BACKGROUND_PORT, msg)
                    .then((res) => {
                      setSidePanelEnabled(res.enabled);

                      if (res.enabled) {
                        if (
                          typeof chrome !== "undefined" &&
                          typeof chrome.sidePanel !== "undefined"
                        ) {
                          (async () => {
                            const selfCloseId = Math.random() * 100000;
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            window.__self_id_for_closing_view_side_panel =
                              selfCloseId;
                            // side panel을 열고 나서 기존의 popup view를 모두 지워야한다
                            const viewsBefore = browser.extension.getViews();

                            try {
                              const activeTabs = await browser.tabs.query({
                                active: true,
                                currentWindow: true,
                              });
                              if (activeTabs.length > 0) {
                                const id = activeTabs[0].id;
                                if (id != null) {
                                  chrome.sidePanel.open({
                                    tabId: id,
                                  });
                                }
                              }
                            } catch (e) {
                              console.log(e);
                            } finally {
                              for (const view of viewsBefore) {
                                if (
                                  // 자기 자신은 제외해야한다.
                                  // 다른거 끄기 전에 자기가 먼저 꺼지면 안되기 때문에...
                                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                  // @ts-ignore
                                  window.__self_id_for_closing_view_side_panel !==
                                  selfCloseId
                                ) {
                                  view.window.close();
                                }
                              }

                              window.close();
                            }
                          })();
                        } else {
                          window.close();
                        }
                      } else {
                        const selfCloseId = Math.random() * 100000;
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        window.__self_id_for_closing_view_side_panel =
                          selfCloseId;
                        // side panel을 모두 닫아야한다.
                        const views = browser.extension.getViews();

                        for (const view of views) {
                          if (
                            // 자기 자신은 제외해야한다.
                            // 다른거 끄기 전에 자기가 먼저 꺼지면 안되기 때문에...
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            window.__self_id_for_closing_view_side_panel !==
                            selfCloseId
                          ) {
                            view.window.close();
                          }
                        }

                        window.close();
                      }
                    });
                }}
                checked={sidePanelEnabled}
              />
            )}
          </div>
        ))}
      </div>
    </SlidingPane>
  );
});
const manifestData = chrome.runtime.getManifest();

enum MenuEnum {
  ADD_TOKEN = 1,
  ADDR_BOOK = 3,
  CONNECTED_DAPP = 4,
  PREFERENCES = 5,
  LOCK = 6,
  ABOUT_USER = 7,
  FEEDBACK = 8,
  SIDEPANEL = 9,
}

const dataItem = [
  {
    name: "Add Token",
    icon: require("assets/svg/tdesign_add_circle.svg"),
    id: MenuEnum.ADD_TOKEN,
  },
  // {
  //   name: "Manage Token list",
  //   icon: require("assets/svg/tdesign_list.svg"),
  //   id: 2,
  // },
  // {
  //   name: "Address Book",
  //   icon: require("assets/svg/tdesign_address_book.svg"),
  //   id: MenuEnum.ADDR_BOOK,
  // },
  {
    name: "Connected DApp",
    icon: require("assets/svg/tdesign_internet.svg"),
    id: MenuEnum.CONNECTED_DAPP,
  },
  {
    name: "Preferences",
    icon: require("assets/svg/tdesign_adjustment.svg"),
    isBorderBottom: true,
    id: MenuEnum.PREFERENCES,
  },
  {
    name: "Lock Wallet",
    icon: require("assets/svg/tdesign_lock_on.svg"),
    id: MenuEnum.LOCK,
    isBorderBottom: true,
  },
  {
    name: "About us",
    icon: require("assets/svg/tdesign_info_circle.svg"),
    id: MenuEnum.ABOUT_USER,
    value: `v${manifestData.version}`,
    isBorderBottom: true,
  },
  {
    name: "Feedback",
    icon: require("assets/svg/tdesign_info_circle.svg"),
    id: MenuEnum.FEEDBACK,
    link: `https://defi.featurebase.app/?b=66b096ba4e5763c7884f0f77`,
    isBorderBottom: true,
  },
  {
    name: "Side panel",
    icon: require("assets/svg/tdesign_fullscreen.svg"),
    id: MenuEnum.SIDEPANEL,
    type: "switch",
  },
];

import React, { CSSProperties, FunctionComponent, useState } from "react";

import { HeaderLayout } from "../../../layouts";

import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";

import { useHistory } from "react-router";
import { Button, Modal, ModalBody, Popover, PopoverBody } from "reactstrap";

import style from "./style.module.scss";
import { useLoadingIndicator } from "../../../components/loading-indicator";
import { PageButton, PageButtonAccount } from "../page-button";
import { MultiKeyStoreInfoWithSelectedElem } from "@owallet/background";
import { FormattedMessage, useIntl } from "react-intl";
import { ExportPage } from "../export";
import { ChangeNamePage } from "../keyring/change";
import { ClearPage } from "../clear";

import { useEffect, useRef } from "react";

export const useOutsideClick = (callback: () => void) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [callback]);

  return ref;
};

export const SetKeyRingPage: FunctionComponent = observer(() => {
  const intl = useIntl();
  const [isActive, setIsActive] = useState(undefined);
  const { keyRingStore, analyticsStore } = useStore();
  const history = useHistory();
  const ref = useOutsideClick(() => {
    setIsActive(undefined);
  });

  const loadingIndicator = useLoadingIndicator();

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({ id: "setting.keyring" })}
      // onBackButton={() => {
      //   history.goBack();
      // }}
    >
      <div className={style.container}>
        <div className={style.innerTopContainer}>
          <div
            onClick={(e) => {
              e.preventDefault();
              analyticsStore.logEvent("Add additional account started");

              browser.tabs.create({
                url: "/popup.html#/register",
              });
            }}
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <img
              src={require("../../../public/assets/svg/add-account.svg")}
              alt=""
              style={{ marginRight: 4 }}
            />
            <span style={{ fontSize: 12, fontWeight: 600 }}>
              <FormattedMessage id="setting.address-book.button.add" />
            </span>
          </div>
        </div>
        {keyRingStore.multiKeyStoreInfo.map((keyStore, i) => {
          const bip44HDPath = keyStore.bip44HDPath
            ? keyStore.bip44HDPath
            : {
                account: 0,
                change: 0,
                addressIndex: 0,
              };

          return (
            <div ref={ref}>
              <PageButtonAccount
                ind={i}
                key={i.toString()}
                title={`${
                  keyStore.meta?.name
                    ? keyStore.meta.name
                    : intl.formatMessage({
                        id: "setting.keyring.unnamed-account",
                      })
                } ${
                  keyStore.selected
                    ? intl.formatMessage({
                        id: "setting.keyring.selected-account",
                      })
                    : ""
                }`}
                paragraph={
                  keyStore.type === "ledger"
                    ? `Ledger - m/44'/${bip44HDPath?.coinType ?? 118}'/${
                        bip44HDPath.account
                      }'${
                        bip44HDPath.change !== 0 ||
                        bip44HDPath.addressIndex !== 0
                          ? `/${bip44HDPath.change}/${bip44HDPath.addressIndex}`
                          : ""
                      }`
                    : keyStore.meta?.email
                    ? keyStore.meta.email
                    : undefined
                }
                onClick={
                  keyStore.selected
                    ? undefined
                    : async (e) => {
                        e.preventDefault();
                        loadingIndicator.setIsLoading("keyring", true);
                        try {
                          await keyRingStore.changeKeyRing(i);
                          analyticsStore.logEvent("Account changed");
                          loadingIndicator.setIsLoading("keyring", false);
                          history.push("/");
                        } catch (e) {
                          console.log(`Failed to change keyring: ${e.message}`);
                          loadingIndicator.setIsLoading("keyring", false);
                        }
                      }
                }
                style={keyStore.selected ? { cursor: "default" } : undefined}
                icons={[
                  <KeyRingToolsIcon
                    key="tools"
                    index={i}
                    keyStore={keyStore}
                    setIsActive={setIsActive}
                    isActive={isActive}
                  />,
                ]}
                styleTitle={{
                  fontWeight: 400,
                  fontSize: 14,
                }}
              />
            </div>
          );
        })}
      </div>
    </HeaderLayout>
  );
});

const KeyRingToolsIcon: FunctionComponent<{
  index: number;
  keyStore: MultiKeyStoreInfoWithSelectedElem;
  setIsActive?: any;
  isActive?: number;
}> = ({ index, keyStore, isActive, setIsActive }) => {
  const toggleOpen = () => setIsActive(isActive === index ? undefined : index);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [typeSettingAccount, setTypeSettingAccount] = useState<string>("view");
  const history = useHistory();

  const [tooltipId] = useState(() => {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return `tools-${Buffer.from(bytes).toString("hex")}`;
  });

  return (
    <React.Fragment>
      <Popover
        target={tooltipId}
        isOpen={isActive === index}
        toggle={toggleOpen}
        placement="bottom"
        className={style.popoverContainer}
        hideArrow
      >
        <PopoverBody
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            history.push("");
          }}
          className={style.popoverContainer}
        >
          {keyStore.type === "mnemonic" || keyStore.type === "privateKey" ? (
            <div
              className={style.popoverItem}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsActive(undefined);
                setIsAccountModalOpen(true);
                setTypeSettingAccount("view");
                // history.push(`/setting/export/${index}?type=${keyStore.type}`);
              }}
            >
              <FormattedMessage
                id={
                  keyStore.type === "mnemonic"
                    ? "setting.export"
                    : "setting.export.private-key"
                }
              />
            </div>
          ) : null}
          <div
            className={style.popoverItem}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsActive(undefined);
              setIsAccountModalOpen(true);
              setTypeSettingAccount("change");
              // history.push(`/setting/keyring/change/name/${index}`);
            }}
          >
            <FormattedMessage id="setting.keyring.change.name" />
          </div>
          <div
            className={style.popoverItem}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsActive(undefined);
              setIsAccountModalOpen(true);
              setTypeSettingAccount("delete");
              // history.push(`/setting/clear/${index}`);
            }}
          >
            <FormattedMessage id="setting.clear" />
          </div>
        </PopoverBody>
      </Popover>
      <AccountSettingModal
        isOpen={isAccountModalOpen}
        index={index}
        typeSettingAccount={typeSettingAccount}
        closeModal={() => setIsAccountModalOpen(false)}
        toggle={() => setIsAccountModalOpen((value) => !value)}
        keyStore={keyStore?.type}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "100%",
          padding: "0 8px",
          cursor: "pointer",
          color: "#353945",
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          // setIsOpen(true);
        }}
      >
        <i id={tooltipId} className="fas fa-ellipsis-h" />
      </div>
    </React.Fragment>
  );
};

export const AccountSettingModal: FunctionComponent<{
  isOpen: boolean;
  closeModal: () => void;
  toggle: () => void;
  typeSettingAccount?: string;
  index?: number;
  keyStore?: string;
}> = observer(
  ({ isOpen, closeModal, toggle, typeSettingAccount, index, keyStore }) => {
    return (
      <Modal isOpen={isOpen} toggle={toggle} centered>
        <ModalBody>
          <AccountTitleSettingModal type={typeSettingAccount} toggle={toggle} />
          {typeSettingAccount === "view" && (
            <ExportPage indexExport={index.toString()} keyStore={keyStore} />
          )}
          {typeSettingAccount === "change" && (
            <ChangeNamePage indexPage={index.toString()} />
          )}
          {typeSettingAccount === "delete" && (
            <ClearPage indexPage={index.toString()} />
          )}
        </ModalBody>
      </Modal>
    );
  }
);

export const AccountTitleSettingModal: FunctionComponent<{
  type?: string;
  styleAccount?: CSSProperties;
  toggle?: () => void;
}> = observer(({ type = "view", styleAccount, toggle }) => {
  let text = "";
  switch (type) {
    case "view":
      text = "View Mnemonic Seed";
      break;
    case "change":
      text = "Change Account Name";
      break;
    case "delete":
      text = "Delete Account";
      break;
  }
  return (
    <>
      {toggle && (
        <div
          onClick={toggle}
          style={{
            cursor: "pointer",
            textAlign: "right",
          }}
        >
          <img
            src={require("../../../public/assets/img/close.svg")}
            alt="total-balance"
          />
        </div>
      )}
      {type && (
        <div
          style={
            styleAccount ?? {
              textAlign: "center",
              color: "#434193",
              fontSize: 24,
            }
          }
        >
          {text}
        </div>
      )}
      <div style={{ height: 20 }} />
    </>
  );
});

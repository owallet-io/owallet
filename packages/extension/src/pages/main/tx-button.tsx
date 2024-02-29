import React, { FunctionComponent, useEffect, useRef, useState } from "react";

import styleTxButton from "./tx-button.module.scss";

import { Button, Tooltip, Modal, ModalBody } from "reactstrap";

import { observer } from "mobx-react-lite";

import { useStore } from "../../stores";
import { getBase58Address, getEvmAddress } from "@owallet/common";
// import Modal from 'react-modal';

import { FormattedMessage } from "react-intl";
import { useHistory } from "react-router";

import classnames from "classnames";
import { Dec } from "@owallet/unit";
import { toDisplay, TRON_ID } from "@owallet/common";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const QrCode = require("qrcode");

const DepositModal: FunctionComponent<{
  bech32Address: string;
}> = ({ bech32Address }) => {
  const qrCodeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (qrCodeRef.current && bech32Address) {
      QrCode.toCanvas(qrCodeRef.current, bech32Address);
    }
  }, [bech32Address]);

  return (
    <div className={styleTxButton.depositModal}>
      <h1 className={styleTxButton.title}>Scan to Receive Tokens </h1>
      <canvas className={styleTxButton.qrcode} id="qrcode" ref={qrCodeRef} />
    </div>
  );
};

export interface TxButtonViewProps {
  setHasSend?: any;
  hasSend?: boolean;
}

export const TxButtonView: FunctionComponent<TxButtonViewProps> = observer(
  ({ setHasSend, hasSend }) => {
    const { accountStore, chainStore, queriesStore, keyRingStore } = useStore();

    const accountInfo = accountStore.getAccount(chainStore.current.chainId);
    const walletAddress = accountInfo.getAddressDisplay(
      keyRingStore.keyRingLedgerAddresses
    );
    const walletAddressFetch = accountInfo.getAddressDisplay(
      keyRingStore.keyRingLedgerAddresses,
      true
    );
    const queries = queriesStore.get(chainStore.current.chainId);
    const queryBalances =
      queries.queryBalances.getQueryBech32Address(walletAddressFetch);

    const hasAssets =
      queryBalances.balances.find((bal) =>
        bal?.balance?.toDec().gt(new Dec(0))
      ) !== undefined;

    const [isDepositOpen, setIsDepositOpen] = useState(false);

    const [tooltipOpen, setTooltipOpen] = useState(false);

    const history = useHistory();

    const sendBtnRef = useRef<HTMLButtonElement>(null);

    return (
      <div className={styleTxButton.containerTxButton}>
        <Modal
          toggle={() => setIsDepositOpen(false)}
          centered
          isOpen={isDepositOpen}
          style={{
            margin: 25,
          }}
        >
          <ModalBody>
            <DepositModal bech32Address={walletAddress} />
          </ModalBody>
        </Modal>
        <Button
          className={classnames(styleTxButton.button, styleTxButton.btnReceive)}
          outline
          onClick={(e) => {
            e.preventDefault();

            setIsDepositOpen(true);
          }}
        >
          <FormattedMessage id="main.account.button.receive" />
        </Button>
        {/*
        "Disabled" property in button tag will block the mouse enter/leave events.
        So, tooltip will not work as expected.
        To solve this problem, don't add "disabled" property to button tag and just add "disabled" class manually.
       */}
        <Button
          innerRef={sendBtnRef}
          className={classnames(
            styleTxButton.button,
            {
              disabled: !hasAssets,
            },
            styleTxButton.btnSend
          )}
          data-loading={accountInfo.isSendingMsg === "send"}
          onClick={(e) => {
            e.preventDefault();

            if (hasAssets) {
              setHasSend(!hasSend);
              // history.push('/send');
            }
          }}
        >
          <FormattedMessage id="main.account.button.send" />
        </Button>
        {!hasAssets ? (
          <Tooltip
            placement="bottom"
            isOpen={tooltipOpen}
            target={sendBtnRef}
            toggle={() => setTooltipOpen((value) => !value)}
            fade
          >
            <FormattedMessage id="main.account.tooltip.no-asset" />
          </Tooltip>
        ) : null}
      </div>
    );
  }
);

export const TxButtonEvmView: FunctionComponent<TxButtonViewProps> = observer(
  ({ setHasSend, hasSend }) => {
    const { accountStore, chainStore, queriesStore, keyRingStore } = useStore();

    const accountInfo = accountStore.getAccount(chainStore.current.chainId);
    const queries = queriesStore.get(chainStore.current.chainId);
    // const queryBalances = queries.queryBalances.getQueryBech32Address(
    //   accountInfo.bech32Address
    // );

    const [isDepositOpen, setIsDepositOpen] = useState(false);

    const [tooltipOpen, setTooltipOpen] = useState(false);

    const history = useHistory();

    const sendBtnRef = useRef<HTMLButtonElement>(null);
    const addressCore = accountInfo.getAddressDisplay(
      keyRingStore.keyRingLedgerAddresses,
      false
    );
    const addressDisplay = accountInfo.getAddressDisplay(
      keyRingStore.keyRingLedgerAddresses
    );
    if (!addressCore) return null;
    let evmBalance;
    evmBalance =
      queries.evm.queryEvmBalance.getQueryBalance(addressCore)?.balance;

    const isTronNetwork = chainStore.current.chainId === TRON_ID;
    const hasAssets = isTronNetwork
      ? evmBalance && toDisplay(evmBalance.amount.int.value, 24)
      : parseFloat(
          evmBalance?.trim(true).shrink(true).maxDecimals(6).toString()
        ) > 0;

    return (
      <div className={styleTxButton.containerTxButton}>
        <Modal
          toggle={() => setIsDepositOpen(false)}
          centered
          isOpen={isDepositOpen}
        >
          <DepositModal bech32Address={addressDisplay} />
        </Modal>
        <Button
          className={classnames(styleTxButton.button, styleTxButton.btnReceive)}
          outline
          onClick={(e) => {
            e.preventDefault();

            setIsDepositOpen(true);
          }}
        >
          <FormattedMessage id="main.account.button.receive" />
        </Button>
        {/*
        "Disabled" property in button tag will block the mouse enter/leave events.
        So, tooltip will not work as expected.
        To solve this problem, don't add "disabled" property to button tag and just add "disabled" class manually.
       */}
        <Button
          innerRef={sendBtnRef}
          className={classnames(
            styleTxButton.button,
            {
              disabled: !hasAssets,
            },
            styleTxButton.btnSend
          )}
          data-loading={accountInfo.isSendingMsg === "send"}
          onClick={(e) => {
            e.preventDefault();

            if (hasAssets) {
              setHasSend(!hasSend);
            }
          }}
        >
          <FormattedMessage id="main.account.button.send" />
        </Button>
        {!hasAssets ? (
          <Tooltip
            placement="bottom"
            isOpen={tooltipOpen}
            target={sendBtnRef}
            toggle={() => setTooltipOpen((value) => !value)}
            fade
          >
            <FormattedMessage id="main.account.tooltip.no-asset" />
          </Tooltip>
        ) : null}
      </div>
    );
  }
);

export const TxButtonBtcView: FunctionComponent<TxButtonViewProps> = observer(
  ({ setHasSend, hasSend }) => {
    const { accountStore, chainStore, queriesStore, keyRingStore } = useStore();

    const accountInfo = accountStore.getAccount(chainStore.current.chainId);
    const queries = queriesStore.get(chainStore.current.chainId);

    const [isDepositOpen, setIsDepositOpen] = useState(false);

    const [tooltipOpen, setTooltipOpen] = useState(false);

    const history = useHistory();

    const sendBtnRef = useRef<HTMLButtonElement>(null);
    const { chainId } = chainStore.current;
    const address = accountInfo.getAddressDisplay(
      keyRingStore.keyRingLedgerAddresses
    );
    const balanceBtc =
      queries.bitcoin.queryBitcoinBalance.getQueryBalance(address)?.balance;

    const hasAssets = balanceBtc?.toDec().gt(new Dec(0));

    return (
      <div className={styleTxButton.containerTxButton}>
        <Modal
          toggle={() => setIsDepositOpen(false)}
          centered
          isOpen={isDepositOpen}
        >
          <DepositModal bech32Address={address} />
        </Modal>
        <Button
          className={classnames(styleTxButton.button, styleTxButton.btnReceive)}
          outline
          onClick={(e) => {
            e.preventDefault();

            setIsDepositOpen(true);
          }}
        >
          <FormattedMessage id="main.account.button.receive" />
        </Button>
        {/*
        "Disabled" property in button tag will block the mouse enter/leave events.
        So, tooltip will not work as expected.
        To solve this problem, don't add "disabled" property to button tag and just add "disabled" class manually.
       */}
        <Button
          innerRef={sendBtnRef}
          className={classnames(
            styleTxButton.button,
            {
              disabled: !hasAssets,
            },
            styleTxButton.btnSend
          )}
          // data-loading={accountInfo.isSendingMsg === 'send'}
          onClick={(e) => {
            e.preventDefault();

            if (hasAssets) {
              setHasSend(!hasSend);
            }
          }}
        >
          <FormattedMessage id="main.account.button.send" />
        </Button>
        {!hasAssets ? (
          <Tooltip
            placement="bottom"
            isOpen={tooltipOpen}
            target={sendBtnRef}
            toggle={() => setTooltipOpen((value) => !value)}
            fade
          >
            <FormattedMessage id="main.account.tooltip.no-asset" />
          </Tooltip>
        ) : null}
      </div>
    );
  }
);

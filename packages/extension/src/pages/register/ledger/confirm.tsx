import React, { FunctionComponent, useEffect, useState } from "react";

import { EmptyLayout } from "../../../layouts/empty-layout";

import { observer } from "mobx-react-lite";

import { useParams } from "react-router-dom";

import style from "../style.module.scss";

import { Button } from "reactstrap";

import { FormattedMessage } from "react-intl";

import { useStore } from "../../../stores";

import AppTrx from "@ledgerhq/hw-app-trx";
import AppEth from "@ledgerhq/hw-app-eth";
import AppBtc from "@ledgerhq/hw-app-btc";
import AppCosmos from "@ledgerhq/hw-app-cosmos";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import { useNotification } from "../../../components/notification";
import { AddressBtcType } from "@owallet/types";

export const ConfirmLedgerPage: FunctionComponent = observer(() => {
  const notification = useNotification();
  const [disable, setDisable] = useState(false);
  const { ledgerInitStore, chainStore, accountStore } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const params: { chain: string } = useParams();
  useEffect(() => {
    document.body.setAttribute("data-centered", "true");

    return () => {
      document.body.removeAttribute("data-centered");
    };
  }, []);

  const handleConfirmLedger = async (type: string) => {
    setDisable(true);
    let transport;
    try {
      // transport = ledgerInitStore.isWebHID
      //   ? await TransportWebHID.create()
      //   : await TransportWebUSB.create();

      // TODO: hardcode support WEB HID
      transport = await TransportWebHID.create();
      let app;
      let address;
      let content;
      if (type === "trx") {
        app = new AppTrx(transport);
        content = "Tron Ledger Connect Success. Address:";
        address = await app.getAddress("44'/195'/0'/0/0");
      }
      if (type === "cosmos") {
        app = new AppCosmos(transport);
        content = "Cosmos Ledger Connect Success. Address:";
        address = await app.getAddress("44'/118'/0'/0/0", "cosmos");
      }
      if (type === "eth") {
        app = new AppEth(transport);
        content = "Evm Ledger Connect Success. Address:";
        address = await app.getAddress("44'/60'/0'/0/0");
      }
      // if (type === 'btc') {
      //   app = new AppBtc(transport);
      //   content = 'Btc Ledger Connect Success. Address:';
      //   const keyDerivation = account.addressType === AddressBtcType.Bech32 ? 84 : 44;
      //   address = await app.getAddress(`${keyDerivation}'/0'/0'/0/0`);
      // }

      notification.push({
        placement: "top-center",
        type: "success",
        duration: 2,
        content: content + " " + address?.address,
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });
    } catch (error) {
      notification.push({
        placement: "top-center",
        type: "danger",
        duration: 2,
        content: error?.message,
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });
    } finally {
      setDisable(false);
      if (transport) {
        await transport?.close();
      }
    }
  };

  return (
    <EmptyLayout
      className={style.container}
      style={{
        justifyContent: "center",
      }}
    >
      <div className={style.logoContainer}>
        <div>
          <img
            className={style.icon}
            src={require("assets/orai_wallet_logo.png")}
            alt="logo"
          />
        </div>
        <div className={style.logoInnerContainer}>
          <img
            className={style.logo}
            src={require("assets/logo.svg")}
            alt="logo"
          />
          <div className={style.paragraph}>Cosmos x EVM in one Wallet</div>
        </div>
      </div>
      <div
        style={{
          marginBottom: 30,
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          {`You are switching to Chain ${params?.chain} network. Please confirm that you have Chain ${params?.chain}
            App opened before switch network`}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
        }}
      >
        <Button
          color=""
          disabled={disable}
          className={style.nextBtn}
          data-loading={disable}
          onClick={() => handleConfirmLedger("trx")}
        >
          <FormattedMessage id="register.button.trx-ledger" />
        </Button>
        <Button
          color=""
          disabled={disable}
          className={style.nextBtn}
          data-loading={disable}
          onClick={() => handleConfirmLedger("cosmos")}
        >
          <FormattedMessage id="register.button.cosmos-ledger" />
        </Button>
        <Button
          color=""
          disabled={disable}
          data-loading={disable}
          className={style.nextBtn}
          onClick={() => handleConfirmLedger("eth")}
        >
          <FormattedMessage id="register.button.eth-ledger" />
        </Button>
        {/* <Button
          color=""
          disabled={disable}
          data-loading={disable}
          className={style.nextBtn}
          onClick={() => handleConfirmLedger('btc')}
        >
          <FormattedMessage id="register.button.btc-ledger" />
        </Button> */}
      </div>
    </EmptyLayout>
  );
});

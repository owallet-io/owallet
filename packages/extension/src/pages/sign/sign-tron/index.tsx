import React, { FunctionComponent, useEffect, useState } from "react";
import style from "../style.module.scss";
import { observer } from "mobx-react-lite";
import classnames from "classnames";
import { FormattedMessage, useIntl } from "react-intl";
import { Button } from "reactstrap";
import { useStore } from "../../../stores";
import { TronDataTab } from "./tron-data-tab";
import { TronDetailsTab } from "./tron-details-tab";
import {
  useAmountConfig,
  useFeeTronConfig,
  useGetFeeTron,
  useInteractionInfo,
  useRecipientConfig,
} from "@owallet/hooks";
import { useHistory } from "react-router";
import { ChainIdEnum, ExtensionKVStore, TRIGGER_TYPE } from "@owallet/common";
import { Int } from "@owallet/unit";

enum Tab {
  Details,
  Data,
}

export const SignTronPage: FunctionComponent = observer(() => {
  const intl = useIntl();
  const [tab, setTab] = useState<Tab>(Tab.Details);
  const {
    chainStore,
    keyRingStore,
    signInteractionStore,
    accountStore,
    queriesStore,
  } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.selectedChainId);
  const addressTronBase58 = accountInfo.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
  );
  const history = useHistory();
  const interactionInfo = useInteractionInfo(() => {
    signInteractionStore.rejectAll();
  });
  const [dataSign, setDataSign] = useState(null);
  const [txInfo, setTxInfo] = useState();
  const { waitingTronData } = signInteractionStore;
  const getDataTx = async () => {
    if (!waitingTronData) return;
    const kvStore = new ExtensionKVStore("keyring");
    const triggerTxId = await kvStore.get(
      `${TRIGGER_TYPE}:${waitingTronData.data.txID}`
    );
    console.log(
      "b3: get info trigger by txid: \n",
      triggerTxId,
      `${TRIGGER_TYPE}:${waitingTronData.data.txID}`
    );
    setTxInfo(triggerTxId as any);
    kvStore.set(`${TRIGGER_TYPE}:${waitingTronData.data.txID}`, null);
  };

  const queries = queriesStore.get(chainStore.selectedChainId);

  const amountConfig = useAmountConfig(
    chainStore,
    chainStore.selectedChainId,
    accountInfo.evmosHexAddress,
    queries.queryBalances
  );
  const recipientConfig = useRecipientConfig(
    chainStore,
    chainStore.selectedChainId
  );
  const feeConfig = useFeeTronConfig(
    chainStore,
    chainStore.selectedChainId,
    accountInfo.evmosHexAddress,
    queries.queryBalances,
    queries
  );

  useEffect(() => {
    console.log(txInfo, "txInfo");
    if (txInfo && amountConfig) {
      //@ts-ignore
      const tx = txInfo?.parameters.find(
        (item, index) => item.type === "uint256"
      );
      amountConfig.setAmount(tx?.value);
    }
  }, [txInfo, amountConfig]);
  useEffect(() => {
    if (dataSign) return;

    if (waitingTronData) {
      const dataTron = waitingTronData?.data;
      getDataTx();
      setDataSign(dataTron);
      if (dataTron?.recipient) {
        recipientConfig.setRawRecipient(dataTron?.recipient);
      }
      if (dataTron?.amount) {
        amountConfig.setAmount(dataTron?.amount);
      }
      if (dataTron?.currency) {
        amountConfig.setSendCurrency(dataTron?.currency);
      }

      chainStore.selectChain(ChainIdEnum.TRON);
    }
  }, [waitingTronData]);
  const error = feeConfig.getError();
  const txStateIsValid = error == null;
  if (chainStore?.selectedChainId !== ChainIdEnum.TRON) return;
  const { feeTrx, estimateEnergy, estimateBandwidth, feeLimit } = useGetFeeTron(
    addressTronBase58,
    amountConfig,
    recipientConfig,
    queries.tron,
    chainStore.current,
    keyRingStore,
    txInfo
  );
  useEffect(() => {
    if (feeTrx) {
      feeConfig.setManualFee(feeTrx);
    }
    return () => {
      feeConfig.setManualFee(null);
    };
  }, [feeTrx]);
  const feeLimitData = feeLimit?.gt(new Int(0)) ? feeLimit?.toString() : null;
  return (
    <div
      style={{
        padding: 20,
        backgroundColor: "#FFFFFF",
        height: "100%",
        overflowX: "auto",
      }}
    >
      {
        <div className={style.container}>
          <div
            style={{
              color: "#353945",
              fontSize: 24,
              fontWeight: 500,
              textAlign: "center",
              paddingBottom: 24,
            }}
          >
            Tron Network
          </div>
          <div className={classnames(style.tabs)}>
            <ul>
              <li className={classnames({ activeTabs: tab === Tab.Details })}>
                <a
                  className={classnames(style.tab, {
                    activeText: tab === Tab.Details,
                  })}
                  onClick={() => {
                    setTab(Tab.Details);
                  }}
                >
                  {intl.formatMessage({
                    id: "sign.tab.details",
                  })}
                </a>
              </li>
              <li className={classnames({ activeTabs: tab === Tab.Data })}>
                <a
                  className={classnames(style.tab, {
                    activeText: tab === Tab.Data,
                  })}
                  onClick={() => {
                    setTab(Tab.Data);
                  }}
                >
                  {intl.formatMessage({
                    id: "sign.tab.data",
                  })}
                </a>
              </li>
            </ul>
          </div>
          <div
            className={classnames(style.tabContainer, {
              [style.dataTab]: tab === Tab.Data,
            })}
          >
            {tab === Tab.Data && <TronDataTab data={dataSign} />}
            {tab === Tab.Details && (
              <TronDetailsTab
                txInfo={txInfo}
                dataInfo={{
                  estimateBandwidth,
                  estimateEnergy,
                  feeTrx,
                }}
                intl={intl}
                feeConfig={feeConfig}
                dataSign={dataSign}
              />
            )}
          </div>
          <div style={{ flex: 1 }} />
          <div className={style.buttons}>
            {keyRingStore.keyRingType === "ledger" &&
            signInteractionStore.isLoading ? (
              <Button className={style.button} disabled={true} outline>
                <FormattedMessage id="sign.button.confirm-ledger" />{" "}
                <i className="fa fa-spinner fa-spin fa-fw" />
              </Button>
            ) : (
              <>
                <Button
                  className={classnames(style.button, style.rejectBtn)}
                  color=""
                  onClick={async (e) => {
                    e.preventDefault();

                    await signInteractionStore.reject();
                    if (
                      interactionInfo.interaction &&
                      !interactionInfo.interactionInternal
                    ) {
                      window.close();
                    }
                    history.goBack();
                  }}
                  outline
                >
                  {intl.formatMessage({
                    id: "sign.button.reject",
                  })}
                </Button>
                <Button
                  className={classnames(style.button, style.approveBtn)}
                  color=""
                  disabled={!txStateIsValid}
                  data-loading={signInteractionStore.isLoading}
                  onClick={async (e) => {
                    e.preventDefault();
                    //@ts-ignore
                    if (txInfo?.functionSelector) {
                      await signInteractionStore.approveTronAndWaitEnd({
                        ...waitingTronData?.data,
                      });
                    } else {
                      //@ts-ignore
                      await signInteractionStore.approveTronAndWaitEnd({
                        ...waitingTronData?.data,
                        amount: amountConfig?.getAmountPrimitive()?.amount,
                        feeLimit: feeLimitData,
                      });
                    }
                    if (
                      interactionInfo.interaction &&
                      !interactionInfo.interactionInternal
                    ) {
                      window.close();
                    }
                    history.goBack();
                  }}
                >
                  {intl.formatMessage({
                    id: "sign.button.approve",
                  })}
                </Button>
              </>
            )}
          </div>
        </div>
      }
    </div>
  );
});

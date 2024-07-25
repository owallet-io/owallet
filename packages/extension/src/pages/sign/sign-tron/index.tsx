import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import style from "../style.module.scss";
import { observer } from "mobx-react-lite";
import classnames from "classnames";
import { FormattedMessage, useIntl } from "react-intl";
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
import { Text } from "../../../components/common/text";
import { Address } from "../../../components/address";
import colors from "../../../theme/colors";
import { WalletStatus } from "@owallet/stores";
import { DataModal } from "../modals/data-modal";
import { Button } from "../../../components/common/button";
import cn from "classnames/bind";
import useOnClickOutside from "../../../hooks/use-click-outside";

enum Tab {
  Details,
  Data,
}
const cx = cn.bind(style);

const SignTronContent: FunctionComponent = () => {
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
  const chainInfo = chainStore.getChain(ChainIdEnum.TRON);
  const addressTronBase58 = accountInfo.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
  );
  const history = useHistory();
  const interactionInfo = useInteractionInfo(() => {
    signInteractionStore.rejectAll();
  });
  const [dataSign, setDataSign] = useState(null);
  const [dataSetting, setDataSetting] = useState(false);

  const dataRef = useRef();

  const [txInfo, setTxInfo] = useState();
  const { waitingTronData } = signInteractionStore;
  const getDataTx = async () => {
    if (!waitingTronData) return;
    const kvStore = new ExtensionKVStore("keyring");
    const triggerTxId = await kvStore.get(
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

  useOnClickOutside(dataRef, () => {
    handleCloseDataModal();
  });

  const handleCloseDataModal = () => {
    setDataSetting(false);
    setTab(Tab.Details);
  };

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
    chainInfo,
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
        height: "100%",
        width: "100vw",
        overflowX: "auto",
      }}
    >
      <div
        className={cx("setting", dataSetting ? "activeSetting" : "", "modal")}
        ref={dataRef}
      >
        <DataModal
          onClose={() => {
            handleCloseDataModal();
          }}
          renderData={() => <TronDataTab data={dataSign} />}
        />
      </div>
      {
        /*
         Show the informations of tx when the sign data is delivered.
         If sign data not delivered yet, show the spinner alternatively.
         */
        <div className={style.container}>
          <div
            style={{
              height: "75%",
              overflowY: "scroll",
              overflowX: "hidden",
              padding: 16,
            }}
          >
            <div
              className={classnames(style.tabs)}
              style={{ display: "flex", paddingBottom: 12 }}
            >
              <div>
                <Text size={16} weight="700">
                  {"Approve transaction".toUpperCase()}
                </Text>
              </div>
              <div
                onClick={() => {
                  setDataSetting(true);
                  setTab(Tab.Data);
                }}
                style={{
                  padding: "6px 12px",
                  backgroundColor: colors["neutral-surface-action3"],
                  borderRadius: 999,
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <Text weight="600">Raw Data</Text>
                <img src={require("assets/icon/tdesign_chevron-right.svg")} />
              </div>
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
                  addressTronBase58={addressTronBase58}
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
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              height: "25%",
              backgroundColor: colors["neutral-surface-card"],
              borderTop: "1px solid" + colors["neutral-border-default"],
            }}
          >
            {keyRingStore.keyRingType === "ledger" &&
            signInteractionStore.isLoading ? (
              <Button className={style.button} disabled={true} mode="outline">
                <FormattedMessage id="sign.button.confirm-ledger" />
                <i className="fa fa-spinner fa-spin fa-fw" />
              </Button>
            ) : (
              <div>
                <div
                  style={{
                    flexDirection: "row",
                    display: "flex",
                    padding: 8,
                    justifyContent: "space-between",
                    backgroundColor: colors["neutral-surface-bg"],
                    margin: 16,
                    marginBottom: 8,
                    borderRadius: 12,
                  }}
                >
                  <div
                    style={{
                      flexDirection: "row",
                      display: "flex",
                    }}
                  >
                    <img
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 40,
                        marginRight: 8,
                      }}
                      src={require("assets/images/default-avatar.png")}
                    />
                    <div style={{ flexDirection: "column", display: "flex" }}>
                      <Text size={14} weight="600">
                        {accountInfo.name}
                      </Text>
                      <Text color={colors["neutral-text-body"]}>
                        <Address
                          maxCharacters={18}
                          lineBreakBeforePrefix={false}
                        >
                          {accountInfo.walletStatus === WalletStatus.Loaded &&
                          addressTronBase58
                            ? addressTronBase58
                            : "..."}
                        </Address>
                      </Text>
                    </div>
                  </div>
                  {/* <Text color={colors["neutral-text-body"]}>Demo text</Text> */}
                </div>
                <div
                  style={{
                    flexDirection: "row",
                    display: "flex",
                    padding: 16,
                    paddingTop: 0,
                  }}
                >
                  <Button
                    containerStyle={{ marginRight: 8 }}
                    className={classnames(style.button, style.rejectBtn)}
                    // disabled={signDocHelper.signDocWrapper == null}
                    color={"reject"}
                    data-loading={signInteractionStore.isLoading}
                    disabled={signInteractionStore.isLoading}
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
                  >
                    {intl.formatMessage({
                      id: "sign.button.reject",
                    })}
                  </Button>
                  <Button
                    className={classnames(style.button, style.approveBtn)}
                    // disabled={approveIsDisabled}
                    data-loading={signInteractionStore.isLoading}
                    loading={signInteractionStore.isLoading}
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
                </div>
              </div>
            )}
          </div>
        </div>
      }
    </div>
  );
};

export const SignTronPage: FunctionComponent = observer(() => {
  const { chainStore, signInteractionStore, keyRingStore } = useStore();
  const intl = useIntl();
  const [currentChainId, setChainId] = useState(chainStore.current.chainId);

  const interactionInfo = useInteractionInfo(() => {
    signInteractionStore.rejectAll();
  });

  const selectTronNetwork = async () => {
    console.log("currentChainId", currentChainId);

    if (currentChainId !== ChainIdEnum.TRON) {
      chainStore.selectChain(ChainIdEnum.TRON);
      await chainStore.saveLastViewChainId();
      setChainId(ChainIdEnum.TRON);
    }
  };

  return currentChainId === ChainIdEnum.TRON ? (
    <SignTronContent />
  ) : (
    <div
      style={{
        height: "100%",
        width: "100vw",
        overflowX: "auto",
      }}
    >
      {
        /*
         Show the informations of tx when the sign data is delivered.
         If sign data not delivered yet, show the spinner alternatively.
         */
        <div className={style.container}>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              height: "25%",
              backgroundColor: colors["neutral-surface-card"],
              borderTop: "1px solid" + colors["neutral-border-default"],
            }}
          >
            {keyRingStore.keyRingType === "ledger" &&
            signInteractionStore.isLoading ? (
              <Button className={style.button} disabled={true} mode="outline">
                <FormattedMessage id="sign.button.confirm-ledger" />
                <i className="fa fa-spinner fa-spin fa-fw" />
              </Button>
            ) : (
              <div>
                <div
                  style={{
                    padding: 8,
                    backgroundColor: colors["neutral-surface-bg"],
                    margin: 16,
                    marginBottom: 8,
                    borderRadius: 12,
                  }}
                >
                  <Text>Switch to TRON</Text>
                </div>
                <div
                  style={{
                    flexDirection: "row",
                    display: "flex",
                    padding: 16,
                    paddingTop: 0,
                  }}
                >
                  <Button
                    containerStyle={{ marginRight: 8 }}
                    className={classnames(style.button, style.rejectBtn)}
                    // disabled={signDocHelper.signDocWrapper == null}
                    color={"reject"}
                    data-loading={signInteractionStore.isLoading}
                    disabled={signInteractionStore.isLoading}
                    onClick={async (e) => {
                      e.preventDefault();

                      await signInteractionStore.reject();
                      if (
                        interactionInfo.interaction &&
                        !interactionInfo.interactionInternal
                      ) {
                        window.close();
                      }
                    }}
                  >
                    {intl.formatMessage({
                      id: "sign.button.reject",
                    })}
                  </Button>
                  <Button
                    className={classnames(style.button, style.approveBtn)}
                    // disabled={approveIsDisabled}
                    data-loading={signInteractionStore.isLoading}
                    loading={signInteractionStore.isLoading}
                    onClick={async (e) => {
                      e.preventDefault();
                      await selectTronNetwork();
                    }}
                  >
                    {intl.formatMessage({
                      id: "sign.button.approve",
                    })}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      }
    </div>
  );
});

import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import style from "../style.module.scss";
import { observer } from "mobx-react-lite";
import classnames from "classnames";
import { FormattedMessage, useIntl } from "react-intl";
import { useStore } from "../../../stores";
import { SvmDataTab } from "./svm-data-tab";
import { SvmDetailsTab } from "./svm-details-tab";
import {
  useAmountConfig,
  useFeeConfig,
  useGasConfig,
  useInteractionInfo,
  useMemoConfig,
} from "@owallet/hooks";
import { useHistory } from "react-router";
import { ChainIdHelper } from "@owallet/cosmos";
import { DataModal } from "../modals/data-modal";
import useOnClickOutside from "../../../hooks/use-click-outside";
import colors from "../../../theme/colors";
import { Text } from "../../../components/common/text";
import { Address } from "../../../components/address";
import cn from "classnames/bind";
import { WalletStatus } from "@owallet/stores";
import { Button } from "../../../components/common/button";
import withErrorBoundary from "../hoc/withErrorBoundary";
import { deserializeTransaction } from "@owallet/common";

const cx = cn.bind(style);

enum Tab {
  Details,
  Data,
}

const SvmDetailsTabWithErrorBoundary = withErrorBoundary(SvmDetailsTab);

export const SignSvmPage: FunctionComponent = observer(() => {
  const intl = useIntl();
  const [tab, setTab] = useState<Tab>(Tab.Details);
  const {
    chainStore,
    keyRingStore,
    signInteractionStore,
    accountStore,
    queriesStore,
    priceStore,
  } = useStore();

  const history = useHistory();
  const interactionInfo = useInteractionInfo(() => {
    signInteractionStore.rejectAll();
  });

  const [dataSign, setDataSign] = useState(null);
  const [dataSetting, setDataSetting] = useState(false);
  const settingRef = useRef();
  const dataRef = useRef();

  useOnClickOutside(dataRef, () => {
    handleCloseDataModal();
  });

  const handleCloseDataModal = () => {
    setDataSetting(false);
    setTab(Tab.Details);
  };
  const data = signInteractionStore.waitingSvmData;
  useEffect(() => {
    return () => {
      signInteractionStore.reject();
    };
  }, []);

  console.log(data, "data");
  const chainId = data?.data?.chainId || chainStore.current.chainId;
  const accountInfo = accountStore.getAccount(chainId);
  const signer = accountInfo.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses,
    false
  );
  const isNoSetFee = !!accountInfo.isSendingMsg;
  const queries = queriesStore.get(chainId);
  const queryBalances = queries.queryBalances;
  const gasConfig = useGasConfig(chainStore, chainId);
  const amountConfig = useAmountConfig(
    chainStore,
    chainId,
    signer,
    queryBalances,
    queries.bitcoin.queryBitcoinBalance
  );
  const memoConfig = useMemoConfig(chainStore, chainId);
  const feeConfig = useFeeConfig(
    chainStore,
    chainId,
    signer,
    queryBalances,
    amountConfig,
    gasConfig,
    true,
    queries.bitcoin.queryBitcoinBalance,
    memoConfig
  );
  useEffect(() => {
    if (dataSign) return;
    if (signInteractionStore.waitingSvmData) {
      const data = signInteractionStore.waitingSvmData;
      console.log(data, "data");
      // // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // // @ts-ignore
      // const msgs = data.data.data?.msgs;
      //

      chainStore.selectChain(data.data.chainId);
      // const tx = deserializeTransaction(data.data.data.tx);
      // console.log(tx, "tx decode");
      // setDataSign(data);
      // if (msgs?.amount) {
      //   amountConfig.setAmount(`${satsToBtc(msgs?.amount)}`);
      // }
      // memoConfig.setMemo(msgs?.message);
    }
  }, [signInteractionStore.waitingSvmData]);
  const isLoaded = useMemo(() => {
    console.log(data, chainId, "data chainId");
    if (data?.data?.chainId) {
      return true;
    } else if (!data?.data?.chainId) {
      return false;
    }

    return (
      ChainIdHelper.parse(chainId).identifier ===
      ChainIdHelper.parse(chainStore.selectedChainId).identifier
    );
  }, [data, chainId, chainStore.selectedChainId]);
  console.log(isLoaded, "isLoaded");
  const approveIsDisabled = (() => {
    if (!isLoaded) {
      return true;
    }

    // if (!dataSign) {
    //     return true;
    // }
    if (!isNoSetFee) {
      return feeConfig.getError() != null;
    }
    return false;
  })();
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
          renderData={() => <SvmDataTab data={data?.data.data} />}
        />
      </div>
      {
        /*
                         Show the informations of tx when the sign data is delivered.
                         If sign data not delivered yet, show the spinner alternatively.
                         */
        isLoaded ? (
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
                {
                  <div
                    style={{
                      height: "40%",
                      overflow: "scroll",
                      backgroundColor: colors["neutral-surface-bg"],
                      borderRadius: 12,
                      padding: 8,
                      width: "90vw",
                    }}
                  >
                    {" "}
                    <SvmDataTab data={data} />
                  </div>
                }
                {/*{tab === Tab.Details && (*/}
                {/*  <SvmDetailsTabWithErrorBoundary*/}
                {/*    priceStore={priceStore}*/}
                {/*    feeConfig={feeConfig}*/}
                {/*    gasConfig={null}*/}
                {/*    intl={intl}*/}
                {/*    dataSign={data}*/}
                {/*    isNoSetFee={isNoSetFee}*/}
                {/*    signer={signer}*/}
                {/*  />*/}
                {/*)}*/}
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
                  <FormattedMessage id="sign.button.confirm-ledger" />{" "}
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
                          {" "}
                          <Address
                            maxCharacters={18}
                            lineBreakBeforePrefix={false}
                          >
                            {accountInfo.walletStatus === WalletStatus.Loaded &&
                            signer
                              ? signer
                              : "..."}
                          </Address>
                        </Text>
                      </div>
                    </div>
                    {/* <Text color={colors["neutral-text-body"]}>123</Text> */}
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
                      disabled={approveIsDisabled}
                      data-loading={signInteractionStore.isLoading}
                      loading={signInteractionStore.isLoading}
                      onClick={async (e) => {
                        e.preventDefault();

                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        //@ts-ignore
                        await signInteractionStore.approveSvmAndWaitEnd(
                          data.data.data
                        );
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
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <i className="fas fa-spinner fa-spin fa-2x text-gray" />
          </div>
        )
      }
    </div>
  );
});

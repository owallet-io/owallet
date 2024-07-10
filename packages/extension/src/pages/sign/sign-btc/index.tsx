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
import { BtcDataTab } from "./btc-data-tab";
import { BtcDetailsTab } from "./btc-details-tab";
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
import { Card } from "../../../components/common/card";
import colors from "../../../theme/colors";
import { Text } from "../../../components/common/text";
import { Address } from "../../../components/address";
import { ChainIdEnum, useLanguage } from "@owallet/common";
// eslint-disable-next-line @typescript-eslint/no-var-requires,import/no-extraneous-dependencies
const { BitcoinUnit } = require("bitcoin-units");
import cn from "classnames/bind";
import { WalletStatus } from "@owallet/stores";
import { Button } from "../../../components/common/button";

const cx = cn.bind(style);

enum Tab {
  Details,
  Data,
}

export const SignBtcPage: FunctionComponent = observer(() => {
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

  //TODO: Hard code for chainID with bitcoin;
  const chainId = ChainIdEnum.Bitcoin;
  const accountInfo = accountStore.getAccount(ChainIdEnum.Bitcoin);
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
  const satsToBtc = (amount: number) => {
    return new BitcoinUnit(amount, "satoshi").to("BTC").getValue();
  };
  useEffect(() => {
    if (dataSign) return;
    if (signInteractionStore.waitingBitcoinData) {
      const data = signInteractionStore.waitingBitcoinData;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const msgs = data.data.data?.msgs;

      chainStore.selectChain(data.data.chainId);
      setDataSign(data);
      if (msgs?.amount) {
        amountConfig.setAmount(`${satsToBtc(msgs?.amount)}`);
      }
      memoConfig.setMemo(msgs?.message);
    }
  }, [signInteractionStore.waitingBitcoinData]);
  const dataBalance =
    queries.bitcoin.queryBitcoinBalance.getQueryBalance(signer)?.response?.data;
  const utxos = dataBalance?.utxos;
  const confirmedBalance = dataBalance?.balance;
  const refreshBalance = async (address) => {
    try {
      await queries.bitcoin.queryBitcoinBalance
        .getQueryBalance(address)
        .waitFreshResponse();
    } catch (error) {
      console.log(
        "🚀 ~ file: send-btc.tsx:112 ~ refreshBalance ~ error:",
        error
      );
    }
  };
  useEffect(() => {
    if (signer) {
      refreshBalance(signer);
      return;
    }

    return () => {};
  }, [signer]);
  const isLoaded = useMemo(() => {
    if (!dataSign) {
      return false;
    }

    return (
      ChainIdHelper.parse(chainId).identifier ===
      ChainIdHelper.parse(chainStore.selectedChainId).identifier
    );
  }, [dataSign, chainId, chainStore.selectedChainId]);
  const approveIsDisabled = (() => {
    if (!isLoaded) {
      return true;
    }

    if (!dataSign) {
      return true;
    }
    if (!isNoSetFee) {
      return feeConfig.getError() != null;
    }
    return false;
  })();
  const dataChanged = dataSign && {
    ...dataSign,
    data: {
      ...dataSign.data,
      data: {
        ...dataSign.data.data,
        fee: {
          ...dataSign.data.data.fee,
          amount: [
            {
              denom: "btc",
              amount: Number(feeConfig.fee?.toCoin()?.amount),
            },
          ],
        },
        msgs: {
          ...dataSign.data.data.msgs,
          totalFee: Number(feeConfig.fee?.toCoin()?.amount),
          feeRate: feeConfig?.feeRate[feeConfig?.feeType ?? "average"],
          confirmedBalance,
        },
        confirmedBalance,
        utxos,
        feeRate: feeConfig?.feeRate[feeConfig?.feeType ?? "average"],
      },
    },
  };
  const lastestData = isNoSetFee ? dataSign : dataChanged;
  return (
    <div
      style={{
        height: "100%",
        width: "100vw",
        overflowX: "auto",
      }}
    >
      {/* <div className={cx("setting", openSetting ? "activeSetting" : "", "modal")} ref={settingRef}>
        <FeeModal onClose={() => setOpenSetting(false)} feeConfig={feeConfig} gasConfig={gasConfig} />
      </div> */}
      <div
        className={cx("setting", dataSetting ? "activeSetting" : "", "modal")}
        ref={dataRef}
      >
        <DataModal
          onClose={() => {
            handleCloseDataModal();
          }}
          renderData={() => <BtcDataTab data={lastestData} />}
        />
      </div>
      {
        /*
         Show the informations of tx when the sign data is delivered.
         If sign data not delivered yet, show the spinner alternatively.
         */
        isLoaded ? (
          <div className={style.container}>
            <div style={{ height: "75%", overflow: "scroll", padding: 16 }}>
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
                {tab === Tab.Data && <BtcDataTab data={lastestData} />}
                {tab === Tab.Details && (
                  <BtcDetailsTab
                    priceStore={priceStore}
                    feeConfig={feeConfig}
                    gasConfig={gasConfig}
                    intl={intl}
                    dataSign={lastestData}
                    isNoSetFee={isNoSetFee}
                    signer={signer}
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
                        await signInteractionStore.approveBitcoinAndWaitEnd({
                          ...lastestData.data.data,
                        });

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

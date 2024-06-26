import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import style from "./style.module.scss";
import { useStore } from "../../stores";
import classnames from "classnames";
import { FormattedMessage, useIntl } from "react-intl";
import { useHistory } from "react-router";
import { observer } from "mobx-react-lite";
import {
  useInteractionInfo,
  useGasEvmConfig,
  useMemoConfig,
  useAmountConfig,
  useFeeEvmConfig,
} from "@owallet/hooks";
import { ChainIdHelper } from "@owallet/cosmos";
import Web3 from "web3";
import { DetailsTabEvm } from "./details-tab-evm";
import { DataTabEvm } from "./data-tab-evm";
import { Dec, Int } from "@owallet/unit";
import { Text } from "../../components/common/text";
import { Address } from "../../components/address";
import colors from "../../theme/colors";
import { FeeModal } from "./modals/fee-modal";
import { WalletStatus } from "@owallet/stores";
import { DataModal } from "./modals/data-modal";
import useOnClickOutside from "../../hooks/use-click-outside";
import cn from "classnames/bind";
import { Button } from "../../components/common/button";

enum Tab {
  Details,
  Data,
}

const cx = cn.bind(style);

export const SignEvmPage: FunctionComponent = observer(() => {
  const history = useHistory();

  const [tab, setTab] = useState<Tab>(Tab.Details);
  const [dataSign, setDataSign] = useState(null);
  const [openSetting, setOpenSetting] = useState(false);
  const [dataSetting, setDataSetting] = useState(false);

  const settingRef = useRef();
  const dataRef = useRef();

  const intl = useIntl();

  useEffect(() => {
    return () => {
      signInteractionStore.reject();
    };
  }, []);

  const {
    chainStore,
    keyRingStore,
    signInteractionStore,
    accountStore,
    queriesStore,
  } = useStore();

  const current = chainStore.current;

  const account = accountStore.getAccount(current.chainId);
  const signer = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses,
    false
  );

  // Make the gas config with 1 gas initially to prevent the temporary 0 gas error at the beginning.
  const gasConfig = useGasEvmConfig(chainStore, current.chainId, 1);
  const { gasPrice } = queriesStore
    .get(current.chainId)
    .evm.queryGasPrice.getGasPrice();
  const amountConfig = useAmountConfig(
    chainStore,
    current.chainId,
    signer,
    queriesStore.get(current.chainId).queryBalances,
    null
  );

  const memoConfig = useMemoConfig(chainStore, current.chainId);
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const addressDisplay = accountInfo.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
  );

  const feeConfig = useFeeEvmConfig(
    chainStore,
    current.chainId,
    signer,
    queriesStore.get(current.chainId).queryBalances,
    amountConfig,
    gasConfig,
    true,
    queriesStore.get(current.chainId),
    memoConfig
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const needSetIsProcessing = !!account.isSendingMsg;

  const preferNoSetFee = !!account.isSendingMsg || isProcessing;
  const preferNoSetMemo = !!account.isSendingMsg || isProcessing;

  const interactionInfo = useInteractionInfo(() => {
    if (needSetIsProcessing) {
      setIsProcessing(true);
    }
    signInteractionStore.rejectAll();
  });
  useEffect(() => {
    if (!needSetIsProcessing) {
      if (!gasPrice) return;
      gasConfig.setGasPriceStep(gasPrice);
    }

    return () => {};
  }, [gasPrice, amountConfig?.sendCurrency]);

  useOnClickOutside(settingRef, () => {
    setOpenSetting(false);
  });

  useOnClickOutside(dataRef, () => {
    handleCloseDataModal();
  });

  const handleCloseDataModal = () => {
    setDataSetting(false);
    setTab(Tab.Details);
  };

  useEffect(() => {
    console.log(
      "signInteractionStore.waitingEthereumData 2",
      signInteractionStore.waitingEthereumData
    );

    if (signInteractionStore.waitingEthereumData) {
      const data = signInteractionStore.waitingEthereumData;
      //@ts-ignore
      const gasDataSign = data?.data?.data?.data?.gas;
      //@ts-ignore
      const gasPriceDataSign = data?.data?.data?.data?.gasPrice;
      chainStore.selectChain(data.data.chainId);
      gasConfig.setGas(Web3.utils.hexToNumber(gasDataSign));
      gasConfig.setGasPrice(Web3.utils.hexToNumberString(gasPriceDataSign));

      const gas = new Dec(new Int(Web3.utils.hexToNumberString(gasDataSign)));
      const gasPrice = new Dec(
        new Int(Web3.utils.hexToNumberString(gasPriceDataSign))
      );
      const feeAmount = gasPrice.mul(gas);
      if (feeAmount.lte(new Dec(0))) {
        feeConfig.setFeeType("average");
      } else {
        feeConfig.setManualFee({
          amount: feeAmount.roundUp().toString(),
          denom: chainStore.current.feeCurrencies[0].coinMinimalDenom,
        });
      }

      setDataSign(signInteractionStore.waitingEthereumData);
    }
  }, [signInteractionStore.waitingEthereumData]);
  // Check that the request is delivered
  // and the chain is selected properly.
  // The chain store loads the saved chain infos including the suggested chain asynchronously on init.
  // So, it can be different the current chain and the expected selected chain for a moment.
  const isLoaded = useMemo(() => {
    return (
      ChainIdHelper.parse(chainStore.current.chainId).identifier ===
      ChainIdHelper.parse(chainStore.selectedChainId).identifier
    );
  }, [chainStore.current.chainId, chainStore.selectedChainId]);

  const approveIsDisabled = (() => {
    if (!isLoaded) {
      return true;
    }
    return feeConfig.getError() != null || gasConfig.getError() != null;
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
        className={cx("setting", openSetting ? "activeSetting" : "", "modal")}
        ref={settingRef}
      >
        <FeeModal
          onClose={() => setOpenSetting(false)}
          feeConfig={feeConfig}
          gasConfig={gasConfig}
        />
      </div>
      <div
        className={cx("setting", dataSetting ? "activeSetting" : "", "modal")}
        ref={dataRef}
      >
        <DataModal
          onClose={() => {
            handleCloseDataModal();
          }}
          renderData={() => <DataTabEvm data={dataSign} />}
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
                  <img
                    src={require("../../public/assets/icon/tdesign_chevron-right.svg")}
                  />
                </div>
              </div>
              <div
                className={classnames(style.tabContainer, {
                  [style.dataTab]: tab === Tab.Data,
                })}
              >
                {tab === Tab.Data ? <DataTabEvm data={dataSign} /> : null}
                {tab === Tab.Details ? (
                  <DetailsTabEvm
                    msgSign={dataSign?.data?.data?.data}
                    dataSign={dataSign}
                    memoConfig={memoConfig}
                    feeConfig={feeConfig}
                    gasConfig={gasConfig}
                    isInternal={
                      interactionInfo.interaction &&
                      interactionInfo.interactionInternal
                    }
                    preferNoSetFee={preferNoSetFee}
                    preferNoSetMemo={preferNoSetMemo}
                    setOpenSetting={() => setOpenSetting(true)}
                  />
                ) : null}
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
                        src={require("../../public/assets/images/default-avatar.png")}
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
                            addressDisplay
                              ? addressDisplay
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
                      // disabled={signDocHelper.signDocWrapper == null}
                      color={"danger"}
                      data-loading={signInteractionStore.isLoading}
                      disabled={signInteractionStore.isLoading}
                      onClick={async (e) => {
                        e.preventDefault();

                        if (needSetIsProcessing) {
                          setIsProcessing(true);
                        }

                        await signInteractionStore.reject();

                        if (
                          interactionInfo.interaction &&
                          !interactionInfo.interactionInternal
                        ) {
                          window.close();
                        } else {
                          history.goBack();
                        }
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
                        if (needSetIsProcessing) {
                          setIsProcessing(true);
                        }
                        if (!dataSign) return;
                        await signInteractionStore.approveEthereumAndWaitEnd({
                          gasPrice: Web3.utils.toHex(gasConfig.gasPrice),
                          gasLimit: Web3.utils.toHex(
                            Math.round(gasConfig.gas * 1.1)
                          ),
                        });
                        history.goBack();
                        if (
                          interactionInfo.interaction &&
                          !interactionInfo.interactionInternal
                        ) {
                          window.close();
                        }
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

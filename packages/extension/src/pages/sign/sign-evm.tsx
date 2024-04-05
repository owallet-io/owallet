import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { Button } from "reactstrap";

import { HeaderLayout } from "../../layouts";

import style from "./style.module.scss";

import { useStore } from "../../stores";

import classnames from "classnames";
import { DataTab } from "./data-tab";
import { DetailsTab } from "./details-tab";
import { FormattedMessage, useIntl } from "react-intl";

import { useHistory } from "react-router";
import { observer } from "mobx-react-lite";
import {
  useInteractionInfo,
  // useSignDocHelper,
  useGasEvmConfig,
  useFeeConfig,
  useMemoConfig,
  useSignDocAmountConfig,
  useAmountConfig,
  useFeeEvmConfig,
} from "@owallet/hooks";
import { ADR36SignDocDetailsTab } from "./adr-36";
import { ChainIdHelper } from "@owallet/cosmos";
import Web3 from "web3";
import { DetailsTabEvm } from "./details-tab-evm";
import { DataTabEvm } from "./data-tab-evm";
import { Dec, Int } from "@owallet/unit";

enum Tab {
  Details,
  Data,
}

export const SignEvmPage: FunctionComponent = observer(() => {
  const history = useHistory();

  const [tab, setTab] = useState<Tab>(Tab.Details);
  const [dataSign, setDataSign] = useState(null);

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
  useEffect(() => {
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
    // <HeaderLayout
    //   showChainName={alternativeTitle == null}
    //   alternativeTitle={alternativeTitle != null ? alternativeTitle : undefined}
    //   canChangeChainInfo={false}
    //   onBackButton={
    //     interactionInfo.interactionInternal
    //       ? () => {
    //           history.goBack();
    //         }
    //       : undefined
    //   }
    // >
    <div
      style={{
        padding: 20,
        backgroundColor: "#FFFFFF",
        height: "100%",
        overflowX: "auto",
      }}
    >
      {
        /*
         Show the informations of tx when the sign data is delivered.
         If sign data not delivered yet, show the spinner alternatively.
         */
        isLoaded ? (
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
              {chainStore?.current?.raw?.chainName}
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
              {tab === Tab.Data ? <DataTabEvm data={dataSign} /> : null}
              {tab === Tab.Details ? (
                <DetailsTabEvm
                  msgSign={dataSign?.data?.data?.data}
                  memoConfig={memoConfig}
                  feeConfig={feeConfig}
                  gasConfig={gasConfig}
                  isInternal={
                    interactionInfo.interaction &&
                    interactionInfo.interactionInternal
                  }
                  preferNoSetFee={preferNoSetFee}
                  preferNoSetMemo={preferNoSetMemo}
                />
              ) : null}
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
                <React.Fragment>
                  <Button
                    className={classnames(style.button, style.rejectBtn)}
                    color=""
                    // disabled={signDocHelper.signDocWrapper == null}
                    // data-loading={signInteractionStore.isLoading}
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
                    color=""
                    disabled={approveIsDisabled}
                    data-loading={signInteractionStore.isLoading}
                    onClick={async (e) => {
                      e.preventDefault();
                      if (needSetIsProcessing) {
                        setIsProcessing(true);
                      }
                      if (!dataSign) return;
                      await signInteractionStore.approveEthereumAndWaitEnd({
                        gasPrice: Web3.utils.toHex(gasConfig.gasPrice),
                        gasLimit: Web3.utils.toHex(gasConfig.gas),
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
                </React.Fragment>
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
      {/* </HeaderLayout> */}
    </div>
  );
});

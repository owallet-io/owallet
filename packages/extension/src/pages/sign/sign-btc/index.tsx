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
import { Button } from "reactstrap";
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
// eslint-disable-next-line @typescript-eslint/no-var-requires,import/no-extraneous-dependencies
const { BitcoinUnit } = require("bitcoin-units");

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
  //TODO: Hard code for chainID with bitcoin;
  const chainId = "bitcoin";
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
        padding: 20,
        backgroundColor: "#FFFFFF",
        height: "100%",
        overflowX: "auto",
      }}
    >
      {isLoaded ? (
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
            Bitcoin Network
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
            {tab === Tab.Data && <BtcDataTab data={lastestData} />}
            {tab === Tab.Details && (
              <BtcDetailsTab
                priceStore={priceStore}
                feeConfig={feeConfig}
                gasConfig={gasConfig}
                intl={intl}
                dataSign={lastestData}
                isNoSetFee={isNoSetFee}
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
                  disabled={approveIsDisabled}
                  data-loading={signInteractionStore.isLoading}
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
              </>
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
      )}
    </div>
  );
});

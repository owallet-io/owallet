//@ts-nocheck
import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import style from "./style.module.scss";
import { useStore } from "../../stores";
import { Buffer } from "buffer/";
import classnames from "classnames";
import { DataTab } from "./data-tab";
import { DetailsTab } from "./details-tab";
import { FormattedMessage, useIntl } from "react-intl";
import cn from "classnames/bind";
import { useHistory } from "react-router";
import { observer } from "mobx-react-lite";
import {
  useInteractionInfo,
  useSignDocHelper,
  useGasConfig,
  useFeeConfig,
  useMemoConfig,
  useSignDocAmountConfig,
} from "@owallet/hooks";
import { ADR36SignDocDetailsTab } from "./adr-36";
import { ChainIdHelper } from "@owallet/cosmos";
import useOnClickOutside from "../../hooks/use-click-outside";
import colors from "../../theme/colors";
import { FeeModal } from "./modals/fee-modal";
import { Button } from "../../components/common/button";
import { Text } from "../../components/common/text";
import { DataModal } from "./modals/data-modal";
import { WalletStatus } from "@owallet/stores";
import { Address } from "../../components/address";

enum Tab {
  Details,
  Data,
}
const cx = cn.bind(style);

const RenderTab: FunctionComponent = observer(
  ({
    signDocHelper,
    tab,
    isADR36WithString,
    signDocJsonAll,
    memoConfig,
    feeConfig,
    gasConfig,
    interactionInfo,
    preferNoSetFee,
    preferNoSetMemo,
    setOpenSetting,
  }) => {
    return (
      <div
        className={classnames(style.tabContainer, {
          [style.dataTab]: tab === Tab.Data,
        })}
      >
        {/* {tab === Tab.Data ? <DataTab signDocHelper={signDocHelper} /> : null} */}
        {tab === Tab.Details ? (
          signDocHelper.signDocWrapper?.isADR36SignDoc ? (
            <ADR36SignDocDetailsTab
              signDocWrapper={signDocHelper.signDocWrapper}
              isADR36WithString={isADR36WithString}
              origin={origin}
            />
          ) : (
            <DetailsTab
              signDocHelper={signDocHelper}
              signDocJsonAll={signDocJsonAll}
              memoConfig={memoConfig}
              feeConfig={feeConfig}
              gasConfig={gasConfig}
              isInternal={
                interactionInfo.interaction &&
                interactionInfo.interactionInternal
              }
              preferNoSetFee={preferNoSetFee}
              preferNoSetMemo={preferNoSetMemo}
              setOpenSetting={setOpenSetting}
            />
          )
        ) : null}
      </div>
    );
  }
);

export const SignPage: FunctionComponent = observer(() => {
  const history = useHistory();

  const [tab, setTab] = useState<Tab>(Tab.Details);

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
    priceStore,
  } = useStore();

  const [signer, setSigner] = useState("");
  const [origin, setOrigin] = useState<string | undefined>();
  const [isADR36WithString, setIsADR36WithString] = useState<
    boolean | undefined
  >();
  const [openSetting, setOpenSetting] = useState(false);
  const [dataSetting, setDataSetting] = useState(false);

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const addressDisplay = accountInfo.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
  );

  const current = chainStore.current;
  // Make the gas config with 1 gas initially to prevent the temporary 0 gas error at the beginning.
  const gasConfig = useGasConfig(chainStore, current.chainId, 1);
  const amountConfig = useSignDocAmountConfig(
    chainStore,
    current.chainId,
    accountStore.getAccount(current.chainId).msgOpts,
    signer
  );
  const feeConfig = useFeeConfig(
    chainStore,
    current.chainId,
    signer,
    queriesStore.get(current.chainId).queryBalances,
    amountConfig,
    gasConfig
  );
  const memoConfig = useMemoConfig(chainStore, current.chainId);

  const signDocHelper = useSignDocHelper(feeConfig, memoConfig);
  amountConfig.setSignDocHelper(signDocHelper);
  const settingRef = useRef();
  const dataRef = useRef();
  useEffect(() => {
    if (signInteractionStore.waitingData) {
      const data = signInteractionStore.waitingData;
      chainStore.selectChain(data.data.chainId);
      if (data.data.signDocWrapper.isADR36SignDoc) {
        setIsADR36WithString(data.data.isADR36WithString);
      }
      setOrigin(data.data.msgOrigin);
      if (
        !data.data.signDocWrapper.isADR36SignDoc &&
        data.data.chainId !== data.data.signDocWrapper.chainId
      ) {
        // Validate the requested chain id and the chain id in the sign doc are same.
        // If the sign doc is for ADR-36, there is no chain id in the sign doc, so no need to validate.
        throw new Error("Chain id unmatched");
      }
      signDocHelper.setSignDocWrapper(data.data.signDocWrapper);
      gasConfig.setGas(data.data.signDocWrapper.gas);
      memoConfig.setMemo(data.data.signDocWrapper.memo);
      if (
        data.data.signOptions.preferNoSetFee &&
        data.data.signDocWrapper.fees[0]
      ) {
        feeConfig.setManualFee(data.data.signDocWrapper.fees[0]);
      }
      amountConfig.setDisableBalanceCheck(
        !!data.data.signOptions.disableBalanceCheck
      );
      feeConfig.setDisableBalanceCheck(
        !!data.data.signOptions.disableBalanceCheck
      );
      // We can't check the fee balance if the payer is not the signer.
      if (
        data.data.signDocWrapper.payer &&
        data.data.signDocWrapper.payer !== data.data.signer
      ) {
        feeConfig.setDisableBalanceCheck(true);
      }
      // We can't check the fee balance if the granter is not the signer.
      if (
        data.data.signDocWrapper.granter &&
        data.data.signDocWrapper.granter !== data.data.signer
      ) {
        feeConfig.setDisableBalanceCheck(true);
      }
      setSigner(data.data.signer);
    }
  }, [
    amountConfig,
    chainStore,
    gasConfig,
    memoConfig,
    feeConfig,
    signDocHelper,
    signInteractionStore.waitingData,
  ]);

  // If the preferNoSetFee or preferNoSetMemo in sign options is true,
  // don't show the fee buttons/memo input by default
  // But, the sign options would be removed right after the users click the approve/reject button.
  // Thus, without this state, the fee buttons/memo input would be shown after clicking the approve buttion.
  const [isProcessing, setIsProcessing] = useState(false);
  const needSetIsProcessing =
    signInteractionStore.waitingData?.data.signOptions.preferNoSetFee ===
      true ||
    signInteractionStore.waitingData?.data.signOptions.preferNoSetMemo === true;

  const preferNoSetFee =
    signInteractionStore.waitingData?.data.signOptions.preferNoSetFee ===
      true || isProcessing;
  const preferNoSetMemo =
    signInteractionStore.waitingData?.data.signOptions.preferNoSetMemo ===
      true || isProcessing;

  const interactionInfo = useInteractionInfo(() => {
    if (needSetIsProcessing) {
      setIsProcessing(true);
    }
    signInteractionStore.rejectAll();
  });

  // Check that the request is delivered
  // and the chain is selected properly.
  // The chain store loads the saved chain infos including the suggested chain asynchronously on init.
  // So, it can be different the current chain and the expected selected chain for a moment.
  const isLoaded = useMemo(() => {
    if (!signDocHelper.signDocWrapper) {
      return false;
    }

    return (
      ChainIdHelper.parse(chainStore.current.chainId).identifier ===
      ChainIdHelper.parse(chainStore.selectedChainId).identifier
    );
  }, [
    signDocHelper.signDocWrapper,
    chainStore.current.chainId,
    chainStore.selectedChainId,
  ]);

  // If this is undefined, show the chain name on the header.
  // If not, show the alternative title.
  const alternativeTitle = (() => {
    if (!isLoaded) {
      return "";
    }

    if (
      signDocHelper.signDocWrapper &&
      signDocHelper.signDocWrapper.isADR36SignDoc
    ) {
      return "Prove Ownership";
    }

    return undefined;
  })();

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

  const approveIsDisabled = (() => {
    if (!isLoaded) {
      return true;
    }

    if (!signDocHelper.signDocWrapper) {
      return true;
    }

    // If the sign doc is for ADR-36,
    // there is no error related to the fee or memo...
    if (signDocHelper.signDocWrapper.isADR36SignDoc) {
      return false;
    }

    return memoConfig.getError() != null || feeConfig.getError() != null;
  })();

  const { signDocJson } = signDocHelper;

  const messages =
    signDocJson?.txBody?.messages &&
    signDocJson.txBody.messages.map((mess) => {
      return {
        ...mess,
        msg: mess?.msg ? Buffer.from(mess?.msg).toString("base64") : "",
      };
    });
  const signDocJsonAll = messages
    ? {
        ...signDocJson,
        txBody: {
          messages,
        },
      }
    : signDocJson;

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
          renderData={() => <DataTab signDocJsonAll={signDocJsonAll} />}
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
              <RenderTab
                signDocHelper={signDocHelper}
                tab={tab}
                isADR36WithString={isADR36WithString}
                signDocJsonAll={signDocJsonAll}
                memoConfig={memoConfig}
                feeConfig={feeConfig}
                gasConfig={gasConfig}
                interactionInfo={interactionInfo}
                preferNoSetFee={preferNoSetFee}
                preferNoSetMemo={preferNoSetMemo}
                setOpenSetting
              />
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
                      // disabled={approveIsDisabled}
                      data-loading={signInteractionStore.isLoading}
                      loading={signInteractionStore.isLoading}
                      onClick={async (e) => {
                        e.preventDefault();

                        if (needSetIsProcessing) {
                          setIsProcessing(true);
                        }

                        if (signDocHelper.signDocWrapper) {
                          await signInteractionStore.approveAndWaitEnd(
                            signDocHelper.signDocWrapper
                          );
                        }

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
      {/* </HeaderLayout> */}
    </div>
  );
});

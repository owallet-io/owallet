import React, { FunctionComponent, useEffect, useState } from "react";
import { SignInteractionStore } from "@owallet/stores-core";
import { Box } from "../../../../components/box";
import { Column, Columns } from "../../../../components/column";
import { XAxis } from "../../../../components/axis";
import { H5, Subtitle3 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { ViewDataButton } from "../../components/view-data-button";
import { MessageItem } from "../../components/message-item";
import { MemoInput } from "../../../../components/input/memo-input";
import { observer } from "mobx-react-lite";
import {
  useFeeConfig,
  useMemoConfig,
  useSenderConfig,
  useSignDocAmountConfig,
  useSignDocHelper,
  useTxConfigsValidate,
  useZeroAllowedGasConfig,
} from "@owallet/hooks";
import { useStore } from "../../../../stores";
import { unescapeHTML } from "@owallet/common";
import { CoinPretty, Dec, Int } from "@owallet/unit";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { useInteractionInfo } from "../../../../hooks";
import { defaultRegistry } from "../../components/messages/registry";
import { useUnmount } from "../../../../hooks/use-unmount";
import { handleCosmosPreSign } from "../../utils/handle-cosmos-sign";
import { OWalletError } from "@owallet/router";
import { ErrModuleLedgerSign } from "../../utils/ledger-types";
import { LedgerGuideBox } from "../../components/ledger-guide-box";
import { Gutter } from "../../../../components/gutter";
import { GuideBox } from "../../../../components/guide-box";
import { FormattedMessage, useIntl } from "react-intl";
import SimpleBar from "simplebar-react";
import { KeyRingService } from "@owallet/background";
import { useTheme } from "styled-components";
import { defaultProtoCodec } from "@owallet/cosmos";
import { MsgGrant } from "@owallet/proto-types/cosmos/authz/v1beta1/tx";
import { GenericAuthorization } from "@owallet/stores/build/query/cosmos/authz/types";
import { Checkbox } from "../../../../components/checkbox";
import { FeeSummary } from "../../components/fee-summary";
import { FeeControl } from "../../../../components/input/fee-control";
import { HighFeeWarning } from "../../components/high-fee-warning";
import { handleExternalInteractionWithNoProceedNext } from "../../../../utils";
import { useNavigate } from "react-router-dom";
import { ApproveIcon, CancelIcon } from "../../../../components/button";
import Color from "color";
import styled from "styled-components";

const Styles = {
  Container: styled.div<{
    forChange: boolean | undefined;
    isError: boolean;
    disabled?: boolean;
    isNotReady?: boolean;
  }>`
    background-color: ${(props) =>
      props.theme.mode === "light"
        ? props.isNotReady
          ? ColorPalette["skeleton-layer-0"]
          : ColorPalette.white
        : ColorPalette["gray-650"]};
    padding ${({ forChange }) =>
      forChange ? "0.5rem 0.25rem 0.35rem 0.75rem" : "0.75rem 0.5rem"};
    border-radius: 1rem;
    
    border: ${({ isError }) =>
      isError
        ? `1.5px solid ${Color(ColorPalette["yellow-400"])
            .alpha(0.5)
            .toString()}`
        : undefined};

    box-shadow: ${(props) =>
      props.theme.mode === "light" && !props.isNotReady
        ? "0px 2px 6px 0px rgba(43, 39, 55, 0.10)"
        : "none"};;
    
  `,
};

export const CosmosTxView: FunctionComponent<{
  interactionData: NonNullable<SignInteractionStore["waitingData"]>;
}> = observer(({ interactionData }) => {
  const {
    chainStore,
    queriesStore,
    signInteractionStore,
    uiConfigStore,
    priceStore,
  } = useStore();

  const intl = useIntl();
  const theme = useTheme();
  const navigate = useNavigate();

  const [isViewData, setIsViewData] = useState(false);

  const chainId = interactionData.data.chainId;
  const signer = interactionData.data.signer;

  const senderConfig = useSenderConfig(chainStore, chainId, signer);
  // There are services that sometimes use invalid tx to sign arbitrary data on the sign page.
  // In this case, there is no obligation to deal with it, but 0 gas is favorably allowed.
  const gasConfig = useZeroAllowedGasConfig(chainStore, chainId, 0);
  const amountConfig = useSignDocAmountConfig(
    chainStore,
    chainId,
    senderConfig
  );
  const feeConfig = useFeeConfig(
    chainStore,
    queriesStore,
    chainId,
    senderConfig,
    amountConfig,
    gasConfig
  );
  const memoConfig = useMemoConfig(chainStore, chainId);

  const signDocHelper = useSignDocHelper(feeConfig, memoConfig);
  amountConfig.setSignDocHelper(signDocHelper);

  useEffect(() => {
    const data = interactionData;
    if (data.data.chainId !== data.data.signDocWrapper.chainId) {
      // Validate the requested chain id and the chain id in the sign doc are same.
      throw new Error("Chain id unmatched");
    }
    signDocHelper.setSignDocWrapper(data.data.signDocWrapper);
    gasConfig.setValue(data.data.signDocWrapper.gas);
    let memo = data.data.signDocWrapper.memo;
    if (data.data.signDocWrapper.mode === "amino") {
      // For amino-json sign doc, the memo is escaped by default behavior of golang's json marshaller.
      // For normal users, show the escaped characters with unescaped form.
      // Make sure that the actual sign doc's memo should be escaped.
      // In this logic, memo should be escaped from account store or background's request signing function.
      memo = unescapeHTML(memo);
    }
    memoConfig.setValue(memo);
    if (
      data.data.signOptions.preferNoSetFee ||
      data.data.signDocWrapper.fees.length >= 2
    ) {
      feeConfig.setFee(
        data.data.signDocWrapper.fees.map((fee) => {
          const currency = chainStore
            .getChain(data.data.chainId)
            .forceFindCurrency(fee.denom);
          return new CoinPretty(currency, new Int(fee.amount));
        })
      );
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
  }, [
    amountConfig,
    chainStore,
    feeConfig,
    gasConfig,
    interactionData,
    intl,
    memoConfig,
    signDocHelper,
  ]);

  const msgs = signDocHelper.signDocWrapper
    ? signDocHelper.signDocWrapper.mode === "amino"
      ? signDocHelper.signDocWrapper.aminoSignDoc.msgs
      : signDocHelper.signDocWrapper.protoSignDoc.txMsgs
    : [];
  const [isSendAuthzGrant, setIsSendAuthzGrant] = useState(false);
  useEffect(() => {
    try {
      if (
        interactionData.data.origin === "https://liker.land" ||
        interactionData.data.origin === "https://app.like.co"
      ) {
        return;
      }

      const msgs = signDocHelper.signDocWrapper
        ? signDocHelper.signDocWrapper.mode === "amino"
          ? signDocHelper.signDocWrapper.aminoSignDoc.msgs
          : signDocHelper.signDocWrapper.protoSignDoc.txMsgs
        : [];

      for (const msg of msgs) {
        const anyMsg = msg as any;
        if (anyMsg.type == null && anyMsg.grant && anyMsg.grant.authorization) {
          // cosmos-sdk has bug that amino codec is not applied to authorization properly.
          // This is the workaround for this bug.
          if (anyMsg.grant.authorization.msg) {
            const innerType = anyMsg.grant.authorization.msg;
            if (
              innerType === "/cosmos.bank.v1beta1.MsgSend" ||
              innerType === "/cosmos.bank.v1beta1.MsgMultiSend" ||
              innerType === "/ibc.applications.transfer.v1.MsgTransfer" ||
              innerType === "/cosmos.authz.v1beta1.MsgGrant" ||
              innerType === "/cosmos.staking.v1beta1.MsgTokenizeShares" ||
              innerType === "/cosmos.staking.v1beta1.MsgEnableTokenizeShares"
            ) {
              setIsSendAuthzGrant(true);
              return;
            }
          } else if (anyMsg.grant.authorization.spend_limit) {
            setIsSendAuthzGrant(true);
            return;
          }
        } else if ("type" in msg) {
          if (msg.type === "cosmos-sdk/MsgGrant") {
            if (
              msg.value.grant.authorization.type ===
              "cosmos-sdk/GenericAuthorization"
            ) {
              const innerType = msg.value.grant.authorization.value.msg;
              if (
                innerType === "/cosmos.bank.v1beta1.MsgSend" ||
                innerType === "/cosmos.bank.v1beta1.MsgMultiSend" ||
                innerType === "/ibc.applications.transfer.v1.MsgTransfer" ||
                innerType === "/cosmos.authz.v1beta1.MsgGrant" ||
                innerType === "/cosmos.staking.v1beta1.MsgTokenizeShares" ||
                innerType === "/cosmos.staking.v1beta1.MsgEnableTokenizeShares"
              ) {
                setIsSendAuthzGrant(true);
                return;
              }
            } else if (
              msg.value.grant.authorization.type ===
              "cosmos-sdk/SendAuthorization"
            ) {
              setIsSendAuthzGrant(true);
              return;
            }
          }
        } else if ("unpacked" in msg) {
          if (msg.typeUrl === "/cosmos.authz.v1beta1.MsgGrant") {
            const grantMsg = msg.unpacked as MsgGrant;
            if (grantMsg.grant && grantMsg.grant.authorization) {
              if (
                grantMsg.grant.authorization.typeUrl ===
                "/cosmos.authz.v1beta1.GenericAuthorization"
              ) {
                const factory = defaultProtoCodec.unpackAnyFactory(
                  grantMsg.grant.authorization.typeUrl
                );
                if (factory) {
                  const genericAuth = factory.decode(
                    grantMsg.grant.authorization.value
                  ) as GenericAuthorization;

                  if (
                    genericAuth.msg === "/cosmos.bank.v1beta1.MsgSend" ||
                    genericAuth.msg === "/cosmos.bank.v1beta1.MsgMultiSend" ||
                    genericAuth.msg ===
                      "/ibc.applications.transfer.v1.MsgTransfer" ||
                    genericAuth.msg === "/cosmos.authz.v1beta1.MsgGrant" ||
                    genericAuth.msg ===
                      "/cosmos.staking.v1beta1.MsgTokenizeShares" ||
                    genericAuth.msg ===
                      "/cosmos.staking.v1beta1.MsgEnableTokenizeShares"
                  ) {
                    setIsSendAuthzGrant(true);
                    return;
                  }
                }
              } else if (
                grantMsg.grant.authorization.typeUrl ===
                "/cosmos.bank.v1beta1.SendAuthorization"
              ) {
                setIsSendAuthzGrant(true);
                return;
              }
            }
          }
        }
      }
    } catch (e) {
      console.log("Failed to check during authz grant send check", e);
    }

    setIsSendAuthzGrant(false);
  }, [interactionData.data.origin, signDocHelper.signDocWrapper]);
  const [isSendAuthzGrantChecked, setIsSendAuthzGrantChecked] = useState(false);

  const txConfigsValidate = useTxConfigsValidate({
    senderConfig,
    gasConfig,
    amountConfig,
    feeConfig,
    memoConfig,
  });

  const preferNoSetFee = (() => {
    if (interactionData.data.signDocWrapper.fees.length >= 2) {
      return true;
    }

    return interactionData.data.signOptions.preferNoSetFee;
  })();

  const preferNoSetMemo = interactionData.data.signOptions.preferNoSetMemo;

  const interactionInfo = useInteractionInfo({
    onUnmount: async () => {
      signInteractionStore.rejectWithProceedNext(interactionData.id, () => {});
    },
  });

  const [unmountPromise] = useState(() => {
    let resolver: () => void;
    const promise = new Promise<void>((resolve) => {
      resolver = resolve;
    });

    return {
      promise,
      resolver: resolver!,
    };
  });

  useUnmount(() => {
    unmountPromise.resolver();
  });

  const isLedgerAndDirect =
    interactionData.data.keyType === "ledger" &&
    interactionData.data.mode === "direct";

  const [isLedgerInteracting, setIsLedgerInteracting] = useState(false);
  const [ledgerInteractingError, setLedgerInteractingError] = useState<
    Error | undefined
  >(undefined);

  const isHighFee = (() => {
    if (feeConfig.fees) {
      let sumPrice = new Dec(0);
      for (const fee of feeConfig.fees) {
        const currency = chainStore
          .getChain(chainId)
          .findCurrency(fee.currency.coinMinimalDenom);
        if (currency && currency.coinGeckoId) {
          const price = priceStore.calculatePrice(
            new CoinPretty(currency, fee.toCoin().amount),
            "usd"
          );
          if (price) {
            sumPrice = sumPrice.add(price.toDec());
          }
        }
      }
      return sumPrice.gte(new Dec(5));
    }
    return false;
  })();
  const [isHighFeeApproved, setIsHighFeeApproved] = useState(false);

  const buttonDisabled =
    txConfigsValidate.interactionBlocked ||
    !signDocHelper.signDocWrapper ||
    isLedgerAndDirect ||
    (isSendAuthzGrant && !isSendAuthzGrantChecked) ||
    (isHighFee && !isHighFeeApproved);

  const approve = async () => {
    if (signDocHelper.signDocWrapper) {
      let presignOptions;
      if (interactionData.data.keyType === "ledger") {
        setIsLedgerInteracting(true);
        setLedgerInteractingError(undefined);
        presignOptions = {
          useWebHID: uiConfigStore.useWebHIDLedger,
        };
      }

      try {
        const signature = await handleCosmosPreSign(
          interactionData,
          signDocHelper.signDocWrapper,
          presignOptions
        );

        await signInteractionStore.approveWithProceedNext(
          interactionData.id,
          signDocHelper.signDocWrapper,
          signature,
          async (proceedNext) => {
            if (!proceedNext) {
              if (
                interactionInfo.interaction &&
                !interactionInfo.interactionInternal
              ) {
                handleExternalInteractionWithNoProceedNext();
              }
            }

            if (
              interactionInfo.interaction &&
              interactionInfo.interactionInternal
            ) {
              await unmountPromise.promise;
            }
          },
          {
            preDelay: 200,
          }
        );
      } catch (e) {
        console.log(e);

        if (e instanceof OWalletError) {
          if (e.module === ErrModuleLedgerSign) {
            setLedgerInteractingError(e);
          } else {
            setLedgerInteractingError(undefined);
          }
        } else {
          setLedgerInteractingError(undefined);
        }
      } finally {
        setIsLedgerInteracting(false);
      }
    }
  };

  const isLavaEndpoint = (() => {
    try {
      const lavaBaseHostName = "lava.build";
      const rpcUrl = new URL(chainStore.getChain(chainId).rpc);
      const lcdUrl = new URL(chainStore.getChain(chainId).rest);

      return (
        rpcUrl.hostname.endsWith(lavaBaseHostName) ||
        lcdUrl.hostname.endsWith(lavaBaseHostName)
      );
    } catch (e) {
      console.error(e);
      return false;
    }
  })();

  const isLoading = isLedgerInteracting;

  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "page.sign.cosmos.tx.title" })}
      fixedHeight={true}
      left={
        <BackButton
          hidden={
            interactionInfo.interaction && !interactionInfo.interactionInternal
          }
        />
      }
      bottomButtons={[
        {
          textOverrideIcon: <CancelIcon color={ColorPalette["gray-200"]} />,
          size: "large",
          color: "secondary",
          style: {
            width: "3.25rem",
          },
          onClick: async () => {
            await signInteractionStore.rejectWithProceedNext(
              interactionData.id,
              (proceedNext) => {
                if (!proceedNext) {
                  if (
                    interactionInfo.interaction &&
                    !interactionInfo.interactionInternal
                  ) {
                    handleExternalInteractionWithNoProceedNext();
                  } else if (
                    interactionInfo.interaction &&
                    interactionInfo.interactionInternal
                  ) {
                    window.history.length > 1 ? navigate(-1) : navigate("/");
                  } else {
                    navigate("/", { replace: true });
                  }
                }
              }
            );
          },
        },
        {
          isSpecial: true,
          text: intl.formatMessage({ id: "button.approve" }),
          size: "large",
          left: !isLoading && <ApproveIcon />,
          disabled: buttonDisabled,
          isLoading,
          onClick: approve,
        },
      ]}
    >
      <Box
        height="100%"
        padding="0.75rem"
        paddingBottom="0"
        style={{
          overflow: "auto",
        }}
      >
        <Box
          marginBottom="0.5rem"
          style={{
            opacity: isLedgerAndDirect ? 0.5 : undefined,
          }}
        >
          <Columns sum={1} alignY="center">
            <XAxis alignY="center">
              <H5
                style={{
                  color:
                    theme.mode === "light"
                      ? ColorPalette["gray-500"]
                      : ColorPalette["gray-50"],
                }}
              >
                <FormattedMessage id="page.sign.cosmos.tx.messages" />:
              </H5>
              <Box
                style={{
                  padding: "0.25rem",
                  borderRadius: "0.35rem",
                  backgroundColor: ColorPalette["purple-700"],
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <H5
                  style={{
                    color: ColorPalette["white"],
                    marginRight: "0.25rem",
                  }}
                >
                  {msgs.length}
                </H5>
              </Box>
            </XAxis>
            <Column weight={1} />
            <ViewDataButton
              isViewData={isViewData}
              setIsViewData={setIsViewData}
            />
          </Columns>
        </Box>

        <SimpleBar
          autoHide={false}
          style={{
            display: "flex",
            flexDirection: "column",
            flex: !isViewData ? "0 1 auto" : 1,
            overflow: "auto",
            opacity: isLedgerAndDirect ? 0.5 : undefined,
            borderRadius: "1rem",
            backgroundColor:
              theme.mode === "light"
                ? ColorPalette.white
                : ColorPalette["gray-600"],
            boxShadow:
              theme.mode === "light"
                ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
                : "none",
          }}
        >
          <Box>
            {isViewData ? (
              <Box
                as={"pre"}
                padding="1rem"
                // Remove normalized style of pre tag
                margin="0"
                style={{
                  width: "fit-content",
                  color:
                    theme.mode === "light"
                      ? ColorPalette["gray-400"]
                      : ColorPalette["gray-200"],
                }}
              >
                {JSON.stringify(signDocHelper.signDocJson, null, 2)}
              </Box>
            ) : (
              <Box
                style={{
                  width: "fit-content",
                  minWidth: "100%",
                }}
              >
                {msgs.map((msg, i) => {
                  const r = defaultRegistry.render(
                    chainId,
                    defaultProtoCodec,
                    msg
                  );

                  return (
                    <MessageItem
                      key={i}
                      icon={r.icon}
                      title={r.title}
                      content={r.content}
                    />
                  );
                })}
              </Box>
            )}
          </Box>
        </SimpleBar>

        <Box height="0" minHeight="0.75rem" />

        <Box
          style={{
            opacity: isLedgerAndDirect ? 0.5 : undefined,
          }}
        >
          {preferNoSetMemo ? (
            <Styles.Container>
              <ReadonlyMemo memo={memoConfig.memo} border={false} />
              <Gutter size="0.75rem" />
            </Styles.Container>
          ) : (
            <Styles.Container>
              <MemoInput
                memoConfig={memoConfig}
                placeholder={intl.formatMessage({
                  id: "components.input.memo-input.optional-placeholder",
                })}
              />
              <Gutter size="0.75rem" />
            </Styles.Container>
          )}
        </Box>

        {!isViewData ? <div style={{ flex: 1 }} /> : null}

        {isLavaEndpoint ? (
          <React.Fragment>
            <GuideBox
              title={intl.formatMessage({
                id: "page.sign.cosmos.lava.guide.title",
              })}
              paragraph={intl.formatMessage({
                id: "page.sign.cosmos.lava.guide.paragraph",
              })}
            />

            <Gutter size="0.75rem" />
          </React.Fragment>
        ) : null}

        <Box
          style={{
            opacity: isLedgerAndDirect ? 0.5 : undefined,
          }}
        >
          {"isDirectAux" in interactionData.data &&
          interactionData.data.isDirectAux
            ? null
            : (() => {
                if (interactionData.isInternal && preferNoSetFee) {
                  return (
                    <FeeSummary feeConfig={feeConfig} gasConfig={gasConfig} />
                  );
                }

                return (
                  <FeeControl
                    feeConfig={feeConfig}
                    senderConfig={senderConfig}
                    gasConfig={gasConfig}
                    disableAutomaticFeeSet={preferNoSetFee}
                  />
                );
              })()}

          {isHighFee ? (
            <React.Fragment>
              <Gutter size="0.75rem" />
              <HighFeeWarning
                checked={isHighFeeApproved}
                onChange={(v) => setIsHighFeeApproved(v)}
              />
            </React.Fragment>
          ) : null}
        </Box>

        {isSendAuthzGrant ? (
          <React.Fragment>
            <Gutter size="0.75rem" />
            <GuideBox
              color="warning"
              title={intl.formatMessage({
                id: "page.sign.cosmos.tx.authz-send-grant.warning-title",
              })}
              titleRight={
                <Box marginLeft="1rem">
                  <Checkbox
                    checked={isSendAuthzGrantChecked}
                    onChange={(checked) => {
                      setIsSendAuthzGrantChecked(checked);
                    }}
                  />
                </Box>
              }
            />
          </React.Fragment>
        ) : null}

        {isLedgerAndDirect ? (
          <React.Fragment>
            <Gutter size="0.75rem" />
            <GuideBox
              color="warning"
              title={intl.formatMessage({
                id: "page.sign.cosmos.tx.warning-title",
              })}
              paragraph={intl.formatMessage({
                id: "page.sign.cosmos.tx.warning-paragraph",
              })}
            />
          </React.Fragment>
        ) : null}

        <LedgerGuideBox
          data={{
            keyInsensitive: interactionData.data.keyInsensitive,
            isEthereum:
              "eip712" in interactionData.data &&
              interactionData.data.eip712 != null,
          }}
          isLedgerInteracting={isLedgerInteracting}
          ledgerInteractingError={ledgerInteractingError}
          isInternal={interactionData.isInternal}
        />
      </Box>
    </HeaderLayout>
  );
});

const ReadonlyMemo: FunctionComponent<{
  memo: string;
  border?: boolean;
}> = ({ memo, border = true }) => {
  const theme = useTheme();

  return (
    <Box
      backgroundColor={
        theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-600"]
      }
      padding="1rem"
      borderRadius="0.375rem"
      style={{
        boxShadow: border
          ? null
          : theme.mode === "light"
          ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
          : undefined,
      }}
    >
      <XAxis alignY="center">
        <Subtitle3
          color={
            theme.mode === "light"
              ? ColorPalette["gray-500"]
              : ColorPalette["gray-200"]
          }
        >
          Memo
        </Subtitle3>
        <Gutter size="1.5rem" direction="horizontal" />
        <Subtitle3
          color={
            memo
              ? theme.mode === "light"
                ? ColorPalette["gray-300"]
                : ColorPalette["gray-50"]
              : theme.mode === "light"
              ? ColorPalette["gray-200"]
              : ColorPalette["gray-300"]
          }
          style={{
            flex: 1,

            textAlign: "right",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {memo || "No memo"}
        </Subtitle3>
      </XAxis>
    </Box>
  );
};

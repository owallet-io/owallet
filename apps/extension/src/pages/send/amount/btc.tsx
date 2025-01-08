import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";
import { Stack } from "../../../components/stack";
import styled from "styled-components";
import { useSearchParams } from "react-router-dom";
import { useStore } from "../../../stores";
import {
  InvalidTronAddressError,
  useGasSimulator,
  useSendBtcTxConfig,
  useSendMixedIBCTransferConfig,
  useTxConfigsValidate,
} from "@owallet/hooks";
import { useNavigate } from "react-router";
import { TokenAmountInput } from "../../../components/input";
import { Box } from "../../../components/box";
import { YAxis } from "../../../components/axis";
import { Gutter } from "../../../components/gutter";
import { FeeControl } from "../../../components/input/fee-control";
import { useNotification } from "../../../hooks/notification";
import { DenomHelper, ExtensionKVStore } from "@owallet/common";
import { ENSInfo, ICNSInfo } from "../../../config.ui";
import { CoinPretty, Dec } from "@owallet/unit";
import { ColorPalette } from "../../../styles";
import { openPopupWindow } from "@owallet/popup";
import { useIntl } from "react-intl";
import { useTxConfigsQueryString } from "../../../hooks/use-tx-config-query-string";
import { isRunningInSidePanel } from "../../../utils";
import { CustomRecipientInput } from "../../../components/input/reciepient-input/custom-input";
import Color from "color";
import { TransactionBtcType } from "@owallet/types";

const Styles = {
  Flex1: styled.div`
    flex: 1;
  `,
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

export const SendBtcPage: FunctionComponent = observer(() => {
  const { analyticsStore, bitcoinAccountStore, chainStore, queriesStore } =
    useStore();
  const addressRef = useRef<HTMLInputElement | null>(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const notification = useNotification();
  const intl = useIntl();

  const initialChainId = searchParams.get("chainId");
  const initialCoinMinimalDenom = searchParams.get("coinMinimalDenom");

  const chainId = initialChainId || chainStore.chainInfosInUI[0].chainId;
  const chainInfo = chainStore.getChain(chainId);

  const coinMinimalDenom =
    initialCoinMinimalDenom ||
    chainStore.getChain(chainId).currencies[0].coinMinimalDenom;

  useEffect(() => {
    if (addressRef.current) {
      addressRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (!initialChainId || !initialCoinMinimalDenom) {
      navigate(
        `/send-btc/select-asset?navigateReplace=true&navigateTo=${encodeURIComponent(
          "/send-btc?chainId={chainId}&coinMinimalDenom={coinMinimalDenom}"
        )}`
      );
    }
  }, [navigate, initialChainId, initialCoinMinimalDenom]);

  const currency = chainInfo.forceFindCurrency(coinMinimalDenom);

  const account = bitcoinAccountStore.getAccount(chainId);
  const queryBalances = queriesStore.get(chainId).queryBalances;
  const denomHelper = new DenomHelper(coinMinimalDenom);
  const sender =
    denomHelper.type === "legacy"
      ? account.btcLegacyAddress
      : account.bech32Address;
  const balance = queryBalances
    .getQueryBech32Address(sender)
    .getBalance(currency);

  const sendConfigs = useSendBtcTxConfig(
    chainStore,
    queriesStore,
    chainId,
    sender
  );

  sendConfigs.amountConfig.setCurrency(currency);

  const txConfigsValidate = useTxConfigsValidate({
    ...sendConfigs,
  });

  const submitSend = async () => {
    if (!txConfigsValidate.interactionBlocked) {
      try {
        account.setIsSendingTx(true);
        const unsignedTx = account.makeSendTokenTx({
          currency: sendConfigs.amountConfig.amount[0].currency,
          amount: sendConfigs.amountConfig.amount[0].toDec().toString(),
          to: sendConfigs.recipientConfig.recipient,
          memo: sendConfigs.memoConfig.memo,
          sender,
        });
        await account.sendTx(
          sender,
          unsignedTx,
          denomHelper.type === "legacy"
            ? TransactionBtcType.Legacy
            : TransactionBtcType.Bech32,
          {
            onBroadcasted: (txHash) => {
              account.setIsSendingTx(false);
            },
            onFulfill: (txReceipt) => {
              queryBalances
                .getQueryBech32Address(account.bech32Address)
                .balances.forEach((balance) => {
                  if (
                    balance.currency.coinMinimalDenom === coinMinimalDenom ||
                    sendConfigs.feeConfig.fees.some(
                      (fee) =>
                        fee.currency.coinMinimalDenom ===
                        balance.currency.coinMinimalDenom
                    )
                  ) {
                    balance.fetch();
                  }
                });
            },
          }
        );
      } catch (e) {
        console.log("error on send btc", e);
        account.setIsSendingTx(false);
        notification.show(
          "failed",
          intl.formatMessage({ id: "error.transaction-failed" }),
          ""
        );
        history.back();
      }
    } else {
      notification.show(
        "failed",
        intl.formatMessage({ id: "error.transaction-failed" }),
        ""
      );
    }
  };

  const currentFeeCurrencyCoinMinimalDenom =
    sendConfigs.feeConfig.fees[0]?.currency.coinMinimalDenom;

  const isDetachedMode = searchParams.get("detached") === "true";

  const loadingSend = account.isSendingTx;

  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "page.send.amount.title" }) + " BTC"}
      displayFlex={true}
      fixedMinHeight={true}
      left={<BackButton />}
      right={
        isDetachedMode || isRunningInSidePanel() ? null : (
          <Box
            paddingRight="1rem"
            cursor="pointer"
            onClick={async (e) => {
              e.preventDefault();
              const url = window.location.href + "&detached=true";
              await openPopupWindow(url, undefined);
              window.close();
            }}
          >
            <DetachIcon size="1.5rem" color={ColorPalette["gray-300"]} />
          </Box>
        )
      }
      bottomButtons={[
        {
          disabled: loadingSend || txConfigsValidate.interactionBlocked,
          text: intl.formatMessage({ id: "page.send.type.send" }) + " BTC",
          color: "primary",
          size: "large",
          type: "submit",
          isLoading: loadingSend,
        },
      ]}
      onSubmit={async (e) => {
        e.preventDefault();
        submitSend();
      }}
    >
      <Box
        paddingX="0.75rem"
        style={{
          flex: 1,
        }}
      >
        <Stack gutter="0.75rem" flex={1}>
          <YAxis>
            {/* <Subtitle3>
              <FormattedMessage id="page.send.amount.asset-title" />
            </Subtitle3> */}
            <Gutter size="0.375rem" />
            {/* <TokenItem
              viewToken={{
                token: balance?.balance ?? new CoinPretty(currency, "0"),
                chainInfo: chainStore.getChain(chainId),
                isFetching: balance?.isFetching ?? false,
                error: balance?.error,
              }}
              forChange
              onClick={() => {
                navigate(
                  `/send/select-asset?navigateReplace=true&navigateTo=${encodeURIComponent(
                    "/send?chainId={chainId}&coinMinimalDenom={coinMinimalDenom}"
                  )}`
                );
              }}
            /> */}
          </YAxis>

          <Gutter size="0" />

          <Styles.Container>
            <CustomRecipientInput
              historyType="send"
              ref={addressRef}
              recipientConfig={sendConfigs.recipientConfig}
              memoConfig={sendConfigs.memoConfig}
              currency={sendConfigs.amountConfig.currency}
            />
          </Styles.Container>
          <Styles.Container>
            <TokenAmountInput
              viewToken={{
                token: balance?.balance ?? new CoinPretty(currency, "0"),
                chainInfo: chainStore.getChain(chainId),
                isFetching: balance?.isFetching ?? false,
                error: balance?.error,
              }}
              amountConfig={sendConfigs.amountConfig}
            />
          </Styles.Container>
          <Gutter size="0" />

          <Gutter size="0.75rem" />
          <Gutter size="0" />

          <Styles.Flex1 />
          <Gutter size="0" />
          <FeeControl
            senderConfig={sendConfigs.senderConfig}
            feeConfig={sendConfigs.feeConfig}
            gasConfig={null}
            gasSimulator={null}
          />
        </Stack>
      </Box>
    </HeaderLayout>
  );
});

const DetachIcon: FunctionComponent<{
  size: string;
  color: string;
}> = ({ size, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke={color || "currentColor"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
      />
    </svg>
  );
};

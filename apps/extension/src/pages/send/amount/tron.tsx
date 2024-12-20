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
  useSendMixedIBCTransferConfig,
  useTxConfigsValidate,
} from "@owallet/hooks";
import { useNavigate } from "react-router";
import { AmountInput } from "../../../components/input";
import { TokenItem } from "../../main/components";
import { Subtitle3 } from "../../../components/typography";
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
import { InExtensionMessageRequester } from "@owallet/router-extension";
import { BACKGROUND_PORT, Message } from "@owallet/router";
import { FormattedMessage, useIntl } from "react-intl";
import { useTxConfigsQueryString } from "../../../hooks/use-tx-config-query-string";
import { isRunningInSidePanel } from "../../../utils";
import { TronRecipientInput } from "../../../components/input/reciepient-input/trx-input";

const Styles = {
  Flex1: styled.div`
    flex: 1;
  `,
};

export const SendTronPage: FunctionComponent = observer(() => {
  const {
    analyticsStore,
    accountStore,
    ethereumAccountStore,
    tronAccountStore,
    chainStore,
    queriesStore,
    keyRingStore,
  } = useStore();
  const addressRef = useRef<HTMLInputElement | null>(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const notification = useNotification();
  const intl = useIntl();

  const initialChainId = searchParams.get("chainId");
  const initialCoinMinimalDenom = searchParams.get("coinMinimalDenom");
  const contractAddress =
    initialCoinMinimalDenom.split(":").length > 1
      ? initialCoinMinimalDenom.split(":")[1]
      : null;

  const chainId = initialChainId || chainStore.chainInfosInUI[0].chainId;
  const chainInfo = chainStore.getChain(chainId);
  const isEvmChain = chainStore.isEvmChain(chainId);
  const isEVMOnlyChain = chainStore.isEvmOnlyChain(chainId);

  const coinMinimalDenom =
    initialCoinMinimalDenom ||
    chainStore.getChain(chainId).currencies[0].coinMinimalDenom;
  const currency = chainInfo.forceFindCurrency(coinMinimalDenom);
  const isErc20 = new DenomHelper(currency.coinMinimalDenom).type === "erc20";

  useEffect(() => {
    if (addressRef.current) {
      addressRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (!initialChainId || !initialCoinMinimalDenom) {
      navigate(
        `/send/select-asset?navigateReplace=true&navigateTo=${encodeURIComponent(
          "/send?chainId={chainId}&coinMinimalDenom={coinMinimalDenom}"
        )}`
      );
    }
  }, [navigate, initialChainId, initialCoinMinimalDenom]);

  const [isEvmTx, setIsEvmTx] = useState(isErc20 || isEVMOnlyChain);

  const account = accountStore.getAccount(chainId);
  const ethereumAccount = ethereumAccountStore.getAccount(chainId);
  const tronAccount = tronAccountStore.getAccount(chainId);

  const queryBalances = queriesStore.get(chainId).queryBalances;
  const sender = isEvmTx ? account.ethereumHexAddress : account.bech32Address;
  const balance = isEvmTx
    ? queryBalances.getQueryEthereumHexAddress(sender).getBalance(currency)
    : queryBalances.getQueryBech32Address(sender).getBalance(currency);

  const sendConfigs = useSendMixedIBCTransferConfig(
    chainStore,
    queriesStore,
    chainId,
    sender,
    isEvmTx ? 21000 : 300000,
    false,
    {
      allowHexAddressToBech32Address:
        !isEvmChain &&
        !isEvmTx &&
        !chainStore.getChain(chainId).chainId.startsWith("injective"),
      allowHexAddressOnly: isEvmTx,
      icns: ICNSInfo,
      ens: ENSInfo,
      computeTerraClassicTax: true,
    }
  );
  sendConfigs.amountConfig.setCurrency(currency);

  const queries = queriesStore.get(chainId);

  const checkSendMySelft =
    sendConfigs.recipientConfig.recipient?.trim() === tronAccount.base58Address
      ? new InvalidTronAddressError("Cannot transfer TRX to the same account")
      : null;
  const gasSimulatorKey = useMemo(() => {
    const txType: "evm" | "cosmos" = isEvmTx ? "evm" : "cosmos";

    if (sendConfigs.amountConfig.currency) {
      const denomHelper = new DenomHelper(
        sendConfigs.amountConfig.currency.coinMinimalDenom
      );

      if (denomHelper.type !== "native") {
        if (denomHelper.type === "erc20") {
          // XXX: This logic causes gas simulation to run even if `gasSimulatorKey` is the same, it needs to be figured out why.
          const amountHexDigits = BigInt(
            sendConfigs.amountConfig.amount[0].toCoin().amount
          ).toString(16).length;
          return `${txType}/${denomHelper.type}/${denomHelper.contractAddress}/${amountHexDigits}`;
        }

        if (denomHelper.type === "cw20") {
          // Probably, the gas can be different per cw20 according to how the contract implemented.
          return `${txType}/${denomHelper.type}/${denomHelper.contractAddress}`;
        }

        return `${txType}/${denomHelper.type}`;
      }
    }

    return `${txType}/native`;
  }, [
    isEvmTx,
    sendConfigs.amountConfig.amount,
    sendConfigs.amountConfig.currency,
  ]);

  const gasSimulator = useGasSimulator(
    new ExtensionKVStore("gas-simulator.main.send"),
    chainStore,
    chainId,
    sendConfigs.gasConfig,
    sendConfigs.feeConfig,
    gasSimulatorKey,
    () => {
      if (!sendConfigs.amountConfig.currency) {
        throw new Error("Send currency not set");
      }

      // Prefer not to use the gas config or fee config,
      // because gas simulator can change the gas config and fee config from the result of reaction,
      // and it can make repeated reaction.
      if (
        sendConfigs.amountConfig.uiProperties.loadingState ===
          "loading-block" ||
        sendConfigs.amountConfig.uiProperties.error != null ||
        sendConfigs.recipientConfig.uiProperties.loadingState ===
          "loading-block" ||
        sendConfigs.recipientConfig.uiProperties.error != null
      ) {
        throw new Error("Not ready to simulate tx");
      }

      const denomHelper = new DenomHelper(
        sendConfigs.amountConfig.currency.coinMinimalDenom
      );
      // I don't know why, but simulation does not work for secret20
      if (denomHelper.type === "secret20") {
        throw new Error("Simulating secret wasm not supported");
      }

      if (isEvmTx) {
        return {
          simulate: () =>
            ethereumAccount.simulateGasForSendTokenTx({
              currency: sendConfigs.amountConfig.amount[0].currency,
              amount: sendConfigs.amountConfig.amount[0].toDec().toString(),
              sender: sendConfigs.senderConfig.sender,
              recipient: sendConfigs.recipientConfig.recipient,
            }),
        };
      }

      return account.makeSendTokenTx(
        sendConfigs.amountConfig.amount[0].toDec().toString(),
        sendConfigs.amountConfig.amount[0].currency,
        sendConfigs.recipientConfig.recipient
      );
    }
  );

  const currentFeeCurrencyCoinMinimalDenom =
    sendConfigs.feeConfig.fees[0]?.currency.coinMinimalDenom;
  useEffect(() => {
    const chainInfo = chainStore.getChain(chainId);
    if (chainInfo.hasFeature("feemarket")) {
      if (
        currentFeeCurrencyCoinMinimalDenom !==
        chainInfo.currencies[0].coinMinimalDenom
      ) {
        gasSimulator.setGasAdjustmentValue("2");
      } else {
        gasSimulator.setGasAdjustmentValue("1.6");
      }
    }
  }, [chainId, chainStore, gasSimulator, currentFeeCurrencyCoinMinimalDenom]);

  useEffect(() => {
    if (isEvmChain) {
      const sendingDenomHelper = new DenomHelper(
        sendConfigs.amountConfig.currency.coinMinimalDenom
      );
      const isERC20 = sendingDenomHelper.type === "erc20";
      const isSendingNativeToken =
        sendingDenomHelper.type === "native" &&
        (chainInfo.stakeCurrency?.coinMinimalDenom ??
          chainInfo.currencies[0].coinMinimalDenom) ===
          sendingDenomHelper.denom;
      const newIsEvmTx =
        isEVMOnlyChain ||
        (sendConfigs.recipientConfig.isRecipientEthereumHexAddress &&
          (isERC20 || isSendingNativeToken));

      const newSenderAddress = newIsEvmTx
        ? account.ethereumHexAddress
        : account.bech32Address;

      sendConfigs.senderConfig.setValue(newSenderAddress);
      setIsEvmTx(newIsEvmTx);
      ethereumAccount.setIsSendingTx(false);
    }
  }, [
    account,
    ethereumAccount,
    isEvmChain,
    isEVMOnlyChain,
    sendConfigs.amountConfig.currency.coinMinimalDenom,
    sendConfigs.recipientConfig.isRecipientEthereumHexAddress,
    sendConfigs.senderConfig,
    chainInfo.stakeCurrency?.coinMinimalDenom,
    chainInfo.currencies,
  ]);

  useEffect(() => {
    (async () => {
      if (chainInfo.features.includes("op-stack-l1-data-fee")) {
        const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } =
          sendConfigs.feeConfig.getEIP1559TxFees(sendConfigs.feeConfig.type);

        const { to, gasLimit, value, data, chainId } =
          ethereumAccount.makeSendTokenTx({
            currency: sendConfigs.amountConfig.amount[0].currency,
            amount: sendConfigs.amountConfig.amount[0].toDec().toString(),
            to: sendConfigs.recipientConfig.recipient,
            gasLimit: sendConfigs.gasConfig.gas,
            maxFeePerGas: maxFeePerGas?.toString(),
            maxPriorityFeePerGas: maxPriorityFeePerGas?.toString(),
            gasPrice: gasPrice?.toString(),
          });

        const l1DataFee = await ethereumAccount.simulateOpStackL1Fee({
          to,
          gasLimit,
          value,
          data,
          chainId,
        });
        sendConfigs.feeConfig.setL1DataFee(new Dec(BigInt(l1DataFee)));
      }
    })();
  }, [
    chainInfo.features,
    ethereumAccount,
    sendConfigs.amountConfig.amount,
    sendConfigs.feeConfig,
    sendConfigs.gasConfig.gas,
    sendConfigs.recipientConfig.recipient,
  ]);

  useEffect(() => {
    if (isEvmTx) {
      const intervalId = setInterval(() => {
        sendConfigs.feeConfig.refreshEIP1559TxFees();
      }, 12000);

      return () => clearInterval(intervalId);
    }
  }, [isEvmTx, sendConfigs.feeConfig]);

  useEffect(() => {
    // To simulate secretwasm, we need to include the signature in the tx.
    // With the current structure, this approach is not possible.
    if (
      sendConfigs.amountConfig.currency &&
      new DenomHelper(sendConfigs.amountConfig.currency.coinMinimalDenom)
        .type === "secret20"
    ) {
      gasSimulator.forceDisable(
        new Error(
          intl.formatMessage({ id: "error.simulating-secret-20-not-supported" })
        )
      );
      sendConfigs.gasConfig.setValue(250000);
    } else {
      gasSimulator.forceDisable(false);
      gasSimulator.setEnabled(true);
    }
  }, [
    gasSimulator,
    intl,
    sendConfigs.amountConfig.currency,
    sendConfigs.gasConfig,
  ]);

  useTxConfigsQueryString(chainId, {
    ...sendConfigs,
    gasSimulator,
  });

  // Ignore validatation for recipientConfig for Tron
  const configValidate = { ...sendConfigs };
  delete configValidate.recipientConfig;

  const txConfigsValidate = useTxConfigsValidate({
    ...configValidate,
    gasSimulator,
  });

  const isDetachedMode = searchParams.get("detached") === "true";

  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "page.send.amount.title" }) + " Tron"}
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

              analyticsStore.logEvent("click_popOutButton");
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
          disabled: txConfigsValidate.interactionBlocked || !!checkSendMySelft,
          text: intl.formatMessage({ id: "button.next" }),
          color: "primary",
          size: "large",
          type: "submit",
          isLoading: isEvmTx
            ? ethereumAccount.isSendingTx
            : accountStore.getAccount(chainId).isSendingMsg === "send",
        },
      ]}
      onSubmit={async (e) => {
        e.preventDefault();

        if (!txConfigsValidate.interactionBlocked) {
          try {
            if (isEvmTx) {
              ethereumAccount.setIsSendingTx(true);

              const unsignedTx = tronAccount.makeSendTokenTx({
                address: tronAccount.base58Address,
                currency: sendConfigs.amountConfig.amount[0].currency,
                amount: sendConfigs.amountConfig.amount[0]
                  .toDec()
                  .mul(
                    new Dec(
                      10 **
                        sendConfigs.amountConfig.amount[0].currency.coinDecimals
                    )
                  )
                  .round()
                  .toString(),
                recipient: sendConfigs.recipientConfig.recipient,
                contractAddress,
              });

              await tronAccount.sendTx(unsignedTx, {
                onBroadcasted: (txHash) => {
                  tronAccount.setIsSendingTx(false);
                  // Do some thing with txHash
                },
                onFulfill: (txReceipt) => {
                  queryBalances
                    .getQueryEthereumHexAddress(sender)
                    .balances.forEach((balance) => {
                      if (
                        balance.currency.coinMinimalDenom ===
                          coinMinimalDenom ||
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
              });
              ethereumAccount.setIsSendingTx(false);
            }
            if (!isDetachedMode) {
              navigate("/", {
                replace: true,
              });
            } else {
              window.close();
            }
          } catch (e) {
            console.log("error on Send Tron", e);
            if (e?.message === "Request rejected") {
              return;
            }

            if (isEvmTx) {
              ethereumAccount.setIsSendingTx(false);
            }

            notification.show(
              "failed",
              intl.formatMessage({ id: "error.transaction-failed" }),
              ""
            );
            if (!isDetachedMode) {
              navigate("/", {
                replace: true,
              });
            } else {
              await new Promise((resolve) => setTimeout(resolve, 2000));
              window.close();
            }
          }
        }
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
            <Subtitle3>
              <FormattedMessage id="page.send.amount.asset-title" />
            </Subtitle3>
            <Gutter size="0.375rem" />
            <TokenItem
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
            />
          </YAxis>

          <Gutter size="0" />

          <TronRecipientInput
            ref={addressRef}
            recipientConfig={sendConfigs.recipientConfig}
            memoConfig={sendConfigs.memoConfig}
            currency={sendConfigs.amountConfig.currency}
            checkSendMySelft={checkSendMySelft?.message}
          />

          <AmountInput amountConfig={sendConfigs.amountConfig} />

          <Gutter size="0" />

          <Gutter size="0.75rem" />
          <Gutter size="0" />

          <Styles.Flex1 />
          <Gutter size="0" />

          <FeeControl
            senderConfig={sendConfigs.senderConfig}
            feeConfig={sendConfigs.feeConfig}
            gasConfig={sendConfigs.gasConfig}
            gasSimulator={gasSimulator}
            isForEVMTx={isEvmTx}
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

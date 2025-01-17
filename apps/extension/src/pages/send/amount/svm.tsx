import React, { FunctionComponent, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";
import { Stack } from "../../../components/stack";
import styled from "styled-components";
import { useSearchParams } from "react-router-dom";
import { useStore } from "../../../stores";
import {useSendBtcTxConfig, useSendSvmTxConfig, useTxConfigsValidate} from "@owallet/hooks";
import { useNavigate } from "react-router";
import { TokenAmountInput } from "../../../components/input";
import { Box } from "../../../components/box";
import { YAxis } from "../../../components/axis";
import { Gutter } from "../../../components/gutter";
import { FeeControl } from "../../../components/input/fee-control";
import { useNotification } from "../../../hooks/notification";
import {_getPriorityFeeSolana, DenomHelper} from "@owallet/common";
import {CoinPretty, Dec, DecUtils} from "@owallet/unit";
import { ColorPalette } from "../../../styles";
import { openPopupWindow } from "@owallet/popup";
import { useIntl } from "react-intl";
import { isRunningInSidePanel } from "../../../utils";
import { CustomRecipientInput } from "../../../components/input/reciepient-input/custom-input";
import Color from "color";
import { TransactionBtcType } from "@owallet/types";
import {ComputeBudgetProgram, Connection, PublicKey, SystemProgram, Transaction} from "@solana/web3.js";
import {createTransferInstruction, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID} from "@solana/spl-token";
import {createMemoInstruction} from "@solana/spl-memo";
import {encode} from "bs58";
import delay from "delay";
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

export const SendSvmPage: FunctionComponent = observer(() => {
  const { analyticsStore, solanaAccountStore, chainStore, queriesStore } =
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
        `/send/select-asset?navigateReplace=true&navigateTo=${encodeURIComponent(
          "/send?chainId={chainId}&coinMinimalDenom={coinMinimalDenom}"
        )}`
      );
    }
  }, [navigate, initialChainId, initialCoinMinimalDenom]);

  const currency = chainInfo.forceFindCurrency(coinMinimalDenom);

  const account = solanaAccountStore.getAccount(chainId);
  const queryBalances = queriesStore.get(chainId).queryBalances;
  const denomHelper = new DenomHelper(coinMinimalDenom);
  const sender = account.base58Address;
  const balance = queryBalances
    .getQueryByAddress(sender)
    .getBalance(currency);

  const sendConfigs = useSendSvmTxConfig(
      chainStore,
      queriesStore,
      chainId,
      sender,
      1
  );

  sendConfigs.amountConfig.setCurrency(currency);

  const txConfigsValidate = useTxConfigsValidate({
    ...sendConfigs,
  });

  const submitSend = async () => {
    if (!txConfigsValidate.interactionBlocked) {
      try {
        account.setIsSendingTx(true);
        const amount = DecUtils.getTenExponentN(
            sendConfigs.amountConfig.amount[0].currency.coinDecimals
        )
            .mul(sendConfigs.amountConfig.amount[0].toDec())
            .roundUp()
            .toString();
        const unsignedTx = await account.makeSendTokenTx({
          currency: sendConfigs.amountConfig.amount[0].currency,
          amount: amount,
          to: sendConfigs.recipientConfig.recipient,
          memo: sendConfigs.memoConfig.memo,
        });
        // console.log(unsignedTx,"unsignedTx");
        await account.sendTx(sender, unsignedTx, {
          onBroadcasted: async (txHash) => {
            account.setIsSendingTx(false);
            notification.show(
                "success",
                intl.formatMessage({
                  id: "notification.transaction-success",
                }),
                ""
            );
            await delay(3000);
            queryBalances
                .getQueryByAddress(account.base58Address)
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
          onFulfill: (txReceipt) => {
            queryBalances
                .getQueryByAddress(account.base58Address)
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
        });
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


  const isDetachedMode = searchParams.get("detached") === "true";

  const loadingSend = account.isSendingTx;
  useEffect(() => {
    (async () => {
      try {
        if (txConfigsValidate.interactionBlocked) return;
        const connection = new Connection(chainInfo.rpc, "confirmed");
        const fromPublicKey = new PublicKey(account.base58Address);
        const toPublicKey = new PublicKey(
            sendConfigs.recipientConfig.recipient
        );
        const amount = DecUtils.getTenExponentN(
            sendConfigs.amountConfig.amount[0].currency.coinDecimals
        )
            .mul(sendConfigs.amountConfig.amount[0].toDec())
            .roundUp()
            .toString();
        let transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: fromPublicKey,
              toPubkey: toPublicKey,
              lamports: BigInt(amount),
            })
        );
        const denom = new DenomHelper(
            sendConfigs.amountConfig.amount[0].currency.coinMinimalDenom
        );
        if (denom.type.startsWith("spl")) {
          const mintPublicKey = new PublicKey(denom.contractAddress);
          const isToken2020 = denom.type.includes("spl20");
          // Get the associated token accounts for the sender and receiver
          const senderTokenAccount = await getAssociatedTokenAddress(
              mintPublicKey,
              fromPublicKey,
              isToken2020 ? true : undefined, // Allow Token2022
              isToken2020 ? TOKEN_2022_PROGRAM_ID : undefined // Token2022 Program ID
          );
          const receiverTokenAccount = await getAssociatedTokenAddress(
              mintPublicKey,
              toPublicKey,
              isToken2020 ? true : undefined, // Allow Token2022
              isToken2020 ? TOKEN_2022_PROGRAM_ID : undefined // Token2022 Program ID
          );

          // Create SPL token transfer instruction
          const transferInstruction = createTransferInstruction(
              senderTokenAccount, // Sender's token account
              receiverTokenAccount, // Receiver's token account
              fromPublicKey, // Payer's public key
              BigInt(amount),
              undefined, // Amount to transfer (raw amount, not adjusted for decimals)
              isToken2020 ? TOKEN_2022_PROGRAM_ID : undefined // Token2022 Program ID
          );

          // Create a transaction
          transaction = new Transaction().add(transferInstruction);
        }
        if (sendConfigs.memoConfig.memo) {
          transaction.add(createMemoInstruction(sendConfigs.memoConfig.memo));
        }
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = fromPublicKey;
        const txStr = encode(
            transaction.serialize({ requireAllSignatures: false })
        );
        const dynamicMicroLamports = await _getPriorityFeeSolana(txStr);
        const message = transaction.compileMessage();
        const feeInLamports = await connection.getFeeForMessage(message);
        if (feeInLamports === null) {
          throw new Error("Unable to estimate the fee");
        }
        const simulationResult = await connection.simulateTransaction(
            transaction
        );
        if (!simulationResult.value.unitsConsumed)
          throw new Error("Unable to estimate the fee");
        const DefaultUnitLimit = new Dec(200_000);
        const unitsConsumed = new Dec(simulationResult.value.unitsConsumed);
        const units = unitsConsumed.lte(DefaultUnitLimit)
            ? DefaultUnitLimit
            : unitsConsumed.mul(new Dec(1.2)); // Request up to 1,000,000 compute units
        const microLamports = new Dec(
            dynamicMicroLamports > 0 ? dynamicMicroLamports : 50000
        );

        transaction.add(
            // Request a specific number of compute units
            ComputeBudgetProgram.setComputeUnitLimit({
              units: Number(units.roundUp().toString()),
            }),
            // Attach a priority fee (in lamports)
            ComputeBudgetProgram.setComputeUnitPrice({
              microLamports: Number(microLamports.roundUp().toString()), // Set priority fee per compute unit in micro-lamports
            })
        );
        const baseFee = new Dec(feeInLamports.value);
        const PriorityFee = units
            .mul(microLamports)
            .quoTruncate(DecUtils.getTenExponentNInPrecisionRange(6));
        const fee = [
          {
            amount: baseFee.add(PriorityFee).roundUp().toString(),
            currency: sendConfigs.feeConfig.fees[0].currency,
          },
        ];
        console.log(fee, "fee");
        sendConfigs.feeConfig.setManualFee(fee);
      } catch (e) {
        console.log(e, "err solana");
      }
    })();
  }, [
    txConfigsValidate.interactionBlocked,
    sendConfigs.recipientConfig.recipient,
    sendConfigs.amountConfig.amount,
    sendConfigs.memoConfig.memo,
    sendConfigs.amountConfig.amount[0].currency.coinMinimalDenom,
  ]);
  useEffect(() => {
    const fee = [
      {
        amount: "0",
        currency: sendConfigs.feeConfig.fees[0].currency,
      },
    ];
    sendConfigs.feeConfig.setManualFee(fee);
  }, [sendConfigs.amountConfig.amount[0].currency.coinMinimalDenom]);
  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "page.send.amount.title" }) + " Solana"}
      displayFlex={true}
      fixedMinHeight={true}
      left={<BackButton />}
      right={
        null
        // isDetachedMode || isRunningInSidePanel() ? null : (
        //   <Box
        //     paddingRight="1rem"
        //     cursor="pointer"
        //     onClick={async (e) => {
        //       e.preventDefault();
        //       const url = window.location.href + "&detached=true";
        //       await openPopupWindow(url, undefined);
        //       window.close();
        //     }}
        //   >
        //     <DetachIcon size="1.5rem" color={ColorPalette["gray-300"]} />
        //   </Box>
        // )
      }
      bottomButtons={[
        {
          disabled: loadingSend || txConfigsValidate.interactionBlocked,
          text: intl.formatMessage({ id: "page.send.type.send" }) + " Solana",
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
            <Gutter size="0.375rem" />
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

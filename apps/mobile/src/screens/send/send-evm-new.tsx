import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  useGasSimulator,
  useSendMixedIBCTransferConfig,
  useTxConfigsValidate,
} from "@owallet/hooks";
import { useStore } from "../../stores";
import {
  ChainIdEnum,
  DenomHelper,
  EthereumEndpoint,
  ICNSInfo,
} from "@owallet/common";
import {
  InteractionManager,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { CoinPretty, Dec, DecUtils } from "@owallet/unit";
import { AddressInput, CurrencySelector } from "../../components/input";
import { OWButton } from "../../components/button";
import { useTheme } from "@src/themes/theme-provider";
import { metrics, spacing } from "../../themes";
import OWCard from "@src/components/card/ow-card";
import OWText from "@src/components/text/ow-text";
import { NewAmountInput } from "@src/components/input/amount-input";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import { AsyncKVStore } from "@src/common";
import { FeeControl } from "@src/components/input/fee-control";

enum EthTxStatus {
  Success = "0x1",
  Failure = "0x0",
}

export const SendEvmNewScreen: FunctionComponent<{
  chainId: string;
  coinMinimalDenom: string;
  recipientAddress: string;
  setSelectedKey: (key) => void;
}> = observer(
  ({ chainId, coinMinimalDenom, recipientAddress, setSelectedKey }) => {
    const {
      chainStore,
      accountStore,
      ethereumAccountStore,
      queriesStore,
      priceStore,
    } = useStore();
    const { colors } = useTheme();
    const styles = styling(colors);
    const chainInfo = chainStore.getChain(chainId);
    const isEvmChain = chainStore.isEvmChain(chainId);
    const isEVMOnlyChain = chainStore.isEvmOnlyChain(chainId);
    const currency = chainInfo.forceFindCurrency(coinMinimalDenom);
    const isErc20 = new DenomHelper(currency.coinMinimalDenom).type === "erc20";

    const [isIBCTransfer, setIsIBCTransfer] = useState(false);

    const [isEvmTx, setIsEvmTx] = useState(isErc20);

    const account = accountStore.getAccount(chainId);
    const ethereumAccount = ethereumAccountStore.getAccount(chainId);

    const queryBalances = queriesStore.get(chainId).queryBalances;
    const sender = account.ethereumHexAddress;
    const balance = queryBalances
      .getQueryEthereumHexAddress(sender)
      .getBalance(currency);

    const sendConfigs = useSendMixedIBCTransferConfig(
      chainStore,
      queriesStore,
      chainId,
      sender,
      // TODO: 이 값을 config 밑으로 빼자
      isEvmTx ? 21000 : 300000,
      isIBCTransfer,
      {
        allowHexAddressToBech32Address:
          !isEvmChain &&
          !isEvmTx &&
          !chainStore.getChain(chainId).chainId.startsWith("injective"),
        allowHexAddressOnly: isEvmTx,
        icns: ICNSInfo,
        computeTerraClassicTax: true,
      }
    );
    sendConfigs.amountConfig.setCurrency(currency);

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
      new AsyncKVStore("gas-simulator.screen.send/send"),
      chainStore,
      chainId,
      sendConfigs.gasConfig,
      sendConfigs.feeConfig,
      isIBCTransfer ? `ibc/${gasSimulatorKey}` : gasSimulatorKey,
      () => {
        if (!sendConfigs.amountConfig.currency) {
          throw new Error("Send currency not set");
        }

        if (isIBCTransfer) {
          if (
            sendConfigs.channelConfig.uiProperties.loadingState ===
              "loading-block" ||
            sendConfigs.channelConfig.uiProperties.error != null
          ) {
            throw new Error("Not ready to simulate tx");
          }
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

        if (isIBCTransfer) {
          return account.cosmos.makePacketForwardIBCTransferTx(
            accountStore,
            sendConfigs.channelConfig.channels,
            sendConfigs.amountConfig.amount[0].toDec().toString(),
            sendConfigs.amountConfig.amount[0].currency,
            sendConfigs.recipientConfig.recipient
          );
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
    sendConfigs.amountConfig.setCurrency(currency);
    useEffect(() => {
      sendConfigs.recipientConfig.setValue(recipientAddress || "");
    }, [recipientAddress, sendConfigs.recipientConfig]);

    useEffect(() => {
      if (chainStore.getChain(chainId).hasFeature("feemarket")) {
        gasSimulator.setGasAdjustmentValue("1.6");
      }
    }, [chainId, chainStore, gasSimulator]);

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
      // To simulate secretwasm, we need to include the signature in the tx.
      // With the current structure, this approach is not possible.
      if (
        sendConfigs.amountConfig.currency &&
        new DenomHelper(sendConfigs.amountConfig.currency.coinMinimalDenom)
          .type === "secret20"
      ) {
        gasSimulator.forceDisable(
          new Error("error.simulating-secret-20-not-supported")
        );
        sendConfigs.gasConfig.setValue(250000);
      } else {
        gasSimulator.forceDisable(false);
        gasSimulator.setEnabled(true);
      }
    }, [
      gasSimulator,
      sendConfigs.amountConfig.currency,
      sendConfigs.gasConfig,
    ]);

    const txConfigsValidate = useTxConfigsValidate({
      ...sendConfigs,
      gasSimulator,
    });

    const [isIBCRecipientSetAuto, setIsIBCRecipientSetAuto] = useState(false);
    const [ibcRecipientAddress, setIBCRecipientAddress] = useState("");

    useEffect(() => {
      if (
        !isIBCTransfer ||
        sendConfigs.recipientConfig.value !== ibcRecipientAddress
      ) {
        setIsIBCRecipientSetAuto(false);
      }
    }, [ibcRecipientAddress, sendConfigs.recipientConfig.value, isIBCTransfer]);

    const [ibcChannelFluent, setIBCChannelFluent] = useState<
      | {
          destinationChainId: string;
          originDenom: string;
          originChainId: string;

          channels: {
            portId: string;
            channelId: string;

            counterpartyChainId: string;
          }[];
        }
      | undefined
    >(undefined);

    const historyType = isIBCTransfer ? "basic-send/ibc" : "basic-send";

    const [isSendingIBCToken, setIsSendingIBCToken] = useState(false);
    useEffect(() => {
      if (!isIBCTransfer) {
        if (
          new DenomHelper(sendConfigs.amountConfig.currency.coinMinimalDenom)
            .type === "native" &&
          sendConfigs.amountConfig.currency.coinMinimalDenom.startsWith("ibc/")
        ) {
          setIsSendingIBCToken(true);
          return;
        }
      }

      setIsSendingIBCToken(false);
    }, [isIBCTransfer, sendConfigs.amountConfig.currency]);

    const onSubmit = async () => {
      if (!txConfigsValidate.interactionBlocked) {
        try {
          if (isEvmTx) {
            ethereumAccount.setIsSendingTx(true);
            const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } =
              sendConfigs.feeConfig.getEIP1559TxFees(
                sendConfigs.feeConfig.type
              );

            const unsignedTx = ethereumAccount.makeSendTokenTx({
              currency: sendConfigs.amountConfig.amount[0].currency,
              amount: sendConfigs.amountConfig.amount[0].toDec().toString(),
              to: sendConfigs.recipientConfig.recipient,
              gasLimit: sendConfigs.gasConfig.gas,
              maxFeePerGas: maxFeePerGas?.toString(),
              maxPriorityFeePerGas: maxPriorityFeePerGas?.toString(),
              gasPrice: gasPrice?.toString(),
            });
            await ethereumAccount.sendEthereumTx(sender, unsignedTx, {
              onFulfill: (txReceipt) => {
                queryBalances
                  .getQueryEthereumHexAddress(sender)
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
            });
            ethereumAccount.setIsSendingTx(false);
          }
        } catch (e) {
          if (e?.message === "Request rejected") {
            return;
          }

          if (isEvmTx) {
            ethereumAccount.setIsSendingTx(false);
          }

          console.log(e);
        }
      }
    };

    console.log("balance evm", balance?.balance);

    return (
      <PageWithBottom
        bottomGroup={
          <OWButton
            label="Send EVM"
            disabled={txConfigsValidate.interactionBlocked}
            loading={
              isEvmTx
                ? ethereumAccount.isSendingTx
                : accountStore.getAccount(chainId).isSendingMsg ===
                  (!isIBCTransfer ? "send" : "ibcTransfer")
            }
            onPress={onSubmit}
            style={[
              styles.bottomBtn,
              {
                width: metrics.screenWidth - 32,
              },
            ]}
            textStyle={{
              fontSize: 16,
              fontWeight: "600",
              color: colors["neutral-text-action-on-dark-bg"],
            }}
          />
        }
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View>
            <OWCard
              type="normal"
              style={[
                {
                  backgroundColor: colors["neutral-surface-card"],
                },
              ]}
            >
              <OWText color={colors["neutral-text-title"]}>Recipient</OWText>

              <AddressInput
                colors={colors}
                placeholder="Enter address"
                label=""
                recipientConfig={sendConfigs.recipientConfig}
                memoConfig={null}
                labelStyle={styles.sendlabelInput}
                containerStyle={{
                  marginBottom: 12,
                }}
                inputContainerStyle={{
                  backgroundColor: colors["neutral-surface-card"],
                  borderWidth: 0,
                  paddingHorizontal: 0,
                }}
              />
            </OWCard>
            <OWCard
              style={[
                {
                  paddingTop: 22,
                  backgroundColor: colors["neutral-surface-card"],
                },
              ]}
              type="normal"
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View>
                  <OWText style={{ paddingTop: 8 }}>
                    Balance:{" "}
                    {(balance?.balance ?? new CoinPretty(currency, "0"))
                      ?.trim(true)
                      ?.maxDecimals(6)
                      ?.hideDenom(true)
                      ?.toString() || "0"}
                  </OWText>
                  <CurrencySelector
                    chainId={chainId}
                    selectedKey={coinMinimalDenom}
                    setSelectedKey={setSelectedKey}
                    label="Select a token"
                    placeHolder="Select Token"
                    amountConfig={sendConfigs.amountConfig}
                    labelStyle={styles.sendlabelInput}
                    containerStyle={styles.containerStyle}
                    selectorContainerStyle={{
                      backgroundColor: colors["neutral-surface-card"],
                    }}
                  />
                </View>
                <View
                  style={{
                    alignItems: "flex-end",
                  }}
                >
                  <NewAmountInput
                    colors={colors}
                    inputContainerStyle={{
                      borderWidth: 0,
                      width: metrics.screenWidth / 2.3,
                    }}
                    amountConfig={sendConfigs.amountConfig}
                    placeholder={"0.0"}
                  />
                </View>
              </View>
              <View
                style={{
                  alignSelf: "flex-end",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                {/* <OWIcon name="tdesign_swap" size={16} />
              <OWText style={{ paddingLeft: 4 }} color={colors['neutral-text-body']}>
                {priceStore.calculatePrice(amount).toString()}
              </OWText> */}
              </View>
            </OWCard>
            <OWCard
              style={{
                backgroundColor: colors["neutral-surface-card"],
              }}
              type="normal"
            >
              <FeeControl
                senderConfig={sendConfigs.senderConfig}
                feeConfig={sendConfigs.feeConfig}
                gasConfig={sendConfigs.gasConfig}
                gasSimulator={gasSimulator}
              />
            </OWCard>
          </View>
        </ScrollView>
      </PageWithBottom>
    );
  }
);
const styling = (colors) =>
  StyleSheet.create({
    sendInputRoot: {
      paddingHorizontal: spacing["20"],
      paddingVertical: spacing["24"],
      backgroundColor: colors["primary"],
      borderRadius: 24,
    },
    sendlabelInput: {
      fontSize: 14,
      fontWeight: "500",
      lineHeight: 20,
      color: colors["neutral-text-body"],
    },
    containerStyle: {
      backgroundColor: colors["neutral-surface-bg2"],
    },
    bottomBtn: {
      marginTop: 20,
      width: metrics.screenWidth / 2.3,
      borderRadius: 999,
    },
    errorBorder: {
      borderWidth: 2,
      borderColor: colors["error-border-default"],
    },
  });

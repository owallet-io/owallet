import { ValidatorThumbnails } from "@owallet/common";
import { useUndelegateTxConfig } from "@owallet/hooks";
import { BondStatus } from "@owallet/stores";
import { Dec, DecUtils } from "@owallet/unit";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Text } from "@src/components/text";
import { useTheme } from "@src/themes/theme-provider";
import { handleSaveHistory, HISTORY_STATUS } from "@src/utils/helper";
import { Buffer } from "buffer";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { View } from "react-native";
import { OWButton } from "../../../components/button";
import { CardBody, CardDivider, OWBox } from "../../../components/card";
import {
  AmountInput,
  FeeButtons,
  MemoInput,
  TextInput,
} from "../../../components/input";
import { PageWithScrollView } from "../../../components/page";
import { ValidatorThumbnail } from "../../../components/thumbnail";
import { Toggle } from "../../../components/toggle";
import { useSmartNavigation } from "../../../navigation.provider";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { spacing } from "../../../themes";
export const UndelegateScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          validatorAddress: string;
        }
      >,
      string
    >
  >();

  const validatorAddress = route.params.validatorAddress;

  const { chainStore, accountStore, queriesStore, analyticsStore } = useStore();
  const { colors } = useTheme();
  const style = useStyle();
  const smartNavigation = useSmartNavigation();
  const [customFee, setCustomFee] = useState(false);

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const validator =
    queries.cosmos.queryValidators
      .getQueryStatus(BondStatus.Bonded)
      .getValidator(validatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(BondStatus.Unbonding)
      .getValidator(validatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(BondStatus.Unbonded)
      .getValidator(validatorAddress);

  const validatorThumbnail = validator
    ? queries.cosmos.queryValidators
        .getQueryStatus(BondStatus.Bonded)
        .getValidatorThumbnail(validatorAddress) ||
      queries.cosmos.queryValidators
        .getQueryStatus(BondStatus.Unbonding)
        .getValidatorThumbnail(validatorAddress) ||
      queries.cosmos.queryValidators
        .getQueryStatus(BondStatus.Unbonded)
        .getValidatorThumbnail(validatorAddress) ||
      ValidatorThumbnails[validatorAddress]
    : undefined;

  const staked = queries.cosmos.queryDelegations
    .getQueryBech32Address(account.bech32Address)
    .getDelegationTo(validatorAddress);

  const sendConfigs = useUndelegateTxConfig(
    chainStore,
    chainStore.current.chainId,
    account.msgOpts["undelegate"].gas,
    account.bech32Address,
    queries.queryBalances,
    queries.cosmos.queryDelegations,
    validatorAddress
  );

  useEffect(() => {
    sendConfigs.recipientConfig.setRawRecipient(validatorAddress);
  }, [sendConfigs.recipientConfig, validatorAddress]);

  const sendConfigError =
    sendConfigs.recipientConfig.getError() ??
    sendConfigs.amountConfig.getError() ??
    sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError() ??
    sendConfigs.feeConfig.getError();
  const txStateIsValid = sendConfigError == null;

  const isDisable = !account.isReadyToSendMsgs || !txStateIsValid;

  return (
    <PageWithScrollView
      // style={}
      contentContainerStyle={style.get("flex-grow-1")}
      backgroundColor={colors["background"]}
    >
      <View style={style.flatten(["height-page-pad"])} />
      <View
        style={{
          marginBottom: spacing["12"],
          borderRadius: spacing["8"],
          backgroundColor: colors["primary"],
          marginHorizontal: spacing["page"],
        }}
      >
        <CardBody>
          <View style={style.flatten(["flex-row", "items-center"])}>
            <ValidatorThumbnail
              style={{
                marginRight: spacing["8"],
                backgroundColor: colors["border"],
              }}
              size={36}
              url={validatorThumbnail}
            />
            <Text
              style={[
                style.flatten(["h6", "color-text-black-high"]),
                { color: colors["primary-text"] },
              ]}
            >
              {validator ? validator?.description.moniker : "..."}
            </Text>
          </View>
          <CardDivider
            style={style.flatten([
              "margin-x-0",
              "margin-top-8",
              "margin-bottom-15",
            ])}
          />
          <View style={style.flatten(["flex-row", "items-center"])}>
            <Text
              style={[
                style.flatten(["subtitle2", "color-text-black-medium"]),
                { color: colors["sub-primary-text"] },
              ]}
            >
              Staked
            </Text>
            <View style={style.get("flex-1")} />
            <Text
              style={[
                style.flatten(["body2", "color-text-black-medium"]),
                { color: colors["sub-primary-text"] },
              ]}
            >
              {staked.trim(true).shrink(true).maxDecimals(6).toString()}
            </Text>
          </View>
        </CardBody>
      </View>
      {/*
        // The recipient validator is selected by the route params, so no need to show the address input.
        <AddressInput
          label="Recipient"
          recipientConfig={sendConfigs.recipientConfig}
        />
      */}
      {/*
      Undelegate tx only can be sent with just stake currency. So, it is not needed to show the currency selector because the stake currency is one.
      <CurrencySelector
        label="Token"
        placeHolder="Select Token"
        amountConfig={sendConfigs.amountConfig}
      />
      */}
      <OWBox>
        <AmountInput label="Amount" amountConfig={sendConfigs.amountConfig} />
        <MemoInput
          label="Memo (Optional)"
          memoConfig={sendConfigs.memoConfig}
        />
        <View
          style={{
            flexDirection: "row",
            paddingBottom: 24,
            alignItems: "center",
          }}
        >
          <Toggle
            on={customFee}
            onChange={(value) => {
              setCustomFee(value);
              if (!value) {
                if (
                  sendConfigs.feeConfig.feeCurrency &&
                  !sendConfigs.feeConfig.fee
                ) {
                  sendConfigs.feeConfig.setFeeType("average");
                }
              }
            }}
          />
          <Text
            style={{
              fontWeight: "700",
              fontSize: 16,
              lineHeight: 34,
              paddingHorizontal: 8,
              color: colors["primary-text"],
            }}
          >
            Custom Fee
          </Text>
        </View>
        {customFee && chainStore.current.networkType !== "evm" ? (
          <TextInput
            label="Fee"
            placeholder="Type your Fee here"
            keyboardType={"numeric"}
            labelStyle={{
              fontSize: 16,
              fontWeight: "700",
              lineHeight: 22,
              color: colors["gray-900"],
              marginBottom: spacing["8"],
            }}
            onChangeText={(text) => {
              const fee = new Dec(Number(text.replace(/,/g, "."))).mul(
                DecUtils.getTenExponentNInPrecisionRange(6)
              );

              sendConfigs.feeConfig.setManualFee({
                amount: fee.roundUp().toString(),
                denom: sendConfigs.feeConfig.feeCurrency.coinMinimalDenom,
              });
            }}
          />
        ) : chainStore.current.networkType !== "evm" ? (
          <FeeButtons
            label="Fee"
            gasLabel="gas"
            feeConfig={sendConfigs.feeConfig}
            gasConfig={sendConfigs.gasConfig}
          />
        ) : null}

        <OWButton
          label="Unstake"
          disabled={isDisable}
          loading={account.isSendingMsg === "undelegate"}
          onPress={async () => {
            if (account.isReadyToSendMsgs && txStateIsValid) {
              try {
                await account.cosmos.sendUndelegateMsg(
                  sendConfigs.amountConfig.amount,
                  sendConfigs.recipientConfig.recipient,
                  sendConfigs.memoConfig.memo,
                  sendConfigs.feeConfig.toStdFee(),
                  {
                    preferNoSetMemo: true,
                    preferNoSetFee: true,
                  },
                  {
                    onFulfill: (tx) => {
                      console.log(
                        tx,
                        "TX INFO ON SEND PAGE!!!!!!!!!!!!!!!!!!!!!"
                      );
                    },
                    onBroadcasted: (txHash) => {
                      analyticsStore.logEvent("Undelegate tx broadcasted", {
                        chainId: chainStore.current.chainId,
                        chainName: chainStore.current.chainName,
                        validatorName: validator?.description.moniker,
                        feeType: sendConfigs.feeConfig.feeType,
                      });
                      smartNavigation.pushSmart("TxPendingResult", {
                        txHash: Buffer.from(txHash).toString("hex"),
                      });
                      const historyInfos = {
                        fromAddress: account.bech32Address,
                        toAddress: sendConfigs.recipientConfig.recipient,
                        hash: Buffer.from(txHash).toString("hex"),
                        memo: "",
                        fromAmount: sendConfigs.amountConfig.amount,
                        toAmount: sendConfigs.amountConfig.amount,
                        value: sendConfigs.amountConfig.amount,
                        fee: sendConfigs.feeConfig.toStdFee(),
                        type: HISTORY_STATUS.UNSTAKE,
                        fromToken: {
                          asset:
                            sendConfigs.amountConfig.sendCurrency.coinDenom,
                          chainId: chainStore.current.chainId,
                        },
                        toToken: {
                          asset:
                            sendConfigs.amountConfig.sendCurrency.coinDenom,
                          chainId: chainStore.current.chainId,
                        },
                        status: "SUCCESS",
                      };

                      handleSaveHistory(account.bech32Address, historyInfos);
                    },
                  }
                );
              } catch (e) {
                if (e?.message === "Request rejected") {
                  return;
                }
                if (
                  e?.message.includes("Cannot read properties of undefined")
                ) {
                  return;
                }
                if (smartNavigation.canGoBack) {
                  smartNavigation.goBack();
                } else {
                  smartNavigation.navigateSmart("Home", {});
                }
              }
            }
          }}
        />
      </OWBox>
      <View style={style.flatten(["height-page-pad"])} />
    </PageWithScrollView>
  );
});

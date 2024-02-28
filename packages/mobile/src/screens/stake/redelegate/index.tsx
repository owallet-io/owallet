import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { BondStatus } from "@owallet/stores";
import { useRedelegateTxConfig } from "@owallet/hooks";
import { Dec, DecUtils } from "@owallet/unit";
import { PageWithScrollView } from "../../../components/page";
import { Image, View } from "react-native";
import { Text } from "@src/components/text";
import { ValidatorThumbnail } from "../../../components/thumbnail";
import {
  AmountInput,
  FeeButtons,
  MemoInput,
  TextInput,
} from "../../../components/input";
import { OWButton } from "../../../components/button";
import { useSmartNavigation } from "../../../navigation.provider";
import { spacing } from "../../../themes";
import { ValidatorThumbnails } from "@owallet/common";
import ValidatorsList from "./validators-list";
import { TouchableOpacity } from "react-native-gesture-handler";
import { DownArrowIcon } from "../../../components/icon";
import { Toggle } from "../../../components/toggle";
import { useTheme } from "@src/themes/theme-provider";
import { OWSubTitleHeader } from "@src/components/header";
import { capitalizedText, showToast } from "@src/utils/helper";
export const RedelegateScreen: FunctionComponent = observer(() => {
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

  const smartNavigation = useSmartNavigation();
  const [customFee, setCustomFee] = useState(false);
  const { colors } = useTheme();
  const { chainStore, accountStore, queriesStore, analyticsStore, modalStore } =
    useStore();

  const style = useStyle();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const srcValidator =
    queries.cosmos.queryValidators
      .getQueryStatus(BondStatus.Bonded)
      .getValidator(validatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(BondStatus.Unbonding)
      .getValidator(validatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(BondStatus.Unbonded)
      .getValidator(validatorAddress);

  const srcValidatorThumbnail = srcValidator
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

  const sendConfigs = useRedelegateTxConfig(
    chainStore,
    chainStore.current.chainId,
    account.msgOpts["undelegate"].gas,
    account.bech32Address,
    queries.queryBalances,
    queries.cosmos.queryDelegations,
    validatorAddress
  );

  const [dstValidatorAddress, setDstValidatorAddress] = useState("");
  const [switchValidator, setSwitchValidator] = useState({
    avatar: "",
    moniker: "",
  });
  const dstValidator =
    queries.cosmos.queryValidators
      .getQueryStatus(BondStatus.Bonded)
      .getValidator(dstValidatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(BondStatus.Unbonding)
      .getValidator(dstValidatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(BondStatus.Unbonded)
      .getValidator(dstValidatorAddress);

  useEffect(() => {
    sendConfigs.recipientConfig.setRawRecipient(dstValidatorAddress);
  }, [dstValidatorAddress, sendConfigs.recipientConfig]);
  const stakedDst = queries.cosmos.queryDelegations
    .getQueryBech32Address(account.bech32Address)
    .getDelegationTo(dstValidatorAddress);

  const sendConfigError =
    sendConfigs.recipientConfig.getError() ??
    sendConfigs.amountConfig.getError() ??
    sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError() ??
    sendConfigs.feeConfig.getError();
  const txStateIsValid = sendConfigError == null;

  const isDisable = !account.isReadyToSendMsgs || !txStateIsValid;

  const _onPressSwitchValidator = async () => {
    if (account.isReadyToSendMsgs && txStateIsValid) {
      try {
        await account.cosmos.sendBeginRedelegateMsg(
          sendConfigs.amountConfig.amount,
          sendConfigs.srcValidatorAddress,
          sendConfigs.dstValidatorAddress,
          sendConfigs.memoConfig.memo,
          sendConfigs.feeConfig.toStdFee(),
          {
            preferNoSetMemo: true,
            preferNoSetFee: true,
          },
          {
            onBroadcasted: (txHash) => {
              analyticsStore.logEvent("Redelgate tx broadcasted", {
                chainId: chainStore.current.chainId,
                chainName: chainStore.current.chainName,
                validatorName: srcValidator?.description.moniker,
                toValidatorName: dstValidator?.description.moniker,
                feeType: sendConfigs.feeConfig.feeType,
              });
              smartNavigation.pushSmart("TxPendingResult", {
                txHash: Buffer.from(txHash).toString("hex"),
              });
            },
          }
        );
      } catch (e) {
        if (e?.message === "Request rejected") {
          return;
        }
        if (e?.message.includes("Cannot read properties of undefined")) {
          return;
        }
        if (e?.response && e?.response?.data?.message) {
          const inputString = e?.response?.data?.message;
          // Replace single quotes with double quotes
          const regex =
            /redelegation to this validator already in progress; first redelegation to this validator must complete before next redelegation/g;
          const match = inputString.match(regex);
          // Check if a match was found and extract the reason
          if (match && match?.length > 0) {
            const reason = match[0];
            showToast({
              message:
                (reason && capitalizedText(reason)) || "Transaction Failed",
              type: "warning",
            });
            return;
          }
          showToast({
            message: "Transaction Failed",
            type: "warning",
          });
          return;

          // Parse the JSON string into a TypeScript object
          // const parsedObject = JSON.parse(`{${validJsonString}}`);
        }
        console.log(e);
        if (smartNavigation.canGoBack) {
          smartNavigation.goBack();
        } else {
          smartNavigation.navigateSmart("Home", {});
        }
      }
    }
  };

  const onPressSelectValidator = (address, avatar, moniker) => {
    setDstValidatorAddress(address);
    setSwitchValidator({
      avatar,
      moniker,
    });
    modalStore.close();
  };
  return (
    <PageWithScrollView
      contentContainerStyle={{
        flexGrow: 1,
      }}
      backgroundColor={colors["background"]}
    >
      <OWSubTitleHeader title="Switch validator" />
      <View
        style={{
          borderRadius: spacing["8"],
          marginTop: spacing["top-pad"],
          backgroundColor: colors["primary"],
          marginLeft: 20,
          marginRight: 20,
        }}
      >
        <View
          style={{
            backgroundColor: "inherit",
            borderRadius: 8,
            padding: 10,
            borderWidth: 1,
            borderColor: colors["purple-400"],
            borderStyle: "dashed",
          }}
        >
          <View style={{ display: "flex", flexDirection: "row" }}>
            <View style={{ width: 40, height: 40 }}>
              <ValidatorThumbnail
                style={{
                  marginRight: spacing["8"],
                  backgroundColor: colors["border"],
                }}
                size={36}
                url={srcValidatorThumbnail}
              />
            </View>
            <View style={{ paddingLeft: 12 }}>
              <Text
                style={{
                  fontSize: 18,
                  lineHeight: 22,
                  fontWeight: "700",
                  color: colors["primary-text"],
                }}
              >
                {srcValidator ? srcValidator?.description?.moniker : "..."}
              </Text>
              <Text
                style={{
                  color: colors["blue-300"],
                  fontWeight: "700",
                  fontSize: 14,
                  lineHeight: 16,
                }}
              >
                Staked{" "}
                {staked.trim(true).shrink(true).maxDecimals(6).toString()}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View
        style={{
          paddingTop: 5,
          paddingBottom: 5,
          alignItems: "center",
        }}
      >
        <Image
          style={{
            width: spacing["24"],
            height: spacing["24"],
          }}
          source={require("../../../assets/image/back.png")}
          fadeDuration={0}
        />
      </View>
      <View
        style={{
          marginBottom: spacing["12"],
          borderRadius: spacing["8"],
          backgroundColor: colors["primary"],
          marginLeft: 20,
          marginRight: 20,
        }}
      >
        <TouchableOpacity
          style={{
            borderRadius: 8,
            padding: 10,
            borderWidth: 0.5,
            borderColor: colors["border-input-login"],
          }}
          onPress={() => {
            modalStore.setOptions();
            modalStore.setChildren(
              <ValidatorsList
                onPressSelectValidator={onPressSelectValidator}
                dstValidatorAddress={dstValidatorAddress}
              />
            );
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {dstValidatorAddress ? (
                <View
                  style={{
                    width: 40,
                    height: 40,
                  }}
                >
                  <ValidatorThumbnail
                    style={{
                      marginRight: spacing["8"],
                    }}
                    size={38}
                    url={switchValidator.avatar}
                  />
                </View>
              ) : (
                <View
                  style={{
                    width: 40,
                    height: 40,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors["background-item-list"],
                    borderRadius: 8,
                  }}
                >
                  <Image
                    style={{
                      width: spacing["24"],
                      height: spacing["24"],
                    }}
                    source={require("../../../assets/image/user-square.png")}
                    fadeDuration={0}
                  />
                </View>
              )}
              {dstValidatorAddress ? (
                <View style={{ display: "flex", paddingLeft: 12 }}>
                  <Text
                    style={{
                      color: colors["gray-900"],
                      fontSize: 18,
                      lineHeight: 22,
                      fontWeight: "700",
                    }}
                  >
                    {switchValidator ? switchValidator.moniker : "..."}
                  </Text>
                  <Text
                    style={{
                      color: colors["blue-300"],
                      fontWeight: "700",
                      fontSize: 14,
                      lineHeight: 16,
                    }}
                  >
                    Staked{" "}
                    {stakedDst
                      .trim(true)
                      .shrink(true)
                      .maxDecimals(6)
                      .toString()}
                  </Text>
                </View>
              ) : (
                <Text
                  style={{
                    fontWeight: "700",
                    fontSize: 16,
                    lineHeight: 22,
                    paddingLeft: 12,
                    color: colors["primary-text"],
                  }}
                >
                  Select validator
                </Text>
              )}
            </View>
            <DownArrowIcon height={15} color={colors["gray-150"]} />
          </View>
        </TouchableOpacity>
      </View>

      {dstValidatorAddress ? (
        <View
          style={{
            marginTop: 20,
            padding: 20,
            backgroundColor: colors["primary"],
            borderRadius: 24,
          }}
        >
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
            label="Switch"
            disabled={isDisable}
            loading={account.isSendingMsg === "redelegate"}
            onPress={_onPressSwitchValidator}
          />
        </View>
      ) : null}
      <View style={style.flatten(["height-page-pad"])} />
    </PageWithScrollView>
  );
});

import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { BondStatus } from "@owallet/stores";
import { useRedelegateTxConfig } from "@owallet/hooks";
import { CoinPretty, Dec, DecUtils, Int } from "@owallet/unit";
import { PageWithScrollView } from "../../../components/page";
import {
  Image,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  InteractionManager,
} from "react-native";
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
import { metrics, spacing } from "../../../themes";
import { ChainIdEnum, toAmount, ValidatorThumbnails } from "@owallet/common";
import ValidatorsList from "./validators-list";
import { AlertIcon, DownArrowIcon } from "../../../components/icon";
import { Toggle } from "../../../components/toggle";
import { useTheme } from "@src/themes/theme-provider";
import { OWSubTitleHeader } from "@src/components/header";
import {
  capitalizedText,
  computeTotalVotingPower,
  formatPercentage,
  handleSaveHistory,
  HISTORY_STATUS,
  showToast,
} from "@src/utils/helper";
import OWText from "@src/components/text/ow-text";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { PageHeader } from "@src/components/header/header-new";
import { chainIcons } from "@oraichain/oraidex-common";
import OWCard from "@src/components/card/ow-card";
import { NewAmountInput } from "@src/components/input/amount-input";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import { API } from "@src/common/api";

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
  const [validatorDetail, setValidatorDetail] = useState();
  const [validators, setValidators] = useState([]);
  const { colors } = useTheme();
  const {
    chainStore,
    accountStore,
    queriesStore,
    analyticsStore,
    modalStore,
    priceStore,
    appInitStore,
  } = useStore();

  const styles = styling(colors);
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
  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      if (chainStore.current.chainId !== ChainIdEnum.Oraichain) return;
      (async () => {
        try {
          const res = await Promise.all([
            API.getValidatorOraichainDetail(
              {
                validatorAddress: dstValidatorAddress,
              },
              {
                baseURL: "https://api.scan.orai.io",
              }
            ),
            API.getValidatorList(
              {},
              {
                baseURL: "https://api.scan.orai.io",
              }
            ),
          ]);
          if (res[0].status !== 200) return;
          setValidatorDetail(res[0].data);
          if (res[1].status !== 200) return;
          setValidators(res[1].data.data);
        } catch (error) {}
      })();
    });
  }, [chainStore.current.chainId, dstValidatorAddress]);

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

  useEffect(() => {
    if (sendConfigs.feeConfig.feeCurrency && !sendConfigs.feeConfig.fee) {
      sendConfigs.feeConfig.setFeeType("average");
    }
    if (appInitStore.getInitApp.feeOption) {
      sendConfigs.feeConfig.setFeeType(appInitStore.getInitApp.feeOption);
    }
  }, [sendConfigs.feeConfig, appInitStore.getInitApp.feeOption]);

  const sendConfigError =
    sendConfigs.recipientConfig.getError() ??
    sendConfigs.amountConfig.getError() ??
    sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError() ??
    sendConfigs.feeConfig.getError();
  const txStateIsValid = sendConfigError == null;

  const isDisable = !account.isReadyToSendMsgs || !txStateIsValid;

  const amount = new CoinPretty(
    chainStore.current.feeCurrencies[0],
    new Int(toAmount(Number(sendConfigs.amountConfig.amount)))
  );
  const chainIcon = chainIcons.find(
    (c) => c.chainId === chainStore.current.chainId
  );

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
                data: {
                  type: "redelegate",
                  wallet: account.bech32Address,
                  validator: sendConfigs.recipientConfig.recipient,
                  amount: sendConfigs.amountConfig.getAmountPrimitive(),
                  fee: sendConfigs.feeConfig.toStdFee(),
                  currency: sendConfigs.amountConfig.sendCurrency,
                },
              });
            },
          }
        );
      } catch (e) {
        if (e?.message.toLowerCase().includes("rejected")) {
          return;
        } else if (e?.message.includes("Cannot read properties of undefined")) {
          return;
        } else {
          console.log(e);
          // smartNavigation.navigate("Home", {});
          showToast({
            message: JSON.stringify(e),
            type: "danger",
          });
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
  console.log(validators, "validators");
  const totalVotingPower = useMemo(
    () => computeTotalVotingPower(validators),
    [validators]
  );
  const currentVotingPower = parseFloat(validatorDetail?.voting_power || 0);
  const percentage =
    chainStore.current.chainId === ChainIdEnum.Oraichain
      ? formatPercentage(currentVotingPower / totalVotingPower, 2)
      : 0;
  return (
    <PageWithBottom
      bottomGroup={
        <OWButton
          label="Switch"
          disabled={isDisable}
          loading={account.isSendingMsg === "redelegate"}
          onPress={_onPressSwitchValidator}
          style={[
            styles.bottomBtn,
            {
              width: metrics.screenWidth - 32,
            },
          ]}
          textStyle={{
            fontSize: 14,
            fontWeight: "600",
            color: colors["neutral-text-action-on-dark-bg"],
          }}
        />
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <PageHeader
          title="Redelegate"
          subtitle={"Oraichain"}
          colors={colors}
          onPress={async () => {}}
        />
        {
          <View>
            {srcValidator ? (
              <OWCard>
                <OWText
                  style={{ paddingBottom: 8 }}
                  color={colors["neutral-text-title"]}
                >
                  From
                </OWText>
                <View
                  style={{
                    flexDirection: "row",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: colors["neutral-icon-on-dark"],
                      borderRadius: 999,
                    }}
                  >
                    <ValidatorThumbnail size={20} url={srcValidatorThumbnail} />
                  </View>

                  <OWText
                    style={{ paddingLeft: 8 }}
                    color={colors["neutral-text-title"]}
                    weight="500"
                  >
                    {srcValidator?.description.moniker}
                  </OWText>
                </View>
              </OWCard>
            ) : null}

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

            {
              <OWCard>
                {dstValidatorAddress ? (
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
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
                    <View>
                      <OWText
                        style={{ paddingBottom: 8 }}
                        color={colors["neutral-text-title"]}
                      >
                        To
                      </OWText>
                      <View
                        style={{
                          flexDirection: "row",
                        }}
                      >
                        <ValidatorThumbnail
                          size={20}
                          url={switchValidator.avatar}
                        />
                        <OWText
                          style={{ paddingLeft: 8 }}
                          color={colors["neutral-text-title"]}
                          weight="500"
                        >
                          {switchValidator?.moniker ?? ""}
                        </OWText>
                      </View>
                    </View>
                    <DownArrowIcon height={15} color={colors["gray-150"]} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
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
                    <View>
                      <OWText
                        style={{ paddingBottom: 8 }}
                        color={colors["neutral-text-title"]}
                      >
                        To
                      </OWText>
                      <View
                        style={{
                          flexDirection: "row",
                        }}
                      >
                        <ValidatorThumbnail
                          size={20}
                          url={switchValidator.avatar}
                        />
                        <OWText
                          style={{ paddingLeft: 8 }}
                          color={colors["neutral-text-title"]}
                          weight="500"
                        >
                          {"Select Validator"}
                        </OWText>
                      </View>
                    </View>
                    <DownArrowIcon height={15} color={colors["gray-150"]} />
                  </TouchableOpacity>
                )}
              </OWCard>
            }
            {dstValidatorAddress ? (
              <View>
                <OWCard style={{ paddingTop: 22 }} type="normal">
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{}}>
                      <OWText style={{ paddingTop: 8 }}>
                        Staked :{" "}
                        {staked
                          .trim(true)
                          .shrink(true)
                          .maxDecimals(6)
                          .toString()}
                      </OWText>
                      <View
                        style={{
                          flexDirection: "row",
                          backgroundColor: colors["neutral-surface-action3"],
                          borderRadius: 999,
                          paddingHorizontal: 14,
                          paddingVertical: 12,
                          maxWidth: metrics.screenWidth / 4.5,
                          marginTop: 12,
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: colors["neutral-icon-on-dark"],
                            borderRadius: 999,
                          }}
                        >
                          <OWIcon
                            type="images"
                            source={{ uri: chainIcon?.Icon }}
                            size={16}
                          />
                        </View>
                        <OWText
                          style={{ paddingLeft: 4 }}
                          weight="600"
                          size={14}
                        >
                          ORAI
                        </OWText>
                      </View>
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
                          marginBottom: 8,
                        }}
                        amountConfig={sendConfigs.amountConfig}
                        maxBalance={
                          staked
                            .trim(true)
                            .shrink(true)
                            .maxDecimals(6)
                            .toString()
                            .split(" ")[0]
                        }
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
                    <OWIcon name="tdesign_swap" size={16} />
                    <OWText
                      style={{ paddingLeft: 4 }}
                      color={colors["neutral-text-body"]}
                      size={14}
                    >
                      {priceStore.calculatePrice(amount).toString()}
                    </OWText>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      borderRadius: 12,
                      backgroundColor: colors["warning-surface-subtle"],
                      padding: 12,
                      marginTop: 8,
                    }}
                  >
                    <AlertIcon color={colors["warning-text-body"]} size={16} />
                    <OWText style={{ paddingLeft: 8 }} weight="600" size={14}>
                      {Number(percentage) > 5 ? (
                        <>
                          <OWText
                            style={{
                              fontWeight: "bold",
                            }}
                          >
                            You're about to stake with top 10 validators {"\n"}
                          </OWText>
                          <OWText weight="400">
                            Consider staking with other validators to improve
                            network decentralization
                          </OWText>
                        </>
                      ) : (
                        `When you unstake, a 14-day cooldown period is required before your stake returns to your wallet.`
                      )}
                    </OWText>
                  </View>
                </OWCard>
                <OWCard>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      borderBottomColor: colors["neutral-border-default"],
                      borderBottomWidth: 1,
                      paddingVertical: 16,
                    }}
                  >
                    <OWText color={colors["neutral-text-title"]} weight="600">
                      Transaction fee
                    </OWText>
                    <TouchableOpacity>
                      <OWText
                        color={colors["primary-text-action"]}
                        weight="600"
                      >
                        {/* Fast: $0.01 */}
                      </OWText>
                    </TouchableOpacity>
                  </View>
                  <FeeButtons
                    label=""
                    gasLabel="gas"
                    feeConfig={sendConfigs.feeConfig}
                    gasConfig={sendConfigs.gasConfig}
                  />
                </OWCard>
              </View>
            ) : null}
          </View>
        }
      </ScrollView>
    </PageWithBottom>
  );
});

const styling = (colors) =>
  StyleSheet.create({
    containerStaking: {
      borderRadius: spacing["24"],
      backgroundColor: colors["primary"],
      marginBottom: spacing["24"],
    },
    listLabel: {
      paddingVertical: 16,
      borderBottomColor: colors["neutral-border-default"],
      borderBottomWidth: 1,
    },
    title: {
      color: colors["neutral-text-body"],
    },
    topSubInfo: {
      backgroundColor: colors["neutral-surface-bg2"],
      borderRadius: 8,
      paddingHorizontal: 6,
      paddingVertical: 4,
      marginTop: 4,
      marginRight: 8,
      flexDirection: "row",
    },
    bottomBtn: {
      marginTop: 20,
      width: metrics.screenWidth / 2.3,
      borderRadius: 999,
      marginLeft: 12,
    },
    label: {
      fontWeight: "600",
      textAlign: "center",
      marginTop: spacing["6"],
      color: colors["neutral-text-title"],
    },
    percentBtn: {
      backgroundColor: colors["primary-surface-default"],
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 4,
    },
  });

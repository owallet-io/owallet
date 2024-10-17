import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useStore } from "../../../stores";
import { Staking } from "@owallet/stores";
import {
  useGasSimulator,
  useRedelegateTxConfig,
  useTxConfigsValidate,
} from "@owallet/hooks";
import { CoinPretty, Dec } from "@owallet/unit";
import {
  Image,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { ValidatorThumbnail } from "../../../components/thumbnail";
import { OWButton } from "../../../components/button";

import { metrics, spacing } from "../../../themes";
import { unknownToken } from "@owallet/common";
import ValidatorsList from "./validators-list";
import { AlertIcon, DownArrowIcon } from "../../../components/icon";
import { useTheme } from "@src/themes/theme-provider";
import { OWHeaderTitle } from "@src/components/header";
import { capitalizedText, showToast } from "@src/utils/helper";
import OWText from "@src/components/text/ow-text";
import OWIcon from "@src/components/ow-icon/ow-icon";

import OWCard from "@src/components/card/ow-card";
import { NewAmountInput } from "@src/components/input/amount-input";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import { tracking } from "@src/utils/tracking";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";
import { FeeModal } from "@src/modals/fee";
import { AsyncKVStore } from "@src/common";
import { LoadingSpinner } from "@components/spinner";

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
  tracking(`Switch Validator Screen`);
  const validatorAddress = route.params.validatorAddress;
  const { colors } = useTheme();
  const {
    chainStore,
    accountStore,
    queriesStore,
    modalStore,
    priceStore,
    appInitStore,
  } = useStore();

  const styles = styling(colors);

  const initialChainId =
    route.params["chainId"] || chainStore.current["chainId"];
  const chainId = initialChainId || chainStore.chainInfosInUI[0].chainId;

  useEffect(() => {
    if (!initialChainId) {
      navigation.goBack();
    }
  }, [initialChainId]);

  const account = accountStore.getAccount(chainId);
  const sender = account.bech32Address;
  const queries = queriesStore.get(chainId);
  const chainInfo = chainStore.getChain(chainId);
  const [dstValidatorInfo, setDstValidatorInfo] = useState({
    address: "",
    name: "",
  });

  const sendConfigs = useRedelegateTxConfig(
    chainStore,
    queriesStore,
    chainId,
    sender,
    validatorAddress,
    300000
  );
  sendConfigs.amountConfig.setCurrency(chainInfo.stakeCurrency);

  useEffect(() => {
    sendConfigs.recipientConfig.setValue(dstValidatorInfo.address);
  }, [dstValidatorInfo.address, sendConfigs.recipientConfig]);

  const gasSimulator = useGasSimulator(
    new AsyncKVStore("gas-simulator.screen.stake.redelegate/redelegate"),
    chainStore,
    chainId,
    sendConfigs.gasConfig,
    sendConfigs.feeConfig,
    "native",
    () => {
      return account.cosmos.makeBeginRedelegateTx(
        sendConfigs.amountConfig.amount[0].toDec().toString(),
        validatorAddress,
        dstValidatorInfo.address
      );
    }
  );

  const txConfigsValidate = useTxConfigsValidate({
    ...sendConfigs,
    gasSimulator,
  });

  const srcValidator =
    queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Bonded)
      .getValidator(validatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Unbonding)
      .getValidator(validatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Unbonded)
      .getValidator(validatorAddress);

  const srcValidatorThumbnail = srcValidator
    ? queries.cosmos.queryValidators
        .getQueryStatus(Staking.BondStatus.Bonded)
        .getValidatorThumbnail(validatorAddress) ||
      queries.cosmos.queryValidators
        .getQueryStatus(Staking.BondStatus.Unbonding)
        .getValidatorThumbnail(validatorAddress) ||
      queries.cosmos.queryValidators
        .getQueryStatus(Staking.BondStatus.Unbonded)
        .getValidatorThumbnail(validatorAddress)
    : undefined;

  const staked = queries.cosmos.queryDelegations
    .getQueryBech32Address(account.bech32Address)
    .getDelegationTo(validatorAddress);

  const [switchValidator, setSwitchValidator] = useState({
    avatar: "",
    moniker: "",
  });
  const unbondingPeriodDay = queries.cosmos.queryStakingParams.response
    ? queries.cosmos.queryStakingParams.unbondingTimeSec / (3600 * 24)
    : 21;

  useEffect(() => {
    if (appInitStore.getInitApp.feeOption) {
      const feeCurrency =
        sendConfigs.feeConfig.fees.length > 0
          ? sendConfigs.feeConfig.fees[0].currency
          : sendConfigs.feeConfig.selectableFeeCurrencies[0];
      sendConfigs.feeConfig.setFee({
        type: appInitStore.getInitApp.feeOption,
        currency: feeCurrency,
      });
    }
  }, [sendConfigs.feeConfig, appInitStore.getInitApp.feeOption]);

  const txStateIsValid = txConfigsValidate.interactionBlocked;

  const isDisable = !account.isReadyToSendMsgs || txStateIsValid;

  const _onPressSwitchValidator = async () => {
    if (!txConfigsValidate.interactionBlocked) {
      const tx = account.cosmos.makeBeginRedelegateTx(
        sendConfigs.amountConfig.amount[0].toDec().toString(),
        validatorAddress,
        dstValidatorInfo.address
      );
      try {
        await tx.send(
          sendConfigs.feeConfig.toStdFee(),
          sendConfigs.memoConfig.memo,
          {
            preferNoSetFee: true,
            preferNoSetMemo: true,
          },
          {
            onFulfill: (tx: any) => {
              if (tx.code != null && tx.code !== 0) {
                console.log(tx);
                showToast({
                  type: "danger",
                  message: "Your transaction Failed",
                });
                return;
              }
              showToast({
                type: "success",
                message: "Transaction Successful",
              });
            },
            onBroadcasted: (txHash) => {
              navigate(SCREENS.TxPendingResult, {
                txHash: Buffer.from(txHash).toString("hex"),
                data: {
                  type: "redelegate",
                  wallet: account.bech32Address,
                  validator: sendConfigs.recipientConfig.recipient,
                  amount: sendConfigs.amountConfig.amount[0],
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

          showToast({
            message: JSON.stringify(e),
            type: "danger",
          });
        }
      }
    }
  };

  const onPressSelectValidator = (address, avatar, moniker) => {
    setDstValidatorInfo({
      address,
      name: moniker,
    });
    setSwitchValidator({
      avatar,
      moniker,
    });
    modalStore.close();
  };
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <OWHeaderTitle
          title={"Redelegate"}
          subTitle={chainStore.current?.chainName}
        />
      ),
    });
  }, [chainStore.current?.chainName]);
  const _onPressFee = () => {
    modalStore.setOptions({
      bottomSheetModalConfig: {
        enablePanDownToClose: false,
        enableOverDrag: false,
      },
    });
    modalStore.setChildren(
      <FeeModal vertical={true} sendConfigs={sendConfigs} />
    );
  };
  return (
    <PageWithBottom
      bottomGroup={
        <OWButton
          label="Switch"
          disabled={isDisable}
          loading={account.isSendingMsg === "send"}
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
        {
          <View>
            {srcValidator ? (
              <OWCard
                style={{
                  backgroundColor: colors["neutral-surface-card"],
                }}
              >
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
              <OWCard
                style={{
                  backgroundColor: colors["neutral-surface-card"],
                }}
              >
                {dstValidatorInfo?.address ? (
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
                          dstValidatorAddress={dstValidatorInfo.address}
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
                          dstValidatorAddress={dstValidatorInfo.address}
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
            {dstValidatorInfo?.address ? (
              <View>
                <OWCard
                  style={{
                    paddingTop: 22,
                    backgroundColor: colors["neutral-surface-card"],
                  }}
                  type="normal"
                >
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
                            borderRadius: 999,
                            justifyContent: "center",
                          }}
                        >
                          <OWIcon
                            type="images"
                            style={{
                              borderRadius: 999,
                            }}
                            source={{
                              uri:
                                chainStore.current?.stakeCurrency
                                  .coinImageUrl || unknownToken.coinImageUrl,
                            }}
                            size={16}
                          />
                        </View>
                        <OWText
                          style={{ paddingLeft: 4 }}
                          weight="600"
                          size={14}
                        >
                          {chainStore.current?.stakeCurrency?.coinDenom ||
                            "Unknown"}
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
                    <OWIcon
                      name="tdesign_swap"
                      size={16}
                      color={colors["neutral-text-body"]}
                    />
                    <OWText
                      style={{ paddingLeft: 4 }}
                      color={colors["neutral-text-body"]}
                      size={14}
                    >
                      {priceStore
                        .calculatePrice(sendConfigs.amountConfig.amount[0])
                        .toString()}
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
                      {`When you unstake, a ${unbondingPeriodDay}-day cooldown period is required before your stake returns to your wallet.`}
                    </OWText>
                  </View>
                </OWCard>
                <OWCard
                  style={{
                    backgroundColor: colors["neutral-surface-card"],
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      borderBottomColor: colors["neutral-border-default"],
                      borderBottomWidth: 1,
                      paddingVertical: 16,
                      marginBottom: 8,
                      alignItems: "center",
                    }}
                  >
                    <OWText
                      color={colors["neutral-text-title"]}
                      weight="600"
                      size={16}
                    >
                      Transaction fee
                    </OWText>
                    <TouchableOpacity
                      style={{ flexDirection: "row", alignItems: "center" }}
                      onPress={_onPressFee}
                    >
                      <View
                        style={{
                          alignItems: "center",
                          paddingRight: 8,
                        }}
                      >
                        <OWText
                          color={colors["primary-text-action"]}
                          weight="600"
                          size={14}
                        >
                          {capitalizedText(sendConfigs.feeConfig.type)}
                        </OWText>
                        <OWText
                          color={colors["primary-text-action"]}
                          weight="500"
                          size={12}
                        >
                          {(() => {
                            if (sendConfigs.feeConfig.fees.length > 0) {
                              return sendConfigs.feeConfig.fees;
                            }
                            const chainInfo = chainStore.getChain(
                              sendConfigs.feeConfig.chainId
                            );

                            return [
                              new CoinPretty(
                                chainInfo.stakeCurrency ||
                                  chainInfo.currencies[0],
                                new Dec(0)
                              ),
                            ];
                          })()
                            .map((fee) =>
                              fee
                                .maxDecimals(6)
                                .inequalitySymbol(true)
                                .trim(true)
                                .shrink(true)
                                .hideIBCMetadata(true)
                                .toString()
                            )
                            .join("+")}
                        </OWText>
                      </View>

                      {sendConfigs.feeConfig.uiProperties.loadingState ||
                      gasSimulator?.uiProperties.loadingState ? (
                        <LoadingSpinner
                          size={14}
                          color={colors["background-btn-primary"]}
                        />
                      ) : (
                        <DownArrowIcon
                          height={11}
                          color={colors["primary-text-action"]}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
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

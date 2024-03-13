import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useSendTxConfig } from "@owallet/hooks";
import { useStore } from "../../stores";
import { EthereumEndpoint } from "@owallet/common";
import { PageWithScrollView } from "../../components/page";
import { StyleSheet, View, TouchableOpacity, ScrollView } from "react-native";
import { Dec, DecUtils } from "@owallet/unit";
import {
  AddressInput,
  AmountInput,
  MemoInput,
  CurrencySelector,
  FeeButtons,
  TextInput,
} from "../../components/input";
import { OWButton } from "../../components/button";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useTheme } from "@src/themes/theme-provider";
import { useSmartNavigation } from "../../navigation.provider";
import { Buffer } from "buffer";
import { metrics, spacing } from "../../themes";
import {
  handleSaveHistory,
  HISTORY_STATUS,
  showToast,
} from "@src/utils/helper";
import OWText from "@src/components/text/ow-text";
import OWCard from "@src/components/card/ow-card";
import { PageHeader } from "@src/components/header/header-new";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { StakeAmountInput } from "@src/components/input/stake-amount";
import { AlertIcon } from "@src/components/icon";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import { chainIcons } from "@oraichain/oraidex-common";

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
      color: colors["neutral-Text-body"],
    },
    containerStyle: {
      backgroundColor: colors["background-box"],
    },
    bottomBtn: {
      marginTop: 20,
      width: metrics.screenWidth / 2.3,
      borderRadius: 999,
      marginLeft: 12,
    },
  });

export const NewSendScreen: FunctionComponent = observer(() => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    analyticsStore,
    sendStore,
    keyRingStore,
  } = useStore();
  const { colors } = useTheme();
  const styles = styling(colors);
  const [customFee, setCustomFee] = useState(false);

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
          currency?: string;
          recipient?: string;
          contractAddress?: string;
        }
      >,
      string
    >
  >();

  const chainId = route?.params?.chainId
    ? route?.params?.chainId
    : chainStore?.current?.chainId;

  const account = accountStore.getAccount(chainId);
  const queries = queriesStore.get(chainId);
  const address = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
  );
  const sendConfigs = useSendTxConfig(
    chainStore,
    chainId,
    account.msgOpts["send"],
    address,
    queries.queryBalances,
    EthereumEndpoint,
    chainStore.current.networkType === "evm" &&
      queriesStore.get(chainStore.current.chainId).evm.queryEvmBalance,

    address
  );
  console.log(
    "🚀 ~ constSendScreen:FunctionComponent=observer ~ chainStore.current.chainId:",
    chainStore.current.chainId
  );
  useEffect(() => {
    if (route?.params?.currency) {
      const currency = sendConfigs.amountConfig.sendableCurrencies.find(
        (cur) => {
          if (cur?.contractAddress?.includes(route?.params?.contractAddress)) {
            return cur?.contractAddress?.includes(
              route?.params?.contractAddress
            );
          }
          //@ts-ignore

          if (
            cur?.contractAddress?.includes(
              route?.params?.contractAddress?.toLowerCase()
            )
          ) {
            return true;
          }
          if (cur?.coinMinimalDenom) {
            return cur?.coinMinimalDenom.includes(
              route?.params?.contractAddress
            );
          }
          //@ts-ignore

          if (cur?.type === "cw20") {
            return cur.coinDenom == route.params.currency;
          }
          if (cur.coinDenom === route.params.currency) {
            return cur.coinDenom === route.params.currency;
          }
          return cur.coinMinimalDenom == route.params.currency;
        }
      );

      if (currency) {
        sendConfigs.amountConfig.setSendCurrency(currency);
      }
    }
  }, [
    route?.params?.currency,
    sendConfigs.amountConfig,
    route?.params?.contractAddress,
  ]);

  const chainIcon = chainIcons.find(
    (c) => c.chainId === chainStore.current.chainId
  );

  useEffect(() => {
    if (route?.params?.recipient) {
      sendConfigs.recipientConfig.setRawRecipient(route.params.recipient);
    }
  }, [route?.params?.recipient, sendConfigs.recipientConfig]);

  const sendConfigError =
    sendConfigs.recipientConfig.getError() ??
    sendConfigs.amountConfig.getError() ??
    sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError();
  // ?? sendConfigs.feeConfig.getError();
  const txStateIsValid = sendConfigError == null;

  return (
    <PageWithBottom
      bottomGroup={
        <OWButton
          label="Stake"
          disabled={!account.isReadyToSendMsgs || !txStateIsValid}
          loading={account.isSendingMsg === "delegate"}
          onPress={async () => {}}
          style={[
            styles.bottomBtn,
            {
              width: metrics.screenWidth - 32,
            },
          ]}
          textStyle={{
            fontSize: 14,
            fontWeight: "600",
          }}
        />
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <PageHeader
          title="Send"
          subtitle={"Oraichain"}
          colors={colors}
          onPress={async () => {}}
        />
        <View>
          <OWCard>
            <OWText
              style={{ paddingBottom: 8 }}
              color={colors["neutral-text-title"]}
              size={12}
            >
              Recipient
            </OWText>

            <AddressInput
              colors={colors}
              placeholder="Enter address"
              label=""
              recipientConfig={sendConfigs.recipientConfig}
              memoConfig={sendConfigs.memoConfig}
              labelStyle={styles.sendlabelInput}
              inputContainerStyle={{
                backgroundColor: colors["neutral-surface-card"],
                borderWidth: 0,
              }}
            />
          </OWCard>
          <OWCard style={{ paddingTop: 22 }} type="normal">
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View style={{}}>
                <OWText style={{ paddingTop: 8 }} size={12}>
                  Balance : 0
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
                  <OWIcon
                    type="images"
                    source={{ uri: chainIcon?.Icon }}
                    size={16}
                  />
                  <OWText style={{ paddingLeft: 4 }} weight="600" size={14}>
                    ORAI
                  </OWText>
                </View>
              </View>
              <View
                style={{
                  alignItems: "flex-end",
                }}
              >
                <StakeAmountInput
                  colors={colors}
                  inputContainerStyle={{
                    borderWidth: 0,
                    width: metrics.screenWidth / 2,
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
              <OWIcon name="tdesign_swap" size={16} />
              <OWText
                style={{ paddingLeft: 4 }}
                color={colors["neutral-text-body"]}
                size={14}
              >
                0
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
                <OWText color={colors["primary-text-action"]} weight="600">
                  Fast: $0.01
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
      </ScrollView>
    </PageWithBottom>
  );
});

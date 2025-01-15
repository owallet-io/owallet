import React, { FunctionComponent, useLayoutEffect, useState } from "react";
import {
  IBtcFeeConfig,
  IFeeConfig,
  IGasConfig,
  IGasSimulator,
  InsufficientFeeError,
  ISenderConfig,
} from "@owallet/hooks";
import { observer } from "mobx-react-lite";
import { FormattedMessage, useIntl } from "react-intl";
import { useStore } from "../../../stores";
import { autorun } from "mobx";
import { CoinPretty, Dec, PricePretty } from "@owallet/unit";
import { Columns } from "../../column";
import { Box } from "../../box";
import { StyleSheet, Text, View } from "react-native";
import { useStyle } from "../../../styles";
import { Gutter } from "../../gutter";
import { TransactionFeeModal } from "./transaction-fee-modal";
import { GuideBox } from "../../guide-box";
import { UIConfigStore } from "../../../stores/ui-config";
import { IChainStore, IQueriesStore } from "@owallet/stores";
import { LoadingSpinner, SVGLoadingIcon } from "../../spinner";
import OwButtonIcon from "@components/button/ow-button-icon";
import OWIcon from "@components/ow-icon/ow-icon";
import { InformationModal } from "@src/modals/fee/infoModal";
import { TransactionBtcFeeModal } from "@components/input/fee-control/transaction-btc-fee-modal";
import { metrics, spacing } from "@src/themes";
import { useTheme } from "@src/themes/theme-provider";
import OWText from "@components/text/ow-text";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import { capitalizedText } from "@utils/helper";
import { DownArrowIcon } from "@components/icon";

export const useFeeOptionSelectionOnInit = (
  uiConfigStore: UIConfigStore,
  feeConfig: IFeeConfig | IBtcFeeConfig,
  disableAutomaticFeeSet: boolean | undefined
) => {
  useLayoutEffect(() => {
    if (disableAutomaticFeeSet) {
      return;
    }

    if (
      feeConfig.fees.length === 0 &&
      feeConfig.selectableFeeCurrencies.length > 0
    ) {
      if (uiConfigStore.rememberLastFeeOption && uiConfigStore.lastFeeOption) {
        feeConfig.setFee({
          type: uiConfigStore.lastFeeOption,
          currency: feeConfig.selectableFeeCurrencies[0],
        });
      } else {
        feeConfig.setFee({
          type: "average",
          currency: feeConfig.selectableFeeCurrencies[0],
        });
      }
    }
  }, [
    disableAutomaticFeeSet,
    feeConfig,
    feeConfig.fees,
    feeConfig.selectableFeeCurrencies,
    uiConfigStore.lastFeeOption,
    uiConfigStore.rememberLastFeeOption,
  ]);
};

export const useAutoFeeCurrencySelectionOnInit = (
  chainStore: IChainStore,
  queriesStore: IQueriesStore,
  senderConfig: ISenderConfig,
  feeConfig: IFeeConfig | IBtcFeeConfig,
  disableAutomaticFeeSet: boolean | undefined
) => {
  useLayoutEffect(() => {
    if (disableAutomaticFeeSet) {
      return;
    }

    // Require to invoke effect whenever chain is changed,
    // even though it is not used in logic.
    noop(feeConfig.chainId);

    // Try to find other fee currency if the account doesn't have enough fee to pay.
    // This logic can be slightly complex, so use mobx's `autorun`.
    // This part fairly different with the approach of react's hook.
    let skip = false;
    // Try until 500ms to avoid the confusion to user.
    const timeoutId = setTimeout(() => {
      skip = true;
    }, 500);

    const disposer = autorun(() => {
      if (
        !skip &&
        feeConfig.type !== "manual" &&
        feeConfig.selectableFeeCurrencies.length > 0 &&
        feeConfig.fees.length > 0
      ) {
        const queryBalances = queriesStore
          .get(feeConfig.chainId)
          .queryBalances.getQueryBech32Address(senderConfig.sender);

        const currentFeeCurrency = feeConfig.fees[0].currency;
        const currentFeeCurrencyBal =
          queryBalances.getBalanceFromCurrency(currentFeeCurrency);

        const currentFee = feeConfig.getFeeTypePrettyForFeeCurrency(
          currentFeeCurrency,
          feeConfig.type
        );
        if (currentFeeCurrencyBal.toDec().lt(currentFee.toDec())) {
          const isOsmosis =
            chainStore.hasChain(feeConfig.chainId) &&
            chainStore.getChain(feeConfig.chainId).hasFeature("osmosis-txfees");

          // Not enough balances for fee.
          // Try to find other fee currency to send.
          for (const feeCurrency of feeConfig.selectableFeeCurrencies) {
            const feeCurrencyBal =
              queryBalances.getBalanceFromCurrency(feeCurrency);
            const fee = feeConfig.getFeeTypePrettyForFeeCurrency(
              feeCurrency,
              feeConfig.type
            );

            if (isOsmosis && fee.toDec().lte(new Dec(0))) {
              continue;
            }

            if (feeCurrencyBal.toDec().gte(fee.toDec())) {
              feeConfig.setFee({
                type: feeConfig.type,
                currency: feeCurrency,
              });
              const uiProperties = feeConfig.uiProperties;
              skip =
                !uiProperties.loadingState &&
                uiProperties.error == null &&
                uiProperties.warning == null;
              return;
            }
          }
        }
      }
    });

    return () => {
      clearTimeout(timeoutId);
      skip = true;
      disposer();
    };
  }, [
    chainStore,
    disableAutomaticFeeSet,
    feeConfig,
    feeConfig.chainId,
    queriesStore,
    senderConfig.sender,
  ]);
};

export const FeeControl: FunctionComponent<{
  senderConfig: ISenderConfig;
  feeConfig: IFeeConfig | IBtcFeeConfig;
  gasConfig: IGasConfig;
  gasSimulator?: IGasSimulator;
  showDenom?: boolean;
  disableSelectFee?: boolean;
  disableAutomaticFeeSet?: boolean;
}> = observer(
  ({
    senderConfig,
    feeConfig,
    gasConfig,
    gasSimulator,
    disableAutomaticFeeSet,
    showDenom,
    disableSelectFee = false,
  }) => {
    const { queriesStore, priceStore, chainStore, uiConfigStore } = useStore();
    const intl = useIntl();
    const style = useStyle();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const hasError =
      feeConfig.uiProperties.error || feeConfig.uiProperties.warning;
    useFeeOptionSelectionOnInit(
      uiConfigStore,
      feeConfig,
      disableAutomaticFeeSet
    );

    useAutoFeeCurrencySelectionOnInit(
      chainStore,
      queriesStore,
      senderConfig,
      feeConfig,
      disableAutomaticFeeSet
    );
    const chainInfo = chainStore.getChain(feeConfig.chainId);
    const isBtc = chainInfo.features.includes("btc");
    const { colors } = useTheme();
    const styles = styling(colors);
    return (
      <View
        style={{
          width: "100%",
          borderBottomWidth: 1,
          paddingVertical: 16,
          borderBottomColor: colors["neutral-border-default"],

          marginBottom: 8,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",

            alignItems: "center",
          }}
        >
          <OWText color={colors["neutral-text-title"]} weight="600" size={16}>
            Estimated Fee
          </OWText>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={() => setIsModalOpen(true)}
            disabled={disableSelectFee}
          >
            <View
              style={{
                alignItems: "center",
                paddingRight: 8,
                flexDirection: "row",
              }}
            >
              <OWText
                color={colors["primary-text-action"]}
                weight="500"
                size={16}
              >
                {capitalizedText(feeConfig.type)}
                {": "}
              </OWText>
              <OWText
                color={colors["primary-text-action"]}
                weight="600"
                size={16}
              >
                {(() => {
                  let total: PricePretty | undefined | CoinPretty;
                  let hasUnknown = false;
                  for (const fee of feeConfig.fees) {
                    if (!fee.currency.coinGeckoId) {
                      hasUnknown = true;
                      break;
                    } else if (showDenom) {
                      if (!total) {
                        total = fee;
                      } else {
                        total = total.add(fee);
                      }
                    } else {
                      const price = priceStore.calculatePrice(fee);
                      if (price) {
                        if (!total) {
                          total = price;
                        } else {
                          total = total.add(price);
                        }
                      }
                    }
                  }

                  if (hasUnknown || !total) {
                    return "-";
                  }
                  if (total instanceof CoinPretty) {
                    return `${total.trim(true).toString()}`;
                  }
                  return `${total.toString()}`;
                })()}
              </OWText>
            </View>
            {feeConfig.uiProperties.loadingState ||
            gasSimulator?.uiProperties.loadingState ? (
              <LoadingSpinner
                size={14}
                color={colors["background-btn-primary"]}
              />
            ) : !disableSelectFee ? (
              <DownArrowIcon
                height={14}
                color={colors["primary-text-action"]}
              />
            ) : null}
          </TouchableOpacity>

          {isBtc ? (
            <TransactionBtcFeeModal
              isOpen={isModalOpen}
              close={() => setIsModalOpen(false)}
              setIsOpen={() => setIsModalOpen(false)}
              senderConfig={senderConfig}
              feeConfig={feeConfig}
              disableAutomaticFeeSet={disableAutomaticFeeSet}
            />
          ) : (
            <TransactionFeeModal
              isOpen={isModalOpen}
              close={() => setIsModalOpen(false)}
              setIsOpen={() => setIsModalOpen(false)}
              senderConfig={senderConfig}
              feeConfig={feeConfig as IFeeConfig}
              gasConfig={gasConfig}
              gasSimulator={gasSimulator}
              disableAutomaticFeeSet={disableAutomaticFeeSet}
            />
          )}
        </View>
        {hasError ? (
          <Box width="100%">
            <Gutter size={16} />

            <GuideBox
              hideInformationIcon={true}
              color="warning"
              title={
                (() => {
                  if (feeConfig.uiProperties.error) {
                    if (
                      feeConfig.uiProperties.error instanceof
                      InsufficientFeeError
                    ) {
                      return intl.formatMessage({
                        id: "components.input.fee-control.error.insufficient-fee",
                      });
                    }

                    return (
                      feeConfig.uiProperties.error.message ||
                      feeConfig.uiProperties.error.toString()
                    );
                  }

                  if (feeConfig.uiProperties.warning) {
                    return (
                      feeConfig.uiProperties.warning.message ||
                      feeConfig.uiProperties.warning.toString()
                    );
                  }

                  if (gasConfig.uiProperties.error) {
                    return (
                      gasConfig.uiProperties.error.message ||
                      gasConfig.uiProperties.error.toString()
                    );
                  }

                  if (gasConfig.uiProperties.warning) {
                    return (
                      gasConfig.uiProperties.warning.message ||
                      gasConfig.uiProperties.warning.toString()
                    );
                  }
                })() ?? ""
              }
              titleStyle={{ textAlign: "center" }}
            />
          </Box>
        ) : null}
      </View>
    );
  }
);

const noop = (..._args: any[]) => {
  // noop
};
const styling = (colors) =>
  StyleSheet.create({
    txtBtnSend: {
      fontSize: 16,
      fontWeight: "600",
      color: colors["neutral-text-action-on-dark-bg"],
    },
    inputContainerAddress: {
      backgroundColor: colors["neutral-surface-card"],
      borderWidth: 0,
      paddingHorizontal: 0,
    },
    containerEstimatePrice: {
      alignSelf: "flex-end",
      flexDirection: "row",
      alignItems: "center",
    },
    containerFee: {
      flexDirection: "row",
      justifyContent: "space-between",
      borderBottomColor: colors["neutral-border-default"],
      borderBottomWidth: 1,
      paddingVertical: 16,
      marginBottom: 8,
    },
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
    inputContainerMemo: {
      backgroundColor: colors["neutral-surface-card"],
      borderWidth: 0,
      paddingHorizontal: 0,
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

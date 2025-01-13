import React, { FunctionComponent } from "react";
import { useStore } from "../../../../stores";
import {
  IBtcFeeConfig,
  IFeeConfig,
  IGasConfig,
  InsufficientFeeError,
} from "@owallet/hooks";
import { observer } from "mobx-react-lite";
import { FormattedMessage, useIntl } from "react-intl";
import { useStyle } from "../../../../styles";
import { Box } from "../../../../components/box";
import { XAxis } from "../../../../components/axis";
import { Text, View } from "react-native";
import { CoinPretty, Dec, PricePretty } from "@owallet/unit";
import { Gutter } from "../../../../components/gutter";
import { GuideBox } from "../../../../components/guide-box";
import { useTheme } from "@src/themes/theme-provider";
import OWText from "@src/components/text/ow-text";
export const FeeSummary: FunctionComponent<{
  feeConfig: IFeeConfig | IBtcFeeConfig;
  gasConfig: IGasConfig;
}> = observer(({ feeConfig, gasConfig }) => {
  const { chainStore } = useStore();

  const intl = useIntl();
  const colors = useTheme();

  return (
    <React.Fragment>
      <Box
        // padding={16}
        backgroundColor={colors["neutral-surface-card"]}
        borderRadius={6}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingVertical: 16,
          }}
        >
          <OWText size={16} weight={"600"}>
            <FormattedMessage id="page.sign.components.fee-summary.fee" />
          </OWText>

          {(() => {
            if (feeConfig.fees.length > 0) {
              return feeConfig.fees;
            }
            const chainInfo = chainStore.getChain(feeConfig.chainId);
            return [
              new CoinPretty(
                chainInfo.stakeCurrency || chainInfo.currencies[0],
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
            .map((text) => {
              return (
                <OWText size={16} weight={"600"}>
                  {text}
                </OWText>
              );
            })}
        </View>
      </Box>

      {feeConfig.uiProperties.error || feeConfig.uiProperties.warning ? (
        <Box width="100%">
          <Gutter size={16} />

          <GuideBox
            hideInformationIcon={true}
            color="warning"
            title={
              (() => {
                if (feeConfig.uiProperties.error) {
                  if (
                    feeConfig.uiProperties.error instanceof InsufficientFeeError
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
    </React.Fragment>
  );
});

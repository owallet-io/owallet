import React, { FunctionComponent } from "react";
import { IFeeConfig } from "@owallet/hooks";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { Text, View } from "react-native";
import { FormattedMessage } from "react-intl";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

export const FeeSelector: FunctionComponent<{
  feeConfig: IFeeConfig;
}> = observer(({ feeConfig }) => {
  const { priceStore } = useStore();
  const style = useStyle();

  const feeCurrency =
    feeConfig.fees.length > 0
      ? feeConfig.fees[0].currency
      : feeConfig.selectableFeeCurrencies[0];

  if (!feeCurrency) {
    return null;
  }

  return (
    <View>
      <View>
        <TouchableWithoutFeedback
          onPress={() => {
            feeConfig.setFee({
              type: "low",
              currency: feeCurrency,
            });
          }}
        >
          <View
            style={{
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
              borderRightWidth: 1,
              borderRightColor: "black",
            }}
          >
            <Text>
              <FormattedMessage id="components.input.fee-control.modal.fee-selector.low" />
            </Text>

            {feeCurrency.coinGeckoId ? (
              <Text>
                {priceStore
                  .calculatePrice(
                    feeConfig.getFeeTypePrettyForFeeCurrency(feeCurrency, "low")
                  )
                  ?.toString() || "-"}
              </Text>
            ) : null}

            <Text>
              {feeConfig
                .getFeeTypePrettyForFeeCurrency(feeCurrency, "low")
                .maxDecimals(6)
                .inequalitySymbol(true)
                .trim(true)
                .hideIBCMetadata(true)
                .toString()}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>

      <View>
        <TouchableWithoutFeedback
          onPress={() => {
            feeConfig.setFee({
              type: "average",
              currency: feeCurrency,
            });
          }}
        >
          <View>
            <Text>
              <FormattedMessage id="components.input.fee-control.modal.fee-selector.average" />
            </Text>

            {feeCurrency.coinGeckoId ? (
              <Text>
                {priceStore
                  .calculatePrice(
                    feeConfig.getFeeTypePrettyForFeeCurrency(
                      feeCurrency,
                      "average"
                    )
                  )
                  ?.toString() || "-"}
              </Text>
            ) : null}

            <Text>
              {feeConfig
                .getFeeTypePrettyForFeeCurrency(feeCurrency, "average")
                .maxDecimals(6)
                .inequalitySymbol(true)
                .trim(true)
                .hideIBCMetadata(true)
                .toString()}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>

      <View>
        <TouchableWithoutFeedback
          onPress={() => {
            feeConfig.setFee({
              type: "high",
              currency: feeCurrency,
            });
          }}
        >
          <View
            style={{
              borderTopRightRadius: 8,
              borderBottomRightRadius: 8,
              borderLeftWidth: 1,
              borderLeftColor: "black",
            }}
          >
            <Text>
              <FormattedMessage id="components.input.fee-control.modal.fee-selector.high" />
            </Text>

            {feeCurrency.coinGeckoId ? (
              <Text>
                {priceStore
                  .calculatePrice(
                    feeConfig.getFeeTypePrettyForFeeCurrency(
                      feeCurrency,
                      "high"
                    )
                  )
                  ?.toString() || "-"}
              </Text>
            ) : null}

            <Text>
              {feeConfig
                .getFeeTypePrettyForFeeCurrency(feeCurrency, "high")
                .maxDecimals(6)
                .inequalitySymbol(true)
                .trim(true)
                .hideIBCMetadata(true)
                .toString()}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
});

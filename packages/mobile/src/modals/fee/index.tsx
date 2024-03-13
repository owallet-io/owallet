import React, { FunctionComponent, useState } from "react";
import { View } from "react-native";
import { useStore } from "../../stores";
import { FeeButtons, TextInput } from "@src/components/input";
import OWText from "@src/components/text/ow-text";
import { Dec, DecUtils } from "@owallet/unit";
import { Toggle } from "@src/components/toggle";

export const FeeModal: FunctionComponent<{
  sendConfigs;
  colors;
}> = ({ sendConfigs, colors }) => {
  const [customFee, setCustomFee] = useState(false);

  const { chainStore } = useStore();
  return (
    <View>
      {chainStore.current.networkType !== "evm" ? (
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
          <OWText
            style={{
              fontWeight: "700",
              fontSize: 16,
              lineHeight: 34,
              paddingHorizontal: 8,
              color: colors["primary-text"],
            }}
          >
            Custom Fee
          </OWText>
        </View>
      ) : null}
      {customFee && chainStore.current.networkType !== "evm" ? (
        <TextInput
          label="Fee"
          inputContainerStyle={{
            backgroundColor: colors["background-box"],
          }}
          placeholder="Type your Fee here"
          keyboardType={"numeric"}
          labelStyle={{
            fontSize: 14,
            fontWeight: "500",
            lineHeight: 20,
            color: colors["neutral-Text-body"],
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
          label="Transaction Fee"
          gasLabel="gas"
          feeConfig={sendConfigs.feeConfig}
          gasConfig={sendConfigs.gasConfig}
          labelStyle={{
            fontSize: 14,
            fontWeight: "500",
            lineHeight: 20,
            color: colors["neutral-Text-body"],
          }}
        />
      ) : null}
    </View>
  );
};

import React, { FunctionComponent, useState } from "react";
import { View } from "react-native";
import { useStore } from "../../stores";
import { FeeButtons, TextInput } from "@src/components/input";
import OWText from "@src/components/text/ow-text";
import { Dec, DecUtils } from "@owallet/unit";
import { Toggle } from "@src/components/toggle";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { metrics } from "@src/themes";
import { OWButton } from "@src/components/button";

export const FeeModal: FunctionComponent<{
  sendConfigs;
  colors;
  vertical;
  setFee;
}> = ({ sendConfigs, colors, vertical, setFee }) => {
  const [customFee, setCustomFee] = useState(false);

  const { chainStore, modalStore } = useStore();
  return (
    <View>
      {chainStore.current.networkType !== "evm" ? (
        <View
          style={{
            flexDirection: "row",
            paddingBottom: 16,
            alignItems: "center",
            justifyContent: "space-between",
            borderBottomColor: colors["neutral-border-default"],
            borderBottomWidth: 1,
            marginBottom: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 44,
                backgroundColor: colors["neutral-surface-action"],
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <OWIcon name={"edit"} size={16} />
            </View>

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
        </View>
      ) : null}
      {customFee && chainStore.current.networkType !== "evm" ? (
        <View style={{ paddingBottom: metrics.screenHeight / 5 }}>
          <TextInput
            label=""
            inputContainerStyle={{
              backgroundColor: colors["background-box"],
              borderRadius: 8,
              borderColor: colors["primary-surface-default"],
            }}
            placeholder="Fee amount"
            keyboardType={"numeric"}
            labelStyle={{
              fontSize: 14,
              fontWeight: "500",
              lineHeight: 20,
              color: colors["neutral-text-body"],
            }}
            onChangeText={(text) => {
              const fee = new Dec(Number(text.replace(/,/g, "."))).mul(
                DecUtils.getTenExponentNInPrecisionRange(6)
              );
              sendConfigs.feeConfig.setManualFee({
                amount: fee.roundUp().toString(),
                denom: sendConfigs.feeConfig.feeCurrency.coinMinimalDenom,
              });
              setFee({
                type: "Custom",
                value: `${sendConfigs.feeConfig.fee} ${sendConfigs.feeConfig.feeCurrency.coinDenom}`,
              });
            }}
          />
        </View>
      ) : chainStore.current.networkType !== "evm" ? (
        <FeeButtons
          setFee={setFee}
          vertical={vertical}
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
      <OWButton
        label="Confirm"
        onPress={async () => {
          modalStore.close();
        }}
        style={[
          {
            marginTop: 20,
            borderRadius: 999,
          },
        ]}
        textStyle={{
          fontSize: 14,
          fontWeight: "600",
        }}
      />
    </View>
  );
};

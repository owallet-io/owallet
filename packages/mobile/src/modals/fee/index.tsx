import React, { FunctionComponent, useEffect, useState } from "react";
import { View } from "react-native";
import { useStore } from "../../stores";
import { FeeButtons, TextInput } from "@src/components/input";
import OWText from "@src/components/text/ow-text";
import { CoinPretty, Dec, DecUtils, Int } from "@owallet/unit";
import { Toggle } from "@src/components/toggle";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { metrics } from "@src/themes";
import { OWButton } from "@src/components/button";
import { toAmount } from "@owallet/common";
import { CardModal } from "@src/modals/card";
import WrapViewModal from "@src/modals/wrap/wrap-view-modal";

export const CustomFee: FunctionComponent<{
  sendConfigs;
  colors;
}> = ({ sendConfigs, colors }) => {
  return (
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
        }}
      />
      {/* <View
        style={{
          alignSelf: "flex-end",
          flexDirection: "row",
          alignItems: "center",
          marginTop: 8
        }}
      >
        <OWIcon name="tdesign_swap" size={16} />
        <OWText style={{ paddingLeft: 4 }} color={colors["neutral-text-body"]} size={14}>
          {"0"}
        </OWText>
      </View> */}
    </View>
  );
};
export const FeeModal: FunctionComponent<{
  sendConfigs;
  colors;
  vertical;
}> = ({ sendConfigs, colors, vertical }) => {
  const [customGas, setCustomGas] = useState(false);

  const { chainStore, modalStore, priceStore } = useStore();

  return (
    <WrapViewModal
      style={{
        paddingHorizontal: 0,
      }}
      title="SET FEE"
      subTitle={"The fee required to successfully conduct a transaction"}
    >
      <View>
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
              <OWIcon name={"send"} size={16} />
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
              Custom Gas
            </OWText>
          </View>
          <Toggle
            on={customGas}
            onChange={(value) => {
              setCustomGas(value);
              // if (!value) {
              //   if (
              //     sendConfigs.feeConfig.feeCurrency &&
              //     !sendConfigs.feeConfig.fee
              //   ) {
              //     sendConfigs.feeConfig.setFeeType("average");
              //   }
              // }
            }}
          />
        </View>
        {customGas ? (
          <CustomFee sendConfigs={sendConfigs} colors={colors} />
        ) : (
          <FeeButtons
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
        )}
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
    </WrapViewModal>
  );
};

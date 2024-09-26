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
import { useTheme } from "@src/themes/theme-provider";

export const CustomFee: FunctionComponent<{
  gasConfig;
  colors;
}> = ({ gasConfig, colors }) => {
  return (
    <View style={{ paddingBottom: 5, paddingHorizontal: 1 }}>
      <TextInput
        label=""
        // isBottomSheet={true}
        inputContainerStyle={{
          backgroundColor: colors["neutral-surface-bg2"],
          borderRadius: 8,
          borderColor: colors["primary-surface-default"],
        }}
        maxLength={20}
        placeholder="Fee amount"
        keyboardType={"numeric"}
        labelStyle={{
          fontSize: 14,
          fontWeight: "500",
          lineHeight: 20,
          color: colors["neutral-text-body"],
        }}
        defaultValue={gasConfig.gasRaw}
        onChangeText={(text) => {
          gasConfig.setGas(text);
        }}
      />
    </View>
  );
};
export const FeeModal: FunctionComponent<{
  sendConfigs;
  vertical;
}> = ({ sendConfigs, vertical }) => {
  const [customGas, setCustomGas] = useState(false);
  const { colors } = useTheme();
  const { modalStore, chainStore, appInitStore } = useStore();

  useEffect(() => {
    if (appInitStore.getInitApp.feeOption) {
      sendConfigs.feeConfig.setFeeType(appInitStore.getInitApp.feeOption);
    }
  }, [appInitStore.getInitApp.feeOption]);

  return (
    <WrapViewModal
      style={{
        paddingHorizontal: 0,
      }}
      title="SET FEE"
      disabledScrollView={false}
      subTitle={"The fee required to successfully conduct a transaction"}
    >
      <View>
        {chainStore.current.networkType !== "bitcoin" && (
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
                <OWIcon
                  name={"wrench"}
                  color={colors["neutral-icon-on-light"]}
                  size={16}
                />
              </View>

              <OWText
                style={{
                  fontWeight: "700",
                  fontSize: 16,
                  lineHeight: 34,
                  paddingHorizontal: 8,
                  color: colors["neutral-text-title"],
                }}
              >
                Custom Gas
              </OWText>
            </View>
            <Toggle
              on={customGas}
              onChange={(value) => {
                setCustomGas(value);
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
        )}
        {customGas && (
          <CustomFee gasConfig={sendConfigs.gasConfig} colors={colors} />
        )}
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
            color: colors["neutral-text-body"],
          }}
        />
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

import { Text } from "@src/components/text";
import React, { FunctionComponent } from "react";
import { StyleSheet, View } from "react-native";
import { GasInput } from "../../../components/input";
import { colors, spacing, typography } from "../../../themes";

interface StakeAdvanceProps {
  config: any;
}

export const StakeAdvanceModal: FunctionComponent<StakeAdvanceProps> = ({
  config,
}) => {
  return (
    <View>
      <Text style={{ ...styles.title }}>{`Edit gas fee`}</Text>

      <GasInput label={"Gas limit"} gasConfig={config.gasConfig} />

      <GasInput label={"Gas price"} gasConfig={config.gasConfig} />

      <View>
        <Text>{`Total gas fee`}</Text>
        <Text
          style={{
            ...typography.h7,
            fontWeight: "700",
            color: colors["gray-900"],
          }}
        >
          {`0.2 ORAI`}
          <Text
            style={{
              ...typography.h7,
              fontWeight: "400",
              color: colors["gray-300"],
            }}
          >{`= $0.000008`}</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing["24"],
  },
  title: {
    ...typography.h6,
    color: colors["gray-900"],
    textAlign: "center",
    fontWeight: "700",
  },
});

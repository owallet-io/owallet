import { View } from "react-native";
import React, { FunctionComponent } from "react";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import { ISwapBox } from "../types";
import InputSelectToken from "./InputSelectToken";
import { BalanceText } from "./BalanceText";
import { styling } from "../styles";
import OWCard from "@src/components/card/ow-card";

export const SwapBox: FunctionComponent<ISwapBox> = observer(
  ({
    tokenActive,
    currencyValue,
    balanceValue,
    editable,
    type = "from",
    ...props
  }) => {
    const { colors } = useTheme();
    const styles = styling(colors);

    return (
      <OWCard
        style={{
          ...styles.containerInfo,
        }}
      >
        <InputSelectToken
          editable={editable}
          tokenActive={tokenActive}
          {...props}
        />
        <View style={styles.containerItemBottom}>
          <View>
            <BalanceText weight="500">
              Balance: {balanceValue || 0.0} {tokenActive.name}
            </BalanceText>
          </View>
          <BalanceText weight="500">≈ ${currencyValue || 0}</BalanceText>
        </View>
      </OWCard>
    );
  }
);

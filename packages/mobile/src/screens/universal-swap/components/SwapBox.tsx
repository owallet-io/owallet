import { View } from "react-native";
import React, { FunctionComponent } from "react";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import { OWBox } from "@src/components/card";
import { ISwapBox } from "../types";
import InputSelectToken from "./InputSelectToken";
import { BalanceText } from "./BalanceText";
import { styling } from "../styles";

export const SwapBox: FunctionComponent<ISwapBox> = observer(
  ({
    tokenActive,
    currencyValue,
    balanceValue,
    editable,
    tokenFee,
    ...props
  }) => {
    const { colors } = useTheme();
    const styles = styling(colors);
    return (
      <OWBox
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
            {tokenFee > 0 ? (
              <BalanceText size={13} style={styles.pt2} weight="500">
                Fee: {tokenFee || 0}%
              </BalanceText>
            ) : (
              <BalanceText size={13} style={styles.pt2} weight="500" />
            )}
          </View>
          {/* <BalanceText weight="500">≈ ${currencyValue || 0}</BalanceText> */}
        </View>
      </OWBox>
    );
  }
);

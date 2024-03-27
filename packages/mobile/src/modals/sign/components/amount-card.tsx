import React, { FC, ReactNode } from "react";
import OWCard from "@src/components/card/ow-card";
import OWText from "@src/components/text/ow-text";
import { observer } from "mobx-react-lite";
import { useTheme } from "@src/themes/theme-provider";

export const AmountCard: FC<{
  imageCoin: ReactNode | null;
  amountStr: string;
  totalPrice: string;
}> = observer(({ imageCoin, amountStr, totalPrice }) => {
  const { colors } = useTheme();
  return (
    <OWCard
      style={{
        height: 143,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {imageCoin}
      <OWText
        style={{
          textAlign: "center",
        }}
        size={28}
        color={colors["neutral-text-title"]}
        weight={"500"}
      >
        {amountStr}
      </OWText>
      <OWText
        style={{
          textAlign: "center",
        }}
        color={colors["neutral-text-body2"]}
        weight={"400"}
      >
        {totalPrice}
      </OWText>
    </OWCard>
  );
});

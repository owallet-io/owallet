import React, { FunctionComponent } from "react";
import { PageWithScrollView } from "../../../components/page";
import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { StyleSheet } from "react-native";
import { spacing } from "../../../themes";
import { ValidatorDetailsCard } from "./validator-details-card";
import { useTheme } from "@src/themes/theme-provider";
export const ValidatorDetailsScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          validatorAddress: string;
          apr: number;
        }
      >,
      string
    >
  >();
  const { colors } = useTheme();
  const validatorAddress = route.params.validatorAddress;
  const apr = route.params.apr;

  return (
    <PageWithScrollView backgroundColor={colors["background"]}>
      <ValidatorDetailsCard
        containerStyle={{
          ...styles.containerCard,
        }}
        validatorAddress={validatorAddress}
        apr={apr}
      />
    </PageWithScrollView>
  );
});

const styles = StyleSheet.create({
  containerCard: {
    borderRadius: spacing["24"],
    paddingVertical: spacing["20"],
    paddingHorizontal: spacing["24"],
    marginTop: spacing["16"],
  },
});

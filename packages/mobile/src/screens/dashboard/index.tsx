import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { PageWithScrollView } from "../../components/page";
import { StyleSheet, View } from "react-native";
import { spacing, typography } from "../../themes";
import { Text } from "@src/components/text";
import { DashboardCard } from "../home/dashboard";
import { BlockCard } from "./components/block";
import { InfoCard } from "./components/info";
import { useTheme } from "@src/themes/theme-provider";
import { OWSubTitleHeader } from "@src/components/header";

export const DashBoardScreen: FunctionComponent = observer(() => {
  const { colors } = useTheme();

  return (
    <PageWithScrollView backgroundColor={colors["background"]}>
      <View style={{ paddingBottom: spacing["24"] }}>
        <OWSubTitleHeader title="Dashboard" />
        <BlockCard />
        <DashboardCard canView={false} />
        <InfoCard />
      </View>
    </PageWithScrollView>
  );
});

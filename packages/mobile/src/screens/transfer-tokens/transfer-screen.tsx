import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Text } from "@src/components/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, CardBody, OWBox } from "../../components/card";
import { spacing } from "../../themes";
import TransferTokensHeader from "./transfer-header";
import TransferTokensOptions from "./transfer-options";
import TransferViewBtn from "./transfer-view-btn";
import { PageWithScrollViewInBottomTabView } from "../../components/page";
import { useTheme } from "@src/themes/theme-provider";
import { OWSubTitleHeader } from "@src/components/header";

const styles = StyleSheet.create({
  sendTokenCard: {
    borderRadius: spacing["24"],
    padding: spacing["12"],
  },
});

const TransferTokensScreen: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { colors } = useTheme();

  return (
    <PageWithScrollViewInBottomTabView
      style={[containerStyle]}
      backgroundColor={colors["background"]}
    >
      <OWSubTitleHeader title="Transfer" />
      <OWBox
        style={{
          padding: 0,
        }}
      >
        <CardBody>
          <TransferTokensOptions />
          <TransferViewBtn />
        </CardBody>
      </OWBox>
    </PageWithScrollViewInBottomTabView>
  );
});

export default TransferTokensScreen;

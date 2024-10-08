import React, { FunctionComponent } from "react";
import { Image, StyleSheet, View } from "react-native";
import { colors, metrics, spacing } from "../../themes";
import { useStore } from "../../stores";

import { useSimpleTimer } from "../../hooks";
import OWText from "@src/components/text/ow-text";
import OWButton from "@src/components/button/OWButton";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";

const styles = StyleSheet.create({
  img: {
    width: "100%",
    height: metrics.screenHeight * 0.45,
  },
  container: {
    paddingHorizontal: spacing["32"],
  },
  boardingRoot: {
    padding: spacing["32"],
    marginTop: spacing["15"],
  },
  boardingTitleContainer: {
    flexDirection: "row",
    marginBottom: spacing["12"],
  },
});

const GatewayIntroScreen: FunctionComponent = () => {
  const { appInitStore } = useStore();

  const { isTimedOut, setTimer } = useSimpleTimer();
  const onGetStarted = async () => {
    await appInitStore.updateInitApp();
    setTimer(1000);
    setTimeout(() => {
      navigate(SCREENS.RegisterIntro);
    }, 1000);
  };
  return (
    <View style={styles.container}>
      <View style={styles.boardingTitleContainer}>
        <View>
          <OWText variant="h1" typo="bold" color={colors["purple-h1"]}>
            Gateway to
          </OWText>
          <OWText variant="h2" typo="bold" color={colors["black"]}>
            Oraichain Ecosystem
          </OWText>
        </View>
      </View>
      <OWText variant="body2" typo="regular" color={colors["gray-150"]}>
        OWallet brings the richness of Oraichain to your hand.
      </OWText>
      <Image
        source={require("../../assets/image/onboarding-gateway.png")}
        fadeDuration={0}
        resizeMode="contain"
        style={styles.img}
      />
      <OWButton
        label="Get started!"
        onPress={onGetStarted}
        disabled={isTimedOut}
        loading={isTimedOut}
      />
    </View>
  );
};

export default GatewayIntroScreen;

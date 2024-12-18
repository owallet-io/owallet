import React, { FunctionComponent } from "react";
import { Image, StyleSheet, View } from "react-native";
import { colors, metrics, spacing } from "../../themes";
import OWText from "@src/components/text/ow-text";
import { eventTheme } from "@utils/helper";
import { imagesNoel } from "@assets/images/noels";
import images from "@assets/images";

const styles = StyleSheet.create({
  img: {
    width: "80%",
  },
  logo: {
    width: 22,
    height: 22,
    marginRight: 4,
  },
  viewImg: { alignItems: "center" },
  container: {
    paddingHorizontal: spacing["16"],
    paddingTop: 60,
    maxHeight: metrics.screenHeight,
  },
  boardingTitleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 16,
  },
  boardingIcon: {
    marginLeft: spacing["4"],
  },
  containerCheck: {
    justifyContent: "center",
    position: "absolute",
    top: 0,
    zIndex: -1,
  },
  content: {
    alignItems: "center",
    position: "absolute",
    bottom: metrics.screenHeight > 800 ? 0.1 * -metrics.screenHeight : 0,
    alignSelf: "center",
  },
  label: {
    fontSize: 28,
  },
  subtitle: {
    textAlign: "center",
  },
});

const WelcomeIntroScreen: FunctionComponent = () => {
  return (
    <View style={styles.container}>
      <View style={styles.containerCheck}>
        <Image
          style={{
            width: metrics.screenWidth,
            height: metrics.screenWidth,
          }}
          source={require("../../assets/image/img-bg.png")}
          resizeMode="contain"
          fadeDuration={0}
        />
      </View>

      <View>
        <View style={styles.boardingTitleContainer}>
          <View style={styles.boardingIcon}>
            <Image
              source={require("../../assets/logo/splash-image.png")}
              style={styles.logo}
            />
          </View>

          <View>
            <OWText
              size={18}
              weight={"800"}
              color={colors["nertural-text-title"]}
            >
              OWallet
            </OWText>
          </View>
        </View>
        <View style={styles.viewImg}>
          <Image
            source={
              eventTheme === "noel" ? imagesNoel.img_planet : images.img_planet
            }
            fadeDuration={0}
            resizeMode="contain"
            style={styles.img}
          />
        </View>
        <View style={styles.content}>
          <OWText
            style={styles.label}
            weight="800"
            color={colors["nertural-text-title"]}
          >
            MANAGING
          </OWText>
          <OWText
            style={styles.label}
            weight="800"
            color={colors["nertural-text-title"]}
          >
            WEB3 ASSETS
          </OWText>
          <OWText
            style={styles.subtitle}
            variant="body2"
            typo="regular"
            color={colors["gray-150"]}
          >
            Cosmos x EVM in one wallet
          </OWText>
          <OWText
            style={styles.subtitle}
            variant="body2"
            typo="regular"
            color={colors["gray-150"]}
          >
            Seamless bridge for Bitcoin on Oraichain
          </OWText>
        </View>
      </View>
    </View>
  );
};

export default WelcomeIntroScreen;

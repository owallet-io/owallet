import { Image, ImageSourcePropType, StyleSheet, View } from "react-native";
import image from "@src/assets/images";
import { Text } from "@src/components/text";
import OWCard from "@src/components/card/ow-card";
import { capitalizedText } from "@src/utils/helper";
import { metrics } from "@src/themes";
import React, { FC, ReactNode } from "react";
import { useTheme } from "@src/themes/theme-provider";

const styling = (colors) => {
  return StyleSheet.create({
    containerLogo: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    logo: {
      width: 20,
      height: 20,
    },
    textLogo: {
      paddingLeft: 8,
    },
    containerCard: {
      paddingVertical: 20,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 2,
    },
    msgType: {
      textAlign: "center",
      paddingBottom: 8,
    },
    imageType: {
      width: metrics.screenWidth - 104,
      height: 12,
    },
    amount: {
      textAlign: "center",
      paddingTop: 16,
    },
  });
};
export const HeaderTx: FC<{
  type: string;
  imageType: ImageSourcePropType | ReactNode;
  amount: string;
  price: string;
}> = ({ type, imageType, amount, price }) => {
  const { colors } = useTheme();
  const styles = styling(colors);
  return (
    <>
      <View style={styles.containerLogo}>
        <Image source={image.logo_owallet} style={styles.logo} />
        <Text
          color={colors["neutral-text-title"]}
          size={18}
          weight={"600"}
          style={styles.textLogo}
        >
          OWallet
        </Text>
      </View>
      <OWCard style={styles.containerCard}>
        <Text
          style={styles.msgType}
          color={colors["neutral-text-title"]}
          size={16}
          weight={"500"}
        >
          {type}
        </Text>
        {imageType ? imageType : null}
        <Text
          color={colors["neutral-text-title"]}
          style={styles.amount}
          size={28}
          weight={"500"}
        >
          {amount}
        </Text>
        <Text
          color={colors["neutral-text-body"]}
          style={{
            textAlign: "center",
          }}
        >
          {price}
        </Text>
      </OWCard>
    </>
  );
};

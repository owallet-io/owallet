import { Text } from "@src/components/text";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { PageWithView } from "../../components/page";
import { useTheme } from "@src/themes/theme-provider";
import { metrics } from "../../themes";

export const LoadingWalletScreen: FunctionComponent = observer((props) => {
  const { colors } = useTheme();

  const styles = styling(colors);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevCount) => {
        if (prevCount === 3) {
          return 1; // Reset to 1
        } else {
          return prevCount + 1; // Increment count
        }
      });
    }, 600); // Interval in milliseconds

    return () => {
      clearInterval(interval); // Clean up interval on component unmount
    };
  }, []);

  return (
    <PageWithView
      disableSafeArea
      style={{
        backgroundColor: colors["neutral-surface-card"],
        justifyContent: "space-between",
      }}
    >
      <View
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <View>
          <View style={styles.container}>
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
          <View style={styles.containerCheck}>
            <Image
              style={styles.img}
              source={require("../../assets/image/logo_group.png")}
              resizeMode="contain"
              fadeDuration={0}
            />
            <Text size={28} weight={"700"} style={styles.text}>
              {props?.mode === "add" ? "CREATING" : "IMPORTING"}
            </Text>
            <Text size={28} weight={"700"} style={styles.text}>
              YOUR WALLET
              {Array.from({ length: count }, (_, index) => ".").map((d) => {
                return (
                  <Text size={28} weight={"700"} style={styles.text}>
                    {d}
                  </Text>
                );
              })}
            </Text>
          </View>
        </View>
      </View>
    </PageWithView>
  );
});

const styling = (colors) =>
  StyleSheet.create({
    btnDone: {
      width: "100%",
      alignItems: "center",
      padding: 16,
      marginBottom: 42,
    },
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      top: 0,
    },
    containerCheck: {
      alignItems: "center",
      justifyContent: "center",
      width: metrics.screenWidth,
      height: metrics.screenHeight,
    },
    text: {
      color: colors["neutral-text-title"],
      lineHeight: 34,
    },
    img: {
      width: metrics.screenWidth / 1.6,
      height: metrics.screenWidth / 1.6,
      marginBottom: 32,
    },
  });

import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useTheme } from "@src/themes/theme-provider";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";
import OWText from "@src/components/text/ow-text";
import { useSmartNavigation } from "@src/navigation.provider";
import { useStore } from "@src/stores";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { OWButton } from "@src/components/button";
import { checkRouter } from "@src/router/root";
import { metrics } from "@src/themes";
import { ScrollView } from "react-native-gesture-handler";
import { CopyFillIcon } from "@src/components/icon";

export const HistoryDetail: FunctionComponent = observer((props) => {
  const route = useRoute<RouteProp<Record<string, {}>, string>>();

  const { colors } = useTheme();

  const styles = useStyles(colors);

  const smartNavigation = useSmartNavigation();

  const onGoBack = () => {
    smartNavigation.goBack();
  };

  const renderTransactionDetail = (title, content, copyable = true) => {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottomColor: colors["neutral-border-default"],
          borderBottomWidth: 1,
          paddingBottom: 8,
        }}
      >
        <View>
          <OWText weight="600">{title}</OWText>
          <OWText color={colors["neutral-text-body"]} style={{ paddingTop: 4 }}>
            {content}
          </OWText>
        </View>

        {copyable ? (
          <CopyFillIcon size={24} color={colors["neutral-icon-on-light"]} />
        ) : null}
      </View>
    );
  };

  return (
    <View>
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 160,
        }}
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <TouchableOpacity onPress={onGoBack} style={styles.goBack}>
            <OWIcon
              size={16}
              color={colors["neutral-icon-on-light"]}
              name="arrow-left"
            />
          </TouchableOpacity>
          <View style={[styles.aic, styles.title]}>
            <OWText
              variant="heading"
              style={{ textAlign: "center" }}
              typo="bold"
            >
              Transaction Detail
            </OWText>
          </View>
          <View
            style={{
              backgroundColor: colors["neutral-surface-card"],
              width: metrics.screenWidth - 32,
              borderRadius: 24,
              position: "relative",
              justifyContent: "center",
              alignItems: "center",
              padding: 16,
              overflow: "hidden",
            }}
          >
            <Image
              style={{
                width: metrics.screenWidth - 32,
                height: 260,
                position: "absolute",
              }}
              source={require("../../assets/image/img-bg.png")}
              resizeMode="cover"
              fadeDuration={0}
            />
            <OWText style={{ fontSize: 16, fontWeight: "500" }}>Receive</OWText>
            <View
              style={{
                backgroundColor: colors["hightlight-surface-subtle"],
                paddingHorizontal: 12,
                paddingVertical: 2,
                borderRadius: 12,
                marginBottom: 10,
              }}
            >
              <OWText
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: colors["hightlight-text-title"],
                }}
              >
                Success
              </OWText>
            </View>

            <OWText
              style={{
                fontSize: 28,
                fontWeight: "500",
                color: colors["success-text-body"],
              }}
            >
              +100 ORAI
            </OWText>
            <OWText
              style={{ fontSize: 14, color: colors["neutral-text-body"] }}
            >
              $524.23
            </OWText>
          </View>
          <View
            style={{
              backgroundColor: colors["neutral-surface-card"],
              width: metrics.screenWidth - 32,
              borderRadius: 24,
              marginTop: 1,
              padding: 16,
            }}
          >
            {renderTransactionDetail("From", "asdasdasdasdasd")}
            {renderTransactionDetail("From", "asdasdasdasdasd")}
            {renderTransactionDetail("From", "asdasdasdasdasd")}
            {renderTransactionDetail("From", "asdasdasdasdasd")}
            {renderTransactionDetail("From", "asdasdasdasdasd")}
            {renderTransactionDetail("From", "asdasdasdasdasd")}
            {renderTransactionDetail("From", "asdasdasdasdasd")}
            {renderTransactionDetail("From", "asdasdasdasdasd")}
            {renderTransactionDetail("From", "asdasdasdasdasd")}
          </View>
        </View>
      </ScrollView>

      <View style={styles.aic}>
        <View style={styles.signIn}>
          <OWButton
            style={{
              borderRadius: 32,
            }}
            label={"View on Explorer"}
            loading={false}
            disabled={false}
            onPress={() => {}}
          />
        </View>
      </View>
    </View>
  );
});

const useStyles = (colors) => {
  return StyleSheet.create({
    padIcon: {
      width: 22,
      height: 22,
    },

    container: {
      paddingTop: metrics.screenHeight / 14,
      height: "100%",
      backgroundColor: colors["neutral-surface-bg2"],
    },
    signIn: {
      width: "100%",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: colors["neutral-border-default"],
      padding: 16,
      position: "absolute",
      bottom: 30,
      paddingVertical: 12,
      backgroundColor: colors["neutral-surface-card"],
    },
    aic: {
      alignItems: "center",
      paddingBottom: 20,
    },
    rc: {
      flexDirection: "row",
      alignItems: "center",
    },
    goBack: {
      backgroundColor: colors["neutral-surface-card"],
      borderRadius: 999,
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 16,
    },
    title: {
      paddingHorizontal: 16,
      paddingTop: 24,
    },
    input: {
      width: metrics.screenWidth - 32,
      borderColor: colors["neutral-border-strong"],
    },
    textInput: { fontWeight: "600", paddingLeft: 4, fontSize: 15 },
  });
};

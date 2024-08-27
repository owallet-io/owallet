import OWText from "@src/components/text/ow-text";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useCallback, useState } from "react";
import {
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useStore } from "../../../stores";
import { metrics, spacing } from "@src/themes";
import OWIcon from "@src/components/ow-icon/ow-icon";

export const StakingInfraScreen: FunctionComponent = observer(() => {
  const { chainStore } = useStore();
  const { colors } = useTheme();
  const styles = styling(colors);
  const [search, setSearch] = useState("");

  const renderOWalletValidators = () => {
    return (
      <View
        style={{
          justifyContent: "center",
          padding: 16,
        }}
      >
        <View>
          <OWText size={15} weight={"600"}>
            {`Native Staking`}
          </OWText>
          <View
            style={{
              paddingTop: 16,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: colors["neutral-surface-card-brutal"],
                borderRadius: 16,
                borderWidth: 2,
                borderColor: colors["neutral-border-brutal"],
                width: metrics.screenWidth / 2.25,
              }}
            >
              <View
                style={{
                  position: "absolute",
                  right: 0,
                  backgroundColor: colors["primary-surface-default"],
                  paddingHorizontal: 15,
                  paddingVertical: 5,
                  borderTopRightRadius: 16,
                  borderBottomLeftRadius: 16,
                }}
              >
                <OWText
                  color={colors["neutral-text-action-on-dark-bg"]}
                  size={10}
                  weight={"500"}
                >
                  {`Recommended`.toUpperCase()}
                </OWText>
              </View>
              <View style={{ padding: 16 }}>
                <Image
                  style={{
                    width: 32,
                    height: 32,
                  }}
                  source={require("../../../assets/logo/owallet_logo.png")}
                />
                <OWText
                  style={{ marginTop: 12, marginBottom: 4 }}
                  weight={"500"}
                >
                  Stake ORAI
                </OWText>
                <OWText
                  style={{ marginBottom: 24 }}
                  color={colors["neutral-text-body"]}
                  size={12}
                >
                  OWALLET on Oraichain
                </OWText>
                <OWText
                  color={colors["success-text-body"]}
                  size={16}
                  weight="500"
                >
                  APR: 25.56%
                </OWText>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: colors["neutral-surface-card-brutal"],
                borderRadius: 16,
                borderWidth: 2,
                borderColor: colors["neutral-border-brutal"],
                width: metrics.screenWidth / 2.25,
              }}
            >
              <View style={{ padding: 16 }}>
                <Image
                  style={{
                    width: 32,
                    height: 32,
                  }}
                  source={require("../../../assets/logo/osmosis.png")}
                />
                <OWText
                  style={{ marginTop: 12, marginBottom: 4 }}
                  weight={"500"}
                >
                  Stake OSMO
                </OWText>
                <OWText
                  style={{ marginBottom: 24 }}
                  color={colors["neutral-text-body"]}
                  size={12}
                >
                  OWALLET on Osmosis
                </OWText>
                <OWText
                  color={colors["success-text-body"]}
                  size={16}
                  weight="500"
                >
                  APR: 10.16%
                </OWText>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderNetworkItem = useCallback(() => {
    return (
      <View style={styles.networkItem}>
        <View style={[styles.row, styles.aic]}>
          <View style={[styles.row, styles.aic]}>
            <View style={styles.chainIcon}>
              <Image
                style={styles.icon}
                source={require("../../../assets/logo/osmosis.png")}
              />
            </View>
            <OWText size={16} weight="600">
              Osmosis
            </OWText>
          </View>
          <OWText size={16} weight="500" color={colors["success-text-body"]}>
            17.56%
          </OWText>
        </View>
        <View style={styles.borderBottom} />
      </View>
    );
  }, []);

  const renderNetworks = () => {
    return (
      <View>
        <View style={styles.container}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                backgroundColor: colors["neutral-surface-action"],
                height: 40,
                borderRadius: 999,
                width: metrics.screenWidth - 32,
                alignItems: "center",
                paddingHorizontal: 12,
              }}
            >
              <View style={{ paddingRight: 4 }}>
                <OWIcon
                  color={colors["neutral-icon-on-light"]}
                  name="tdesign_search"
                  size={16}
                />
              </View>
              <TextInput
                style={{
                  fontFamily: "SpaceGrotesk-Regular",
                  width: "100%",
                  color: colors["neutral-text-body"],
                }}
                value={search}
                placeholderTextColor={colors["neutral-text-body"]}
                placeholder="Search for a chain"
                onChangeText={(t) => setSearch(t)}
              />
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
              marginTop: 16,
            }}
          >
            <TouchableOpacity onPress={() => {}}>
              <OWText color={colors["neutral-text-body3"]} weight="600">
                {"Network"}
              </OWText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}}>
              <OWText color={colors["neutral-text-body3"]} weight="600">
                {"Max APR"}
              </OWText>
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 22 }}>
            {renderNetworkItem()}
            {renderNetworkItem()}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View>
      <View
        style={{
          position: "relative",
        }}
      >
        <Image
          style={{
            width: metrics.screenWidth,
            height: metrics.screenHeight / 3,
            position: "absolute",
            top: 0,
          }}
          source={require("../../../assets/image/img-bg.png")}
        />
      </View>
      {renderOWalletValidators()}
      {renderNetworks()}
    </View>
  );
});

const styling = (colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors["neutral-surface-card"],
      marginTop: spacing["16"],
      borderRadius: 16,
      padding: 16,
      justifyContent: "center",
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    aic: {
      alignItems: "center",
    },
    networkItem: {
      marginBottom: 16,
    },
    chainIcon: {
      padding: 8,
      borderRadius: 999,
      backgroundColor: colors["neutral-surface-action"],
      marginRight: 16,
    },
    icon: {
      width: 28,
      height: 28,
    },
    borderBottom: {
      backgroundColor: colors["neutral-border-default"],
      width: "100%",
      height: 1,
      marginTop: 16,
    },
  });

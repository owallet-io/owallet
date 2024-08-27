import OWCard from "@src/components/card/ow-card";
import OWIcon from "@src/components/ow-icon/ow-icon";
import OWText from "@src/components/text/ow-text";
import { EarningCardNew } from "@src/screens/home/components/earning-card-new";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useStore } from "../../../stores";
import { ValidatorList } from "../validator-list/new-list";
import { metrics } from "@src/themes";

export const StakingInfraScreen: FunctionComponent = observer(() => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    priceStore,
    modalStore,
    appInitStore,
  } = useStore();

  const { colors } = useTheme();
  const styles = styling(colors);
  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const queryDelegated = queries.cosmos.queryDelegations.getQueryBech32Address(
    account.bech32Address
  );
  const delegated = queryDelegated.total;

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

  const renderNetworkds = () => {
    return (
      <View>
        <OWText>
          <ValidatorList />
        </OWText>
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
      {renderNetworkds()}
    </View>
  );
});

const styling = (colors) =>
  StyleSheet.create({
    containerEarnStyle: {
      backgroundColor: colors["neutral-surface-bg2"],
      margin: 0,
    },
    "text-earn": {
      fontWeight: "600",
      fontSize: 16,
      lineHeight: 24,
      color: colors["neutral-text-title"],
    },
    "claim-title": {
      width: 24,
      height: 24,
      borderRadius: 24,
      backgroundColor: colors["neutral-surface-action"],
      marginRight: 5,
      alignItems: "center",
      justifyContent: "center",
    },

    "text-amount": {
      fontWeight: "500",
      fontSize: 28,
      lineHeight: 34,
    },

    amount: {
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 20,
      color: colors["neutral-text-title"],
    },
  });

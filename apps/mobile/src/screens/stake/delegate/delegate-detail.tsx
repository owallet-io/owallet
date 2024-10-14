import { ValidatorThumbnails } from "@owallet/common";
import { BondStatus } from "@owallet/stores";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { OWButton } from "@src/components/button";
import { OWBox } from "@src/components/card";
import { OWSubTitleHeader } from "@src/components/header";
import { PageWithView } from "@src/components/page";
import { Text } from "@src/components/text";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useMemo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ValidatorThumbnail } from "../../../components/thumbnail";

import { useStore } from "../../../stores";
import { spacing, typography } from "../../../themes";
import { tracking } from "@src/utils/tracking";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";
import { OWHeaderTitle } from "@components/header";
import OWCard from "@src/components/card/ow-card";
interface DelegateDetailProps {}

export const DelegateDetailScreen: FunctionComponent<DelegateDetailProps> =
  observer(({}) => {
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
    const { chainStore, queriesStore, accountStore } = useStore();
    const { colors } = useTheme();
    const styles = styling(colors);
    const validatorAddress = route?.params?.validatorAddress;
    const apr = route?.params?.apr;
    const account = accountStore.getAccount(chainStore.current.chainId);
    const queries = queriesStore.get(chainStore.current.chainId);

    const staked = queries.cosmos.queryDelegations
      .getQueryBech32Address(account.bech32Address)
      .getDelegationTo(validatorAddress);

    const rewards = queries.cosmos.queryRewards
      .getQueryBech32Address(account.bech32Address)
      .getStakableRewardOf(validatorAddress);

    const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
      BondStatus.Bonded
    );
    const unbondingValidators = queries.cosmos.queryValidators.getQueryStatus(
      BondStatus.Unbonding
    );
    const unbondedValidators = queries.cosmos.queryValidators.getQueryStatus(
      BondStatus.Unbonded
    );
    const thumbnail =
      bondedValidators.getValidatorThumbnail(validatorAddress) ||
      unbondingValidators.getValidatorThumbnail(validatorAddress) ||
      unbondedValidators.getValidatorThumbnail(validatorAddress);
    const validator = useMemo(() => {
      return bondedValidators.validators
        .concat(unbondingValidators.validators)
        .concat(unbondedValidators.validators)
        .find((val) => val.operator_address === validatorAddress);
    }, [
      bondedValidators.validators,
      unbondingValidators.validators,
      unbondedValidators.validators,
      validatorAddress,
    ]);
    tracking(`Delegate Detail Screen`);
    const navigation = useNavigation();
    useEffect(() => {
      navigation.setOptions({
        headerTitle: () => (
          <OWHeaderTitle
            title={"delegate"}
            subTitle={chainStore.current?.chainName}
          />
        ),
      });
    }, [chainStore.current?.chainName]);
    return (
      <PageWithView>
        <OWSubTitleHeader title="Staking detail" />
        <OWCard
          style={{
            backgroundColor: colors["neutral-surface-card"],
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <ValidatorThumbnail
              style={styles.validatorThumbnail}
              size={38}
              url={thumbnail}
            />
            <Text
              style={{
                ...styles.textInfo,
                marginLeft: spacing["12"],
                flexShrink: 1,
                color: colors["primary-text"],
              }}
            >
              {validator?.description.moniker ?? "..."}
            </Text>
          </View>

          <View
            style={{
              marginTop: spacing["20"],
              flexDirection: "row",
            }}
          >
            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={{
                  ...styles.textInfo,
                  marginBottom: spacing["4"],
                  color: colors["primary-text"],
                }}
              >
                Staking
              </Text>
              <Text
                style={{
                  ...styles.textBlock,
                  color: colors["sub-primary-text"],
                }}
              >
                {staked.trim(true).shrink(true).maxDecimals(6).toString()}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                alignItems: "flex-end",
              }}
            >
              <Text
                style={{
                  ...styles.textInfo,
                  marginBottom: spacing["4"],
                  color: colors["primary-text"],
                }}
              >
                APR
              </Text>
              <Text
                style={{
                  ...styles.textBlock,
                  color: colors["sub-primary-text"],
                }}
              >
                {apr.toFixed(2).toString() + "%"}
              </Text>
            </View>
          </View>

          <View
            style={{
              marginTop: spacing["20"],
              flexDirection: "row",
            }}
          >
            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={{
                  ...styles.textInfo,
                  marginBottom: spacing["4"],
                  color: colors["primary-text"],
                }}
              >
                Rewards
              </Text>
              <Text
                style={{
                  ...styles.textBlock,
                  color: colors["sub-primary-text"],
                }}
              >
                {rewards?.trim(true).shrink(true).maxDecimals(6).toString()}
              </Text>
            </View>
            <TouchableOpacity
              style={{
                flex: 1,
                alignItems: "flex-end",
                justifyContent: "center",
              }}
              onPress={() => {
                navigate(SCREENS.ValidatorDetails, {
                  validatorAddress,
                  apr,
                });
              }}
            >
              <Text
                style={{
                  ...typography.h7,
                  color: colors["primary-surface-default"],
                }}
              >{`Validator details`}</Text>
            </TouchableOpacity>
          </View>
        </OWCard>

        <View style={styles.containerAllBtn}>
          <OWButton
            style={styles.containerBtn}
            label="Stake more"
            onPress={() => {
              navigate(SCREENS.Delegate, {
                validatorAddress,
              });
            }}
          />
          <OWButton
            style={styles.containerBtn}
            type="secondary"
            label="Switch validator"
            onPress={() => {
              navigate(SCREENS.Redelegate, {
                validatorAddress,
              });
            }}
          />

          <OWButton
            style={styles.containerBtn}
            type="link"
            label="Unstake"
            textStyle={{
              color: colors["red-500"],
            }}
            onPress={() => {
              navigate(SCREENS.Undelegate, { validatorAddress });
            }}
          />
        </View>
      </PageWithView>
    );
  });

const styling = (colors) =>
  StyleSheet.create({
    containerAllBtn: {
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    containerBtn: {
      marginBottom: 20,
    },
    title: {
      ...typography.h3,
      fontWeight: "700",
      color: colors["gray-900"],
      textAlign: "center",
    },
    containerInfo: {
      backgroundColor: colors["neutral-surface-bg2"],
      borderRadius: spacing["24"],
      padding: spacing["24"],
    },
    textInfo: {
      ...typography.h6,
      fontWeight: "700",
    },
    textBlock: {
      ...typography.h7,
      fontWeight: "400",
    },

    textBtn: {
      ...typography.h6,
      color: colors["white"],
      fontWeight: "700",
    },
    validatorThumbnail: {
      borderRadius: spacing["6"],
      backgroundColor: colors["white"],
    },
  });

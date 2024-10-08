import { BondStatus } from "@owallet/stores";
import OWText from "@src/components/text/ow-text";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useState } from "react";
import { useIntl } from "react-intl";
import { TouchableOpacity, View, ViewStyle } from "react-native";
import { ProgressBar } from "../../../components/progress-bar";
import { DownArrowIcon } from "@src/components/icon";
import { useStore } from "../../../stores";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { metrics } from "@src/themes";

export const UndelegationsCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, accountStore, queriesStore } = useStore();
  const { colors } = useTheme();
  const [collapse, setCollapse] = useState(true);
  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const unbondings =
    queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
      account.bech32Address
    ).unbondingBalances;

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Bonded
  );
  const unbondingValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Unbonding
  );
  const unbondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Unbonded
  );
  const stakingParams = queries.cosmos.queryStakingParams;

  const intl = useIntl();

  return unbondings?.length <= 0 ? null : (
    <View style={{ marginTop: 16 }}>
      <TouchableOpacity
        onPress={() => {
          setCollapse(!collapse);
        }}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          backgroundColor: colors["neutral-surface-action2"],
          borderRadius: 24,
          paddingHorizontal: 12,
          paddingVertical: 8,
          alignItems: "center",
        }}
      >
        <OWText weight="500" color={colors["neutral-text-action-on-light-bg"]}>
          Unstaking({unbondings.length})
        </OWText>

        {collapse ? (
          <OWIcon
            name="chevron_right"
            color={colors["neutral-text-action-on-light-bg"]}
            size={16}
          />
        ) : (
          <DownArrowIcon
            height={12}
            color={colors["neutral-text-action-on-light-bg"]}
          />
        )}
      </TouchableOpacity>

      {collapse ? null : (
        <View>
          {unbondings.map((unbonding, unbondingIndex) => {
            const validator = bondedValidators.validators
              .concat(unbondingValidators.validators)
              .concat(unbondedValidators.validators)
              .find(
                (val) => val.operator_address === unbonding.validatorAddress
              );

            const entries = unbonding.entries;
            const isLastUnbondingIndex =
              unbondingIndex === unbondings.length - 1;

            return (
              <View
                style={{
                  marginTop: 1,
                  backgroundColor: colors["neutral-surface-action2"],
                  borderRadius: 16,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
                key={unbondingIndex}
              >
                <View key={unbonding.validatorAddress}>
                  <OWText
                    style={{ marginBottom: 8 }}
                    weight="500"
                    color={colors["neutral-text-action-on-light-bg"]}
                  >
                    Unstaking: {validator?.description.moniker ?? "..."}
                  </OWText>

                  {entries.map((entry, i) => {
                    const remainingText = (() => {
                      const current = new Date().getTime();

                      const relativeEndTime =
                        (new Date(entry.completionTime).getTime() - current) /
                        1000;
                      const relativeEndTimeDays = Math.floor(
                        relativeEndTime / (3600 * 24)
                      );
                      const relativeEndTimeHours = Math.ceil(
                        relativeEndTime / 3600
                      );

                      if (relativeEndTimeDays) {
                        return (
                          intl
                            .formatRelativeTime(relativeEndTimeDays, "days", {
                              numeric: "always",
                            })
                            .replace("in ", "") + " days left"
                        );
                      } else if (relativeEndTimeHours) {
                        return (
                          intl
                            .formatRelativeTime(relativeEndTimeHours, "hours", {
                              numeric: "always",
                            })
                            .replace("in ", "") + " hours left"
                        );
                      }

                      return "";
                    })();
                    const progress = (() => {
                      const currentTime = new Date().getTime();
                      const endTime = new Date(entry.completionTime).getTime();
                      const remainingTime = Math.floor(
                        (endTime - currentTime) / 1000
                      );
                      const unbondingTime = stakingParams
                        ? stakingParams.unbondingTimeSec
                        : 3600 * 24 * 21;

                      return 100 - (remainingTime / unbondingTime) * 100;
                    })();

                    return (
                      <View
                        style={{
                          marginBottom: 8,
                        }}
                        key={i.toString()}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginBottom: 8,
                          }}
                        >
                          <OWText
                            weight="500"
                            color={colors["neutral-text-action-on-light-bg"]}
                          >
                            {entry.balance
                              .shrink(true)
                              .trim(true)
                              .maxDecimals(6)
                              .toString()}
                          </OWText>
                          <OWText
                            weight="500"
                            color={colors["neutral-text-action-on-light-bg"]}
                          >
                            {remainingText}
                          </OWText>
                        </View>
                        <View>
                          <ProgressBar progress={progress} />
                        </View>
                      </View>
                    );
                  })}
                </View>
                {!isLastUnbondingIndex && (
                  <View
                    style={[
                      {
                        backgroundColor: colors["border-input-login"],
                      },
                    ]}
                  />
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
});

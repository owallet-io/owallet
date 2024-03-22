import { BondStatus } from "@owallet/stores";
import { OWEmpty } from "@src/components/empty";
import { Text } from "@src/components/text";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";
import { View, ViewStyle } from "react-native";
import { CardBody, OWBox } from "../../../components/card";
import { ProgressBar } from "../../../components/progress-bar";
import { ValidatorThumbnail } from "../../../components/thumbnail";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";

export const UndelegationsCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, accountStore, queriesStore } = useStore();
  const { colors } = useTheme();
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

  const style = useStyle();

  const intl = useIntl();

  return (
    <View>
      {unbondings.length > 0 ? null : <OWEmpty style={{ paddingBottom: 20 }} />}
      {unbondings.map((unbonding, unbondingIndex) => {
        const validator = bondedValidators.validators
          .concat(unbondingValidators.validators)
          .concat(unbondedValidators.validators)
          .find((val) => val.operator_address === unbonding.validatorAddress);
        const thumbnail =
          bondedValidators.getValidatorThumbnail(unbonding.validatorAddress) ||
          unbondingValidators.getValidatorThumbnail(
            unbonding.validatorAddress
          ) ||
          unbondedValidators.getValidatorThumbnail(unbonding.validatorAddress);
        const entries = unbonding.entries;
        const isLastUnbondingIndex = unbondingIndex === unbondings.length - 1;

        return (
          <React.Fragment key={unbondingIndex}>
            <View
              key={unbonding.validatorAddress}
              style={style.flatten(
                ["padding-y-16"],
                [isLastUnbondingIndex && "padding-bottom-8"]
              )}
            >
              <View style={style.flatten(["flex-row", "items-center"])}>
                <ValidatorThumbnail
                  size={32}
                  url={thumbnail}
                  style={{
                    backgroundColor: colors["purple-100"],
                    borderRadius: 32,
                  }}
                />
                <Text
                  style={[
                    { color: colors["primary-text"] },
                    style.flatten(["margin-left-16", "h7"]),
                  ]}
                >
                  {validator?.description.moniker ?? "..."}
                </Text>
              </View>

              {entries.map((entry, i) => {
                const remainingText = (() => {
                  const current = new Date().getTime();

                  const relativeEndTime =
                    (new Date(entry.completionTime).getTime() - current) / 1000;
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
                        .replace("in ", "") + " left"
                    );
                  } else if (relativeEndTimeHours) {
                    return (
                      intl
                        .formatRelativeTime(relativeEndTimeHours, "hours", {
                          numeric: "always",
                        })
                        .replace("in ", "") + " left"
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
                    key={i.toString()}
                    style={style.flatten(["padding-top-12"])}
                  >
                    <View
                      style={style.flatten([
                        "flex-row",
                        "items-center",
                        "margin-bottom-8",
                      ])}
                    >
                      <Text
                        style={[
                          { color: colors["primary-text"] },
                          ,
                          style.flatten(["subtitle2"]),
                        ]}
                      >
                        {entry.balance
                          .shrink(true)
                          .trim(true)
                          .maxDecimals(6)
                          .toString()}
                      </Text>
                      <View style={style.get("flex-1")} />
                      <Text
                        style={style.flatten(["body2", "color-text-black-low"])}
                      >
                        {remainingText}
                      </Text>
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
                  style.flatten(["height-1"]),
                  {
                    backgroundColor: colors["border-input-login"],
                  },
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
});

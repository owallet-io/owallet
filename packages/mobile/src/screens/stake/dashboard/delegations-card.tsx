import { ValidatorThumbnails } from "@owallet/common";
import { BondStatus, Validator } from "@owallet/stores";
import { API } from "@src/common/api";
import { AlertIcon, CheckIcon } from "@src/components/icon";
import { Text } from "@src/components/text";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { ValidatorThumbnail } from "../../../components/thumbnail";
import { useSmartNavigation } from "../../../navigation.provider";
import { useStore } from "../../../stores";
import { spacing, typography } from "../../../themes";
import { find } from "lodash";
export const DelegationsCard: FunctionComponent<{
  containerStyle?: ViewStyle;
  validatorList: Array<any>;
}> = observer(({ containerStyle, validatorList }) => {
  const { chainStore, accountStore, queriesStore } = useStore();
  const { colors } = useTheme();
  const styles = styling(colors);
  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const queryDelegations =
    queries.cosmos.queryDelegations.getQueryBech32Address(
      account.bech32Address
    );
  const delegations = queryDelegations.delegations;

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Bonded
  );
  const unbondingValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Unbonding
  );
  const unbondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Unbonded
  );

  const validators = useMemo(() => {
    return bondedValidators.validators
      .concat(unbondingValidators.validators)
      .concat(unbondedValidators.validators);
  }, [
    bondedValidators.validators,
    unbondingValidators.validators,
    unbondedValidators.validators,
  ]);

  const validatorsMap = useMemo(() => {
    const map: Map<string, Validator> = new Map();

    for (const val of validators) {
      map.set(val.operator_address, val);
    }

    return map;
  }, [validators]);

  const smartNavigation = useSmartNavigation();

  const [warningList, setWarningList] = useState([]);

  useEffect(() => {
    (async function get() {
      try {
        const res = await API.getValidatorList(
          {},
          {
            baseURL: "https://api.scan.orai.io",
          }
        );
        const tmpList = [];
        if (res?.data?.data) {
          res.data.data.map((v) => {
            if (v.uptime < 0.9) {
              // tmpList.push(v);
            }
          });
        }
        setWarningList(tmpList);
      } catch (error) {}
    })();
  }, []);

  return (
    <View>
      {delegations && delegations.length > 0 && (
        <View
          style={{
            ...containerStyle,
          }}
        >
          {delegations.map((del) => {
            const val = validatorsMap.get(del.validator_address);
            if (!val) {
              return null;
            }

            const isWarning = find(warningList, (w) => {
              return w.operator_address === val.operator_address;
            });

            const thumbnail =
              ValidatorThumbnails[val.operator_address] ||
              bondedValidators.getValidatorThumbnail(val.operator_address) ||
              unbondingValidators.getValidatorThumbnail(val.operator_address) ||
              unbondedValidators.getValidatorThumbnail(val.operator_address);

            const amount = queryDelegations.getDelegationTo(
              val.operator_address
            );

            const foundValidator = validatorList?.find(
              (v) => v.operator_address === del.validator_address
            );

            return (
              <TouchableOpacity
                key={del.validator_address}
                style={{
                  ...styles.containerItem,
                  marginTop: 8,
                  marginBottom: 8,
                  backgroundColor: colors["background-box"],
                  borderColor: isWarning
                    ? colors["orange-800"]
                    : colors["background-box"],
                  borderWidth: 0.5,
                }}
                onPress={() => {
                  smartNavigation.navigate("Delegate.Detail", {
                    validatorAddress: del.validator_address,
                    apr: foundValidator?.apr ?? 0,
                    uptime: foundValidator?.uptime ?? 0,
                  });
                }}
              >
                <ValidatorThumbnail
                  style={{
                    marginRight: spacing["12"],
                    backgroundColor: colors["white"],
                  }}
                  size={30}
                  url={thumbnail}
                />
                <Text
                  style={{
                    ...styles.textInfo,
                    fontWeight: "700",
                    fontSize: 16,
                    color: isWarning
                      ? colors["danger"]
                      : colors["sub-primary-text"],
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {val?.description?.moniker ?? ""}
                </Text>
                <View style={{ flex: 1, paddingHorizontal: 6 }}>
                  {isWarning ? (
                    <AlertIcon color={colors.danger} size={20} />
                  ) : (
                    <CheckIcon />
                  )}
                </View>
                <Text
                  style={{
                    ...styles.textInfo,
                    color: colors["sub-primary-text"],
                  }}
                >
                  {amount.maxDecimals(4).trim(true).shrink(true).toString()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
});

const styling = (colors) =>
  StyleSheet.create({
    containerItem: {
      backgroundColor: colors["white"],
      borderRadius: spacing["8"],
      flexDirection: "row",
      marginHorizontal: spacing["24"],
      padding: spacing["8"],
      alignItems: "center",
      justifyContent: "flex-start",
    },
    textInfo: {
      ...typography.h6,
      fontWeight: "400",
      color: colors["gray-900"],
    },
  });

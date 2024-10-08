import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { Card, CardBody } from "../../../components/card";
import { View, ViewStyle } from "react-native";
import { Text } from "@src/components/text";
import { useStyle } from "../../../styles";
import { Button } from "../../../components/button";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";

export const DelegatedCard: FunctionComponent<{
  containerStyle?: ViewStyle;
  validatorAddress: string;
}> = observer(({ containerStyle, validatorAddress }) => {
  const { chainStore, queriesStore, accountStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const style = useStyle();

  const staked = queries.cosmos.queryDelegations
    .getQueryBech32Address(account.bech32Address)
    .getDelegationTo(validatorAddress);

  const rewards = queries.cosmos.queryRewards
    .getQueryBech32Address(account.bech32Address)
    .getStakableRewardOf(validatorAddress);

  return (
    <Card style={containerStyle}>
      <CardBody style={{ paddingHorizontal: 0 }}>
        <Text
          style={style.flatten([
            "h7",
            "color-text-black-very-high",
            "margin-bottom-12",
          ])}
        >
          My Staking
        </Text>
        <View
          style={style.flatten(["flex-row", "items-center", "margin-bottom-4"])}
        >
          <Text style={style.flatten(["h7", "color-text-black-medium"])}>
            Staked
          </Text>
          <View style={style.get("flex-1")} />
          <Text style={style.flatten(["body2", "color-text-black-very-low"])}>
            {staked.trim(true).shrink(true).maxDecimals(6).toString()}
          </Text>
        </View>
        <View
          style={style.flatten([
            "flex-row",
            "items-center",
            "margin-bottom-12",
          ])}
        >
          <Text style={style.flatten(["h7", "color-text-black-medium"])}>
            Unbonding
          </Text>
          <View style={style.get("flex-1")} />
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            {/* {unbonding &&
              unbonding?.[0].entries.map(ub => {
                return (
                  <Text
                    style={style.flatten([
                      'body2',
                      'color-text-black-very-low'
                    ])}
                  >
                    {(Number(ub.balance) * 10 ** -6).toFixed(6)}{' '}
                    {chainStore.current.stakeCurrency.coinDenom}
                  </Text>
                );
              })} */}
          </View>
        </View>
        <View
          style={style.flatten([
            "flex-row",
            "items-center",
            "margin-bottom-12",
          ])}
        >
          <Text style={style.flatten(["h7", "color-text-black-medium"])}>
            Rewards
          </Text>
          <View style={style.get("flex-1")} />
          <Text style={style.flatten(["body2", "color-text-black-very-low"])}>
            {rewards?.trim(true).shrink(true).maxDecimals(6).toString()}
          </Text>
        </View>
        <View style={style.flatten(["flex-row", "items-center"])}>
          <Button
            containerStyle={style.flatten(["flex-1"])}
            color={"secondary"}
            mode="outline"
            text="Switch Validator"
            onPress={() => {
              navigate(SCREENS.Redelegate, { validatorAddress });
            }}
          />
          <View style={style.flatten(["width-card-gap"])} />
          <Button
            color={"danger"}
            containerStyle={style.flatten(["flex-1"])}
            text="Unstake"
            onPress={() => {
              navigate(SCREENS.Undelegate, { validatorAddress });
            }}
          />
        </View>
      </CardBody>
    </Card>
  );
});

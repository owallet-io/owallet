import React, { FunctionComponent, useEffect, useState } from "react";
import { View } from "react-native";
import { Text } from "@src/components/text";
import { AlertIcon } from "../../components/icon";
import { observer } from "mobx-react-lite";
import { API } from "@src/common/api";
import { useStyle } from "@src/styles";
import { useStore } from "@src/stores";
import { find } from "lodash";

export const WarningView: FunctionComponent = observer(() => {
  const [warningList, setWarningList] = useState([]);
  const { chainStore, queriesStore, accountStore } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);
  const queryDelegations =
    queries.cosmos.queryDelegations.getQueryBech32Address(
      account.bech32Address
    );
  const delegations = queryDelegations.delegations;

  const style = useStyle();
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
              const foundValidator = find(delegations, (val) => {
                return val.validator_address === v.operator_address;
              });

              if (foundValidator) {
                tmpList.push(v);
              }
            }
          });
        }
        setWarningList(tmpList);
      } catch (error) {}
    })();
  }, [account.bech32Address]);

  return warningList.length > 0 ? (
    <View
      style={{
        justifyContent: "center",
        paddingTop: 16,
      }}
    >
      <View
        style={style.flatten([
          "flex-row",
          "items-center",
          "background-color-danger-10",
          "padding-26",
          "width-full",
        ])}
      >
        <View style={style.flatten(["margin-right-16"])}>
          <AlertIcon color={style.get("color-danger").color} size={24} />
        </View>
        <View style={style.flatten(["flex-1", "overflow-visible"])}>
          <Text
            style={style.flatten([
              "subtitle2",
              "color-danger",
              "overflow-visible",
            ])}
          >
            {"The following validators are about to be jailed:"}
          </Text>
          {warningList.map((w) => {
            return (
              <Text
                style={style.flatten([
                  "subtitle3",
                  "color-danger",
                  "overflow-visible",
                ])}
              >{`- ${w.moniker}`}</Text>
            );
          })}
        </View>
      </View>
    </View>
  ) : (
    <View />
  );
});

import { ChainIdEnum, ValidatorThumbnails } from "@owallet/common";
import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  InteractionManager,
} from "react-native";
import { BondStatus, Validator } from "@owallet/stores";
import { CoinPretty, Dec } from "@owallet/unit";
import { useTheme } from "@src/themes/theme-provider";
import { API } from "../../../common/api";
import { CardDivider } from "../../../components/card";
import { AlertIcon } from "../../../components/icon";
import { SelectorModal } from "../../../components/input";
import { RectButton } from "../../../components/rect-button";
import { useSmartNavigation } from "../../../navigation.provider";
import { metrics, spacing } from "../../../themes";
import OWFlatList from "@src/components/page/ow-flat-list";
import { ValidatorThumbnail } from "@src/components/thumbnail";
import OWText from "@src/components/text/ow-text";
import OWIcon from "@src/components/ow-icon/ow-icon";
import {
  computeTotalVotingPower,
  formatPercentage,
  groupAndShuffle,
  maskedNumber,
} from "@src/utils/helper";
import OwEmpty from "@src/components/empty/ow-empty";
import ByteBrew from "react-native-bytebrew-sdk";

export const ValidatorList: FunctionComponent = observer(() => {
  const { chainStore, queriesStore, accountStore } = useStore();
  ByteBrew.NewCustomEvent(`Stake Screen`);
  const account = accountStore.getAccount(chainStore.current.chainId);

  const queries = queriesStore.get(chainStore.current.chainId);
  const { colors } = useTheme();
  const styles = styling(colors);

  const [search, setSearch] = useState("");
  const [active, setActive] = useState("all");
  const [validators, setValidators] = useState([]);
  const [sort, setSort] = useState<string>("Voting Power");
  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Bonded
  );

  const queryDelegations =
    queries.cosmos.queryDelegations.getQueryBech32Address(
      account.bech32Address
    );
  const delegations = queryDelegations.delegations;

  const queryReward = queries.cosmos.queryRewards.getQueryBech32Address(
    account.bech32Address
  );
  const stakingReward = queryReward.stakableReward;

  useEffect(() => {
    if (!stakingReward.toDec().equals(new Dec(0))) {
      setActive("my");
    }
  }, [stakingReward]);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      if (
        chainStore.current.chainId !== ChainIdEnum.Oraichain ||
        validators?.length > 0
      )
        return;
      (async function get() {
        try {
          const res = await API.getValidatorList(
            {},
            {
              baseURL: "https://api.scan.orai.io",
            }
          );
          setValidators(res.data.data);
        } catch (error) {}
      })();
    });
  }, [chainStore.current.chainId]);

  const mergeAllValidators: Validator[] = bondedValidators.validators.map(
    (v1Item) => {
      if (chainStore.current.chainId !== ChainIdEnum.Oraichain) return v1Item;
      const matchingItem = validators.find(
        (v2Item) => v2Item.operator_address === v1Item.operator_address
      );
      return {
        ...v1Item,
        ...matchingItem,
      };
    }
  );

  const myValidators = mergeAllValidators.filter(
    (vaItem) =>
      delegations.some(
        (deItem) => deItem.validator_address === vaItem.operator_address
      ) &&
      vaItem.description.moniker.toLowerCase().includes(search.toLowerCase())
  );
  const allValidators = mergeAllValidators.filter((vaItem) =>
    vaItem.description.moniker.toLowerCase().includes(search.toLowerCase())
  );

  const totalVotingPower = useMemo(
    () => computeTotalVotingPower(validators),
    [validators]
  );
  const renderItem = ({ item, index }: { item: Validator; index: number }) => {
    const currentVotingPower = parseFloat(item?.voting_power || 0);
    const percentage = formatPercentage(
      currentVotingPower / totalVotingPower,
      2
    );
    return (
      <View
        style={{
          marginHorizontal: spacing["16"],
          paddingBottom: spacing["8"],
          borderRadius: spacing["8"],
          borderBottomWidth: 0.5,
          borderBottomColor: colors["neutral-border-default"],
        }}
      >
        <ValidatorItem
          validatorAddress={item?.operator_address}
          percentageVote={percentage ?? 0}
          uptime={item?.uptime ?? 0}
          apr={item?.apr ?? 0}
          index={index}
          sort={sort}
        />
      </View>
    );
  };
  const data = active === "all" ? allValidators : myValidators;
  const dataShuffle = groupAndShuffle(
    data,
    10,
    chainStore.current.chainId,
    sort
  ).flat();
  return (
    <View style={styles.container}>
      <View style={styles.listLabel}>
        <TouchableOpacity onPress={() => setActive("all")}>
          <OWText
            size={16}
            weight={"500"}
            style={[active === "all" ? styles.active : {}]}
          >{`All Validators`}</OWText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActive("my")}>
          <OWText
            size={16}
            weight={"500"}
            style={[
              active !== "all"
                ? styles.active
                : { color: colors["neutral-text-body"] },
            ]}
          >{`My Validators`}</OWText>
        </TouchableOpacity>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingTop: 16,
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
            placeholder="Search by name"
            onChangeText={(t) => setSearch(t)}
          />
        </View>
      </View>
      {chainStore.current.chainId !== ChainIdEnum.Oraichain ? (
        <TouchableOpacity
          style={{
            flexDirection: "row",
            borderRadius: 999,
            width: metrics.screenWidth / 3,
            alignItems: "center",
            paddingHorizontal: 12,
            justifyContent: "space-between",
            alignSelf: "flex-end",
            paddingTop: 16,
          }}
          onPress={() => {
            if (sort === "Voting Power") {
              setSort("Voting Power Increase");
            } else {
              setSort("Voting Power");
            }
          }}
        >
          <OWText weight="600">{"Voting Power"}</OWText>
          <View>
            <OWIcon
              color={colors["neutral-icon-on-light"]}
              name="double-arrow"
              size={18}
            />
          </View>
        </TouchableOpacity>
      ) : null}
      {dataShuffle?.length <= 0 ? <OwEmpty /> : null}
      {dataShuffle.map((item, index) => renderItem({ item, index }))}
    </View>
  );
});

const ValidatorItem: FunctionComponent<{
  validatorAddress: string;
  apr: number;
  index: number;
  sort: string;
  uptime: number;
  percentageVote: number;
  onSelectValidator?: (validatorAddress: string) => void;
}> = observer(
  ({ validatorAddress, apr, percentageVote, onSelectValidator, uptime }) => {
    const { chainStore, queriesStore } = useStore();
    const { colors } = useTheme();
    const styles = styling(colors);
    const queries = queriesStore.get(chainStore.current.chainId);
    const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
      BondStatus.Bonded
    );
    const validator = bondedValidators.getValidator(validatorAddress);
    const smartNavigation = useSmartNavigation();

    return validator ? (
      <View>
        <RectButton
          style={{
            ...styles.container,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          onPress={() => {
            if (onSelectValidator) {
              onSelectValidator(validatorAddress);
              smartNavigation.goBack();
            } else {
              smartNavigation.navigateSmart("Validator.Details", {
                validatorAddress,
                apr,
                percentageVote,
              });
            }
          }}
        >
          <View
            style={{
              ...styles.containerInfo,
            }}
          >
            <ValidatorThumbnail
              style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                backgroundColor: colors["neutral-icon-on-dark"],
                alignItems: "center",
              }}
              size={40}
              url={
                ValidatorThumbnails[validator.operator_address] ??
                bondedValidators.getValidatorThumbnail(
                  validator.operator_address
                )
              }
            />
            <View style={{ marginLeft: 8 }}>
              <OWText
                style={{
                  ...styles.textInfo,
                  maxWidth: metrics.screenWidth / 2,
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {validator?.description.moniker}
              </OWText>
              {apr && apr > 0 ? (
                <View
                  style={{
                    backgroundColor: colors["neutral-surface-bg2"],
                    borderRadius: 8,
                    paddingHorizontal: 6,
                    paddingVertical: 4,
                    marginTop: 4,
                  }}
                >
                  <OWText
                    style={{
                      color: colors["neutral-text-body2"],
                    }}
                  >
                    APR: {apr?.toFixed(2).toString() + "%"}
                  </OWText>
                </View>
              ) : null}
            </View>
          </View>

          <View
            style={{
              justifyContent: "flex-end",
            }}
          >
            <OWText
              style={{
                ...styles.textInfo,
                alignSelf: "flex-end",
              }}
            >
              {`${maskedNumber(
                new CoinPretty(
                  chainStore.current.stakeCurrency,
                  new Dec(validator.tokens)
                )
                  .hideDenom(true)
                  .maxDecimals(0)
                  .toString()
              )} ${chainStore.current.stakeCurrency.coinDenom}`}
            </OWText>
            {uptime ? (
              <OWText
                style={{
                  color: colors["neutral-text-body2"],
                  paddingTop: 4,
                }}
              >
                {`Uptime: ${uptime ? (uptime * 100).toFixed(2) : 0}%`}
              </OWText>
            ) : null}
          </View>
        </RectButton>
        {uptime && uptime < 0.7 ? (
          <View
            style={{
              backgroundColor: colors["error-border-default"],
              borderRadius: 24,
              paddingHorizontal: 12,
              paddingVertical: 4,
              marginTop: 12,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <AlertIcon
              color={colors["neutral-text-action-on-dark-bg"]}
              size={16}
            />
            <OWText
              weight="500"
              style={{
                color: colors["neutral-text-action-on-dark-bg"],
                paddingLeft: 4,
              }}
            >
              Validator are about to be jailed
            </OWText>
          </View>
        ) : null}
      </View>
    ) : null;
  }
);

const styling = (colors) =>
  StyleSheet.create({
    containerSearch: {
      padding: 0,
    },
    titleLabel: {
      marginRight: spacing["10"],
      textTransform: "uppercase",

      marginBottom: spacing["8"],
    },
    sortBtn: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing["2"],
      position: "absolute",
      right: -25,
    },
    flexRow: {
      flex: 1,
      flexDirection: "row",
    },
    containerParagraph: {
      flexDirection: "row",
      marginTop: spacing["32"],
    },
    containerHeader: {
      paddingHorizontal: spacing["24"],
      paddingBottom: spacing["4"],
    },
    title: {
      color: colors["neutral-text-body"],
    },
    container: {
      backgroundColor: colors["neutral-surface-card"],
      marginTop: spacing["16"],
    },
    containerInfo: {
      flexDirection: "row",
      alignItems: "center",
    },
    textInfo: {
      fontWeight: "600",
      color: colors["neutral-text-title"],
    },
    listLabel: {
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderBottomColor: colors["neutral-border-default"],
      borderBottomWidth: 1,
      flexDirection: "row",
      justifyContent: "space-evenly",
    },
    active: {
      color: colors["primary-surface-default"],
    },
    iconSearch: {
      position: "absolute",
      left: 22,
      top: 34,
    },
    textInput: {
      paddingVertical: 0,
      height: 40,
      backgroundColor: colors["box-nft"],
      borderRadius: 8,
      paddingLeft: 35,
      fontSize: 14,
      color: colors["neutral-text-body"],
      marginVertical: 10,
      fontWeight: "500",
    },
  });

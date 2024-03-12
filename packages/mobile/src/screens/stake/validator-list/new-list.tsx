import { ValidatorThumbnails } from "@owallet/common";
import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { StyleSheet, TouchableOpacity, View, TextInput } from "react-native";
import { BondStatus, Validator } from "@owallet/stores";
import { CoinPretty, Dec } from "@owallet/unit";
import { useTheme } from "@src/themes/theme-provider";
import { API } from "../../../common/api";
import { CardDivider } from "../../../components/card";
import { AlertIcon, DownArrowIcon } from "../../../components/icon";
import { SelectorModal } from "../../../components/input";
import { RectButton } from "../../../components/rect-button";
import { useSmartNavigation } from "../../../navigation.provider";
import { metrics, spacing } from "../../../themes";
import OWFlatList from "@src/components/page/ow-flat-list";
import { ValidatorThumbnail } from "@src/components/thumbnail";
import OWText from "@src/components/text/ow-text";
import OWIcon from "@src/components/ow-icon/ow-icon";

export const ValidatorList: FunctionComponent = observer(() => {
  const { chainStore, queriesStore, accountStore } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);

  const queries = queriesStore.get(chainStore.current.chainId);
  const { colors } = useTheme();
  const styles = styling(colors);

  const [search, setSearch] = useState("");
  const [active, setActive] = useState("all");
  const [validators, setValidators] = useState([]);
  const [sort, setSort] = useState<string>("Voting Power");
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(BondStatus.Bonded);

  const queryDelegations = queries.cosmos.queryDelegations.getQueryBech32Address(account.bech32Address);
  const delegations = queryDelegations.delegations;

  useEffect(() => {
    (async function get() {
      try {
        const res = await API.getValidatorList(
          {},
          {
            baseURL: "https://api.scan.orai.io"
          }
        );
        setValidators(res.data.data);
      } catch (error) {}
    })();
  }, []);

  const data = useMemo(() => {
    let data: Validator[] = [];

    if (active === "my") {
      delegations.map(de => {
        const foundData = bondedValidators.validators.find(d => {
          return d.operator_address === de.validator_address;
        });
        data.push(foundData);
      });
    } else {
      data = bondedValidators.validators;
    }

    if (search) {
      data = data.filter(val => val?.description?.moniker?.toLowerCase().includes(search.toLowerCase()));
    }

    switch (sort) {
      case "APR":
        data.sort((val1, val2) => {
          return new Dec(val1.commission.commission_rates.rate).gt(new Dec(val2.commission.commission_rates.rate))
            ? 1
            : -1;
        });
        break;
      case "Name":
        data.sort((val1, val2) => {
          if (!val1?.description.moniker) {
            return 1;
          }
          if (!val2?.description.moniker) {
            return -1;
          }
          return val1?.description.moniker > val2?.description.moniker ? -1 : 1;
        });
        break;
      case "Voting Power":
        data.sort((val1, val2) => {
          return new Dec(val1.tokens).gt(new Dec(val2.tokens)) ? -1 : 1;
        });
        break;
      case "Voting Power Increase":
        data.sort((val1, val2) => {
          return new Dec(val1.tokens).gt(new Dec(val2.tokens)) ? 1 : -1;
        });
        break;
    }

    return data;
  }, [bondedValidators.validators, search, sort, delegations, active]);

  const items = useMemo(() => {
    return [
      { label: "APR", key: "APR" },
      { label: "Voting Power", key: "Voting Power" },
      { label: "Name", key: "Name" }
    ];
  }, []);

  const renderItem = ({ item, index }: { item: Validator; index: number }) => {
    const foundValidator = validators.find(v => v.operator_address === item.operator_address);
    return (
      <View
        style={{
          marginHorizontal: spacing["16"],
          marginBottom: spacing["8"],
          borderRadius: spacing["8"]
        }}
      >
        <ValidatorItem
          validatorAddress={item.operator_address}
          uptime={foundValidator?.uptime}
          apr={foundValidator?.apr ?? 0}
          index={index}
          sort={sort}
          // onSelectValidator={route.params.validatorSelector}
        />
      </View>
    );
  };
  const separateComponentItem = () => <CardDivider backgroundColor={colors["border-input-login"]} />;
  return (
    <View style={styles.container}>
      <SelectorModal
        close={() => {
          setIsSortModalOpen(false);
        }}
        isOpen={isSortModalOpen}
        items={items}
        selectedKey={sort}
        setSelectedKey={key => setSort(key as string)}
      />
      <View style={styles.listLabel}>
        <TouchableOpacity onPress={() => setActive("all")}>
          <OWText size={16} weight={"500"} style={[active === "all" ? styles.active : {}]}>{`All Validators`}</OWText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActive("my")}>
          <OWText
            size={16}
            weight={"500"}
            style={[active !== "all" ? styles.active : { color: colors["neutral-text-body"] }]}
          >{`My Validators`}</OWText>
        </TouchableOpacity>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingTop: 16
        }}
      >
        <View
          style={{
            flexDirection: "row",
            backgroundColor: colors["neutral-surface-action"],
            height: 40,
            borderRadius: 999,
            width: metrics.screenWidth / 1.8,
            alignItems: "center",
            paddingHorizontal: 12
          }}
        >
          <View style={{ paddingRight: 4 }}>
            <OWIcon color={colors["neutral-icon-on-light"]} name="search" size={16} />
          </View>
          <TextInput
            style={{
              fontFamily: "SpaceGrotesk-Regular"
            }}
            value={search}
            placeholderTextColor={colors["neutral-text-body"]}
            placeholder="Search by name"
            onChangeText={t => setSearch(t)}
          />
        </View>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            backgroundColor: colors["neutral-surface-action"],
            height: 40,
            borderRadius: 999,
            width: metrics.screenWidth / 3,
            alignItems: "center",
            paddingHorizontal: 12,
            justifyContent: "space-between"
          }}
          onPress={() => setIsSortModalOpen(true)}
        >
          <OWText weight="600">{sort}</OWText>
          <View>
            <DownArrowIcon height={15} color={colors["neutral-icon-on-light"]} />
          </View>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={{
          flexDirection: "row",
          borderRadius: 999,
          width: metrics.screenWidth / 3,
          alignItems: "center",
          paddingHorizontal: 12,
          justifyContent: "space-between",
          alignSelf: "flex-end",
          paddingTop: 16
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
          <OWIcon color={colors["neutral-icon-on-light"]} name="double-arrow" size={18} />
        </View>
      </TouchableOpacity>
      <OWFlatList data={data} renderItem={renderItem} ItemSeparatorComponent={separateComponentItem} />
    </View>
  );
});

const ValidatorItem: FunctionComponent<{
  validatorAddress: string;
  apr: number;
  index: number;
  sort: string;
  uptime: number;
  onSelectValidator?: (validatorAddress: string) => void;
}> = observer(({ validatorAddress, apr, onSelectValidator, uptime }) => {
  const { chainStore, queriesStore } = useStore();
  const { colors } = useTheme();
  const styles = styling(colors);
  const queries = queriesStore.get(chainStore.current.chainId);
  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(BondStatus.Bonded);
  const validator = bondedValidators.getValidator(validatorAddress);
  const smartNavigation = useSmartNavigation();

  return validator ? (
    <View>
      <RectButton
        style={{
          ...styles.container,
          flexDirection: "row",
          backgroundColor: colors["background-box"],
          alignItems: "center",
          justifyContent: "space-between"
        }}
        onPress={() => {
          if (onSelectValidator) {
            onSelectValidator(validatorAddress);
            smartNavigation.goBack();
          } else {
            smartNavigation.navigateSmart("Validator.Details", {
              validatorAddress,
              apr
            });
          }
        }}
      >
        <View
          style={{
            ...styles.containerInfo
          }}
        >
          <ValidatorThumbnail
            style={{}}
            size={40}
            url={
              ValidatorThumbnails[validator.operator_address] ??
              bondedValidators.getValidatorThumbnail(validator.operator_address)
            }
          />
          <View style={{ marginLeft: 8 }}>
            <OWText
              style={{
                ...styles.textInfo
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
                  marginTop: 4
                }}
              >
                <OWText
                  style={{
                    color: colors["neutral-text-body2"]
                  }}
                >
                  APR: {apr && apr > 0 ? apr.toFixed(2).toString() + "%" : ""}
                </OWText>
              </View>
            ) : null}
          </View>
        </View>

        <View
          style={{
            justifyContent: "flex-end"
          }}
        >
          <OWText
            style={{
              ...styles.textInfo,
              alignSelf: "flex-end"
            }}
          >
            {new CoinPretty(chainStore.current.stakeCurrency, new Dec(validator.tokens)).maxDecimals(0).toString()}
          </OWText>
          {uptime ? (
            <OWText
              style={{
                color: colors["neutral-text-body2"],
                paddingTop: 4
              }}
            >
              {`Uptime: ${uptime ? (uptime * 100).toFixed(2) : 0}%`}
            </OWText>
          ) : null}
        </View>
      </RectButton>
      {uptime < 0.9 ? (
        <View
          style={{
            backgroundColor: colors["error-border-default"],
            borderRadius: 24,
            paddingHorizontal: 12,
            paddingVertical: 4,
            marginTop: 12,
            flexDirection: "row",
            alignItems: "center"
          }}
        >
          <AlertIcon color={colors["neutral-text-action-on-dark-bg"]} size={16} />
          <OWText
            weight="500"
            style={{
              color: colors["neutral-text-action-on-dark-bg"],
              paddingLeft: 4
            }}
          >
            Validators are about to be jailed
          </OWText>
        </View>
      ) : null}
    </View>
  ) : null;
});

const styling = colors =>
  StyleSheet.create({
    containerSearch: {
      padding: 0
    },
    titleLabel: {
      marginRight: spacing["10"],
      textTransform: "uppercase",

      marginBottom: spacing["8"]
    },
    sortBtn: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing["2"],
      position: "absolute",
      right: -25
    },
    flexRow: {
      flex: 1,
      flexDirection: "row"
    },
    containerParagraph: {
      flexDirection: "row",
      marginTop: spacing["32"]
    },
    containerHeader: {
      paddingHorizontal: spacing["24"],
      paddingBottom: spacing["4"]
    },
    title: {
      color: colors["neutral-text-body"]
    },
    container: {
      backgroundColor: colors["neutral-surface-card"],
      marginTop: spacing["16"]
    },
    containerInfo: {
      flexDirection: "row",
      alignItems: "center"
    },
    textInfo: {
      fontWeight: "600",
      color: colors["neutral-text-title"]
    },
    listLabel: {
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderBottomColor: colors["neutral-border-default"],
      borderBottomWidth: 1,
      flexDirection: "row",
      justifyContent: "space-evenly"
    },
    active: {
      color: colors["primary-surface-default"]
    },
    iconSearch: {
      position: "absolute",
      left: 22,
      top: 34
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
      fontWeight: "500"
    }
  });

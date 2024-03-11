import { ValidatorThumbnails } from "@owallet/common";
import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { PageWithView } from "../../../components/page";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@src/components/text";
import { BondStatus, Validator } from "@owallet/stores";
import { CoinPretty, Dec } from "@owallet/unit";
import { RouteProp, useRoute } from "@react-navigation/native";
import { OWSubTitleHeader } from "@src/components/header";
import { useTheme } from "@src/themes/theme-provider";
import { API } from "../../../common/api";
import { CardDivider } from "../../../components/card";
import {
  AlertIcon,
  ArrowOpsiteUpDownIcon,
  ValidatorOutlineIcon,
} from "../../../components/icon";
import { SelectorModal, TextInput } from "../../../components/input";
import { RectButton } from "../../../components/rect-button";
import { useSmartNavigation } from "../../../navigation.provider";
import { spacing, typography } from "../../../themes";
import OWFlatList from "@src/components/page/ow-flat-list";
import { ValidatorThumbnail } from "@src/components/thumbnail";
import OWText from "@src/components/text/ow-text";
type Sort = "APR" | "Amount Staked" | "Name";

export const ValidatorList: FunctionComponent = observer(() => {
  const route = useRoute<RouteProp<Record<string, {}>, string>>();

  const { chainStore, queriesStore, accountStore } = useStore();

  const queries = queriesStore.get(chainStore.current.chainId);
  const { colors } = useTheme();
  const styles = styling(colors);
  const [search, setSearch] = useState("");
  const [validators, setValidators] = useState([]);
  const [sort, setSort] = useState<Sort>("Amount Staked");
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Bonded
  );

  useEffect(() => {
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
  }, []);

  const data = useMemo(() => {
    let data = bondedValidators.validators;
    if (search) {
      data = data.filter((val) =>
        val?.description?.moniker?.toLowerCase().includes(search.toLowerCase())
      );
    }

    switch (sort) {
      case "APR":
        data.sort((val1, val2) => {
          return new Dec(val1.commission.commission_rates.rate).gt(
            new Dec(val2.commission.commission_rates.rate)
          )
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
      case "Amount Staked":
        data.sort((val1, val2) => {
          return new Dec(val1.tokens).gt(new Dec(val2.tokens)) ? -1 : 1;
        });
        break;
    }

    return data;
  }, [bondedValidators.validators, search, sort]);

  const items = useMemo(() => {
    return [
      { label: "APR", key: "APR" },
      { label: "Amount Staked", key: "Amount Staked" },
      { label: "Name", key: "Name" },
    ];
  }, []);

  const sortItem = useMemo(() => {
    const item = items.find((item) => item.key === sort);
    if (!item) {
      throw new Error(`Can't find the item for sort (${sort})`);
    }
    return item;
  }, [items, sort]);
  const paragraph = () => {
    return (
      <View style={styles.containerParagraph}>
        <TouchableOpacity
          style={styles.sortBtn}
          onPress={() => {
            setIsSortModalOpen(true);
          }}
        >
          <OWText
            style={[
              styles.title,
              ,
              {
                color: colors["sub-primary-text"],
              },
              styles.titleLabel,
            ]}
          >
            {sortItem.label}
          </OWText>
          <ArrowOpsiteUpDownIcon size={24} color={colors["border"]} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item, index }: { item: Validator; index: number }) => {
    const foundValidator = validators.find(
      (v) => v.operator_address === item.operator_address
    );
    return (
      <View
        style={{
          marginHorizontal: spacing["24"],
          marginVertical: spacing["8"],
          borderRadius: spacing["8"],
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
  const separateComponentItem = () => (
    <CardDivider backgroundColor={colors["border-input-login"]} />
  );
  return (
    <View style={styles.container}>
      <View style={styles.listLabel}>
        <OWText
          size={16}
          weight={"500"}
          style={[styles["title"]]}
        >{`All Validators`}</OWText>
      </View>
      <OWFlatList
        data={data}
        renderItem={renderItem}
        ItemSeparatorComponent={separateComponentItem}
      />
    </View>
  );
  return (
    <View>
      <SelectorModal
        close={() => {
          setIsSortModalOpen(false);
        }}
        isOpen={isSortModalOpen}
        items={items}
        selectedKey={sort}
        setSelectedKey={(key) => setSort(key as Sort)}
      />
      <View>
        <View style={styles.containerHeader}>
          <TextInput
            label="Search"
            placeholder="Search"
            labelStyle={{
              display: "none",
            }}
            containerStyle={styles.containerSearch}
            value={search}
            onChangeText={(text) => {
              setSearch(text);
            }}
            paragraph={paragraph}
          />
        </View>
      </View>
      <OWFlatList
        data={data}
        renderItem={renderItem}
        ItemSeparatorComponent={separateComponentItem}
      />
    </View>
  );
});

const ValidatorItem: FunctionComponent<{
  validatorAddress: string;
  apr: number;
  index: number;
  sort: Sort;
  uptime: number;
  onSelectValidator?: (validatorAddress: string) => void;
}> = observer(({ validatorAddress, apr, onSelectValidator, uptime }) => {
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
          backgroundColor: colors["background-box"],
          alignItems: "center",
        }}
        onPress={() => {
          if (onSelectValidator) {
            onSelectValidator(validatorAddress);
            smartNavigation.goBack();
          } else {
            smartNavigation.navigateSmart("Validator.Details", {
              validatorAddress,
              apr,
            });
          }
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

        <View
          style={{
            ...styles.containerInfo,
          }}
        >
          <OWText
            style={{
              ...styles.textInfo,
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {validator?.description.moniker}
          </OWText>
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
              APR: {apr && apr > 0 ? apr.toFixed(2).toString() + "%" : ""}
            </OWText>
          </View>
        </View>
        <View
          style={{
            flex: 1,
          }}
        />
        <View>
          <OWText
            style={{
              ...styles.textInfo,
              color: colors["primary-text"],
            }}
          >
            {new CoinPretty(
              chainStore.current.stakeCurrency,
              new Dec(validator.tokens)
            )
              .maxDecimals(0)
              .toString()}
          </OWText>
          <OWText
            style={{
              color: colors["neutral-text-body2"],
            }}
          >
            {`Uptime: ${uptime ? (uptime * 100).toFixed(2) : 0}%`}
          </OWText>
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
            Validators are about to be jailed
          </OWText>
        </View>
      ) : null}
    </View>
  ) : null;
});

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
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    containerInfo: {
      marginLeft: spacing["8"],
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
    },
  });

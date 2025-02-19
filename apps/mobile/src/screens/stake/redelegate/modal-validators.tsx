import { Staking } from "@owallet/stores";
import { CoinPretty, Dec } from "@owallet/unit";
import { Text } from "@src/components/text";
import React from "react";
import { View } from "react-native";
import { RectButton } from "../../../components/rect-button";
import { ValidatorThumbnail } from "../../../components/thumbnail";
import { useStore } from "../../../stores";
import { metrics, spacing, typography } from "../../../themes";
import { _keyExtract } from "../../../utils/helper";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";

const Validators = ({
  onPressSelectValidator,
  styles,
  dstValidatorAddress,
  colors,
}) => {
  const { chainStore, queriesStore } = useStore();
  const queries = queriesStore.get(chainStore.current.chainId);
  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Bonded
  );

  const renderItem = ({ item }) => {
    let validatorsAddress = item.operator_address || item?.validator_address;
    // const amount = queryDelegations.getDelegationTo(validatorsAddress);
    return (
      <RectButton
        style={{
          ...styles.containerAccount,
          backgroundColor: colors["neutral-surface-bg2"],
        }}
        onPress={() =>
          onPressSelectValidator(
            validatorsAddress,
            bondedValidators.getValidatorThumbnail(validatorsAddress),
            item?.description?.moniker
          )
        }
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <ValidatorThumbnail
            style={{
              marginRight: spacing["8"],
            }}
            size={38}
            url={bondedValidators.getValidatorThumbnail(validatorsAddress)}
          />
          <View
            style={{
              marginLeft: spacing["12"],
            }}
          >
            <Text
              style={{
                ...typography.h6,
                fontWeight: "900",
              }}
              numberOfLines={1}
            >
              {item?.description?.moniker}
            </Text>
            {item.tokens && (
              <Text
                style={{
                  ...typography.h7,
                  color: colors["gray-300"],
                  fontWeight: "900",
                  fontSize: 13,
                }}
              >
                {/* Stake {amount.maxDecimals(4).trim(true).shrink(true).toString()} */}
                {new CoinPretty(
                  chainStore.current.stakeCurrency,
                  new Dec(item.tokens)
                )
                  .maxDecimals(0)
                  .hideDenom(true)
                  .toString() + " staked"}
              </Text>
            )}
          </View>
        </View>

        <View>
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: spacing["32"],
              backgroundColor:
                item.operator_address == dstValidatorAddress
                  ? colors["background-btn-primary"]
                  : colors["gray-100"],
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: spacing["32"],
                backgroundColor: colors["white"],
              }}
            />
          </View>
        </View>
      </RectButton>
    );
  };
  return (
    <View
      style={{
        width: metrics.screenWidth - 36,
        height: metrics.screenHeight / 2,
      }}
    >
      <BottomSheetFlatList
        data={bondedValidators.validators || []}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={_keyExtract}
        ListFooterComponent={() => (
          <View
            style={{
              height: spacing["16"],
            }}
          />
        )}
      />
    </View>
  );
};

export default Validators;

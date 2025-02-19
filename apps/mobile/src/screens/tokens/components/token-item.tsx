import { DenomHelper } from "@owallet/common";
import { Currency } from "@owallet/types";
import { CoinPretty, PricePretty } from "@owallet/unit";
import { Text } from "@src/components/text";
import { useTheme } from "@src/themes/theme-provider";
import { formatContractAddress } from "@src/utils/helper";
import React, { FunctionComponent, useMemo } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { RightArrowIcon } from "../../../components/icon";
import { TokenSymbol } from "../../../components/token-symbol";

import { spacing, typography } from "../../../themes";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";

interface TokenItemProps {
  containerStyle?: ViewStyle;
  chainInfo: {
    stakeCurrency: Currency;
    networkType?: string;
    chainId?: string;
  };
  balance: CoinPretty;
  totalBalance?: number;
  priceBalance: PricePretty;
}

export const TokenItem: FunctionComponent<TokenItemProps> = ({
  containerStyle,
  chainInfo,
  balance,
  priceBalance,
}) => {
  const { colors } = useTheme();

  // The IBC currency could have long denom (with the origin chain/channel information).
  // Because it is shown in the title, there is no need to show such long denom twice in the actual balance.
  let balanceCoinDenom: string;
  let name = balance?.currency?.coinDenom;

  if (
    "originCurrency" in balance?.currency &&
    balance?.currency?.originCurrency
  ) {
    balanceCoinDenom = balance.currency.originCurrency.coinDenom;
  } else {
    const denomHelper = new DenomHelper(balance?.currency?.coinMinimalDenom);
    balanceCoinDenom = balance?.currency?.coinDenom;

    if (denomHelper?.contractAddress && denomHelper?.contractAddress !== "") {
      name += ` (${formatContractAddress(denomHelper.contractAddress, 34)})`;
    }
  }

  const amountBalance = useMemo(() => {
    const amount = balance
      .trim(true)
      .shrink(true)
      .maxDecimals(6)
      .upperCase(true)
      .hideDenom(true)
      .toString();
    return `${amount} ${balanceCoinDenom}`;
  }, [chainInfo.networkType, chainInfo.chainId, balance, balanceCoinDenom]);
  return (
    <TouchableOpacity
      key={chainInfo.chainId}
      activeOpacity={0.7}
      style={{ ...styles.containerToken, ...containerStyle }}
      onPress={() => {
        navigate(SCREENS.TokenDetails, {
          balanceCoinDenom,
          amountBalance,
          balanceCurrency: balance?.currency,
          priceBalance,
          balanceCoinFull: balance?.currency.coinDenom ?? balanceCoinDenom,
        });
      }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <TokenSymbol
          style={{
            marginRight: spacing["12"],
            backgroundColor: colors["bg-icon-token"],
          }}
          size={44}
          chainInfo={chainInfo}
          currency={balance?.currency}
          imageScale={0.54}
        />
        <View
          style={{
            justifyContent: "space-between",
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              fontSize: 13,
              color: colors["text-label-list"],
              fontWeight: "700",
            }}
          >
            {name}
          </Text>
          <Text
            style={{
              ...typography.subtitle2,
              color: colors["primary-text"],
              fontWeight: "700",
            }}
          >
            {amountBalance}
          </Text>

          <Text
            style={{
              ...typography.subtitle3,
              color: colors["text-black-low"],
              marginBottom: spacing["4"],
            }}
          >
            {priceBalance?.toString() || "$0"}
          </Text>
        </View>
      </View>
      <View
        style={{
          flex: 0.5,
          justifyContent: "center",
          alignItems: "flex-end",
        }}
      >
        <RightArrowIcon height={10} color={colors["primary-text"]} />
      </View>
      {/* <View
        style={{
          flex: 0.5,
          justifyContent: 'center',
          alignItems: 'flex-end'
        }}
      >
        <AnimatedCircularProgress
          size={56}
          width={6}
          fill={amountBalance ? +amountBalance / totalBalance : 0}
          tintColor={colors['primary-surface-default']}
          backgroundColor={colors['gray-50']}
          rotation={0}
        >
          {(fill) => (
            <Text
              h4
              h4Style={{
                ...typography.h7,
                fontSize: 11
              }}
            >
              {balanceUsdInPercent}
            </Text>
          )}
        </AnimatedCircularProgress>
      </View> */}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  containerToken: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing["4"],
    marginVertical: spacing["8"],
    paddingTop: spacing["10"],
    paddingBottom: spacing["10"],
  },
});

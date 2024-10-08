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
import { formatBalance } from "@owallet/bitcoin";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";

interface TokenItemBitcoinProps {
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

export const TokenItemBitcoin: FunctionComponent<TokenItemBitcoinProps> = ({
  containerStyle,
  chainInfo,
  balance,
  priceBalance,
}) => {
  const { colors } = useTheme();

  // The IBC currency could have long denom (with the origin chain/channel information).
  // Because it is shown in the title, there is no need to show such long denom twice in the actual balance.

  let name = balance?.currency?.coinDenom;

  const amountBalance = useMemo(() => {
    const amount = formatBalance({
      balance: Number(balance?.toCoin()?.amount),
      cryptoUnit: "BTC",
      coin: chainInfo.chainId,
    });
    return amount;
  }, [chainInfo.chainId, balance]);

  return (
    <TouchableOpacity
      key={chainInfo.chainId}
      activeOpacity={0.7}
      style={{ ...styles.containerToken, ...containerStyle }}
      onPress={() => {
        if (!!balance?.currency) {
          navigate(SCREENS.TokenDetails, {
            balanceCoinDenom: "",
            amountBalance,
            balanceCurrency: balance?.currency,
            priceBalance,
            balanceCoinFull: balance?.currency.coinDenom,
          });
        }
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
        {!!balance?.currency && (
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
        )}
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

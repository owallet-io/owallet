import React, { FunctionComponent } from "react";
import { MsgDelegate } from "@owallet/proto-types/cosmos/staking/v1beta1/tx";
import { observer } from "mobx-react-lite";
import { CoinPrimitive, Staking } from "@owallet/stores";
import { Bech32Address } from "@owallet/cosmos";
import { CoinPretty } from "@owallet/unit";
import { FormattedMessage } from "react-intl";
import { IMessageRenderer } from "./types";
import { Image, Text } from "react-native";
import { useStore } from "@src/stores";
import { useStyle } from "@src/styles";
import images from "@assets/images";
import OWText from "@components/text/ow-text";
import { useTheme } from "@src/themes/theme-provider";

export const DelegateMessage: IMessageRenderer = {
  process(chainId: string, msg) {
    const d = (() => {
      if ("type" in msg && msg.type === "cosmos-sdk/MsgDelegate") {
        return {
          amount: msg.value.amount,
          validatorAddress: msg.value.validator_address,
          delegatorAddress: msg.value.delegatorAddress,
        };
      }

      if (
        "unpacked" in msg &&
        msg.typeUrl === "/cosmos.staking.v1beta1.MsgDelegate"
      ) {
        return {
          amount: (msg.unpacked as MsgDelegate).amount,
          validatorAddress: (msg.unpacked as MsgDelegate).validatorAddress,
          delegatorAddress: (msg.unpacked as MsgDelegate).delegatorAddress,
        };
      }
    })();

    if (d) {
      return {
        icon: (
          <Image
            style={{ width: 48, height: 48 }}
            source={images.carbon_notification}
          />
        ),
        title: (
          <FormattedMessage id="page.sign.components.messages.delegate.title" />
        ),
        content: (
          <DelegateMessagePretty
            chainId={chainId}
            amount={d.amount}
            validatorAddress={d.validatorAddress}
          />
        ),
      };
    }
  },
};

const DelegateMessagePretty: FunctionComponent<{
  chainId: string;
  amount: CoinPrimitive;
  validatorAddress: string;
}> = observer(({ chainId, amount, validatorAddress }) => {
  const { chainStore, queriesStore } = useStore();
  const style = useStyle();

  const currency = chainStore.getChain(chainId).forceFindCurrency(amount.denom);
  const coinpretty = new CoinPretty(currency, amount.amount);
  const moniker = queriesStore
    .get(chainId)
    .cosmos.queryValidators.getQueryStatus(Staking.BondStatus.Bonded)
    .getValidator(validatorAddress)?.description.moniker;
  const { colors } = useTheme();
  return (
    <OWText
      style={{
        ...style.flatten(["body3"]),
        color: colors["neutral-text-body"],
      }}
    >
      <FormattedMessage
        id="page.sign.components.messages.delegate.paragraph"
        values={{
          validator:
            moniker || Bech32Address.shortenAddress(validatorAddress, 28),
          amount: coinpretty.trim(true).toString(),
          b: (...chunks: any) => (
            <Text style={{ fontWeight: "bold" }}>{chunks}</Text>
          ),
        }}
      />
    </OWText>
  );
});

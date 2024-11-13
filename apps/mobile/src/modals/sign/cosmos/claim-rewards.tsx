import { IMessageRenderer } from "./types";
import { MsgWithdrawDelegatorReward } from "@owallet/proto-types/cosmos/distribution/v1beta1/tx";
import React, { FunctionComponent } from "react";
// import * as ExpoImage from 'expo-image';
import { FormattedMessage } from "react-intl";
import { observer } from "mobx-react-lite";
// import {useStore} from '../../stores';
import { Staking } from "@owallet/stores";
import { Bech32Address } from "@owallet/cosmos";
import { Image, Text } from "react-native";
import { useStore } from "@src/stores";
import { useStyle } from "@src/styles";
import images from "@assets/images";
import OWText from "@components/text/ow-text";
import { useTheme } from "@src/themes/theme-provider";
// import {useStyle} from '../../styles';

export const ClaimRewardsMessage: IMessageRenderer = {
  process(chainId: string, msg) {
    const d = (() => {
      if (
        "type" in msg &&
        msg.type === "cosmos-sdk/MsgWithdrawDelegationReward"
      ) {
        return {
          validatorAddress: msg.value.validator_address,
        };
      }

      if (
        "unpacked" in msg &&
        msg.typeUrl ===
          "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward"
      ) {
        return {
          validatorAddress: (msg.unpacked as MsgWithdrawDelegatorReward)
            .validatorAddress,
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
          <FormattedMessage id="page.sign.components.messages.claim-rewards.title" />
        ),
        content: (
          <ClaimRewardsMessagePretty
            chainId={chainId}
            validatorAddress={d.validatorAddress}
          />
        ),
      };
    }
  },
};

const ClaimRewardsMessagePretty: FunctionComponent<{
  chainId: string;
  validatorAddress: string;
}> = observer(({ chainId, validatorAddress }) => {
  const { queriesStore } = useStore();
  const style = useStyle();

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
        id="page.sign.components.messages.claim-rewards.paragraph"
        values={{
          validator:
            moniker || Bech32Address.shortenAddress(validatorAddress, 28),
          b: (...chunks: any) => (
            <OWText style={{ fontWeight: "bold" }}>{chunks}</OWText>
          ),
        }}
      />
    </OWText>
  );
});

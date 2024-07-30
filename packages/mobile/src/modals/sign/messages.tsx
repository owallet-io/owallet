/* eslint-disable react/display-name */

import React from "react";
import { CoinUtils, Coin } from "@owallet/unit";
import { AppCurrency, Currency } from "@owallet/types";
import { CoinPrimitive } from "@owallet/stores";
import { Text } from "@src/components/text";
import { Bech32Address } from "@owallet/cosmos";
import { FormattedMessage, IntlShape } from "react-intl";
import { Badge } from "../../components/badge";
import { StyleSheet, View } from "react-native";
import { typography } from "../../themes";

import {
  IBCMsgTransferView,
  MsgBeginRedelegateView,
  MsgDelegateView,
  MsgExecuteContractView,
  MsgTransferView,
  SendMsgView,
  UnDelegateView,
  UnknownMsgView,
  WasmExecutionMsgView,
  WithdrawDelegateView,
} from "@src/modals/sign/components";
import { clearDecimals, getPrice, hyphen } from "@src/modals/sign/helper";

export interface MessageObj {
  readonly type: string;
  readonly value: unknown;
}

export interface MsgSend {
  value: {
    amount: [
      {
        amount: string;
        denom: string;
      }
    ];
    from_address: string;
    to_address: string;
  };
}

export interface MsgTransfer {
  value: {
    source_port: string;
    source_channel: string;
    token: {
      denom: string;
      amount: string;
    };
    sender: string;
    receiver: string;
    timeout_height: {
      revision_number: string | undefined;
      revision_height: string;
    };
  };
}

export interface MsgDelegate {
  value: {
    amount: {
      amount: string;
      denom: string;
    };
    delegator_address: string;
    validator_address: string;
  };
}

export interface MsgUndelegate {
  value: {
    amount: {
      amount: string;
      denom: string;
    };
    delegator_address: string;
    validator_address: string;
  };
}

export interface MsgWithdrawDelegatorReward {
  value: {
    delegator_address: string;
    validator_address: string;
  };
}

export interface MsgBeginRedelegate {
  value: {
    amount: {
      amount: string;
      denom: string;
    };
    delegator_address: string;
    validator_dst_address: string;
    validator_src_address: string;
  };
}

export interface MsgVote {
  value: {
    proposal_id: string;
    voter: string;
    // In the stargate, option would be the enum (0: empty, 1: yes, 2: abstain, 3: no, 4: no with veto).
    option: string | number;
  };
}

export interface MsgInstantiateContract {
  value: {
    // Admin field can be omitted.
    admin?: string;
    sender: string;
    code_id: string;
    label: string;
    // eslint-disable-next-line @typescript-eslint/ban-types
    init_msg: object;
    init_funds: [
      {
        amount: string;
        denom: string;
      }
    ];
  };
}

// This message can be a normal cosmwasm message or a secret-wasm message.
export interface MsgExecuteContract {
  value: {
    contract: string;
    // If message is for secret-wasm, msg will be the base64 encoded and encrypted string.
    // eslint-disable-next-line @typescript-eslint/ban-types
    msg: object | string;
    sender: string;
    // The field is for wasm message.
    funds?: [
      {
        amount: string;
        denom: string;
      }
    ];
    // The bottom fields are for secret-wasm message.
    sent_funds?: [
      {
        amount: string;
        denom: string;
      }
    ];
    callback_code_hash?: string;
    callback_sig?: string | null;
  };
}

export interface MsgLink {
  value: {
    links: [
      {
        from: string;
        to: string;
      }
    ];
    address: string;
  };
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function renderUnknownMessage(msg: object) {
  return {
    icon: undefined,
    title: "Custom",
    content: <UnknownMsgView msg={msg} />,
  };
}

export const renderMsgSend = (
  currencies: AppCurrency[],
  amount: CoinPrimitive[],
  toAddress: string,
  fromAddress: string
) => {
  const receives: CoinPrimitive[] = [];
  for (const coinPrimitive of amount) {
    const coin = new Coin(coinPrimitive.denom, coinPrimitive.amount);
    const parsed = CoinUtils.parseDecAndDenomFromCoin(currencies, coin);
    receives.push({
      amount: clearDecimals(parsed.amount),
      denom: parsed.denom,
    });
  }
  return {
    title: "Send",
    content: (
      <SendMsgView
        {...{ toAddress, fromAddress, amount, receives, currencies }}
      />
    ),
  };
};

export function renderMsgTransfer(
  currencies: AppCurrency[],
  amount: CoinPrimitive,
  receiver: string,
  channelId: string
) {
  const coin = new Coin(amount.denom, amount.amount);
  const parsed = CoinUtils.parseDecAndDenomFromCoin(currencies, coin);

  amount = {
    amount: clearDecimals(parsed.amount),
    denom: parsed.denom,
  };

  return {
    title: "IBC Transfer",
    content: <MsgTransferView {...{ currencies, amount, receiver }} />,
  };
}

export function renderMsgBeginRedelegate(
  currencies: AppCurrency[],
  amount: CoinPrimitive,
  validatorSrcAddress: string,
  validatorDstAddress: string
) {
  const parsed = CoinUtils.parseDecAndDenomFromCoin(
    currencies,
    new Coin(amount.denom, amount.amount)
  );

  amount = {
    amount: clearDecimals(parsed.amount),
    denom: parsed.denom,
  };

  return {
    title: "Switch Validator",
    content: (
      <MsgBeginRedelegateView
        {...{ currencies, amount, validatorSrcAddress, validatorDstAddress }}
      />
    ),
  };
}

export function renderMsgUndelegate(
  currencies: AppCurrency[],
  amount: CoinPrimitive,
  validatorAddress: string
) {
  const parsed = CoinUtils.parseDecAndDenomFromCoin(
    currencies,
    new Coin(amount.denom, amount.amount)
  );

  amount = {
    amount: clearDecimals(parsed.amount),
    denom: parsed.denom,
  };

  return {
    title: "Unstake",
    content: <UnDelegateView {...{ currencies, amount, validatorAddress }} />,
  };
}

export function renderMsgDelegate(
  currencies: AppCurrency[],
  amount: CoinPrimitive,
  validatorAddress: string
) {
  const parsed = CoinUtils.parseDecAndDenomFromCoin(
    currencies,
    new Coin(amount.denom, amount.amount)
  );

  amount = {
    amount: clearDecimals(parsed.amount),
    denom: parsed.denom,
  };

  return {
    title: "Stake",
    content: <MsgDelegateView {...{ currencies, amount, validatorAddress }} />,
  };
}

export function renderMsgWithdrawDelegatorReward(validatorAddress: string) {
  return {
    title: "Claim Staking Reward",
    content: <WithdrawDelegateView validatorAddress={validatorAddress} />,
  };
}

export function renderMsgIBCMsgTransfer(msg: MsgTransfer["value"]) {
  return {
    title: "IBC Transfer",
    content: <IBCMsgTransferView {...msg} />,
  };
}

export function renderMsgVote(proposalId: string, option: string | number) {
  const textualOption = (() => {
    if (typeof option === "string") {
      return option;
    }

    switch (option) {
      case 0:
        return "Empty";
      case 1:
        return "Yes";
      case 2:
        return "Abstain";
      case 3:
        return "No";
      case 4:
        return "No with veto";
      default:
        return "Unspecified";
    }
  })();

  // Vote <b>{option}</b> on <b>Proposal {id}</b>

  return {
    title: "Vote",
    content: (
      <View style={{}}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ ...styles.textInfo }}>Vote </Text>
          <Text style={{ fontWeight: "bold" }}>{textualOption}</Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ ...styles.textInfo }}>Proposal </Text>
          <Text style={{ fontWeight: "bold" }}>{proposalId}</Text>
        </View>
        {/* <Text>{' will receive '}</Text> */}
      </View>
    ),
  };
}

export function renderMsgInstantiateContract(
  currencies: Currency[],
  intl: IntlShape,
  initFunds: CoinPrimitive[],
  admin: string | undefined,
  codeId: string,
  label: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  initMsg: object
) {
  const funds: { amount: string; denom: string }[] = [];
  for (const coinPrimitive of initFunds) {
    const coin = new Coin(coinPrimitive.denom, coinPrimitive.amount);
    const parsed = CoinUtils.parseDecAndDenomFromCoin(currencies, coin);
    funds.push({
      amount: clearDecimals(parsed.amount),
      denom: parsed.denom,
    });
  }
  return {
    icon: "fas fa-cog",
    title: intl.formatMessage({
      id: "sign.list.message.wasm/MsgInstantiateContract.title",
    }),
    content: (
      <React.Fragment>
        <FormattedMessage
          id="sign.list.message.wasm/MsgInstantiateContract.content"
          values={{
            b: (...chunks: any[]) => <b>{chunks}</b>,
            br: <br />,
            admin: admin ? Bech32Address.shortenAddress(admin, 30) : "",
            ["only-admin-exist"]: (...chunks: any[]) => (admin ? chunks : ""),
            codeId: codeId,
            label: label,
            ["only-funds-exist"]: (...chunks: any[]) =>
              funds.length > 0 ? chunks : "",
            funds: funds
              .map((coin) => {
                return `${coin.amount} ${coin.denom}`;
              })
              .join(","),
          }}
        />
        <br />
        <WasmExecutionMsgView msg={initMsg} />
      </React.Fragment>
    ),
  };
}

export function renderMsgExecuteContract(
  currencies: Currency[],
  sentFunds: CoinPrimitive[],
  callbackCodeHash: string | undefined,
  contract: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  msg: object | string
) {
  const sent: { amount: string; denom: string }[] = [];
  for (const coinPrimitive of sentFunds) {
    const coin = new Coin(coinPrimitive.denom, coinPrimitive.amount);
    const parsed = CoinUtils.parseDecAndDenomFromCoin(currencies, coin);

    sent.push({
      amount: clearDecimals(parsed.amount),
      denom: parsed.denom,
    });
  }

  return {
    icon: "fas fa-cog",
    title: "Execute Wasm Contract",
    content: (
      <MsgExecuteContractView
        {...{
          callbackCodeHash,
          contract,
          sent,
          msg,
          currencies,
        }}
      />
    ),
  };
}

const styles = StyleSheet.create({
  textInfo: {
    ...typography.h5,
    fontWeight: "400",
  },
});

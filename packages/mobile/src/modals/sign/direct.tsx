import { AppCurrency } from "@owallet/types";
import { UnknownMessage } from "@owallet/cosmos";
import { MsgSend } from "@owallet/proto-types/cosmos/bank/v1beta1/tx";

import { MsgTransfer } from "@owallet/proto-types/ibc/applications/transfer/v1/tx";
import {
  MsgBeginRedelegate,
  MsgDelegate,
  MsgUndelegate,
} from "@owallet/proto-types/cosmos/staking/v1beta1/tx";
import {
  MsgExecuteContract,
  MsgInstantiateContract,
} from "@owallet/proto-types/cosmwasm/wasm/v1/tx";
import { MsgWithdrawDelegatorReward } from "@owallet/proto-types/cosmos/distribution/v1beta1/tx";
import { MsgVote } from "@owallet/proto-types/cosmos/gov/v1beta1/tx";
import { fromUtf8 } from "@cosmjs/encoding";
import {
  renderMsgBeginRedelegate,
  renderMsgDelegate,
  renderMsgExecuteContract,
  renderMsgSend,
  renderMsgUndelegate,
  renderUnknownMessage,
  renderMsgWithdrawDelegatorReward,
  renderMsgIBCMsgTransfer,
  renderMsgVote,
} from "./messages";
import { CoinPrimitive } from "@owallet/stores";

import { Buffer } from "buffer";

export function renderDirectMessage(msg: any, currencies: AppCurrency[]) {
  if (!(msg instanceof UnknownMessage) && "unpacked" in msg) {
    if (msg.typeUrl === "/cosmos.bank.v1beta1.MsgSend") {
      const sendMsg = msg.unpacked as MsgSend;
      return renderMsgSend(
        currencies,
        sendMsg.amount as CoinPrimitive[],
        sendMsg.toAddress
      );
    }

    if (msg.typeUrl === "/cosmos.staking.v1beta1.MsgDelegate") {
      const delegateMsg = msg.unpacked as MsgDelegate;
      return renderMsgDelegate(
        currencies,
        delegateMsg.amount as CoinPrimitive,
        delegateMsg.validatorAddress
      );
    }

    if (msg.typeUrl === "/cosmos.staking.v1beta1.MsgBeginRedelegate") {
      const beginRedelegateMsg = msg.unpacked as MsgBeginRedelegate;
      return renderMsgBeginRedelegate(
        currencies,
        beginRedelegateMsg.amount as CoinPrimitive,
        beginRedelegateMsg.validatorSrcAddress,
        beginRedelegateMsg.validatorDstAddress
      );
    }

    if (msg.typeUrl === "/cosmos.staking.v1beta1.MsgUndelegate") {
      const msgUndelegate = msg.unpacked as MsgUndelegate;
      return renderMsgUndelegate(
        currencies,
        msgUndelegate.amount as CoinPrimitive,
        msgUndelegate.validatorAddress
      );
    }

    if (msg.typeUrl === "/cosmwasm.wasm.v1.MsgExecuteContract") {
      const msgExecuteContract = msg.unpacked as MsgExecuteContract;
      return renderMsgExecuteContract(
        currencies,
        msgExecuteContract.funds as CoinPrimitive[],
        undefined,
        msgExecuteContract.contract,
        JSON.parse(Buffer.from(msgExecuteContract.msg).toString())
      );
    }

    if (
      msg.typeUrl === "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward"
    ) {
      const msgWithdrawDelegatorReward =
        msg.unpacked as MsgWithdrawDelegatorReward;
      return renderMsgWithdrawDelegatorReward(
        msgWithdrawDelegatorReward.validatorAddress
      );
    }

    if (msg.typeUrl === "/ibc.applications.transfer.v1.MsgTransfer") {
      const msgTransfer = msg.unpacked as MsgTransfer;
      return renderMsgIBCMsgTransfer(msgTransfer);
    }

    if (msg.typeUrl === "/cosmos.gov.v1beta1.MsgVote") {
      const msgVote = msg.unpacked as MsgVote;
      return renderMsgVote(JSON.stringify(msgVote.proposalId), msgVote.option);
    }
  }
  if (msg instanceof UnknownMessage) {
    return renderUnknownMessage(msg.toJSON());
  }
  return renderUnknownMessage({
    typeUrl: msg.typeUrl || msg.type_url || "Unknown",
    value: Buffer.from(msg?.value ?? "Unknown").toString("base64"),
  });
}

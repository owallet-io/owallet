import { AppCurrency } from '@owallet/types';
import { cosmos, cosmwasm, ibc, UnknownMessage } from '@owallet/cosmos';
import { fromUtf8 } from '@cosmjs/encoding';
import {
  renderMsgBeginRedelegate,
  renderMsgDelegate,
  renderMsgExecuteContract,
  renderMsgSend,
  renderMsgUndelegate,
  renderUnknownMessage,
  renderMsgWithdrawDelegatorReward,
  renderMsgIBCMsgTransfer,
  renderMsgVote
} from './messages';
import { CoinPrimitive } from '@owallet/stores';

import { Buffer } from 'buffer';

export function renderDirectMessage(msg: any, currencies: AppCurrency[]) {
  if (msg instanceof cosmos.bank.v1beta1.MsgSend) {
    return renderMsgSend(
      currencies,
      msg.amount as CoinPrimitive[],
      msg.toAddress
    );
  }

  if (msg instanceof cosmos.staking.v1beta1.MsgDelegate) {
    return renderMsgDelegate(
      currencies,
      msg.amount as CoinPrimitive,
      msg.validatorAddress
    );
  }

  if (msg instanceof cosmos.staking.v1beta1.MsgBeginRedelegate) {
    return renderMsgBeginRedelegate(
      currencies,
      msg.amount as CoinPrimitive,
      msg.validatorSrcAddress,
      msg.validatorDstAddress
    );
  }

  if (msg instanceof cosmos.staking.v1beta1.MsgUndelegate) {
    return renderMsgUndelegate(
      currencies,
      msg.amount as CoinPrimitive,
      msg.validatorAddress
    );
  }

  if (msg instanceof cosmwasm.wasm.v1.MsgExecuteContract) {
    return renderMsgExecuteContract(
      currencies,
      msg.funds as CoinPrimitive[],
      undefined,
      msg.contract,
      JSON.parse(fromUtf8(msg.msg))
    );
  }

  if (msg instanceof cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward) {
    return renderMsgWithdrawDelegatorReward(msg.validatorAddress);
  }

  if (msg instanceof ibc.applications.transfer.v1.MsgTransfer) {
    return renderMsgIBCMsgTransfer(msg);
  }

  if (msg instanceof cosmos.gov.v1beta1.MsgVote) {
    return renderMsgVote(JSON.parse(msg.proposalId), msg.option);
  }

  if (msg instanceof UnknownMessage) {
    return renderUnknownMessage(msg.toJSON());
  }

  return renderUnknownMessage({
    typeUrl: msg.typeUrl || msg.type_url || 'Unknown',
    value: Buffer.from(msg?.value ?? 'Unknown').toString('base64')
  });
}

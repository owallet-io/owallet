import { Currency } from '@owallet/types';
import { IntlShape } from 'react-intl';
import { UnknownMessage } from '@owallet/cosmos';
// import { cosmos, cosmwasm, ibc, UnknownMessage } from '@owallet/cosmos';
import { MsgSend } from '@owallet/proto-types/cosmos/bank/v1beta1/tx';

import { MsgTransfer } from '@owallet/proto-types/ibc/applications/transfer/v1/tx';
import { MsgBeginRedelegate, MsgDelegate, MsgUndelegate } from '@owallet/proto-types/cosmos/staking/v1beta1/tx';
import { MsgExecuteContract, MsgInstantiateContract } from '@owallet/proto-types/cosmwasm/wasm/v1/tx';
import { MsgWithdrawDelegatorReward } from '@owallet/proto-types/cosmos/distribution/v1beta1/tx';
import { MsgVote } from '@owallet/proto-types/cosmos/gov/v1beta1/tx';
import {
  renderMsgBeginRedelegate,
  renderMsgDelegate,
  renderMsgExecuteContract,
  renderMsgInstantiateContract,
  renderMsgSend,
  renderMsgTransfer,
  renderMsgUndelegate,
  renderMsgVote,
  renderMsgWithdrawDelegatorReward,
  renderUnknownMessage
} from './messages';
import { CoinPrimitive } from '@owallet/stores';

import { Buffer } from 'buffer';
import { fromUtf8 } from '@cosmjs/encoding';

export function renderDirectMessage(msg: any, currencies: Currency[], intl: IntlShape) {
  try {
    if (!(msg instanceof UnknownMessage) && 'unpacked' in msg) {
      if (msg.typeUrl === '/cosmos.bank.v1beta1.MsgSend') {
        const sendMsg = msg.unpacked as MsgSend;
        return renderMsgSend(currencies, intl, sendMsg.amount as CoinPrimitive[], sendMsg.toAddress);
      }
      if (msg.typeUrl === '/cosmos.staking.v1beta1.MsgDelegate') {
        const delegateMsg = msg.unpacked as MsgDelegate;
        return renderMsgDelegate(currencies, intl, delegateMsg.amount as CoinPrimitive, delegateMsg.validatorAddress);
      }
      // if (msg instanceof cosmos.staking.v1beta1.MsgDelegate) {
      //   return renderMsgDelegate(currencies, intl, msg.amount as CoinPrimitive, msg.validatorAddress);
      // }

      // if (msg instanceof cosmwasm.wasm.v1.MsgInstantiateContract) {
      //   let codeId: string | any = msg.codeId;
      //   if (typeof msg.codeId == 'object') {
      //     codeId = msg.codeId?.low?.toString() || msg.codeId?.high?.toString();
      //   }
      //   return renderMsgInstantiateContract(currencies, intl, msg.funds as CoinPrimitive[], msg.admin, codeId as string, msg.label, msg.msg);
      // }
      if (msg.typeUrl === '/cosmwasm.wasm.v1.MsgInstantiateContract') {
        const instantiateContractMsg = msg.unpacked as MsgInstantiateContract;
        let codeId: string | any = instantiateContractMsg.codeId;
        if (typeof instantiateContractMsg.codeId == 'object') {
          codeId = instantiateContractMsg.codeId?.low?.toString() || instantiateContractMsg.codeId?.high?.toString();
        }
        return renderMsgInstantiateContract(
          currencies,
          intl,
          instantiateContractMsg.funds as CoinPrimitive[],
          instantiateContractMsg.admin,
          codeId as string,
          instantiateContractMsg.label,
          instantiateContractMsg.msg
        );
      }
      // if (msg instanceof ibc.applications.transfer.v1.MsgTransfer) {
      //   return renderMsgTransfer(currencies, intl, msg.token as CoinPrimitive, msg.receiver, msg.sourceChannel);
      // }
      if (msg.typeUrl === '/ibc.applications.transfer.v1.MsgTransfer') {
        const msgTransfer = msg.unpacked as MsgTransfer;
        return renderMsgTransfer(currencies, intl, msgTransfer.token as CoinPrimitive, msgTransfer.receiver, msgTransfer.sourceChannel);
      }

      // if (msg instanceof cosmos.staking.v1beta1.MsgBeginRedelegate) {
      //   return renderMsgBeginRedelegate(currencies, intl, msg.amount as CoinPrimitive, msg.validatorSrcAddress, msg.validatorDstAddress);
      // }
      if (msg.typeUrl === '/cosmos.staking.v1beta1.MsgBeginRedelegate') {
        const beginRedelegateMsg = msg.unpacked as MsgBeginRedelegate;
        return renderMsgBeginRedelegate(
          currencies,
          intl,
          beginRedelegateMsg.amount as CoinPrimitive,
          beginRedelegateMsg.validatorSrcAddress,
          beginRedelegateMsg.validatorDstAddress
        );
      }
      // if (msg instanceof cosmos.staking.v1beta1.MsgUndelegate) {
      //   return renderMsgUndelegate(currencies, intl, msg.amount as CoinPrimitive, msg.validatorAddress);
      // }
      if (msg.typeUrl === '/cosmos.staking.v1beta1.MsgUndelegate') {
        const msgUndelegate = msg.unpacked as MsgUndelegate;
        return renderMsgUndelegate(currencies, intl, msgUndelegate.amount as CoinPrimitive, msgUndelegate.validatorAddress);
      }
      // if (msg instanceof cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward) {
      //   return renderMsgWithdrawDelegatorReward(intl, msg.validatorAddress);
      // }
      if (msg.typeUrl === '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward') {
        const msgWithdrawDelegatorReward = msg.unpacked as MsgWithdrawDelegatorReward;
        return renderMsgWithdrawDelegatorReward(intl, msgWithdrawDelegatorReward.validatorAddress);
      }
      // if (msg instanceof cosmwasm.wasm.v1.MsgExecuteContract) {
      //   return renderMsgExecuteContract(currencies, intl, msg.funds as CoinPrimitive[], undefined, msg.contract, JSON.parse(fromUtf8(msg.msg)));
      // }
      if (msg.typeUrl === '/cosmwasm.wasm.v1.MsgExecuteContract') {
        const msgExecuteContract = msg.unpacked as MsgExecuteContract;
        return renderMsgExecuteContract(
          currencies,
          intl,
          msgExecuteContract.funds as CoinPrimitive[],
          undefined,
          msgExecuteContract.contract,
          JSON.parse(fromUtf8(msgExecuteContract.msgExecuteContract))
        );
      }
      // if (msg instanceof cosmos.gov.v1beta1.MsgVote) {
      //   return renderMsgVote(intl, msg.proposalId.toString(), msg.option);
      // }
      if (msg.typeUrl === '/cosmos.gov.v1beta1.MsgVote') {
        const msgVote = msg.unpacked as MsgVote;
        // return renderMsgVote(intl,msg.proposalId.toString(), msgVote.option);
        return renderMsgVote(intl, msgVote.proposalId.toString(), msgVote.option);
      }
    }

    if (msg instanceof UnknownMessage) {
      return renderUnknownMessage(msg.toJSON());
    }
  } catch (e) {
    console.log(e);
  }

  return renderUnknownMessage({
    typeUrl: msg.typeUrl || msg.type_url || 'Unknown',
    value: Buffer.from(msg.value).toString('base64')
  });
}

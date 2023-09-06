import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx';
import { toUtf8 } from '@cosmjs/encoding';
import { Coin } from '@cosmjs/stargate';
import { EncodeObject } from '@cosmjs/proto-signing';

export interface HandleOptions {
  readonly memo?: string;
  readonly funds?: readonly Coin[];
}

export interface ExecuteMultipleMsg {
  contractAddress: string;
  handleMsg: string;
  handleOptions?: HandleOptions;
}

interface Msg {
  contractAddress: string;
  handleMsg: any;
  transferAmount?: readonly Coin[];
}

const parseExecuteContractMultiple = (msgs: ExecuteMultipleMsg[]) => {
  console.log('messages in parse execute contract: ', msgs);
  return msgs.map(({ handleMsg, handleOptions, contractAddress }) => {
    return {
      handleMsg: JSON.parse(handleMsg),
      transferAmount: handleOptions?.funds,
      contractAddress
    };
  });
};

const getExecuteContractMsgs = (
  senderAddress: string,
  msgs: Msg[]
): EncodeObject[] => {
  return msgs.map(({ handleMsg, transferAmount, contractAddress }) => {
    return {
      typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
      value: MsgExecuteContract.fromPartial({
        sender: senderAddress,
        contract: contractAddress,
        msg: toUtf8(JSON.stringify(handleMsg)),
        funds: [...(transferAmount || [])]
      })
    };
  });
};

export { getExecuteContractMsgs, parseExecuteContractMultiple };

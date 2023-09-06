import * as cosmwasm from '@cosmjs/cosmwasm-stargate';
import { toUtf8 } from '@cosmjs/encoding';
import { EncodeObject } from '@cosmjs/proto-signing';
import { Coin, GasPrice, isDeliverTxFailure, logs } from '@cosmjs/stargate';
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx';

/**
 * The options of an .instantiate() call.
 * All properties are optional.
 */
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

const getAminoExecuteContractMsgs = (senderAddress: string, msgs: Msg[]) => {
  return msgs.map(({ handleMsg, transferAmount, contractAddress }) => {
    return {
      type: 'wasm/MsgExecuteContract',
      value: {
        sender: senderAddress,
        contract: contractAddress,
        msg: handleMsg,
        sent_funds: [...(transferAmount || [])]
      }
    };
  });
};

const executeMultipleDirectClient = async (
  senderAddress: string,
  msgs: Msg[],
  memo = '',
  client: cosmwasm.SigningCosmWasmClient
) => {
  const executeContractMsgs = getExecuteContractMsgs(senderAddress, msgs);
  console.log({ senderAddress, executeContractMsgs });
  const result = await client.signAndBroadcast(
    senderAddress,
    executeContractMsgs,
    'auto',
    memo
  );
  if (isDeliverTxFailure(result)) {
    throw new Error(
      `Error when broadcasting tx ${result.transactionHash} at height ${result.height}. Raw log: ${result.rawLog}`
    );
  }
  return {
    logs: logs.parseRawLog(result.rawLog),
    transactionHash: result.transactionHash
  };
};

const executeMultipleAminoClient = async (
  msgs: Msg[],
  memo = '',
  client: cosmwasm.SigningCosmWasmClient,
  walletAddr: string
) => {
  const executeMsgs = getExecuteContractMsgs(walletAddr, msgs);

  const result = await client.signAndBroadcast(
    walletAddr,
    executeMsgs,
    'auto',
    memo
  );
  if (isDeliverTxFailure(result)) {
    throw new Error(
      `Error when broadcasting tx ${result.transactionHash} at height ${result.height}. Code: ${result.code}; Raw log: ${result.rawLog}`
    );
  }
  return {
    logs: result?.rawLog,
    transactionHash: result.transactionHash
  };
};
export {
  getExecuteContractMsgs,
  parseExecuteContractMultiple,
  getAminoExecuteContractMsgs
};

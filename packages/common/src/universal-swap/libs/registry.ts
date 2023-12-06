import { Registry } from '@cosmjs/proto-signing';
import { defaultRegistryTypes as defaultStargateTypes } from '@cosmjs/stargate';
import { MsgSendToEth } from './proto/gravity/v1/msgs';
import { MsgTransfer } from './proto/ibc/applications/transfer/v1/tx';
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx';
//@ts-ignore
const customRegistry = new Registry(defaultStargateTypes);
customRegistry.register('/gravity.v1.MsgSendToEth', MsgSendToEth);
customRegistry.register(
  '/ibc.applications.transfer.v1.MsgTransfer',
  MsgTransfer
);
customRegistry.register(
  '/cosmwasm.wasm.v1.MsgExecuteContract',
  MsgExecuteContract
);

export const customAminoTypes = {
  '/gravity.v1.MsgSendToEth': {
    aminoType: 'gravity/MsgSendToEth',
    toAmino: ({
      sender,
      ethDest,
      amount,
      bridgeFee,
      chainFee,
      evmChainPrefix
    }: MsgSendToEth) => ({
      sender,
      eth_dest: ethDest,
      amount,
      bridge_fee: bridgeFee,
      chain_fee: chainFee,
      evm_chain_prefix: evmChainPrefix
    }),
    fromAmino: ({
      sender,
      eth_dest,
      amount,
      bridge_fee,
      chain_fee,
      evm_chain_prefix
    }): MsgSendToEth => ({
      sender,
      ethDest: eth_dest,
      amount,
      bridgeFee: bridge_fee,
      chainFee: chain_fee,
      evmChainPrefix: evm_chain_prefix
    })
  },
  '/ibc.applications.transfer.v1.MsgTransfer': {
    aminoType: 'cosmos-sdk/MsgTransfer',
    toAmino: ({
      sourcePort,
      sourceChannel,
      token,
      sender,
      receiver,
      timeoutHeight,
      timeoutTimestamp,
      memo
    }: MsgTransfer) => ({
      source_port: sourcePort,
      source_channel: sourceChannel,
      token: token,
      sender: sender,
      receiver: receiver,
      timeout_height: timeoutHeight,
      timeout_timestamp: timeoutTimestamp,
      memo
    }),
    fromAmino: ({
      source_port,
      source_channel,
      token,
      sender,
      receiver,
      timeout_height,
      timeout_timestamp,
      memo
    }): MsgTransfer => ({
      sourcePort: source_port,
      sourceChannel: source_channel,
      token,
      sender,
      receiver,
      timeoutHeight: timeout_height,
      timeoutTimestamp: timeout_timestamp,
      memo
    })
  }
};

export default customRegistry;

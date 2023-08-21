import { TypeTextAndCustomizeComponent } from './types';

import * as cosmwasm from '@cosmjs/cosmwasm-stargate';
import { createWasmAminoConverters } from '@cosmjs/cosmwasm-stargate';
import { EncodeObject } from '@cosmjs/proto-signing';
import {
  AminoTypes,
  GasPrice,
  SigningStargateClient,
  coin
} from '@cosmjs/stargate';
import {
  TokenItemType,
  UniversalSwapType,
  oraichainTokens
} from './config/bridgeTokens';
import { NetworkChainId } from './config/chainInfos';
import { ORAI, ORAI_BRIDGE_EVM_TRON_DENOM_PREFIX } from './config/constants';
import { IBCInfo, ibcInfos, oraichain2oraib } from './config/ibcInfos';
import { network } from './config/networks';
import {
  calculateTimeoutTimestamp,
  getNetworkGasPrice,
  tronToEthAddress
} from './helper';
import {
  CwIcs20LatestQueryClient,
  Ratio,
  TransferBackMsg,
  Uint128
} from '@oraichain/common-contracts-sdk';
import CosmJs, {
  getExecuteContractMsgs,
  parseExecuteContractMultiple
} from 'libs/cosmjs';
import { MsgTransfer } from 'libs/proto/ibc/applications/transfer/v1/tx';
import customRegistry, { customAminoTypes } from 'libs/registry';
import {
  atomic,
  buildMultipleMessages,
  generateError,
  toAmount,
  toDisplay
} from 'libs/utils';
import { findToToken, transferEvmToIBC } from 'pages/Balance/helpers';
import {
  SwapQuery,
  Type,
  generateContractMessages,
  parseTokenInfo
} from 'rest/api';

/**
 * Get transfer token fee when universal swap
 * @param param0
 * @returns
 */
export const getTransferTokenFee = async ({
  remoteTokenDenom,
  client
}): Promise<Ratio | undefined> => {
  try {
    const ibcWasmContractAddress = process.env.REACT_APP_IBC_WASM_CONTRACT;
    const ibcWasmContract = new CwIcs20LatestQueryClient(
      client,
      ibcWasmContractAddress
    );
    const ratio = await ibcWasmContract.getTransferTokenFee({
      remoteTokenDenom
    });
    return ratio;
  } catch (error) {
    console.log({ error });
  }
};

export const calculateMinimum = (
  simulateAmount: number | string,
  userSlippage: number
): bigint | string => {
  if (!simulateAmount) return '0';
  try {
    return (
      BigInt(simulateAmount) -
      (BigInt(simulateAmount) * BigInt(userSlippage * atomic)) /
        (100n * BigInt(atomic))
    );
  } catch (error) {
    console.log({ error });
    return '0';
  }
};

export interface SwapData {
  metamaskAddress?: string;
  tronAddress?: string;
}

export const checkEvmAddress = (
  chainId: NetworkChainId,
  metamaskAddress?: string,
  tronAddress?: string | boolean
) => {
  switch (chainId) {
    case '0x01':
    case '0x38':
      if (!metamaskAddress) {
        throw generateError('Please login Metamask wallet!');
      }
      break;
    case '0x2b6653dc':
      if (!tronAddress) {
        throw generateError('Please login Tron wallet!');
      }
  }
};

export class UniversalSwapHandler {
  private _sender: string;
  private _fromToken: TokenItemType;
  private _toToken: TokenItemType;
  private _toTokenInOrai: TokenItemType;
  private _fromAmount: number;
  private _simulateAmount: string;
  private _userSlippage?: number;

  constructor(
    sender?: string,
    fromToken?: TokenItemType,
    toToken?: TokenItemType,
    fromAmount?: number,
    simulateAmount?: string,
    userSlippage?: number
  ) {
    this._sender = sender;
    this._fromToken = fromToken;
    this._toToken = toToken;
    this._fromAmount = fromAmount;
    this._simulateAmount = simulateAmount;
    this._userSlippage = userSlippage;
  }

  get fromToken() {
    return this._fromToken;
  }

  get toToken() {
    return this._toToken;
  }

  get toTokenInOrai() {
    return this._toTokenInOrai;
  }

  get sender() {
    return this._sender;
  }

  get fromAmount() {
    return this._fromAmount;
  }

  get simulateAmount() {
    return this._simulateAmount;
  }

  get userSlippage() {
    return this._userSlippage;
  }

  set fromToken(from: TokenItemType) {
    this._fromToken = from;
  }

  set toToken(to: TokenItemType) {
    this._toToken = to;
  }

  set toTokenInOrai(toTokenInOrai: TokenItemType) {
    this._toTokenInOrai = toTokenInOrai;
  }

  set sender(sender: string) {
    this._sender = sender;
  }
  set fromAmount(fromAmount: number) {
    this._fromAmount = fromAmount;
  }

  set simulateAmount(simulateAmount: string) {
    this._simulateAmount = simulateAmount;
  }

  set userSlippage(userSlippage: number) {
    this._userSlippage = userSlippage;
  }

  calculateMinReceive(
    simulateAmount: string,
    userSlippage: number,
    decimals: number
  ): Uint128 {
    const amount = toDisplay(simulateAmount, decimals);
    const result = amount * (1 - userSlippage / 100);
    return toAmount(result, decimals).toString();
  }

  async getUniversalSwapToAddress(toChainId: NetworkChainId): Promise<string> {
    if (
      toChainId === '0x01' ||
      toChainId === '0x1ae6' ||
      toChainId === '0x2b6653dc' ||
      toChainId === '0x38'
    ) {
      return await window.Metamask.getEthAddress();
    }
    return await window.Keplr.getKeplrAddr(toChainId);
  }

  /**
   * Combine messages for universal swap token from Oraichain to Cosmos networks(Osmosis | Cosmos-hub).
   * @returns combined messages
   */
  async combineMsgCosmos(): Promise<EncodeObject[]> {
    const ibcInfo: IBCInfo =
      ibcInfos[this._fromToken.chainId][this._toToken.chainId];
    const toAddress = await window.Keplr.getKeplrAddr(this._toToken.chainId);
    if (!toAddress) throw generateError('Please login keplr!');

    const amount = coin(this._simulateAmount, this._toTokenInOrai.denom);
    const msgTransfer = {
      typeUrl: '/ibc.applications.transfer.v1.MsgTransfer',
      value: MsgTransfer.fromPartial({
        sourcePort: ibcInfo.source,
        sourceChannel: ibcInfo.channel,
        token: amount,
        sender: this._sender,
        receiver: toAddress,
        memo: '',
        timeoutTimestamp: calculateTimeoutTimestamp(ibcInfo.timeout)
      })
    };

    // if not same coingeckoId, swap first then transfer token that have same coingeckoid.
    if (this._fromToken.coinGeckoId !== this._toToken.coinGeckoId) {
      const msgSwap = this.generateMsgsSwap();
      const msgExecuteSwap = getExecuteContractMsgs(
        this._sender,
        parseExecuteContractMultiple(msgSwap)
      );
      return [...msgExecuteSwap, msgTransfer];
    }
    return [msgTransfer];
  }

  getTranferAddress(
    metamaskAddress: string,
    tronAddress: string,
    ibcInfo: IBCInfo
  ) {
    let transferAddress = metamaskAddress;
    // check tron network and convert address
    if (this._toToken.prefix === ORAI_BRIDGE_EVM_TRON_DENOM_PREFIX) {
      transferAddress = tronToEthAddress(tronAddress);
    }
    // only allow transferring back to ethereum / bsc only if there's metamask address and when the metamask address is used, which is in the ibcMemo variable
    if (
      !transferAddress &&
      (this._toTokenInOrai.evmDenoms || ibcInfo.channel === oraichain2oraib)
    ) {
      throw generateError('Please login metamask / tronlink!');
    }
    return transferAddress;
  }

  getIbcMemo(transferAddress: string) {
    return this._toToken.chainId === 'oraibridge-subnet-2'
      ? this._toToken.prefix + transferAddress
      : '';
  }

  /**
   * Combine messages for universal swap token from Oraichain to EVM networks(BSC | Ethereum | Tron).
   * @returns combined messages
   */
  async combineMsgEvm(metamaskAddress: string, tronAddress: string) {
    let msgExecuteSwap: EncodeObject[] = [];
    // if from and to dont't have same coingeckoId, create swap msg to combine with bridge msg
    if (this._fromToken.coinGeckoId !== this._toToken.coinGeckoId) {
      const msgSwap = this.generateMsgsSwap();
      msgExecuteSwap = getExecuteContractMsgs(
        this._sender,
        parseExecuteContractMultiple(msgSwap)
      );
    }

    // then find new _toToken in Oraibridge that have same coingeckoId with originalToToken.
    this._toToken = findToToken(this._toTokenInOrai, this._toToken.chainId);

    const ibcInfo: IBCInfo =
      ibcInfos[this._fromToken.chainId][this._toToken.chainId];
    const toAddress = await window.Keplr.getKeplrAddr(this._toToken.chainId);
    if (!toAddress) throw generateError('Please login keplr!');

    const transferAddress = this.getTranferAddress(
      metamaskAddress,
      tronAddress,
      ibcInfo
    );
    const ibcMemo = this.getIbcMemo(transferAddress);

    // create bridge msg
    const msgTransfer = this.generateMsgsTransferOraiToEvm(
      ibcInfo,
      toAddress,
      ibcMemo
    );
    const msgExecuteTransfer = getExecuteContractMsgs(
      this._sender,
      parseExecuteContractMultiple(msgTransfer)
    );
    return [...msgExecuteSwap, ...msgExecuteTransfer];
  }

  async swap(): Promise<any> {
    const messages = this.generateMsgsSwap();
    const result = await CosmJs.executeMultiple({
      prefix: ORAI,
      walletAddr: this.sender,
      msgs: messages,
      gasAmount: { denom: ORAI, amount: '0' }
    });
    return result;
  }

  async combineMsgs(
    metamaskAddress: string,
    tronAddress: string
  ): Promise<EncodeObject[]> {
    if (
      this._toToken.chainId === 'cosmoshub-4' ||
      this._toToken.chainId === 'osmosis-1'
    )
      return this.combineMsgCosmos();
    return this.combineMsgEvm(metamaskAddress, tronAddress);
  }

  // Universal swap from Oraichain to cosmos-hub | osmosis | EVM networks.
  async swapAndTransfer({
    metamaskAddress,
    tronAddress
  }: SwapData): Promise<any> {
    // find to token in Oraichain to swap first and use this._toTokenInOrai as fromToken in bridge message.
    this._toTokenInOrai = oraichainTokens.find(
      t => t.coinGeckoId === this._toToken.coinGeckoId
    );

    const combinedMsgs = await this.combineMsgs(metamaskAddress, tronAddress);

    // handle sign and broadcast transactions
    const offlineSigner = await window.Keplr.getOfflineSigner(
      this._fromToken.chainId
    );
    const aminoTypes = new AminoTypes({
      ...createWasmAminoConverters(),
      ...customAminoTypes
    });
    const client = await SigningStargateClient.connectWithSigner(
      this._fromToken.rpc,
      offlineSigner,
      {
        registry: customRegistry,
        aminoTypes,
        gasPrice: GasPrice.fromString(
          `${await getNetworkGasPrice()}${network.denom}`
        )
      }
    );
    const result = await client.signAndBroadcast(
      this._sender,
      combinedMsgs,
      'auto'
    );
    return result;
  }

  async transferAndSwap(
    combinedReceiver: string,
    metamaskAddress?: string,
    tronAddress?: string
  ): Promise<any> {
    return transferEvmToIBC(
      this._fromToken,
      this._fromAmount,
      { metamaskAddress, tronAddress },
      combinedReceiver
    );
  }

  async processUniversalSwap(
    combinedReceiver: string,
    universalSwapType: UniversalSwapType,
    swapData: SwapData
  ) {
    if (universalSwapType === 'oraichain-to-oraichain') return this.swap();
    if (universalSwapType === 'oraichain-to-other-networks')
      return this.swapAndTransfer(swapData);
    return this.transferAndSwap(
      combinedReceiver,
      swapData.metamaskAddress,
      swapData.tronAddress
    );
  }

  generateMsgsSwap() {
    try {
      const _fromAmount = toAmount(
        this._fromAmount,
        this._fromToken.decimals
      ).toString();

      const minimumReceive = this.calculateMinReceive(
        this._simulateAmount,
        this._userSlippage,
        this._fromToken.decimals
      );
      const msgs = generateContractMessages({
        type: Type.SWAP,
        sender: this._sender,
        amount: _fromAmount,
        fromInfo: this._fromToken!,
        toInfo: this._toTokenInOrai ?? this._toToken,
        minimumReceive
      } as SwapQuery);
      const msg = msgs[0];

      const messages = buildMultipleMessages(msg);
      return messages;
    } catch (error) {
      throw new Error(`Error generateMsgsSwap: ${error}`);
    }
  }

  /**
   * Generate message to transfer token from Oraichain to EVM networks.
   * Example: AIRI/Oraichain -> AIRI/BSC
   * @param ibcInfo
   * @param toAddress
   * @param ibcMemo
   * @returns
   */
  generateMsgsTransferOraiToEvm(
    ibcInfo: IBCInfo,
    toAddress: string,
    ibcMemo: string
  ) {
    try {
      const { info: assetInfo } = parseTokenInfo(this._toTokenInOrai);

      const ibcWasmContractAddress = ibcInfo.source.split('.')[1];
      if (!ibcWasmContractAddress)
        throw generateError(
          'IBC Wasm source port is invalid. Cannot transfer to the destination chain'
        );

      const msg: TransferBackMsg = {
        local_channel_id: ibcInfo.channel,
        remote_address: toAddress,
        remote_denom: this._toToken.denom,
        timeout: ibcInfo.timeout,
        memo: ibcMemo
      };

      // if asset info is native => send native way, else send cw20 way
      if (assetInfo.native_token) {
        const executeMsgSend = {
          transfer_to_remote: msg
        };

        const msgs = {
          contract: ibcWasmContractAddress,
          msg: Buffer.from(JSON.stringify(executeMsgSend)),
          sender: this._sender,
          sent_funds: [{ amount: this._simulateAmount, denom: ORAI }]
        };
        return buildMultipleMessages(msgs);
      }

      const executeMsgSend = {
        send: {
          contract: ibcWasmContractAddress,
          amount: this._simulateAmount,
          msg: cosmwasm.toBinary(msg)
        }
      };

      // generate contract message for CW20 token in Oraichain.
      // Example: tranfer USDT/Oraichain -> AIRI/BSC. _toTokenInOrai is AIRI in Oraichain.
      const msgs = {
        contract: this._toTokenInOrai.contractAddress,
        msg: Buffer.from(JSON.stringify(executeMsgSend)),
        sender: this._sender,
        sent_funds: []
      };
      return buildMultipleMessages(msgs);
    } catch (error) {
      console.log({ error });
    }
  }
}

export const checkFnComponent = (
  titleRight: TypeTextAndCustomizeComponent,
  Element: React.ReactNode
) => {
  if (!!titleRight) {
    if (typeof titleRight === 'string') {
      return Element;
    } else if (typeof titleRight === 'function') {
      return titleRight();
    }
    return titleRight;
  }
  return null;
};

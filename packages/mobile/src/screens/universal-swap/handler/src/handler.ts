import { EncodeObject, coin } from '@cosmjs/proto-signing';
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx';
import { ExecuteInstruction, ExecuteResult, toBinary } from '@cosmjs/cosmwasm-stargate';
import { TransferBackMsg } from '@oraichain/common-contracts-sdk/build/CwIcs20Latest.types';
import {
  TokenItemType,
  NetworkChainId,
  IBCInfo,
  calculateTimeoutTimestamp,
  generateError,
  getEncodedExecuteContractMsgs,
  toAmount,
  buildMultipleExecuteMessages,
  parseTokenInfo,
  calculateMinReceive,
  handleSentFunds,
  ORAI_BRIDGE_EVM_TRON_DENOM_PREFIX,
  oraichain2oraib,
  CosmosChainId,
  findToTokenOnOraiBridge,
  getTokenOnSpecificChainId,
  UNISWAP_ROUTER_DEADLINE,
  gravityContracts,
  Bridge__factory,
  IUniswapV2Router02__factory,
  ethToTronAddress,
  oraichainTokens,
  network,
  EvmResponse,
  IBC_WASM_HOOKS_CONTRACT,
  getTokenOnOraichain,
  isInPairList,
  getCosmosGasPrice,
  marshalEncodeObjsToStargateMsgs,
  CoinGeckoId,
  IBC_WASM_CONTRACT
} from '@oraichain/oraidex-common';
import { ethers } from 'ethers';
import {
  addOraiBridgeRoute,
  buildIbcWasmHooksMemo,
  checkBalanceChannelIbc,
  checkBalanceIBCOraichain,
  checkFeeRelayer,
  generateSwapOperationMsgs,
  getEvmSwapRoute,
  getIbcInfo,
  isEvmSwappable,
  isSupportedNoPoolSwapEvm,
  tronToEthAddress
} from './helper';
import { UniversalSwapConfig, UniversalSwapData, UniversalSwapType } from './types';
import { GasPrice } from '@cosmjs/stargate';
import { Height } from 'cosmjs-types/ibc/core/client/v1/client';
import { CwIcs20LatestQueryClient } from '@oraichain/common-contracts-sdk';
import { OraiswapRouterQueryClient } from '@oraichain/oraidex-contracts-sdk';
export class UniversalSwapHandler {
  constructor(public swapData: UniversalSwapData, public config: UniversalSwapConfig) {}

  private getTokenOnOraichain(coinGeckoId: CoinGeckoId): TokenItemType {
    const fromTokenOnOrai = getTokenOnOraichain(coinGeckoId);
    if (!fromTokenOnOrai) throw generateError(`Could not find token ${coinGeckoId} on Oraichain. Could not swap`);
    return fromTokenOnOrai;
  }

  async getUniversalSwapToAddress(
    toChainId: NetworkChainId,
    address: { metamaskAddress?: string; tronAddress?: string }
  ): Promise<string> {
    // evm based
    if (toChainId === '0x01' || toChainId === '0x1ae6' || toChainId === '0x38') {
      return address.metamaskAddress ?? (await this.config.evmWallet.getEthAddress());
    }
    // tron
    if (toChainId === '0x2b6653dc') {
      if (address.tronAddress) return tronToEthAddress(address.tronAddress);
      const tronWeb = this.config.evmWallet.tronWeb;
      if (tronWeb && tronWeb.defaultAddress?.base58) return tronToEthAddress(tronWeb.defaultAddress.base58);
      throw generateError('Cannot find tron web to nor tron address to send to Tron network');
    }
    return this.config.cosmosWallet.getKeplrAddr(toChainId);
  }

  /**
   * Combine messages for universal swap token from Oraichain to Cosmos networks.
   * @returns combined messages
   */
  async combineSwapMsgOraichain(timeoutTimestamp?: string): Promise<EncodeObject[]> {
    // if to token is on Oraichain then we wont need to transfer IBC to the other chain
    if (this.swapData.originalToToken.chainId === 'Oraichain') {
      const msgSwap = this.generateMsgsSwap();
      return getEncodedExecuteContractMsgs(this.swapData.sender.cosmos, msgSwap);
    }
    const ibcInfo: IBCInfo = getIbcInfo('Oraichain', this.swapData.originalToToken.chainId);
    const toAddress = await this.config.cosmosWallet.getKeplrAddr(
      this.swapData.originalToToken.chainId as CosmosChainId
    );
    if (!toAddress) throw generateError('Please login keplr!');

    const toTokenInOrai = getTokenOnOraichain(this.swapData.originalToToken.coinGeckoId);
    const amount = coin(this.swapData.simulateAmount, toTokenInOrai.denom);
    const msgTransfer = {
      typeUrl: '/ibc.applications.transfer.v1.MsgTransfer',
      value: MsgTransfer.fromPartial({
        sourcePort: ibcInfo.source,
        sourceChannel: ibcInfo.channel,
        token: amount,
        sender: this.swapData.sender.cosmos,
        receiver: toAddress,
        memo: '',
        timeoutTimestamp: timeoutTimestamp ?? calculateTimeoutTimestamp(ibcInfo.timeout)
      })
    };

    // if not same coingeckoId, swap first then transfer token that have same coingeckoid.
    if (this.swapData.originalFromToken.coinGeckoId !== this.swapData.originalToToken.coinGeckoId) {
      const msgSwap = this.generateMsgsSwap();
      const msgExecuteSwap = getEncodedExecuteContractMsgs(this.swapData.sender.cosmos, msgSwap);
      return [...msgExecuteSwap, msgTransfer];
    }
    return [msgTransfer];
  }

  getTranferAddress(metamaskAddress: string, tronAddress: string, channel: string) {
    let transferAddress = metamaskAddress;
    // check tron network and convert address
    if (this.swapData.originalToToken.prefix === ORAI_BRIDGE_EVM_TRON_DENOM_PREFIX) {
      transferAddress = tronToEthAddress(tronAddress);
    }
    const toTokenInOrai = getTokenOnOraichain(this.swapData.originalToToken.coinGeckoId);
    // only allow transferring back to ethereum / bsc only if there's metamask address and when the metamask address is used, which is in the ibcMemo variable
    if (!transferAddress && (toTokenInOrai.evmDenoms || channel === oraichain2oraib)) {
      throw generateError('Please login metamask / tronlink!');
    }
    return transferAddress;
  }

  getIbcMemo(
    metamaskAddress: string,
    tronAddress: string,
    channel: string,
    toToken: { chainId: string; prefix: string }
  ) {
    const transferAddress = this.getTranferAddress(metamaskAddress, tronAddress, channel);
    return toToken.chainId === 'oraibridge-subnet-2' ? toToken.prefix + transferAddress : '';
  }

  /**
   * Combine messages for universal swap token from Oraichain to EVM networks(BSC | Ethereum | Tron).
   * @returns combined messages
   */
  async combineMsgEvm(metamaskAddress: string, tronAddress: string) {
    let msgExecuteSwap: EncodeObject[] = [];
    // if from and to dont't have same coingeckoId, create swap msg to combine with bridge msg
    if (this.swapData.originalFromToken.coinGeckoId !== this.swapData.originalToToken.coinGeckoId) {
      const msgSwap = this.generateMsgsSwap();
      msgExecuteSwap = getEncodedExecuteContractMsgs(this.swapData.sender.cosmos, msgSwap);
    }

    const toTokenInOrai = getTokenOnOraichain(this.swapData.originalToToken.coinGeckoId);
    // then find new _toToken in Oraibridge that have same coingeckoId with originalToToken.
    const newToToken = findToTokenOnOraiBridge(toTokenInOrai.coinGeckoId, this.swapData.originalToToken.chainId);
    // this.swapData.originalToToken = findToTokenOnOraiBridge(this.toTokenInOrai, this.swapData.originalToToken.chainId);

    const toAddress = await this.config.cosmosWallet.getKeplrAddr(newToToken.chainId as CosmosChainId);
    if (!toAddress) throw generateError('Please login keplr!');

    const ibcInfo = getIbcInfo(this.swapData.originalFromToken.chainId as CosmosChainId, newToToken.chainId);
    const ibcMemo = this.getIbcMemo(metamaskAddress, tronAddress, ibcInfo.channel, {
      chainId: newToToken.chainId,
      prefix: newToToken.prefix
    });

    // create bridge msg
    const msgTransfer = this.generateMsgsTransferOraiToEvm(ibcInfo, toAddress, newToToken.denom, ibcMemo);
    const msgExecuteTransfer = getEncodedExecuteContractMsgs(this.swapData.sender.cosmos, msgTransfer);
    return [...msgExecuteSwap, ...msgExecuteTransfer];
  }

  // TODO: write test cases
  async swap(): Promise<ExecuteResult> {
    const messages = this.generateMsgsSwap();
    const { client } = await this.config.cosmosWallet.getCosmWasmClient(
      { chainId: 'Oraichain', rpc: network.rpc },
      { gasPrice: GasPrice.fromString(`${network.fee.gasPrice}${network.denom}`) }
    );
    const result = await client.executeMultiple(this.swapData.sender.cosmos, messages, 'auto');
    return result;
  }

  // TODO: write test cases
  public async evmSwap(data: {
    fromToken: TokenItemType;
    toTokenContractAddr: string;
    fromAmount: number;
    address: {
      metamaskAddress?: string;
      tronAddress?: string;
    };
    slippage: number; // from 1 to 100
    destination: string;
    simulatePrice: string;
  }): Promise<EvmResponse> {
    const { fromToken, toTokenContractAddr, address, fromAmount, simulatePrice, slippage, destination } = data;
    const { metamaskAddress, tronAddress } = address;
    const signer = this.config.evmWallet.getSigner();
    const finalTransferAddress = this.config.evmWallet.getFinalEvmAddress(fromToken.chainId, {
      metamaskAddress,
      tronAddress
    });
    const finalFromAmount = toAmount(fromAmount, fromToken.decimals).toString();
    const gravityContractAddr = ethers.utils.getAddress(gravityContracts[fromToken.chainId]);
    const checkSumAddress = ethers.utils.getAddress(finalTransferAddress);
    const gravityContract = Bridge__factory.connect(gravityContractAddr, signer);
    const routerV2Addr = await gravityContract.swapRouter();
    const minimumReceive = BigInt(calculateMinReceive(simulatePrice, finalFromAmount, slippage, fromToken.decimals));
    let result: ethers.ContractTransaction;
    let fromTokenSpender = gravityContractAddr;
    // in this case, we wont use proxy contract but uniswap router instead because our proxy does not support swap tokens to native ETH.
    // approve uniswap router first before swapping because it will use transfer from to swap fromToken
    if (!toTokenContractAddr) fromTokenSpender = routerV2Addr;
    await this.config.evmWallet.checkOrIncreaseAllowance(
      fromToken,
      checkSumAddress,
      fromTokenSpender,
      finalFromAmount // increase allowance only take display form as input
    );

    // native bnb / eth case when from token contract addr is empty, then we bridge from native
    if (!fromToken.contractAddress) {
      result = await gravityContract.bridgeFromETH(
        ethers.utils.getAddress(toTokenContractAddr),
        minimumReceive, // use
        destination,
        { value: finalFromAmount }
      );
    } else if (!toTokenContractAddr) {
      const routerV2 = IUniswapV2Router02__factory.connect(routerV2Addr, signer);
      // the route is with weth or wbnb, then the uniswap router will automatically convert and transfer native eth / bnb back
      const evmRoute = getEvmSwapRoute(fromToken.chainId, fromToken.contractAddress, toTokenContractAddr);

      result = await routerV2.swapExactTokensForETH(
        finalFromAmount,
        minimumReceive,
        evmRoute,
        checkSumAddress,
        new Date().getTime() + UNISWAP_ROUTER_DEADLINE
      );
    } else {
      result = await gravityContract.bridgeFromERC20(
        ethers.utils.getAddress(fromToken.contractAddress),
        ethers.utils.getAddress(toTokenContractAddr),
        finalFromAmount,
        minimumReceive, // use
        destination
      );
    }
    await result.wait();
    return { transactionHash: result.hash };
  }

  // TODO: write test cases
  public async transferToGravity(to: string): Promise<EvmResponse> {
    const token = this.swapData.originalFromToken;
    let from = this.swapData.sender.evm;
    const amountVal = toAmount(this.swapData.fromAmount, token.decimals);
    const gravityContractAddr = gravityContracts[token.chainId] as string;
    console.log('gravity tron address: ', gravityContractAddr);
    const { evmWallet } = this.config;

    if (evmWallet.isTron(token.chainId)) {
      from = this.swapData.sender.tron;

      if (!from) throw generateError('Tron address is not specified. Cannot transfer!');
      if (evmWallet.checkTron()) {
        return evmWallet.submitTronSmartContract(
          ethToTronAddress(gravityContractAddr),
          'sendToCosmos(address,string,uint256)',
          {},
          [
            { type: 'address', value: token.contractAddress },
            { type: 'string', value: to },
            { type: 'uint256', value: amountVal }
          ],
          tronToEthAddress(from) // we store the tron address in base58 form, so we need to convert to hex if its tron because the contracts are using the hex form as parameters
        );
      }
    } else if (evmWallet.checkEthereum()) {
      // if you call this function on evm, you have to switch network before calling. Otherwise, unexpected errors may happen
      if (!gravityContractAddr || !from || !to)
        throw generateError('OraiBridge contract addr or from or to is not specified. Cannot transfer!');
      const gravityContract = Bridge__factory.connect(gravityContractAddr, evmWallet.getSigner());
      const result = await gravityContract.sendToCosmos(token.contractAddress, to, amountVal, { from });
      const res = await result.wait();
      return { transactionHash: res.transactionHash };
    }
  }

  // TODO: write test cases
  transferEvmToIBC = async (swapRoute: string): Promise<EvmResponse> => {
    const from = this.swapData.originalFromToken;
    const fromAmount = this.swapData.fromAmount;
    const finalTransferAddress = this.config.evmWallet.getFinalEvmAddress(from.chainId, {
      metamaskAddress: this.swapData.sender.evm,
      tronAddress: this.swapData.sender.tron
    });
    console.log('get here finalTransferAddress', finalTransferAddress);

    const gravityContractAddr = gravityContracts[from!.chainId!];
    if (!gravityContractAddr || !from) {
      throw generateError('No gravity contract addr or no from token');
    }

    const finalFromAmount = toAmount(fromAmount, from.decimals).toString();
    try {
      const res = await this.config.evmWallet.checkOrIncreaseAllowance(
        from,
        finalTransferAddress,
        gravityContractAddr,
        finalFromAmount
      );
      console.log('get here checkOrIncreaseAllowance', res);
    } catch (err) {
      console.log('err checkOrIncreaseAllowance', err);
    }

    return this.transferToGravity(swapRoute);
  };

  private getGasPriceFromToken() {
    if (!this.swapData.originalFromToken.feeCurrencies)
      throw generateError(
        `This token ${JSON.stringify(
          this.swapData.originalFromToken
        )} does not have fee currencies. getGasPriceFromToken is not called correctly`
      );
    if (!this.swapData.originalFromToken.feeCurrencies[0])
      throw generateError(
        `This token ${JSON.stringify(
          this.swapData.originalFromToken
        )} does not have any fee currencies. Something is wrong`
      );
    return GasPrice.fromString(
      `${getCosmosGasPrice(this.swapData.originalFromToken.gasPriceStep)}${
        this.swapData.originalFromToken.feeCurrencies[0].coinMinimalDenom
      }`
    );
  }

  // TODO: write test cases
  async swapAndTransferToOtherNetworks(universalSwapType: UniversalSwapType) {
    let encodedObjects: EncodeObject[];
    const { originalToToken, simulateAmount, sender } = this.swapData;
    if (!this.config.cosmosWallet)
      throw generateError('Cannot transfer and swap if the cosmos wallet is not initialized');
    // we get cosmwasm client on Oraichain because this is checking channel balance on Oraichain
    const { client } = await this.config.cosmosWallet.getCosmWasmClient(
      { rpc: network.rpc, chainId: network.chainId as CosmosChainId },
      {
        gasPrice: this.getGasPriceFromToken()
      }
    );
    const oraiAddress = await this.config.cosmosWallet.getKeplrAddr('Oraichain');
    if (oraiAddress !== this.swapData.sender.cosmos)
      throw generateError(
        `There is a mismatch between the sender ${sender.cosmos} versus the Oraichain address ${oraiAddress}. Should not swap!`
      );

    switch (universalSwapType) {
      case 'oraichain-to-cosmos':
        encodedObjects = await this.combineSwapMsgOraichain();
        break;
      case 'oraichain-to-evm':
        const { evm: metamaskAddress, tron: tronAddress } = this.swapData.sender;
        const routerClient = new OraiswapRouterQueryClient(client, network.router);
        const isSufficient = await checkFeeRelayer({
          originalFromToken: this.swapData.originalFromToken,
          fromAmount: this.swapData.fromAmount,
          relayerFee: this.swapData.relayerFee,
          routerClient
        });
        if (!isSufficient)
          throw generateError(
            `Your swap amount ${this.swapData.fromAmount} cannot cover the fees for this transaction. Please try again with a higher swap amount`
          );
        encodedObjects = await this.combineMsgEvm(metamaskAddress, tronAddress);
        break;
      default:
        throw generateError(`Universal swap type ${universalSwapType} is wrong. Should not call this function!`);
    }
    const ibcInfo = getIbcInfo('Oraichain', originalToToken.chainId);
    const ics20Client = new CwIcs20LatestQueryClient(client, IBC_WASM_CONTRACT);
    await checkBalanceChannelIbc(ibcInfo, originalToToken, simulateAmount, ics20Client);

    // handle sign and broadcast transactions
    return client.signAndBroadcast(sender.cosmos, encodedObjects, 'auto');
  }

  // TODO: write test cases
  // transfer evm to ibc
  async transferAndSwap(swapRoute: string): Promise<EvmResponse> {
    const {
      sender,
      originalFromToken,
      originalToToken,
      fromAmount,
      userSlippage,
      simulatePrice,
      relayerFee,
      simulateAmount
    } = this.swapData;
    const { evm: metamaskAddress, tron: tronAddress } = sender;
    if (!metamaskAddress && !tronAddress) throw generateError('Cannot call evm swap if the evm address is empty');
    if (!this.config.cosmosWallet) throw generateError('Cannot transfer and swap if cosmos wallet is not initialized');
    // we get cosmwasm client on Oraichain because this is checking channel balance on Oraichain
    const { client } = await this.config.cosmosWallet.getCosmWasmClient(
      { rpc: network.rpc, chainId: network.chainId as CosmosChainId },
      {}
    );
    console.log('get here');

    await checkBalanceIBCOraichain(
      originalToToken,
      originalFromToken,
      fromAmount,
      simulateAmount,
      client,
      IBC_WASM_CONTRACT
    );

    const routerClient = new OraiswapRouterQueryClient(client, network.router);
    const isSufficient = await checkFeeRelayer({
      originalFromToken,
      fromAmount,
      relayerFee,
      routerClient,
      isFullEvm: !originalToToken.cosmosBased && !originalFromToken.cosmosBased
    });
    if (!isSufficient)
      throw generateError(
        `Your swap amount ${fromAmount} cannot cover the fees for this transaction. Please try again with a higher swap amount`
      );

    // normal case, we will transfer evm to ibc like normal when two tokens can not be swapped on evm
    // first case: BNB (bsc) <-> USDT (bsc), then swappable
    // 2nd case: BNB (bsc) -> USDT (oraichain), then find USDT on bsc. We have that and also have route => swappable
    // 3rd case: USDT (bsc) -> ORAI (bsc / Oraichain), both have pools on Oraichain, but we currently dont have the pool route on evm => not swappable => transfer to cosmos like normal
    let swappableData = {
      fromChainId: originalFromToken.chainId,
      toChainId: originalToToken.chainId,
      fromContractAddr: originalFromToken.contractAddress,
      toContractAddr: originalToToken.contractAddress
    };
    let evmSwapData = {
      fromToken: originalFromToken,
      toTokenContractAddr: originalToToken.contractAddress,
      address: { metamaskAddress, tronAddress },
      fromAmount: fromAmount,
      slippage: userSlippage,
      destination: '', // if to token already on same net with from token then no destination is needed.
      simulatePrice: simulatePrice
    };
    // has to switch network to the correct chain id on evm since users can swap between network tokens
    if (!this.config.evmWallet.isTron(originalFromToken.chainId))
      await this.config.evmWallet.switchNetwork(originalFromToken.chainId);

    console.log(' get here isEvmSwappable(swappableData) 1', isEvmSwappable(swappableData));

    if (isEvmSwappable(swappableData)) return this.evmSwap(evmSwapData);

    const toTokenSameFromChainId = getTokenOnSpecificChainId(originalToToken.coinGeckoId, originalFromToken.chainId);
    if (toTokenSameFromChainId) {
      swappableData.toChainId = toTokenSameFromChainId.chainId;
      swappableData.toContractAddr = toTokenSameFromChainId.contractAddress;
      evmSwapData.toTokenContractAddr = toTokenSameFromChainId.contractAddress;
      // if to token already on same net with from token then no destination is needed
      evmSwapData.destination = toTokenSameFromChainId.chainId === originalToToken.chainId ? '' : swapRoute;
    }
    console.log('get here isEvmSwappable(swappableData) 2', isEvmSwappable(swappableData));
    // special case for tokens not having a pool on Oraichain. We need to swap on evm instead then transfer to Oraichain
    if (isEvmSwappable(swappableData) && isSupportedNoPoolSwapEvm(originalFromToken.coinGeckoId)) {
      return this.evmSwap(evmSwapData);
    }
    console.log(' get here isEvmSwappable(swappableData) 3', isEvmSwappable(swappableData));
    return this.transferEvmToIBC(swapRoute);
  }

  // this method allows swapping between arbitrary cosmos networks that have pools on Oraichain using ibc wasm hooks
  // TODO: write test cases
  async swapCosmosToCosmos() {
    const { originalFromToken, originalToToken, sender } = this.swapData;
    // guard check to see if from token has a pool on Oraichain or not. If not then return error
    const fromTokenOnOrai = this.getTokenOnOraichain(originalFromToken.coinGeckoId);
    const { client } = await this.config.cosmosWallet.getCosmWasmClient(
      {
        chainId: originalFromToken.chainId as CosmosChainId,
        rpc: originalFromToken.rpc
      },
      {
        gasPrice: this.getGasPriceFromToken()
      }
    );
    const amount = toAmount(this.swapData.fromAmount, this.swapData.originalFromToken.decimals).toString();
    // we will be sending to our proxy contract
    const ibcInfo = getIbcInfo(originalFromToken.chainId as CosmosChainId, 'Oraichain');
    if (!ibcInfo)
      throw generateError(
        `Could not find the ibc info given the from token with coingecko id ${originalFromToken.coinGeckoId}`
      );
    const oraiAddress = await this.config.cosmosWallet.getKeplrAddr('Oraichain');
    let msgTransfer = MsgTransfer.fromPartial({
      sourcePort: ibcInfo.source,
      receiver: oraiAddress,
      sourceChannel: ibcInfo.channel,
      token: coin(amount, this.swapData.originalFromToken.denom),
      sender: this.swapData.sender.cosmos,
      memo: '',
      timeoutTimestamp: calculateTimeoutTimestamp(ibcInfo.timeout)
    });
    let msgTransferEncodeObj: EncodeObject = {
      typeUrl: '/ibc.applications.transfer.v1.MsgTransfer',
      value: msgTransfer
    };
    // it means the user just wants to transfer ibc to Oraichain with same token, nothing more, then we can purely call send ibc tokens
    if (
      fromTokenOnOrai.chainId === originalToToken.chainId &&
      fromTokenOnOrai.coinGeckoId === originalToToken.coinGeckoId
    )
      return client.signAndBroadcast(sender.cosmos, [msgTransferEncodeObj], 'auto');
    if (!isInPairList(fromTokenOnOrai.denom) && !isInPairList(fromTokenOnOrai.contractAddress))
      throw generateError(
        `from token with coingecko id ${originalFromToken.coinGeckoId} does not have any associated pool on Oraichain. Could not swap`
      );
    const encodedObjects = await this.combineSwapMsgOraichain();
    msgTransfer.receiver = IBC_WASM_HOOKS_CONTRACT;
    // complex univeral transaction, can be ibc transfer then swap then transfer to another chain
    msgTransfer.memo = buildIbcWasmHooksMemo(marshalEncodeObjsToStargateMsgs(encodedObjects));
    msgTransferEncodeObj = { ...msgTransferEncodeObj, value: msgTransfer };
    return client.signAndBroadcast(sender.cosmos, [msgTransferEncodeObj], 'auto');
  }

  async processUniversalSwap() {
    const { cosmos, evm, tron } = this.swapData.sender;
    const toAddress = await this.getUniversalSwapToAddress(this.swapData.originalToToken.chainId, {
      metamaskAddress: evm,
      tronAddress: tron
    });
    const { swapRoute, universalSwapType } = addOraiBridgeRoute(
      cosmos,
      this.swapData.originalFromToken,
      this.swapData.originalToToken,
      toAddress
    );

    if (universalSwapType === 'oraichain-to-oraichain') return this.swap();
    if (universalSwapType === 'oraichain-to-cosmos' || universalSwapType === 'oraichain-to-evm')
      return this.swapAndTransferToOtherNetworks(universalSwapType);
    if (universalSwapType === 'cosmos-to-cosmos') return this.swapCosmosToCosmos();

    console.log('swapRoute', this.swapData.originalFromToken, this.swapData.originalToToken, swapRoute);
    return this.transferAndSwap(swapRoute);
  }

  generateMsgsSwap() {
    let input: any;
    let contractAddr: string = network.router;
    const { originalFromToken, originalToToken, fromAmount } = this.swapData;
    // since we're swapping on Oraichain, we need to get from token on Oraichain
    const fromTokenOnOrai = this.getTokenOnOraichain(originalFromToken.coinGeckoId);
    const toTokenInOrai = getTokenOnOraichain(this.swapData.originalToToken.coinGeckoId);
    try {
      const _fromAmount = toAmount(fromAmount, fromTokenOnOrai.decimals).toString();

      if (!this.swapData.simulatePrice || !this.swapData.userSlippage)
        throw generateError(
          'Could not calculate the minimum receive value because there is no simulate price or user slippage'
        );
      const minimumReceive = calculateMinReceive(
        this.swapData.simulatePrice,
        _fromAmount,
        this.swapData.userSlippage,
        fromTokenOnOrai.decimals
      );
      const { fund: offerSentFund, info: offerInfo } = parseTokenInfo(fromTokenOnOrai, _fromAmount);
      const { fund: askSentFund, info: askInfo } = parseTokenInfo(toTokenInOrai);
      const funds = handleSentFunds(offerSentFund, askSentFund);
      let inputTemp = {
        execute_swap_operations: {
          operations: generateSwapOperationMsgs(offerInfo, askInfo),
          minimum_receive: minimumReceive
        }
      };
      // if cw20 => has to send through cw20 contract
      if (!fromTokenOnOrai.contractAddress) {
        input = inputTemp;
      } else {
        input = {
          send: {
            contract: contractAddr,
            amount: _fromAmount,
            msg: toBinary(inputTemp)
          }
        };
        contractAddr = fromTokenOnOrai.contractAddress;
      }
      const msg: ExecuteInstruction = {
        contractAddress: contractAddr,
        msg: input,
        funds
      };

      return buildMultipleExecuteMessages(msg);
    } catch (error) {
      throw generateError(`Error generateMsgsSwap: ${error}`);
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
  generateMsgsTransferOraiToEvm(ibcInfo: IBCInfo, toAddress: string, remoteDenom: string, ibcMemo: string) {
    const toTokenInOrai = getTokenOnOraichain(this.swapData.originalToToken.coinGeckoId);
    try {
      const { info: assetInfo } = parseTokenInfo(toTokenInOrai);

      const ibcWasmContractAddress = ibcInfo.source.split('.')[1];
      if (!ibcWasmContractAddress)
        throw generateError('IBC Wasm source port is invalid. Cannot transfer to the destination chain');

      const msg: TransferBackMsg = {
        local_channel_id: ibcInfo.channel,
        remote_address: toAddress,
        remote_denom: remoteDenom,
        timeout: ibcInfo.timeout,
        memo: ibcMemo
      };

      // if asset info is native => send native way, else send cw20 way
      if ('native_token' in assetInfo) {
        const executeMsgSend = {
          transfer_to_remote: msg
        };

        const msgs: ExecuteInstruction = {
          contractAddress: ibcWasmContractAddress,
          msg: executeMsgSend,
          funds: [
            {
              amount: this.swapData.simulateAmount,
              denom: assetInfo.native_token.denom
            }
          ]
        };
        return buildMultipleExecuteMessages(msgs);
      }

      const executeMsgSend = {
        send: {
          contract: ibcWasmContractAddress,
          amount: this.swapData.simulateAmount,
          msg: toBinary(msg)
        }
      };

      // generate contract message for CW20 token in Oraichain.
      // Example: tranfer USDT/Oraichain -> AIRI/BSC. _toTokenInOrai is AIRI in Oraichain.
      const msgs: ExecuteInstruction = {
        contractAddress: toTokenInOrai.contractAddress,
        msg: executeMsgSend,
        funds: []
      };
      return buildMultipleExecuteMessages(msgs);
    } catch (error) {
      console.log({ error });
    }
  }
}

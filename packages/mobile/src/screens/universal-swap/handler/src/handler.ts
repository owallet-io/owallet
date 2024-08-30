import { Coin, EncodeObject, coin } from "@cosmjs/proto-signing";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";
import {
  ExecuteInstruction,
  ExecuteResult,
  toBinary,
} from "@cosmjs/cosmwasm-stargate";
import { TransferBackMsg } from "@oraichain/common-contracts-sdk/build/CwIcs20Latest.types";
import {
  TokenItemType,
  NetworkChainId,
  IBCInfo,
  calculateTimeoutTimestamp,
  generateError,
  getEncodedExecuteContractMsgs,
  toAmount,
  // buildMultipleExecuteMessages,
  parseTokenInfo,
  calculateMinReceive,
  handleSentFunds,
  tronToEthAddress,
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
  network,
  EvmResponse,
  getTokenOnOraichain,
  getCosmosGasPrice,
  CoinGeckoId,
  IBC_WASM_CONTRACT,
  IBC_WASM_CONTRACT_TEST,
  tokenMap,
  buildMultipleExecuteMessages,
  ibcInfosOld,
  checkValidateAddressWithNetwork,
  BigDecimal,
} from "@oraichain/oraidex-common";
import { ethers } from "ethers";
import { UniversalSwapHelper } from "./helper";
import {
  SmartRouteSwapOperations,
  UniversalSwapConfig,
  UniversalSwapData,
  UniversalSwapType,
} from "./types";
import { GasPrice } from "@cosmjs/stargate";
import { OraiswapRouterQueryClient } from "@oraichain/oraidex-contracts-sdk";
export class UniversalSwapHandler {
  constructor(
    public swapData: UniversalSwapData,
    public config: UniversalSwapConfig
  ) {}

  private getTokenOnOraichain(coinGeckoId: CoinGeckoId): TokenItemType {
    const fromTokenOnOrai = getTokenOnOraichain(coinGeckoId);
    if (!fromTokenOnOrai)
      throw generateError(
        `Could not find token ${coinGeckoId} on Oraichain. Could not swap`
      );
    return fromTokenOnOrai;
  }

  private getCwIcs20ContractAddr() {
    return this.config.swapOptions?.ibcInfoTestMode
      ? IBC_WASM_CONTRACT_TEST
      : IBC_WASM_CONTRACT;
  }

  public getIbcInfo(fromChainId: CosmosChainId, toChainId: NetworkChainId) {
    const ibcInfo = UniversalSwapHelper.getIbcInfo(fromChainId, toChainId);
    if (!this.config.swapOptions?.ibcInfoTestMode || !ibcInfo.testInfo)
      return ibcInfo;
    return ibcInfo.testInfo;
  }

  async getUniversalSwapToAddress(
    toChainId: NetworkChainId,
    address: { metamaskAddress?: string; tronAddress?: string }
  ): Promise<string> {
    // evm based
    if (
      toChainId === "0x01" ||
      toChainId === "0x1ae6" ||
      toChainId === "0x38"
    ) {
      return (
        address.metamaskAddress ?? (await this.config.evmWallet.getEthAddress())
      );
    }
    // tron
    if (toChainId === "0x2b6653dc") {
      if (address.tronAddress) return tronToEthAddress(address.tronAddress);
      const tronWeb = this.config.evmWallet.tronWeb;
      if (tronWeb && tronWeb.defaultAddress?.base58)
        return tronToEthAddress(tronWeb.defaultAddress.base58);
      throw generateError(
        "Cannot find tron web to nor tron address to send to Tron network"
      );
    }
    return this.config.cosmosWallet.getKeplrAddr(toChainId);
  }

  /**
   * Combine messages for universal swap token from Oraichain to Cosmos networks.
   * @returns combined messages
   */
  async combineSwapMsgOraichain(
    timeoutTimestamp?: string
  ): Promise<EncodeObject[]> {
    const { chainId: toChainId, coinGeckoId: toCoinGeckoId } =
      this.swapData.originalToToken;
    const { coinGeckoId: fromCoinGeckoId } = this.swapData.originalFromToken;
    const { cosmos: sender } = this.swapData.sender;

    if (toChainId === "Oraichain") {
      return this.handleSwapOnOraichain(sender);
    }

    const ibcInfo: IBCInfo = this.getIbcInfo("Oraichain", toChainId);
    const ibcReceiveAddr = await this.getIbcReceiveAddr(toChainId);

    let toTokenInOrai = this.getToTokenOnOraichain(toCoinGeckoId, toChainId);
    let msgTransfer = this.generateIbcTransferMsgs(
      ibcInfo,
      sender,
      toTokenInOrai,
      ibcReceiveAddr,
      timeoutTimestamp
    );

    const isNotMatchCoingeckoId = fromCoinGeckoId !== toCoinGeckoId;
    let getEncodedExecuteMsgs = [];

    if (this.isSpecialChain(toChainId, toCoinGeckoId)) {
      getEncodedExecuteMsgs = this.handleSpecialChainCase(
        fromCoinGeckoId,
        toCoinGeckoId,
        toTokenInOrai,
        sender
      );
      if (isNotMatchCoingeckoId) {
        return this.combineSwapAndTransfer(
          sender,
          msgTransfer,
          getEncodedExecuteMsgs
        );
      }
      return [...getEncodedExecuteMsgs, ...msgTransfer];
    }

    if (isNotMatchCoingeckoId) {
      return this.combineSwapAndTransfer(sender, msgTransfer);
    }

    return msgTransfer;
  }

  private handleSwapOnOraichain(sender: string): EncodeObject[] {
    const msgSwap = this.generateMsgsSwap();
    return getEncodedExecuteContractMsgs(sender, msgSwap);
  }

  private async getIbcReceiveAddr(toChainId: NetworkChainId): Promise<string> {
    if (this.swapData.recipientAddress) {
      const isValidRecipient = checkValidateAddressWithNetwork(
        this.swapData.recipientAddress,
        toChainId
      );
      if (!isValidRecipient.isValid)
        throw generateError("Recipient address invalid!");
      return this.swapData.recipientAddress;
    }
    const ibcReceiveAddr = await this.config.cosmosWallet.getKeplrAddr(
      toChainId as CosmosChainId
    );
    if (!ibcReceiveAddr) throw generateError("Please login cosmos wallet!");
    return ibcReceiveAddr;
  }

  private getToTokenOnOraichain(toCoinGeckoId: CoinGeckoId, toChainId: string) {
    let toTokenInOrai = getTokenOnOraichain(toCoinGeckoId);
    if (this.isSpecialChain(toChainId, toCoinGeckoId)) {
      const IBC_DECIMALS = 18;
      toTokenInOrai = getTokenOnOraichain(toCoinGeckoId, IBC_DECIMALS);
    }
    return toTokenInOrai;
  }

  private generateIbcTransferMsgs(
    ibcInfo: IBCInfo,
    sender: string,
    toTokenInOrai: any,
    ibcReceiveAddr: string,
    timeoutTimestamp?: string
  ): EncodeObject[] {
    if (ibcInfo.source.includes("wasm")) {
      return getEncodedExecuteContractMsgs(
        sender,
        this.generateMsgsIbcWasm(
          ibcInfo,
          ibcReceiveAddr,
          this.swapData.originalToToken.denom,
          ""
        )
      );
    } else {
      return [
        {
          typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
          value: MsgTransfer.fromPartial({
            sourcePort: ibcInfo.source,
            sourceChannel: ibcInfo.channel,
            token: coin(this.swapData.simulateAmount, toTokenInOrai.denom),
            sender: sender,
            receiver: ibcReceiveAddr,
            memo: "",
            timeoutTimestamp:
              timeoutTimestamp ?? calculateTimeoutTimestamp(ibcInfo.timeout),
          }),
        },
      ];
    }
  }

  private isSpecialChain(toChainId: string, toCoinGeckoId: string): boolean {
    const isSpecialChain = ["kawaii_6886-1", "injective-1"].includes(toChainId);
    const isSpecialCoingecko = [
      "kawaii-islands",
      "milky-token",
      "injective-protocol",
    ].includes(toCoinGeckoId);
    return isSpecialChain && isSpecialCoingecko;
  }

  private handleSpecialChainCase(
    fromCoinGeckoId: string,
    toCoinGeckoId: CoinGeckoId,
    toTokenInOrai: any,
    sender: string
  ): EncodeObject[] {
    if (fromCoinGeckoId === toCoinGeckoId) {
      const evmToken = tokenMap[toTokenInOrai.denom];
      const evmAmount = coin(
        toAmount(this.swapData.fromAmount, evmToken.decimals).toString(),
        evmToken.denom
      );
      const msgConvertReverses =
        UniversalSwapHelper.generateConvertCw20Erc20Message(
          this.swapData.amounts,
          getTokenOnOraichain(toCoinGeckoId),
          sender,
          evmAmount
        );
      const executeContractMsgs = buildMultipleExecuteMessages(
        undefined,
        ...msgConvertReverses
      );
      return getEncodedExecuteContractMsgs(sender, executeContractMsgs);
    }
    return [];
  }

  private combineSwapAndTransfer(
    sender: string,
    msgTransfer: EncodeObject[],
    getEncodedExecuteMsgs: EncodeObject[] = []
  ): EncodeObject[] {
    const msgSwap = this.generateMsgsSwap();
    const msgExecuteSwap = getEncodedExecuteContractMsgs(sender, msgSwap);
    return [...msgExecuteSwap, ...getEncodedExecuteMsgs, ...msgTransfer];
  }

  getTranferAddress(
    metamaskAddress: string,
    tronAddress: string,
    channel: string
  ) {
    let transferAddress = metamaskAddress;
    // check tron network and convert address
    if (
      this.swapData.originalToToken.prefix === ORAI_BRIDGE_EVM_TRON_DENOM_PREFIX
    ) {
      transferAddress = tronToEthAddress(tronAddress);
    }
    const toTokenInOrai = getTokenOnOraichain(
      this.swapData.originalToToken.coinGeckoId
    );
    // only allow transferring back to ethereum / bsc only if there's metamask address and when the metamask address is used, which is in the ibcMemo variable
    if (
      !transferAddress &&
      (toTokenInOrai.evmDenoms || channel === oraichain2oraib)
    ) {
      throw generateError("Please login metamask / tronlink!");
    }
    return transferAddress;
  }

  getIbcMemo(
    metamaskAddress: string,
    tronAddress: string,
    channel: string,
    toToken: {
      chainId: string;
      prefix: string;
      originalChainId: NetworkChainId;
    },
    recipientAddress?: string
  ) {
    let transferAddress;
    if (recipientAddress) {
      const isValidRecipient = checkValidateAddressWithNetwork(
        this.swapData.recipientAddress,
        toToken.originalChainId
      );
      if (!isValidRecipient.isValid)
        throw generateError("Recipient address invalid!");
      transferAddress = recipientAddress;
    } else {
      transferAddress = this.getTranferAddress(
        metamaskAddress,
        tronAddress,
        channel
      );
    }

    return toToken.chainId === "oraibridge-subnet-2"
      ? toToken.prefix + transferAddress
      : "";
  }

  /**
   * Combine messages for universal swap token from Oraichain to EVM networks(BSC | Ethereum | Tron).
   * @returns combined messages
   */
  async combineMsgEvm(metamaskAddress: string, tronAddress: string) {
    let msgExecuteSwap: EncodeObject[] = [];
    const { originalFromToken, originalToToken, sender, recipientAddress } =
      this.swapData;
    // if from and to dont't have same coingeckoId, create swap msg to combine with bridge msg
    if (originalFromToken.coinGeckoId !== originalToToken.coinGeckoId) {
      const msgSwap = this.generateMsgsSwap();
      msgExecuteSwap = getEncodedExecuteContractMsgs(sender.cosmos, msgSwap);
    }

    // then find new _toToken in Oraibridge that have same coingeckoId with originalToToken.
    const newToToken = findToTokenOnOraiBridge(
      originalToToken.coinGeckoId,
      originalToToken.chainId
    );

    const toAddress = await this.config.cosmosWallet.getKeplrAddr(
      newToToken.chainId as CosmosChainId
    );
    if (!toAddress) throw generateError("Please login cosmos wallet!");

    const ibcInfo = this.getIbcInfo(
      originalFromToken.chainId as CosmosChainId,
      newToToken.chainId
    );
    const ibcMemo = this.getIbcMemo(
      metamaskAddress,
      tronAddress,
      ibcInfo.channel,
      {
        chainId: newToToken.chainId,
        prefix: newToToken.prefix,
        originalChainId: originalToToken.chainId,
      },
      recipientAddress
    );

    let ibcInfos = ibcInfo;
    let getEncodedExecuteMsgs = [];
    if (
      ["kawaii-islands", "milky-token"].includes(originalToToken.coinGeckoId)
    ) {
      const IBC_DECIMALS = 18;
      const toTokenInOrai = getTokenOnOraichain(
        originalToToken.coinGeckoId,
        IBC_DECIMALS
      );
      const evmToken = tokenMap[toTokenInOrai.denom];
      const evmAmount = coin(
        toAmount(this.swapData.fromAmount, evmToken.decimals).toString(),
        evmToken.denom
      );
      const msgConvertReverses =
        UniversalSwapHelper.generateConvertCw20Erc20Message(
          this.swapData.amounts,
          getTokenOnOraichain(originalToToken.coinGeckoId),
          this.swapData.sender.cosmos,
          evmAmount
        );
      // for KWT & MILKY tokens, we use the old ibc info channel
      const { chainId: fromChainId } = originalFromToken;
      const { chainId: toChainId } = newToToken;
      ibcInfos = ibcInfosOld[fromChainId][toChainId];

      const executeContractMsgs = buildMultipleExecuteMessages(
        undefined,
        ...msgConvertReverses
      );
      getEncodedExecuteMsgs = getEncodedExecuteContractMsgs(
        this.swapData.sender.cosmos,
        executeContractMsgs
      );
      const msgTransfer = {
        typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
        value: MsgTransfer.fromPartial({
          sourcePort: ibcInfos.source,
          sourceChannel: ibcInfos.channel,
          token: evmAmount,
          sender: this.swapData.sender.cosmos,
          receiver: toAddress,
          memo: ibcMemo,
          timeoutTimestamp: calculateTimeoutTimestamp(ibcInfos.timeout),
        }),
      };
      return [...msgExecuteSwap, ...getEncodedExecuteMsgs, msgTransfer];
    }

    // create bridge msg
    const msgTransfer = this.generateMsgsIbcWasm(
      ibcInfos,
      toAddress,
      newToToken.denom,
      ibcMemo
    );
    const msgExecuteTransfer = getEncodedExecuteContractMsgs(
      this.swapData.sender.cosmos,
      msgTransfer
    );

    return [...msgExecuteSwap, ...msgExecuteTransfer];
  }

  // TODO: write test cases
  async swap(): Promise<ExecuteResult> {
    const messages = this.generateMsgsSwap();
    const { client } = await this.config.cosmosWallet.getCosmWasmClient(
      { chainId: "Oraichain", rpc: network.rpc },
      {
        gasPrice: GasPrice.fromString(
          `${network.fee.gasPrice}${network.denom}`
        ),
      }
    );
    const result = await client.executeMultiple(
      this.swapData.sender.cosmos,
      messages,
      "auto"
    );
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
    const {
      fromToken,
      toTokenContractAddr,
      address,
      fromAmount,
      simulatePrice,
      slippage,
      destination,
    } = data;
    const { metamaskAddress, tronAddress } = address;
    const signer = this.config.evmWallet.getSigner();
    const finalTransferAddress = this.config.evmWallet.getFinalEvmAddress(
      fromToken.chainId,
      {
        metamaskAddress,
        tronAddress,
      }
    );
    const finalFromAmount = toAmount(fromAmount, fromToken.decimals).toString();
    const gravityContractAddr = ethers.utils.getAddress(
      gravityContracts[fromToken.chainId]
    );
    const checkSumAddress = ethers.utils.getAddress(finalTransferAddress);
    const gravityContract = Bridge__factory.connect(
      gravityContractAddr,
      signer
    );
    const routerV2Addr = await gravityContract.swapRouter();
    const minimumReceive = BigInt(
      calculateMinReceive(
        simulatePrice,
        finalFromAmount,
        slippage,
        fromToken.decimals
      )
    );
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

    // Case 1: bridge from native bnb / eth case
    if (!fromToken.contractAddress) {
      result = await gravityContract.bridgeFromETH(
        ethers.utils.getAddress(toTokenContractAddr),
        minimumReceive, // use
        destination,
        { value: finalFromAmount }
      );
    } else if (!toTokenContractAddr) {
      // Case 2: swap to native eth / bnb. Get evm route so that we can swap from token -> native eth / bnb
      const routerV2 = IUniswapV2Router02__factory.connect(
        routerV2Addr,
        signer
      );
      const evmRoute = UniversalSwapHelper.getEvmSwapRoute(
        fromToken.chainId,
        fromToken.contractAddress
      );

      result = await routerV2.swapExactTokensForETH(
        finalFromAmount,
        minimumReceive,
        evmRoute,
        checkSumAddress,
        new Date().getTime() + UNISWAP_ROUTER_DEADLINE
      );
    } else {
      // Case 3: swap erc20 token to another erc20 token with a given destination (possibly sent to Oraichain or other networks)
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

    const { evmWallet } = this.config;

    if (evmWallet.isTron(token.chainId)) {
      from = this.swapData.sender.tron;
      if (!from)
        throw generateError("Tron address is not specified. Cannot transfer!");
      if (evmWallet.checkTron())
        return evmWallet.submitTronSmartContract(
          ethToTronAddress(gravityContractAddr),
          "sendToCosmos(address,string,uint256)",
          {},
          [
            { type: "address", value: token.contractAddress },
            { type: "string", value: to },
            { type: "uint256", value: amountVal },
          ],
          tronToEthAddress(from) // we store the tron address in base58 form, so we need to convert to hex if its tron because the contracts are using the hex form as parameters
        );
    } else if (evmWallet.checkEthereum()) {
      // if you call this function on evm, you have to switch network before calling. Otherwise, unexpected errors may happen
      if (!gravityContractAddr || !from || !to)
        throw generateError(
          "OraiBridge contract addr or from or to is not specified. Cannot transfer!"
        );
      const gravityContract = Bridge__factory.connect(
        gravityContractAddr,
        evmWallet.getSigner()
      );
      const result = await gravityContract.sendToCosmos(
        token.contractAddress,
        to,
        amountVal,
        { from }
      );
      const res = await result.wait();
      return { transactionHash: res.transactionHash };
    }
  }

  // TODO: write test cases
  transferEvmToIBC = async (swapRoute: string): Promise<EvmResponse> => {
    const from = this.swapData.originalFromToken;
    const fromAmount = this.swapData.fromAmount;
    const finalTransferAddress = this.config.evmWallet.getFinalEvmAddress(
      from.chainId,
      {
        metamaskAddress: this.swapData.sender.evm,
        tronAddress: this.swapData.sender.tron,
      }
    );
    const gravityContractAddr = gravityContracts[from!.chainId!];
    if (!gravityContractAddr || !from) {
      throw generateError("No gravity contract addr or no from token");
    }

    const finalFromAmount = toAmount(fromAmount, from.decimals).toString();
    await this.config.evmWallet.checkOrIncreaseAllowance(
      from,
      finalTransferAddress,
      gravityContractAddr,
      finalFromAmount
    );
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
    const { originalToToken, originalFromToken, simulateAmount, sender } =
      this.swapData;
    if (!this.config.cosmosWallet)
      throw generateError(
        "Cannot transfer and swap if the cosmos wallet is not initialized"
      );
    // we get cosmwasm client on Oraichain because this is checking channel balance on Oraichain
    const { client } = await this.config.cosmosWallet.getCosmWasmClient(
      { rpc: network.rpc, chainId: network.chainId as CosmosChainId },
      {
        gasPrice: this.getGasPriceFromToken(),
      }
    );
    const oraiAddress = await this.config.cosmosWallet.getKeplrAddr(
      "Oraichain"
    );
    if (oraiAddress !== this.swapData.sender.cosmos)
      throw generateError(
        `There is a mismatch between the sender ${sender.cosmos} versus the Oraichain address ${oraiAddress}. Should not swap!`
      );

    switch (universalSwapType) {
      case "oraichain-to-cosmos":
        encodedObjects = await this.combineSwapMsgOraichain();
        break;
      case "oraichain-to-evm":
        const { evm: metamaskAddress, tron: tronAddress } =
          this.swapData.sender;
        const routerClient = new OraiswapRouterQueryClient(
          client,
          network.router
        );
        const isSufficient = await UniversalSwapHelper.checkFeeRelayer({
          originalFromToken: this.swapData.originalFromToken,
          fromAmount: this.swapData.fromAmount,
          relayerFee: this.swapData.relayerFee,
          routerClient,
        });
        if (!isSufficient)
          throw generateError(
            `Your swap amount ${this.swapData.fromAmount} cannot cover the fees for this transaction. Please try again with a higher swap amount`
          );
        encodedObjects = await this.combineMsgEvm(metamaskAddress, tronAddress);
        break;
      default:
        throw generateError(
          `Universal swap type ${universalSwapType} is wrong. Should not call this function!`
        );
    }
    const ibcInfo = this.getIbcInfo("Oraichain", originalToToken.chainId);
    await UniversalSwapHelper.checkBalanceChannelIbc(
      ibcInfo,
      originalFromToken,
      originalToToken,
      simulateAmount,
      client,
      this.getCwIcs20ContractAddr()
    );

    // handle sign and broadcast transactions
    return client.signAndBroadcast(sender.cosmos, encodedObjects, "auto");
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
      simulateAmount,
    } = this.swapData;
    const { evm: metamaskAddress, tron: tronAddress } = sender;
    if (!metamaskAddress && !tronAddress)
      throw generateError("Cannot call evm swap if the evm address is empty");
    if (!this.config.cosmosWallet)
      throw generateError(
        "Cannot transfer and swap if cosmos wallet is not initialized"
      );
    // we get cosmwasm client on Oraichain because this is checking channel balance on Oraichain
    const { client } = await this.config.cosmosWallet.getCosmWasmClient(
      { rpc: network.rpc, chainId: network.chainId as CosmosChainId },
      {}
    );

    // normal case, we will transfer evm to ibc like normal when two tokens can not be swapped on evm
    // first case: BNB (bsc) <-> USDT (bsc), then swappable
    // 2nd case: BNB (bsc) -> USDT (oraichain), then find USDT on bsc. We have that and also have route => swappable
    // 3rd case: USDT (bsc) -> ORAI (bsc / Oraichain), both have pools on Oraichain, but we currently dont have the pool route on evm => not swappable => transfer to cosmos like normal
    const swappableData = {
      fromChainId: originalFromToken.chainId,
      toChainId: originalToToken.chainId,
      fromContractAddr: originalFromToken.contractAddress,
      toContractAddr: originalToToken.contractAddress,
    };
    const evmSwapData = {
      fromToken: originalFromToken,
      toTokenContractAddr: originalToToken.contractAddress,
      address: { metamaskAddress, tronAddress },
      fromAmount: fromAmount,
      slippage: userSlippage,
      destination: "", // if to token already on same net with from token then no destination is needed.
      simulatePrice: simulatePrice,
    };
    // has to switch network to the correct chain id on evm since users can swap between network tokens
    if (!this.config.evmWallet.isTron(originalFromToken.chainId))
      await this.config.evmWallet.switchNetwork(originalFromToken.chainId);
    if (UniversalSwapHelper.isEvmSwappable(swappableData))
      return this.evmSwap(evmSwapData);

    const toTokenSameFromChainId = getTokenOnSpecificChainId(
      originalToToken.coinGeckoId,
      originalFromToken.chainId
    );
    if (toTokenSameFromChainId) {
      swappableData.toChainId = toTokenSameFromChainId.chainId;
      swappableData.toContractAddr = toTokenSameFromChainId.contractAddress;
      evmSwapData.toTokenContractAddr = toTokenSameFromChainId.contractAddress;
      // if to token already on same net with from token then no destination is needed
      evmSwapData.destination =
        toTokenSameFromChainId.chainId === originalToToken.chainId
          ? ""
          : swapRoute;
    }

    // special case for tokens not having a pool on Oraichain. We need to swap on evm instead then transfer to Oraichain
    if (
      UniversalSwapHelper.isEvmSwappable(swappableData) &&
      UniversalSwapHelper.isSupportedNoPoolSwapEvm(
        originalFromToken.coinGeckoId
      )
    ) {
      return this.evmSwap(evmSwapData);
    }

    await UniversalSwapHelper.checkBalanceIBCOraichain(
      originalToToken,
      originalFromToken,
      fromAmount,
      simulateAmount,
      client,
      this.getCwIcs20ContractAddr()
    );

    const routerClient = new OraiswapRouterQueryClient(client, network.router);
    const isSufficient = await UniversalSwapHelper.checkFeeRelayer({
      originalFromToken,
      fromAmount,
      relayerFee,
      routerClient,
    });
    if (!isSufficient)
      throw generateError(
        `Your swap amount ${fromAmount} cannot cover the fees for this transaction. Please try again with a higher swap amount`
      );

    return this.transferEvmToIBC(swapRoute);
  }

  // this method allows swapping from cosmos networks to arbitrary networks using ibc wasm hooks
  // Oraichain will be use as a proxy
  // TODO: write test cases
  async swapCosmosToOtherNetwork(destinationReceiver: string) {
    const { originalFromToken, originalToToken, sender } = this.swapData;
    // guard check to see if from token has a pool on Oraichain or not. If not then return error

    const { client } = await this.config.cosmosWallet.getCosmWasmClient(
      {
        chainId: originalFromToken.chainId as CosmosChainId,
        rpc: originalFromToken.rpc,
      },
      {
        gasPrice: this.getGasPriceFromToken(),
      }
    );
    const amount = toAmount(
      this.swapData.fromAmount,
      this.swapData.originalFromToken.decimals
    ).toString();
    // we will be sending to our proxy contract
    const ibcInfo = this.getIbcInfo(
      originalFromToken.chainId as CosmosChainId,
      "Oraichain"
    );
    if (!ibcInfo)
      throw generateError(
        `Could not find the ibc info given the from token with coingecko id ${originalFromToken.coinGeckoId}`
      );

    // get swapRoute
    const oraiAddress = await this.config.cosmosWallet.getKeplrAddr(
      "Oraichain"
    );

    const { swapRoute } = UniversalSwapHelper.getRoute(
      this.swapData.originalFromToken,
      this.swapData.originalToToken,
      destinationReceiver,
      oraiAddress
    );

    let msgTransfer = MsgTransfer.fromPartial({
      sourcePort: ibcInfo.source,
      receiver: this.getCwIcs20ContractAddr(),
      sourceChannel: ibcInfo.channel,
      token: coin(amount, this.swapData.originalFromToken.denom),
      sender: this.swapData.sender.cosmos,
      memo: JSON.stringify({
        wasm: {
          contract: this.getCwIcs20ContractAddr(),
          msg: {
            ibc_hooks_receive: {
              func: "universal_swap",
              args: swapRoute,
            },
          },
        },
      }),
      timeoutTimestamp: calculateTimeoutTimestamp(ibcInfo.timeout),
    });

    // check if from chain is noble, use ibc-wasm instead of ibc-hooks
    if (originalFromToken.chainId === "noble-1") {
      if (this.swapData.recipientAddress) {
        const isValidRecipient = checkValidateAddressWithNetwork(
          this.swapData.recipientAddress,
          "Oraichain"
        );

        if (
          !isValidRecipient.isValid ||
          isValidRecipient.network !== "Oraichain"
        ) {
          throw generateError(
            "Recipient address invalid! Only support bridge to Oraichain"
          );
        }
        msgTransfer.receiver = this.swapData.recipientAddress;
      } else {
        msgTransfer.receiver = oraiAddress;
      }

      msgTransfer.memo = swapRoute;
    }

    const msgTransferEncodeObj: EncodeObject = {
      typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
      value: msgTransfer,
    };
    return client.signAndBroadcast(
      sender.cosmos,
      [msgTransferEncodeObj],
      "auto"
    );
  }

  async processUniversalSwap() {
    const { cosmos, evm, tron } = this.swapData.sender;
    let toAddress = "";
    const currentToNetwork = this.swapData.originalToToken.chainId;

    if (this.swapData.recipientAddress) {
      const isValidRecipient = checkValidateAddressWithNetwork(
        this.swapData.recipientAddress,
        currentToNetwork
      );

      if (!isValidRecipient.isValid) {
        throw generateError("Recipient address invalid!");
      }
      toAddress = this.swapData.recipientAddress;
    } else {
      toAddress = await this.getUniversalSwapToAddress(
        this.swapData.originalToToken.chainId,
        {
          metamaskAddress: evm,
          tronAddress: tron,
        }
      );
    }

    const { swapRoute, universalSwapType } =
      UniversalSwapHelper.addOraiBridgeRoute(
        cosmos,
        this.swapData.originalFromToken,
        this.swapData.originalToToken,
        toAddress,
        this.config.swapOptions?.isSourceReceiverTest
      );

    if (universalSwapType === "oraichain-to-oraichain") return this.swap();
    if (
      universalSwapType === "oraichain-to-cosmos" ||
      universalSwapType === "oraichain-to-evm"
    )
      return this.swapAndTransferToOtherNetworks(universalSwapType);
    if (universalSwapType === "cosmos-to-others")
      return this.swapCosmosToOtherNetwork(toAddress);
    return this.transferAndSwap(swapRoute);
  }

  generateMsgsSwap() {
    let input: any;
    let contractAddr: string = network.router;
    const { originalFromToken, originalToToken, fromAmount } = this.swapData;
    // since we're swapping on Oraichain, we need to get from token on Oraichain
    const fromTokenOnOrai = this.getTokenOnOraichain(
      originalFromToken.coinGeckoId
    );
    const toTokenInOrai = getTokenOnOraichain(originalToToken.coinGeckoId);
    try {
      const _fromAmount = toAmount(
        fromAmount,
        fromTokenOnOrai.decimals
      ).toString();
      const msgConvertsFrom =
        UniversalSwapHelper.generateConvertErc20Cw20Message(
          this.swapData.amounts,
          fromTokenOnOrai
        );
      const msgConvertTo = UniversalSwapHelper.generateConvertErc20Cw20Message(
        this.swapData.amounts,
        toTokenInOrai
      );
      const isValidSlippage =
        this.swapData.userSlippage || this.swapData.userSlippage === 0;
      if (!this.swapData.simulatePrice || !isValidSlippage) {
        throw generateError(
          "Could not calculate the minimum receive value because there is no simulate price or user slippage"
        );
      }

      const { fund: offerSentFund, info: offerInfo } = parseTokenInfo(
        fromTokenOnOrai,
        _fromAmount
      );
      const { fund: askSentFund, info: askInfo } =
        parseTokenInfo(toTokenInOrai);
      const funds = handleSentFunds(offerSentFund, askSentFund);

      if (this.swapData.recipientAddress) {
        const isValidRecipient = checkValidateAddressWithNetwork(
          this.swapData.recipientAddress,
          this.swapData.originalToToken.chainId
        );

        if (!isValidRecipient.isValid) {
          throw generateError("Recipient address invalid!");
        }
      }
      const to = this.swapData.recipientAddress;
      let msgs: ExecuteInstruction[];

      if (this.swapData.smartRoutes) {
        msgs = this.buildSwapMsgsFromSmartRoute(
          this.swapData.smartRoutes,
          fromTokenOnOrai,
          to,
          contractAddr
        );
      } else {
        const minimumReceive = calculateMinReceive(
          this.swapData.simulatePrice,
          _fromAmount,
          this.swapData.userSlippage,
          fromTokenOnOrai.decimals
        );

        const inputTemp = {
          execute_swap_operations: {
            operations: UniversalSwapHelper.generateSwapOperationMsgs(
              offerInfo,
              askInfo
            ),
            minimum_receive: minimumReceive,
            to,
          },
        };

        // if cw20 => has to send through cw20 contract
        if (!fromTokenOnOrai.contractAddress) {
          input = inputTemp;
        } else {
          input = {
            send: {
              contract: contractAddr,
              amount: _fromAmount,
              msg: toBinary(inputTemp),
            },
          };
          contractAddr = fromTokenOnOrai.contractAddress;
        }
        const msg: ExecuteInstruction = {
          contractAddress: contractAddr,
          msg: input,
          funds,
        };

        msgs = [msg];
      }

      return buildMultipleExecuteMessages(
        msgs,
        ...msgConvertsFrom,
        ...msgConvertTo
      );
    } catch (error) {
      throw generateError(`Error generateMsgsSwap: ${JSON.stringify(error)}`);
    }
  }

  buildSwapMsgsFromSmartRoute(
    routes: SmartRouteSwapOperations[],
    fromTokenOnOrai: TokenItemType,
    to: string,
    routerContract: string
  ): ExecuteInstruction[] {
    const msgs: ExecuteInstruction[] = routes.map((route) => {
      const minimumReceive = Math.trunc(
        new BigDecimal(route.returnAmount)
          .mul((100 - this.swapData.userSlippage) / 100)
          .toNumber()
      ).toString();

      const swapOps = {
        execute_swap_operations: {
          operations: route.swapOps,
          minimum_receive: minimumReceive,
          to,
        },
      };

      // if cw20 => has to send through cw20 contract
      if (!fromTokenOnOrai.contractAddress) {
        return {
          contractAddress: routerContract,
          msg: swapOps,
          funds: handleSentFunds(
            parseTokenInfo(fromTokenOnOrai, route.swapAmount).fund
          ),
        };
      } else {
        return {
          contractAddress: fromTokenOnOrai.contractAddress,
          msg: {
            send: {
              contract: routerContract,
              amount: route.swapAmount,
              msg: toBinary(swapOps),
            },
          },
          funds: [],
        };
      }
    });

    return msgs;
  }

  /**
   * Generate message to transfer token from Oraichain to EVM / Cosmos networks using IBC Wasm contract.
   * Example: AIRI/Oraichain -> AIRI/BSC
   * @param ibcInfo
   * @param ibcReceiveAddr
   * @param ibcMemo
   * @returns
   */
  generateMsgsIbcWasm(
    ibcInfo: IBCInfo,
    ibcReceiveAddr: string,
    remoteDenom: string,
    ibcMemo: string
  ) {
    const toTokenInOrai = getTokenOnOraichain(
      this.swapData.originalToToken.coinGeckoId
    );
    try {
      const { info: assetInfo } = parseTokenInfo(toTokenInOrai);

      const ibcWasmContractAddress = ibcInfo.source.split(".")[1];
      if (!ibcWasmContractAddress)
        throw generateError(
          "IBC Wasm source port is invalid. Cannot transfer to the destination chain"
        );

      const msg: TransferBackMsg = {
        local_channel_id: ibcInfo.channel,
        remote_address: ibcReceiveAddr,
        remote_denom: remoteDenom,
        timeout: ibcInfo.timeout,
        memo: ibcMemo,
      };

      // if asset info is native => send native way, else send cw20 way
      if ("native_token" in assetInfo) {
        const executeMsgSend = {
          transfer_to_remote: msg,
        };

        const msgs: ExecuteInstruction = {
          contractAddress: ibcWasmContractAddress,
          msg: executeMsgSend,
          funds: [
            {
              amount: this.swapData.simulateAmount,
              denom: assetInfo.native_token.denom,
            },
          ],
        };
        return [msgs];
      }

      const executeMsgSend = {
        send: {
          contract: ibcWasmContractAddress,
          amount: this.swapData.simulateAmount,
          msg: toBinary(msg),
        },
      };

      // generate contract message for CW20 token in Oraichain.
      // Example: tranfer USDT/Oraichain -> AIRI/BSC. _toTokenInOrai is AIRI in Oraichain.
      const instruction: ExecuteInstruction = {
        contractAddress: toTokenInOrai.contractAddress,
        msg: executeMsgSend,
        funds: [],
      };
      return [instruction];
    } catch (error) {
      console.log({ error });
    }
  }
}

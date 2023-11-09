//@ts-nocheck
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import {
  CosmosWallet,
  EvmWallet,
  NetworkChainId,
  CosmosChainId,
  TokenItemType,
  EvmResponse,
  Networks,
  IERC20Upgradeable__factory,
  ethToTronAddress
} from '@oraichain/oraidex-common';
import { OfflineSigner } from '@cosmjs/proto-signing';
import { SigningCosmWasmClient, SigningCosmWasmClientOptions } from '@cosmjs/cosmwasm-stargate';
import TronWeb from 'tronweb';
import { OWallet } from '@owallet/types';
import { SigningStargateClient } from '@cosmjs/stargate';
import { Ethereum } from '@owallet/provider';
import { ethers } from 'ethers';
import { tronToEthAddress } from '../handler/src';

export class SwapCosmosWallet extends CosmosWallet {
  private client: SigningCosmWasmClient;
  private owallet: OWallet;
  constructor(client: SigningCosmWasmClient) {
    super();
    this.client = client;
    //@ts-ignore
    this.owallet = window.owallet;
  }

  async getKeplrAddr(chainId?: NetworkChainId | undefined): Promise<string> {
    try {
      const key = await this.owallet.getKey(chainId);
      return key?.bech32Address;
    } catch (ex) {
      console.log(ex, chainId);
    }
  }

  async createCosmosSigner(chainId: string): Promise<OfflineSigner> {
    if (!this.owallet) {
      throw new Error('You have to have OWallet first if you do not use a mnemonic to sign transactions');
    }
    return await this.owallet.getOfflineSignerAuto(chainId);
  }

  async getCosmWasmClient(
    config: {
      signer?: OfflineSigner;
      rpc?: string;
      chainId: CosmosChainId;
    },
    options?: SigningCosmWasmClientOptions
  ): Promise<{
    wallet: OfflineSigner;
    client: SigningCosmWasmClient;
    // defaultAddress: AccountData;
    stargateClient: SigningStargateClient;
  }> {
    const { chainId, signer, rpc } = config;
    const wallet = signer ?? (await this.createCosmosSigner(chainId));
    // const defaultAddress = (await wallet.getAccounts())[0];
    const stargateClient = await SigningStargateClient.connectWithSigner(rpc, wallet, options);

    return new Promise(resolve =>
      resolve({
        client: this.client,
        wallet: wallet ?? config.signer!,
        // defaultAddress,
        stargateClient: stargateClient
      })
    );
  }
}

export class SwapEvmWallet extends EvmWallet {
  private provider: JsonRpcProvider;
  private ethereum: Ethereum;
  private isTronToken: boolean;
  constructor(isTronToken: boolean) {
    super();
    //@ts-ignore
    this.ethereum = window.ethereum;
    this.isTronToken = isTronToken;
    //@ts-ignore
    this.tronWeb = window.tronWeb;
    // used 'any' to fix the following bug: https://github.com/ethers-io/ethers.js/issues/1107 -> https://github.com/Geo-Web-Project/cadastre/pull/220/files
    this.provider = new ethers.providers.Web3Provider(this.ethereum, 'any');
  }

  async switchNetwork(chainId: string | number): Promise<void> {
    return this.ethereum.request!({
      method: 'wallet_switchEthereumChain',
      chainId: '0x' + Number(chainId).toString(16),
      params: [{ chainId: '0x' + Number(chainId).toString(16) }]
    });
  }

  async getEthAddress(): Promise<string> {
    if (this.checkEthereum()) {
      const [address] = await this.ethereum.request({
        method: 'eth_requestAccounts',
        params: []
      });
      return address;
    }
  }

  checkEthereum(): boolean {
    return !this.isTronToken;
  }

  public isTron(chainId: string | number) {
    return Number(chainId) === Networks.tron;
  }

  checkTron(): boolean {
    return this.isTronToken;
  }

  getSigner(): JsonRpcSigner {
    return this.provider.getSigner();
  }
  public async submitTronSmartContract(
    address: string,
    functionSelector: string,
    options: { feeLimit?: number } = { feeLimit: 40 * 1e6 }, // submitToCosmos costs about 40 TRX
    parameters = [],
    issuerAddress: string
  ): Promise<EvmResponse> {
    if (!this.tronWeb) {
      throw new Error('You need to initialize tron web before calling submitTronSmartContract.');
    }
    try {
      const tmpParameters = [...parameters];
      const uint256Index = tmpParameters.findIndex(param => param.type === 'uint256');

      if (uint256Index && tmpParameters.length > uint256Index) {
        tmpParameters[uint256Index] = {
          ...tmpParameters[uint256Index],
          value:
            typeof tmpParameters[uint256Index].value === 'bigint'
              ? tmpParameters[uint256Index].value.toString()
              : tmpParameters[uint256Index].value
        };
      }

      const transaction = await window.tronWeb.triggerSmartContract(
        address,
        functionSelector,
        options,
        tmpParameters,
        ethToTronAddress(issuerAddress)
      );

      console.log('transaction builder: ', transaction);

      if (!transaction.result || !transaction.result.result) {
        throw new Error('Unknown trigger error: ' + JSON.stringify(transaction.transaction));
      }
      console.log('before signing');

      // sign from inject tronWeb
      const singedTransaction = await window.tronWeb.sign(transaction.transaction);
      console.log('signed tx: ', singedTransaction);
      const result = await window.tronWeb.sendRawTransaction(singedTransaction);
      return { transactionHash: result.txid };
    } catch (error) {
      console.log('error', error);

      throw new Error(error);
    }
  }

  public async checkOrIncreaseAllowance(
    token: TokenItemType,
    owner: string,
    spender: string,
    amount: string
  ): Promise<EvmResponse> {
    // we store the tron address in base58 form, so we need to convert to hex if its tron because the contracts are using the hex form as parameters
    if (!token.contractAddress) return;

    const ownerHex = this.isTron(token.chainId) ? tronToEthAddress(owner) : owner;
    // using static rpc for querying both tron and evm
    const tokenContract = IERC20Upgradeable__factory.connect(
      token.contractAddress,
      new ethers.providers.JsonRpcProvider(token.rpc)
    );

    const currentAllowance = await tokenContract.allowance(ownerHex, spender);

    if (BigInt(currentAllowance.toString()) >= BigInt(amount)) return;

    if (this.isTron(token.chainId)) {
      if (this.checkTron())
        return this.submitTronSmartContract(
          ethToTronAddress(token.contractAddress),
          'approve(address,uint256)',
          {},
          [
            { type: 'address', value: spender },
            { type: 'uint256', value: amount }
          ],
          ownerHex
        );
    } else if (this.checkEthereum()) {
      // using window.ethereum for signing
      // if you call this function on evm, you have to switch network before calling. Otherwise, unexpected errors may happen
      const tokenContract = IERC20Upgradeable__factory.connect(token.contractAddress, this.getSigner());
      const result = await tokenContract.approve(spender, amount, { from: ownerHex });
      await result.wait();
      return { transactionHash: result.hash };
    }
  }
}

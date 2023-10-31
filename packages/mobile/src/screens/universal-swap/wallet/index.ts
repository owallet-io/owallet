import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { CosmosWallet, EvmWallet, NetworkChainId, CosmosChainId } from '@oraichain/oraidex-common';
import { OfflineSigner } from '@cosmjs/proto-signing';
import { SigningCosmWasmClient, SigningCosmWasmClientOptions } from '@cosmjs/cosmwasm-stargate';
import TronWeb from 'tronweb';
import { OWallet } from '@owallet/types';
import { SigningStargateClient } from '@cosmjs/stargate';
import { Ethereum } from '@owallet/provider';
import { ethers } from 'ethers';

export class SwapCosmosWallet extends CosmosWallet {
  private client: SigningCosmWasmClient;
  private owallet: OWallet;
  constructor(client: SigningCosmWasmClient, owallet: OWallet) {
    super();
    this.client = client;
    this.owallet = owallet;
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
  private ethAddress: string;
  private isTronToken: boolean;
  private ethereum: Ethereum;
  private rpc: string;
  constructor(ethereum: Ethereum, ethAddress: string, isTronToken: boolean, rpc: string) {
    super();
    this.ethAddress = ethAddress;
    this.ethereum = ethereum;
    this.isTronToken = isTronToken;
    this.rpc = rpc;
    this.tronWeb = new TronWeb({
      fullHost: 'https://api.trongrid.io'
    });
    // used 'any' to fix the following bug: https://github.com/ethers-io/ethers.js/issues/1107 -> https://github.com/Geo-Web-Project/cadastre/pull/220/files
    this.provider = new ethers.providers.Web3Provider(this.ethereum, 'any');
  }

  loadAccounts = async (): Promise<string[]> => {
    if (!this.checkEthereum()) return;
    // passe cointype 60 for ethereum or let it use default param
    const accounts = await this.ethereum.request({
      method: 'eth_accounts',
      params: [60]
    });
    return accounts;
  };

  async switchNetwork(chainId: string | number): Promise<void> {
    // return undefined by default on mobile
    // return new Promise(resolve => resolve(undefined));

    // let accounts = await this.loadAccounts();
    // console.log('switchNetwork accounts', accounts);

    // if (accounts?.length > 0) {
    //   const metamaskAddress = ethers.utils.getAddress(accounts[0]);
    //   console.log('metamaskAddress', metamaskAddress);
    // }
    return this.ethereum.request!({
      method: 'wallet_switchEthereumChain',
      chainId: '0x' + Number(chainId).toString(16),
      params: [{ chainId: '0x' + Number(chainId).toString(16) }]
    });
  }

  async getEthAddress(): Promise<string> {
    // return new Promise(resolve => resolve(this.ethAddress));
    if (this.checkEthereum()) {
      const [address] = await this.ethereum.request({
        method: 'eth_requestAccounts',
        params: []
      });
      console.log('getEthAddress ===', address);

      return address;
    }
  }

  checkEthereum(): boolean {
    return !this.isTronToken;
  }

  checkTron(): boolean {
    return this.isTronToken;
  }

  getSigner(): JsonRpcSigner {
    // this.provider = new ethers.providers.JsonRpcProvider(this.rpc);
    return this.provider.getSigner();
  }
}

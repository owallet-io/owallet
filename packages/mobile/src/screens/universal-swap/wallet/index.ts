import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import {
  CosmosWallet,
  EvmWallet,
  NetworkChainId,
  CosmosChainId
} from '@oraichain/oraidex-common';
import { AccountData, OfflineSigner } from '@cosmjs/proto-signing';
import {
  SigningCosmWasmClient,
  SigningCosmWasmClientOptions
} from '@cosmjs/cosmwasm-stargate';
import TronWeb from 'tronweb';
import { Ethereum, OWallet } from '@owallet/types';

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
      throw new Error(
        'You have to have OWallet first if you do not use a mnemonic to sign transactions'
      );
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
    defaultAddress: AccountData;
  }> {
    const { chainId, signer } = config;
    const wallet = signer ?? (await this.createCosmosSigner(chainId));
    const defaultAddress = (await wallet.getAccounts())[0];

    return new Promise(resolve =>
      resolve({
        client: this.client,
        wallet: wallet ?? config.signer!,
        defaultAddress
      })
    );
  }
}

export class SwapEvmWallet extends EvmWallet {
  private provider: JsonRpcProvider;
  private ethereum: Ethereum;
  constructor(rpc: string, ethereum: Ethereum) {
    super();
    this.provider = new JsonRpcProvider(rpc);
    this.ethereum = ethereum;
    this.tronWeb = new TronWeb({
      fullHost: 'https://api.trongrid.io'
    });
  }

  switchNetwork(chainId: string | number): Promise<void> {
    return new Promise(resolve => resolve(undefined));
  }
  getEthAddress(): Promise<string> {
    return new Promise(resolve => resolve('0x1234'));
  }
  checkEthereum(): boolean {
    return true;
  }
  checkTron(): boolean {
    return true;
  }
  getSigner(): JsonRpcSigner {
    return this.provider.getSigner();
  }
}

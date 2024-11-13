import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import {
  CosmosWallet,
  EvmWallet,
  NetworkChainId,
  EvmResponse,
  Networks,
  ethToTronAddress
} from '@oraichain/oraidex-common';
import { OfflineSigner } from '@cosmjs/proto-signing';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { IEthereumProvider, ITronProvider, OWallet } from '@owallet/types';
import { ethers } from 'ethers';
import { ChainIdEVM } from '@owallet/common';

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
}

//@ts-ignore
export class SwapEvmWallet extends EvmWallet {
  private provider: JsonRpcProvider;
  private ethereum: IEthereumProvider;
  private tronWeb: ITronProvider;
  private isTronToken: boolean;
  constructor(isTronToken: boolean) {
    super();
    //@ts-ignore
    this.ethereum = window.owallet.ethereum || window.ethereum;
    this.isTronToken = isTronToken;
    //@ts-ignore
    this.tronWeb = window.owallet.tron;
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
      const result = await this.ethereum.request({
        method: 'eth_requestAccounts',
        params: [],
        chainId: ChainIdEVM.BNBChain
      });
      return result?.[0];
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

  // TODO: After the sdk issues were resolved, please remove this
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
      const uint256Index = parameters.findIndex(param => param.type === 'uint256');

      // type uint256 is bigint, so we need to convert to string if its uint256 because the JSONUint8Array can not stringify bigint
      if (uint256Index && parameters.length > uint256Index) {
        parameters[uint256Index] = {
          ...parameters[uint256Index],
          value:
            typeof parameters[uint256Index].value === 'bigint'
              ? parameters[uint256Index].value.toString()
              : parameters[uint256Index].value
        };
      }

      const transaction = await this.tronWeb.triggerSmartContract(
        address,
        functionSelector,
        options,
        parameters,
        ethToTronAddress(issuerAddress)
      );

      if (!transaction.result || !transaction.result.result) {
        throw new Error('Unknown trigger error: ' + JSON.stringify(transaction.transaction));
      }

      // sign from inject tronWeb
      const singedTransaction = (await this.tronWeb.sign(ChainIdEVM.TRON, transaction.transaction)) as {
        raw_data: any;
        raw_data_hex: string;
        txID: string;
        visible?: boolean;
      };

      const result = (await this.tronWeb.sendRawTransaction(singedTransaction)) as {
        txid?: string;
      };
      if (result) {
        return { transactionHash: result.txid };
      }
    } catch (error) {
      console.log('error', error);

      throw new Error(error);
    }
  }
}

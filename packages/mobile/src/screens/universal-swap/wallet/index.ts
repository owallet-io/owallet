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
  ethToTronAddress,
  tronToEthAddress,
  network
} from '@oraichain/oraidex-common';
import { OfflineSigner } from '@cosmjs/proto-signing';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { OWallet, Ethereum, TronWeb } from '@owallet/types';
import { SigningStargateClient, SigningStargateClientOptions } from '@cosmjs/stargate';
import { ethers } from 'ethers';
import { Tendermint37Client } from '@cosmjs/tendermint-rpc';

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

  //   async getCosmWasmClient(
  //     config: { signer?: OfflineSigner; rpc: string; chainId: CosmosChainId },
  //     options: SigningStargateClientOptions
  //   ): Promise<{
  //     wallet: OfflineSigner;
  //     client: SigningCosmWasmClient;
  //     stargateClient: SigningStargateClient;
  //   }> {
  //     const { chainId, rpc, signer } = config;
  //     console.log('chainId', chainId);

  //     const wallet = signer ?? (await this.createCosmosSigner(chainId));
  //     const tmClient = await Tendermint37Client.connect(rpc);
  //     // const client = await SigningCosmWasmClient.createWithSigner(tmClient, wallet, options);
  //     const stargateClient = await SigningStargateClient.createWithSigner(tmClient, wallet, options);
  //     console.log('stargateClient', stargateClient);

  //     return new Promise(resolve =>
  //       resolve({
  //         client: this.client,
  //         wallet: wallet,
  //         // defaultAddress,
  //         stargateClient: stargateClient
  //       })
  //     );
  //   }
  // }

  // const getCosmWasmClient = async (
  //   config: { signer?: OfflineSigner; chainId?: string; rpc?: string },
  //   options?: SigningStargateClientOptions
  // ) => {
  //   const { chainId, rpc, signer } = config;
  //   const wallet = signer ?? (await this.createCosmosSigner(chainId));
  //   const defaultAddress = (await wallet.getAccounts())[0];
  //   const client = await SigningCosmWasmClient.connectWithSigner(
  //     rpc ?? (network.rpc as string),
  //     wallet,
  //     options ?? {
  //       gasPrice: GasPrice.fromString(network.fee.gasPrice + network.denom)
  //     }
  //   );
  //   return { wallet, client, defaultAddress };
  // };

  // async getCosmWasmClient(
  //   config: {
  //     signer?: OfflineSigner;
  //     rpc?: string;
  //     chainId: CosmosChainId;
  //   },
  //   options?: SigningStargateClientOptions
  // ): Promise<{
  //   wallet: OfflineSigner;
  //   client: SigningCosmWasmClient;
  //   // defaultAddress: AccountData;
  //   stargateClient: SigningStargateClient;
  // }> {
  //   const { chainId, signer, rpc } = config;

  //   console.log('chainId', chainId);

  //   const wallet = signer ?? (await this.createCosmosSigner(chainId));

  //   console.log('signer', signer);
  //   console.log('wallet', wallet);

  //   // const defaultAddress = (await wallet.getAccounts())[0];
  //   const stargateClient = await SigningStargateClient.connectWithSigner(rpc, wallet, options);

  //   console.log('stargateClient', stargateClient);

  //   return new Promise(resolve =>
  //     resolve({
  //       client: this.client,
  //       wallet: wallet ?? config.signer!,
  //       // defaultAddress,
  //       stargateClient: stargateClient
  //     })
  //   );
  // }
}

export class SwapEvmWallet extends EvmWallet {
  private provider: JsonRpcProvider;
  private ethereum: Ethereum;
  //@ts-ignore
  private tronWeb: TronWeb;
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

      console.log('transaction builder: ', transaction);

      if (!transaction.result || !transaction.result.result) {
        throw new Error('Unknown trigger error: ' + JSON.stringify(transaction.transaction));
      }
      console.log('before signing');

      // sign from inject tronWeb
      const singedTransaction = (await this.tronWeb.sign(transaction.transaction)) as {
        raw_data: any;
        raw_data_hex: string;
        txID: string;
        visible?: boolean;
      };
      console.log('signed tx: ', singedTransaction);
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

  // TODO: After the sdk issues were resolved, please remove this
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

      try {
        const result = await tokenContract.approve(spender, amount, { from: ownerHex });
        await result.wait();
        return { transactionHash: result.hash };
      } catch (err) {
        console.log('tokenContract err', err);
      }
    }
  }
}

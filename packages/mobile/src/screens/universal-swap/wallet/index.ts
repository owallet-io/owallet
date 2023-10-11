import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import {
  CosmosWallet,
  EvmWallet,
  NetworkChainId,
  CosmosChainId
} from '@oraichain/oraidex-common';
import {
  AccountData,
  DirectSecp256k1HdWallet,
  OfflineSigner
} from '@cosmjs/proto-signing';
import {
  SigningCosmWasmClient,
  SigningCosmWasmClientOptions
} from '@cosmjs/cosmwasm-stargate';
import TronWeb from 'tronweb';

export class SwapCosmosWallet extends CosmosWallet {
  private client: SigningCosmWasmClient;
  constructor(client: SigningCosmWasmClient) {
    super();
    this.client = client;
  }
  getKeplrAddr(chainId?: NetworkChainId | undefined): Promise<string> {
    return new Promise(resolve => resolve('orai1234'));
  }
  createCosmosSigner(chainId: string): Promise<OfflineSigner> {
    return DirectSecp256k1HdWallet.generate();
  }

  getCosmWasmClient(
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
    return new Promise(resolve =>
      resolve({
        client: this.client,
        wallet: config.signer!,
        defaultAddress: {
          address: '',
          algo: 'secp256k1',
          pubkey: Uint8Array.from([])
        }
      })
    );
  }
}

export class SwapEvmWallet extends EvmWallet {
  private provider: JsonRpcProvider;
  constructor(rpc: string) {
    super();
    this.provider = new JsonRpcProvider(rpc);
    this.tronWeb = new TronWeb('foo', 'foo');
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

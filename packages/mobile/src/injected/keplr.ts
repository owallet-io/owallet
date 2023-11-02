//@ts-nocheck
import { OfflineSigner } from '@cosmjs/proto-signing';
import { NetworkChainId } from '@oraichain/oraidex-common';
import { CosmosChainId, CosmosWallet } from '@oraichain/oraidex-common';

export default class Keplr extends CosmosWallet {
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

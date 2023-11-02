//@ts-nocheck
import { OfflineSigner } from '@cosmjs/proto-signing';
import { ChainInfo, OWallet as keplr, Key } from '@owallet/types';
import { isMobile } from '@walletconnect/browser-utils';
import { NetworkChainId, TokenItemType, WalletType, network, chainInfos } from '@oraichain/oraidex-common';

import { CosmosChainId, CosmosWallet } from '@oraichain/oraidex-common';

export default class Keplr extends CosmosWallet {
  async createCosmosSigner(chainId: CosmosChainId): Promise<OfflineSigner> {
    const keplr = await window.Keplr.getKeplr();
    if (!keplr) {
      throw new Error('You have to install Keplr first if you do not use a mnemonic to sign transactions');
    }
    // use keplr instead
    return await keplr.getOfflineSignerAuto(chainId);
  }

  typeWallet: WalletType;
  constructor(type: WalletType = 'keplr') {
    super();
    this.typeWallet = type;
  }

  disconnect() {
    // clear data?
  }

  // priority with owallet
  private get keplr(): keplr {
    return this.typeWallet === 'owallet' ? window.owallet : window.keplr;
  }

  async getChainInfosWithoutEndpoints(): Promise<
    Array<{
      chainId: string;
      feeCurrencies: any[];
    }>
  > {
    return this.keplr.getChainInfosWithoutEndpoints();
  }

  async suggestChain(chainId: string) {
    if (!window.keplr) return;
    const chainInfo = chainInfos.find(chainInfo => chainInfo.chainId === chainId);

    // do nothing without chainInfo
    if (!chainInfo) return;

    // if there is chainInfo try to suggest, otherwise enable it
    if (!isMobile() && chainInfo) {
      await this.keplr.experimentalSuggestChain(chainInfo as ChainInfo);
    }
    await this.keplr.enable(chainId);
    if (isMobile()) return;
    const keplrChainInfos = await this.keplr.getChainInfosWithoutEndpoints();
    const keplrChain = keplrChainInfos.find(keplrChain => keplrChain.chainId === chainInfo.chainId);
    if (!keplrChain) return;

    // check to update newest chain info
    if (keplrChain.bip44.coinType !== chainInfo.bip44.coinType || !keplrChain.feeCurrencies?.[0]?.gasPriceStep) {
      displayToast(TToastType.TX_INFO, {
        message: `${keplrChain.chainName} has Keplr cointype ${keplrChain.bip44.coinType}, while the chain info config cointype is ${chainInfo.bip44.coinType}. Please reach out to the developers regarding this problem!`
      });
    }
  }

  async suggestToken(token: TokenItemType) {
    // suggestToken is for cosmosBased only
    if (token.cosmosBased && token.contractAddress) {
      const keplr = await this.getKeplr();
      if (!keplr) {
        return displayToast(TToastType.KEPLR_FAILED, {
          message: 'You need to install Keplr to continue'
        });
      }

      await keplr.suggestToken(String(token.chainId), token.contractAddress);
    }
  }

  async getKeplr(): Promise<keplrType | undefined> {
    if (document.readyState === 'complete') {
      return this.keplr;
    }

    return new Promise(resolve => {
      const documentStateChange = (event: Event) => {
        if (event.target && (event.target as Document).readyState === 'complete') {
          resolve(this.keplr);
          document.removeEventListener('readystatechange', documentStateChange);
        }
      };

      document.addEventListener('readystatechange', documentStateChange);
    });
  }

  async getKeplrKey(chainId?: string): Promise<Key | undefined> {
    try {
      chainId = chainId ?? network.chainId;
      if (!chainId) return undefined;

      const keplr = await this.getKeplr();
      if (keplr) {
        return keplr.getKey(chainId);
      }
    } catch (error) {
      console.log('🚀 ~ file: keplr.ts:112 ~ Keplr ~ getKeplrKey ~ error:', error);
    }
  }

  async getKeplrAddr(chainId?: NetworkChainId): Promise<string | undefined> {
    // not support network.chainId (Oraichain)
    chainId = chainId ?? network.chainId;
    // const token = cosmosTokens.find((token) => token.chainId === chainId);
    // if (!token) return;
    try {
      const key = await this.getKeplrKey(chainId);
      return key?.bech32Address;
    } catch (ex) {
      console.log(ex, chainId);
    }
  }
}

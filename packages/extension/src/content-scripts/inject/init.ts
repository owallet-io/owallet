// @ts-nocheck
import { OWallet, Ethereum, TronWeb } from '@owallet/types';
import { OfflineSigner } from '@cosmjs/launchpad';
import { SecretUtils } from 'secretjs/types/enigmautils';
import { OfflineDirectSigner } from '@cosmjs/proto-signing';

export function init(
  owallet: OWallet,
  ethereum: Ethereum,
  eth_owallet: Ethereum,
  tronWeb: TronWeb,
  getOfflineSigner: (chainId: string) => OfflineSigner & OfflineDirectSigner,
  getOfflineSignerOnlyAmino: (chainId: string) => OfflineSigner,
  getOfflineSignerAuto: (chainId: string) => Promise<OfflineSigner | OfflineDirectSigner>,
  getEnigmaUtils: (chainId: string) => SecretUtils
) {
  // Give a priority to production build.
  if (!window.owallet) {
    window.owallet = owallet;
  }

  if (!window.eth_owallet) {
    window.eth_owallet = eth_owallet;
  }

  if (!window.ethereum) {
    window.ethereum = ethereum;
  }

  if (!window.tronWeb) {
    window.tronWeb = tronWeb;
  }

  if (!window.tronLink) {
    window.tronLink = tronWeb;
  }

  if (!window.getOfflineSigner) {
    window.getOfflineSigner = getOfflineSigner;
  }
  if (!window.getOfflineSignerOnlyAmino) {
    window.getOfflineSignerOnlyAmino = getOfflineSignerOnlyAmino;
  }
  if (!window.getOfflineSignerAuto) {
    window.getOfflineSignerAuto = getOfflineSignerAuto;
  }
  if (!window.getEnigmaUtils) {
    window.getEnigmaUtils = getEnigmaUtils;
  }
  // } else {
  //   window.owallet = owallet;
  //   window.ethereum = ethereum;
  //   window.getOfflineSigner = getOfflineSigner;
  //   window.getOfflineSignerOnlyAmino = getOfflineSignerOnlyAmino;
  //   window.getOfflineSignerAuto = getOfflineSignerAuto;
  //   window.getEnigmaUtils = getEnigmaUtils;
  // }

  if (!window.keplr) {
    window.keplr = owallet;
  }
}

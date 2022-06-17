import { OWallet, Ethereum } from '@owallet/types';
import { OfflineSigner } from '@cosmjs/launchpad';
import { SecretUtils } from 'secretjs/types/enigmautils';
import { OfflineDirectSigner } from '@cosmjs/proto-signing';

export function init(
  owallet: OWallet,
  ethereum: Ethereum,
  getOfflineSigner: (chainId: string) => OfflineSigner & OfflineDirectSigner,
  getEnigmaUtils: (chainId: string) => SecretUtils
) {
  /* eslint-disable @typescript-eslint/ban-ts-comment */
  // for compartible with keplr dapp
  // @ts-ignore
  window.keplr = window.keplr || owallet;
  // @ts-ignore
  window.owallet = owallet;
  // @ts-ignore
  window.ethereum = window.ethereum || ethereum;
  // @ts-ignore
  window.getOfflineSigner = getOfflineSigner;
  // @ts-ignore
  window.getEnigmaUtils = getEnigmaUtils;
  /* eslint-enable @typescript-eslint/ban-ts-comment */
}

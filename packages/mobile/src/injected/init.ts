import { OWallet } from '@owallet-wallet/types';
import { OfflineSigner } from '@cosmjs/launchpad';
import { SecretUtils } from 'secretjs/types/enigmautils';
import { OfflineDirectSigner } from '@cosmjs/proto-signing';

export function init(
  owallet: OWallet,
  getOfflineSigner: (chainId: string) => OfflineSigner & OfflineDirectSigner,
  getEnigmaUtils: (chainId: string) => SecretUtils
) {
  /* eslint-disable @typescript-eslint/ban-ts-comment */
  // @ts-ignore
  window.owallet = owallet;
  // @ts-ignore
  window.getOfflineSigner = getOfflineSigner;
  // @ts-ignore
  window.getEnigmaUtils = getEnigmaUtils;
  /* eslint-enable @typescript-eslint/ban-ts-comment */
}

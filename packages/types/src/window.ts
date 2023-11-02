import { OWallet, Ethereum, TronWeb, Bitcoin } from './wallet';
import { OfflineSigner } from '@cosmjs/launchpad';
import { SecretUtils } from 'secretjs/types/enigmautils';
import { OfflineDirectSigner } from '@cosmjs/proto-signing';
export interface Window {
  owallet?: OWallet;
  bitcoin?: Bitcoin;
  ethereum?: Ethereum;
  tronWeb?: TronWeb;
  eth_owallet?: Ethereum;
  getOfflineSigner?: (chainId: string) => OfflineSigner & OfflineDirectSigner;
  getOfflineSignerOnlyAmino?: (chainId: string) => OfflineSigner;
  getOfflineSignerAuto?: (chainId: string) => Promise<OfflineSigner | OfflineDirectSigner>;
  getEnigmaUtils?: (chainId: string) => SecretUtils;
}

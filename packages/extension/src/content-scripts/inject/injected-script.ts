import { InjectedOWallet, InjectedEthereum, InjectedTronWebOWallet } from '@owallet/provider';
import { init } from './init';

import manifest from '../../manifest.json';

const owallet = new InjectedOWallet(manifest.version, 'extension');
const ethereum = new InjectedEthereum(manifest.version, 'extension');
const eth_owallet = new InjectedEthereum(manifest.version, 'extension');
const tronweb = new InjectedTronWebOWallet(manifest.version, 'extension');
init(
  owallet,
  ethereum,
  eth_owallet,
  tronweb,
  (chainId: string) => owallet.getOfflineSigner(chainId),
  (chainId: string) => owallet.getOfflineSignerOnlyAmino(chainId),
  (chainId: string) => owallet.getOfflineSignerAuto(chainId),
  (chainId: string) => owallet.getEnigmaUtils(chainId)
);

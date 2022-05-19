import { InjectedOWallet } from '@owallet/provider';
import { init } from './init';

import manifest from '../../manifest.json';

const owallet = new InjectedOWallet(manifest.version, 'extension');

init(
  owallet,
  (chainId: string) => owallet.getOfflineSigner(chainId),
  (chainId: string) => owallet.getOfflineSignerOnlyAmino(chainId),
  (chainId: string) => owallet.getOfflineSignerAuto(chainId),
  (chainId: string) => owallet.getEnigmaUtils(chainId)
);

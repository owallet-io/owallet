import { RNInjectedOWallet } from './injected-provider';
import { init } from './init';

// TODO: Set the OWallet version properly
const owallet = new RNInjectedOWallet('0.9.6', 'mobile-web');

init(
  owallet,
  (chainId: string) => owallet.getOfflineSigner(chainId),
  (chainId: string) => owallet.getEnigmaUtils(chainId)
);

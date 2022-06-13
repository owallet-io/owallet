import { RNInjectedOWallet, RNInjectedEthereum } from './injected-provider';
import { init } from './init';

// TODO: Set the OWallet version properly
const owallet = new RNInjectedOWallet('0.9.16', 'mobile-web');
const ethereum = new RNInjectedEthereum('0.9.17', 'mobile-web');

init(
  owallet,
  ethereum,
  (chainId: string) => owallet.getOfflineSigner(chainId),
  (chainId: string) => owallet.getEnigmaUtils(chainId)
);

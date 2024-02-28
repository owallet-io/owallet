import {
  RNInjectedOWallet,
  RNInjectedEthereum,
  RNInjectedTronWeb,
  RNInjectedBitcoin,
} from "./injected-provider";
import { init } from "./init";

// TODO: Set the OWallet version properly
const owallet = new RNInjectedOWallet("0.9.21", "mobile-web");
const ethereum = new RNInjectedEthereum("0.9.21", "mobile-web");
const tronWeb = new RNInjectedTronWeb("0.9.21", "mobile-web");
const bitcoin = new RNInjectedBitcoin("0.9.21", "mobile-web");
init(
  owallet,
  ethereum,
  tronWeb,
  bitcoin,
  (chainId: string) => owallet.getOfflineSigner(chainId),
  (chainId: string) => owallet.getEnigmaUtils(chainId)
);

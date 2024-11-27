import {
  InjectedOWallet,
  InjectedEthereum,
  InjectedTronWebOWallet,
  InjectedBitcoin,
  InjectedSolana,
  // InjectedOasisOWallet,
} from "@owallet/provider";
import { init } from "./init";

import manifest from "../../manifest.json";

const owallet = new InjectedOWallet(manifest.version, "extension");
const ethereum = new InjectedEthereum(manifest.version, "extension");
const tronweb = new InjectedTronWebOWallet(manifest.version, "extension");
const bitcoin = new InjectedBitcoin(manifest.version, "extension");
const solana = new InjectedSolana(manifest.version, "extension");
// const oasis = new InjectedOasisOWallet(manifest.version, "extension");

init(
  owallet,
  ethereum,
  tronweb,
  bitcoin,
  solana,
  // oasis,
  (chainId: string) => owallet.getOfflineSigner(chainId),
  (chainId: string) => owallet.getOfflineSignerOnlyAmino(chainId),
  (chainId: string) => owallet.getOfflineSignerAuto(chainId),
  (chainId: string) => owallet.getEnigmaUtils(chainId)
);

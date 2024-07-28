import {
  InjectedOWallet,
  InjectedEthereum,
  InjectedTronWebOWallet,
  InjectedBitcoin,
  // InjectedOasisOWallet,
} from "@owallet/provider";
import { init } from "./init";

import manifest from "../../manifest.json";
import { ICON_OWALLET } from "@owallet/common";
import { v4 } from "uuid";
import { EIP6963ProviderDetail } from "@owallet/types";
const owallet = new InjectedOWallet(manifest.version, "extension");
const ethereum = new InjectedEthereum(manifest.version, "extension");
const tronweb = new InjectedTronWebOWallet(manifest.version, "extension");
const bitcoin = new InjectedBitcoin(manifest.version, "extension");
// const oasis = new InjectedOasisOWallet(manifest.version, "extension");
init(
  owallet,
  ethereum,
  tronweb,
  bitcoin,
  // oasis,
  (chainId: string) => owallet.getOfflineSigner(chainId),
  (chainId: string) => owallet.getOfflineSignerOnlyAmino(chainId),
  (chainId: string) => owallet.getOfflineSignerAuto(chainId),
  (chainId: string) => owallet.getEnigmaUtils(chainId)
);

// if (ethereum) {
//   const uuid = v4();
//   const announceProvider = () => {
//     window.dispatchEvent(
//       new CustomEvent("eip6963:announceProvider", {
//         detail: {
//           provider: ethereum as any,
//           info: {
//             uuid: uuid,
//             rdns: "io.orai.owallet",
//             icon: ICON_OWALLET,
//             name: "OWallet"
//           }
//         } as EIP6963ProviderDetail
//       })
//     );
//   };
//   window.addEventListener("eip6963:requestProvider", announceProvider);
// } else {
//   console.log("not found eth");
// }

// @ts-nocheck
import {
  OWallet,
  Ethereum,
  TronWeb,
  Bitcoin,
  EIP6963ProviderDetail,
} from "@owallet/types";
import { OfflineSigner } from "@cosmjs/launchpad";
import { SecretUtils } from "@owallet/types";
import { OfflineDirectSigner } from "@cosmjs/proto-signing";

export function init(
  owallet: OWallet,
  ethereum: Ethereum,
  tronWeb: TronWeb,
  bitcoin: Bitcoin,
  // oasis: Oasis,
  getOfflineSigner: (chainId: string) => OfflineSigner & OfflineDirectSigner,
  getOfflineSignerOnlyAmino: (chainId: string) => OfflineSigner,
  getOfflineSignerAuto: (
    chainId: string
  ) => Promise<OfflineSigner | OfflineDirectSigner>,
  getEnigmaUtils: (chainId: string) => SecretUtils
) {
  // Give a priority to production build.
  if (!window.owallet) {
    window.owallet = owallet;
  }
  if (!window.bitcoin) {
    window.bitcoin = bitcoin;
  }

  if (!window.ethereum.isOwallet) {
    Object.defineProperty(window, "ethereum", {
      value: ethereum, // Thay thế bằng giá trị bạn muốn gán
      writable: false, // Không cho phép ghi đè giá trị mới
      configurable: false, // Không cho phép thay đổi thuộc tính này
    });
  }

  if (ethereum) {
    Object.defineProperty(window, "eth_owallet", {
      value: ethereum, // Thay thế bằng giá trị bạn muốn gán
      writable: false, // Không cho phép ghi đè giá trị mới
      configurable: false, // Không cho phép thay đổi thuộc tính này
    });
  }

  if (tronWeb) {
    window.tronWeb_owallet = tronWeb;
    window.tronLink_owallet = tronWeb;
  }

  if (!window.tronWeb) {
    window.tronWeb = tronWeb;
  }

  if (!window.tronLink) {
    window.tronLink = tronWeb;
  }

  if (!window.getOfflineSigner) {
    window.getOfflineSigner = getOfflineSigner;
  }
  if (!window.getOfflineSignerOnlyAmino) {
    window.getOfflineSignerOnlyAmino = getOfflineSignerOnlyAmino;
  }
  if (!window.getOfflineSignerAuto) {
    window.getOfflineSignerAuto = getOfflineSignerAuto;
  }
  if (!window.getEnigmaUtils) {
    window.getEnigmaUtils = getEnigmaUtils;
  }
  // } else {
  //   window.owallet = owallet;
  //   window.ethereum = ethereum;
  //   window.getOfflineSigner = getOfflineSigner;
  //   window.getOfflineSignerOnlyAmino = getOfflineSignerOnlyAmino;
  //   window.getOfflineSignerAuto = getOfflineSignerAuto;
  //   window.getEnigmaUtils = getEnigmaUtils;
  // }

  if (!window.keplr) {
    window.keplr = owallet;
  }
}

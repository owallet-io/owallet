/**
 * getOWalletExtensionRouterId returns the `window.owalletExtensionRouterId`.
 * If the `window.owalletExtensionRouterId` is not initialized, it will be initialized and returned.
 */
export function getOWalletExtensionRouterId(): number {
  if (window.owalletExtensionRouterId == null) {
    window.owalletExtensionRouterId = Math.floor(Math.random() * 1000000);
  }
  return window.owalletExtensionRouterId;
}

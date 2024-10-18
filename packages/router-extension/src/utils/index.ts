/**
 * getOWalletExtensionRouterId returns the `window.owalletExtensionRouterId`.
 * If the `window.owalletExtensionRouterId` is not initialized, it will be initialized and returned.
 */
export function getOWalletExtensionRouterId(): number {
  if (globalThis.owalletExtensionRouterId == null) {
    globalThis.owalletExtensionRouterId = Math.floor(
      Math.random() * Number.MAX_SAFE_INTEGER
    );
  }
  return globalThis.owalletExtensionRouterId;
}

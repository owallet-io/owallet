import { getNetworkTypeByChainId, TRON_ID } from '@owallet/common';

export function findLedgerAddressWithChainId(ledgerAddresses, chainId) {
  let address;

  if (chainId === TRON_ID) {
    address = ledgerAddresses.trx;
  } else {
    const networkType = getNetworkTypeByChainId(chainId);
    if (networkType === 'evm') {
      address = ledgerAddresses.eth;
    } else {
      address = ledgerAddresses.cosmos;
    }
  }
  return address;
}

import { LedgerAppType } from '@owallet/background';
import { TRON_ID } from '@owallet/common';
import { AsyncKVStore } from '../../common';

export const getLastUsedLedgerDeviceId = async (): Promise<
  string | undefined
> => {
  const kvStore = new AsyncKVStore('__owallet_ledger_nano_x');
  return await kvStore.get<string>('last_device_id');
};

export const setLastUsedLedgerDeviceId = async (
  deviceId: string
): Promise<void> => {
  const kvStore = new AsyncKVStore('__owallet_ledger_nano_x');
  await kvStore.set<string>('last_device_id', deviceId);
};

export function formatNeworkTypeToLedgerAppName(
  network: string,
  chainId?: string | number
): LedgerAppType {
  switch (network) {
    case 'cosmos':
      return 'cosmos';
    case 'bitcoin':
      return 'btc';
    case 'evm':
      if (chainId && chainId === TRON_ID) {
        return 'trx';
      }
      return 'eth';
    default:
      return 'cosmos';
  }
}

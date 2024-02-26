import { getNetworkTypeByBip44HDPath } from '@owallet/common';
import { BIP44HDPath } from '@owallet/types';
const mockBip44HDPath: BIP44HDPath = {
  coinType: 118,
  account: 0,
  change: 0,
  addressIndex: 0
};
describe('getNetworkTypeByBip44HDPath', () => {
  it('should return correct network type based on coin type', () => {
    expect(getNetworkTypeByBip44HDPath({ ...mockBip44HDPath, coinType: 118 })).toBe('cosmos');
    expect(getNetworkTypeByBip44HDPath({ ...mockBip44HDPath, coinType: 60 })).toBe('eth');
    expect(getNetworkTypeByBip44HDPath({ ...mockBip44HDPath, coinType: 195 })).toBe('trx');
    expect(getNetworkTypeByBip44HDPath({ ...mockBip44HDPath, coinType: 123 })).toBe('cosmos');
  });
});

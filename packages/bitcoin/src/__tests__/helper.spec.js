const { getCoinData } = require('../networks');
const {
  getBalanceValue,
  btcToFiat,
  formatNumber,
  formatBalance
} = require('../helpers');

describe('helper', () => {
  it('getBalanceValue', () => {
    console.log('ok');
    const res = getBalanceValue({
      balance: 756871,
      cryptoUnit: 'BTC'
    });
    expect(res).toBe(0.00756871);
  });
  it('btcToFiat', () => {
    const res = btcToFiat({
      amount: 0.00756871,
      exchangeRate: 29000,
      currencyFiat: 'usd'
    });
    expect(res).toBe('219.49');
  });
  it('formatBalance', () => {
    console.log('ok');
    const res = formatBalance({
      balance: 7568371000,
      cryptoUnit: 'BTC',
      coin: 'bitcoinTestnet'
    });
    expect(res).toBe('75.68371 BTC');
  });
  it('formatNumber', () => {
    const res = formatNumber(0.007568);
    expect(res).toBe('0.007568');
  });

  it.each([
    [
      { selectedCrypto: 'bitcoin', cryptoUnit: 'satoshi' },
      {
        acronym: 'sats',
        label: 'Bitcoin',
        crypto: 'BTC',
        satoshi: 'satoshi',
        oshi: 'sats',
        blockTime: 10
      }
    ],
    [
      { selectedCrypto: 'bitcoin', cryptoUnit: 'BTC' },
      {
        acronym: 'BTC',
        label: 'Bitcoin',
        crypto: 'BTC',
        satoshi: 'satoshi',
        oshi: 'sats',
        blockTime: 10
      }
    ],
    [
      { selectedCrypto: 'bitcoinTestnet', cryptoUnit: 'satoshi' },
      {
        acronym: 'sats',
        label: 'Bitcoin Testnet',
        crypto: 'BTC',
        satoshi: 'satoshi',
        oshi: 'sats',
        blockTime: 10
      }
    ],
    [
      { selectedCrypto: 'bitcoinTestnet', cryptoUnit: 'BTC' },
      {
        acronym: 'BTC',
        label: 'Bitcoin Testnet',
        crypto: 'BTC',
        satoshi: 'satoshi',
        oshi: 'sats',
        blockTime: 10
      }
    ],
    [
      { selectedCrypto: 'litecoin', cryptoUnit: 'satoshi' },
      {
        acronym: 'lits',
        label: 'Litecoin',
        crypto: 'LTC',
        satoshi: 'litoshi',
        oshi: 'lits',
        blockTime: 2.5
      }
    ],
    [
      { selectedCrypto: 'litecoin', cryptoUnit: 'BTC' },
      {
        acronym: 'LTC',
        label: 'Litecoin',
        crypto: 'LTC',
        satoshi: 'litoshi',
        oshi: 'lits',
        blockTime: 2.5
      }
    ],
    [
      { selectedCrypto: 'litecoinTestnet', cryptoUnit: 'satoshi' },
      {
        acronym: 'lits',
        label: 'Litecoin Testnet',
        crypto: 'LTC',
        satoshi: 'litoshi',
        oshi: 'lits',
        blockTime: 2.5
      }
    ],
    [
      { selectedCrypto: 'litecoinTestnet', cryptoUnit: 'BTC' },
      {
        acronym: 'LTC',
        label: 'Litecoin Testnet',
        crypto: 'LTC',
        satoshi: 'litoshi',
        oshi: 'lits',
        blockTime: 2.5
      }
    ],
    ,
  ])('should return %p', (param, expected) => {
    const res = getCoinData(param);
    expect(res).toEqual(expected);
  });
});

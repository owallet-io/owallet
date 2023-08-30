const { getCoinData } = require('../networks');
const {
  getBalanceValue,
  btcToFiat,
  formatNumber,
  formatBalance,
  getBaseDerivationPath,
  getCoinNetwork,
  getScriptHash,
  getKeyPair,
  getAddress
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
  ])('Test getCoinData for %p', (param, expected) => {
    const res = getCoinData(param);
    expect(res).toEqual(expected);
  });
  it.each([
    [
      {
        keyDerivationPath: '44',
        selectedCrypto: 'bitcoin'
      },
      `m/44'/0'/0'/0/0`
    ],
    [
      {
        keyDerivationPath: '44',
        selectedCrypto: 'bitcoinTestnet'
      },
      `m/44'/1'/0'/0/0`
    ]
  ])('Test getBaseDerivationPath for %p', (param, expected) => {
    const res = getBaseDerivationPath(param);
    expect(res).toEqual(expected);
  });
  it.each([
    [
      'bitcoin',
      {
        bech32: 'bc',
        bip32: { private: 76066276, public: 76067358 },
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        pubKeyHash: 0,
        scriptHash: 5,
        wif: 128
      }
    ],
    [
      'bitcoinTestnet',
      {
        bech32: 'tb',
        bip32: { private: 70615956, public: 70617039 },
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        pubKeyHash: 111,
        scriptHash: 196,
        wif: 239
      }
    ]
  ])('Test getCoinNetwork for %p', (param, expected) => {
    const res = getCoinNetwork(param);
    expect(res.bech32).toBe(expected.bech32);
    expect(res.bip32).toEqual(expected.bip32);
    expect(res.messagePrefix).toBe(expected.messagePrefix);
    expect(res.pubKeyHash).toBe(expected.pubKeyHash);
    expect(res.scriptHash).toBe(expected.scriptHash);
    expect(res.wif).toBe(expected.wif);
  });
  it.each([
    [
      '1LvCkqBm4kFwXxqZd9b8aQHADSYyY5zx6P',
      'bitcoin',
      'ba91d2bd9c2b79893859cf3066e9cc8710a528a4ae6d6df9cd3733a57a9e447c'
    ],
    [
      'n4XP6YwVHNCJ74ResGk7xq3CBhYqJc9Bnj',
      'bitcoinTestnet',
      '8ac9ba31451fc654d8c1a0266d83f4a2c2197e3cfeec7f45002b0f022cb3441e'
    ]
  ])('Test getScriptHash for %p', (param1, param2, expected) => {
    const res = getScriptHash(param1, param2);
    expect(res).toBe(expected);
  });
  it.each([
    [
      {
        selectedCrypto: 'bitcoin',
        keyDerivationPath: '44',
        mnemonic:
          'wrist illness circle evidence accident loan thing mystery output inhale fat rookie'
      },
      'xprvA2xb1gzb6ibQFvnGexAMHFFbyuh4Jw2ugatoi2aWYuLtfwmH4B7zg1ZonqoMJP3hQq4CnL6MKB8gcXcaYjiX2wAy8Txsc8ZaTsh1KZdYukQ'
    ],
    [
      {
        selectedCrypto: 'bitcoinTestnet',
        keyDerivationPath: '44',
        mnemonic:
          'wrist illness circle evidence accident loan thing mystery output inhale fat rookie'
      },
      'tprv8kJffQMaAirLokZKSXKr9Av1nPHu3gDjrZhgM1qjaV67XehMoz1M1cequrN7jodKQathN8ty8Kuiqya9NuZcjVHqk6rtFhJTErfpyrjQBQm'
    ]
  ])('Test getKeyPair for %p', (param, expected) => {
    const res = getKeyPair(param);
    expect(res.toBase58()).toEqual(expected);
  });
  it.each([
    [
      getKeyPair({
        selectedCrypto: 'bitcoin',
        keyDerivationPath: '44',
        mnemonic:
          'wrist illness circle evidence accident loan thing mystery output inhale fat rookie'
      }),
      'bitcoin',
      '1LvCkqBm4kFwXxqZd9b8aQHADSYyY5zx6P'
    ],
    [
      getKeyPair({
        selectedCrypto: 'bitcoinTestnet',
        keyDerivationPath: '44',
        mnemonic:
          'wrist illness circle evidence accident loan thing mystery output inhale fat rookie'
      }),
      'bitcoinTestnet',
      'n4XP6YwVHNCJ74ResGk7xq3CBhYqJc9Bnj'
    ]
  ])('Test getAddress for %p', (param1, param2, expected) => {
    const res = getAddress(param1, param2, 'legacy');
    expect(res).toEqual(expected);
  });
});

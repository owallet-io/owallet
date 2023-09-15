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
  getAddress,
  convertStringToMessage,
  getByteCount,
  createTransaction
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
        keyDerivationPath: '84',
        selectedCrypto: 'bitcoin'
      },
      `m/84'/0'/0'/0/0`
    ],
    [
      {
        keyDerivationPath: '84',
        selectedCrypto: 'bitcoinTestnet'
      },
      `m/84'/1'/0'/0/0`
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
        keyDerivationPath: '84',
        mnemonic:
          'wrist illness circle evidence accident loan thing mystery output inhale fat rookie'
      },
      'xprvA2q8XgFXw2swTGJXa2TJBqmSZmPyUBhzCXndumbPH5ScyipLMMKJp32R7jGSHLJwApTFj8nRp4GkZcdeFqEhfdXU3LYkaz3LwWHZxfSaZqx'
    ],
    [
      {
        selectedCrypto: 'bitcoinTestnet',
        keyDerivationPath: '84',
        mnemonic:
          'wrist illness circle evidence accident loan thing mystery output inhale fat rookie'
      },
      'tprv8kUr2PQcA1spigZD2FVbFZDtQcHUtZniwP75j4xGZmgjYfLydmGmcUYwEEBxCMPNgrxut21GkZDDgucQVxja1W9qfzidYTrsBGsGHrdQ1od'
    ]
  ])('Test getKeyPair for %p', (param, expected) => {
    const res = getKeyPair(param);
    expect(res.toBase58()).toEqual(expected);
  });
  it.each([
    [
      getKeyPair({
        selectedCrypto: 'bitcoin',
        keyDerivationPath: '84',
        mnemonic:
          'wrist illness circle evidence accident loan thing mystery output inhale fat rookie'
      }),
      'bitcoin',
      'bc1q0vh389f8xtr87jcnt0xhc5sh9c0ahrqwv9kz7j'
    ],
    [
      getKeyPair({
        selectedCrypto: 'bitcoinTestnet',
        keyDerivationPath: '84',
        mnemonic:
          'wrist illness circle evidence accident loan thing mystery output inhale fat rookie'
      }),
      'bitcoinTestnet',
      'tb1q55ddlnqp7spzeskdd82p5sseyqexy67s7esc3g'
    ]
  ])('Test getAddress for %p', (param1, param2, expected) => {
    const res = getAddress(param1, param2, 'bech32');
    expect(res).toEqual(expected);
  });
  it('convertStringToMessage', () => {
    const rs = convertStringToMessage('HelloWord');
    expect(JSON.stringify(rs)).toEqual(
      '{"type":"Buffer","data":[72,101,108,108,111,87,111,114,100]}'
    );
  });
  it('getByteCount', () => {
    const msg = convertStringToMessage('HelloWord');
    const rs = getByteCount({ ['bech32']: 27 }, { ['bech32']: 2 }, msg);
    console.log('🚀 ~ file: helper.spec.js:264 ~ it ~ rs:', rs);
    expect(rs).toBe(1934);
  });
  // it('createTransaction', async () => {
  //   const fakeGetTransaction = {
  //     id: 0.817724401904219,
  //     error: false,
  //     method: 'getTransaction',
  //     data: {
  //       blockhash:
  //         '000000000000118ee89757d1fc3a611e2432f212e12f97f7b39f1485db24ef73',
  //       blocktime: 1693906958,
  //       confirmations: 91,
  //       hash: '2d68ee1ec24c262d687c91d5f34353a11c693faf3726e10b3f199f0851a89439',
  //       hex: '02000000020b9dda487d6b95dfb9113c05edd23e2ccb03eb45a782b349fd0cd15b374c2795000000006a47304402207b088b12ed19a6d558784bb0e8ae087e07f6806d96ba7ec573e13aea4de6417502206fd48258bc593e18ba79e8d95ba94efa1a647e4ad3d341a531361faff4fce5f8012103d4c71a9e95dfa3154d5ffe77517a7746aa6eb4f499ba1bb69570de7dc6293e07ffffffff6c06009f3c614b052e85e1d38a21fca6fe9403121789bfb6984734aeb57c7abd010000006a47304402206efd36573aba920381c25df0d970f494d53678351c270910c0217e04678058c2022076994a2ac3bbf5e40ad6e344f517a4ea304a9186ccc951205aebaeba4a818069012103d4c71a9e95dfa3154d5ffe77517a7746aa6eb4f499ba1bb69570de7dc6293e07ffffffff0201aa4000000000001976a91400f8b4f057880e934323a3eb95d710b88840195288ac10270000000000001976a914b66eed8c589619966a9acf11c105f4a312cbc99b88ac00000000',
  //       locktime: 0,
  //       size: 372,
  //       time: 1693906958,
  //       txid: '2d68ee1ec24c262d687c91d5f34353a11c693faf3726e10b3f199f0851a89439',
  //       version: 2,
  //       vin: [
  //         {
  //           scriptSig: {
  //             asm: '304402207b088b12ed19a6d558784bb0e8ae087e07f6806d96ba7ec573e13aea4de6417502206fd48258bc593e18ba79e8d95ba94efa1a647e4ad3d341a531361faff4fce5f8[ALL] 03d4c71a9e95dfa3154d5ffe77517a7746aa6eb4f499ba1bb69570de7dc6293e07',
  //             hex: '47304402207b088b12ed19a6d558784bb0e8ae087e07f6806d96ba7ec573e13aea4de6417502206fd48258bc593e18ba79e8d95ba94efa1a647e4ad3d341a531361faff4fce5f8012103d4c71a9e95dfa3154d5ffe77517a7746aa6eb4f499ba1bb69570de7dc6293e07'
  //           },
  //           sequence: 4294967295,
  //           txid: '95274c375bd10cfd49b382a745eb03cb2c3ed2ed053c11b9df956b7d48da9d0b',
  //           vout: 0
  //         },
  //         {
  //           scriptSig: {
  //             asm: '304402206efd36573aba920381c25df0d970f494d53678351c270910c0217e04678058c2022076994a2ac3bbf5e40ad6e344f517a4ea304a9186ccc951205aebaeba4a818069[ALL] 03d4c71a9e95dfa3154d5ffe77517a7746aa6eb4f499ba1bb69570de7dc6293e07',
  //             hex: '47304402206efd36573aba920381c25df0d970f494d53678351c270910c0217e04678058c2022076994a2ac3bbf5e40ad6e344f517a4ea304a9186ccc951205aebaeba4a818069012103d4c71a9e95dfa3154d5ffe77517a7746aa6eb4f499ba1bb69570de7dc6293e07'
  //           },
  //           sequence: 4294967295,
  //           txid: 'bd7a7cb5ae344798b6bf8917120394fea6fc218ad3e1852e054b613c9f00066c',
  //           vout: 1
  //         }
  //       ],
  //       vout: [
  //         {
  //           n: 0,
  //           scriptPubKey: {
  //             address: 'mfc6EWEjRZkD9KJKcAXEeH4zgbHFxg6aGw',
  //             asm: 'OP_DUP OP_HASH160 00f8b4f057880e934323a3eb95d710b888401952 OP_EQUALVERIFY OP_CHECKSIG',
  //             desc: 'addr(mfc6EWEjRZkD9KJKcAXEeH4zgbHFxg6aGw)#l6cqr602',
  //             hex: '76a91400f8b4f057880e934323a3eb95d710b88840195288ac',
  //             type: 'pubkeyhash'
  //           },
  //           value: 0.04237825
  //         },
  //         {
  //           n: 1,
  //           scriptPubKey: {
  //             address: 'mx9aANfZysLa8W1un99axpxuekuT8otWSg',
  //             asm: 'OP_DUP OP_HASH160 b66eed8c589619966a9acf11c105f4a312cbc99b OP_EQUALVERIFY OP_CHECKSIG',
  //             desc: 'addr(mx9aANfZysLa8W1un99axpxuekuT8otWSg)#5fxa7fwd',
  //             hex: '76a914b66eed8c589619966a9acf11c105f4a312cbc99b88ac',
  //             type: 'pubkeyhash'
  //           },
  //           value: 0.0001
  //         }
  //       ],
  //       vsize: 372,
  //       weight: 1488
  //     },
  //     coin: 'bitcoinTestnet'
  //   };
  //   const spyGetTransaction = jest
  //     .spyOn(require('../electrum'), 'getTransaction')
  //     .mockResolvedValue(fakeGetTransaction);
  //   const rs = await createTransaction({
  //     address: 'mx9aANfZysLa8W1un99axpxuekuT8otWSg',
  //     transactionFee: 2,
  //     amount: 20000,
  //     confirmedBalance: 4227331,
  //     utxos: [
  //       {
  //         address: 'mfc6EWEjRZkD9KJKcAXEeH4zgbHFxg6aGw',
  //         path: "m/44'/1'/0'/0/0",
  //         value: 4227331,
  //         confirmations: -2476552,
  //         blockHeight: 2476552,
  //         txid: 'ba5a7631b8d85b2722a65fa4ba5f3c876b2c5ec210fa83ad70fa6b09d1c12b7e',
  //         vout: 0,
  //         tx_hash:
  //           'ba5a7631b8d85b2722a65fa4ba5f3c876b2c5ec210fa83ad70fa6b09d1c12b7e',
  //         tx_hash_big_endian:
  //           'ba5a7631b8d85b2722a65fa4ba5f3c876b2c5ec210fa83ad70fa6b09d1c12b7e',
  //         tx_output_n: 0
  //       }
  //     ],
  //     blacklistedUtxos: [],
  //     changeAddress: 'mfc6EWEjRZkD9KJKcAXEeH4zgbHFxg6aGw',
  //     mnemonic:
  //       'party avocado vocal stuff spider indoor promote business cloud culture chase sphere',
  //     selectedCrypto: 'bitcoinTestnet',
  //     message: '',
  //     addressType: 'bech32'
  //   });
  //   expect(spyGetTransaction).toHaveBeenCalled();
  //   console.log('🚀 ~ file: helper.spec.js:351 ~ it ~ rs:', rs);
  // });
});

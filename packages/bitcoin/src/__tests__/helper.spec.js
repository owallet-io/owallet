// const { getCoinData } = require('../networks');
// const {
//   getBalanceValue,
//   btcToFiat,
//   formatNumber,
//   formatBalance,
//   getBaseDerivationPath,
//   getCoinNetwork,
//   getScriptHash,
//   getKeyPairByMnemonic,
//   getAddress,
//   convertStringToMessage,
//   getByteCount,
//   createTransaction
// } = require('../helpers');

// TDDO: disable test for convert js to ts
it('test',()=>{
  console.log('test1');
})
// describe('helper', () => {
//   it('getBalanceValue', () => {
//     const res = getBalanceValue({
//       balance: 756871,
//       cryptoUnit: 'BTC'
//     });
//     expect(res).toBe(0.00756871);
//   });
//   it('btcToFiat', () => {
//     const res = btcToFiat({
//       amount: 0.00756871,
//       exchangeRate: 29000,
//       currencyFiat: 'usd'
//     });
//     expect(res).toBe('219.49');
//   });
//   it('formatBalance', () => {
//     const res = formatBalance({
//       balance: 7568371000,
//       cryptoUnit: 'BTC',
//       coin: 'bitcoinTestnet'
//     });
//     expect(res).toBe('75.68371 BTC');
//   });
//   it('formatNumber', () => {
//     const res = formatNumber(0.007568);
//     expect(res).toBe('0.007568');
//   });

//   it.each([
//     [
//       { selectedCrypto: 'bitcoin', cryptoUnit: 'satoshi' },
//       {
//         acronym: 'sats',
//         label: 'Bitcoin',
//         crypto: 'BTC',
//         satoshi: 'satoshi',
//         oshi: 'sats',
//         blockTime: 10
//       }
//     ],
//     [
//       { selectedCrypto: 'bitcoin', cryptoUnit: 'BTC' },
//       {
//         acronym: 'BTC',
//         label: 'Bitcoin',
//         crypto: 'BTC',
//         satoshi: 'satoshi',
//         oshi: 'sats',
//         blockTime: 10
//       }
//     ],
//     [
//       { selectedCrypto: 'bitcoinTestnet', cryptoUnit: 'satoshi' },
//       {
//         acronym: 'sats',
//         label: 'Bitcoin Testnet',
//         crypto: 'BTC',
//         satoshi: 'satoshi',
//         oshi: 'sats',
//         blockTime: 10
//       }
//     ],
//     [
//       { selectedCrypto: 'bitcoinTestnet', cryptoUnit: 'BTC' },
//       {
//         acronym: 'BTC',
//         label: 'Bitcoin Testnet',
//         crypto: 'BTC',
//         satoshi: 'satoshi',
//         oshi: 'sats',
//         blockTime: 10
//       }
//     ],
//     [
//       { selectedCrypto: 'litecoin', cryptoUnit: 'satoshi' },
//       {
//         acronym: 'lits',
//         label: 'Litecoin',
//         crypto: 'LTC',
//         satoshi: 'litoshi',
//         oshi: 'lits',
//         blockTime: 2.5
//       }
//     ],
//     [
//       { selectedCrypto: 'litecoin', cryptoUnit: 'BTC' },
//       {
//         acronym: 'LTC',
//         label: 'Litecoin',
//         crypto: 'LTC',
//         satoshi: 'litoshi',
//         oshi: 'lits',
//         blockTime: 2.5
//       }
//     ],
//     [
//       { selectedCrypto: 'litecoinTestnet', cryptoUnit: 'satoshi' },
//       {
//         acronym: 'lits',
//         label: 'Litecoin Testnet',
//         crypto: 'LTC',
//         satoshi: 'litoshi',
//         oshi: 'lits',
//         blockTime: 2.5
//       }
//     ],
//     [
//       { selectedCrypto: 'litecoinTestnet', cryptoUnit: 'BTC' },
//       {
//         acronym: 'LTC',
//         label: 'Litecoin Testnet',
//         crypto: 'LTC',
//         satoshi: 'litoshi',
//         oshi: 'lits',
//         blockTime: 2.5
//       }
//     ],
//     ,
//   ])('Test getCoinData for %p', (param, expected) => {
//     const res = getCoinData(param);
//     expect(res).toEqual(expected);
//   });
//   it.each([
//     [
//       {
//         keyDerivationPath: '84',
//         selectedCrypto: 'bitcoin'
//       },
//       `m/84'/0'/0'/0/0`
//     ],
//     [
//       {
//         keyDerivationPath: '84',
//         selectedCrypto: 'bitcoinTestnet'
//       },
//       `m/84'/1'/0'/0/0`
//     ]
//   ])('Test getBaseDerivationPath for %p', (param, expected) => {
//     const res = getBaseDerivationPath(param);
//     expect(res).toEqual(expected);
//   });
//   it.each([
//     [
//       'bitcoin',
//       {
//         bech32: 'bc',
//         bip32: { private: 76066276, public: 76067358 },
//         messagePrefix: '\x18Bitcoin Signed Message:\n',
//         pubKeyHash: 0,
//         scriptHash: 5,
//         wif: 128
//       }
//     ],
//     [
//       'bitcoinTestnet',
//       {
//         bech32: 'tb',
//         bip32: { private: 70615956, public: 70617039 },
//         messagePrefix: '\x18Bitcoin Signed Message:\n',
//         pubKeyHash: 111,
//         scriptHash: 196,
//         wif: 239
//       }
//     ]
//   ])('Test getCoinNetwork for %p', (param, expected) => {
//     const res = getCoinNetwork(param);
//     expect(res.bech32).toBe(expected.bech32);
//     expect(res.bip32).toEqual(expected.bip32);
//     expect(res.messagePrefix).toBe(expected.messagePrefix);
//     expect(res.pubKeyHash).toBe(expected.pubKeyHash);
//     expect(res.scriptHash).toBe(expected.scriptHash);
//     expect(res.wif).toBe(expected.wif);
//   });
//   it.each([
//     [
//       '1LvCkqBm4kFwXxqZd9b8aQHADSYyY5zx6P',
//       'bitcoin',
//       'ba91d2bd9c2b79893859cf3066e9cc8710a528a4ae6d6df9cd3733a57a9e447c'
//     ],
//     [
//       'n4XP6YwVHNCJ74ResGk7xq3CBhYqJc9Bnj',
//       'bitcoinTestnet',
//       '8ac9ba31451fc654d8c1a0266d83f4a2c2197e3cfeec7f45002b0f022cb3441e'
//     ]
//   ])('Test getScriptHash for %p', (param1, param2, expected) => {
//     const res = getScriptHash(param1, param2);
//     expect(res).toBe(expected);
//   });
//   it.each([
//     [
//       {
//         selectedCrypto: 'bitcoin',
//         keyDerivationPath: '84',
//         //this is mnemonic for test
//         mnemonic: 'wrist illness circle evidence accident loan thing mystery output inhale fat rookie'
//       },
//       'xprvA2q8XgFXw2swTGJXa2TJBqmSZmPyUBhzCXndumbPH5ScyipLMMKJp32R7jGSHLJwApTFj8nRp4GkZcdeFqEhfdXU3LYkaz3LwWHZxfSaZqx'
//     ],
//     [
//       {
//         selectedCrypto: 'bitcoinTestnet',
//         keyDerivationPath: '84',
//         //this is mnemonic for test
//         mnemonic: 'wrist illness circle evidence accident loan thing mystery output inhale fat rookie'
//       },
//       'tprv8kUr2PQcA1spigZD2FVbFZDtQcHUtZniwP75j4xGZmgjYfLydmGmcUYwEEBxCMPNgrxut21GkZDDgucQVxja1W9qfzidYTrsBGsGHrdQ1od'
//     ]
//   ])('Test getKeyPair for %p', (param, expected) => {
//     const res = getKeyPairByMnemonic(param);
//     expect(res.toBase58()).toEqual(expected);
//   });
//   it.each([
//     [
//       getKeyPairByMnemonic({
//         selectedCrypto: 'bitcoin',
//         keyDerivationPath: '84',
//         //this is mnemonic for test
//         mnemonic: 'wrist illness circle evidence accident loan thing mystery output inhale fat rookie'
//       }),
//       'bitcoin',
//       'bc1q0vh389f8xtr87jcnt0xhc5sh9c0ahrqwv9kz7j'
//     ],
//     [
//       getKeyPairByMnemonic({
//         selectedCrypto: 'bitcoinTestnet',
//         keyDerivationPath: '84',
//         //this is mnemonic for test
//         mnemonic: 'wrist illness circle evidence accident loan thing mystery output inhale fat rookie'
//       }),
//       'bitcoinTestnet',
//       'tb1q55ddlnqp7spzeskdd82p5sseyqexy67s7esc3g'
//     ]
//   ])('Test getAddress for %p', (param1, param2, expected) => {
//     const res = getAddress(param1, param2, 'bech32');
//     expect(res).toEqual(expected);
//   });
//   it('convertStringToMessage', () => {
//     const rs = convertStringToMessage('HelloWord');
//     expect(JSON.stringify(rs)).toEqual('{"type":"Buffer","data":[72,101,108,108,111,87,111,114,100]}');
//   });
//   it('getByteCount', () => {
//     const msg = convertStringToMessage('HelloWord');
//     const rs = getByteCount({ ['bech32']: 27 }, { ['bech32']: 2 }, msg);

//     expect(rs).toBe(1934);
//   });
// });

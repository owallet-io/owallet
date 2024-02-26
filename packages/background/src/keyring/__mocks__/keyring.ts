import { scrypt } from 'scrypt-js';
import {
  mockKeyStorePbkdf2Ledger,
  mockKeyStorePbkdf2Mnemonic,
  mockKeyStorePbkdf2PrivateKey,
  mockKeyStoreScryptLedger,
  mockKeyStoreScryptMnemonic,
  mockKeyStoreScryptPrivateKey,
  mockKeyStoreSha256Ledger,
  mockKeyStoreSha256Mnemonic,
  mockKeyStoreSha256PrivateKey
} from './keystores';
import { KeyStore } from '../crypto';
import { BIP44HDPath } from '@owallet/types';
import {  CommonCrypto, ScryptParams } from '../types';
import { TypeMockKeyStore } from './types';
export const mockMultiKeyStore: KeyStore[] = [
  mockKeyStorePbkdf2Ledger,
  mockKeyStorePbkdf2Mnemonic,
  mockKeyStorePbkdf2PrivateKey
];

export const mockCoinType = 118;
export const mockChainId = 'Oraichain';
export const mockCoinTypeEth = 60;
export const mockCoinTypeTron = 195;
export const mockChainIdEth = '0x1ae6';
export const mockChainIdTron = 'Tron';
export const mockKvStore = {
  get: jest.fn().mockResolvedValue(undefined),
  set: jest.fn().mockResolvedValue(undefined),
  prefix: jest.fn().mockReturnValue('keyring')
};
export const mockEmbedChain: any = null;
export const mockMultiKeyStoreInfo = [
  {
    version: '1.2',
    type: 'ledger',
    addresses: { cosmos: 'cosmos1eu2ecyzedvkvsfcd5vfht4whgx3uf22fjj9a4n' },
    meta: { name: 'orai', __id__: '1' },
    coinTypeForChain: {},
    bip44HDPath: {
      coinType: mockCoinType,
      account: 0,
      change: 0,
      addressIndex: 0
    },
    selected: false
  },
  {
    version: '1.2',
    type: 'mnemonic',
    addresses: undefined,
    meta: { name: 'orai', __id__: '1' },
    coinTypeForChain: {},
    bip44HDPath: {
      coinType: mockCoinType,
      account: 0,
      change: 0,
      addressIndex: 0
    },
    selected: false
  },
  {
    version: '1.2',
    type: 'privateKey',
    addresses: undefined,
    meta: { name: 'orai', __id__: '1' },
    coinTypeForChain: {},
    bip44HDPath: {
      coinType: mockCoinType,
      account: 0,
      change: 0,
      addressIndex: 0
    },
    selected: false
  }
];
//key cosmos example
const mockAddressCosmos = 'cosmos1eu2ecyzedvkvsfcd5vfht4whgx3uf22fjj9a4n';
const mnemonicCosmos =
  'sure tragic expand guess girl boy settle pull monster bleak daughter butter';
//add "0x" before privateKeyCosmos
const privateKeyCosmos =
  'ae0e3814fad957fb1fdca450a9795f5e64b46061a8618cc4029fcbbfdf215221';
const publicKeyTest =
  '0407e5b99e7849b4c2f6af0ee7e7f094b8859f1109962ad6e94fa3672fc8003a301c28c6ba894f7a08c3ca761abf39285c46614d7d8727b1ecd67b2c33d1ee81c1';
export const mockKeyCosmos = {
  address: mockAddressCosmos,
  mnemonic: mnemonicCosmos,
  privateKey: privateKeyCosmos,
  privateKeyHex: Buffer.from(privateKeyCosmos, 'hex'),
  publicKey: publicKeyTest,
  publicKeyHex: Buffer.from(publicKeyTest, 'hex')
};
export const mockAddressLedger = {
  cosmos: mockKeyCosmos.address
};
export const mockPassword = '12345678';
export const mockBip44HDPath: BIP44HDPath = {
  coinType: mockCoinType,
  account: 0,
  change: 0,
  addressIndex: 0
};
export const mockEnv = {
  isInternalMsg: true,
  requestInteraction: jest.fn()
};
export const mockPathBip44 = `m/44'/${mockCoinType}'/0'/0/0`;
export const rng = (array) => {
  return Promise.resolve(crypto.getRandomValues(array));
};
export const mockRng = jest.fn().mockImplementation(rng);
export const mockKdfMobile = 'pbkdf2';
export const mockKdfExtension = 'scrypt';
export const mockMeta = { name: 'orai' };
export const mockMetaHasId = { ...mockMeta, __id__: '1' };
export const mockCrypto: CommonCrypto = {
  scrypt: async (text: string, params: ScryptParams) => {
    return await scrypt(
      Buffer.from(text),
      Buffer.from(params.salt, 'hex'),
      params.n,
      params.r,
      params.p,
      params.dklen
    );
  }
};

export const mockKeyStore: TypeMockKeyStore = {
  ledger: {
    pbkdf2: mockKeyStorePbkdf2Ledger,
    sha256: mockKeyStoreSha256Ledger,
    scrypt: mockKeyStoreScryptLedger
  },
  mnemonic: {
    pbkdf2: mockKeyStorePbkdf2Mnemonic,
    sha256: mockKeyStoreSha256Mnemonic,
    scrypt: mockKeyStoreScryptMnemonic
  },
  privateKey: {
    pbkdf2: mockKeyStorePbkdf2PrivateKey,
    sha256: mockKeyStoreSha256PrivateKey,
    scrypt: mockKeyStoreScryptPrivateKey
  }
};

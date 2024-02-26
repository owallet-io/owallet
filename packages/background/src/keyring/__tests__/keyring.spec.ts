import {
  mockAddressLedger,
  mockChainId,
  mockChainIdEth,
  mockCoinType,
  mockCoinTypeEth,
  mockPathBip44
} from './../__mocks__/keyring';
import { KeyRing, KeyRingStatus } from '../keyring';
import { LedgerService } from '../../ledger';

import {
  mockBip44HDPath,
  mockCrypto,
  mockKdfMobile,
  mockKeyCosmos,
  mockKeyStore,
  mockMeta,
  mockMetaHasId,
  mockMultiKeyStore,
  mockMultiKeyStoreInfo,
  mockPassword,
  mockRng
} from '../__mocks__/keyring';
import { Crypto, KeyStore } from '../crypto';
import { KeyMultiStoreKey, KeyStoreKey } from '../__mocks__/types';
import { Env, OWalletError } from '@owallet/router';
import { Mnemonic, PrivKeySecp256k1 } from '@owallet/crypto';
import { ChainIdHelper } from '@owallet/cosmos';
jest.mock('@owallet/common', () => {
  return {
    __esModule: true, //    <----- this __esModule: true is important
    ...jest.requireActual<typeof import('@owallet/common')>('@owallet/common')
  };
});
jest.mock('ethereumjs-util', () => {
  return {
    __esModule: true, //    <----- this __esModule: true is important
    ...jest.requireActual<typeof import('ethereumjs-util')>('ethereumjs-util')
  };
});
jest.mock('../../tx', () => {
  return {
    __esModule: true, //    <----- this __esModule: true is important
    ...jest.requireActual<typeof import('../../tx')>('../../tx')
  };
});
jest.mock('@ethereumjs/common', () => {
  return {
    __esModule: true, //    <----- this __esModule: true is important
    ...jest.requireActual<typeof import('@ethereumjs/common')>('@ethereumjs/common')
  };
});
import Common from '@ethereumjs/common';
import { utils } from 'ethers';
import * as tx from '../../tx';
import * as ethUtils from 'ethereumjs-util';
import * as commonOwallet from '@owallet/common';
import { KeyringHelper } from '../utils';
// const commonOwallet = require('@owallet/common');

const helper = require('../../utils/helper');
const mockKvStore = {
  get: jest.fn().mockResolvedValue(undefined),
  set: jest.fn().mockResolvedValue(undefined),
  prefix: jest.fn().mockReturnValue('keyring'),
  type: jest.fn().mockReturnValue('mobile')
};
const mockEmbedChain: any = null;
export let keyRing = new KeyRing(
  mockEmbedChain,
  mockKvStore,
  new LedgerService(null, null, { defaultMode: null }),
  mockRng,
  mockCrypto
);
describe('keyring', () => {
  beforeEach(() => {
    keyRing = new KeyRing(
      mockEmbedChain,
      mockKvStore,
      new LedgerService(null, null, { defaultMode: null }),
      mockRng,
      mockCrypto
    );
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getKeyStoreId', () => {
    it('should return the id of the key store if it exists', () => {
      const result = KeyRing['getKeyStoreId'](mockMultiKeyStore[1]);

      expect(result).toBe(mockMetaHasId.__id__);
    });

    it('should throw an error if the key store id is empty', () => {
      const keyStoreMock: KeyStore = {
        ...mockMultiKeyStore[1],
        meta: {
          __id__: ''
        }
      };
      expect(() => KeyRing['getKeyStoreId'](keyStoreMock)).toThrow("Key store's id is empty");
    });

    it('should throw an error if the key store id is undefined', () => {
      const keyStoreMock: KeyStore = {
        ...mockMultiKeyStore[1],
        meta: {
          __id__: ''
        }
      };
      expect(() => KeyRing['getKeyStoreId'](keyStoreMock)).toThrow("Key store's id is empty");
    });
  });
  describe('getMultiKeyStoreInfo', () => {
    it('should return the correct multiKeyStoreInfo', () => {
      keyRing['multiKeyStore'] = mockMultiKeyStore;
      // Mock keyStore

      keyRing['keyStore'] = mockMultiKeyStore[1];
      // Gọi phương thức getMultiKeyStoreInfo()
      const result = keyRing.getMultiKeyStoreInfo();

      // Kiểm tra kết quả
      expect(result).toEqual([
        { ...mockMultiKeyStoreInfo[0], selected: true },
        { ...mockMultiKeyStoreInfo[1], selected: true },
        { ...mockMultiKeyStoreInfo[2], selected: true }
      ]);
    });
  });
  describe('save', () => {
    it('should save keyStore and multiKeyStore', async () => {
      keyRing['keyStore'] = mockMultiKeyStore[1];
      keyRing['multiKeyStore'] = mockMultiKeyStore;

      // Gọi phương thức save()
      await keyRing.save();

      // Kiểm tra việc gọi kvStore.set với đúng đối số
      expect(mockKvStore.set).toHaveBeenCalledTimes(2);
      expect(mockKvStore.set).toHaveBeenCalledWith(KeyStoreKey, mockMultiKeyStore[1]);
      expect(mockKvStore.set).toHaveBeenCalledWith(KeyMultiStoreKey, mockMultiKeyStore);
    });
  });
  describe('isLocked', () => {
    it('should return true when privateKey, mnemonic, and ledgerPublicKey are null or undefined', () => {
      // Tạo instance của lớp MockIsLocked
      // const instance = new MockIsLocked();

      // Gán giá trị null/undefined cho các thuộc tính
      keyRing['privateKey'] = null;
      keyRing['mnemonic'] = undefined;
      keyRing['ledgerPublicKey'] = null;
      // Gọi phương thức isLocked()
      const result = keyRing.isLocked();

      // Kiểm tra kết quả
      expect(result).toBe(true);
    });

    it('should return false when at least one of privateKey, mnemonic, or ledgerPublicKey has a value', () => {
      // Gán giá trị cho một trong các thuộc tính
      keyRing['privateKey'] = new Uint8Array();
      keyRing['mnemonic'] = mockKeyCosmos.mnemonic;
      keyRing['ledgerPublicKey'] = new Uint8Array();

      // Gọi phương thức isLocked()
      const result = keyRing.isLocked();

      // Kiểm tra kết quả
      expect(result).toBe(false);
    });
  });
  describe('getIncrementalNumber', () => {
    test('should return the correct incremental number', async () => {
      // Mock kvStore
      // Gọi hàm getIncrementalNumber và kiểm tra kết quả
      const result = await keyRing['getIncrementalNumber']();
      // Kiểm tra kết quả trả về
      expect(result).toBe(1);
      // Kiểm tra các mock function được gọi đúng số lần và với đúng đối số
      expect(mockKvStore.get).toHaveBeenCalledTimes(1);
      expect(mockKvStore.get).toHaveBeenCalledWith('incrementalNumber');
      expect(mockKvStore.set).toHaveBeenCalledTimes(1);
      expect(mockKvStore.set).toHaveBeenCalledWith('incrementalNumber', 1);
    });

    test('should return the correct incremental number when it already exists', async () => {
      // Mock kvStore
      const kvStore = {
        get: jest.fn().mockResolvedValue(5),
        set: jest.fn().mockResolvedValue(undefined),
        prefix: jest.fn().mockReturnValue('')
      };
      Object.defineProperty(keyRing, 'kvStore', {
        value: kvStore,
        writable: true
      });
      // Gọi hàm getIncrementalNumber và kiểm tra kết quả
      const result = await keyRing['getIncrementalNumber']();
      // Kiểm tra kết quả trả về
      expect(result).toBe(6);
      // Kiểm tra các mock function được gọi đúng số lần và với đúng đối số
      expect(kvStore.get).toHaveBeenCalledTimes(1);
      expect(kvStore.get).toHaveBeenCalledWith('incrementalNumber');
      expect(kvStore.set).toHaveBeenCalledTimes(1);
      expect(kvStore.set).toHaveBeenCalledWith('incrementalNumber', 6);
    });
  });
  describe('assignKeyStoreIdMeta', () => {
    test('should call getIncrementalNumber and return the modified meta object', async () => {
      // Mock implementation cho getIncrementalNumber
      const getIncrementalNumberSpy = jest.spyOn(keyRing as any, 'getIncrementalNumber').mockResolvedValue('1');

      // Gọi hàm assignKeyStoreIdMeta
      const result = await keyRing['assignKeyStoreIdMeta'](mockMeta);

      // Kiểm tra xem getIncrementalNumber đã được gọi
      expect(getIncrementalNumberSpy).toHaveBeenCalled();
      expect(getIncrementalNumberSpy).toHaveBeenCalledTimes(1);
      // Kiểm tra xem kết quả trả về là đúng
      expect(result).toEqual({
        ...mockMeta,
        __id__: '1'
      });
    });
  });

  describe('status', () => {
    it('should return KeyRingStatus.NOTLOADED when loaded is false', () => {
      // Monkey patch the loaded property
      Object.defineProperty(keyRing, 'loaded', {
        value: false,
        writable: true
      });
      // Gọi phương thức status
      const result = keyRing.status;
      // Kiểm tra kết quả
      expect(result).toBe(KeyRingStatus.NOTLOADED);
    });

    it('should return KeyRingStatus.EMPTY when keyStore is null', () => {
      // Gán giá trị null cho thuộc tính keyStore
      Object.defineProperty(keyRing, 'keyStore', {
        value: null,
        writable: true
      });
      // Monkey patch the loaded property
      Object.defineProperty(keyRing, 'loaded', {
        value: true,
        writable: true
      });

      // Gọi phương thức status
      const result = keyRing.status;
      // Kiểm tra kết quả
      expect(result).toBe(KeyRingStatus.EMPTY);
    });

    it('should return KeyRingStatus.UNLOCKED when keyRing.isLocked() returns false', () => {
      // Gán giá trị cho thuộc tính keyStore
      Object.defineProperty(keyRing, 'keyStore', {
        value: mockKeyStore.mnemonic.pbkdf2,
        writable: true
      });
      // Monkey patch the loaded property
      Object.defineProperty(keyRing, 'loaded', {
        value: true,
        writable: true
      });

      // Mock keyRing.isLocked() để trả về false
      jest.spyOn(keyRing, 'isLocked').mockReturnValue(false);

      // Gọi phương thức status
      const result = keyRing.status;
      // Kiểm tra kết quả
      expect(result).toBe(KeyRingStatus.UNLOCKED);
    });

    it('should return KeyRingStatus.LOCKED when all conditions are false', () => {
      // Gán giá trị cho thuộc tính keyStore
      Object.defineProperty(keyRing, 'keyStore', {
        value: mockKeyStore.mnemonic.pbkdf2,
        writable: true
      });
      // Monkey patch the loaded property
      Object.defineProperty(keyRing, 'loaded', {
        value: true,
        writable: true
      });
      // Mock MockIsLocked.isLocked() để trả về true
      jest.spyOn(keyRing, 'isLocked').mockReturnValue(true);

      // Gọi phương thức status
      const result = keyRing.status;
      // Kiểm tra kết quả
      expect(result).toBe(KeyRingStatus.LOCKED);
    });
  });
  describe('lock', () => {
    it('should lock the key ring if it is unlocked', () => {
      // Arrange
      const spyOnStatus = jest.spyOn(keyRing, 'status', 'get');
      spyOnStatus.mockReturnValue(KeyRingStatus.UNLOCKED);
      Object.defineProperty(keyRing, '_privateKey', {
        value: mockKeyCosmos.privateKeyHex,
        writable: true
      });
      Object.defineProperty(keyRing, '_mnemonic', {
        value: mockKeyCosmos.mnemonic,
        writable: true
      });
      Object.defineProperty(keyRing, '_ledgerPublicKey', {
        value: mockKeyCosmos.publicKeyHex,
        writable: true
      });
      // Monkey patch the password property
      Object.defineProperty(keyRing, 'password', {
        value: mockPassword,
        writable: true
      });
      // Act
      keyRing.lock();
      spyOnStatus.mockReturnValue(KeyRingStatus.LOCKED);
      const password = Reflect.get(keyRing, 'password');

      const mnemonic = Reflect.get(keyRing, 'mnemonic');
      const privateKey = Reflect.get(keyRing, 'privateKey');
      const ledgerPublicKey = Reflect.get(keyRing, 'ledgerPublicKey');

      expect(keyRing.status).toBe(KeyRingStatus.LOCKED);
      expect(mnemonic).toBeUndefined();
      expect(privateKey).toBeUndefined();
      expect(ledgerPublicKey).toBeUndefined();
      expect(password).toBe('');
    });
  });
  describe('getTypeOfKeyStore', () => {
    it('should return "mnemonic" if type is null', () => {
      // Arrange
      const keyStore: Omit<KeyStore, 'crypto'> = {
        ...mockKeyStore.mnemonic.pbkdf2,
        type: null
      };

      // Act
      const result = KeyRing.getTypeOfKeyStore(keyStore);

      // Assert
      expect(result).toBe('mnemonic');
    });

    it('should return the correct type if type is valid', () => {
      // Arrange
      const mnemonicKeyStore: Omit<KeyStore, 'crypto'> = {
        ...mockKeyStore.mnemonic.pbkdf2,
        type: 'mnemonic'
      };

      const privateKeyKeyStore: Omit<KeyStore, 'crypto'> = {
        ...mockKeyStore.mnemonic.pbkdf2,
        type: 'privateKey'
      };

      const ledgerKeyStore: Omit<KeyStore, 'crypto'> = {
        ...mockKeyStore.mnemonic.pbkdf2,
        type: 'ledger'
      };

      // Act
      const mnemonicResult = KeyRing.getTypeOfKeyStore(mnemonicKeyStore);
      const privateKeyResult = KeyRing.getTypeOfKeyStore(privateKeyKeyStore);
      const ledgerResult = KeyRing.getTypeOfKeyStore(ledgerKeyStore);

      // Assert
      expect(mnemonicResult).toBe('mnemonic');
      expect(privateKeyResult).toBe('privateKey');
      expect(ledgerResult).toBe('ledger');
    });

    it('should throw an error if type is invalid', () => {
      // Arrange
      const invalidKeyStore: Omit<KeyStore, 'crypto'> = {
        ...mockKeyStore.mnemonic.pbkdf2,
        type: 'invalid' as any
      };

      // Act & Assert
      expect(() => KeyRing.getTypeOfKeyStore(invalidKeyStore)).toThrowError('Invalid type of key store');
    });
    describe('type', () => {
      it('should return "none" if keyStore is null or undefined', () => {
        // Arrange
        Object.defineProperty(keyRing, 'keyStore', {
          value: null,
          writable: true
        });
        // Act
        const result = keyRing.type;
        // Assert
        expect(result).toBe('none');
      });

      it('should return the correct type if keyStore is not null or undefined', () => {
        // Arrange
        const mnemonicKeyStore: Omit<KeyStore, 'crypto'> = {
          ...mockKeyStore.mnemonic.pbkdf2,
          type: 'mnemonic'
        };
        const privateKeyKeyStore: Omit<KeyStore, 'crypto'> = {
          ...mockKeyStore.privateKey.pbkdf2,
          type: 'privateKey'
        };
        const ledgerKeyStore: Omit<KeyStore, 'crypto'> = {
          ...mockKeyStore.ledger.pbkdf2,
          type: 'ledger'
        };
        Object.defineProperty(keyRing, 'keyStore', {
          value: mnemonicKeyStore,
          writable: true
        });
        const result1 = keyRing.type;
        expect(result1).toBe('mnemonic');
        Object.defineProperty(keyRing, 'keyStore', {
          value: privateKeyKeyStore,
          writable: true
        });
        const result2 = keyRing.type;
        expect(result2).toBe('privateKey');
        Object.defineProperty(keyRing, 'keyStore', {
          value: ledgerKeyStore,
          writable: true
        });
        const result3 = keyRing.type;
        expect(result3).toBe('ledger');
      });
    });
  });
  describe('unlock', () => {
    it('should throw an error if keyStore is not initialized', async () => {
      // Arrange
      Object.defineProperty(keyRing, 'keyStore', {
        value: null,
        writable: true
      });

      // Act and Assert
      await expect(keyRing.unlock(mockPassword)).rejects.toThrow('Key ring not initialized');
    });

    it('should decrypt and set mnemonic if keyStore type is "mnemonic"', async () => {
      jest.spyOn(Crypto, 'decrypt').mockResolvedValue(Buffer.from(mockKeyCosmos.mnemonic));
      // Arrange
      Object.defineProperty(keyRing, 'keyStore', {
        value: mockKeyStore.mnemonic.pbkdf2,
        writable: true
      });
      const spySetMnemonic = jest.spyOn(keyRing as any, 'mnemonic', 'set');
      // Act
      await keyRing.unlock(mockPassword);
      const mnemonic = Reflect.get(keyRing, 'mnemonic');
      const passwordReflect = Reflect.get(keyRing, 'password');

      // Assert
      expect(mnemonic).toBe(mockKeyCosmos.mnemonic);
      expect(passwordReflect).toBe(mockPassword);
    });

    it('should decrypt and set privateKey if keyStore type is "privateKey"', async () => {
      jest.spyOn(Crypto, 'decrypt').mockResolvedValue(Buffer.from(mockKeyCosmos.privateKey));
      // Arrange
      Object.defineProperty(keyRing, 'keyStore', {
        value: mockKeyStore.privateKey.pbkdf2,
        writable: true
      });
      const spySetPrivateKey = jest.spyOn(keyRing as any, 'privateKey', 'set');
      // Act
      await keyRing.unlock(mockPassword);
      const privateKey = Reflect.get(keyRing, 'privateKey');
      const passwordReflect = Reflect.get(keyRing, 'password');

      // Assert
      expect(spySetPrivateKey).toHaveBeenCalled();
      expect(spySetPrivateKey).toBeCalledTimes(1);
      expect(Crypto.decrypt).toHaveBeenCalledWith(mockCrypto, mockKeyStore.privateKey.pbkdf2, mockPassword);
      expect(privateKey.toString('hex')).toBe(mockKeyCosmos.privateKey);
      expect(passwordReflect).toBe(mockPassword);
    });

    it('should decrypt and set ledgerPublicKey if keyStore type is "ledger"', async () => {
      jest.spyOn(Crypto, 'decrypt').mockResolvedValue(Buffer.from(mockKeyCosmos.publicKey));
      // Arrange
      Object.defineProperty(keyRing, 'keyStore', {
        value: mockKeyStore.ledger.pbkdf2,
        writable: true
      });
      const spySetLedgerPublicKey = jest.spyOn(keyRing as any, 'ledgerPublicKey', 'set');
      // Act
      await keyRing.unlock(mockPassword);
      const ledgerPublicKey = Reflect.get(keyRing, 'ledgerPublicKey');
      const passwordReflect = Reflect.get(keyRing, 'password');

      // Assert
      expect(spySetLedgerPublicKey).toHaveBeenCalled();
      expect(spySetLedgerPublicKey).toBeCalledTimes(1);
      expect(Crypto.decrypt).toHaveBeenCalledWith(mockCrypto, mockKeyStore.ledger.pbkdf2, mockPassword);
      expect(ledgerPublicKey.toString('hex')).toBe(mockKeyCosmos.publicKey);
      expect(passwordReflect).toBe(mockPassword);
    });
  });
  describe('CreateMnemonicKeyStore', () => {
    it('should call Crypto.encrypt with the correct arguments', async () => {
      // Gọi hàm CreateMnemonicKeyStore
      jest.spyOn(Crypto, 'encrypt');
      await KeyRing['CreateMnemonicKeyStore'](
        mockRng,
        mockCrypto,
        mockKdfMobile,
        mockKeyCosmos.mnemonic,
        mockPassword,
        mockMetaHasId,
        mockBip44HDPath
      );
      // Kiểm tra xem Crypto.encrypt đã được gọi với đúng các tham số
      expect(Crypto.encrypt).toHaveBeenCalled();
      expect(Crypto.encrypt).toHaveBeenCalledTimes(1);
      expect(Crypto.encrypt).toHaveBeenCalledWith(
        mockRng,
        mockCrypto,
        mockKdfMobile,
        'mnemonic',
        mockKeyCosmos.mnemonic,
        mockPassword,
        mockMetaHasId,
        mockBip44HDPath
      );
    });
  });
  describe('CreateLedgerKeyStore', () => {
    beforeEach(() => {
      jest.spyOn(Crypto, 'encrypt').mockClear();
    });

    it('should call Crypto.encrypt with the correct arguments', async () => {
      await KeyRing['CreateLedgerKeyStore'](
        mockRng,
        mockCrypto,
        mockKdfMobile,
        mockKeyCosmos.publicKeyHex,
        mockPassword,
        mockMetaHasId,
        mockBip44HDPath,
        mockAddressLedger
      );
      expect(Crypto.encrypt).toHaveBeenCalled();
      expect(Crypto.encrypt).toHaveBeenCalledTimes(1);
      expect(Crypto.encrypt).toHaveBeenCalledWith(
        mockRng,
        mockCrypto,
        mockKdfMobile,
        'ledger',
        Buffer.from(mockKeyCosmos.publicKeyHex).toString('hex'),
        mockPassword,
        mockMetaHasId,
        mockBip44HDPath,
        mockAddressLedger
      );
    });
  });
  describe('CreatePrivateKeyStore', () => {
    beforeEach(() => {
      jest.spyOn(Crypto, 'encrypt').mockClear();
    });
    it('should call Crypto.encrypt with the correct arguments', async () => {
      // Gọi hàm CreateMnemonicKeyStore
      await KeyRing['CreatePrivateKeyStore'](
        mockRng,
        mockCrypto,
        mockKdfMobile,
        mockKeyCosmos.privateKeyHex,
        mockPassword,
        mockMetaHasId
      );

      // Kiểm tra xem Crypto.encrypt đã được gọi với đúng các tham số
      expect(Crypto.encrypt).toHaveBeenCalledWith(
        mockRng,
        mockCrypto,
        mockKdfMobile,
        'privateKey',
        Buffer.from(mockKeyCosmos.privateKeyHex).toString('hex'),
        mockPassword,
        mockMetaHasId
      );
    });
  });
  describe('createMnemonicKey', () => {
    it('should create mnemonic key and update keyStore and multiKeyStore', async () => {
      // Gán giá trị cho các thuộc tính

      // Mock các phương thức liên quan
      const spyCreateMnemonicKeyStore = jest
        .spyOn(KeyRing as any, 'CreateMnemonicKeyStore')
        .mockResolvedValue(mockMultiKeyStore[1]);

      jest.spyOn(keyRing as any, 'status', 'get').mockReturnValue(KeyRingStatus.UNLOCKED);
      jest.spyOn(keyRing as any, 'getMultiKeyStoreInfo').mockReturnValue(mockMultiKeyStoreInfo);
      jest.spyOn(keyRing, 'save');
      const assignKeyStoreIdMetaSpy = jest.spyOn(keyRing as any, 'assignKeyStoreIdMeta');
      // Gọi phương thức createMnemonicKey()
      const result = await keyRing.createMnemonicKey(
        mockKdfMobile,
        mockKeyCosmos.mnemonic,
        mockPassword,
        mockMeta,
        mockBip44HDPath
      );

      // Kiểm tra kết quả
      expect(result.status).toBe(KeyRingStatus.UNLOCKED);
      expect(result.multiKeyStoreInfo).toEqual(mockMultiKeyStoreInfo);
      expect(keyRing['mnemonic']).toBe(mockKeyCosmos.mnemonic);
      expect(keyRing['keyStore']).toBe(mockMultiKeyStore[1]);
      expect(keyRing['password']).toBe(mockPassword);
      // expect(instance.multiKeyStore).toEqual(mockMultiKeyStore);
      expect(spyCreateMnemonicKeyStore).toHaveBeenCalledWith(
        mockRng,
        mockCrypto,
        mockKdfMobile,
        mockKeyCosmos.mnemonic,
        mockPassword,
        mockMetaHasId,
        mockBip44HDPath
      );
      expect(assignKeyStoreIdMetaSpy).toHaveBeenCalled();
      expect(keyRing.save).toHaveBeenCalled();
    });
  });
  describe('addMnemonicKey', () => {
    it('throw Key ring is locked or not initialized', async () => {
      await expect(() =>
        keyRing.addMnemonicKey(mockKdfMobile, mockKeyCosmos.mnemonic, mockMeta, mockBip44HDPath)
      ).rejects.toThrow(new OWalletError('keyring', 141, 'Key ring is locked or not initialized'));
    });
    it('should add mnemonic key and update keyStore and multiKeyStore', async () => {
      // Mock các phương thức liên quan
      const spyCreateMnemonicKeyStore = jest
        .spyOn(KeyRing as any, 'CreateMnemonicKeyStore')
        .mockResolvedValue(mockMultiKeyStore[1]);
      keyRing['password'] = mockPassword;
      jest.spyOn(keyRing as any, 'getMultiKeyStoreInfo').mockReturnValue(mockMultiKeyStoreInfo);
      jest.spyOn(keyRing, 'save');
      const assignKeyStoreIdMetaSpy = jest.spyOn(keyRing as any, 'assignKeyStoreIdMeta');
      // Gọi phương thức createMnemonicKey()
      const result = await keyRing.addMnemonicKey(mockKdfMobile, mockKeyCosmos.mnemonic, mockMeta, mockBip44HDPath);

      // Kiểm tra kết quả
      expect(result.multiKeyStoreInfo).toEqual(mockMultiKeyStoreInfo);
      expect(keyRing['password']).toBe(mockPassword);
      // expect(instance.multiKeyStore).toEqual(mockMultiKeyStore);
      expect(spyCreateMnemonicKeyStore).toHaveBeenCalledWith(
        mockRng,
        mockCrypto,
        mockKdfMobile,
        mockKeyCosmos.mnemonic,
        mockPassword,
        mockMetaHasId,
        mockBip44HDPath
      );
      expect(assignKeyStoreIdMetaSpy).toHaveBeenCalled();
      expect(keyRing.save).toHaveBeenCalled();
    });
  });
  describe('createPrivateKey', () => {
    it('should create private key and update keyStore and multiKeyStore', async () => {
      // Mock các phương thức liên quan
      const spyCreatePrivateKeyStore = jest
        .spyOn(KeyRing as any, 'CreatePrivateKeyStore')
        .mockResolvedValue(mockMultiKeyStore[2]);

      jest.spyOn(keyRing as any, 'status', 'get').mockReturnValue(KeyRingStatus.UNLOCKED);
      jest.spyOn(keyRing as any, 'getMultiKeyStoreInfo').mockReturnValue(mockMultiKeyStoreInfo);
      jest.spyOn(keyRing, 'save');
      const assignKeyStoreIdMetaSpy = jest.spyOn(keyRing as any, 'assignKeyStoreIdMeta');
      // Gọi phương thức createMnemonicKey()
      const result = await keyRing.createPrivateKey(mockKdfMobile, mockKeyCosmos.privateKeyHex, mockPassword, mockMeta);

      // Kiểm tra kết quả
      expect(result.status).toBe(KeyRingStatus.UNLOCKED);
      expect(result.multiKeyStoreInfo).toEqual(mockMultiKeyStoreInfo);
      expect(keyRing['privateKey']).toBe(mockKeyCosmos.privateKeyHex);
      expect(keyRing['keyStore']).toBe(mockMultiKeyStore[2]);
      expect(keyRing['password']).toBe(mockPassword);
      expect(spyCreatePrivateKeyStore).toHaveBeenCalledWith(
        mockRng,
        mockCrypto,
        mockKdfMobile,
        mockKeyCosmos.privateKeyHex,
        mockPassword,
        mockMetaHasId
      );
      expect(assignKeyStoreIdMetaSpy).toHaveBeenCalled();
      expect(keyRing.save).toHaveBeenCalled();
    });
  });
  describe('addPrivateKey', () => {
    it('throw Key ring is locked or not initialized', async () => {
      await expect(() => keyRing.addPrivateKey(mockKdfMobile, mockKeyCosmos.privateKeyHex, mockMeta)).rejects.toThrow(
        new OWalletError('keyring', 141, 'Key ring is locked or not initialized')
      );
    });
    it('should add private key and update keyStore and multiKeyStore', async () => {
      keyRing['password'] = mockPassword;
      // Mock các phương thức liên quan
      const spyCreatePrivateKeyStore = jest
        .spyOn(KeyRing as any, 'CreatePrivateKeyStore')
        .mockResolvedValue(mockMultiKeyStore[2]);

      jest.spyOn(keyRing as any, 'getMultiKeyStoreInfo').mockReturnValue(mockMultiKeyStoreInfo);
      jest.spyOn(keyRing, 'save');
      const assignKeyStoreIdMetaSpy = jest.spyOn(keyRing as any, 'assignKeyStoreIdMeta');
      // Gọi phương thức createMnemonicKey()
      const result = await keyRing.addPrivateKey(mockKdfMobile, mockKeyCosmos.privateKeyHex, mockMeta);

      // Kiểm tra kết quả

      expect(result.multiKeyStoreInfo).toEqual(mockMultiKeyStoreInfo);
      expect(keyRing['password']).toBe(mockPassword);
      expect(spyCreatePrivateKeyStore).toHaveBeenCalledWith(
        mockRng,
        mockCrypto,
        mockKdfMobile,
        mockKeyCosmos.privateKeyHex,
        mockPassword,
        mockMetaHasId
      );
      expect(assignKeyStoreIdMetaSpy).toHaveBeenCalled();
      expect(keyRing.save).toHaveBeenCalled();
    });
  });
  describe('createLedgerKey', () => {
    it('should create ledger key and update keyStore and multiKeyStore', async () => {
      // Mock các phương thức liên quan
      jest.spyOn(keyRing['ledgerKeeper'], 'getPublicKey').mockResolvedValue({
        publicKey: mockKeyCosmos.publicKeyHex,
        address: mockKeyCosmos.address
      });
      const spyCreateLedgerKeyStore = jest
        .spyOn(KeyRing as any, 'CreateLedgerKeyStore')
        .mockResolvedValue(mockMultiKeyStore[0]);

      jest.spyOn(keyRing as any, 'getMultiKeyStoreInfo').mockReturnValue(mockMultiKeyStoreInfo);
      jest.spyOn(keyRing as any, 'assignKeyStoreIdMeta').mockResolvedValue(mockMetaHasId);
      jest.spyOn(keyRing as any, 'status', 'get').mockReturnValue(KeyRingStatus.UNLOCKED);
      jest.spyOn(keyRing, 'save');
      const mockEnv: Env = {
        isInternalMsg: false,
        requestInteraction: jest.fn()
      };

      // Gọi phương thức createMnemonicKey()
      const result = await keyRing.createLedgerKey(mockEnv, mockKdfMobile, mockPassword, mockMeta, mockBip44HDPath);

      // Kiểm tra kết quả
      expect(result.status).toBe(KeyRingStatus.UNLOCKED);
      expect(result.multiKeyStoreInfo).toEqual(mockMultiKeyStoreInfo);
      expect(keyRing['ledgerPublicKey']).toBe(mockKeyCosmos.publicKeyHex);
      expect(keyRing['keyStore']).toBe(mockMultiKeyStore[0]);
      expect(keyRing['password']).toBe(mockPassword);
    });
  });
  describe('addLedgerKey', () => {
    const mockEnv: Env = {
      isInternalMsg: false,
      requestInteraction: jest.fn()
    };
    it('throw Key ring is locked or not initialized', async () => {
      await expect(() => keyRing.addLedgerKey(mockEnv, mockKdfMobile, mockMeta, mockBip44HDPath)).rejects.toThrow(
        new OWalletError('keyring', 141, 'Error: Key ring is locked or not initialized')
      );
    });
    it('should create ledger key and update keyStore and multiKeyStore', async () => {
      keyRing['password'] = mockPassword;
      // Mock các phương thức liên quan
      jest.spyOn(keyRing['ledgerKeeper'], 'getPublicKey').mockResolvedValue({
        publicKey: mockKeyCosmos.publicKeyHex,
        address: mockKeyCosmos.address
      });
      const spyCreateLedgerKeyStore = jest
        .spyOn(KeyRing as any, 'CreateLedgerKeyStore')
        .mockResolvedValue(mockMultiKeyStore[0]);

      jest.spyOn(keyRing as any, 'getMultiKeyStoreInfo').mockReturnValue(mockMultiKeyStoreInfo);
      jest.spyOn(keyRing as any, 'assignKeyStoreIdMeta').mockResolvedValue(mockMetaHasId);

      jest.spyOn(keyRing, 'save');
      // Gọi phương thức createMnemonicKey()
      const result = await keyRing.addLedgerKey(mockEnv, mockKdfMobile, mockMeta, mockBip44HDPath);

      // Kiểm tra kết quả
      expect(result.multiKeyStoreInfo).toEqual(mockMultiKeyStoreInfo);
      expect(keyRing['password']).toBe(mockPassword);
    });
  });
  describe('showKeyring', () => {
    const mockIndex = 0;
    describe('should to throw err status for showKeyRing method', () => {
      it('check status KeyRingStatus.EMPTY with KeyRingStatus.UNLOCKED', async () => {
        const statusSpy = jest.spyOn(keyRing as any, 'status', 'get').mockReturnValue(KeyRingStatus.EMPTY);

        await expect(keyRing.showKeyRing(mockIndex, mockPassword)).rejects.toThrow('Key ring is not unlocked');
        expect(statusSpy).toHaveBeenCalled();
        expect(statusSpy).toBeCalledTimes(1);
      });
      it('check status KeyRingStatus.LOCKED with KeyRingStatus.UNLOCKED', async () => {
        const statusSpy = jest.spyOn(keyRing as any, 'status', 'get').mockReturnValue(KeyRingStatus.LOCKED);

        await expect(keyRing.showKeyRing(mockIndex, mockPassword)).rejects.toThrow('Key ring is not unlocked');
        expect(statusSpy).toHaveBeenCalled();
        expect(statusSpy).toBeCalledTimes(1);
      });
      it('check status KeyRingStatus.NOTLOADED with KeyRingStatus.UNLOCKED', async () => {
        const statusSpy = jest.spyOn(keyRing as any, 'status', 'get').mockReturnValue(KeyRingStatus.NOTLOADED);

        await expect(keyRing.showKeyRing(mockIndex, mockPassword)).rejects.toThrow('Key ring is not unlocked');
        expect(statusSpy).toHaveBeenCalled();
        expect(statusSpy).toBeCalledTimes(1);
      });
    });
    describe('should to throw err password for showKeyRing method', () => {
      it('check password with password params', async () => {
        const statusSpy = jest.spyOn(keyRing as any, 'status', 'get').mockReturnValue(KeyRingStatus.UNLOCKED);
        Object.defineProperty(keyRing, 'password', {
          value: 'mock pass',
          writable: true
        });
        await expect(keyRing.showKeyRing(mockIndex, mockPassword)).rejects.toThrow('Invalid password');
        expect(statusSpy).toHaveBeenCalled();
        expect(statusSpy).toBeCalledTimes(1);
      });
    });
    describe('should to throw err keyStore for showKeyRing method', () => {
      it('check keyStore null or undefined', async () => {
        const statusSpy = jest.spyOn(keyRing as any, 'status', 'get').mockReturnValue(KeyRingStatus.UNLOCKED);
        Object.defineProperty(keyRing, 'password', {
          value: mockPassword,
          writable: true
        });
        await expect(keyRing.showKeyRing(5, mockPassword)).rejects.toThrow('Empty key store');
        expect(statusSpy).toHaveBeenCalled();
        expect(statusSpy).toBeCalledTimes(1);
      });
    });
    describe('decrypt data follow key store type', () => {
      it('with key store type == mnemonic', async () => {
        const statusSpy = jest.spyOn(keyRing as any, 'status', 'get').mockReturnValue(KeyRingStatus.UNLOCKED);
        Object.defineProperty(keyRing, 'password', {
          value: mockPassword,
          writable: true
        });
        Object.defineProperty(keyRing, 'multiKeyStore', {
          value: mockMultiKeyStore,
          writable: true
        });
        const decryptSpy = jest.spyOn(Crypto, 'decrypt').mockResolvedValue(Buffer.from(mockKeyCosmos.mnemonic));
        const rs = await keyRing.showKeyRing(1, mockPassword);
        expect(rs).toBe(mockKeyCosmos.mnemonic);
        expect(statusSpy).toHaveBeenCalled();
        expect(statusSpy).toBeCalledTimes(1);
        expect(decryptSpy).toHaveBeenCalled();
        expect(decryptSpy).toHaveBeenCalledWith(mockCrypto, mockMultiKeyStore[1], mockPassword);
      });
      it('with key store type == privateKey', async () => {
        const statusSpy = jest.spyOn(keyRing as any, 'status', 'get').mockReturnValue(KeyRingStatus.UNLOCKED);
        Object.defineProperty(keyRing, 'password', {
          value: mockPassword,
          writable: true
        });
        Object.defineProperty(keyRing, 'multiKeyStore', {
          value: mockMultiKeyStore,
          writable: true
        });
        const decryptSpy = jest.spyOn(Crypto, 'decrypt').mockResolvedValue(Buffer.from(mockKeyCosmos.privateKey));
        const rs = await keyRing.showKeyRing(2, mockPassword);
        expect(rs).toBe(mockKeyCosmos.privateKey);
        expect(statusSpy).toHaveBeenCalled();
        expect(statusSpy).toBeCalledTimes(1);
        expect(decryptSpy).toHaveBeenCalled();
        expect(decryptSpy).toHaveBeenCalledWith(mockCrypto, mockMultiKeyStore[2], mockPassword);
      });
      it('with key store type == ledger', async () => {
        const statusSpy = jest.spyOn(keyRing as any, 'status', 'get').mockReturnValue(KeyRingStatus.UNLOCKED);
        Object.defineProperty(keyRing, 'password', {
          value: mockPassword,
          writable: true
        });
        Object.defineProperty(keyRing, 'multiKeyStore', {
          value: mockMultiKeyStore,
          writable: true
        });
        const decryptSpy = jest.spyOn(Crypto, 'decrypt').mockResolvedValue(Buffer.from(mockKeyCosmos.publicKey));
        const rs = await keyRing.showKeyRing(0, mockPassword);
        expect(rs).toBe(mockKeyCosmos.publicKey);
        expect(statusSpy).toHaveBeenCalled();
        expect(statusSpy).toBeCalledTimes(1);
        expect(decryptSpy).toHaveBeenCalled();
        expect(decryptSpy).toHaveBeenCalledWith(mockCrypto, mockMultiKeyStore[0], mockPassword);
      });
    });
  });
  describe('validateBIP44Path', () => {
    test('should throw an error if account is not an integer or is negative', () => {
      expect(() => {
        KeyRing.validateBIP44Path({ ...mockBip44HDPath, account: -1 });
      }).toThrow('Invalid account in hd path');
    });

    test('should throw an error if change is not an integer or is not 0 or 1', () => {
      expect(() => {
        KeyRing.validateBIP44Path({ ...mockBip44HDPath, change: 2 });
      }).toThrow('Invalid change in hd path');

      expect(() => {
        KeyRing.validateBIP44Path({
          ...mockBip44HDPath,
          change: 'invalid'
        } as any);
      }).toThrow('Invalid change in hd path');
    });

    test('should throw an error if addressIndex is not an integer or is negative', () => {
      expect(() => {
        KeyRing.validateBIP44Path({
          ...mockBip44HDPath,
          addressIndex: -1
        });
      }).toThrow('Invalid address index in hd path');

      expect(() => {
        KeyRing.validateBIP44Path({
          ...mockBip44HDPath,
          addressIndex: 1.5
        });
      }).toThrow('Invalid address index in hd path');

      expect(() => {
        KeyRing.validateBIP44Path({
          ...mockBip44HDPath,
          addressIndex: 'invalid'
        } as any);
      }).toThrow('Invalid address index in hd path');
    });

    test('should not throw an error if BIP44 path is valid', () => {
      expect(() => {
        KeyRing.validateBIP44Path(mockBip44HDPath);
      }).not.toThrow();
      expect(() => {
        KeyRing.validateBIP44Path({ account: 1, change: 1, addressIndex: 1 });
      }).not.toThrow();
    });
  });

  describe('getKeyStoreBIP44Path', () => {
    test('should return default BIP44 path if keyStore has no bip44HDPath', () => {
      const result = KeyRing['getKeyStoreBIP44Path']({
        ...mockKeyStore.mnemonic.pbkdf2,
        bip44HDPath: null
      });
      expect(result).toEqual(mockBip44HDPath);
    });

    test('should validate and return the bip44HDPath if it exists in keyStore', () => {
      const keyStore = mockKeyStore.mnemonic.pbkdf2;
      // Mock the validateBIP44Path method
      const mockValidateBIP44Path = jest.spyOn(KeyRing, 'validateBIP44Path');

      const result = KeyRing['getKeyStoreBIP44Path'](mockKeyStore.mnemonic.pbkdf2);

      expect(result).toEqual(keyStore.bip44HDPath);
      expect(mockValidateBIP44Path).toHaveBeenCalledWith(keyStore.bip44HDPath);

      // Restore the original validateBIP44Path method
      mockValidateBIP44Path.mockRestore();
    });
  });
  describe('loadPrivKey', () => {
    test('should throw error when key ring is not unlocked with status = LOCKED', () => {
      Object.defineProperty(keyRing, 'status', {
        value: KeyRingStatus.LOCKED,
        writable: true
      });
      Object.defineProperty(keyRing, 'type', {
        value: 'mnemonic',
        writable: true
      });
      keyRing['keyStore'] = mockKeyStore.mnemonic.pbkdf2;

      expect(() => keyRing['loadPrivKey'](mockCoinType)).toThrow('Key ring is not unlocked');
    });
    test('should throw error when key ring is not unlocked with type === none', () => {
      Object.defineProperty(keyRing, 'status', {
        value: KeyRingStatus.UNLOCKED,
        writable: true
      });
      Object.defineProperty(keyRing, 'type', {
        value: 'none',
        writable: true
      });
      keyRing['keyStore'] = mockKeyStore.mnemonic.pbkdf2;

      expect(() => keyRing['loadPrivKey'](mockCoinType)).toThrow('Key ring is not unlocked');
    });
    test('should throw error when key ring is not unlocked with keyStore === null', () => {
      Object.defineProperty(keyRing, 'status', {
        value: KeyRingStatus.UNLOCKED,
        writable: true
      });
      Object.defineProperty(keyRing, 'type', {
        value: 'mnemonic',
        writable: true
      });
      keyRing['keyStore'] = null;

      expect(() => keyRing['loadPrivKey'](mockCoinType)).toThrow('Key ring is not unlocked');
    });
    test('should not throw error when key ring is not unlocked with keyStore === null', () => {
      Object.defineProperty(keyRing, 'status', {
        value: KeyRingStatus.UNLOCKED,
        writable: true
      });
      Object.defineProperty(keyRing, 'type', {
        value: 'mnemonic',
        writable: true
      });
      keyRing['keyStore'] = mockKeyStore.mnemonic.pbkdf2;

      expect(() => keyRing['loadPrivKey'](mockCoinType)).not.toThrow('Key ring is not unlocked');
    });
    test('loadprivate key with type mnemonic err when not show this.mnemonic', () => {
      Object.defineProperty(keyRing, 'status', {
        value: KeyRingStatus.UNLOCKED,
        writable: true
      });
      Object.defineProperty(keyRing, 'type', {
        value: 'mnemonic',
        writable: true
      });

      keyRing['keyStore'] = mockKeyStore.mnemonic.pbkdf2;
      const spyKeyStoreBip44 = jest
        .spyOn(KeyRing as any, 'getKeyStoreBIP44Path')
        .mockReturnValue(mockKeyStore.mnemonic.pbkdf2);
      expect(() => keyRing['loadPrivKey'](mockCoinType)).toThrow(
        'Key store type is mnemonic and it is unlocked. But, mnemonic is not loaded unexpectedly'
      );
      expect(spyKeyStoreBip44).toHaveBeenCalled();
      jest.clearAllMocks();
    });
    test('loadprivate key with type mnemonic to get private key', () => {
      Object.defineProperty(keyRing, 'status', {
        value: KeyRingStatus.UNLOCKED,
        writable: true
      });
      Object.defineProperty(keyRing, 'type', {
        value: 'mnemonic',
        writable: true
      });
      keyRing['mnemonic'] = mockKeyCosmos.mnemonic;
      keyRing['keyStore'] = mockKeyStore.mnemonic.pbkdf2;
      const spyKeyStoreBip44 = jest
        .spyOn(KeyRing as any, 'getKeyStoreBIP44Path')
        .mockReturnValue(mockKeyStore.mnemonic.pbkdf2.bip44HDPath);
      const spyGenerateWalletFromMnemonic = jest
        .spyOn(Mnemonic as any, 'generateWalletFromMnemonic')
        .mockReturnValue(mockKeyCosmos.privateKeyHex);
      const rs = keyRing['loadPrivKey'](mockCoinType);
      expect(rs).toEqual(new PrivKeySecp256k1(mockKeyCosmos.privateKeyHex));
      expect(spyGenerateWalletFromMnemonic).toHaveBeenCalledTimes(1);
      expect(spyKeyStoreBip44).toHaveBeenCalledTimes(1);
      jest.clearAllMocks();
    });
    test('load private key with type mnemonic have cached key', () => {
      Object.defineProperty(keyRing, 'status', {
        value: KeyRingStatus.UNLOCKED,
        writable: true
      });
      Object.defineProperty(keyRing, 'type', {
        value: 'mnemonic',
        writable: true
      });
      keyRing['mnemonic'] = mockKeyCosmos.mnemonic;
      keyRing['keyStore'] = mockKeyStore.mnemonic.pbkdf2;
      keyRing['cached'].set(mockPathBip44, mockKeyCosmos.privateKeyHex);
      const spyGenerateWalletFromMnemonic = jest.spyOn(Mnemonic as any, 'generateWalletFromMnemonic');
      const spyKeyStoreBip44 = jest
        .spyOn(KeyRing as any, 'getKeyStoreBIP44Path')
        .mockReturnValue(mockKeyStore.mnemonic.pbkdf2.bip44HDPath);
      const rs = keyRing['loadPrivKey'](mockCoinType);
      expect(rs).toEqual(new PrivKeySecp256k1(mockKeyCosmos.privateKeyHex));
      expect(spyGenerateWalletFromMnemonic).not.toHaveBeenCalled();
      expect(spyKeyStoreBip44).toHaveBeenCalledTimes(1);
      jest.clearAllMocks();
    });
    test('loadprivate key with type private key err when not show this.privateKey', () => {
      Object.defineProperty(keyRing, 'status', {
        value: KeyRingStatus.UNLOCKED,
        writable: true
      });
      Object.defineProperty(keyRing, 'type', {
        value: 'privateKey',
        writable: true
      });

      keyRing['keyStore'] = mockKeyStore.mnemonic.pbkdf2;
      const spyKeyStoreBip44 = jest
        .spyOn(KeyRing as any, 'getKeyStoreBIP44Path')
        .mockReturnValue(mockKeyStore.mnemonic.pbkdf2);
      expect(() => keyRing['loadPrivKey'](mockCoinType)).toThrow(
        'Key store type is private key and it is unlocked. But, private key is not loaded unexpectedly'
      );
      expect(spyKeyStoreBip44).toHaveBeenCalled();
      jest.clearAllMocks();
    });
    test('load private key with type private key to get private key', () => {
      Object.defineProperty(keyRing, 'status', {
        value: KeyRingStatus.UNLOCKED,
        writable: true
      });
      Object.defineProperty(keyRing, 'type', {
        value: 'privateKey',
        writable: true
      });
      keyRing['_privateKey'] = mockKeyCosmos.privateKeyHex;
      keyRing['keyStore'] = mockKeyStore.mnemonic.pbkdf2;
      const spyKeyStoreBip44 = jest
        .spyOn(KeyRing as any, 'getKeyStoreBIP44Path')
        .mockReturnValue(mockKeyStore.mnemonic.pbkdf2.bip44HDPath);
      const rs = keyRing['loadPrivKey'](mockCoinType);
      expect(rs).toEqual(new PrivKeySecp256k1(mockKeyCosmos.privateKeyHex));
      expect(spyKeyStoreBip44).toHaveBeenCalledTimes(1);
      jest.clearAllMocks();
    });
    test('load private key with type private key err when Unexpected type of keyring', () => {
      Object.defineProperty(keyRing, 'status', {
        value: KeyRingStatus.UNLOCKED,
        writable: true
      });
      Object.defineProperty(keyRing, 'type', {
        value: 'invalid',
        writable: true
      });

      keyRing['keyStore'] = mockKeyStore.mnemonic.pbkdf2;
      const spyKeyStoreBip44 = jest
        .spyOn(KeyRing as any, 'getKeyStoreBIP44Path')
        .mockReturnValue(mockKeyStore.mnemonic.pbkdf2);
      expect(() => keyRing['loadPrivKey'](mockCoinType)).toThrow('Unexpected type of keyring');
      expect(spyKeyStoreBip44).toHaveBeenCalled();
      jest.clearAllMocks();
    });
  });
  describe('loadKey', () => {
    it('test case this.status !== KeyRingStatus.UNLOCKED', () => {
      Object.defineProperty(keyRing, 'status', {
        value: KeyRingStatus.LOCKED,
        writable: true
      });
      expect(() => keyRing['loadKey'](mockCoinType)).toThrow('Key ring is not unlocked');
    });
    it('test for case this.keyStore is null', () => {
      Object.defineProperty(keyRing, 'status', {
        value: KeyRingStatus.UNLOCKED,
        writable: true
      });
      expect(() => keyRing['loadKey'](mockCoinType)).not.toThrow('Key ring is not unlocked');
      expect(() => keyRing['loadKey'](mockCoinType)).toThrow('Key Store is empty');
    });
    describe('test for case this.keyStore.type === ledger', () => {
      it('test throw for this.ledgerPublicKey is null', () => {
        Object.defineProperty(keyRing, 'status', {
          value: KeyRingStatus.UNLOCKED,
          writable: true
        });
        keyRing['keyStore'] = mockKeyStore.ledger.pbkdf2;
        expect(() => keyRing['loadKey'](mockCoinType)).not.toThrow('Key ring is not unlocked');
        expect(() => keyRing['loadKey'](mockCoinType)).not.toThrow('Key Store is empty');
        expect(() => keyRing['loadKey'](mockCoinType)).toThrow('Ledger public key not set');
      });
      it('test case for ledgerPublicKey is not null', async () => {
        Object.defineProperty(keyRing, 'status', {
          value: KeyRingStatus.UNLOCKED,
          writable: true
        });
        keyRing['keyStore'] = mockKeyStore.ledger.pbkdf2;
        keyRing['ledgerPublicKey'] = mockKeyCosmos.publicKeyHex;
        const rs = await keyRing['loadKey'](mockCoinType);
        expect(Buffer.from(rs.pubKey).toString('hex')).toBe(
          '0307e5b99e7849b4c2f6af0ee7e7f094b8859f1109962ad6e94fa3672fc8003a30'
        );
        expect(Buffer.from(rs.address).toString('hex')).toBe('2a77016e89454aa2b15ae84757e32b75549af840');
        expect(rs.algo).toBe('secp256k1');
        expect(rs.isNanoLedger).toBe(true);
      });
    });
    describe('test case for this.keyStore.type !== ledger', () => {
      it('test for case network type is cosmos', async () => {
        Object.defineProperty(keyRing, 'status', {
          value: KeyRingStatus.UNLOCKED,
          writable: true
        });
        keyRing['keyStore'] = mockKeyStore.mnemonic.pbkdf2;
        keyRing['mnemonic'] = mockKeyCosmos.mnemonic;
        const spyLoadPrivKey = jest.spyOn(keyRing as any, 'loadPrivKey');
        const rs = await keyRing['loadKey'](mockCoinType, mockChainId);
        expect(spyLoadPrivKey).toHaveBeenCalledWith(mockCoinType, 'Oraichain');
        expect(rs.algo).toBe('secp256k1');
        expect(rs.isNanoLedger).toBe(false);
        expect(Buffer.from(rs.pubKey).toString('hex')).toBe(
          '034644745b16ab5f10df09f1a9734736e0598e217a1987ab3b2205ce9e2899590c'
        );
        expect(Buffer.from(rs.address).toString('hex')).toBe('cf159c10596b2cc8270da31375d5d741a3c4a949');
      });
      it('test for case network type is evm', async () => {
        Object.defineProperty(keyRing, 'status', {
          value: KeyRingStatus.UNLOCKED,
          writable: true
        });
        keyRing['keyStore'] = {
          ...mockKeyStore.mnemonic.pbkdf2,
          bip44HDPath: {
            ...mockKeyStore.mnemonic.pbkdf2.bip44HDPath,
            coinType: mockCoinTypeEth
          }
        };
        keyRing['mnemonic'] = mockKeyCosmos.mnemonic;
        const spyLoadPrivKey = jest.spyOn(keyRing as any, 'loadPrivKey');
        const rs = await keyRing['loadKey'](mockCoinTypeEth, mockChainIdEth);
        expect(spyLoadPrivKey).toHaveBeenCalledWith(mockCoinTypeEth, '0x1ae6');
        expect(rs.algo).toBe('ethsecp256k1');
        expect(rs.isNanoLedger).toBe(false);
        expect(Buffer.from(rs.pubKey).toString('hex')).toBe(
          '034644745b16ab5f10df09f1a9734736e0598e217a1987ab3b2205ce9e2899590c'
        );
        expect(Buffer.from(rs.address).toString('hex')).toBe('a7942620580e6b7940518d90b0f7aaea2f6a9f73');
      });
    });
  });
  describe('deleteKeyRing', () => {
    beforeEach(() => {
      Object.defineProperty(keyRing, 'status', {
        value: KeyRingStatus.UNLOCKED,
        writable: true
      });
      keyRing['password'] = mockPassword;
      keyRing['multiKeyStore'] = mockMultiKeyStore;
    });
    it('test throw err for Key ring is not unlocked', async () => {
      Object.defineProperty(keyRing, 'status', {
        value: KeyRingStatus.LOCKED,
        writable: true
      });
      await expect(() => keyRing.deleteKeyRing(1, mockPassword)).rejects.toThrow('Key ring is not unlocked');
    });
    it('test throw err for Key ring password not compare', async () => {
      keyRing['password'] = 'test';
      await expect(() => keyRing.deleteKeyRing(1, mockPassword)).rejects.toThrow('Invalid password');
    });
    it('test throw err for Key store is null', async () => {
      await expect(() => keyRing.deleteKeyRing(3, mockPassword)).rejects.toThrow('Empty key store');
    });
    describe('check this.keyStore', () => {
      it('check KeyRing.getKeyStoreId(keyStore) === KeyRing.getKeyStoreId(this.keyStore) and multiKeyStore.length > 0', async () => {
        keyRing['keyStore'] = mockMultiKeyStore[1];
        const spyCryptoDecrypt = jest.spyOn(Crypto, 'decrypt');
        const spyKeyringGetKeyStoreId = jest.spyOn(KeyRing as any, 'getKeyStoreId');
        const spyLock = jest.spyOn(keyRing, 'lock');
        const spyUnLock = jest.spyOn(keyRing, 'unlock');
        const spySave = jest.spyOn(keyRing, 'save');
        const spyGetMultiKeyStoreInfo = jest.spyOn(keyRing, 'getMultiKeyStoreInfo');
        const rs = await keyRing.deleteKeyRing(1, mockPassword);
        expect(spyCryptoDecrypt).toHaveBeenCalledWith(mockCrypto, mockMultiKeyStore[1], mockPassword);
        expect(spyCryptoDecrypt).toHaveBeenCalled();
        expect(spyCryptoDecrypt).toHaveBeenCalledTimes(2);
        expect(spyKeyringGetKeyStoreId).toHaveBeenCalledWith(mockMultiKeyStore[1]);
        expect(spyKeyringGetKeyStoreId).toHaveBeenCalled();
        expect(spyKeyringGetKeyStoreId).toHaveBeenCalledTimes(6);
        expect(spyUnLock).toHaveBeenCalledWith(mockPassword);
        expect(spyUnLock).toHaveBeenCalled();
        expect(spyUnLock).toHaveBeenCalledTimes(1);

        expect(spyLock).toHaveBeenCalled();
        expect(spyLock).toHaveBeenCalledTimes(1);
        expect(spySave).toHaveBeenCalled();
        expect(spySave).toHaveBeenCalledTimes(1);
        expect(spyGetMultiKeyStoreInfo).toHaveBeenCalled();
        expect(spyGetMultiKeyStoreInfo).toHaveBeenCalledTimes(1);

        expect(rs.keyStoreChanged).toBe(true);
        expect(rs.multiKeyStoreInfo).toEqual(keyRing.getMultiKeyStoreInfo());
      });
      it('check KeyRing.getKeyStoreId(keyStore) === KeyRing.getKeyStoreId(this.keyStore) and multiKeyStore.length <= 0', async () => {
        keyRing['keyStore'] = mockMultiKeyStore[1];
        keyRing['multiKeyStore'] = [mockMultiKeyStore[1]];
        const spySave = jest.spyOn(keyRing, 'save');
        const spyGetMultiKeyStoreInfo = jest.spyOn(keyRing, 'getMultiKeyStoreInfo');
        const rs = await keyRing.deleteKeyRing(0, mockPassword);
        expect(rs.keyStoreChanged).toBe(true);
        expect(rs.multiKeyStoreInfo).toEqual([]);
        expect(spySave).toHaveBeenCalled();
        expect(spySave).toHaveBeenCalledTimes(1);
        expect(spyGetMultiKeyStoreInfo).toHaveBeenCalled();
        expect(spyGetMultiKeyStoreInfo).toHaveBeenCalledTimes(1);
      });
    });
    it('check this.keyStore is null', async () => {
      keyRing['multiKeyStore'] = mockMultiKeyStore;
      const spySave = jest.spyOn(keyRing, 'save');
      const spyGetMultiKeyStoreInfo = jest.spyOn(keyRing, 'getMultiKeyStoreInfo');
      const rs = await keyRing.deleteKeyRing(1, mockPassword);
      expect(rs.keyStoreChanged).toBe(false);
      expect(rs.multiKeyStoreInfo).toEqual([mockMultiKeyStoreInfo[0], mockMultiKeyStoreInfo[2]]);
      expect(spySave).toHaveBeenCalled();
      expect(spySave).toHaveBeenCalledTimes(1);
      expect(spyGetMultiKeyStoreInfo).toHaveBeenCalled();
      expect(spyGetMultiKeyStoreInfo).toHaveBeenCalledTimes(1);
    });
  });
  describe('getKeyFromCoinType', () => {
    it('getKeyFrom by coin type', () => {
      Object.defineProperty(keyRing, 'status', {
        value: KeyRingStatus.UNLOCKED,
        writable: true
      });
      keyRing['keyStore'] = mockMultiKeyStore[1];
      keyRing['mnemonic'] = mockKeyCosmos.mnemonic;
      const rs = keyRing.getKeyFromCoinType(mockCoinType);
      expect(Buffer.from(rs.address).toString('hex')).toBe('cf159c10596b2cc8270da31375d5d741a3c4a949');
      expect(Buffer.from(rs.pubKey).toString('hex')).toBe(
        '034644745b16ab5f10df09f1a9734736e0598e217a1987ab3b2205ce9e2899590c'
      );
      expect(rs.algo).toBe('secp256k1');
      expect(rs.isNanoLedger).toBe(false);
    });
  });
  describe('computeKeyStoreCoinType', () => {
    it('Throw err when this.keyStore is null', () => {
      expect(() => keyRing.computeKeyStoreCoinType(mockChainId, mockCoinType)).toThrow('Key Store is empty');
    });
    it('get data return from computeKeyStoreCoinType', () => {
      keyRing['keyStore'] = mockKeyStore.mnemonic.pbkdf2;
      const spyChainIdHelperParse = jest.spyOn(ChainIdHelper, 'parse');
      const rs = keyRing.computeKeyStoreCoinType(mockChainId, mockCoinType);

      expect(rs).toBe(mockCoinType);
      expect(spyChainIdHelperParse).toHaveBeenCalled();
      expect(spyChainIdHelperParse).toHaveBeenCalledTimes(1);
      expect(spyChainIdHelperParse).toHaveBeenCalledWith(mockChainId);
    });
  });
  describe('getKey', () => {
    it('return data from getKey method', () => {
      Object.defineProperty(keyRing, 'status', {
        value: KeyRingStatus.UNLOCKED,
        writable: true
      });
      keyRing['keyStore'] = mockKeyStore.mnemonic.pbkdf2;
      keyRing['mnemonic'] = mockKeyCosmos.mnemonic;
      const rs = keyRing.getKey(mockChainId, mockCoinType);
      expect(Buffer.from(rs.address).toString('hex')).toBe('cf159c10596b2cc8270da31375d5d741a3c4a949');
      expect(Buffer.from(rs.pubKey).toString('hex')).toBe(
        '034644745b16ab5f10df09f1a9734736e0598e217a1987ab3b2205ce9e2899590c'
      );
      expect(rs.algo).toBe('secp256k1');
      expect(rs.isNanoLedger).toBe(false);
    });
  });
  describe('getKeyStoreMeta', () => {
    it('this.keyStore is null', () => {
      keyRing['keyStore'] = null;
      const rs = keyRing.getKeyStoreMeta('name');
      expect(rs).toBe('');
    });
    it('this.keyStore.meta is null', () => {
      keyRing['keyStore'] = { ...mockKeyStore.mnemonic.pbkdf2, meta: null };
      const rs = keyRing.getKeyStoreMeta('name');
      expect(rs).toBe('');
    });
    it('this.keyStore is not null', () => {
      keyRing['keyStore'] = mockKeyStore.mnemonic.pbkdf2;
      const rs = keyRing.getKeyStoreMeta('name');
      expect(rs).toBe('orai');
    });
  });

  describe('signEvm', () => {
    it('sign Ethereum', async () => {
      const message = Buffer.from('c429601ee7a6167356f15baa70fd8fe17b0325dab7047a658a31039e5384bffd', 'hex');
      const privKey = new PrivKeySecp256k1(
        Buffer.from('ae0e3814fad957fb1fdca450a9795f5e64b46061a8618cc4029fcbbfdf215221', 'hex')
      );
      const rs = await keyRing['signEthereum'](privKey, message);
      expect(Buffer.from(rs).toString('hex')).toEqual(
        '1483463727ddf1f5330cb2e480bf24c9d27140a909e789effae36bb0684bd1d33c79bb0aa5d4e9dcf48ae8946395e2d5bcddd8c70853d73193f48820f37a6cda'
      );
    });
    it('sign Tron', () => {
      const mockPrivBytes = new Uint8Array([
        102, 211, 219, 188, 242, 151, 77, 32, 6, 123, 231, 231, 198, 171, 27, 148, 18, 123, 5, 164, 128, 2, 123, 110,
        35, 223, 224, 102, 141, 222, 136, 126
      ]);
      const mockPrivKey: any = {
        toBytes: jest.fn().mockReturnValue(mockPrivBytes)
      };
      const mockMsg = '8f87082466466dbbb310a62c5cb4c66df42b5eb142aaeb9b8ab90add6b617dcb';
      const rs = keyRing.signTron(mockPrivKey, mockMsg as any);
      expect(rs.toString('hex')).toBe(
        '3e2481506aa8c56c5567868501288fa55fd7f3c9891a735ca196076491879612c06dea26c21f2b33a69d7b21aaaadc37c9a1c9b225fdb62a22a733a69b79a78f01'
      );
    });
  });
  describe('signEvm', () => {
    const mockMsg = {
      to: '0xf2846a1E4dAFaeA38C1660a618277d67605bd2B5',
      value: '0x9184e72a000',
      gas: '0x30d40',
      gasPrice: '0x2540be400',
      gasLimit: '0x30d40',
      memo: '',
      fees: '0x0'
    };
    const mockPrivBytes = new Uint8Array([
      102, 211, 219, 188, 242, 151, 77, 32, 6, 123, 231, 231, 198, 171, 27, 148, 18, 123, 5, 164, 128, 2, 123, 110, 35,
      223, 224, 102, 141, 222, 136, 126
    ]);
    const mockPrivKey: any = {
      toBytes: jest.fn().mockReturnValue(mockPrivBytes)
    };
    const arrayEvm = commonOwallet.EmbedChainInfos.filter((item, index) => item.networkType === 'evm');
    const arrayMapped = [...arrayEvm].map((item) => {
      if (item.chainId === '0x1ae6') {
        (item as any).expected = 6886;
      } else if (item.chainId === '0x61') {
        (item as any).expected = 97;
      } else if (item.chainId === '0x01') {
        (item as any).expected = 1;
      } else if (item.chainId === '0x38') {
        (item as any).expected = 56;
      } else if (item.chainId === '0x2b6653dc') {
        (item as any).expected = 728126428;
      }
      return item;
    });
    it.each(arrayMapped)('Test validateChainId for $chainName', (item) => {
      const rs = KeyringHelper.validateChainId(item.chainId);
      expect(rs).toBe((item as any).expected);
    });

    it('getHexAddressEvm', () => {
      const rs = KeyringHelper.getHexAddressEvm(mockPrivKey);
      expect(rs).toEqual(['0xad90317473bbc13ba0c9e81d21131fce289078fe', 'latest']);
    });

    const arrayRawTxEvm = [...arrayEvm].map((ite) => {
      if (ite.chainId === '0x1ae6') {
        (ite as any).expectedRaw =
          '0xf86d308502540be40083030d4094f2846a1e4dafaea38c1660a618277d67605bd2b58609184e72a000808235f0a07a624db8c17df50610ffd72716ff41bc5837b66102f75328f89128586b065c21a076846c63bc26103d80a1f1c191403a27bf2f6694041c258eb426b90d9f0cfb9d';
      } else if (ite.chainId === '0x61') {
        (ite as any).expectedRaw =
          '0xf86c308502540be40083030d4094f2846a1e4dafaea38c1660a618277d67605bd2b58609184e72a0008081e6a0acf8b7493d7bdcca9caf06bab0de2cbf26bdb0cc60bad24fe6679eb18600e06fa04f91e45a6e8b96a55bcb66f0beb41b0d64c3ea9078d36f84bde4359c0c75672c';
      } else if (ite.chainId === '0x01') {
        (ite as any).expectedRaw =
          '0xf86b308502540be40083030d4094f2846a1e4dafaea38c1660a618277d67605bd2b58609184e72a0008025a0a0a6d557107b3d383bccf8e5a2ccd6ebb6288e3b43c1ca07fbc683f0bb6f5305a013950cbc28c7306c9ff0b60bbc0d256d111c85444f769b3f42e90dd271d3fef5';
      } else if (ite.chainId === '0x38') {
        (ite as any).expectedRaw =
          '0xf86c308502540be40083030d4094f2846a1e4dafaea38c1660a618277d67605bd2b58609184e72a000808194a0ade0f7e049273d8bd4ccbf0ad555f8051082fa0f064394285f9390c2dffe8f0ea01980793829a02fc090a7d3a4d4f3859fdaac3d025aecaf4e2224516191f2a44a';
      } else if (ite.chainId === '0x2b6653dc') {
        (ite as any).expectedRaw =
          '0xf86f308502540be40083030d4094f2846a1e4dafaea38c1660a618277d67605bd2b58609184e72a000808456cca7dba0435cda0530d3ffbf5e1b4dc22c6c316ed6a584868d4c7817fee0a542949af8daa0408b4758f2f6cc32de1adbf81388333e2ffe4d6b97c53271f17341ec0ec791bd';
      }
      return ite;
    });

    it.each(arrayRawTxEvm)('getRawTxEvm for chain: $chainName', (item) => {
      const rs = KeyringHelper.getRawTxEvm(mockPrivKey, item.chainId, '0x30', mockMsg);
      expect(rs).toBe((item as any).expectedRaw);
    });
  });
});

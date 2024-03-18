import {
  mockAddressLedger,
  mockBip44HDPath,
  mockCrypto,
  mockKdfExtension,
  mockKdfMobile,
  mockKeyCosmos,
  mockKeyStore,
  mockMeta,
  mockMetaHasId,
  mockPassword,
  mockRng,
} from "../__mocks__/keyring";
import { Crypto } from "../crypto";

describe("Crypto", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe("encrypt", () => {
    const scryptSpy = jest.spyOn(mockCrypto, "scrypt");
    const scryptParams = {
      salt: expect.any(String),
      dklen: 32,
      n: 131072,
      r: 8,
      p: 1,
    };
    describe("mnemonic", () => {
      it("should encrypt with scrypt and return a KeyStore object", async () => {
        // Mock the scrypt function to return the derived key

        const result = await Crypto.encrypt(
          mockRng,
          mockCrypto,
          mockKdfExtension,
          "mnemonic",
          mockKeyCosmos.mnemonic,
          mockPassword,
          mockMetaHasId,
          mockBip44HDPath
        );

        expect(mockRng).toHaveBeenCalled();
        expect(mockRng).toBeCalledTimes(2);
        expect(scryptSpy).toHaveBeenCalledWith(mockPassword, scryptParams);
        expect(result.version).toBe("1.2");
        expect(result.type).toBe("mnemonic");
        expect(result.coinTypeForChain).toEqual({});
        expect(result.bip44HDPath).toBe(mockBip44HDPath);
        expect(result.meta).toBe(mockMetaHasId);
        expect(result.crypto.cipher).toBe("aes-128-ctr");
        expect(result.crypto.cipherparams.iv).toEqual(expect.any(String));
        expect(result.crypto.ciphertext).toEqual(expect.any(String));
        expect(result.crypto.kdf).toBe(mockKdfExtension);
        expect(result.crypto.kdfparams).toEqual(scryptParams);
        expect(result.crypto.mac).toEqual(expect.any(String));
        expect(result.addresses).toBe(undefined);
      });

      it("should encrypt with sha256 and return a KeyStore object", async () => {
        const result = await Crypto.encrypt(
          mockRng,
          mockCrypto,
          "sha256",
          "mnemonic",
          mockKeyCosmos.mnemonic,
          mockPassword,
          mockMetaHasId,
          mockBip44HDPath
        );

        expect(mockRng).toHaveBeenCalled();
        expect(mockRng).toBeCalledTimes(2);
        expect(scryptSpy).not.toHaveBeenCalled();
        expect(result.version).toBe("1.2");
        expect(result.type).toBe("mnemonic");
        expect(result.coinTypeForChain).toEqual({});
        expect(result.bip44HDPath).toBe(mockBip44HDPath);
        expect(result.meta).toBe(mockMetaHasId);
        expect(result.crypto.cipher).toBe("aes-128-ctr");
        expect(result.crypto.cipherparams.iv).toEqual(expect.any(String));
        expect(result.crypto.ciphertext).toEqual(expect.any(String));
        expect(result.crypto.kdf).toBe("sha256");
        expect(result.crypto.kdfparams).toEqual(scryptParams);
        expect(result.crypto.mac).toEqual(expect.any(String));
        expect(result.addresses).toBe(undefined);
      });

      it("should encrypt with pbkdf2 and return a KeyStore object", async () => {
        const result = await Crypto.encrypt(
          mockRng,
          mockCrypto,
          mockKdfMobile,
          "mnemonic",
          mockKeyCosmos.mnemonic,
          mockPassword,
          mockMetaHasId,
          mockBip44HDPath
        );
        expect(mockRng).toHaveBeenCalled();
        expect(mockRng).toBeCalledTimes(2);
        expect(scryptSpy).not.toHaveBeenCalled();
        expect(result.version).toBe("1.2");
        expect(result.type).toBe("mnemonic");
        expect(result.coinTypeForChain).toEqual({});
        expect(result.bip44HDPath).toBe(mockBip44HDPath);
        expect(result.meta).toBe(mockMetaHasId);
        expect(result.crypto.cipher).toBe("aes-128-ctr");
        expect(result.crypto.cipherparams.iv).toEqual(expect.any(String));
        expect(result.crypto.ciphertext).toEqual(expect.any(String));
        expect(result.crypto.kdf).toBe(mockKdfMobile);
        expect(result.crypto.kdfparams).toEqual(scryptParams);
        expect(result.crypto.mac).toEqual(expect.any(String));
        expect(result.addresses).toBe(undefined);
      });
    });
    describe("privateKey", () => {
      it("should encrypt with scrypt and return a KeyStore object", async () => {
        // Mock the scrypt function to return the derived key

        const result = await Crypto.encrypt(
          mockRng,
          mockCrypto,
          mockKdfExtension,
          "privateKey",
          Buffer.from(mockKeyCosmos.privateKeyHex).toString("hex"),
          mockPassword,
          mockMetaHasId,
          mockBip44HDPath
        );

        expect(mockRng).toHaveBeenCalled();
        expect(mockRng).toBeCalledTimes(3);
        expect(scryptSpy).toHaveBeenCalledWith(mockPassword, scryptParams);
        expect(result.version).toBe("1.2");
        expect(result.type).toBe("privateKey");
        expect(result.coinTypeForChain).toEqual({});
        expect(result.bip44HDPath).toBe(mockBip44HDPath);
        expect(result.meta).toBe(mockMetaHasId);
        expect(result.crypto.cipher).toBe("aes-128-ctr");
        expect(result.crypto.cipherparams.iv).toEqual(expect.any(String));
        expect(result.crypto.ciphertext).toEqual(expect.any(String));
        expect(result.crypto.kdf).toBe(mockKdfExtension);
        expect(result.crypto.kdfparams).toEqual(scryptParams);
        expect(result.crypto.mac).toEqual(expect.any(String));
        expect(result.addresses).toBe(undefined);
      });

      it("should encrypt with sha256 and return a KeyStore object", async () => {
        const result = await Crypto.encrypt(
          mockRng,
          mockCrypto,
          "sha256",
          "privateKey",
          Buffer.from(mockKeyCosmos.privateKeyHex).toString("hex"),
          mockPassword,
          mockMetaHasId,
          mockBip44HDPath
        );

        expect(mockRng).toHaveBeenCalled();
        expect(mockRng).toBeCalledTimes(2);
        expect(scryptSpy).not.toHaveBeenCalled();
        expect(result.version).toBe("1.2");
        expect(result.type).toBe("privateKey");
        expect(result.coinTypeForChain).toEqual({});
        expect(result.bip44HDPath).toBe(mockBip44HDPath);
        expect(result.meta).toBe(mockMetaHasId);
        expect(result.crypto.cipher).toBe("aes-128-ctr");
        expect(result.crypto.cipherparams.iv).toEqual(expect.any(String));
        expect(result.crypto.ciphertext).toEqual(expect.any(String));
        expect(result.crypto.kdf).toBe("sha256");
        expect(result.crypto.kdfparams).toEqual(scryptParams);
        expect(result.crypto.mac).toEqual(expect.any(String));
        expect(result.addresses).toBe(undefined);
      });

      it("should encrypt with pbkdf2 and return a KeyStore object", async () => {
        const result = await Crypto.encrypt(
          mockRng,
          mockCrypto,
          mockKdfMobile,
          "privateKey",
          Buffer.from(mockKeyCosmos.privateKeyHex).toString("hex"),
          mockPassword,
          mockMetaHasId,
          mockBip44HDPath
        );
        expect(mockRng).toHaveBeenCalled();
        expect(mockRng).toBeCalledTimes(2);
        expect(scryptSpy).not.toHaveBeenCalled();
        expect(result.version).toBe("1.2");
        expect(result.type).toBe("privateKey");
        expect(result.coinTypeForChain).toEqual({});
        expect(result.bip44HDPath).toBe(mockBip44HDPath);
        expect(result.meta).toBe(mockMetaHasId);
        expect(result.crypto.cipher).toBe("aes-128-ctr");
        expect(result.crypto.cipherparams.iv).toEqual(expect.any(String));
        expect(result.crypto.ciphertext).toEqual(expect.any(String));
        expect(result.crypto.kdf).toBe(mockKdfMobile);
        expect(result.crypto.kdfparams).toEqual(scryptParams);
        expect(result.crypto.mac).toEqual(expect.any(String));
        expect(result.addresses).toBe(undefined);
      });
    });
    describe("ledger", () => {
      it("should encrypt with scrypt and return a KeyStore object", async () => {
        // Mock the scrypt function to return the derived key

        const result = await Crypto.encrypt(
          mockRng,
          mockCrypto,
          mockKdfExtension,
          "ledger",
          Buffer.from(mockKeyCosmos.publicKeyHex).toString("hex"),
          mockPassword,
          mockMetaHasId,
          mockBip44HDPath,
          mockAddressLedger
        );

        expect(mockRng).toHaveBeenCalled();
        expect(mockRng).toBeCalledTimes(2);
        expect(scryptSpy).toHaveBeenCalledWith(mockPassword, scryptParams);
        expect(result.version).toBe("1.2");
        expect(result.type).toBe("ledger");
        expect(result.coinTypeForChain).toEqual({});
        expect(result.bip44HDPath).toBe(mockBip44HDPath);
        expect(result.meta).toBe(mockMetaHasId);
        expect(result.crypto.cipher).toBe("aes-128-ctr");
        expect(result.crypto.cipherparams.iv).toEqual(expect.any(String));
        expect(result.crypto.ciphertext).toEqual(expect.any(String));
        expect(result.crypto.kdf).toBe(mockKdfExtension);
        expect(result.crypto.kdfparams).toEqual(scryptParams);
        expect(result.crypto.mac).toEqual(expect.any(String));
        expect(result.addresses).toBe(mockAddressLedger);
      });

      it("should encrypt with sha256 and return a KeyStore object", async () => {
        const result = await Crypto.encrypt(
          mockRng,
          mockCrypto,
          "sha256",
          "ledger",
          Buffer.from(mockKeyCosmos.publicKeyHex).toString("hex"),
          mockPassword,
          mockMetaHasId,
          mockBip44HDPath,
          mockAddressLedger
        );

        expect(mockRng).toHaveBeenCalled();
        expect(mockRng).toBeCalledTimes(2);
        expect(scryptSpy).not.toHaveBeenCalled();
        expect(result.version).toBe("1.2");
        expect(result.type).toBe("ledger");
        expect(result.coinTypeForChain).toEqual({});
        expect(result.bip44HDPath).toBe(mockBip44HDPath);
        expect(result.meta).toBe(mockMetaHasId);
        expect(result.crypto.cipher).toBe("aes-128-ctr");
        expect(result.crypto.cipherparams.iv).toEqual(expect.any(String));
        expect(result.crypto.ciphertext).toEqual(expect.any(String));
        expect(result.crypto.kdf).toBe("sha256");
        expect(result.crypto.kdfparams).toEqual(scryptParams);
        expect(result.crypto.mac).toEqual(expect.any(String));
        expect(result.addresses).toBe(mockAddressLedger);
      });

      it("should encrypt with pbkdf2 and return a KeyStore object", async () => {
        const result = await Crypto.encrypt(
          mockRng,
          mockCrypto,
          mockKdfMobile,
          "ledger",
          Buffer.from(mockKeyCosmos.publicKeyHex).toString("hex"),
          mockPassword,
          mockMetaHasId,
          mockBip44HDPath,
          mockAddressLedger
        );
        expect(mockRng).toHaveBeenCalled();
        expect(mockRng).toBeCalledTimes(2);
        expect(scryptSpy).not.toHaveBeenCalled();
        expect(result.version).toBe("1.2");
        expect(result.type).toBe("ledger");
        expect(result.coinTypeForChain).toEqual({});
        expect(result.bip44HDPath).toBe(mockBip44HDPath);
        expect(result.meta).toBe(mockMetaHasId);
        expect(result.crypto.cipher).toBe("aes-128-ctr");
        expect(result.crypto.cipherparams.iv).toEqual(expect.any(String));
        expect(result.crypto.ciphertext).toEqual(expect.any(String));
        expect(result.crypto.kdf).toBe(mockKdfMobile);
        expect(result.crypto.kdfparams).toEqual(scryptParams);
        expect(result.crypto.mac).toEqual(expect.any(String));
        expect(result.addresses).toBe(mockAddressLedger);
      });
    });
  });
  describe("decrypt", () => {
    describe("mnemonic", () => {
      test("should decrypt with scrypt kdf", async () => {
        const result = await Crypto.decrypt(
          mockCrypto,
          mockKeyStore.mnemonic.scrypt,
          mockPassword
        );
        expect(result.toString().trim()).toBe(mockKeyCosmos.mnemonic);
      });
      test("should decrypt with pbkdf2 kdf", async () => {
        const result = await Crypto.decrypt(
          mockCrypto,
          mockKeyStore.mnemonic.pbkdf2,
          mockPassword
        );
        expect(result.toString().trim()).toBe(mockKeyCosmos.mnemonic);
      });
      test("should decrypt with sha256 kdf", async () => {
        const result = await Crypto.decrypt(
          mockCrypto,
          mockKeyStore.mnemonic.sha256,
          mockPassword
        );
        expect(result.toString().trim()).toBe(mockKeyCosmos.mnemonic);
      });
    });
    describe("privateKey", () => {
      afterEach(() => {
        jest.clearAllMocks();
      });
      test("should decrypt with scrypt kdf", async () => {
        const result = await Crypto.decrypt(
          mockCrypto,
          mockKeyStore.privateKey.scrypt,
          mockPassword
        );
        expect(result.toString().trim()).toBe(mockKeyCosmos.privateKey);
      });
      test("should decrypt with pbkdf2 kdf", async () => {
        const result = await Crypto.decrypt(
          mockCrypto,
          mockKeyStore.privateKey.pbkdf2,
          mockPassword
        );
        expect(result.toString().trim()).toBe(mockKeyCosmos.privateKey);
      });
      test("should decrypt with sha256 kdf", async () => {
        const result = await Crypto.decrypt(
          mockCrypto,
          mockKeyStore.privateKey.sha256,
          mockPassword
        );
        expect(result.toString().trim()).toBe(mockKeyCosmos.privateKey);
      });
    });
    describe("ledger", () => {
      test("should decrypt with scrypt kdf", async () => {
        const result = await Crypto.decrypt(
          mockCrypto,
          mockKeyStore.ledger.scrypt,
          mockPassword
        );
        expect(result.toString().trim()).toBe(mockKeyCosmos.publicKey);
      });
      test("should decrypt with pbkdf2 kdf", async () => {
        const result = await Crypto.decrypt(
          mockCrypto,
          mockKeyStore.ledger.pbkdf2,
          mockPassword
        );
        expect(result.toString().trim()).toBe(mockKeyCosmos.publicKey);
      });
      test("should decrypt with sha256 kdf", async () => {
        const result = await Crypto.decrypt(
          mockCrypto,
          mockKeyStore.ledger.sha256,
          mockPassword
        );
        expect(result.toString().trim()).toBe(mockKeyCosmos.publicKey);
      });
    });
  });
});

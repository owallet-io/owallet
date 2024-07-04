import {
  ChainIdEnum,
  EmbedChainInfos,
  MIN_FEE_RATE,
  // OasisTransaction,
  convertBip44ToHDPath,
  signerFromPrivateKey,
  splitPathStringToHDPath,
  typeBtcLedgerByAddress,
} from "@owallet/common";
import * as BytesUtils from "@ethersproject/bytes";
import { keccak256 } from "@ethersproject/keccak256";
import { serialize } from "@ethersproject/transactions";
import { Wallet } from "@ethersproject/wallet";
import {
  getLedgerAppNameByNetwork,
  getCoinTypeByChainId,
  getNetworkTypeByBip44HDPath,
  getNetworkTypeByChainId,
  KVStore,
  KVStoreType,
  splitPath,
  LedgerAppType,
} from "@owallet/common";
import { ChainIdHelper } from "@owallet/cosmos";
import {
  Mnemonic,
  PrivKeySecp256k1,
  PubKeySecp256k1,
  RNG,
  Hash,
} from "@owallet/crypto";
import { Env, OWalletError } from "@owallet/router";
import { AddressBtcType, AppCurrency, ChainInfo } from "@owallet/types";
import AES from "aes-js";
import { Buffer } from "buffer";
import eccrypto from "eccrypto-js";
import { rawEncode, soliditySHA3 } from "ethereumjs-abi";
import {
  ecsign,
  keccak,
  privateToPublic,
  publicToAddress,
  toBuffer,
} from "ethereumjs-util";
import TronWeb from "tronweb";
import { LedgerService } from "../ledger";
import { request } from "../tx";
import { TYPED_MESSAGE_SCHEMA } from "./constants";
import { Crypto, KeyStore } from "./crypto";
import PRE from "proxy-recrypt-js";
import {
  CommonCrypto,
  ECDSASignature,
  ExportKeyRingData,
  MessageTypeProperty,
  MessageTypes,
  SignTypedDataVersion,
  TypedDataV1,
  TypedMessage,
} from "./types";
import { KeyringHelper } from "./utils";
import {
  isEthermintLike,
  getKeyDerivationFromAddressType,
} from "@owallet/common";
import {
  createTransaction,
  wallet,
  getKeyPairByMnemonic,
  getKeyPairByPrivateKey,
  getAddress,
  getAddressTypeByAddress,
} from "@owallet/bitcoin";
import { BIP44HDPath } from "@owallet/types";
import { handleAddressLedgerByChainId } from "../utils/helper";
import { AddressesLedger } from "@owallet/types";
import { ChainsService } from "../chains";
// import * as oasis from "@oasisprotocol/client";
// import {
//   addressToPublicKey,
//   hex2uint,
//   parseRoseStringToBigNumber,
//   parseRpcBalance,
//   StringifiedBigInt,
//   uint2hex
// } from "@owallet/common";
// import { CoinPretty, Int } from "@owallet/unit";
// import { ISimulateSignTron } from "@owallet/types";

// inject TronWeb class
(globalThis as any).TronWeb = require("tronweb");

export enum KeyRingStatus {
  NOTLOADED,
  EMPTY,
  LOCKED,
  UNLOCKED,
}

export interface Key {
  algo: string;
  pubKey: Uint8Array;
  address: Uint8Array;
  isNanoLedger: boolean;
  bech32Address?: string;
  legacyAddress?: string;
}

export type MultiKeyStoreInfoElem = Pick<
  KeyStore,
  "version" | "type" | "meta" | "bip44HDPath" | "coinTypeForChain"
>;
export type MultiKeyStoreInfo = MultiKeyStoreInfoElem[];
export type MultiKeyStoreInfoWithSelectedElem = MultiKeyStoreInfoElem & {
  selected: boolean;
  addresses?: AddressesLedger;
  pubkeys?: AddressesLedger;
};
export type MultiKeyStoreInfoWithSelected = MultiKeyStoreInfoWithSelectedElem[];

const KeyStoreKey = "key-store";
const KeyMultiStoreKey = "key-multi-store";

/*
 Keyring stores keys in persistent backround.
 And, this manages the state, crypto, address, signing and so on...
 */
export class KeyRing {
  private cached: Map<string, Uint8Array> = new Map();

  private loaded: boolean;
  private loading: Promise<void>;

  /**
   * Keyring can have either private key or mnemonic.
   * If keyring has private key, it can't set the BIP 44 path.
   */
  private _privateKey?: Uint8Array;
  private _mnemonic?: string;
  private _ledgerPublicKey?: Uint8Array;
  private keyStore: KeyStore | null;

  private multiKeyStore: KeyStore[];

  private password: string = "";
  private _iv: string;

  constructor(
    private readonly chainsService: ChainsService,
    private readonly kvStore: KVStore,
    private readonly ledgerKeeper: LedgerService,
    private readonly rng: RNG,
    private readonly crypto: CommonCrypto,
    private readonly seed: number[] = [
      87, 235, 226, 143, 100, 250, 250, 208, 174, 131, 56, 214,
    ]
  ) {
    this.loaded = false;
    this.keyStore = null;
    this.multiKeyStore = [];
    this._iv = Buffer.from(Hash.sha256(Uint8Array.from(this.seed))).toString(
      "hex"
    );
  }

  public static getTypeOfKeyStore(
    keyStore: Omit<KeyStore, "crypto">
  ): "mnemonic" | "privateKey" | "ledger" {
    const type = keyStore.type;
    if (type == null) {
      return "mnemonic";
    }

    if (type !== "mnemonic" && type !== "privateKey" && type !== "ledger") {
      throw new Error("Invalid type of key store");
    }

    return type;
  }

  public get type(): "mnemonic" | "privateKey" | "ledger" | "none" {
    if (!this.keyStore) {
      return "none";
    } else {
      return KeyRing.getTypeOfKeyStore(this.keyStore);
    }
  }

  public static getLedgerAddressOfKeyStore(
    keyStore: Omit<KeyStore, "crypto">
  ): AddressesLedger {
    return keyStore.addresses;
  }

  public get addresses(): AddressesLedger {
    if (!this.keyStore) {
      return {} as AddressesLedger;
    } else {
      return KeyRing.getLedgerAddressOfKeyStore(this.keyStore);
    }
  }

  public get pubkeys(): AddressesLedger {
    if (!this.keyStore) {
      return {} as AddressesLedger;
    } else {
      return this.keyStore.pubkeys;
    }
  }

  public isLocked(): boolean {
    return (
      this.privateKey == null &&
      this.mnemonic == null &&
      this.ledgerPublicKey == null
    );
  }

  private get privateKey(): Uint8Array | undefined {
    return this._privateKey;
  }

  private set privateKey(privateKey: Uint8Array | undefined) {
    this._privateKey = privateKey;
    this._mnemonic = undefined;
    this._ledgerPublicKey = undefined;
    this.cached = new Map();
  }

  private get mnemonic(): string | undefined {
    return this._mnemonic;
  }

  private set mnemonic(mnemonic: string | undefined) {
    this._mnemonic = mnemonic;
    this._privateKey = undefined;
    this._ledgerPublicKey = undefined;
    this.cached = new Map();
  }

  private get ledgerPublicKey(): Uint8Array | undefined {
    return this._ledgerPublicKey;
  }

  private set ledgerPublicKey(publicKey: Uint8Array | undefined) {
    this._mnemonic = undefined;
    this._privateKey = undefined;
    this._ledgerPublicKey = publicKey;
    this.cached = new Map();
  }

  public get status(): KeyRingStatus {
    if (!this.loaded) {
      return KeyRingStatus.NOTLOADED;
    }

    if (!this.keyStore) {
      return KeyRingStatus.EMPTY;
    } else if (!this.isLocked()) {
      return KeyRingStatus.UNLOCKED;
    } else {
      return KeyRingStatus.LOCKED;
    }
  }

  public getKeyStoreCoinType(chainId: string): number | undefined {
    if (!this.keyStore) {
      return undefined;
    }

    if (!this.keyStore.coinTypeForChain) {
      return undefined;
    }

    return this.keyStore.coinTypeForChain[
      ChainIdHelper.parse(chainId).identifier
    ];
  }

  public async getKey(chainId: string, defaultCoinType: number): Promise<Key> {
    return await this.loadKey(
      this.computeKeyStoreCoinType(chainId, defaultCoinType),
      chainId
    );
  }

  public getKeyStoreMeta(key: string): string {
    if (!this.keyStore || this.keyStore.meta == null) {
      return "";
    }

    return this.keyStore.meta[key] ?? "";
  }

  public computeKeyStoreCoinType(
    chainId: string,
    defaultCoinType: number
  ): number {
    if (!this.keyStore) {
      throw new Error("Key Store is empty");
    }

    return this.keyStore.coinTypeForChain
      ? this.keyStore.coinTypeForChain[
          ChainIdHelper.parse(chainId).identifier
        ] ?? defaultCoinType
      : defaultCoinType;
  }

  public async getKeyFromCoinType(coinType: number): Promise<Key> {
    return await this.loadKey(coinType);
  }

  public async createMnemonicKey(
    kdf: "scrypt" | "sha256" | "pbkdf2",
    mnemonic: string,
    password: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<{
    status: KeyRingStatus;
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    // Affect if remove this check ?
    // if (this.status !== KeyRingStatus.EMPTY) {
    //   throw new Error('Key ring is not loaded or not empty');
    // }

    this.mnemonic = mnemonic;
    this.keyStore = await KeyRing.CreateMnemonicKeyStore(
      this.rng,
      this.crypto,
      kdf,
      mnemonic,
      password,
      await this.assignKeyStoreIdMeta(meta),
      bip44HDPath
    );
    this.password = password;
    this.multiKeyStore.push(this.keyStore);

    await this.save();

    return {
      status: this.status,
      multiKeyStoreInfo: await this.getMultiKeyStoreInfo(),
    };
  }

  public async createPrivateKey(
    kdf: "scrypt" | "sha256" | "pbkdf2",
    privateKey: Uint8Array,
    password: string,
    meta: Record<string, string>
  ): Promise<{
    status: KeyRingStatus;
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    // if (this.status !== KeyRingStatus.EMPTY) {
    //   throw new Error('Key ring is not loaded or not empty');
    // }

    this.privateKey = privateKey;
    this.keyStore = await KeyRing.CreatePrivateKeyStore(
      this.rng,
      this.crypto,
      kdf,
      privateKey,
      password,
      await this.assignKeyStoreIdMeta(meta)
    );
    this.password = password;
    this.multiKeyStore.push(this.keyStore);

    await this.save();

    return {
      status: this.status,
      multiKeyStoreInfo: this.getMultiKeyStoreInfo(),
    };
  }

  public async createLedgerKey(
    env: Env,
    kdf: "scrypt" | "sha256" | "pbkdf2",
    password: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<{
    status: KeyRingStatus;
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    // if (this.status !== KeyRingStatus.EMPTY) {
    //   throw new Error('Key ring is not loaded or not empty');
    // }
    const ledgerAppType = getNetworkTypeByBip44HDPath(bip44HDPath);

    // detect network type here when create ledger
    // Get public key first
    const hdPath = convertBip44ToHDPath(bip44HDPath);
    const { publicKey, address } =
      (await this.ledgerKeeper.getPublicKey(env, hdPath, ledgerAppType)) || {};

    this.ledgerPublicKey = publicKey;

    const keyStore = await KeyRing.CreateLedgerKeyStore(
      this.rng,
      this.crypto,
      kdf,
      this.ledgerPublicKey,
      password,
      await this.assignKeyStoreIdMeta(meta),
      bip44HDPath,
      {
        [ledgerAppType]: address,
      }
    );

    this.password = password;
    this.keyStore = keyStore;
    this.multiKeyStore.push(this.keyStore);

    await this.save();

    return {
      status: this.status,
      multiKeyStoreInfo: await this.getMultiKeyStoreInfo(),
    };
  }

  public async lock() {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    this.mnemonic = undefined;
    this.privateKey = undefined;
    this.ledgerPublicKey = undefined;
    this.password = "";
    await this.kvStore.set("passcode", null);
  }

  public async unlock(password: string, saving = true) {
    if (!this.keyStore || this.type === "none") {
      throw new Error("Key ring not initialized");
    }
    if (this.type === "mnemonic") {
      // If password is invalid, error will be thrown.
      this.mnemonic = Buffer.from(
        await Crypto.decrypt(this.crypto, this.keyStore, password)
      ).toString();
    } else if (this.type === "privateKey") {
      // If password is invalid, error will be thrown.
      this.privateKey = Buffer.from(
        Buffer.from(
          await Crypto.decrypt(this.crypto, this.keyStore, password)
        ).toString(),
        "hex"
      );
    } else if (this.type === "ledger") {
      this.ledgerPublicKey = Buffer.from(
        Buffer.from(
          await Crypto.decrypt(this.crypto, this.keyStore, password)
        ).toString(),
        "hex"
      );
    } else {
      throw new Error("Unexpected type of keyring");
    }
    this.password = password;

    if (saving) {
      await this.savePasscode(password);
    }
  }

  public async savePasscode(password) {
    const key = this.getKeyExpired();
    const aesCtr = new AES.ModeOfOperation.ctr(key);
    const prefix = Buffer.alloc(password.length);
    // add prefix to make passcode more obfuscated
    crypto.getRandomValues(prefix);
    const encryptedBytes = aesCtr.encrypt(Buffer.from(this._iv + password));
    if (this.kvStore.type() !== KVStoreType.mobile) {
      await this.kvStore.set(
        "passcode",
        Buffer.from(encryptedBytes).toString("base64")
      );
    }
  }

  public async save() {
    await this.kvStore.set<KeyStore>(KeyStoreKey, this.keyStore);
    await this.kvStore.set<KeyStore[]>(KeyMultiStoreKey, this.multiKeyStore);
  }

  // default expired is 1 hour, seed is gen using crypto.randomBytes(12)
  private getKeyExpired(expired = 3_600_000) {
    const key = Buffer.allocUnsafe(16);
    key.writeUInt32BE((Date.now() / expired) >> 1);
    key.set(this.seed, 4);
    return key;
  }

  public async restore() {
    if (this.loading) return this.loading;
    this.loading = new Promise(async (resolve, reject) => {
      try {
        const keyStore = await this.kvStore.get<KeyStore>(KeyStoreKey);
        if (!keyStore) {
          this.keyStore = null;
        } else {
          this.keyStore = keyStore;
          if (!this.password) {
            try {
              // check and try decode encrypted password
              const encryptedBytes = Buffer.from(
                await this.kvStore.get<string>("passcode"),
                "base64"
              );
              if (encryptedBytes.length) {
                const key = this.getKeyExpired();
                // The counter is optional, and if omitted will begin at 1
                const aesCtr = new AES.ModeOfOperation.ctr(key);
                const decryptedBytes = aesCtr.decrypt(encryptedBytes);
                // hex length = 2 * length password
                const decryptedStr = Buffer.from(decryptedBytes).toString();
                if (!decryptedStr.startsWith(this._iv)) {
                  throw new Error("Passcode is expired");
                }
                this.password = decryptedStr.substring(this._iv.length);
                // unlock with store password
                if (this.password) {
                  await this.unlock(this.password, false);
                }
              }
            } catch {
              await this.kvStore.set("passcode", null);
            }
          } else {
            await this.savePasscode(this.password);
          }
        }
        const multiKeyStore = await this.kvStore.get<KeyStore[]>(
          KeyMultiStoreKey
        );
        if (!multiKeyStore) {
          // Restore the multi keystore if key store exist but multi key store is empty.
          // This case will occur if extension is updated from the prior version that doesn't support the multi key store.
          // This line ensures the backward compatibility.
          if (keyStore) {
            keyStore.meta = await this.assignKeyStoreIdMeta({});
            this.multiKeyStore = [keyStore];
          } else {
            this.multiKeyStore = [];
          }
          await this.save();
        } else {
          this.multiKeyStore = multiKeyStore;
        }

        let hasLegacyKeyStore = false;
        // In prior of version 1.2, bip44 path didn't tie with the keystore, and bip44 exists on the chain info.
        // But, after some chain matures, they decided the bip44 path's coin type.
        // So, some chain can have the multiple bip44 coin type (one is the standard coin type and other is the legacy coin type).
        // We should support the legacy coin type, so we determined that the coin type ties with the keystore.
        // To decrease the barrier of existing users, set the alternative coin type by force if the keystore version is prior than 1.2.
        if (this.keyStore) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment

          if (
            // @ts-ignore
            this.keyStore.version === "1" ||
            // @ts-ignore
            this.keyStore.version === "1.1"
          ) {
            hasLegacyKeyStore = true;
            this.updateLegacyKeyStore(this.keyStore);
          }
        }
        for (const keyStore of this.multiKeyStore) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (keyStore.version === "1" || keyStore.version === "1.1") {
            hasLegacyKeyStore = true;
            this.updateLegacyKeyStore(keyStore);
          }
        }
        if (hasLegacyKeyStore) {
          await this.save();
        }
        resolve();
      } catch (ex) {
        reject(ex);
      }
    });

    await this.loading;
    this.loading = undefined;
    this.loaded = true;
  }

  private updateLegacyKeyStore(keyStore: KeyStore) {
    keyStore.version = "1.2";
    // EmbedChainInfos
    for (const chainInfo of EmbedChainInfos) {
      const coinType = (() => {
        if (
          chainInfo.alternativeBIP44s &&
          chainInfo.alternativeBIP44s.length > 0
        ) {
          return chainInfo.alternativeBIP44s[0].coinType;
        } else {
          return chainInfo.bip44.coinType;
        }
      })();
      keyStore.coinTypeForChain = {
        ...keyStore.coinTypeForChain,
        [ChainIdHelper.parse(chainInfo.chainId).identifier]: coinType,
      };
    }
  }

  public isKeyStoreCoinTypeSet(chainId: string): boolean {
    if (!this.keyStore) {
      throw new Error("Empty key store");
    }

    return (
      this.keyStore.coinTypeForChain &&
      this.keyStore.coinTypeForChain[
        ChainIdHelper.parse(chainId).identifier
      ] !== undefined
    );
  }

  public async setKeyStoreCoinType(chainId: string, coinType: number) {
    if (!this.keyStore) {
      throw new Error("Empty key store");
    }

    if (
      this.keyStore.coinTypeForChain &&
      this.keyStore.coinTypeForChain[
        ChainIdHelper.parse(chainId).identifier
      ] !== undefined
    ) {
      throw new Error("Coin type already set");
    }

    this.keyStore.coinTypeForChain = {
      ...this.keyStore.coinTypeForChain,
      [ChainIdHelper.parse(chainId).identifier]: coinType,
    };

    const keyStoreInMulti = this.multiKeyStore.find((keyStore) => {
      return (
        KeyRing.getKeyStoreId(keyStore) ===
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        KeyRing.getKeyStoreId(this.keyStore!)
      );
    });

    if (keyStoreInMulti) {
      keyStoreInMulti.coinTypeForChain = {
        ...this.keyStore.coinTypeForChain,
      };
    }

    await this.save();
  }

  public async setKeyStoreLedgerAddress(
    env: Env,
    bip44HDPath: string,
    chainId: string | number
  ) {
    try {
      if (!this.keyStore) {
        throw new Error("Empty key store");
      }
      const chainInfo = await this.chainsService.getChainInfo(
        chainId as string
      );
      const ledgerAppType = getLedgerAppNameByNetwork(
        chainInfo.networkType,
        chainId
      );
      const hdPath = splitPathStringToHDPath(bip44HDPath);
      // Update ledger address here with this function below
      const { publicKey, address } =
        (await this.ledgerKeeper.getPublicKey(env, hdPath, ledgerAppType)) ||
        {};

      const pubKey = publicKey ? Buffer.from(publicKey).toString("hex") : null;
      const keyStoreInMulti = this.multiKeyStore.find((keyStore) => {
        return (
          KeyRing.getKeyStoreId(keyStore) ===
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          KeyRing.getKeyStoreId(this.keyStore!)
        );
      });
      const addressLedger = handleAddressLedgerByChainId(
        ledgerAppType,
        address,
        chainInfo
      );
      if (keyStoreInMulti) {
        const keyStoreAddresses = { ...keyStoreInMulti.addresses };
        const returnedAddresses = Object.assign(
          keyStoreAddresses,
          addressLedger
        );
        keyStoreInMulti.addresses = returnedAddresses;
        this.keyStore.addresses = returnedAddresses;
        if (!!publicKey) {
          const returnedPubkey = Object.assign(
            { ...keyStoreInMulti.pubkeys },
            {
              [ledgerAppType]: pubKey,
            }
          );
          keyStoreInMulti.pubkeys = returnedPubkey;
          this.keyStore.pubkeys = returnedPubkey;
        }
      }

      await this.save();
      return { status: this.status };
    } catch (error) {
      console.log(
        "🚀 ~ file: keyring.ts:595 ~ setKeyStoreLedgerAddress ~ error:",
        error
      );
    }
  }

  public async deleteKeyRing(
    index: number,
    password: string
  ): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
    keyStoreChanged: boolean;
  }> {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    if (this.password !== password) {
      throw new Error("Invalid password");
    }

    const keyStore = this.multiKeyStore[index];

    if (!keyStore) {
      throw new Error("Empty key store");
    }

    const multiKeyStore = this.multiKeyStore
      .slice(0, index)
      .concat(this.multiKeyStore.slice(index + 1));

    // Make sure that password is valid.
    await Crypto.decrypt(this.crypto, keyStore, password);

    let keyStoreChanged = false;
    if (this.keyStore) {
      // If key store is currently selected key store
      if (
        KeyRing.getKeyStoreId(keyStore) === KeyRing.getKeyStoreId(this.keyStore)
      ) {
        // If there is a key store left
        if (multiKeyStore.length > 0) {
          // Lock key store at first
          this.lock();
          // Select first key store
          this.keyStore = multiKeyStore[0];
          // And unlock it
          await this.unlock(password);
        } else {
          // Else clear keyring.
          this.keyStore = null;
          this.mnemonic = undefined;
          this.privateKey = undefined;
          await this.kvStore.set("passcode", null);
        }

        keyStoreChanged = true;
      }
    }

    this.multiKeyStore = multiKeyStore;
    await this.save();
    return {
      multiKeyStoreInfo: await this.getMultiKeyStoreInfo(),
      keyStoreChanged,
    };
  }

  public async updateNameKeyRing(
    index: number,
    name: string,
    email?: string
  ): Promise<MultiKeyStoreInfoWithSelected> {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    const keyStore = this.multiKeyStore[index];

    if (!keyStore) {
      throw new Error("Empty key store");
    }

    keyStore.meta = { ...keyStore.meta, name: name, email: email };

    // If select key store and changed store are same, sync keystore
    if (
      this.keyStore &&
      KeyRing.getKeyStoreId(this.keyStore) === KeyRing.getKeyStoreId(keyStore)
    ) {
      this.keyStore = keyStore;
    }
    await this.save();
    return this.getMultiKeyStoreInfo();
  }

  private getPubKey(coinType): PubKeySecp256k1 {
    if (this.keyStore.type === "ledger") {
      const appName = getNetworkTypeByBip44HDPath({
        coinType: coinType,
      } as BIP44HDPath);
      if (!this.ledgerPublicKey) {
        throw new Error("Ledger public key not set");
      }
      if (this.keyStore?.pubkeys && this.keyStore.pubkeys[appName]) {
        const pubKeyConverted = Uint8Array.from(
          Buffer.from(this.keyStore.pubkeys[appName], "hex")
        );
        return new PubKeySecp256k1(pubKeyConverted);
        // this.ledgerPublicKey = this.keyStore.pubkeys[appName];
      }
      return new PubKeySecp256k1(this.ledgerPublicKey);
    } else {
      const privKey = this.loadPrivKey(coinType);
      return privKey.getPubKey();
    }
  }

  private async loadKey(
    coinType: number,
    chainId?: string | number
  ): Promise<Key> {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    if (!this.keyStore) {
      throw new Error("Key Store is empty");
    }

    const isEthermint = await (async () => {
      if (chainId) {
        const chainInfo = await this.chainsService.getChainInfo(
          chainId as string
        );
        const rs = isEthermintLike(chainInfo);
        return rs;
      }
      return coinType === 60;
    })();

    // if (coinType === 474) {
    //   const signerPublicKey = await this.loadPublicKeyOasis();
    //   const addressUint8Array = await oasis.staking.addressFromPublicKey(signerPublicKey);
    //   return {
    //     algo: "ethsecp256k1",
    //     pubKey: signerPublicKey,
    //     address: addressUint8Array,
    //     isNanoLedger: this.keyStore.type === "ledger"
    //   };
    // }
    const pubKey = this.getPubKey(coinType);

    const address = (() => {
      if (isEthermint) {
        return pubKey.getEthAddress();
      }
      return pubKey.getCosmosAddress();
    })();

    const legacyAddress = await (async () => {
      if (chainId) {
        const chainInfo = await this.chainsService.getChainInfo(
          chainId as string
        );
        const networkType = getNetworkTypeByChainId(chainId);
        if (networkType === "bitcoin") {
          if (this.keyStore.type !== "ledger") {
            const keyPair = this.getKeyPairBtc(chainId as string, "44");
            const address = getAddress(keyPair, chainId, "legacy");
            return address;
          } else {
            return this.addresses[
              typeBtcLedgerByAddress(chainInfo, AddressBtcType.Legacy)
            ];
          }
        }
      }
      return null;
    })();
    return {
      algo: isEthermint ? "ethsecp256k1" : "secp256k1",
      pubKey: pubKey.toBytes(),
      address: address,
      isNanoLedger: this.keyStore.type === "ledger",
      legacyAddress: legacyAddress,
    };
  }

  private loadPrivKey(coinType: number): PrivKeySecp256k1 {
    if (
      this.status !== KeyRingStatus.UNLOCKED ||
      this.type === "none" ||
      !this.keyStore
    ) {
      throw new Error("Key ring is not unlocked");
    }
    const bip44HDPath = KeyRing.getKeyStoreBIP44Path(this.keyStore);
    // and here
    if (this.type === "mnemonic") {
      const coinTypeModified = bip44HDPath.coinType ?? coinType;

      const keyDelivery = (() => {
        if (coinType === 1 || coinType === 0) {
          return 84;
        }
        return 44;
      })();
      const path = `m/${keyDelivery}'/${coinTypeModified}'/${bip44HDPath.account}'/${bip44HDPath.change}/${bip44HDPath.addressIndex}`;

      const cachedKey = this.cached.get(path);

      if (cachedKey) {
        return new PrivKeySecp256k1(cachedKey);
      }

      if (!this.mnemonic) {
        throw new Error(
          "Key store type is mnemonic and it is unlocked. But, mnemonic is not loaded unexpectedly"
        );
      }
      const privKey = Mnemonic.generateWalletFromMnemonic(this.mnemonic, path);
      this.cached.set(path, privKey);
      return new PrivKeySecp256k1(privKey);
    } else if (this.type === "privateKey") {
      // If key store type is private key, path will be ignored.

      if (!this.privateKey) {
        throw new Error(
          "Key store type is private key and it is unlocked. But, private key is not loaded unexpectedly"
        );
      }

      return new PrivKeySecp256k1(this.privateKey);
    } else {
      throw new Error("Unexpected type of keyring");
    }
  }

  signTron(privKey: PrivKeySecp256k1, message: Uint8Array) {
    const transactionSign = TronWeb.utils.crypto.signTransaction(
      privKey.toBytes(),
      {
        txID: message,
      }
    );

    return Buffer.from(transactionSign?.signature?.[0], "hex");
  }

  async simulateSignTron(transaction: any) {
    const privKey = this.loadPrivKey(195);
    const signedTxn = TronWeb.utils.crypto.signTransaction(
      privKey.toBytes(),
      transaction
    );
    return signedTxn;
  }

  public async sign(
    env: Env,
    chainId: string,
    defaultCoinType: number,
    message: Uint8Array
  ): Promise<Uint8Array | any> {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new OWalletError("keyring", 143, "Key ring is not unlocked");
    }

    if (!this.keyStore) {
      throw new OWalletError("keyring", 130, "Key store is empty");
    }

    const networkType = getNetworkTypeByChainId(chainId);

    const coinType = this.computeKeyStoreCoinType(chainId, defaultCoinType);

    // using ledger app
    if (this.keyStore.type === "ledger") {
      const pubKey = this.ledgerPublicKey;
      if (!pubKey) {
        throw new OWalletError(
          "keyring",
          151,
          "Ledger public key is not initialized"
        );
      }
      const bip44HDPath = KeyRing.getKeyStoreBIP44Path(this.keyStore);

      const keyDerivation = (() => {
        const msgObj = JSON.parse(Buffer.from(message).toString());
        const addressType = getAddressTypeByAddress(
          msgObj.address
        ) as AddressBtcType;

        if (networkType === "bitcoin") {
          if (addressType === AddressBtcType.Bech32) {
            return 84;
          } else if (addressType === AddressBtcType.Legacy) {
            return 44;
          }
        }
        return 44;
      })();

      const path = [
        keyDerivation,
        coinType,
        bip44HDPath.account,
        bip44HDPath.change,
        bip44HDPath.addressIndex,
      ];

      const ledgerAppType: LedgerAppType = getLedgerAppNameByNetwork(
        networkType,
        chainId
      );
      // Need to check ledger here and ledger app type by chainId
      return await this.ledgerKeeper.sign(
        env,
        path,
        pubKey,
        message,
        ledgerAppType
      );
    } else {
      // Sign with Evmos/Ethereum
      const privKey = this.loadPrivKey(coinType);

      // Check cointype = 60 in the case that network is evmos(still cosmos but need to sign with ethereum)
      const chainInfo = await this.chainsService.getChainInfo(chainId);
      if (KeyringHelper.isEthermintByChainInfo(chainInfo)) {
        // Only check coinType === 195 for Tron network, because tron is evm but had cointype = 195, not 60
        if (coinType === 195) {
          return this.signTron(privKey, message);
        }

        return this.signEthereum(privKey, message);
      }
      return privKey.sign(message);
    }
  }

  async processSignLedgerEvm(
    env: Env,
    chainId: string,
    rpc: string,
    message: object
  ): Promise<string> {
    const address = this.addresses?.eth;
    const nonce = await request(rpc, "eth_getTransactionCount", [
      address,
      "latest",
    ]);
    let finalMessage: any = {
      gasLimit: (message as any)?.gasLimit,
      gasPrice: (message as any)?.gasPrice,
      value: (message as any)?.value,
      to: (message as any)?.to,
      nonce,
      chainId: Number(chainId),
    };
    const serializedTx = serialize(finalMessage).replace("0x", "");
    const signature = await this.sign(
      env,
      chainId,
      60,
      Buffer.from(serializedTx, "hex")
    );
    const signedTx = serialize(finalMessage, {
      r: `0x${signature.r}`,
      s: `0x${signature.s}`,
      v: parseInt(signature.v, 16),
    });
    const response = await request(rpc, "eth_sendRawTransaction", [signedTx]);
    return response;
  }

  async processSignEvm(
    chainId: string,
    coinType: number,
    rpc: string,
    message: object
  ): Promise<string> {
    const privKey = this.loadPrivKey(coinType);
    const hexAddress = KeyringHelper.getHexAddressEvm(privKey);
    const nonce = await request(rpc, "eth_getTransactionCount", hexAddress);
    const rawTxHex = KeyringHelper.getRawTxEvm(
      privKey,
      chainId,
      nonce,
      message
    );
    const response = await request(rpc, "eth_sendRawTransaction", [rawTxHex]);
    return response;
  }

  public async signAndBroadcastEthereum(
    env: Env,
    chainId: string,
    coinType: number,
    rpc: string,
    message: object
  ): Promise<string> {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    if (!this.keyStore) {
      throw new Error("Key Store is empty");
    }

    const networkType = getNetworkTypeByChainId(chainId);
    if (networkType !== "evm") {
      throw new Error(
        "Invalid coin type passed in to Ethereum signing (expected 60)"
      );
    }

    if (this.keyStore.type === "ledger") {
      return this.processSignLedgerEvm(env, chainId, rpc, message);
    } else {
      // if (chainId === ChainIdEnum.Oasis) {
      //   const data = message as any;

      //   const chainInfo = await this.chainsService.getChainInfo(chainId as string);

      //   const amount = new CoinPretty(chainInfo.feeCurrencies[0], new Int(Number(data.value))).toDec().toString();

      //   const res = await this.signOasis(chainId, {
      //     amount: amount,
      //     to: (data as any).to
      //   });

      //   return res;
      // }

      return this.processSignEvm(chainId, coinType, rpc, message);
    }
  }

  protected getKeyPairBtc(chainId: string, keyDerivation: string = "84") {
    let keyPair;
    if (!!this.mnemonic) {
      keyPair = getKeyPairByMnemonic({
        mnemonic: this.mnemonic,
        selectedCrypto: chainId as string,
        keyDerivationPath: keyDerivation,
      });
    } else if (!!this.privateKey) {
      keyPair = getKeyPairByPrivateKey({
        privateKey: this.privateKey,
        selectedCrypto: chainId as string,
      });
    }
    if (!keyPair) throw Error("Your Mnemonic or Private Key is invalid");
    return keyPair;
  }

  public async signAndBroadcastBitcoin(
    env: Env,
    chainId: string,
    message: any
  ): Promise<string> {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    if (!this.keyStore) {
      throw new Error("Key Store is empty");
    }

    const networkType = getNetworkTypeByChainId(chainId);
    if (networkType !== "bitcoin") {
      throw new Error(
        "Invalid coin type passed in to Ethereum signing (expected 60)"
      );
    }
    if (!chainId) throw Error("ChainID Not Empty");

    if (this.keyStore.type === "ledger") {
      const messageHex = Buffer.from(JSON.stringify(message));
      const signature = await this.sign(
        env,
        chainId,
        getCoinTypeByChainId(chainId),
        messageHex
      );
      const txRes = await wallet.pushtx.default({
        rawTx: signature,
        selectedCrypto: chainId,
      });

      if (txRes?.error) {
        throw Error(txRes?.data?.message || "Transaction Failed");
      }
      if (txRes?.data?.code) {
        throw Error(txRes?.data?.message || "Transaction Failed");
      }
      return txRes?.data;
    } else {
      const addressType = getAddressTypeByAddress(
        message.msgs.changeAddress
      ) as AddressBtcType;
      const keyDerivation = getKeyDerivationFromAddressType(addressType);
      const keyPair = this.getKeyPairBtc(chainId, keyDerivation);

      const res = (await createTransaction({
        selectedCrypto: chainId,
        keyPair: keyPair,
        utxos: message.utxos,
        recipient: message.msgs.address,
        amount: message.msgs.amount,
        sender: message.msgs.changeAddress,
        message: message.msgs.message ?? "",
        totalFee: message.msgs.totalFee,
        transactionFee: message.msgs.feeRate ?? MIN_FEE_RATE,
      })) as any;

      if (res.error) {
        throw Error(res?.data?.message || "Transaction Failed");
      }
      const txRes = await wallet.pushtx.default({
        rawTx: res.data,
        selectedCrypto: chainId,
        service: "fallback",
      });

      if (txRes?.error) {
        throw Error(txRes?.data?.message || "Transaction Failed");
      }
      if (txRes?.data?.code) {
        throw Error(txRes?.data?.message || "Transaction Failed");
      }
      return txRes?.data;
    }
  }

  public async signEthereum(
    privKey: PrivKeySecp256k1,
    message: Uint8Array
  ): Promise<Uint8Array> {
    const ethWallet = new Wallet(privKey.toBytes());
    const signature = ethWallet._signingKey().signDigest(keccak256(message));
    const splitSignature = BytesUtils.splitSignature(signature);
    return BytesUtils.arrayify(
      BytesUtils.concat([splitSignature.r, splitSignature.s])
    );
  }

  public async signProxyDecryptionData(
    chainId: string,
    message: object
  ): Promise<object> {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    if (!this.keyStore) {
      throw new Error("Key Store is empty");
    }

    const privKey = this.loadPrivKey(getCoinTypeByChainId(chainId));
    const privKeyHex = Buffer.from(privKey.toBytes()).toString("hex");
    const decryptedData = PRE.decryptData(privKeyHex, message[0]);
    return {
      decryptedData,
    };
  }

  public async signProxyReEncryptionData(
    chainId: string,
    message: object
  ): Promise<object> {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    if (!this.keyStore) {
      throw new Error("Key Store is empty");
    }

    const privKey = this.loadPrivKey(getCoinTypeByChainId(chainId));
    const privKeyHex = Buffer.from(privKey.toBytes()).toString("hex");
    const rk = PRE.generateReEncrytionKey(privKeyHex, message[0]);

    return {
      rk,
    };
  }

  public async signDecryptData(
    chainId: string,
    message: object
  ): Promise<object> {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    if (!this.keyStore) {
      throw new Error("Key Store is empty");
    }

    try {
      const privKey = this.loadPrivKey(60);
      const privKeyBuffer = Buffer.from(privKey.toBytes());

      const response = await Promise.all(
        message[0].map(async (data: any) => {
          const encryptedData = {
            ciphertext: Buffer.from(data.ciphertext, "hex"),
            ephemPublicKey: Buffer.from(data.ephemPublicKey, "hex"),
            iv: Buffer.from(data.iv, "hex"),
            mac: Buffer.from(data.mac, "hex"),
          };

          const decryptResponse = await eccrypto.decrypt(
            privKeyBuffer,
            encryptedData
          );

          return decryptResponse;
        })
      );

      return {
        data: response,
      };
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }

  // thang7
  public async signReEncryptData(
    chainId: string,
    message: object
  ): Promise<object> {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    if (!this.keyStore) {
      throw new Error("Key Store is empty");
    }
    try {
      const privKey = this.loadPrivKey(60);
      const privKeyBuffer = Buffer.from(privKey.toBytes());
      const response = await Promise.all(
        message[0].map(async (data) => {
          const encryptedData = {
            ciphertext: Buffer.from(data.ciphertext, "hex"),
            ephemPublicKey: Buffer.from(data.ephemPublicKey, "hex"),
            iv: Buffer.from(data.iv, "hex"),
            mac: Buffer.from(data.mac, "hex"),
          };
          const decryptedData = await eccrypto.decrypt(
            privKeyBuffer,
            encryptedData
          );
          const reEncryptedData = await eccrypto.encrypt(
            Buffer.from(data.publicKey, "hex"),
            Buffer.from(decryptedData.toString(), "utf-8")
          );
          const address = Buffer.from(
            publicToAddress(Buffer.from(data.publicKey, "hex"), true)
          ).toString("hex");
          return {
            ...reEncryptedData,
            address,
          };
        })
      );

      return {
        data: response,
      };
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }

  public async getPublicKey(chainId: string): Promise<string | Uint8Array> {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    if (!this.keyStore) {
      throw new Error("Key Store is empty");
    }

    // if (chainId === ChainIdEnum.Oasis) {
    //   const pubKey = await this.loadPublicKeyOasis();
    //   return pubKey;
    // }

    const privKey = this.loadPrivKey(getCoinTypeByChainId(chainId));

    // And Oasis here
    const pubKeyHex =
      "04" + privateToPublic(Buffer.from(privKey.toBytes())).toString("hex");

    return pubKeyHex;
  }

  public signEthereumTypedData<
    V extends SignTypedDataVersion,
    T extends MessageTypes
  >({
    typedMessage,
    version,
    chainId,
    defaultCoinType,
  }: {
    typedMessage: V extends "V1" ? TypedDataV1 : TypedMessage<T>;
    version: V;
    chainId: string;
    defaultCoinType: number;
  }): ECDSASignature {
    try {
      this.validateVersion(version);
      if (!typedMessage) {
        throw new Error("Missing data parameter");
      }

      const coinType = this.computeKeyStoreCoinType(chainId, defaultCoinType);
      // Need to check network type by chain id instead of coin type
      const networkType = getNetworkTypeByChainId(chainId);
      // if (coinType !== 60) {
      if (networkType !== "evm") {
        throw new Error(
          "Invalid coin type passed in to Ethereum signing (expected 60)"
        );
      }

      const privateKey = this.loadPrivKey(coinType).toBytes();

      const messageHash =
        version === SignTypedDataVersion.V1
          ? this._typedSignatureHash(typedMessage as TypedDataV1)
          : this.eip712Hash(
              typedMessage as TypedMessage<T>,
              version as SignTypedDataVersion.V3 | SignTypedDataVersion.V4
            );
      const sig = ecsign(messageHash, Buffer.from(privateKey));
      return sig;
    } catch (error) {
      console.log("Error on sign typed data: ", error);
    }
  }

  /**
   * Generate the "V1" hash for the provided typed message.
   *
   * The hash will be generated in accordance with an earlier version of the EIP-712
   * specification. This hash is used in `signTypedData_v1`.
   *
   * @param typedData - The typed message.
   * @returns The hash representing the type of the provided message.
   */

  private _typedSignatureHash(typedData: TypedDataV1): Buffer {
    const error = new Error("Expect argument to be non-empty array");
    if (
      typeof typedData !== "object" ||
      !("length" in typedData) ||
      !typedData.length
    ) {
      throw error;
    }

    const data = typedData.map(function (e) {
      if (e.type !== "bytes") {
        return e.value;
      }

      return typeof e.value === "string" && !e.value.startsWith("0x")
        ? Buffer.from(e.value)
        : toBuffer(e.value);
    });
    const types = typedData.map(function (e) {
      return e.type;
    });
    const schema = typedData.map(function (e) {
      if (!e.name) {
        throw error;
      }
      return `${e.type} ${e.name}`;
    });

    return soliditySHA3(
      ["bytes32", "bytes32"],
      [
        soliditySHA3(new Array(typedData.length).fill("string"), schema),
        soliditySHA3(types, data),
      ]
    );
  }

  private eip712Hash<T extends MessageTypes>(
    typedData: TypedMessage<T>,
    version: SignTypedDataVersion.V3 | SignTypedDataVersion.V4
  ): Buffer {
    this.validateVersion(version, [
      SignTypedDataVersion.V3,
      SignTypedDataVersion.V4,
    ]);

    const sanitizedData = this.sanitizeData(typedData);
    const parts = [Buffer.from("1901", "hex")];
    parts.push(
      this.hashStruct(
        "EIP712Domain",
        sanitizedData.domain,
        sanitizedData.types,
        version
      )
    );

    if (sanitizedData.primaryType !== "EIP712Domain") {
      parts.push(
        this.hashStruct(
          // TODO: Validate that this is a string, so this type cast can be removed.
          sanitizedData.primaryType as string,
          sanitizedData.message,
          sanitizedData.types,
          version
        )
      );
    }

    return keccak(Buffer.concat(parts));
  }

  private sanitizeData<T extends MessageTypes>(
    data: TypedMessage<T>
  ): TypedMessage<T> {
    const sanitizedData: Partial<TypedMessage<T>> = {};
    for (const key in TYPED_MESSAGE_SCHEMA.properties) {
      if (data[key]) {
        sanitizedData[key] = data[key];
      }
    }

    if ("types" in sanitizedData) {
      sanitizedData.types = { EIP712Domain: [], ...sanitizedData.types };
    }
    return sanitizedData as Required<TypedMessage<T>>;
  }

  private hashStruct(
    primaryType: string,
    data: Record<string, unknown>,
    types: Record<string, MessageTypeProperty[]>,
    version: SignTypedDataVersion.V3 | SignTypedDataVersion.V4
  ): Buffer {
    this.validateVersion(version, [
      SignTypedDataVersion.V3,
      SignTypedDataVersion.V4,
    ]);

    return keccak(this.encodeData(primaryType, data, types, version));
  }

  private encodeData(
    primaryType: string,
    data: Record<string, unknown>,
    types: Record<string, MessageTypeProperty[]>,
    version: SignTypedDataVersion.V3 | SignTypedDataVersion.V4
  ): Buffer {
    this.validateVersion(version, [
      SignTypedDataVersion.V3,
      SignTypedDataVersion.V4,
    ]);

    const encodedTypes = ["bytes32"];
    const encodedValues: unknown[] = [this.hashType(primaryType, types)];

    for (const field of types[primaryType]) {
      if (
        version === SignTypedDataVersion.V3 &&
        data[field.name] === undefined
      ) {
        continue;
      }
      const [type, value] = this.encodeField(
        types,
        field.name,
        field.type,
        data[field.name],
        version
      );
      encodedTypes.push(type);
      encodedValues.push(value);
    }

    return rawEncode(encodedTypes, encodedValues);
  }

  private encodeField(
    types: Record<string, MessageTypeProperty[]>,
    name: string,
    type: string,
    value: any,
    version: SignTypedDataVersion.V3 | SignTypedDataVersion.V4
  ): [type: string, value: any] {
    this.validateVersion(version, [
      SignTypedDataVersion.V3,
      SignTypedDataVersion.V4,
    ]);

    if (types[type] !== undefined) {
      return [
        "bytes32",
        version === SignTypedDataVersion.V4 && value == null // eslint-disable-line no-eq-null
          ? "0x0000000000000000000000000000000000000000000000000000000000000000"
          : keccak(this.encodeData(type, value, types, version)),
      ];
    }

    if (value === undefined) {
      throw new Error(`missing value for field ${name} of type ${type}`);
    }

    if (type === "bytes") {
      return ["bytes32", keccak(value)];
    }

    if (type === "string") {
      // convert string to buffer - prevents ethUtil from interpreting strings like '0xabcd' as hex
      if (typeof value === "string") {
        value = Buffer.from(value, "utf8");
      }
      return ["bytes32", keccak(value)];
    }

    if (type.lastIndexOf("]") === type.length - 1) {
      if (version === SignTypedDataVersion.V3) {
        throw new Error(
          "Arrays are unimplemented in encodeData; use V4 extension"
        );
      }
      const parsedType = type.slice(0, type.lastIndexOf("["));
      const typeValuePairs = value.map((item) =>
        this.encodeField(types, name, parsedType, item, version)
      );
      return [
        "bytes32",
        keccak(
          rawEncode(
            typeValuePairs.map(([t]) => t),
            typeValuePairs.map(([, v]) => v)
          )
        ),
      ];
    }

    return [type, value];
  }

  private hashType(
    primaryType: string,
    types: Record<string, MessageTypeProperty[]>
  ): Buffer {
    return keccak(Buffer.from(this.encodeType(primaryType, types)));
  }

  private encodeType(
    primaryType: string,
    types: Record<string, MessageTypeProperty[]>
  ): string {
    let result = "";
    const unsortedDeps = this.findTypeDependencies(primaryType, types);
    unsortedDeps.delete(primaryType);

    const deps = [primaryType, ...Array.from(unsortedDeps).sort()];
    for (const type of deps) {
      const children = types[type];
      if (!children) {
        throw new Error(`No type definition specified: ${type}`);
      }

      result += `${type}(${types[type]
        .map(({ name, type: t }) => `${t} ${name}`)
        .join(",")})`;
    }

    return result;
  }

  private findTypeDependencies(
    primaryType: string,
    types: Record<string, MessageTypeProperty[]>,
    results: Set<string> = new Set()
  ): Set<string> {
    [primaryType] = primaryType.match(/^\w*/u);
    if (results.has(primaryType) || types[primaryType] === undefined) {
      return results;
    }

    results.add(primaryType);

    for (const field of types[primaryType]) {
      this.findTypeDependencies(field.type, types, results);
    }
    return results;
  }

  private validateVersion(
    version: SignTypedDataVersion,
    allowedVersions?: SignTypedDataVersion[]
  ) {
    if (!Object.keys(SignTypedDataVersion).includes(version)) {
      throw new Error(`Invalid version: '${version}'`);
    } else if (allowedVersions && !allowedVersions.includes(version)) {
      throw new Error(
        `SignTypedDataVersion not allowed: '${version}'. Allowed versions are: ${allowedVersions.join(
          ", "
        )}`
      );
    }
  }

  // Show private key or mnemonic key if password is valid.
  public async showKeyRing(index: number, password: string): Promise<string> {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    if (this.password !== password) {
      throw new Error("Invalid password");
    }

    const keyStore = this.multiKeyStore[index];

    if (!keyStore) {
      throw new Error("Empty key store");
    }
    // If password is invalid, error will be thrown.
    return Buffer.from(
      await Crypto.decrypt(this.crypto, keyStore, password)
    ).toString();
  }

  public get canSetPath(): boolean {
    return this.type === "mnemonic" || this.type === "ledger";
  }

  public async addMnemonicKey(
    kdf: "scrypt" | "sha256" | "pbkdf2",
    mnemonic: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    if (this.password == "") {
      await this.restore();
    }

    if (this.password == "") {
      throw new OWalletError(
        "keyring",
        141,
        "Key ring is locked or not initialized"
      );
    }

    const keyStore = await KeyRing.CreateMnemonicKeyStore(
      this.rng,
      this.crypto,
      kdf,
      mnemonic,
      this.password,
      await this.assignKeyStoreIdMeta(meta),
      bip44HDPath
    );
    this.multiKeyStore.push(keyStore);

    await this.save();
    return {
      multiKeyStoreInfo: await this.getMultiKeyStoreInfo(),
    };
  }

  public async addPrivateKey(
    kdf: "scrypt" | "sha256" | "pbkdf2",
    privateKey: Uint8Array,
    meta: Record<string, string>
  ): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    if (this.password == "") {
      await this.restore();
    }

    if (this.password == "") {
      throw new OWalletError(
        "keyring",
        141,
        "Key ring is locked or not initialized"
      );
    }

    const keyStore = await KeyRing.CreatePrivateKeyStore(
      this.rng,
      this.crypto,
      kdf,
      privateKey,
      this.password,
      await this.assignKeyStoreIdMeta(meta)
    );
    this.multiKeyStore.push(keyStore);

    await this.save();
    return {
      multiKeyStoreInfo: await this.getMultiKeyStoreInfo(),
    };
  }

  public async addLedgerKey(
    env: Env,
    kdf: "scrypt" | "sha256" | "pbkdf2",
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    try {
      if (this.password == "") {
        await this.restore();
      }

      if (this.password == "") {
        throw new OWalletError(
          "keyring",
          141,
          "Key ring is locked or not initialized"
        );
      }
      const ledgerAppType = getNetworkTypeByBip44HDPath(bip44HDPath);
      const hdPath = convertBip44ToHDPath(bip44HDPath);
      const { publicKey, address } =
        (await this.ledgerKeeper.getPublicKey(env, hdPath, ledgerAppType)) ||
        {};

      const keyStore = await KeyRing.CreateLedgerKeyStore(
        this.rng,
        this.crypto,
        kdf,
        publicKey,
        this.password,
        await this.assignKeyStoreIdMeta(meta),
        bip44HDPath,
        {
          [ledgerAppType]: address,
        }
      );

      this.multiKeyStore.push(keyStore);

      await this.save();

      return {
        multiKeyStoreInfo: await this.getMultiKeyStoreInfo(),
      };
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  public async changeKeyStoreFromMultiKeyStore(index: number): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    if (this.password == "") {
      await this.restore();
    }

    if (this.password == "") {
      throw new OWalletError(
        "keyring",
        141,
        "Key ring is locked or not initialized"
      );
    }

    const keyStore = this.multiKeyStore[index];
    if (!keyStore) {
      throw new Error("Invalid keystore");
    }

    this.keyStore = keyStore;

    await this.unlock(this.password);

    await this.save();
    return {
      multiKeyStoreInfo: await this.getMultiKeyStoreInfo(),
    };
  }

  public getMultiKeyStoreInfo(): MultiKeyStoreInfoWithSelected {
    const result: MultiKeyStoreInfoWithSelected = [];

    for (const keyStore of this.multiKeyStore) {
      result.push({
        version: keyStore.version,
        type: keyStore.type,
        addresses: keyStore.addresses,
        pubkeys: keyStore.pubkeys,
        meta: keyStore.meta,
        coinTypeForChain: keyStore.coinTypeForChain,
        bip44HDPath: keyStore.bip44HDPath,
        selected: this.keyStore
          ? KeyRing.getKeyStoreId(keyStore) ===
            KeyRing.getKeyStoreId(this.keyStore)
          : false,
      });
    }

    return result;
  }

  checkPassword(password: string): boolean {
    if (!this.password) {
      throw new Error("Keyring is locked");
    }

    return this.password === password;
  }

  async exportKeyRingDatas(password: string): Promise<ExportKeyRingData[]> {
    if (!this.password) {
      throw new Error("Keyring is locked");
    }

    if (this.password !== password) {
      throw new Error("Invalid password");
    }

    const result: ExportKeyRingData[] = [];

    for (const keyStore of this.multiKeyStore) {
      const type = keyStore.type ?? "mnemonic";

      switch (type) {
        case "mnemonic": {
          const mnemonic = Buffer.from(
            await Crypto.decrypt(this.crypto, keyStore, password)
          ).toString();

          result.push({
            bip44HDPath: keyStore.bip44HDPath ?? {
              account: 0,
              change: 0,
              addressIndex: 0,
            },
            coinTypeForChain: keyStore.coinTypeForChain,
            key: mnemonic,
            meta: keyStore.meta ?? {},
            type: "mnemonic",
          });

          break;
        }
        case "privateKey": {
          const privateKey = Buffer.from(
            await Crypto.decrypt(this.crypto, keyStore, password)
          ).toString();

          result.push({
            bip44HDPath: keyStore.bip44HDPath ?? {
              account: 0,
              change: 0,
              addressIndex: 0,
            },
            coinTypeForChain: keyStore.coinTypeForChain,
            key: privateKey,
            meta: keyStore.meta ?? {},
            type: "privateKey",
          });

          break;
        }
      }
    }

    return result;
  }

  private static async CreateMnemonicKeyStore(
    rng: RNG,
    crypto: CommonCrypto,
    kdf: "scrypt" | "sha256" | "pbkdf2",
    mnemonic: string,
    password: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<KeyStore> {
    return await Crypto.encrypt(
      rng,
      crypto,
      kdf,
      "mnemonic",
      mnemonic,
      password,
      meta,
      bip44HDPath
    );
  }

  private static async CreatePrivateKeyStore(
    rng: RNG,
    crypto: CommonCrypto,
    kdf: "scrypt" | "sha256" | "pbkdf2",
    privateKey: Uint8Array,
    password: string,
    meta: Record<string, string>
  ): Promise<KeyStore> {
    return await Crypto.encrypt(
      rng,
      crypto,
      kdf,
      "privateKey",
      Buffer.from(privateKey).toString("hex"),
      password,
      meta
    );
  }

  private static async CreateLedgerKeyStore(
    rng: RNG,
    crypto: CommonCrypto,
    kdf: "scrypt" | "sha256" | "pbkdf2",
    publicKey: Uint8Array,
    password: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath,
    addresses?: AddressesLedger
  ): Promise<KeyStore> {
    return await Crypto.encrypt(
      rng,
      crypto,
      kdf,
      "ledger",
      Buffer.from(publicKey).toString("hex"),
      password,
      meta,
      bip44HDPath,
      addresses
    );
  }

  private async assignKeyStoreIdMeta(meta: { [key: string]: string }): Promise<{
    [key: string]: string;
  }> {
    // `__id__` is used to distinguish the key store.
    return Object.assign({}, meta, {
      __id__: (await this.getIncrementalNumber()).toString(),
    });
  }

  private static getKeyStoreId(keyStore: KeyStore): string {
    const id = keyStore.meta?.__id__;
    if (!id) {
      throw new Error("Key store's id is empty");
    }

    return id;
  }

  private static getKeyStoreBIP44Path(keyStore: KeyStore): BIP44HDPath {
    if (!keyStore.bip44HDPath) {
      return {
        coinType: 118,
        account: 0,
        change: 0,
        addressIndex: 0,
      };
    }
    KeyRing.validateBIP44Path(keyStore.bip44HDPath);
    return keyStore.bip44HDPath;
  }

  public static validateBIP44Path(bip44Path: BIP44HDPath): void {
    if (!Number.isInteger(bip44Path.account) || bip44Path.account < 0) {
      throw new Error("Invalid account in hd path");
    }

    if (
      !Number.isInteger(bip44Path.change) ||
      !(bip44Path.change === 0 || bip44Path.change === 1)
    ) {
      throw new Error("Invalid change in hd path");
    }

    if (
      !Number.isInteger(bip44Path.addressIndex) ||
      bip44Path.addressIndex < 0
    ) {
      throw new Error("Invalid address index in hd path");
    }
  }

  private async getIncrementalNumber(): Promise<number> {
    let num = await this.kvStore.get<number>("incrementalNumber");
    if (num === undefined) {
      num = 0;
    }
    num++;

    await this.kvStore.set("incrementalNumber", num);
    return num;
  }
}

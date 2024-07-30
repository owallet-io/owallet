import { delay, inject, singleton } from "tsyringe";
import { TYPES } from "../types";

import {
  Key,
  KeyRing,
  KeyRingStatus,
  MultiKeyStoreInfoWithSelected,
} from "./keyring";

import {
  Bech32Address,
  checkAndValidateADR36AminoSignDoc,
  makeADR36AminoSignDoc,
  verifyADR36AminoSignDoc,
} from "@owallet/cosmos";
import {
  CommonCrypto,
  ECDSASignature,
  ExportKeyRingData,
  MessageTypes,
  SignEthereumTypedDataObject,
  SignTypedDataVersion,
  TypedMessage,
} from "./types";
import TronWeb from "tronweb";

import {
  KVStore,
  EVMOS_NETWORKS,
  MyBigInt,
  escapeHTML,
  sortObjectByKey,
  ChainIdEnum,
  EXTRA_FEE_LIMIT_TRON,
  DEFAULT_FEE_LIMIT_TRON,
  TRIGGER_TYPE,
  DenomHelper,
  TronWebProvider,
} from "@owallet/common";
import { ChainsService } from "../chains";
import { LedgerService } from "../ledger";
import {
  BIP44,
  ChainInfo,
  OWalletSignOptions,
  StdSignDoc,
  BIP44HDPath,
  AddressesLedger,
  DAPP_CONNECT_STATUS,
} from "@owallet/types";
import { APP_PORT, Env, OWalletError, WEBPAGE_PORT } from "@owallet/router";
import { InteractionService } from "../interaction";
import { PermissionService } from "../permission";
import { SignDoc } from "@owallet/proto-types/cosmos/tx/v1beta1/tx";
import {
  encodeSecp256k1Signature,
  serializeSignDoc,
  AminoSignResponse,
  StdSignature,
} from "@cosmjs/launchpad";

import { DirectSignResponse, makeSignBytes } from "@cosmjs/proto-signing";
import { RNG } from "@owallet/crypto";
import { encodeSecp256k1Pubkey } from "@owallet/cosmos";
import { Buffer } from "buffer/";
import { request } from "../tx";
import { CoinPretty, Dec, DecUtils, Int } from "@owallet/unit";
import { trimAminoSignDoc } from "./amino-sign-doc";
import { KeyringHelper } from "./utils";
import * as oasis from "@oasisprotocol/client";
import { ISimulateSignTron } from "@owallet/types";

@singleton()
export class KeyRingService {
  private readonly keyRing: KeyRing;

  constructor(
    @inject(TYPES.KeyRingStore)
    protected readonly kvStore: KVStore,
    @inject(TYPES.ChainsEmbedChainInfos)
    embedChainInfos: ChainInfo[],
    @inject(delay(() => InteractionService))
    protected readonly interactionService: InteractionService,
    @inject(delay(() => ChainsService))
    public readonly chainsService: ChainsService,
    @inject(delay(() => PermissionService))
    public readonly permissionService: PermissionService,
    @inject(LedgerService)
    ledgerService: LedgerService,
    @inject(TYPES.RNG)
    protected readonly rng: RNG,
    @inject(TYPES.CommonCrypto)
    protected readonly crypto: CommonCrypto
  ) {
    this.keyRing = new KeyRing(
      chainsService,
      kvStore,
      ledgerService,
      rng,
      crypto
    );
  }

  async restore(): Promise<{
    status: KeyRingStatus;
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    await this.keyRing.restore();
    return {
      status: this.keyRing.status,
      multiKeyStoreInfo: this.keyRing.getMultiKeyStoreInfo(),
    };
  }

  async enable(env: Env): Promise<KeyRingStatus> {
    if (this.keyRing.status === KeyRingStatus.EMPTY) {
      throw new OWalletError("keyring", 261, "key doesn't exist");
    }

    if (this.keyRing.status === KeyRingStatus.NOTLOADED) {
      await this.keyRing.restore();
    }

    if (this.keyRing.status === KeyRingStatus.LOCKED) {
      try {
        await this.interactionService.waitApprove(env, "/unlock", "unlock", {});
        return this.keyRing.status;
      } catch (error) {
        throw Error(error);
      }
    }

    return this.keyRing.status;
  }

  get keyRingStatus(): KeyRingStatus {
    return this.keyRing.status;
  }

  async deleteKeyRing(
    index: number,
    password: string
  ): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
    status: KeyRingStatus;
  }> {
    let keyStoreChanged = false;

    try {
      const result = await this.keyRing.deleteKeyRing(index, password);
      keyStoreChanged = result.keyStoreChanged;
      return {
        multiKeyStoreInfo: result.multiKeyStoreInfo,
        status: this.keyRing.status,
      };
    } finally {
      if (keyStoreChanged) {
        this.interactionService.dispatchEvent(
          WEBPAGE_PORT,
          "keystore-changed",
          {}
        );
      }
    }
  }

  async requestSignProxyDecryptionData(
    env: Env,
    chainId: string,
    data: object
  ): Promise<object> {
    try {
      const rpc = await this.chainsService.getChainInfo(chainId);
      const rpcCustom = EVMOS_NETWORKS.includes(chainId)
        ? rpc.evmRpc
        : rpc.rest;
      const newData = await this.estimateFeeAndWaitApprove(
        env,
        chainId,
        rpcCustom,
        data
      );
      const rawTxHex = await this.keyRing.signProxyDecryptionData(
        chainId,
        newData
      );

      return rawTxHex;
    } catch (e) {
      console.log("e", e.message);
    } finally {
      this.interactionService.dispatchEvent(
        APP_PORT,
        "request-sign-ethereum-end",
        {}
      );
    }
  }

  async requestSignProxyReEncryptionData(
    env: Env,
    chainId: string,
    data: object
  ): Promise<object> {
    try {
      const rpc = await this.chainsService.getChainInfo(chainId);
      const rpcCustom = EVMOS_NETWORKS.includes(chainId)
        ? rpc.evmRpc
        : rpc.rest;
      const newData = await this.estimateFeeAndWaitApprove(
        env,
        chainId,
        rpcCustom,
        data
      );
      const rawTxHex = await this.keyRing.signProxyReEncryptionData(
        chainId,
        newData
      );

      return rawTxHex;
    } catch (e) {
      console.log("e", e.message);
    } finally {
      this.interactionService.dispatchEvent(
        APP_PORT,
        "request-sign-ethereum-end",
        {}
      );
    }
  }

  async updateNameKeyRing(
    index: number,
    name: string,
    email?: string
  ): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    const multiKeyStoreInfo = await this.keyRing.updateNameKeyRing(
      index,
      name,
      email
    );
    return {
      multiKeyStoreInfo,
    };
  }

  async showKeyRing(
    index: number,
    password: string,
    chainId: string | number,
    isShowPrivKey: boolean
  ): Promise<string> {
    return await this.keyRing.showKeyRing(
      index,
      password,
      chainId,
      isShowPrivKey
    );
  }

  async simulateSignTron(transaction: any): Promise<any> {
    const signedTx = await this.keyRing.simulateSignTron(transaction);
    return signedTx;
  }

  async createMnemonicKey(
    kdf: "scrypt" | "sha256" | "pbkdf2",
    mnemonic: string,
    password: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<{
    status: KeyRingStatus;
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    // TODO: Check mnemonic checksum.
    return await this.keyRing.createMnemonicKey(
      kdf,
      mnemonic,
      password,
      meta,
      bip44HDPath
    );
  }

  async createPrivateKey(
    kdf: "scrypt" | "sha256" | "pbkdf2",
    privateKey: Uint8Array,
    password: string,
    meta: Record<string, string>
  ): Promise<{
    status: KeyRingStatus;
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    return await this.keyRing.createPrivateKey(kdf, privateKey, password, meta);
  }

  async createLedgerKey(
    env: Env,
    kdf: "scrypt" | "sha256" | "pbkdf2",
    password: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<{
    status: KeyRingStatus;
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    return await this.keyRing.createLedgerKey(
      env,
      kdf,
      password,
      meta,
      bip44HDPath
    );
  }

  lock(): KeyRingStatus {
    this.keyRing.lock();
    return this.keyRing.status;
  }

  async unlock(password: string, saving: boolean): Promise<KeyRingStatus> {
    await this.keyRing.unlock(password, saving);

    return this.keyRing.status;
  }

  async getKey(chainIdOrCoinType: string | number): Promise<Key> {
    // if getKey directly from cointype as number
    if (typeof chainIdOrCoinType === "number") {
      return this.keyRing.getKeyFromCoinType(chainIdOrCoinType);
    }
    return this.keyRing.getKey(
      chainIdOrCoinType,
      await this.chainsService.getChainCoinType(chainIdOrCoinType)
    );
  }

  getKeyStoreMeta(key: string): string {
    return this.keyRing.getKeyStoreMeta(key);
  }

  getKeyRingType(): string {
    return this.keyRing.type;
  }

  getKeyRingLedgerAddresses(): AddressesLedger {
    return this.keyRing.addresses;
  }

  getKeyRingLedgerPubKey(): AddressesLedger {
    return this.keyRing.pubkeys;
  }

  async requestSignEIP712CosmosTx_v0_selected(
    env: Env,
    origin: string,
    chainId: string,
    signer: string,
    eip712: {
      types: Record<string, { name: string; type: string }[] | undefined>;
      domain: Record<string, any>;
      primaryType: string;
    },
    signDoc: StdSignDoc,
    signOptions: OWalletSignOptions
  ): Promise<AminoSignResponse> {
    return this.requestSignEIP712CosmosTx_v0(
      env,
      origin,
      chainId,
      signer,
      eip712,
      signDoc,
      signOptions
    );
  }

  async processSignDocEIP712(
    signDoc: StdSignDoc,
    chainId: string,
    signer: string,
    keyInfo: Key
  ) {
    const chainInfo = await this.chainsService.getChainInfo(chainId);
    const isEthermint = KeyringHelper.isEthermintByChainInfo(chainInfo);
    if (!isEthermint) {
      throw new Error("This feature is only usable on cosmos-sdk evm chain");
    }

    if (!keyInfo.isNanoLedger) {
      throw new Error("This feature is only usable on ledger ethereum app");
    }
    const bech32Prefix = (await this.chainsService.getChainInfo(chainId))
      .bech32Config.bech32PrefixAccAddr;
    const bech32Address = new Bech32Address(keyInfo.address).toBech32(
      bech32Prefix
    );
    if (signer !== bech32Address) {
      throw new Error("Signer mismatched");
    }
    signDoc = {
      ...signDoc,
      memo: escapeHTML(signDoc.memo),
    };
    signDoc = trimAminoSignDoc(signDoc);
    const sortSignDoc = sortObjectByKey(signDoc);
    return sortSignDoc;
  }

  async requestSignEIP712CosmosTx_v0(
    env: Env,
    origin: string,
    chainId: string,
    signer: string,
    eip712: {
      types: Record<string, { name: string; type: string }[] | undefined>;
      domain: Record<string, any>;
      primaryType: string;
    },
    signDoc: StdSignDoc,
    signOptions: OWalletSignOptions
  ): Promise<AminoSignResponse> {
    const coinType = await this.chainsService.getChainCoinType(chainId);
    const keyInfo = await this.keyRing.getKey(chainId, coinType);
    if (!keyInfo) {
      throw new Error("Null key info");
    }
    signDoc = await this.processSignDocEIP712(
      signDoc,
      chainId,
      signer,
      keyInfo
    );

    let newSignDoc = (await this.interactionService.waitApprove(
      env,
      "/sign",
      "request-sign",
      {
        msgOrigin: origin,
        chainId,
        mode: "amino",
        signDoc,
        signer,
        signOptions,
        pubKey: keyInfo.pubKey,
        eip712,
        keyType: this.getKeyRingType(),
      }
    )) as StdSignDoc;

    newSignDoc = {
      ...newSignDoc,
      memo: escapeHTML(newSignDoc.memo),
    };
    try {
      // const signature = null;
      const signature = await this.keyRing.sign(
        env,
        chainId,
        coinType,
        serializeSignDoc({
          ...newSignDoc,
          eip712,
        } as any)
      );

      return {
        signed: newSignDoc,
        signature: {
          pub_key: encodeSecp256k1Pubkey(keyInfo.pubKey),
          // Return eth signature (r | s | v) 65 bytes.
          signature: Buffer.from(signature).toString("base64"),
        },
      };
    } finally {
      this.interactionService.dispatchEvent(APP_PORT, "request-sign-end", {});
    }
  }

  async requestSignAmino(
    env: Env,
    msgOrigin: string,
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions: OWalletSignOptions & {
      // Hack option field to detect the sign arbitrary for string
      isADR36WithString?: boolean;
    }
  ): Promise<AminoSignResponse> {
    const coinType = await this.chainsService.getChainCoinType(chainId);

    const key = await this.keyRing.getKey(chainId, coinType);
    const bech32Prefix = (await this.chainsService.getChainInfo(chainId))
      .bech32Config.bech32PrefixAccAddr;
    const bech32Address = new Bech32Address(key.address).toBech32(bech32Prefix);
    if (signer !== bech32Address) {
      throw new Error("Signer mismatched");
    }

    const isADR36SignDoc = checkAndValidateADR36AminoSignDoc(
      signDoc,
      bech32Prefix
    );
    if (isADR36SignDoc) {
      if (signDoc.msgs[0].value.signer !== signer) {
        throw new OWalletError("keyring", 233, "Unmatched signer in sign doc");
      }
    }

    if (signOptions.isADR36WithString != null && !isADR36SignDoc) {
      throw new OWalletError(
        "keyring",
        236,
        'Sign doc is not for ADR-36. But, "isADR36WithString" option is defined'
      );
    }

    const newSignDoc = (await this.interactionService.waitApprove(
      env,
      "/sign",
      "request-sign",
      {
        msgOrigin,
        chainId,
        mode: "amino",
        signDoc,
        signer,
        signOptions,
        isADR36SignDoc,
        isADR36WithString: signOptions.isADR36WithString,
      }
    )) as StdSignDoc;

    if (isADR36SignDoc) {
      // Validate the new sign doc, if it was for ADR-36.
      if (checkAndValidateADR36AminoSignDoc(signDoc, bech32Prefix)) {
        if (signDoc.msgs[0].value.signer !== signer) {
          throw new OWalletError(
            "keyring",
            232,
            "Unmatched signer in new sign doc"
          );
        }
      } else {
        throw new OWalletError(
          "keyring",
          237,
          "Signing request was for ADR-36. But, accidentally, new sign doc is not for ADR-36"
        );
      }
    }

    try {
      const signature = await this.keyRing.sign(
        env,
        chainId,
        coinType,
        serializeSignDoc(newSignDoc)
      );

      return {
        signed: newSignDoc,
        signature: encodeSecp256k1Signature(key.pubKey, signature),
      };
    } finally {
      this.interactionService.dispatchEvent(APP_PORT, "request-sign-end", {});
    }
  }

  async requestSignDirect(
    env: Env,
    msgOrigin: string,
    chainId: string,
    signer: string,
    signDoc: SignDoc,
    signOptions: OWalletSignOptions
  ): Promise<DirectSignResponse> {
    const coinType = await this.chainsService.getChainCoinType(chainId);

    // sign get here
    const key = await this.keyRing.getKey(chainId, coinType);
    const bech32Address = new Bech32Address(key.address).toBech32(
      (await this.chainsService.getChainInfo(chainId)).bech32Config
        .bech32PrefixAccAddr
    );
    if (signer !== bech32Address) {
      throw new Error("Signer mismatched");
    }

    const newSignDocBytes = (await this.interactionService.waitApprove(
      env,
      "/sign",
      "request-sign",
      {
        msgOrigin,
        chainId,
        mode: "direct",
        signDocBytes: SignDoc.encode(signDoc).finish(),
        signer,
        signOptions,
      }
    )) as Uint8Array;

    const newSignDoc = SignDoc.decode(newSignDocBytes);

    try {
      const signature = await this.keyRing.sign(
        env,
        chainId,
        coinType,
        makeSignBytes(newSignDoc)
      );

      return {
        signed: newSignDoc,
        signature: encodeSecp256k1Signature(key.pubKey, signature),
      };
    } finally {
      this.interactionService.dispatchEvent(APP_PORT, "request-sign-end", {});
    }
  }

  async requestSignEthereum(
    env: Env,
    chainId: string,
    data: object
  ): Promise<string> {
    const coinType = await this.chainsService.getChainCoinType(chainId);
    const rpc = await this.chainsService.getChainInfo(chainId);
    const rpcCustom = EVMOS_NETWORKS.includes(chainId) ? rpc.evmRpc : rpc.rest;

    // Need to check ledger here and ledger app type by chainId
    try {
      // TODO: add UI here so users can change gas, memo & fee
      const newData = await this.estimateFeeAndWaitApprove(
        env,
        chainId,
        rpcCustom,
        data
      );
      const rawTxHex = await this.keyRing.signAndBroadcastEthereum(
        env,
        chainId,
        coinType,
        rpcCustom,
        newData
      );
      return rawTxHex;
    } finally {
      this.interactionService.dispatchEvent(
        APP_PORT,
        "request-sign-ethereum-end",
        {}
      );
    }
  }

  async requestSignEthereumTypedData(
    env: Env,
    chainId: string,
    data: SignEthereumTypedDataObject
    // ): Promise<ECDSASignature> {
  ): Promise<string> {
    try {
      const rawTxHex = await this.keyRing.signEthereumTypedData({
        typedMessage: data[1],
        version: SignTypedDataVersion.V4,
        chainId,
        defaultCoinType: 60,
      });

      return rawTxHex;
    } catch (e) {
      console.log("e", e.message);
    } finally {
      // this.interactionService.dispatchEvent(APP_PORT, "request-sign-end", {});
    }
  }

  async requestSignBitcoin(
    env: Env,
    chainId: string,
    data: object
  ): Promise<string> {
    const newData = (await this.interactionService.waitApprove(
      env,
      "/sign-bitcoin",
      "request-sign-bitcoin",
      {
        ...data,
        chainId,
      }
    )) as any;

    try {
      const txHash = await this.keyRing.signAndBroadcastBitcoin(
        env,
        chainId,
        newData
      );
      return txHash;
    } catch (error) {
      console.log({ error });
      throw error;
    } finally {
      this.interactionService.dispatchEvent(
        APP_PORT,
        "request-sign-bitcoin-end",
        {}
      );
    }
  }

  async requestPublicKey(env: Env, chainId: string): Promise<string> {
    try {
      const rawTxHex = (await this.keyRing.getPublicKey(chainId)) as string;
      return rawTxHex;
    } catch (e) {
      console.log("e", e.message);
    } finally {
      this.interactionService.dispatchEvent(
        APP_PORT,
        "request-sign-ethereum-end",
        {}
      );
    }
  }

  async requestSignDecryptData(
    env: Env,
    chainId: string,
    data: object
  ): Promise<object> {
    try {
      const rpc = await this.chainsService.getChainInfo(chainId);
      const rpcCustom = EVMOS_NETWORKS.includes(chainId)
        ? rpc.evmRpc
        : rpc.rest;
      const newData = await this.estimateFeeAndWaitApprove(
        env,
        chainId,
        rpcCustom,
        data
      );
      const rawTxHex = await this.keyRing.signDecryptData(chainId, newData);
      return rawTxHex;
    } catch (e) {
      console.log("e", e.message);
    } finally {
      this.interactionService.dispatchEvent(
        APP_PORT,
        "request-sign-ethereum-end",
        {}
      );
    }
  }

  async requestSignReEncryptData(
    env: Env,
    chainId: string,
    data: object
  ): Promise<object> {
    try {
      const rpc = await this.chainsService.getChainInfo(chainId);
      const rpcCustom = EVMOS_NETWORKS.includes(chainId)
        ? rpc.evmRpc
        : rpc.rest;
      const newData = await this.estimateFeeAndWaitApprove(
        env,
        chainId,
        rpcCustom,
        data
      );
      const rawTxHex = await this.keyRing.signReEncryptData(chainId, newData);

      return rawTxHex;
    } catch (e) {
      console.log("e", e.message);
    } finally {
      this.interactionService.dispatchEvent(
        APP_PORT,
        "request-sign-ethereum-end",
        {}
      );
    }
  }

  async setKeyStoreLedgerAddress(
    env: Env,
    bip44HDPath: string,
    chainId: string | number
  ): Promise<void> {
    await this.keyRing.setKeyStoreLedgerAddress(env, bip44HDPath, chainId);

    this.interactionService.dispatchEvent(WEBPAGE_PORT, "keystore-changed", {});
  }

  async estimateFeeAndWaitApprove(
    env: Env,
    chainId: string,
    rpc: string,
    data: object
  ): Promise<object> {
    const approveData = (await this.interactionService.waitApprove(
      env,
      "/sign-ethereum",
      "request-sign-ethereum",
      {
        env,
        chainId,
        mode: "direct",
        data: {
          ...data,
        },
      }
    )) as any;

    const { gasPrice, gasLimit, memo } = {
      gasPrice: approveData.gasPrice ?? "0x0",
      memo: approveData.memo ?? "",
      gasLimit: approveData.gasLimit,
    };

    return { ...data, gasPrice, gasLimit, memo };
  }

  async verifyADR36AminoSignDoc(
    chainId: string,
    signer: string,
    data: Uint8Array,
    signature: StdSignature
  ): Promise<boolean> {
    const coinType = await this.chainsService.getChainCoinType(chainId);

    const key = await this.keyRing.getKey(chainId, coinType);
    const bech32Prefix = (await this.chainsService.getChainInfo(chainId))
      .bech32Config.bech32PrefixAccAddr;
    const bech32Address = new Bech32Address(key.address).toBech32(bech32Prefix);
    if (signer !== bech32Address) {
      throw new Error("Signer mismatched");
    }
    if (signature.pub_key.type !== "tendermint/PubKeySecp256k1") {
      throw new Error(`Unsupported type of pub key: ${signature.pub_key.type}`);
    }
    if (
      Buffer.from(key.pubKey).toString("base64") !== signature.pub_key.value
    ) {
      throw new Error("Pub key unmatched");
    }

    const signDoc = makeADR36AminoSignDoc(signer, data);

    return verifyADR36AminoSignDoc(
      bech32Prefix,
      signDoc,
      Buffer.from(signature.pub_key.value, "base64"),
      Buffer.from(signature.signature, "base64")
    );
  }

  // here
  async sign(
    env: Env,
    chainId: string,
    message: Uint8Array
  ): Promise<Uint8Array> {
    return this.keyRing.sign(
      env,
      chainId,
      await this.chainsService.getChainCoinType(chainId),
      message
    );
  }

  async addMnemonicKey(
    kdf: "scrypt" | "sha256" | "pbkdf2",
    mnemonic: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    return this.keyRing.addMnemonicKey(kdf, mnemonic, meta, bip44HDPath);
  }

  async addPrivateKey(
    kdf: "scrypt" | "sha256" | "pbkdf2",
    privateKey: Uint8Array,
    meta: Record<string, string>
  ): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    return this.keyRing.addPrivateKey(kdf, privateKey, meta);
  }

  async addLedgerKey(
    env: Env,
    kdf: "scrypt" | "sha256" | "pbkdf2",
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    return this.keyRing.addLedgerKey(env, kdf, meta, bip44HDPath);
  }

  public async changeKeyStoreFromMultiKeyStore(index: number): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    try {
      return await this.keyRing.changeKeyStoreFromMultiKeyStore(index);
    } finally {
      this.interactionService.dispatchEvent(
        WEBPAGE_PORT,
        "keystore-changed",
        {}
      );
    }
  }

  public async changeChain(chainInfos: object = {}): Promise<void | any> {
    this.interactionService.dispatchEvent(WEBPAGE_PORT, "keystore-changed", {
      ...chainInfos,
    });
  }

  public checkPassword(password: string): boolean {
    return this.keyRing.checkPassword(password);
  }

  getMultiKeyStoreInfo(): MultiKeyStoreInfoWithSelected {
    return this.keyRing.getMultiKeyStoreInfo();
  }

  isKeyStoreCoinTypeSet(chainId: string): boolean {
    return this.keyRing.isKeyStoreCoinTypeSet(chainId);
  }

  async setKeyStoreCoinType(chainId: string, coinType: number): Promise<void> {
    const prevCoinType = this.keyRing.computeKeyStoreCoinType(
      chainId,
      await this.chainsService.getChainCoinType(chainId)
    );

    await this.keyRing.setKeyStoreCoinType(chainId, coinType);

    if (prevCoinType !== coinType) {
      this.interactionService.dispatchEvent(
        WEBPAGE_PORT,
        "keystore-changed",
        {}
      );
    }
  }

  async getKeyStoreBIP44Selectables(
    chainId: string,
    paths: BIP44[]
  ): Promise<{ readonly path: BIP44; readonly bech32Address: string }[]> {
    if (this.isKeyStoreCoinTypeSet(chainId)) {
      return [];
    }

    const result = [];
    const chainInfo = await this.chainsService.getChainInfo(chainId);

    for (const path of paths) {
      const key = await this.keyRing.getKeyFromCoinType(path.coinType);
      const bech32Address = new Bech32Address(key.address).toBech32(
        chainInfo.bech32Config.bech32PrefixAccAddr
      );

      result.push({
        path,
        bech32Address,
      });
    }

    return result;
  }

  async exportKeyRingDatas(password: string): Promise<ExportKeyRingData[]> {
    return await this.keyRing.exportKeyRingDatas(password);
  }

  async requestSendRawTransaction(
    _: Env,
    chainId: string,
    transaction: {
      raw_data: any;
      raw_data_hex: string;
      txID: string;
      visible?: boolean;
    }
  ) {
    try {
      const chainInfo = await this.chainsService.getChainInfo(chainId);
      const tronWeb = TronWebProvider(chainInfo.rpc);
      return await tronWeb.trx.sendRawTransaction(transaction);
    } catch (error) {
      throw error;
    }
  }

  async requestTriggerSmartContract(
    _: Env,
    chainId: string,
    data: {
      address: string;
      functionSelector: string;
      options: { feeLimit?: number };
      parameters;
      issuerAddress: string;
    }
  ): Promise<{
    result: any;
    transaction: {
      raw_data: any;
      raw_data_hex: string;
      txID: string;
      visible?: boolean;
    };
  }> {
    try {
      const chainInfo = await this.chainsService.getChainInfo(chainId);
      const tronWeb = TronWebProvider(chainInfo.rpc);

      const chainParameters = await tronWeb.trx.getChainParameters();

      const triggerConstantContract =
        await tronWeb.transactionBuilder.triggerConstantContract(
          data.address,
          data.functionSelector,
          {
            ...data.options,
            feeLimit: DEFAULT_FEE_LIMIT_TRON + Math.floor(Math.random() * 100),
          },
          data.parameters,
          data.issuerAddress
        );
      const energyFee = chainParameters.find(
        ({ key }) => key === "getEnergyFee"
      );
      const feeLimit = new Int(energyFee.value)
        .mul(new Int(triggerConstantContract.energy_used))
        .add(new Int(EXTRA_FEE_LIMIT_TRON));

      const triggerSmartContract =
        await tronWeb.transactionBuilder.triggerSmartContract(
          data.address,
          data.functionSelector,
          {
            ...data.options,
            feeLimit: feeLimit?.toString(),
            callValue: 0,
          },
          data.parameters,
          data.issuerAddress
        );
      const objStore = {
        address: data.address,
        functionSelector: data.functionSelector,
        options: {
          ...data.options,
        },
        parameters: data.parameters,
        issuerAddress: data.issuerAddress,
      };

      this.kvStore.set(
        `${TRIGGER_TYPE}:${triggerSmartContract.transaction.txID}`,
        objStore
      );
      return triggerSmartContract;
    } catch (error) {
      console.log(error, "error");
      throw error;
    }
  }

  async requestSignTron(
    env: Env,
    chainId: string,
    data: object
  ): Promise<object> {
    const newData = (await this.interactionService.waitApprove(
      env,
      "/sign-tron",
      "request-sign-tron",
      data
    )) as any;
    try {
      if (newData?.txID) {
        newData.signature = [
          Buffer.from(
            await this.keyRing.sign(env, chainId, 195, newData.txID)
          ).toString("hex"),
        ];
        return newData;
      }
      const chainInfo = await this.chainsService.getChainInfo(chainId);
      const tronWeb = TronWebProvider(chainInfo.rpc);

      let transaction: any;

      if (newData?.currency?.contractAddress) {
        transaction = (
          await tronWeb.transactionBuilder.triggerSmartContract(
            newData?.currency?.contractAddress,
            "transfer(address,uint256)",
            {
              callValue: 0,
              feeLimit: newData?.feeLimit ?? DEFAULT_FEE_LIMIT_TRON,
              userFeePercentage: 100,
              shouldPollResponse: false,
            },
            [
              { type: "address", value: newData.recipient },
              { type: "uint256", value: newData.amount },
            ],
            newData.address
          )
        ).transaction;
      } else {
        // get address here from keyring and
        transaction = await tronWeb.transactionBuilder.sendTrx(
          newData.recipient,
          newData.amount,
          newData.address
        );
      }
      transaction.signature = [
        Buffer.from(
          await this.keyRing.sign(env, chainId, 195, transaction?.txID)
        ).toString("hex"),
      ];
      const receipt = await tronWeb.trx.sendRawTransaction(transaction);
      return receipt;
    } finally {
      this.interactionService.dispatchEvent(
        APP_PORT,
        "request-sign-tron-end",
        {}
      );
    }
  }

  async requestSignOasis(
    env: Env,
    chainId: string,
    data: object
  ): Promise<object> {
    try {
      const tx = await this.keyRing.signOasis(chainId, data);
      return tx;
    } finally {
      this.interactionService.dispatchEvent(
        APP_PORT,
        "request-sign-oasis-end",
        {}
      );
    }
  }
  async request_eth(
    env: Env,
    chainId: string,
    method: string,
    params: any[]
  ): Promise<object> {
    await this.enable(env);
    console.log(
      this.keyRing.DappConnectStatus,
      "this.keyRing.DappConnectStatus"
    );
    // if (this.keyRing.DappConnectStatus == DAPP_CONNECT_STATUS.ASK_CONNECT) {
    //   await this.interactionService.waitApprove(env, "/ask-connect-dapp", "ask-connect-dapp", {});
    //   return;
    // }
    const rs = await this.keyRing.request_eth(chainId, method, params);
    return rs;
  }
}

import { BACKGROUND_PORT, MessageRequester } from "@owallet/router";
import {
  autorun,
  computed,
  flow,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import { toGenerator } from "@owallet/common";
import {
  AppendLedgerKeyAppMsg,
  BIP44HDPath,
  ChangeKeyRingNameMsg,
  ChangeUserPasswordMsg,
  CheckLegacyKeyRingPasswordMsg,
  CheckPasswordMsg,
  ComputeNotFinalizedKeyAddressesMsg,
  DeleteKeyRingMsg,
  ExportKeyRingMsg,
  FinalizeKeyCoinTypeMsg,
  GetKeyRingStatusMsg,
  GetKeyRingStatusOnlyMsg,
  KeyInfo,
  KeyRingStatus,
  LockKeyRingMsg,
  // NewKeystoneKeyMsg,
  NewLedgerKeyMsg,
  NewMnemonicKeyMsg,
  NewPrivateKeyKeyMsg,
  PlainObject,
  SearchKeyRingsMsg,
  SelectKeyRingMsg,
  ShowSensitiveKeyRingDataMsg,
  SimulateSignTronMsg,
  UnlockKeyRingMsg,
} from "@owallet/background";
// import type { MultiAccounts } from "@owallet/background";
import { ChainInfo } from "@owallet/types";
import { ChainIdHelper } from "@owallet/cosmos";

export class KeyRingStore {
  @observable
  protected _isInitialized: boolean = false;

  @observable
  protected _status: KeyRingStatus | "not-loaded" = "not-loaded";

  @observable
  protected _needMigration: boolean = false;

  @observable
  protected _isMigrating: boolean = false;

  @observable.ref
  protected _keyInfos: KeyInfo[] = [];

  constructor(
    protected readonly eventDispatcher: {
      dispatchEvent: (type: string) => void;
    },
    protected readonly requester: MessageRequester
  ) {
    makeObservable(this);

    this.init();
  }

  async init(): Promise<void> {
    await this.refreshKeyRingStatus();

    console.log("init keyring store");

    runInAction(() => {
      this._isInitialized = true;
      console.log("_isInitialized", this._isInitialized);
    });
  }

  get needMigration(): boolean {
    return this._needMigration;
  }

  get isMigrating(): boolean {
    return this._isMigrating;
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  async waitUntilInitialized(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    return new Promise((resolve) => {
      const disposal = autorun(() => {
        if (this.isInitialized) {
          resolve();

          if (disposal) {
            disposal();
          }
        }
      });
    });
  }

  get status(): KeyRingStatus | "not-loaded" {
    return this._status;
  }

  get keyInfos(): KeyInfo[] {
    return this._keyInfos;
  }

  async fetchKeyRingStatus(): Promise<KeyRingStatus> {
    const msg = new GetKeyRingStatusOnlyMsg();
    const result = await this.requester.sendMessage(BACKGROUND_PORT, msg);
    return result.status;
  }

  @computed
  get selectedKeyInfo(): KeyInfo | undefined {
    return this._keyInfos.find((keyInfo) => keyInfo.isSelected);
  }

  get isEmpty(): boolean {
    return this._status === "empty";
  }

  @flow
  *refreshKeyRingStatus() {
    const msg = new GetKeyRingStatusMsg();
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this._status = result.status;
    this._keyInfos = result.keyInfos;
    this._needMigration = result.needMigration;
    this._isMigrating = result.isMigrating;
  }

  @flow
  *selectKeyRing(vaultId: string) {
    const msg = new SelectKeyRingMsg(vaultId);
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this._status = result.status;
    this._keyInfos = result.keyInfos;

    this.eventDispatcher.dispatchEvent("keplr_keystorechange");
  }

  needKeyCoinTypeFinalize(vaultId: string, chainInfo: ChainInfo): boolean {
    const keyInfo = this.keyInfos.find((keyInfo) => keyInfo.id === vaultId);
    if (!keyInfo) {
      return false;
    }

    if (keyInfo.type !== "mnemonic" && keyInfo.type !== "keystone") {
      return false;
    }

    const coinTypeTag = `keyRing-${
      ChainIdHelper.parse(chainInfo.chainId).identifier
    }-coinType`;

    return keyInfo.insensitive[coinTypeTag] == null;
  }

  async computeNotFinalizedKeyAddresses(
    vaultId: string,
    chainId: string
  ): Promise<
    {
      coinType: number;
      bech32Address: string;
    }[]
  > {
    const msg = new ComputeNotFinalizedKeyAddressesMsg(vaultId, chainId);

    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async showKeyRing(vaultId: string, password: string) {
    const msg = new ShowSensitiveKeyRingDataMsg(vaultId, password);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async exportKeyRing(vaultId: string, password: string, chainId: string) {
    const msg = new ExportKeyRingMsg(vaultId, password, chainId);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  @flow
  *finalizeKeyCoinType(vaultId: string, chainId: string, coinType: number) {
    const msg = new FinalizeKeyCoinTypeMsg(vaultId, chainId, coinType);
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this._status = result.status;
    this._keyInfos = result.keyInfos;

    this.eventDispatcher.dispatchEvent("keplr_keystorechange");
  }

  @flow
  *newMnemonicKey(
    mnemonic: string,
    bip44HDPath: BIP44HDPath,
    name: string,
    password: string | undefined,
    parentVaultId?: string,
    meta?: PlainObject
  ) {
    const msg = new NewMnemonicKeyMsg(
      mnemonic,
      bip44HDPath,
      name,
      password,
      meta,
      parentVaultId
    );
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this._status = result.status;
    this._keyInfos = result.keyInfos;

    this.eventDispatcher.dispatchEvent("keplr_keystorechange");

    return result.vaultId;
  }

  @flow
  *newLedgerKey(
    pubKey: Uint8Array,
    app: string,
    bip44HDPath: BIP44HDPath,
    name: string,
    password: string | undefined
  ) {
    const msg = new NewLedgerKeyMsg(pubKey, app, bip44HDPath, name, password);
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this._status = result.status;
    this._keyInfos = result.keyInfos;

    this.eventDispatcher.dispatchEvent("keplr_keystorechange");

    return result.vaultId;
  }

  @flow
  *appendLedgerKeyApp(vaultId: string, pubKey: Uint8Array, app: string) {
    const msg = new AppendLedgerKeyAppMsg(vaultId, pubKey, app);
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this._status = result.status;
    this._keyInfos = result.keyInfos;

    this.eventDispatcher.dispatchEvent("keplr_keystorechange");
  }

  // @flow
  // *newKeystoneKey(
  //   multiAccounts: MultiAccounts,
  //   name: string,
  //   password: string | undefined
  // ) {
  //   const msg = new NewKeystoneKeyMsg(multiAccounts, name, password);
  //   const result = yield* toGenerator(
  //     this.requester.sendMessage(BACKGROUND_PORT, msg)
  //   );
  //   this._status = result.status;
  //   this._keyInfos = result.keyInfos;
  //
  //   this.eventDispatcher.dispatchEvent("keplr_keystorechange");
  //
  //   return result.vaultId;
  // }

  @flow
  *newPrivateKeyKey(
    privateKey: Uint8Array,
    meta: PlainObject,
    name: string,
    password: string | undefined
  ) {
    const msg = new NewPrivateKeyKeyMsg(privateKey, meta, name, password);
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this._status = result.status;
    this._keyInfos = result.keyInfos;

    this.eventDispatcher.dispatchEvent("keplr_keystorechange");

    return result.vaultId;
  }

  @flow
  *lock() {
    const msg = new LockKeyRingMsg();
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this._status = result.status;
  }

  @flow
  *unlock(password: string) {
    if (this._needMigration) {
      this._isMigrating = true;
    }

    try {
      const msg = new UnlockKeyRingMsg(password);
      const result = yield* toGenerator(
        this.requester.sendMessage(BACKGROUND_PORT, msg)
      );
      this._status = result.status;
      this._keyInfos = result.keyInfos;

      this._needMigration = false;
    } finally {
      // Set the flag to false even if the migration is failed.
      this._isMigrating = false;
    }
  }

  @flow
  *unlockWithoutSyncStatus(password: string) {
    if (this._needMigration) {
      this._isMigrating = true;
    }

    try {
      const msg = new UnlockKeyRingMsg(password);
      const result = yield* toGenerator(
        this.requester.sendMessage(BACKGROUND_PORT, msg)
      );
      this._keyInfos = result.keyInfos;

      this._needMigration = false;
    } finally {
      // Set the flag to false even if the migration is failed.
      this._isMigrating = false;
    }
  }

  @flow
  *changeKeyRingName(vaultId: string, name: string) {
    const msg = new ChangeKeyRingNameMsg(vaultId, name);
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this._status = result.status;
    this._keyInfos = result.keyInfos;

    this.eventDispatcher.dispatchEvent("keplr_keystorechange");
  }

  @flow
  *deleteKeyRing(vaultId: string, password: string) {
    const msg = new DeleteKeyRingMsg(vaultId, password);
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this._status = result.status;
    this._keyInfos = result.keyInfos;

    if (result.wasSelected && result.status === "unlocked") {
      this.eventDispatcher.dispatchEvent("keplr_keystorechange");
    }
  }

  async changeUserPassword(
    prevUserPassword: string,
    newUserPassword: string
  ): Promise<void> {
    const msg = new ChangeUserPasswordMsg(prevUserPassword, newUserPassword);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async checkLegacyKeyRingPassword(password: string): Promise<void> {
    const msg = new CheckLegacyKeyRingPasswordMsg(password);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async checkPassword(password: string): Promise<boolean> {
    const msg = new CheckPasswordMsg(password);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async searchKeyRings(searchText: string): Promise<KeyInfo[]> {
    const msg = new SearchKeyRingsMsg(searchText);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async simulateSignTron(
    transaction: any,
    vaultId: string,
    coinType: number
  ): Promise<any> {
    const msg = new SimulateSignTronMsg(transaction, vaultId, coinType);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }
}

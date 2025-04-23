import { KVStore } from "@owallet/common";
import { KeyRingService } from "../keyring";
import { action, autorun, makeObservable, observable, runInAction } from "mobx";

export class AutoLockAccountService {
  // Unit: ms
  // Zero means disabled
  // When auto lock duration is set, the account will be locked when the computer goes into sleep mode.
  @observable
  protected autoLockDuration: number = 0;
  // Even if the auto lock duration is not set, the account will be locked when the computer goes into sleep mode.
  @observable
  protected lockOnSleep: boolean = false;

  protected autoLockTimer: NodeJS.Timeout | null = null;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly keyRingService: KeyRingService,
    protected readonly addDeviceLockedListener: (callback: () => void) => void
  ) {
    makeObservable(this);
  }

  async init() {
    const duration = await this.kvStore.get<number>("autoLockDuration");
    runInAction(() => {
      if (duration == null || Number.isNaN(duration)) {
        this.autoLockDuration = 0;
      } else {
        this.autoLockDuration = duration;
      }
    });

    autorun(() => {
      this.kvStore.set<number>("autoLockDuration", this.autoLockDuration);
    });

    const lockOnSleep = await this.kvStore.get<boolean>("lockOnSleep");
    runInAction(() => {
      if (lockOnSleep) {
        this.lockOnSleep = true;
      } else {
        this.lockOnSleep = false;
      }
    });

    autorun(() => {
      this.kvStore.set<boolean>("lockOnSleep", this.lockOnSleep);
    });

    this.addDeviceLockedListener(() => {
      this.onDeviceLocked();
    });
  }

  private onDeviceLocked() {
    if (this.autoLockDuration > 0) {
      this.stopAutoLockTimer();
      this.lock();
    } else if (this.lockOnSleep) {
      this.lock();
    }
  }

  startAppStateCheckTimer() {
    this.stopAutoLockTimer();

    this.startAutoLockTimer();
  }

  private startAutoLockTimer() {
    if (!this.keyRingIsUnlocked) {
      throw new Error("Keyring is not unlocked");
    }

    if (this.autoLockDuration <= 0) {
      return;
    }

    this.autoLockTimer = setTimeout(() => {
      this.stopAutoLockTimer();
      this.lock();
    }, this.autoLockDuration);
  }

  private stopAutoLockTimer() {
    if (this.autoLockTimer != null) {
      clearTimeout(this.autoLockTimer);
      this.autoLockTimer = null;
    }
  }

  private lock() {
    if (this.keyRingIsUnlocked) {
      this.keyRingService.lockKeyRing();
    }
  }

  get keyRingIsUnlocked(): boolean {
    return this.keyRingService.keyRingStatus === "unlocked";
  }

  public getAutoLockDuration(): number {
    return this.autoLockDuration;
  }

  @action
  public setDuration(duration: number) {
    this.autoLockDuration = duration;

    if (duration <= 0) {
      this.stopAutoLockTimer();
    }
  }

  public getLockOnSleep(): boolean {
    return this.lockOnSleep;
  }

  @action
  public setLockOnSleep(lockOnSleep: boolean) {
    this.lockOnSleep = lockOnSleep;
  }
}

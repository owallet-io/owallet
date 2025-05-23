import { KeyRingStatus } from "../keyring";
import { AutoLockAccountService } from "./service";
import { MemoryKVStore } from "@owallet/common";
import EventEmitter from "events";

class MockKeyRingService {
  public keyRingStatus: KeyRingStatus = "empty";
  public isLocked = true;

  unlock() {
    this.isLocked = false;
    this.keyRingStatus = "unlocked";
  }

  lock() {
    this.isLocked = true;
    this.keyRingStatus = "locked";
  }
}

describe("Test auto lock account service", () => {
  it("test init", async () => {
    const event = new EventEmitter();

    const mockListener = jest.fn().mockImplementation((fn) => {
      event.addListener("onStateChanged", fn);
    });

    const keyRingService = new MockKeyRingService();
    const service = new AutoLockAccountService(
      new MemoryKVStore("test"),
      keyRingService as any,
      (callback) => {
        mockListener((state: any) => {
          if (state === "locked") {
            callback();
          }
        });
      }
    );
    await service.init();

    expect(mockListener).toBeCalledTimes(1);
    jest.restoreAllMocks();

    event.removeAllListeners("onStateChanged");
  });

  it("test restore", async () => {
    const event = new EventEmitter();

    const mockListener = jest.fn().mockImplementation((fn) => {
      event.addListener("onStateChanged", fn);
    });

    const keyRingService = new MockKeyRingService();
    const memStore = new MemoryKVStore("test");
    let service = new AutoLockAccountService(
      memStore,
      keyRingService as any,
      (callback) => {
        mockListener((state: any) => {
          if (state === "locked") {
            callback();
          }
        });
      }
    );
    await service.init();

    // Set duration.
    await service.setDuration(1000);
    expect(service.getAutoLockDuration()).toBe(1000);

    service = new AutoLockAccountService(
      memStore,
      keyRingService as any,
      (callback) => {
        mockListener((state: any) => {
          if (state === "locked") {
            callback();
          }
        });
      }
    );
    await service.init();

    expect(service.getAutoLockDuration()).toBe(1000);

    jest.restoreAllMocks();

    event.removeAllListeners("onStateChanged");
  });

  it("test device sleep", async () => {
    const event = new EventEmitter();

    const mockListener = jest.fn().mockImplementation((fn) => {
      event.addListener("onStateChanged", fn);
    });

    const keyRingService = new MockKeyRingService();
    const service = new AutoLockAccountService(
      new MemoryKVStore("test"),
      keyRingService as any,
      (callback) => {
        mockListener((state: any) => {
          if (state === "locked") {
            callback();
          }
        });
      }
    );
    await service.init();

    keyRingService.unlock();
    event.emit("onStateChanged", "locked");

    expect(keyRingService.isLocked).toBe(false);

    expect(mockListener).toBeCalledTimes(1);
    jest.restoreAllMocks();

    event.removeAllListeners("onStateChanged");
  });

  it("test device sleep 2", async () => {
    const event = new EventEmitter();

    const mockListener = jest.fn().mockImplementation((fn) => {
      event.addListener("onStateChanged", fn);
    });

    const keyRingService = new MockKeyRingService();
    const service = new AutoLockAccountService(
      new MemoryKVStore("test"),
      keyRingService as any,
      (callback) => {
        mockListener((state: any) => {
          if (state === "locked") {
            callback();
          }
        });
      }
    );
    await service.init();

    await service.setDuration(1000);

    keyRingService.lock();
    event.emit("onStateChanged", "locked");

    expect(keyRingService.isLocked).toBe(true);

    expect(mockListener).toBeCalledTimes(1);
    jest.restoreAllMocks();

    event.removeAllListeners("onStateChanged");
  });
});

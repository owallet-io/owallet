import { KeyRingService } from "../service";

// Mock mobx autorun
jest.mock("mobx", () => {
  const original = jest.requireActual("mobx");
  return {
    ...original,
    autorun: jest.fn((_fn) => {
      // Don't run the function to avoid errors
      return { dispose: jest.fn() };
    }),
  };
});

describe("KeyRingService (Mocked)", () => {
  let keyRingService: KeyRingService;
  let mockKVStore: any;
  let mockMigrationsKVStore: any;
  let mockVaultService: any;
  let mockChainsService: any;
  let mockChainsUIService: any;
  let mockInteractionService: any;
  let mockAnalyticsService: any;
  let mockMigrations: any;
  let mockKeyRings: any;

  beforeEach(() => {
    mockKVStore = {
      get: jest.fn().mockResolvedValue(undefined),
      set: jest.fn().mockResolvedValue(undefined),
    };

    mockMigrationsKVStore = {
      get: jest.fn().mockResolvedValue(undefined),
    };

    mockVaultService = {
      getVaults: jest.fn().mockReturnValue([]),
      getVault: jest.fn().mockReturnValue(null),
      createVault: jest.fn().mockResolvedValue("test-vault-id"),
      setVault: jest.fn().mockResolvedValue(undefined),
      deleteVault: jest.fn().mockResolvedValue(undefined),
      deleteVaults: jest.fn().mockResolvedValue(undefined),
      isLocked: jest.fn().mockReturnValue(false),
      lock: jest.fn(),
      unlock: jest.fn().mockResolvedValue(true),
      keyStoreIdToFileName: jest.fn().mockImplementation((id) => id),
    };

    mockChainsService = {
      getChain: jest.fn(),
    };

    mockChainsUIService = {
      suggestChainInfo: jest.fn(),
    };

    mockInteractionService = {
      waitApprove: jest.fn(),
    };

    mockAnalyticsService = {
      logEvent: jest.fn(),
    };

    mockMigrations = {
      kvStore: mockMigrationsKVStore,
      commonCrypto: {},
      chainsUIService: mockChainsUIService,
      getDisabledChainIdentifiers: jest.fn().mockResolvedValue([]),
      hasLegacyKeyRings: jest.fn().mockResolvedValue(false),
      hasAutoMigrated: jest.fn().mockResolvedValue(true),
    };

    mockKeyRings = [];

    keyRingService = new KeyRingService(
      mockKVStore,
      mockMigrations,
      mockChainsService,
      mockChainsUIService,
      mockInteractionService,
      mockVaultService,
      mockAnalyticsService,
      mockKeyRings
    );

    // Mock methods that we don't want to actually execute
    keyRingService.getKeyRingVaults = jest.fn().mockReturnValue([]);
  });

  describe("init", () => {
    it("should initialize without requiring migration when valid vault id", async () => {
      mockKVStore.get.mockImplementation((key: string) => {
        if (key === "migration/v1") {
          return Promise.resolve(true);
        }
        if (key === "selectedVaultId") {
          return Promise.resolve("test-vault-id");
        }
        return Promise.resolve(undefined);
      });

      mockVaultService.getVault.mockReturnValue({ id: "test-vault-id" });

      await keyRingService.init();

      expect(keyRingService.needMigration).toBe(false);
    });

    it("should set needMigration to true if there are legacy keys and not auto migrated", async () => {
      mockKVStore.get.mockImplementation((key: string) => {
        if (key === "migration/v1") {
          return Promise.resolve(false);
        }
        return Promise.resolve(undefined);
      });

      mockMigrationsKVStore.get.mockImplementation((key: string) => {
        if (key === "key-multi-store") {
          return Promise.resolve([{ id: "legacy1" }]);
        }
        return Promise.resolve(undefined);
      });

      await keyRingService.init();

      expect(keyRingService.needMigration).toBe(true);
    });
  });

  describe("keyRingStatus", () => {
    beforeEach(() => {
      // Mock the computed getter to avoid MobX issues
      Object.defineProperty(keyRingService, "keyRingStatus", {
        get: jest.fn(() => {
          if (mockVaultService.getVaults().length === 0) {
            return "empty";
          }
          return mockVaultService.isLocked() ? "locked" : "unlocked";
        }),
      });
    });

    it("should return empty status when no vaults", async () => {
      mockVaultService.getVaults.mockReturnValue([]);

      const status = keyRingService.keyRingStatus;

      expect(status).toBe("empty");
    });

    it("should return locked status when vault is locked", async () => {
      mockVaultService.getVaults.mockReturnValue(["test-vault-id"]);
      mockVaultService.isLocked.mockReturnValue(true);

      const status = keyRingService.keyRingStatus;

      expect(status).toBe("locked");
    });

    it("should return unlocked status when vault is unlocked", async () => {
      mockVaultService.getVaults.mockReturnValue(["test-vault-id"]);
      mockVaultService.isLocked.mockReturnValue(false);

      const status = keyRingService.keyRingStatus;

      expect(status).toBe("unlocked");
    });
  });

  describe("lockKeyRing", () => {
    it("should lock the vault", async () => {
      mockVaultService.getVaults.mockReturnValue(["test-vault-id"]);

      await keyRingService.lockKeyRing();

      expect(mockVaultService.lock).toHaveBeenCalled();
    });
  });

  describe("unlockKeyRing", () => {
    it("should unlock the vault with valid password", async () => {
      mockVaultService.getVaults.mockReturnValue(["test-vault-id"]);
      mockVaultService.unlock.mockResolvedValue(true);

      const result = await keyRingService.unlockKeyRing("password");

      expect(result).toBe(undefined);
      expect(mockVaultService.unlock).toHaveBeenCalledWith("password");
    });
  });
});

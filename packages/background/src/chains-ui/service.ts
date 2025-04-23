import { ChainsService } from "../chains";
import {
  action,
  autorun,
  computed,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from "mobx";
import { KVStore } from "@owallet/common";
import { ChainInfo } from "@owallet/types";
import { ChainIdHelper } from "@owallet/cosmos";
import { computedFn } from "mobx-utils";
import { VaultService } from "../vault";

type ChainUIEnabledChangedHandler = (
  vaultId: string,
  chainIdentifiers: ReadonlyArray<string>
) => void;

export class ChainsUIService {
  // There's a reason for not using @observable.deep...
  // If the value is empty, it returns an array containing just the first chain info.
  // (Because at least one chain must always be enabled)
  // However, in this case, the return value is just handled internally in the method,
  // not the actual stored state.
  // This makes it easy to make mistakes when handling state in enable/disable operations.
  // To mitigate this issue, we use a shallow map.
  // Key: vault id
  @observable.shallow
  protected enabledChainIdentifiersMap = new Map<
    string,
    ReadonlyArray<string>
  >();

  protected onChainUIEnabledChangedHandlers: ChainUIEnabledChangedHandler[] =
    [];

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainsService: ChainsService,
    protected readonly vaultService: VaultService
  ) {
    makeObservable(this);
  }

  async init(): Promise<void> {
    const saved = await this.kvStore.get<Record<string, string[]>>(
      "enabledChainIdentifiesMap"
    );
    if (saved) {
      runInAction(() => {
        for (const [key, value] of Object.entries(saved)) {
          this.enabledChainIdentifiersMap.set(key, value);
        }
      });
    }
    autorun(() => {
      const js = toJS(this.enabledChainIdentifiersMap);
      const obj = Object.fromEntries(js);
      this.kvStore.set("enabledChainIdentifiesMap", obj);
    });

    this.chainsService.addChainRemovedHandler(this.onChainRemoved);
    this.vaultService.addVaultRemovedHandler(this.onVaultRemoved);
  }

  readonly enabledChainIdentifiersForVault = computedFn(
    (vaultId: string): ReadonlyArray<string> => {
      const chainIdentifiers = (
        this.enabledChainIdentifiersMap.get(vaultId) ?? []
      ).filter((chainIdentifier) => {
        return this.chainsService.hasChainInfo(chainIdentifier);
      });
      if (chainIdentifiers.length === 0) {
        // Should be enabled at least one chain.
        return [
          ChainIdHelper.parse(this.chainsService.getChainInfos()[0].chainId)
            .identifier,
        ];
      } else {
        return chainIdentifiers;
      }
    },
    {
      keepAlive: true,
    }
  );

  readonly enabledChainInfosForVault = computedFn(
    (vaultId: string): ReadonlyArray<ChainInfo> => {
      return this.enabledChainIdentifiersForVault(vaultId).map(
        (chainIdentifier) => {
          return this.chainsService.getChainInfoOrThrow(chainIdentifier);
        }
      );
    }
  );

  protected readonly enabledChainIdentifierMapForVault = computedFn(
    (vaultId: string): Map<string, boolean> => {
      const chainIdentifiers = this.enabledChainIdentifiersForVault(vaultId);

      const res = new Map<string, boolean>();
      for (const chainIdentifier of chainIdentifiers) {
        res.set(chainIdentifier, true);
      }
      return res;
    },
    {
      keepAlive: true,
    }
  );

  readonly isEnabled = computedFn(
    (vaultId: string, chainId: string): boolean => {
      const chainIdentifier = ChainIdHelper.parse(chainId).identifier;
      return (
        this.enabledChainIdentifierMapForVault(vaultId).get(chainIdentifier) ===
        true
      );
    },
    {
      keepAlive: true,
    }
  );

  @action
  toggleChain(vaultId: string, ...chainIds: string[]) {
    const vault = this.vaultService.getVault("keyRing", vaultId);
    if (!vault) {
      throw new Error("Vault is null");
    }

    chainIds = Array.from(new Set([...chainIds]));

    const paramChainIdentifiers = chainIds
      .map((chainId) => {
        return ChainIdHelper.parse(chainId).identifier;
      })
      .filter((chainIdentifier) => {
        return this.chainsService.hasChainInfo(chainIdentifier);
      });

    const identifierMap = this.enabledChainIdentifierMapForVault(vaultId);

    for (const param of paramChainIdentifiers) {
      if (!identifierMap.get(param)) {
        this.enableChain(vaultId, param);
      } else {
        this.disableChain(vaultId, param);
      }
    }
  }

  @action
  enableChain(vaultId: string, ...chainIds: string[]) {
    const vault = this.vaultService.getVault("keyRing", vaultId);
    if (!vault) {
      throw new Error("Vault is null");
    }

    chainIds = Array.from(new Set([...chainIds]));

    const paramChainIdentifiers = chainIds
      .map((chainId) => {
        return ChainIdHelper.parse(chainId).identifier;
      })
      .filter((chainIdentifier) => {
        return this.chainsService.hasChainInfo(chainIdentifier);
      });

    const newIdentifiers =
      this.enabledChainIdentifiersForVault(vaultId).slice();
    const identifierMap = this.enabledChainIdentifierMapForVault(vaultId);

    for (const param of paramChainIdentifiers) {
      if (!identifierMap.get(param)) {
        newIdentifiers.push(param);
      }
    }

    this.enabledChainIdentifiersMap.set(vaultId, newIdentifiers);

    for (const handler of this.onChainUIEnabledChangedHandlers) {
      handler(vaultId, this.enabledChainIdentifiersForVault(vaultId));
    }
  }

  @action
  disableChain(vaultId: string, ...chainIds: string[]) {
    const vault = this.vaultService.getVault("keyRing", vaultId);
    if (!vault) {
      throw new Error("Vault is null");
    }

    chainIds = Array.from(new Set([...chainIds]));

    const paramChainIdentifiers = chainIds
      .map((chainId) => {
        return ChainIdHelper.parse(chainId).identifier;
      })
      .filter((chainIdentifier) => {
        return this.chainsService.hasChainInfo(chainIdentifier);
      });

    const newIdentifiers =
      this.enabledChainIdentifiersForVault(vaultId).slice();
    const identifierMap = this.enabledChainIdentifierMapForVault(vaultId);

    for (const param of paramChainIdentifiers) {
      if (identifierMap.get(param)) {
        const index = newIdentifiers.findIndex((i) => i === param);
        if (index >= 0) {
          newIdentifiers.splice(index, 1);
        }
      }
    }

    this.enabledChainIdentifiersMap.set(vaultId, newIdentifiers);

    for (const handler of this.onChainUIEnabledChangedHandlers) {
      handler(vaultId, this.enabledChainIdentifiersForVault(vaultId));
    }
  }

  getVaultsByEnabledChain = computedFn(
    (chainId: string): ReadonlyArray<string> => {
      const identifier = ChainIdHelper.parse(chainId).identifier;

      const vaultIds = this.enabledChainIdentifiersMap.keys();
      const vaults = [];
      for (const vaultId of vaultIds) {
        const map = this.enabledChainIdentifierMapForVault(vaultId);
        if (map.get(identifier)) {
          vaults.push(vaultId);
        }
      }
      return vaults;
    },
    {
      keepAlive: true,
    }
  );

  @computed
  get allEnabledChainIdentifiers(): ReadonlyArray<string> {
    const set = new Set<string>();
    for (const arr of this.enabledChainIdentifiersMap.values()) {
      for (const chainIdentifier of arr) {
        set.add(chainIdentifier);
      }
    }
    return Array.from(set).filter((chainIdentifier) => {
      return this.chainsService.hasChainInfo(chainIdentifier);
    });
  }

  addChainUIEnabledChangedHandler(handler: ChainUIEnabledChangedHandler) {
    this.onChainUIEnabledChangedHandlers.push(handler);
  }

  protected readonly onChainRemoved = (chainInfo: ChainInfo) => {
    runInAction(() => {
      const identifier = ChainIdHelper.parse(chainInfo.chainId).identifier;
      const vaultIds = this.enabledChainIdentifiersMap.keys();
      for (const vaultId of vaultIds) {
        const map = this.enabledChainIdentifierMapForVault(vaultId);
        if (map.get(identifier)) {
          const newIdentifiers =
            this.enabledChainIdentifiersForVault(vaultId).slice();

          const index = newIdentifiers.findIndex((i) => i === identifier);
          if (index >= 0) {
            newIdentifiers.splice(index, 1);
          }

          this.enabledChainIdentifiersMap.set(vaultId, newIdentifiers);
        }
      }
    });
  };

  protected readonly onVaultRemoved = (type: string, id: string) => {
    runInAction(() => {
      if (type === "keyRing") {
        this.enabledChainIdentifiersMap.delete(id);
      }
    });
  };
}

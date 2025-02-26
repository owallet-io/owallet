import { InteractionService } from "../interaction";
import { Env, OWalletError, WEBPAGE_PORT } from "@owallet/router";
import {
  AllPermissionDataPerOrigin,
  getBasicAccessPermissionType,
  GlobalPermissionData,
  INTERACTION_TYPE_GLOBAL_PERMISSION,
  INTERACTION_TYPE_PERMISSION,
  PermissionData,
  PermissionOptions,
} from "./types";
import { KVStore } from "@owallet/common";
import { ChainsService } from "../chains";
import { ChainIdEVM, ChainInfo } from "@owallet/types";
import { action, autorun, makeObservable, observable, runInAction } from "mobx";
import { migrate } from "./migrate";
import { computedFn } from "mobx-utils";
import { PermissionKeyHelper } from "./helper";

export class PermissionService {
  @observable
  protected permissionMap: Map<string, true> = new Map();

  protected privilegedOrigins: Map<string, boolean> = new Map();

  @observable
  protected currentChainIdForEVMByOriginMap: Map<string, string> = new Map();

  constructor(
    protected readonly kvStore: KVStore,
    privilegedOrigins: string[],
    protected readonly interactionService: InteractionService,
    protected readonly chainsService: ChainsService
  ) {
    makeObservable(this);

    for (const origin of privilegedOrigins) {
      this.privilegedOrigins.set(origin, true);
    }

    this.chainsService.addChainRemovedHandler(this.onChainRemoved);
  }

  async init() {
    const migration = await migrate(this.kvStore);
    if (migration) {
      runInAction(() => {
        for (const key of Object.keys(migration)) {
          const granted = migration[key];
          if (granted) {
            this.permissionMap.set(key, true);
          }
        }
      });
    } else {
      const savedPermissionMap = await this.kvStore.get<
        Record<string, true | undefined>
      >("permissionMap/v1");
      if (savedPermissionMap) {
        runInAction(() => {
          for (const key of Object.keys(savedPermissionMap)) {
            const granted = savedPermissionMap[key];
            if (granted) {
              this.permissionMap.set(key, true);
            }
          }
        });

        const savedCurrentChainIdForEVMByOriginMap = await this.kvStore.get<
          Record<string, string>
        >("currentChainIdForEVMByOriginMap/v1");
        if (savedCurrentChainIdForEVMByOriginMap) {
          runInAction(() => {
            for (const key of Object.keys(
              savedCurrentChainIdForEVMByOriginMap
            )) {
              this.currentChainIdForEVMByOriginMap.set(
                key,
                savedCurrentChainIdForEVMByOriginMap[key]
              );
            }
          });
        }
      }
    }

    autorun(() => {
      this.kvStore.set(
        "permissionMap/v1",
        Object.fromEntries(this.permissionMap)
      );
      this.kvStore.set(
        "currentChainIdForEVMByOriginMap/v1",
        Object.fromEntries(this.currentChainIdForEVMByOriginMap)
      );
    });
  }

  protected readonly onChainRemoved = (chainInfo: ChainInfo) => {
    this.removeAllPermissions(chainInfo.chainId);
  };

  getAllPermissionDataPerOrigin(): AllPermissionDataPerOrigin {
    const data: AllPermissionDataPerOrigin = {};

    for (const key of this.permissionMap.keys()) {
      const split = PermissionKeyHelper.splitPermissionKey(key);

      const origin = split.origin;
      if (!data[origin]) {
        data[origin] = {
          permissions: [],
          globalPermissions: [],
        };
      }

      switch (split.type) {
        case getBasicAccessPermissionType():
          data[origin]!.permissions.push({
            chainIdentifier: split.chainIdentifier!,
            type: split.type,
          });
          break;
        default:
          data[origin]!.globalPermissions.push({
            type: split.type,
          });
          break;
      }
    }

    return data;
  }

  @action
  clearAllPermissions() {
    this.permissionMap.clear();
    this.currentChainIdForEVMByOriginMap.clear();
  }

  async checkOrGrantBasicAccessPermission(
    env: Env,
    chainIds: string | string[],
    origin: string,
    options?: PermissionOptions
  ) {
    if (typeof chainIds === "string") {
      chainIds = [chainIds];
    }

    const ungrantedChainIds: string[] = [];
    for (const chainId of chainIds) {
      if (
        !this.hasPermission(chainId, getBasicAccessPermissionType(), origin)
      ) {
        ungrantedChainIds.push(chainId);
      }
    }

    if (ungrantedChainIds.length > 0) {
      await this.grantBasicAccessPermission(
        env,
        ungrantedChainIds,
        [origin],
        options
      );
    }

    // Skip the permission check `chainIds` if the permission for EVM chain.
    // Because the chain id for this permission can be changed, so it may not be the same as `chainIds`.
    if (!options?.isForEVM) {
      this.checkBasicAccessPermission(env, chainIds, origin);
    }
  }

  async checkOrGrantPermission(
    env: Env,
    chainIds: string[],
    type: string,
    origin: string,
    options?: PermissionOptions
  ) {
    // TODO: Merge with `checkOrGrantBasicAccessPermission` method

    const ungrantedChainIds: string[] = [];
    for (const chainId of chainIds) {
      if (!this.hasPermission(chainId, type, origin)) {
        ungrantedChainIds.push(chainId);
      }
    }

    if (ungrantedChainIds.length > 0) {
      await this.grantPermission(
        env,
        ungrantedChainIds,
        type,
        [origin],
        options
      );
    }

    for (const chainId of chainIds) {
      this.checkPermission(env, chainId, type, origin);
    }
  }

  async checkOrGrantGlobalPermission(env: Env, type: string, origin: string) {
    if (!this.hasGlobalPermission(type, origin)) {
      await this.grantGlobalPermission(env, type, [origin]);
    }

    this.checkGlobalPermission(env, type, origin);
  }

  async grantPermission(
    env: Env,
    chainIds: string[],
    type: string,
    origins: string[],
    options?: PermissionOptions
  ) {
    if (env.isInternalMsg) {
      return;
    }

    const permissionData: PermissionData = {
      chainIds,
      type,
      origins,
      options,
    };

    // if (options?.isForEVM) {
    //   const chainId = chainIds[0];

    //   this.addPermission([chainId], type, origins);
    //   this.setCurrentChainIdForEVM(origins, chainId);
    // } else {
    //   this.addPermission(chainIds, type, origins);
    // }

    await this.interactionService.waitApproveV2(
      env,
      "/permission",
      INTERACTION_TYPE_PERMISSION,
      permissionData,
      (newChainId?: string) => {
        if (options?.isForEVM) {
          const chainId = newChainId ?? chainIds[0];
          this.addPermission([chainId], type, origins);
          this.setCurrentChainIdForEVM(origins, chainId);
        } else {
          this.addPermission(chainIds, type, origins);
        }
      }
    );
  }

  async grantBasicAccessPermission(
    env: Env,
    chainIds: string[],
    origins: string[],
    options?: PermissionOptions
  ) {
    for (const chainId of chainIds) {
      let currentChainId = chainId;
      // Convert EVM ID from dApps to the standard
      if (chainId.startsWith("0x") && !isNaN(Number(chainId))) {
        currentChainId = `eip155:${parseInt(currentChainId, 16)}`;
      }
      // Make sure that the chain info is registered.
      this.chainsService.getChainInfoOrThrow(currentChainId);
    }

    await this.grantPermission(
      env,
      chainIds,
      getBasicAccessPermissionType(),
      origins,
      options
    );
  }

  async grantGlobalPermission(env: Env, type: string, origins: string[]) {
    if (env.isInternalMsg) {
      return;
    }

    const permissionData: GlobalPermissionData = {
      type,
      origins,
    };

    await this.interactionService.waitApproveV2(
      env,
      "/permission",
      INTERACTION_TYPE_GLOBAL_PERMISSION,
      permissionData,
      () => {
        this.addGlobalPermission(type, origins);
      }
    );
  }

  checkPermission(env: Env, chainId: string, type: string, origin: string) {
    if (env.isInternalMsg) {
      return;
    }

    if (!this.hasPermission(chainId, type, origin)) {
      throw new OWalletError("permission", 130, `${origin} is not permitted`);
    }
  }

  checkBasicAccessPermission(env: Env, chainIds: string[], origin: string) {
    if (chainIds.length === 0) {
      throw new Error("Chain ids are empty");
    }

    for (const chainId of chainIds) {
      let currentChainId = chainId;
      // Convert EVM ID from dApps to the standard
      if (chainId.startsWith("0x") && !isNaN(Number(chainId))) {
        currentChainId = `eip155:${parseInt(currentChainId, 16)}`;
      }
      // Make sure that the chain info is registered.
      this.chainsService.getChainInfoOrThrow(currentChainId);

      this.checkPermission(
        env,
        chainId,
        getBasicAccessPermissionType(),
        origin
      );
    }
  }

  hasBasicAccessPermission(
    env: Env,
    chainIds: string[],
    origin: string
  ): boolean {
    if (chainIds.length === 0) {
      throw new Error("Chain ids are empty");
    }

    if (env.isInternalMsg) {
      return true;
    }

    for (const chainId of chainIds) {
      let currentChainId = chainId;
      // Convert EVM ID from dApps to the standard
      if (chainId.startsWith("0x") && !isNaN(Number(chainId))) {
        currentChainId = `eip155:${parseInt(currentChainId, 16)}`;
      }
      // Make sure that the chain info is registered.
      this.chainsService.getChainInfoOrThrow(currentChainId);

      if (
        !this.hasPermission(
          currentChainId,
          getBasicAccessPermissionType(),
          origin
        )
      ) {
        return false;
      }
    }
    return true;
  }

  checkGlobalPermission(env: Env, type: string, origin: string) {
    if (env.isInternalMsg) {
      return;
    }

    if (!this.hasGlobalPermission(type, origin)) {
      throw new OWalletError("permission", 130, `${origin} is not permitted`);
    }
  }

  hasPermission(chainId: string, type: string, origin: string): boolean {
    // Privileged origin can pass the any permission.
    if (this.privilegedOrigins.get(origin)) {
      return true;
    }

    return (
      this.permissionMap.get(
        PermissionKeyHelper.getPermissionKey(chainId, type, origin)
      ) ?? false
    );
  }

  hasGlobalPermission(type: string, origin: string): boolean {
    // Privileged origin can pass the any permission.
    if (this.privilegedOrigins.get(origin)) {
      return true;
    }

    return (
      this.permissionMap.get(
        PermissionKeyHelper.getGlobalPermissionKey(type, origin)
      ) ?? false
    );
  }

  getPermissionOrigins = computedFn(
    (chainId: string, type: string): string[] => {
      const origins = [];

      for (const key of this.permissionMap.keys()) {
        const origin = PermissionKeyHelper.getOriginFromPermissionKey(
          chainId,
          type,
          key
        );
        if (origin) {
          origins.push(origin);
        }
      }

      return origins;
    },
    {
      keepAlive: true,
    }
  );

  getGlobalPermissionOrigins = computedFn(
    (type: string): string[] => {
      const origins = [];

      for (const key of this.permissionMap.keys()) {
        const origin = PermissionKeyHelper.getOriginFromGlobalPermissionKey(
          type,
          key
        );
        if (origin) {
          origins.push(origin);
        }
      }

      return origins;
    },
    {
      keepAlive: true,
    }
  );

  getOriginPermittedChains = computedFn(
    (origin: string, type: string): string[] => {
      const chains: string[] = [];

      for (const key of this.permissionMap.keys()) {
        const chain = PermissionKeyHelper.getChainIdentifierFromPermissionKey(
          type,
          origin,
          key
        );
        if (chain) {
          chains.push(chain);
        }
      }

      return chains;
    },
    {
      keepAlive: true,
    }
  );

  @action
  addPermission(chainIds: string[], type: string, origins: string[]) {
    for (const chainId of chainIds) {
      for (const origin of origins) {
        this.permissionMap.set(
          PermissionKeyHelper.getPermissionKey(chainId, type, origin),
          true
        );
      }
    }
  }

  @action
  addGlobalPermission(type: string, origins: string[]) {
    for (const origin of origins) {
      this.permissionMap.set(
        PermissionKeyHelper.getGlobalPermissionKey(type, origin),
        true
      );
    }
  }

  @action
  removePermission(chainId: string, type: string, origins: string[]) {
    for (const origin of origins) {
      this.permissionMap.delete(
        PermissionKeyHelper.getPermissionKey(chainId, type, origin)
      );

      const currentChainIdForEVM = this.getCurrentChainIdForEVM(origin);
      if (chainId === currentChainIdForEVM) {
        this.currentChainIdForEVMByOriginMap.delete(origin);
      }
    }
  }

  @action
  removeAllSpecificTypePermission(origins: string[], type: string) {
    const deletes: string[] = [];

    for (const key of this.permissionMap.keys()) {
      for (const origin of origins) {
        const typeAndOrigin =
          PermissionKeyHelper.getChainAndTypeFromPermissionKey(origin, key);
        if (typeAndOrigin && typeAndOrigin.type === type) {
          deletes.push(key);
        }

        this.currentChainIdForEVMByOriginMap.delete(origin);
      }
    }

    for (const key of deletes) {
      this.permissionMap.delete(key);
    }
  }

  @action
  removeAllTypePermission(origins: string[]) {
    const deletes: string[] = [];

    for (const key of this.permissionMap.keys()) {
      for (const origin of origins) {
        const typeAndOrigin =
          PermissionKeyHelper.getChainAndTypeFromPermissionKey(origin, key);
        if (typeAndOrigin) {
          deletes.push(key);
        }

        this.currentChainIdForEVMByOriginMap.delete(origin);
      }
    }

    for (const key of deletes) {
      this.permissionMap.delete(key);
    }
  }

  @action
  removeAllTypePermissionToChainId(chainId: string, origins: string[]) {
    const deletes: string[] = [];

    for (const key of this.permissionMap.keys()) {
      const typeAndOrigin =
        PermissionKeyHelper.getTypeAndOriginFromPermissionKey(chainId, key);
      if (typeAndOrigin && origins.includes(typeAndOrigin.origin)) {
        deletes.push(key);
      }
    }

    for (const key of deletes) {
      this.permissionMap.delete(key);
    }

    for (const origin of origins) {
      const currentChainIdForEVM = this.getCurrentChainIdForEVM(origin);
      if (chainId === currentChainIdForEVM) {
        this.currentChainIdForEVMByOriginMap.delete(origin);
      }
    }
  }

  @action
  removeGlobalPermission(type: string, origins: string[]) {
    const deletes: string[] = [];

    for (const key of this.permissionMap.keys()) {
      const typeAndOrigin =
        PermissionKeyHelper.getTypeAndOriginFromGlobalPermissionKey(key);
      if (
        typeAndOrigin &&
        typeAndOrigin.type === type &&
        origins.includes(typeAndOrigin.origin)
      ) {
        deletes.push(key);
      }
    }

    for (const key of deletes) {
      this.permissionMap.delete(key);
    }
  }

  @action
  removeAllTypeGlobalPermission(origins: string[]) {
    const deletes: string[] = [];

    for (const key of this.permissionMap.keys()) {
      const typeAndOrigin =
        PermissionKeyHelper.getTypeAndOriginFromGlobalPermissionKey(key);
      if (typeAndOrigin && origins.includes(typeAndOrigin.origin)) {
        deletes.push(key);
      }
    }

    for (const key of deletes) {
      this.permissionMap.delete(key);
    }
  }

  @action
  removeAllPermissions(chainId: string) {
    const deletes: string[] = [];

    for (const key of this.permissionMap.keys()) {
      if (PermissionKeyHelper.getTypeAndOriginFromPermissionKey(chainId, key)) {
        deletes.push(key);
      }
    }

    for (const key of deletes) {
      this.permissionMap.delete(key);
    }

    this.currentChainIdForEVMByOriginMap.clear();
  }

  getCurrentChainIdForEVM(origin: string): string | undefined {
    const currentChainId = this.currentChainIdForEVMByOriginMap.get(origin);

    if (
      currentChainId &&
      !this.hasPermission(
        currentChainId,
        getBasicAccessPermissionType(),
        origin
      )
    ) {
      this.currentChainIdForEVMByOriginMap.delete(origin);
      return;
    }
    return currentChainId;
  }

  @action
  setCurrentChainIdForEVM(origins: string[], chainId: string) {
    for (const origin of origins) {
      this.currentChainIdForEVMByOriginMap.set(origin, chainId);

      const evmInfo = this.chainsService.getEVMInfoOrThrow(chainId);

      this.interactionService.dispatchEvent(
        WEBPAGE_PORT,
        "owallet_chainChanged",
        {
          origin,
          evmChainId: evmInfo.chainId,
        }
      );
    }
  }

  @action
  async updateCurrentChainIdForEVM(env: Env, origin: string, chainId: string) {
    const type = getBasicAccessPermissionType();
    const chainIds = [chainId];
    const origins = [origin];

    if (!this.hasPermission(chainId, type, origin)) {
      if (env.isInternalMsg) {
        this.addPermission(chainIds, type, origins);
        this.setCurrentChainIdForEVM(origins, chainId);
      } else {
        await this.grantPermission(env, chainIds, type, origins, {
          isForEVM: true,
          isUnableToChangeChainInUI: true,
        });
      }
    } else {
      this.setCurrentChainIdForEVM(origins, chainId);
    }
  }
}

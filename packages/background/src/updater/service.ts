import { inject, singleton, delay } from "tsyringe";
import { TYPES } from "../types";
import get from "lodash/get";
import { ChainInfo } from "@owallet/types";
import Axios from "axios";
import { KVStore } from "@owallet/common";
import { ChainIdHelper } from "@owallet/cosmos";
import { ChainsService } from "../chains";
import { getFeatures, hasChain } from "./helper";

@singleton()
export class ChainUpdaterService {
  constructor(
    @inject(TYPES.UpdaterStore) protected readonly kvStore: KVStore,
    @inject(delay(() => ChainsService))
    protected readonly chainsService: ChainsService
  ) {}

  async putUpdatedPropertyToChainInfo(
    chainInfo: ChainInfo
  ): Promise<ChainInfo> {
    const updatedProperty = await this.getUpdatedChainProperty(
      chainInfo.chainId
    );

    const chainId = ChainIdHelper.parse(chainInfo.chainId);
    const updatedChainId = ChainIdHelper.parse(
      updatedProperty.chainId || chainInfo.chainId
    );

    // If the saved property is lesser than the current chain id, just ignore.
    if (updatedChainId.version < chainId.version) {
      return chainInfo;
    }

    const features = chainInfo.features ?? [];
    for (const updatedFeature of updatedProperty.features ?? []) {
      if (!features.includes(updatedFeature)) {
        features.push(updatedFeature);
      }
    }

    return {
      ...chainInfo,
      ...{
        chainId: updatedProperty.chainId || chainInfo.chainId,
        features,
      },
    };
  }

  async clearUpdatedProperty(chainId: string) {
    await this.kvStore.set(ChainIdHelper.parse(chainId).identifier, null);

    this.chainsService.clearCachedChainInfos();
  }

  async tryUpdateChain(chainId: string) {
    const chainInfo = await this.chainsService.getChainInfo(chainId);

    // If chain id is not fomatted as {chainID}-{version},
    // there is no way to deal with the updated chain id.
    if (!ChainIdHelper.hasChainVersion(chainInfo.chainId)) {
      return;
    }

    const updates = await ChainUpdaterService.checkChainUpdate(chainInfo);

    if (updates.explicit || updates.slient) {
      const currentVersion = ChainIdHelper.parse(chainInfo.chainId);

      if (updates.chainId) {
        const fetchedChainId = updates.chainId;
        const fetchedVersion = ChainIdHelper.parse(fetchedChainId);

        if (
          currentVersion.identifier === fetchedVersion.identifier &&
          currentVersion.version < fetchedVersion.version
        ) {
          await this.saveChainProperty(currentVersion.identifier, {
            chainId: fetchedChainId,
          });
        }
      }

      if (updates.features && updates.features.length > 0) {
        const savedChainProperty = await this.getUpdatedChainProperty(
          chainInfo.chainId
        );

        const updateFeatures = savedChainProperty.features ?? [];

        for (const feature of updates.features) {
          if (!updateFeatures.includes(feature)) {
            updateFeatures.push(feature);
          }
        }

        await this.saveChainProperty(currentVersion.identifier, {
          features: updateFeatures,
        });
      }
    }
  }

  private async getUpdatedChainProperty(
    chainId: string
  ): Promise<Partial<ChainInfo>> {
    const version = ChainIdHelper.parse(chainId);

    return await this.loadChainProperty(version.identifier);
  }

  private async saveChainProperty(
    identifier: string,
    chainInfo: Partial<ChainInfo>
  ) {
    const saved = await this.loadChainProperty(identifier);

    await this.kvStore.set(identifier, {
      ...saved,
      ...chainInfo,
    });

    this.chainsService.clearCachedChainInfos();
  }

  private async loadChainProperty(
    identifier: string
  ): Promise<Partial<ChainInfo>> {
    const chainInfo = await this.kvStore.get<Partial<ChainInfo>>(identifier);
    if (!chainInfo) return {};
    return chainInfo;
  }

  /**
   * Returns wether the chain has been changed.
   * Currently, only check the chain id has been changed.
   * @param chainInfo Chain information.
   */
  public static async checkChainUpdate(
    chainInfo: Readonly<ChainInfo>
  ): Promise<{
    explicit: boolean;
    slient: boolean;

    chainId?: string;
    features?: string[];
  }> {
    const chainId = chainInfo?.chainId;

    // If chain id is not fomatted as {chainID}-{version},
    // there is no way to deal with the updated chain id.
    if (hasChain(chainId, chainInfo)) {
      return {
        explicit: false,
        slient: false,
      };
    }

    const instance = Axios.create({
      baseURL: chainInfo.rpc,
      adapter: "fetch",
    });

    // Get the status to get the chain id.
    const result = await instance.get<{
      result: {
        node_info: {
          network: string;
        };
      };
    }>("/status");

    const resultChainId = get(result, [
      "data",
      "result",
      "node_info",
      "network",
    ]);

    const version = ChainIdHelper.parse(chainId);
    const fetchedVersion = ChainIdHelper.parse(resultChainId);

    // TODO: Should throw an error?
    if (version?.identifier !== fetchedVersion.identifier) {
      return {
        explicit: false,
        slient: false,
      };
    }

    try {
      const { features, slient } = await getFeatures(chainInfo);

      return {
        explicit: version.version < fetchedVersion.version,
        slient: slient,
        chainId: resultChainId,
        features,
      };
    } catch (err) {
      return {
        explicit: false,
        slient: false,
      };
    }
  }
}

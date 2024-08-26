import { observable, action, computed, makeObservable, flow } from "mobx";
import { ChainInfoInner, ChainStore as BaseChainStore } from "@owallet/stores";
import { ChainInfo } from "@owallet/types";
import {
  ChainInfoWithEmbed,
  GetChainInfosMsg,
  RemoveSuggestedChainInfoMsg,
  SuggestChainInfoMsg,
  TryUpdateChainMsg,
} from "@owallet/background";
import { BACKGROUND_PORT } from "@owallet/router";
import { MessageRequester } from "@owallet/router";
import { KVStore, toGenerator } from "@owallet/common";

export class ChainStore extends BaseChainStore<ChainInfoWithEmbed> {
  @observable
  protected selectedChainId: string;

  @observable
  protected _isInitializing: boolean = false;
  protected deferChainIdSelect: string = "";

  constructor(
    embedChainInfos: ChainInfo[],
    protected readonly requester: MessageRequester,
    protected readonly kvStore: KVStore
  ) {
    super(
      embedChainInfos.map((chainInfo) => {
        return {
          ...chainInfo,
          ...{
            embeded: true,
          },
        };
      })
    );

    this.selectedChainId = embedChainInfos[0].chainId;
    makeObservable(this);

    this.init();
  }

  get isInitializing(): boolean {
    return this._isInitializing;
  }

  get chainInfosInUI() {
    return this.chainInfos.filter((chainInfo) => {
      return !chainInfo.raw.hideInUI;
    });
  }

  @action
  selectChain(chainId: string) {
    if (this._isInitializing) {
      this.deferChainIdSelect = chainId;
    }
    this.selectedChainId = chainId;
  }

  @computed
  get current(): ChainInfoInner<ChainInfoWithEmbed> {
    if (this.hasChain(this.selectedChainId)) {
      return this.getChain(this.selectedChainId);
    }

    return this.chainInfos[0];
  }

  async saveLastViewChainId() {
    // Save last view chain id to kv store
    await this.kvStore.set<string>("last_view_chain_id", this.selectedChainId);
  }

  @flow
  protected *init() {
    this._isInitializing = true;
    yield this.getChainInfosFromBackground();

    // Get last view chain id from kv store
    const lastViewChainId = yield* toGenerator(
      this.kvStore.get<string>("last_view_chain_id")
    );

    if (!this.deferChainIdSelect) {
      if (lastViewChainId) {
        this.selectChain(lastViewChainId);
      }
    }
    this._isInitializing = false;

    if (this.deferChainIdSelect) {
      this.selectChain(this.deferChainIdSelect);
      this.deferChainIdSelect = "";
    }
  }

  @flow
  protected *getChainInfosFromBackground() {
    const msg = new GetChainInfosMsg();
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this.setChainInfos(result.chainInfos);
  }

  @flow
  *removeChainInfo(chainId: string) {
    const msg = new RemoveSuggestedChainInfoMsg(chainId);
    const chainInfos = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );

    this.setChainInfos(chainInfos);
  }

  @flow
  *addChain(chainInfo) {
    const msg = new GetChainInfosMsg();
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    const msgAddchain = new SuggestChainInfoMsg(chainInfo);
    yield this.requester.sendMessage(BACKGROUND_PORT, msgAddchain);
    yield this.setChainInfos([...result.chainInfos, chainInfo]);
  }

  @flow
  *tryUpdateChain(chainId: string) {
    const msg = new TryUpdateChainMsg(chainId);
    yield this.requester.sendMessage(BACKGROUND_PORT, msg);
    yield this.getChainInfosFromBackground();
  }
}

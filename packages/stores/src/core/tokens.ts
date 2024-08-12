import { HasMapStore } from "../common";
import { BACKGROUND_PORT, MessageRequester } from "@owallet/router";
import {
  AddTokenMsg,
  GetAllTokenInfosMsg,
  GetTokensMsg,
  KeyRingStatus,
  RemoveTokenMsg,
  SuggestTokenMsg,
  TokenInfo,
} from "@owallet/background";
import {
  action,
  autorun,
  flow,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import { AppCurrency, ChainInfo } from "@owallet/types";
import { DeepReadonly } from "utility-types";
import { ChainStore } from "../chain";
import { InteractionStore } from "./interaction";
import { toGenerator } from "@owallet/common";
import { Bech32Address, ChainIdHelper } from "@owallet/cosmos";
import { AccountStore, AccountWithAll } from "src/account";
import { KeyRingStore } from "./keyring";

// export class TokensStoreInner {
//   @observable.ref
//   protected _tokens: AppCurrency[] = [];
//   @observable.ref
//   protected tokenMap: ReadonlyMap<string, ReadonlyArray<TokenInfo>> = new Map();
//   // No need to be observable.
//   protected prevTokenMap: ReadonlyMap<string, ReadonlyArray<TokenInfo>> =
//     new Map();

//   constructor(
//     protected readonly eventListener: {
//       addEventListener: (type: string, fn: () => unknown) => void;
//     },
//     protected readonly chainStore: ChainStore<any>,
//     protected readonly chainId: string,
//     protected readonly requester: MessageRequester
//   ) {
//     makeObservable(this);

//     this.refreshTokens();

//     // If key store in the owallet extension is unlocked, this event will be dispatched.
//     // This is needed becuase the token such as secret20 exists according to the account.
//     this.eventListener.addEventListener("keplr_keystoreunlock", () => {
//       this.refreshTokens();
//     });

//     // If key store in the owallet extension is changed, this event will be dispatched.
//     // This is needed becuase the token such as secret20 exists according to the account.
//     this.eventListener.addEventListener("keplr_keystorechange", () => {
//       this.refreshTokens();
//     });
//   }

//   get tokens(): DeepReadonly<AppCurrency[]> {
//     return this._tokens;
//   }

//   protected async refreshTokens() {
//     const allCW20TokenInfosMsg = new GetAllTokenInfosMsg();
//     const cw20Tokens = await this.requester.sendMessage(
//       BACKGROUND_PORT,
//       allCW20TokenInfosMsg
//     );

//     // const chainInfo = this.chainStore.getChain(this.chainId);

//     // if (
//     //   (chainInfo.features &&
//     //     // Tokens service is only needed for secretwasm and cosmwasm,
//     //     // so, there is no need to fetch the registered token if the chain doesn't support the secretwasm and cosmwasm.
//     //     (chainInfo.features.includes("secretwasm") ||
//     //       chainInfo.features.includes("cosmwasm"))) ||
//     //   chainInfo.features.includes("isEvm")
//     // ) {
//     //   const msg = new GetTokensMsg(this.chainId);
//     //   this._tokens = yield* toGenerator(
//     //     this.requester.sendMessage(BACKGROUND_PORT, msg)
//     //   );
//     // } else {
//     //   this._tokens = [];
//     // }
//     runInAction(() => {
//       const map = new Map<string, TokenInfo[]>();
//       for (const [key, value] of Object.entries(cw20Tokens)) {
//         if (value) {
//           map.set(key, value);
//         }
//       }
//       this.tokenMap = map;
//     });
//   }

//   @flow
//   *addToken(currency: AppCurrency) {
//     const msg = new AddTokenMsg(this.chainId, currency);
//     yield this.requester.sendMessage(BACKGROUND_PORT, msg);
//     yield this.refreshTokens();
//   }

//   @flow
//   *removeToken(currency: AppCurrency) {
//     const msg = new RemoveTokenMsg(this.chainId, currency);
//     yield this.requester.sendMessage(BACKGROUND_PORT, msg);
//     yield this.refreshTokens();
//   }
// }

export class TokensStore {
  protected _isInitialized: boolean = false;
  protected prevTokens: Map<string, AppCurrency[]> = new Map();
  @observable.ref
  protected tokenMap: ReadonlyMap<string, ReadonlyArray<TokenInfo>> = new Map();
  // No need to be observable.
  protected prevTokenMap: ReadonlyMap<string, ReadonlyArray<TokenInfo>> =
    new Map();

  constructor(
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly chainStore: ChainStore,
    protected readonly requester: MessageRequester,
    protected readonly interactionStore: InteractionStore,
    protected readonly accountStore: AccountStore<AccountWithAll>,
    protected readonly keyRingStore: KeyRingStore
  ) {
    // super((chainId: string) => {
    //   return new TokensStoreInner(
    //     this.eventListener,
    //     this.chainStore,
    //     chainId,
    //     this.requester
    //   );
    // });
    makeObservable(this);

    // this.chainStore.addSetChainInfoHandler((chainInfoInner) => {
    //   autorun(() => {
    //     const chainIdentifier = ChainIdHelper.parse(chainInfoInner.chainId);

    //     // Tokens should be changed whenever the account changed.
    //     // But, the added currencies are not removed automatically.
    //     // So, we should remove the prev token currencies from the chain info.
    //     const prevToken = this.prevTokens.get(chainIdentifier.identifier) ?? [];
    //     chainInfoInner.removeCurrencies(
    //       ...prevToken.map((token) => token.coinMinimalDenom)
    //     );

    //     const inner = this.getTokensOf(chainInfoInner.chainId);
    //     chainInfoInner.addCurrencies(...inner.tokens);

    //     this.prevTokens.set(
    //       chainIdentifier.identifier,
    //       inner.tokens as AppCurrency[]
    //     );
    //   });
    // });
  }

  // getTokensOf(chainId: string) {
  //   return this.get(chainId);
  // }
  async init(): Promise<void> {
    await this.refreshTokens();

    // If key store in the keplr extension is changed, this event will be dispatched.
    // This is needed becuase the token such as secret20 exists according to the account.
    this.eventListener.addEventListener("keplr_keystorechange", () => {
      this.clearTokensFromChainInfos();
      this.refreshTokens();
    });

    autorun(() => {
      // Account가 변경되었을때, 체인 정보가 변경되었을때 등에 반응해야하기 때문에 autorun 안에 넣는다.
      this.updateChainInfos();
    });

    runInAction(() => {
      this._isInitialized = true;
    });
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
  @action
  protected clearTokensFromChainInfos() {
    const chainInfos = this.chainStore.chainInfos;
    for (const chainInfo of chainInfos) {
      const chainIdentifier = ChainIdHelper.parse(chainInfo.chainId);

      // Tokens should be changed whenever the account changed.
      // But, the added currencies are not removed automatically.
      // So, we should remove the prev token currencies from the chain info.
      const prevTokens =
        this.prevTokenMap.get(chainIdentifier.identifier) ?? [];
      chainInfo.removeCurrencies(
        ...prevTokens.map((token) => token.currency.coinMinimalDenom)
      );
    }
  }
  protected updateChainInfos() {
    const chainInfos = this.chainStore.chainInfos;
    for (const chainInfo of chainInfos) {
      const chainIdentifier = ChainIdHelper.parse(chainInfo.chainId);

      const tokens = this.tokenMap.get(chainIdentifier.identifier) ?? [];

      const adds: AppCurrency[] = [];

      for (const token of tokens) {
        if (!token.associatedAccountAddress) {
          adds.push(token.currency);
        } else if (
          this.keyRingStore.status === KeyRingStatus.UNLOCKED &&
          this.accountStore.getAccount(chainInfo.chainId).bech32Address
        ) {
          if (
            Buffer.from(
              Bech32Address.fromBech32(
                this.accountStore.getAccount(chainInfo.chainId).bech32Address
              ).address
            ).toString("hex") === token.associatedAccountAddress
          ) {
            adds.push(token.currency);
          }
        }
      }

      chainInfo.addCurrencies(...adds);
    }

    this.prevTokenMap = this.tokenMap;
  }
  protected async refreshTokens() {
    const allCW20TokenInfosMsg = new GetAllTokenInfosMsg();
    const cw20Tokens = await this.requester.sendMessage(
      BACKGROUND_PORT,
      allCW20TokenInfosMsg
    );

    // const chainInfo = this.chainStore.getChain(this.chainId);

    // if (
    //   (chainInfo.features &&
    //     // Tokens service is only needed for secretwasm and cosmwasm,
    //     // so, there is no need to fetch the registered token if the chain doesn't support the secretwasm and cosmwasm.
    //     (chainInfo.features.includes("secretwasm") ||
    //       chainInfo.features.includes("cosmwasm"))) ||
    //   chainInfo.features.includes("isEvm")
    // ) {
    //   const msg = new GetTokensMsg(this.chainId);
    //   this._tokens = yield* toGenerator(
    //     this.requester.sendMessage(BACKGROUND_PORT, msg)
    //   );
    // } else {
    //   this._tokens = [];
    // }
    runInAction(() => {
      const map = new Map<string, TokenInfo[]>();
      for (const [key, value] of Object.entries(cw20Tokens)) {
        if (value) {
          map.set(key, value);
        }
      }
      this.tokenMap = map;
    });
  }
  async addToken(chainId: string, currency: AppCurrency): Promise<void> {
    const bech32Address = this.accountStore.getAccount(chainId).bech32Address;
    if (!bech32Address) {
      throw new Error("Account not initialized");
    }
    const chainInfo = this.chainStore.getChain(chainId);
    // const isEvmChain = chainInfo.evm != null;
    const hasBech32Config = chainInfo.bech32Config != null;
    const associatedAccountAddress = hasBech32Config
      ? Buffer.from(
          Bech32Address.fromBech32(
            bech32Address,
            chainInfo.bech32Config.bech32PrefixAccAddr
          ).address
        ).toString("hex")
      : "";

    const msg = new AddTokenMsg(chainId, associatedAccountAddress, currency);
    const res = await this.requester.sendMessage(BACKGROUND_PORT, msg);
    runInAction(() => {
      const newTokenMap = new Map(this.tokenMap);
      const chainIdentifier = ChainIdHelper.parse(chainInfo.chainId);
      const newTokens = res[chainIdentifier.identifier];
      if (newTokens) {
        newTokenMap.set(chainIdentifier.identifier, newTokens);
      }

      this.tokenMap = newTokenMap;
    });
  }

  async removeToken(chainId: string, tokenInfo: TokenInfo): Promise<void> {
    const contractAddress = (() => {
      if ("contractAddress" in tokenInfo.currency) {
        return tokenInfo.currency.contractAddress;
      }

      throw new Error("Token info is not for contract");
    })();

    const chainInfo = this.chainStore.getChain(chainId);
    // const isEvmChain = chainInfo.evm !== undefined;

    const msg = new RemoveTokenMsg(
      chainId,
      tokenInfo.associatedAccountAddress ?? "",
      contractAddress
    );
    const res = await this.requester.sendMessage(BACKGROUND_PORT, msg);
    runInAction(() => {
      // Remove 이후에는 지워진 토큰에 대한 싱크를 맞추기 위해서 clearTokensFromChainInfos를 호출한다.
      // 그냥 다 지우고 다시 다 설정하는 방식임.
      this.clearTokensFromChainInfos();

      const newTokenMap = new Map(this.tokenMap);
      const chainIdentifier = ChainIdHelper.parse(chainInfo.chainId);
      const newTokens = res[chainIdentifier.identifier];
      if (newTokens) {
        newTokenMap.set(chainIdentifier.identifier, newTokens);
      }

      this.tokenMap = newTokenMap;
    });
  }
  getTokens(chainId: string): ReadonlyArray<TokenInfo> {
    const bech32Address = this.accountStore.getAccount(chainId).bech32Address;
    const chainInfo = this.chainStore.getChain(chainId);

    const hasBech32Config = chainInfo.bech32Config != null;
    const associatedAccountAddress =
      hasBech32Config && bech32Address
        ? Buffer.from(
            Bech32Address.fromBech32(
              bech32Address,
              chainInfo.bech32Config.bech32PrefixAccAddr
            ).address
          ).toString("hex")
        : undefined;

    const tokens =
      this.tokenMap.get(ChainIdHelper.parse(chainId).identifier) ?? [];

    return tokens.filter((token) => {
      if (
        token.associatedAccountAddress &&
        associatedAccountAddress &&
        token.associatedAccountAddress !== associatedAccountAddress
      ) {
        return false;
      }

      return true;
    });
  }
  get waitingSuggestedToken() {
    const datas = this.interactionStore.getDatas<{
      chainId: string;
      contractAddress: string;
      viewingKey?: string;
    }>(SuggestTokenMsg.type());

    if (datas.length > 0) {
      return datas[0];
    }
  }

  @flow
  *approveSuggestedToken(appCurrency: AppCurrency) {
    const data = this.waitingSuggestedToken;
    if (data) {
      yield this.interactionStore.approve(
        SuggestTokenMsg.type(),
        data.id,
        appCurrency
      );
      this.refreshTokens();
      // yield this.getTokensOf(data.data.chainId).refreshTokens();
    }
  }

  @flow
  *rejectSuggestedToken() {
    const data = this.waitingSuggestedToken;
    if (data) {
      yield this.interactionStore.reject(SuggestTokenMsg.type(), data.id);
    }
  }

  @flow
  *rejectAllSuggestedTokens() {
    yield this.interactionStore.rejectAll(SuggestTokenMsg.type());
  }
}

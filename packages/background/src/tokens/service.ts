import { delay, inject, singleton } from "tsyringe";
import { TYPES } from "../types";

import { Env, OWalletError } from "@owallet/router";
import {
  ChainInfo,
  AppCurrency,
  CW20Currency,
  Secret20Currency,
  ERC20Currency,
} from "@owallet/types";
import {
  CurrencySchema,
  CW20CurrencySchema,
  ERC20CurrencySchema,
  Secret20CurrencySchema,
} from "../chains";
import { computedFn } from "mobx-utils";
import { Bech32Address, ChainIdHelper } from "@owallet/cosmos";
import { ChainsService } from "../chains";
import { KeyRingService } from "../keyring";
import { KVStore } from "@owallet/common";
import { KeyRingStatus } from "../keyring";
import { InteractionService } from "../interaction";
import { PermissionService } from "../permission";

import { Buffer } from "buffer";
import { SuggestTokenMsg } from "./messages";
import { getSecret20ViewingKeyPermissionType, TokenInfo } from "./types";
import {
  action,
  autorun,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from "mobx";
@singleton()
export class TokensService {
  @observable
  protected tokenMap: Map<string, TokenInfo[]> = new Map();
  constructor(
    @inject(TYPES.TokensStore)
    protected readonly kvStore: KVStore,
    @inject(delay(() => InteractionService))
    protected readonly interactionService: InteractionService,
    @inject(delay(() => PermissionService))
    public readonly permissionService: PermissionService,
    @inject(ChainsService)
    protected readonly chainsService: ChainsService,
    @inject(delay(() => KeyRingService))
    public readonly keyRingService: KeyRingService
  ) {
    this.init();
    this.chainsService.addChainRemovedHandler(this.onChainRemoved);
  }

  protected readonly onChainRemoved = (chainId: string) => {
    this.clearTokens(chainId);
    const chainIdentifier = ChainIdHelper.parse(chainId).identifier;
    runInAction(() => {
      this.tokenMap.delete(chainIdentifier);
    });
  };
  async suggestToken(
    env: Env,
    chainId: string,
    contractAddress: string,
    // Should be hex encoded. (not bech32)
    associatedAccountAddress: string,
    viewingKey?: string
  ) {
    this.validateAssociatedAccountAddress(associatedAccountAddress);
    const chainInfo = await this.chainsService.getChainInfo(chainId);
    // this.validateChainInfoFeatures(chainInfo);

    const existing = this.getToken(
      chainId,
      contractAddress,
      associatedAccountAddress
    );

    // If the same currency is already registered, do nothing.
    if (existing) {
      // If the secret20 token,
      // just try to change the viewing key.
      if (viewingKey) {
        if (
          "type" in existing.currency &&
          existing.currency.type === "secret20" &&
          existing.currency.viewingKey !== viewingKey
        ) {
          await this.setToken(
            chainId,
            {
              ...existing.currency,
              viewingKey,
            },
            associatedAccountAddress
          );
        }
        return;
      }
      return;
    }

    // Validate the contract address.
    Bech32Address.validate(
      contractAddress,
      chainInfo.bech32Config?.bech32PrefixAccAddr
    );

    const params = {
      chainId,
      contractAddress,
      viewingKey,
    };

    const appCurrency = (await this.interactionService.waitApprove(
      env,
      "/add-token",
      SuggestTokenMsg.type(),
      params
    )) as AppCurrency;

    await this.setToken(chainId, appCurrency, associatedAccountAddress);
  }
  async setToken(
    chainId: string,
    currency: AppCurrency,
    // Should be hex encoded. (not bech32)
    associatedAccountAddress: string
  ): Promise<void> {
    this.validateAssociatedAccountAddress(associatedAccountAddress);
    const chainInfo = await this.chainsService.getChainInfo(chainId);
    // this.validateChainInfoFeatures(chainInfo);
    const chainIdentifier = ChainIdHelper.parse(chainId).identifier;

    if (!this.tokenMap.has(chainIdentifier)) {
      runInAction(() => {
        this.tokenMap.set(chainIdentifier, []);
      });
    }

    const tokens = this.tokenMap.get(chainIdentifier)!;

    currency = await TokensService.validateCurrency(chainInfo, currency);

    if (
      !("type" in currency) ||
      (currency.type !== "cw20" &&
        currency.type !== "erc20" &&
        currency.type !== "secret20")
    ) {
      throw new Error("Unknown type of currency");
    }

    if (currency.type === "secret20" && !currency.viewingKey) {
      throw new Error("Viewing key must be set");
    }

    const contractAddress = currency.contractAddress;
    const needAssociateAccount = currency.type === "secret20";

    const find = tokens.find((token) => {
      if (
        token.associatedAccountAddress &&
        token.associatedAccountAddress !== associatedAccountAddress
      ) {
        return false;
      }

      if ("contractAddress" in token.currency) {
        return token.currency.contractAddress === contractAddress;
      }
      return false;
    });

    runInAction(() => {
      if (find) {
        find.currency = currency;
      } else {
        tokens.push({
          associatedAccountAddress: needAssociateAccount
            ? associatedAccountAddress
            : undefined,
          currency,
        });
      }
    });
  }

  async addToken(chainId: string, currency: AppCurrency) {
    try {
      const chainInfo = await this.chainsService.getChainInfo(chainId);

      // Update coinMinimalDenom here ?
      currency = {
        ...currency,
        coinMinimalDenom: `${"type" in currency && currency.type}:${
          "contractAddress" in currency && currency.contractAddress
        }:${currency.coinDenom}`,
        coinImageUrl: currency.coinImageUrl.startsWith("https")
          ? currency.coinImageUrl
          : "https://www.svgrepo.com/show/451667/image-missing.svg",
      };
      currency = await TokensService.validateCurrency(chainInfo, currency);
      const chainCurrencies = await this.getTokens(chainId);

      const isTokenForAccount =
        "type" in currency && currency.type === "secret20";
      let isCurrencyUpdated = false;

      for (const chainCurrency of chainCurrencies) {
        if (currency.coinMinimalDenom === chainCurrency.coinMinimalDenom) {
          if (!isTokenForAccount) {
            // If currency is already registered, do nothing.
            return;
          }

          isCurrencyUpdated = true;
        }
      }

      if (!isTokenForAccount) {
        try {
          const currencies = await this.getTokensFromChain(chainId);
          currencies.push(currency);
          await this.saveTokensToChain(chainId, currencies);
        } catch (error) {
          console.log(error);
        }
      } else {
        const currencies = await this.getTokensFromChainAndAccount(chainId);
        if (!isCurrencyUpdated) {
          currencies.push(currency);
          await this.saveTokensToChainAndAccount(chainId, currencies);
        } else {
          const index = currencies.findIndex(
            (cur) => cur.coinMinimalDenom === currency.coinMinimalDenom
          );
          if (index >= 0) {
            currencies[index] = currency;
            await this.saveTokensToChainAndAccount(chainId, currencies);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  async init(): Promise<void> {
    const migrated = await this.kvStore.get<boolean>("migrated/v2");
    if (!migrated) {
      for (const chainInfo of await this.chainsService.getChainInfos()) {
        const identifier = ChainIdHelper.parse(chainInfo.chainId).identifier;
        const globalTokens = await this.kvStore.get<AppCurrency[]>(identifier);
        if (globalTokens && globalTokens.length > 0) {
          this.tokenMap.set(
            identifier,
            globalTokens.map((currency) => {
              return {
                currency,
              };
            })
          );
        }

        const reverseAddresses = await this.kvStore.get<string[]>(
          `${identifier}-addresses`
        );
        if (reverseAddresses && reverseAddresses.length > 0) {
          for (const reverseAddress of reverseAddresses) {
            const currencies = await this.kvStore.get<AppCurrency[]>(
              `${identifier}-${reverseAddress}`
            );
            if (currencies && currencies.length > 0) {
              this.tokenMap.set(
                identifier,
                currencies.map((currency) => {
                  return {
                    associatedAccountAddress: reverseAddress,
                    currency,
                  };
                })
              );
            }
          }
        }
      }

      await this.kvStore.set<boolean>("migrated/v2", true);
    }

    {
      const saved = await this.kvStore.get<Record<string, TokenInfo[]>>(
        "tokenMap"
      );
      if (saved) {
        for (const [key, value] of Object.entries(saved)) {
          this.tokenMap.set(key, value);
        }
      }
      autorun(() => {
        const js = toJS(this.tokenMap);
        const obj = Object.fromEntries(js);
        this.kvStore.set<Record<string, TokenInfo[]>>("tokenMap", obj);
      });
    }

    this.chainsService.addChainRemovedHandler(this.onChainRemoved);
  }
  getAllTokenInfos = computedFn((): Record<string, TokenInfo[] | undefined> => {
    const js = toJS(this.tokenMap);
    return Object.fromEntries(js);
  });
  @action
  removeToken(
    chainId: string,
    contractAddress: string,
    // Should be hex encoded. (not bech32)
    associatedAccountAddress: string
  ) {
    // 얘는 associatedAccountAddress가 empty string이더라도 허용된다.
    // tokenInfo 안에 contract address와 associatedAccountAddress가 존재하므로
    // 프론트에서 계정 초기화없이 token info만 보고 remove를 가능하게 하도록 하기 위함임.

    const chainIdentifier = ChainIdHelper.parse(chainId).identifier;
    const tokens = this.tokenMap.get(chainIdentifier);
    if (!tokens) {
      return;
    }
    const findIndex = tokens.findIndex((token) => {
      if (
        token.associatedAccountAddress &&
        token.associatedAccountAddress !== associatedAccountAddress
      ) {
        return false;
      }

      if ("contractAddress" in token.currency) {
        return token.currency.contractAddress === contractAddress;
      }
      return false;
    });

    if (findIndex >= 0) {
      tokens.splice(findIndex, 1);
    }
  }

  public async getTokens(chainId: string): Promise<AppCurrency[]> {
    const chainIdHelper = ChainIdHelper.parse(chainId);

    const chainCurrencies =
      (await this.kvStore.get<AppCurrency[]>(chainIdHelper.identifier)) ?? [];

    let keyCurrencies: AppCurrency[] = [];
    if (this.keyRingService.keyRingStatus === KeyRingStatus.UNLOCKED) {
      const currentKey = await this.keyRingService.getKey(chainId);

      keyCurrencies =
        (await this.kvStore.get<AppCurrency[]>(
          `${chainIdHelper.identifier}-${Buffer.from(
            currentKey.address
          ).toString("hex")}`
        )) ?? [];
    }

    return chainCurrencies.concat(keyCurrencies);
  }

  public async clearTokens(chainId: string): Promise<void> {
    const chainIdHelper = ChainIdHelper.parse(chainId);

    await this.kvStore.set(chainIdHelper.identifier, null);

    const reverse = await this.getTokensToAccountReverse(chainId);
    for (const hexAddress of reverse) {
      await this.kvStore.set(`${chainIdHelper.identifier}-${hexAddress}`, null);
    }
    await this.setTokensToAccountReverse(chainId, []);
  }

  private async getTokensFromChain(chainId: string): Promise<AppCurrency[]> {
    const chainIdHelper = ChainIdHelper.parse(chainId);

    return (
      (await this.kvStore.get<AppCurrency[]>(chainIdHelper.identifier)) ?? []
    );
  }

  private async saveTokensToChain(chainId: string, currencies: AppCurrency[]) {
    const chainIdHelper = ChainIdHelper.parse(chainId);
    await this.kvStore.set(chainIdHelper.identifier, currencies);
  }

  private async getTokensFromChainAndAccount(
    chainId: string
  ): Promise<AppCurrency[]> {
    const chainIdHelper = ChainIdHelper.parse(chainId);

    const currentKey = await this.keyRingService.getKey(chainId);
    return (
      (await this.kvStore.get<Promise<AppCurrency[]>>(
        `${chainIdHelper.identifier}-${Buffer.from(currentKey.address).toString(
          "hex"
        )}`
      )) ?? []
    );
  }

  private async saveTokensToChainAndAccount(
    chainId: string,
    currencies: AppCurrency[]
  ) {
    const chainIdHelper = ChainIdHelper.parse(chainId);

    const currentKey = await this.keyRingService.getKey(chainId);
    const hexAddress = Buffer.from(currentKey.address).toString("hex");
    await this.kvStore.set(
      `${chainIdHelper.identifier}-${hexAddress}`,
      currencies
    );

    await this.insertTokensToAccountReverse(chainId, hexAddress);
  }

  private async getTokensToAccountReverse(chainId: string): Promise<string[]> {
    const chainIdHelper = ChainIdHelper.parse(chainId);

    return (
      (await this.kvStore.get(`${chainIdHelper.identifier}-addresses`)) ?? []
    );
  }

  private async setTokensToAccountReverse(
    chainId: string,
    addresses: string[]
  ) {
    const chainIdHelper = ChainIdHelper.parse(chainId);

    await this.kvStore.set(`${chainIdHelper.identifier}-addresses`, addresses);
  }

  private async insertTokensToAccountReverse(chainId: string, address: string) {
    const reverse = await this.getTokensToAccountReverse(chainId);
    if (reverse.indexOf(address) < 0) {
      reverse.push(address);
      await this.setTokensToAccountReverse(chainId, reverse);
    }
  }

  getSecret20ViewingKey(
    chainId: string,
    contractAddress: string,
    // Should be hex encoded. (not bech32)
    associatedAccountAddress: string
  ): string {
    this.validateAssociatedAccountAddress(associatedAccountAddress);

    const token = this.getToken(
      chainId,
      contractAddress,
      associatedAccountAddress
    );

    if (token) {
      if ("type" in token.currency && token.currency.type === "secret20") {
        return token.currency.viewingKey;
      }
    }

    throw new OWalletError("token-cw20", 111, "There is no matched secret20");
  }

  protected validateAssociatedAccountAddress(value: string) {
    if (!value) {
      throw new Error("Please provide the associated account address");
    }

    if (Buffer.from(value, "hex").toString("hex") !== value) {
      throw new Error("Invalid associated account address");
    }
  }
  getToken = computedFn(
    (
      chainId: string,
      contractAddress: string,
      // Should be hex encoded. (not bech32)
      associatedAccountAddress: string
    ): TokenInfo | undefined => {
      const chainIdentifier = ChainIdHelper.parse(chainId).identifier;
      const tokens = this.tokenMap.get(chainIdentifier);
      if (!tokens) {
        return undefined;
      }
      return tokens.find((token) => {
        if (
          token.associatedAccountAddress &&
          token.associatedAccountAddress !== associatedAccountAddress
        ) {
          return false;
        }

        if ("contractAddress" in token.currency) {
          return token.currency.contractAddress === contractAddress;
        }
        return false;
      });
    }
  );
  async checkOrGrantSecret20ViewingKeyPermission(
    env: Env,
    chainId: string,
    contractAddress: string,
    origin: string
  ) {
    const type = getSecret20ViewingKeyPermissionType(contractAddress);

    if (!this.permissionService.hasPermisson(chainId, type, origin)) {
      await this.permissionService.grantPermission(
        env,
        "/permission/viewing-key",
        [chainId],
        type,
        [origin]
      );
    }

    this.permissionService.checkPermission(env, chainId, type, origin);
  }

  static async validateCurrency(
    chainInfo: ChainInfo,
    currency: AppCurrency
  ): Promise<AppCurrency> {
    // Validate the schema.
    if ("type" in currency) {
      switch (currency.type) {
        case "cw20":
          currency = await TokensService.validateCW20Currency(
            chainInfo,
            currency
          );
          break;
        case "secret20":
          currency = await TokensService.validateSecret20Currency(
            chainInfo,
            currency
          );
          break;
        case "erc20":
          currency = await TokensService.validateERC20Currency(
            chainInfo,
            currency
          );
          break;
        default:
          throw new Error("Unknown type of currency");
      }
    } else {
      currency = await CurrencySchema.validateAsync(currency);
    }

    return currency;
  }

  static async validateCW20Currency(
    chainInfo: ChainInfo,
    currency: CW20Currency
  ): Promise<CW20Currency> {
    // Validate the schema.
    currency = await CW20CurrencySchema.validateAsync(currency);

    // Validate the contract address.
    Bech32Address.validate(
      currency.contractAddress,
      chainInfo.bech32Config.bech32PrefixAccAddr
    );

    return currency;
  }

  static async validateERC20Currency(
    chainInfo: ChainInfo,
    currency: ERC20Currency
  ): Promise<ERC20Currency> {
    // Validate the schema.
    currency = await ERC20CurrencySchema.validateAsync(currency);

    // Validate the contract address.
    if (!currency.contractAddress.startsWith("0x"))
      throw new Error("Not a valid erc20 address");
    return currency;
  }

  static async validateSecret20Currency(
    chainInfo: ChainInfo,
    currency: Secret20Currency
  ): Promise<Secret20Currency> {
    // Validate the schema.
    currency = await Secret20CurrencySchema.validateAsync(currency);

    // Validate the contract address.
    Bech32Address.validate(
      currency.contractAddress,
      chainInfo.bech32Config.bech32PrefixAccAddr
    );

    return currency;
  }
}

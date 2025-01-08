import { ChainStore } from "./chain";
import {
  AmplitudeApiKey,
  CoinGeckoAPIEndPoint,
  CoinGeckoGetPrice,
  CoinGeckoTerminalAPIEndPoint,
  CoinGeckoTerminalGetPrice,
  EmbedChainInfos,
  ExtensionKVStore,
  FiatCurrencies,
} from "@owallet/common";
import {
  KeyRingStore,
  InteractionStore,
  QueriesStore,
  CoinGeckoPriceStore,
  AccountStore,
  PermissionStore,
  SignInteractionStore,
  LedgerInitStore,
  TokensStore,
  ChainSuggestStore,
  IBCChannelStore,
  IBCCurrencyRegsitrar,
  AccountWithAll,
  getOWalletFromWindow,
  getEthereumFromWindow,
  getTronWebFromWindow,
  getBitcoinFromWindow,
  getSolanaFromWindow,
  QueriesWrappedSvm,
  CoinGeckoTerminalPriceStore,
} from "@owallet/stores";
import {
  ExtensionRouter,
  ContentScriptEnv,
  ContentScriptGuards,
  InExtensionMessageRequester,
} from "@owallet/router-extension";
import { APP_PORT } from "@owallet/router";
import { ChainInfoWithEmbed } from "@owallet/background";
import { FiatCurrency } from "@owallet/types";
import { UIConfigStore } from "@owallet/common";
import { FeeType } from "@owallet/hooks";
import { AnalyticsStore, NoopAnalyticsClient } from "@owallet/analytics";
import Amplitude from "amplitude-js";
import { ChainIdHelper } from "@owallet/cosmos";
import { HugeQueriesStore } from "./huge-queries";

export class RootStore {
  public readonly uiConfigStore: UIConfigStore;

  public readonly chainStore: ChainStore;
  public readonly keyRingStore: KeyRingStore;
  public readonly ibcChannelStore: IBCChannelStore;

  protected readonly interactionStore: InteractionStore;
  public readonly permissionStore: PermissionStore;
  public readonly signInteractionStore: SignInteractionStore;
  public readonly ledgerInitStore: LedgerInitStore;
  public readonly chainSuggestStore: ChainSuggestStore;

  public readonly queriesStore: QueriesStore<QueriesWrappedSvm>;
  public readonly accountStore: AccountStore<AccountWithAll>;
  // public readonly accountEvmStore: AccountEvmStore<AccountWithAll>;
  public readonly priceStore: CoinGeckoPriceStore;
  public readonly tokensStore: TokensStore;
  public readonly geckoTerminalStore: CoinGeckoTerminalPriceStore;
  public readonly hugeQueriesStore: HugeQueriesStore;
  public readonly hugeQueriesNewStore: HugeQueriesStore;

  protected readonly ibcCurrencyRegistrar: IBCCurrencyRegsitrar<ChainInfoWithEmbed>;

  public readonly analyticsStore: AnalyticsStore<
    {
      chainId?: string;
      chainName?: string;
      toChainId?: string;
      toChainName?: string;
      registerType?: "seed" | "google" | "ledger" | "qr";
      feeType?: FeeType | undefined;
      isIbc?: boolean;
      rpc?: string;
      rest?: string;
    },
    {
      registerType?: "seed" | "google" | "ledger" | "qr";
      accountType?: "mnemonic" | "privateKey" | "ledger";
      currency?: string;
      language?: string;
    }
  >;

  constructor() {
    this.uiConfigStore = new UIConfigStore(
      new ExtensionKVStore("store_ui_config")
    );

    const router = new ExtensionRouter(ContentScriptEnv.produceEnv);
    router.addGuard(ContentScriptGuards.checkMessageIsInternal);

    // Order is important.
    this.interactionStore = new InteractionStore(
      router,
      new InExtensionMessageRequester()
    );

    this.chainStore = new ChainStore(
      EmbedChainInfos,
      new InExtensionMessageRequester(),
      localStorage.getItem("initchain")
    );

    this.keyRingStore = new KeyRingStore(
      {
        dispatchEvent: (type: string) => {
          window.dispatchEvent(new Event(type));
        },
      },
      "scrypt",
      this.chainStore,
      new InExtensionMessageRequester(),
      this.interactionStore
    );

    this.ibcChannelStore = new IBCChannelStore(
      new ExtensionKVStore("store_ibc_channel")
    );

    this.permissionStore = new PermissionStore(
      this.interactionStore,
      new InExtensionMessageRequester()
    );
    this.signInteractionStore = new SignInteractionStore(this.interactionStore);
    this.ledgerInitStore = new LedgerInitStore(
      this.interactionStore,
      new InExtensionMessageRequester()
    );
    this.chainSuggestStore = new ChainSuggestStore(this.interactionStore);

    this.queriesStore = new QueriesStore(
      new ExtensionKVStore("store_queries"),
      this.chainStore,
      {
        responseDebounceMs: 75,
      },
      getOWalletFromWindow,
      QueriesWrappedSvm
    );

    const chainOpts = this.chainStore.chainInfos.map((chainInfo) => {
      if (chainInfo.chainId.startsWith("native-0x5afe")) {
        return {
          chainId: chainInfo.chainId,
          msgOpts: {
            send: {
              native: {
                gas: 0,
              },
              erc20: {
                gas: 21000,
              },
            },
          },
        };
      }
      // In evm network, default gas for sending
      if (chainInfo.networkType.startsWith("evm")) {
        return {
          chainId: chainInfo.chainId,
          msgOpts: {
            send: {
              native: {
                gas: 21000,
              },
              erc20: {
                gas: 21000,
              },
            },
          },
        };
      }
      // In osmosis, increase the default gas for sending
      if (chainInfo.chainId.startsWith("osmosis-")) {
        return {
          chainId: chainInfo.chainId,
          msgOpts: {
            send: {
              native: {
                gas: 400000,
              },
              withdrawRewards: {
                gas: 400000,
              },
            },
          },
        };
      }

      if (chainInfo.chainId.startsWith("evmos_")) {
        return {
          chainId: chainInfo.chainId,
          msgOpts: {
            send: {
              native: {
                gas: 140000,
              },
            },
            withdrawRewards: {
              gas: 200000,
            },
          },
        };
      }

      return { chainId: chainInfo.chainId };
    });

    this.accountStore = new AccountStore(
      window,
      AccountWithAll,
      this.chainStore,
      this.queriesStore,
      {
        defaultOpts: {
          // When the unlock request sent from external webpage,
          // it will open the extension popup below the uri "/unlock".
          // But, in this case, if the prefetching option is true, it will redirect
          // the page to the "/unlock" with **interactionInternal=true**
          // because prefetching will request the unlock from the internal.
          // To prevent this problem, just check the first uri is "#/unlcok" and
          // if it is "#/unlock", don't use the prefetching option.
          prefetching: !window.location.href.includes("#/unlock"),
          suggestChain: false,
          autoInit: true,
          getOWallet: getOWalletFromWindow,
          getEthereum: getEthereumFromWindow,
          getTronWeb: getTronWebFromWindow,
          getBitcoin: getBitcoinFromWindow,
          getSolana: getSolanaFromWindow,
        },
        chainOpts,
      }
    );

    // this.accountEvmStore = new AccountEvmStore(
    //   window,
    //   AccountWithAll,
    //   this.chainStore,
    //   this.queriesStore,
    //   {
    //     defaultOpts: {
    //       // When the unlock request sent from external webpage,
    //       // it will open the extension popup below the uri "/unlock".
    //       // But, in this case, if the prefetching option is true, it will redirect
    //       // the page to the "/unlock" with **interactionInternal=true**
    //       // because prefetching will request the unlock from the internal.
    //       // To prevent this problem, just check the first uri is "#/unlcok" and
    //       // if it is "#/unlock", don't use the prefetching option.
    //       prefetching: !window.location.href.includes('#/unlock'),
    //       suggestChain: false,
    //       autoInit: true,
    //       getOWallet: getOWalletFromWindow,
    //       getEthereum: getEthereumFromWindow,
    //     },
    //     chainOpts
    //   }
    // );

    // this.priceStore = new CoinGeckoPriceStore(
    //   new ExtensionKVStore("store_prices"),
    //   FiatCurrencies.reduce<{
    //     [vsCurrency: string]: FiatCurrency;
    //   }>((obj, fiat) => {
    //     obj[fiat.currency] = fiat;
    //     return obj;
    //   }, {}),
    //   "usd"
    // );
    this.geckoTerminalStore = new CoinGeckoTerminalPriceStore(
      new ExtensionKVStore("store_test_prices"),
      FiatCurrencies.reduce<{
        [vsCurrency: string]: FiatCurrency;
      }>((obj, fiat) => {
        obj[fiat.currency] = fiat;
        return obj;
      }, {}),
      "usd",
      {
        baseURL: CoinGeckoTerminalAPIEndPoint,
        uri: CoinGeckoTerminalGetPrice,
      }
    );
    this.priceStore = new CoinGeckoPriceStore(
      new ExtensionKVStore("store_prices"),
      FiatCurrencies.reduce<{
        [vsCurrency: string]: FiatCurrency;
      }>((obj, fiat) => {
        obj[fiat.currency] = fiat;
        return obj;
      }, {}),
      "usd",
      {
        baseURL: CoinGeckoAPIEndPoint,
        uri: "/simple/price",
      },
      this.geckoTerminalStore
    );

    // this.tokensStore = new TokensStore(
    //   window,
    //   this.chainStore,
    //   new InExtensionMessageRequester(),
    //   this.interactionStore
    // );
    this.tokensStore = new TokensStore(
      window,
      this.chainStore,
      new InExtensionMessageRequester(),
      this.interactionStore,
      this.accountStore,
      this.keyRingStore
    );

    this.ibcCurrencyRegistrar = new IBCCurrencyRegsitrar<ChainInfoWithEmbed>(
      new ExtensionKVStore("store_ibc_currency_registrar"),
      24 * 3600 * 1000,
      this.chainStore,
      this.accountStore,
      this.queriesStore,
      this.queriesStore
    );
    this.hugeQueriesStore = new HugeQueriesStore(
      this.chainStore,
      this.queriesStore,
      this.accountStore,
      this.priceStore,
      this.keyRingStore
    );

    this.analyticsStore = new AnalyticsStore(
      (() => {
        if (!AmplitudeApiKey) {
          return new NoopAnalyticsClient();
        } else {
          const amplitudeClient = Amplitude.getInstance();
          amplitudeClient.init(AmplitudeApiKey, undefined, {
            saveEvents: true,
            platform: "Extension",
          });

          return amplitudeClient;
        }
      })(),
      {
        logEvent: (eventName, eventProperties) => {
          if (eventProperties?.chainId || eventProperties?.toChainId) {
            eventProperties = {
              ...eventProperties,
            };

            if (eventProperties.chainId) {
              eventProperties.chainId = ChainIdHelper.parse(
                eventProperties.chainId
              ).identifier;
            }

            if (eventProperties.toChainId) {
              eventProperties.toChainId = ChainIdHelper.parse(
                eventProperties.toChainId
              ).identifier;
            }
          }

          return {
            eventName,
            eventProperties,
          };
        },
      }
    );

    router.listen(APP_PORT);
  }
}

export function createRootStore() {
  return new RootStore();
}

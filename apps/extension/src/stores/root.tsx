import { ChainStore } from "./chain";
import {
  AmplitudeApiKey,
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
  QueriesWrappedTron,
} from "@owallet/stores";
import {
  ExtensionRouter,
  ContentScriptEnv,
  ContentScriptGuards,
  InExtensionMessageRequester,
  InteractionAddon,
} from "@owallet/router-extension";
import { APP_PORT } from "@owallet/router";
import { ChainInfoWithEmbed, InteractionPingMsg } from "@owallet/background";
import { FiatCurrency } from "@owallet/types";
import { UIConfigStore } from "@owallet/common";
import { FeeType } from "@owallet/hooks";
import { AnalyticsStore, NoopAnalyticsClient } from "@owallet/analytics";
import Amplitude from "amplitude-js";
import { ChainIdHelper } from "@owallet/cosmos";
import { HugeQueriesStore } from "./huge-queries";
import { setInteractionDataHref } from "../utils/set-interaction-data-href";

let _sidePanelWindowId: number | undefined;
async function getSidePanelWindowId(): Promise<number | undefined> {
  if (_sidePanelWindowId != null) {
    return _sidePanelWindowId;
  }

  const current = await browser.windows.getCurrent();
  _sidePanelWindowId = current.id;
  return _sidePanelWindowId;
}
// 실행되는 순간 바로 window id를 초기화한다.
// 현재 실행되는 ui의 window id를 알아내야 하는데
// 문제는 extension api에 그런 기능을 찾을수가 없다.
// 대충 유저가 사용하고 있는 window에서 side panel이 열리는게 당연하니
// 일단 이렇게 처리한다.
getSidePanelWindowId();

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

  public readonly queriesStore: QueriesStore<QueriesWrappedTron>;
  public readonly accountStore: AccountStore<AccountWithAll>;
  // public readonly accountEvmStore: AccountEvmStore<AccountWithAll>;
  public readonly priceStore: CoinGeckoPriceStore;
  public readonly tokensStore: TokensStore;
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

    const router = new ExtensionRouter(ContentScriptEnv.produceEnv, (msg) => {
      // background에서 ping을 보낼때
      // side panel이라면 window id를 구분해야한다.
      // 하지만 이게 기존의 message system이 sender/receiver가 한개씩만 존재한다고 생각하고 만들었기 때문에
      // background에서 여러 side panel에 ping을 보낼수는 없다. (보낼수는 있는데 sender에서 반환되는 값은 단순히 가장 먼저 반응한 receiver의 결과일 뿐이다...)
      // 이 문제를 최소한의 변화로 해결하기 위해서
      // side panel일 경우 ping message를 받았을때 window id를 체크해서 원하는 값이 아니라면 무시하도록 한다.
      // XXX: _sidePanelWindowId는 처음에 undefined일 수 있다.
      //      근데 그렇다고 이 함수를 promise로 바꾸는건 router 쪽에서 큰 변화가 필요하기 때문에
      //      당장은 이 문제는 무시하도록 한다. _sidePanelWindowId의 값이 설정되는건 처음에 매우 빠를 것이고
      //      background에서 이 ping msg를 보내는 것 자체가 interval로 보내면서 확인하는 용도이기 때문에
      //      큰 문제가 되지는 않을 것이다.
      if (
        msg instanceof InteractionPingMsg &&
        !msg.ignoreWindowIdAndForcePing
      ) {
        const url = new URL(window.location.href);
        if (url.pathname === "/sidePanel.html") {
          if (_sidePanelWindowId == null) {
            return true;
          }
          return msg.windowId !== _sidePanelWindowId;
        }
      }

      return false;
    });
    router.addGuard(ContentScriptGuards.checkMessageIsInternal);

    // Initialize the interaction addon service.
    const interactionAddonService =
      new InteractionAddon.InteractionAddonService();
    InteractionAddon.init(router, interactionAddonService);

    // Order is important.
    this.interactionStore = new InteractionStore(
      router,
      new InExtensionMessageRequester(),
      (next) => {
        if (next) {
          console.log("next", next);
          setInteractionDataHref(next);
        }
      },
      async (data) => {
        const url = new URL(window.location.href);
        console.log("url receive", url);

        if (url.pathname === "/popup.html") {
          return data;
        }
        if (url.pathname === "/sidePanel.html") {
          const windowId = await getSidePanelWindowId();

          return data.filter((d) => d.windowId === windowId);
        }
        return [];
      },
      (old, fresh) => {
        if (old.length === 0 && fresh.length > 0) {
          setInteractionDataHref(fresh[0]);
        }
      },
      async (windowId: number | undefined, ignoreWindowIdAndForcePing) => {
        const url = new URL(window.location.href);
        if (url.pathname === "/popup.html") {
          return true;
        }
        if (url.pathname === "/sidePanel.html") {
          if (ignoreWindowIdAndForcePing) {
            return true;
          }
          return windowId === (await getSidePanelWindowId());
        }

        return false;
      }
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
      QueriesWrappedTron
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

    this.priceStore = new CoinGeckoPriceStore(
      new ExtensionKVStore("store_prices"),
      FiatCurrencies.reduce<{
        [vsCurrency: string]: FiatCurrency;
      }>((obj, fiat) => {
        obj[fiat.currency] = fiat;
        return obj;
      }, {}),
      "usd"
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

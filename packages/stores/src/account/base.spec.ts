import { AccountSetBase, WalletStatus } from "./base";
import { ChainStore } from "../chain";
import { AppCurrency, ChainInfo } from "@owallet/types";
import { MockOWallet } from "@owallet/provider-mock";
import { AccountSharedContext } from "./context";

describe("Test Account set base", () => {
  test("Account set base should be inited automatically if `autoInit` is true", async () => {
    const chainInfos: {
      readonly chainId: string;
      readonly bech32Config: {
        readonly bech32PrefixAccAddr: string;
      };
      readonly currencies: AppCurrency[];
    }[] = [
      {
        chainId: "test",
        bech32Config: {
          bech32PrefixAccAddr: "cosmos",
        },
        currencies: [],
      },
    ];
    const chainStore = new ChainStore(chainInfos as ChainInfo[]);

    const accountSetBase = new AccountSetBase(
      {
        // No need
        addEventListener: () => {},
        removeEventListener: () => {},
      },
      chainStore,
      "test",
      new AccountSharedContext(async () => {
        return new MockOWallet(
          async () => {
            return new Uint8Array(0);
          },
          chainInfos,
          "curious kitchen brief change imitate open close knock cause romance trim offer"
        );
      }),
      {
        suggestChain: false,
        autoInit: true,
      }
    );

    expect(accountSetBase.walletStatus).toBe(WalletStatus.Loading);

    // Need wait some time to get the OWallet.
    await (() => {
      return new Promise<void>((resolve) => {
        setTimeout(resolve, 1000);
      });
    })();

    expect(accountSetBase.walletStatus).toBe(WalletStatus.Loaded);
    expect(accountSetBase.bech32Address).toBe(
      "cosmos1unx0p9jv79xz278xuk7uuuwj2l99k2sp4vm8wp"
    );
    expect(accountSetBase.isReadyToSendMsgs).toBe(true);
  });

  test("Account set base should not be inited automatically if `autoInit` is false", async () => {
    const chainInfos: {
      readonly chainId: string;
      readonly bech32Config: {
        readonly bech32PrefixAccAddr: string;
      };
      readonly currencies: AppCurrency[];
    }[] = [
      {
        chainId: "test",
        bech32Config: {
          bech32PrefixAccAddr: "cosmos",
        },
        currencies: [],
      },
    ];
    const chainStore = new ChainStore(chainInfos as ChainInfo[]);

    const accountSetBase = new AccountSetBase(
      {
        // No need
        addEventListener: () => {},
        removeEventListener: () => {},
      },
      chainStore,
      "test",
      new AccountSharedContext(async () => {
        return new MockOWallet(
          async () => {
            return new Uint8Array(0);
          },
          chainInfos,
          "curious kitchen brief change imitate open close knock cause romance trim offer"
        );
      }),
      {
        suggestChain: false,
        autoInit: false,
      }
    );

    expect(accountSetBase.walletStatus).toBe(WalletStatus.NotInit);

    // Need wait some time to get the OWallet.
    await (() => {
      return new Promise<void>((resolve) => {
        setTimeout(resolve, 1000);
      });
    })();

    expect(accountSetBase.walletStatus).toBe(WalletStatus.NotInit);
  });
});

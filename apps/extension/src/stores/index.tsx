import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";

import { createRootStore, RootStore } from "./root";
import { getOWalletFromWindow } from "@owallet/stores";
import { OWallet } from "@owallet/types";
import { autorun } from "mobx";
import { PlainObject } from "@owallet/background";
import { addGlobalEventListener } from "../utils/global-events";

interface OWalletCoreTypes {
  __core__getAnalyticsId(): Promise<string>;
}

const storeContext = React.createContext<RootStore | null>(null);

export const StoreProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [stores] = useState(() => createRootStore());

  useEffect(() => {
    getOWalletFromWindow().then(
      (owallet: (OWallet & Partial<OWalletCoreTypes>) | undefined) => {
        // Remember that `OWalletCoreTypes` is only usable on privileged env.
        // Definitely, extension is privileged env. So, we can use `getAnalyticsId()`.
        if (owallet && owallet.__core__getAnalyticsId) {
          owallet.__core__getAnalyticsId().then((id) => {
            stores.analyticsStore.setUserId(id);
          });
        }
      }
    );
  }, [stores.analyticsStore]);

  useEffect(() => {
    const disposal1 = addGlobalEventListener(
      "owallet_keyring_changed",
      async () => {
        await stores.keyRingStore.refreshKeyRingStatus();
        await stores.chainStore.updateEnabledChainIdentifiersFromBackground();

        for (const modularChainInfo of stores.chainStore.modularChainInfos) {
          if ("cosmos" in modularChainInfo) {
            const chainInfo = stores.chainStore.getChain(
              modularChainInfo.chainId
            );
            if (stores.accountStore.hasAccount(chainInfo.chainId)) {
              stores.accountStore.getAccount(chainInfo.chainId).init();
            }
          }
        }
      }
    );

    const disposal2 = addGlobalEventListener(
      "owallet_new_key_created",
      async (newKeyId: string) => {
        await stores.keyRingStore.refreshKeyRingStatus();
        if (newKeyId && stores.keyRingStore.selectedKeyInfo?.id === newKeyId) {
          await stores.chainStore.updateEnabledChainIdentifiersFromBackground();

          for (const modularChainInfo of stores.chainStore.modularChainInfos) {
            if ("cosmos" in modularChainInfo) {
              const chainInfo = stores.chainStore.getChain(
                modularChainInfo.chainId
              );
              if (stores.accountStore.hasAccount(chainInfo.chainId)) {
                stores.accountStore.getAccount(chainInfo.chainId).init();
              }
            }
          }
        }
      }
    );

    const disposal3 = addGlobalEventListener(
      "owallet_enabled_chain_changed",
      async (keyId: string) => {
        if (keyId && stores.keyRingStore.selectedKeyInfo?.id === keyId) {
          await stores.chainStore.updateEnabledChainIdentifiersFromBackground();
        }
      }
    );

    const disposal4 = addGlobalEventListener(
      "owallet_derivation_path_changed",
      async (params: any) => {
        await stores.keyRingStore.refreshKeyRingStatus();
        if (params?.chainId) {
          if (stores.accountStore.hasAccount(params.chainId)) {
            stores.accountStore.getAccount(params.chainId).init();
          }
        }
        if (
          params?.keyId &&
          stores.keyRingStore.selectedKeyInfo?.id === params.keyId
        ) {
          await stores.chainStore.updateEnabledChainIdentifiersFromBackground();
        }
      }
    );

    const disposal5 = addGlobalEventListener(
      "owallet_suggested_chain_added",
      async () => {
        await stores.keyRingStore.refreshKeyRingStatus();
        await stores.chainStore.updateChainInfosFromBackground();
        await stores.chainStore.updateEnabledChainIdentifiersFromBackground();
      }
    );

    const disposal6 = addGlobalEventListener(
      "owallet_suggested_chain_removed",
      async () => {
        await stores.keyRingStore.refreshKeyRingStatus();
        await stores.chainStore.updateChainInfosFromBackground();
        await stores.chainStore.updateEnabledChainIdentifiersFromBackground();
      }
    );

    const disposal7 = addGlobalEventListener(
      "owallet_keyring_locked",
      async () => {
        await stores.keyRingStore.refreshKeyRingStatus();
      }
    );

    return () => {
      disposal1();
      disposal2();
      disposal3();
      disposal4();
      disposal5();
      disposal6();
      disposal7();
    };
  }, [stores]);

  useEffect(() => {
    const disposal = autorun(() => {
      if (!stores.keyRingStore.isInitialized) {
        return;
      }

      if (!stores.uiConfigStore.isInitialized) {
        return;
      }

      const numPerTypes: Record<string, number> = {};
      for (const keyInfo of stores.keyRingStore.keyInfos) {
        let type = keyInfo.insensitive["keyRingType"] as string;
        if (type === "private-key") {
          const meta = keyInfo.insensitive["keyRingMeta"] as PlainObject;
          if (meta["web3Auth"] && (meta["web3Auth"] as any)["type"]) {
            type = "web3_auth_" + (meta["web3Auth"] as any)["type"];
          }
        }

        if (type) {
          type = "keyring_" + type + "_num";

          if (!numPerTypes[type]) {
            numPerTypes[type] = 0;
          }
          numPerTypes[type] += 1;
        }
      }

      let currentKeyRingType: string = "none";
      if (stores.keyRingStore.selectedKeyInfo) {
        currentKeyRingType = stores.keyRingStore.selectedKeyInfo.insensitive[
          "keyRingType"
        ] as string;
        if (currentKeyRingType === "private-key") {
          const meta = stores.keyRingStore.selectedKeyInfo.insensitive[
            "keyRingMeta"
          ] as PlainObject;
          if (meta["web3Auth"] && (meta["web3Auth"] as any)["type"]) {
            currentKeyRingType =
              "web3_auth_" + (meta["web3Auth"] as any)["type"];
          }
        }
      }

      stores.analyticsStore.setUserProperties({
        account_count: stores.keyRingStore.keyInfos.length,
        is_developer_mode: stores.uiConfigStore.isDeveloper,
        current_keyring_type: currentKeyRingType,
        ...numPerTypes,
      });
    });

    return () => {
      if (disposal) {
        disposal();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <storeContext.Provider value={stores}>{children}</storeContext.Provider>
  );
};

export const useStore = () => {
  const store = React.useContext(storeContext);
  if (!store) {
    throw new Error("You have forgot to use StoreProvider");
  }
  return store;
};

export { ChainStore } from "./chain";

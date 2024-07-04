import React, { FunctionComponent } from "react";
import ReactDOM from "react-dom";
import "./styles/global.scss";
import "react-sliding-pane/dist/react-sliding-pane.css";
import { HashRouter, Route } from "react-router-dom";
import { AccessPage, Secret20ViewingKeyAccessPage } from "./pages/access";
import { LockPage } from "./pages/lock";
import { HomePage } from "./pages/home/home-page";
import { ReceivePage } from "./pages/receive/receive-page";
import { isProdMode } from "./helpers/helper";
import { SelectAccountPage } from "./pages/account/select-account-page";
import { EditAccountPage } from "./pages/account/edit-account";
import { RevealRecoveryPhrasePage } from "./pages/account/reveal-recovery-phrase-page";
import { RevealPrivateKeyPage } from "./pages/account/reveal-private-key-page";
import { ConnectedDappPage } from "./pages/connected-dapp/connected-dapp-page";
import { AddTokenPage } from "./pages/add-token/add-token-page";
import { PreferencesPage } from "./pages/preferences/preferences-page";
import { ActivitiesPage } from "./pages/activities/activities-page";
import { ExplorePage } from "./pages/explore/explore-page";
import { RegisterPage } from "./pages/register";
import { ConfirmLedgerPage } from "./pages/register/ledger/confirm";
import {
  SendEvmPage,
  SendPage,
  SendTronEvmPage,
  SendBtcPage,
} from "./pages/send";
import { Banner } from "./components/banner";
import { ConfirmProvider } from "./components/confirm";
import { LoadingIndicatorProvider } from "./components/loading-indicator";
import {
  NotificationProvider,
  NotificationStoreProvider,
} from "./components/notification";
import { configure } from "mobx";
import { observer } from "mobx-react-lite";
import { KeyRingStatus } from "@owallet/background";
import Modal from "react-modal";
import { ChainSuggestedPage } from "./pages/chain/suggest";
import { LedgerGrantPage } from "./pages/ledger";
import { AddressBookPage } from "./pages/setting/address-book";
import { SignPage } from "./pages/sign";
import { StoreProvider, useStore } from "./stores";
import {
  AdditonalIntlMessages,
  AppIntlProvider,
  LanguageToFiatCurrency,
} from "@owallet/common";
import { Ethereum, OWallet, TronWeb, Bitcoin } from "@owallet/provider";
import { InExtensionMessageRequester } from "@owallet/router-extension";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import { IntlProvider } from "react-intl";
import { LogPageViewWrapper } from "./components/analytics";
import "./ledger";
import manifest from "./manifest.json";
import { SignTronPage } from "./pages/sign/sign-tron";
import { SignEvmPage } from "./pages/sign/sign-evm";
import { SignBtcPage } from "./pages/sign/sign-btc";
import { ErrorBoundary, useErrorBoundary } from "react-error-boundary";
import { Text } from "components/common/text";
import { Button } from "components/common/button";
import colors from "theme/colors";

const owallet = new OWallet(
  manifest.version,
  "core",
  new InExtensionMessageRequester()
);
// const oasis = new Oasis(
//   manifest.version,
//   "core",
//   ChainIdEnum.Oasis,
//   new InExtensionMessageRequester()
// );
const ethereum = new Ethereum(
  manifest.version,
  "core",
  "",
  new InExtensionMessageRequester()
);

const tronWeb = new TronWeb(
  manifest.version,
  "core",
  "0x2b6653dc",
  new InExtensionMessageRequester()
);

const bitcoin = new Bitcoin(
  manifest.version,
  "core",
  new InExtensionMessageRequester()
);

if (isProdMode) {
  Sentry.init({
    dsn: "https://4ce54db1095b48ab8688e701d7cc8301@o1323226.ingest.sentry.io/4504615445725184",
    integrations: [new BrowserTracing()],

    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0,
    environment: "production",
    ignoreErrors: [
      "Request rejected",
      "Failed to fetch",
      "Load failed",
      "User rejected the request",
    ],
  });
}

//@ts-ignore
// window.oasis = oasis;
//@ts-ignore
window.owallet = owallet;
//@ts-ignore
window.eth_owallet = ethereum;
//@ts-ignore
window.ethereum = ethereum;
//@ts-ignore
window.tronWeb = tronWeb;
//@ts-ignore
window.tronLink = tronWeb;
//@ts-ignore
window.tronWeb_owallet = tronWeb;
//@ts-ignore
window.tronLink_owallet = tronWeb;
//@ts-ignore
window.bitcoin = bitcoin;

// Make sure that icon file will be included in bundle
require("./public/assets/orai_wallet_logo.png");
require("./public/assets/icon/icon-16.png");
require("./public/assets/icon/icon-48.png");
require("./public/assets/icon/icon-128.png");

configure({
  enforceActions: "always", // Make mobx to strict mode.
});

Modal.setAppElement("#app");
Modal.defaultStyles = {
  content: {
    ...Modal.defaultStyles.content,
    minWidth: "300px",
    maxWidth: "600px",
    minHeight: "250px",
    maxHeight: "500px",
    left: "50%",
    right: "auto",
    top: "50%",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
  },
  overlay: {
    zIndex: 1000,
    ...Modal.defaultStyles.overlay,
  },
};

function ErrorFallback({ error }) {
  const { resetBoundary } = useErrorBoundary();

  return (
    <div
      style={{
        alignItems: "center",
        padding: 16,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <img
        style={{ width: 200 }}
        src={require("./public/assets/images/img_planet.png")}
      />
      <div style={{ padding: 16 }}>
        <Text size={24} weight="600">
          Something went wrong
        </Text>
      </div>
      <Text
        containerStyle={{ textAlign: "center" }}
        color={colors["error-text-action"]}
      >
        {error.message}
      </Text>
      <Button
        containerStyle={{ width: 140, marginTop: 16 }}
        onClick={resetBoundary}
      >
        Try again
      </Button>
    </div>
  );
}

const StateRenderer: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();
  if (
    keyRingStore.persistent ||
    keyRingStore.status === KeyRingStatus.UNLOCKED
  ) {
    return <HomePage />;
  } else if (keyRingStore.status === KeyRingStatus.LOCKED) {
    return <LockPage />;
  } else if (keyRingStore.status === KeyRingStatus.EMPTY) {
    browser.tabs.create({
      url: "/popup.html#/register",
    });
    window.close();
    return (
      <div style={{ height: "100%" }}>
        <Banner
          icon={require("./public/assets/orai_wallet_logo.png")}
          logo={require("./public/assets/logo.svg")}
          subtitle="Cosmos x EVM in one Wallet"
        />
      </div>
    );
  } else if (keyRingStore.status === KeyRingStatus.NOTLOADED) {
    return (
      <div style={{ height: "100%" }}>
        <Banner
          icon={require("./public/assets/orai_wallet_logo.png")}
          logo={require("./public/assets/logo.svg")}
          subtitle="Cosmos x EVM in one Wallet"
        />
      </div>
    );
  } else {
    return <div>Unknown status</div>;
  }
});

const AppIntlProviderWithStorage = ({ children }) => {
  const store = useStore();
  return (
    <AppIntlProvider
      additionalMessages={AdditonalIntlMessages}
      languageToFiatCurrency={LanguageToFiatCurrency}
      // language without region code
      defaultLocale={navigator.language.split(/[-_]/)[0]}
      storage={store.uiConfigStore.Storage}
    >
      {({ language, messages, automatic }) => (
        <IntlProvider
          locale={language}
          messages={messages}
          key={`${language}${automatic ? "-auto" : ""}`}
        >
          {children}
        </IntlProvider>
      )}
    </AppIntlProvider>
  );
};
const logError = (error: Error, info: { componentStack: string }) => {
  // Do something with the error, e.g. log to an external API
  console.log("error", error);
  console.log("info", info);
};

ReactDOM.render(
  <ErrorBoundary FallbackComponent={ErrorFallback} onError={logError}>
    <StoreProvider>
      <AppIntlProviderWithStorage>
        <LoadingIndicatorProvider>
          <NotificationStoreProvider>
            <NotificationProvider>
              <ConfirmProvider>
                <HashRouter>
                  <LogPageViewWrapper>
                    <Route exact path="/" component={StateRenderer} />
                    <Route exact path="/unlock" component={LockPage} />
                    <Route exact path="/access" component={AccessPage} />
                    <Route exact path="/receive" component={ReceivePage} />
                    <Route
                      exact
                      path="/activities"
                      component={ActivitiesPage}
                    />
                    <Route exact path="/explore" component={ExplorePage} />
                    <Route
                      exact
                      path="/preferences"
                      component={PreferencesPage}
                    />
                    <Route
                      exact
                      path="/reveal-recovery-phrase/:keystoreIndex"
                      component={RevealRecoveryPhrasePage}
                    />
                    <Route
                      exact
                      path="/reveal-private-key/:keystoreIndex"
                      component={RevealPrivateKeyPage}
                    />
                    <Route
                      exact
                      path="/select-account"
                      component={SelectAccountPage}
                    />
                    <Route exact path="/add-token" component={AddTokenPage} />
                    <Route
                      exact
                      path="/edit-account/:keystoreIndex"
                      component={EditAccountPage}
                    />
                    <Route
                      exact
                      path="/connected-dapp"
                      component={ConnectedDappPage}
                    />
                    <Route
                      exact
                      path="/access/viewing-key"
                      component={Secret20ViewingKeyAccessPage}
                    />
                    <Route exact path="/register" component={RegisterPage} />
                    <Route
                      exact
                      path="/confirm-ledger/:chain"
                      component={ConfirmLedgerPage}
                    />
                    <Route exact path="/send" component={SendPage} />
                    <Route exact path="/send-evm" component={SendEvmPage} />
                    <Route
                      exact
                      path="/send-tron"
                      component={SendTronEvmPage}
                    />
                    <Route exact path="/send-btc" component={SendBtcPage} />
                    <Route
                      exact
                      path="/ledger-grant"
                      component={LedgerGrantPage}
                    />
                    <Route
                      exact
                      path="/setting/address-book"
                      component={AddressBookPage}
                    />
                    <Route path="/sign" component={SignPage} />
                    <Route path="/sign-bitcoin" component={SignBtcPage} />
                    <Route path="/sign-ethereum" component={SignEvmPage} />
                    <Route path="/sign-tron" component={SignTronPage} />
                    <Route
                      path="/suggest-chain"
                      component={ChainSuggestedPage}
                    />
                  </LogPageViewWrapper>
                </HashRouter>
              </ConfirmProvider>
            </NotificationProvider>
          </NotificationStoreProvider>
        </LoadingIndicatorProvider>
      </AppIntlProviderWithStorage>
    </StoreProvider>
  </ErrorBoundary>,
  document.getElementById("app")
);

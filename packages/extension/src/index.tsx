import React, { FunctionComponent } from 'react';
import ReactDOM from 'react-dom';

import './styles/global.scss';

import { HashRouter, Route } from 'react-router-dom';

import { AccessPage, Secret20ViewingKeyAccessPage } from './pages/access';
import { IBCTransferPage } from './pages/ibc-transfer';
import { LockPage } from './pages/lock';
import { MainPage } from './pages/main';
import { RegisterPage } from './pages/register';
import { ConfirmLedgerPage } from './pages/register/ledger/confirm';
import { SendPage } from './pages/send';
import { SendTronEvmPage } from './pages/send-tron';
import { SetKeyRingPage } from './pages/setting/keyring';

import { Banner } from './components/banner';

import { ConfirmProvider } from './components/confirm';
import { LoadingIndicatorProvider } from './components/loading-indicator';
import { NotificationProvider, NotificationStoreProvider } from './components/notification';

import { configure } from 'mobx';
import { observer } from 'mobx-react-lite';

import { KeyRingStatus } from '@owallet/background';
import Modal from 'react-modal';
import { ChainSuggestedPage } from './pages/chain/suggest';
import { LedgerGrantPage } from './pages/ledger';
import { SettingPage } from './pages/setting';
import { AddressBookPage } from './pages/setting/address-book';
import { ClearPage } from './pages/setting/clear';
import { SettingConnectionsPage, SettingSecret20ViewingKeyConnectionsPage } from './pages/setting/connections';
import { CreditPage } from './pages/setting/credit';
import { ExportPage } from './pages/setting/export';
import { SettingFiatPage } from './pages/setting/fiat';
import { ChangeNamePage } from './pages/setting/keyring/change';
import { SettingLanguagePage } from './pages/setting/language';
import { AddEvmTokenPage } from './pages/setting/token-evm/add';
import { AddTokenPage } from './pages/setting/token/add';
import { ManageTokenPage } from './pages/setting/token/manage';
import { SignPage } from './pages/sign';
import { StoreProvider, useStore } from './stores';

import { NftDetailsPage } from './pages/nft/nft-details';

// import * as BackgroundTxResult from "../../background/tx/foreground";
import { AdditonalIntlMessages, AppIntlProvider, ChainIdEnum, LanguageToFiatCurrency } from '@owallet/common';

import { Ethereum, OWallet, TronWeb, Bitcoin, Oasis } from '@owallet/provider';
import { InExtensionMessageRequester } from '@owallet/router-extension';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { IntlProvider } from 'react-intl';
import { LogPageViewWrapper } from './components/analytics';
import './ledger';
import manifest from './manifest.json';
import { Menu } from './pages/main/menu';
import { SendEvmPage } from './pages/send-evm';
import { ExportToMobilePage } from './pages/setting/export-to-mobile';
import { SignEthereumPage } from './pages/sign/sign-ethereum';
import { SignTronPage } from './pages/sign/sign-tron';
import { SignBtcPage } from './pages/sign/sign-btc';
import { ValidatorListPage } from './pages/stake/validator-list';
import { TokenPage } from './pages/token';
import { SendBtcPage } from './pages/send-btc';

const owallet = new OWallet(manifest.version, 'core', new InExtensionMessageRequester());
const oasis = new Oasis(manifest.version, 'core', ChainIdEnum.Oasis, new InExtensionMessageRequester());
const ethereum = new Ethereum(manifest.version, 'core', '', new InExtensionMessageRequester());

const tronWeb = new TronWeb(manifest.version, 'core', '0x2b6653dc', new InExtensionMessageRequester());

const bitcoin = new Bitcoin(manifest.version, 'core', new InExtensionMessageRequester());

Sentry.init({
  dsn: 'https://4ce54db1095b48ab8688e701d7cc8301@o1323226.ingest.sentry.io/4504615445725184',
  integrations: [new BrowserTracing()],

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
  environment: 'production',
  ignoreErrors: ['Request rejected', 'Failed to fetch', 'Load failed', 'User rejected the request']
});
//@ts-ignore
window.oasis = oasis;
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
require('./public/assets/orai_wallet_logo.png');
require('./public/assets/icon/icon-16.png');
require('./public/assets/icon/icon-48.png');
require('./public/assets/icon/icon-128.png');
// require('./public/assets/icon/icon-orai-16.png');
// require('./public/assets/icon/icon-orai-48.png');
// require('./public/assets/icon/icon-orai-128.png');

configure({
  enforceActions: 'always' // Make mobx to strict mode.
});

Modal.setAppElement('#app');
Modal.defaultStyles = {
  content: {
    ...Modal.defaultStyles.content,
    minWidth: '300px',
    maxWidth: '600px',
    minHeight: '250px',
    maxHeight: '500px',
    left: '50%',
    right: 'auto',
    top: '50%',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)'
  },
  overlay: {
    zIndex: 1000,
    ...Modal.defaultStyles.overlay
  }
};

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   authDomain: 'owallet-829a1.firebaseapp.com',
//   projectId: 'owallet-829a1',
//   storageBucket: 'owallet-829a1.appspot.com',
//   messagingSenderId: process.env.SENDER_ID,
//   appId: '1:570000248707:web:212fb3f889fb816eb7f0b6',
//   apiKey: process.env.API_KEY,
//   measurementId: process.env.MEASUREMENT_ID
// };

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const StateRenderer: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();
  if (keyRingStore.persistent || keyRingStore.status === KeyRingStatus.UNLOCKED) {
    return <MainPage />;
  } else if (keyRingStore.status === KeyRingStatus.LOCKED) {
    return <LockPage />;
  } else if (keyRingStore.status === KeyRingStatus.EMPTY) {
    browser.tabs.create({
      url: '/popup.html#/register'
    });
    window.close();
    return (
      <div style={{ height: '100%' }}>
        <Banner
          icon={require('./public/assets/orai_wallet_logo.png')}
          logo={require('./public/assets/logo.svg')}
          subtitle="Cosmos x EVM in one Wallet"
        />
      </div>
    );
  } else if (keyRingStore.status === KeyRingStatus.NOTLOADED) {
    return (
      <div style={{ height: '100%' }}>
        <Banner
          icon={require('./public/assets/orai_wallet_logo.png')}
          logo={require('./public/assets/logo.svg')}
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
        <IntlProvider locale={language} messages={messages} key={`${language}${automatic ? '-auto' : ''}`}>
          {children}
        </IntlProvider>
      )}
    </AppIntlProvider>
  );
};

ReactDOM.render(
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
                  <Route exact path="/token" component={TokenPage} />
                  <Route exact path="/token/:nftId" component={NftDetailsPage} />
                  <Route exact path="/menu" component={Menu} />
                  <Route exact path="/access/viewing-key" component={Secret20ViewingKeyAccessPage} />
                  <Route exact path="/register" component={RegisterPage} />
                  <Route exact path="/confirm-ledger/:chain" component={ConfirmLedgerPage} />
                  <Route exact path="/send" component={SendPage} />
                  <Route exact path="/send-evm" component={SendEvmPage} />
                  <Route exact path="/send-tron" component={SendTronEvmPage} />
                  <Route exact path="/send-btc" component={SendBtcPage} />
                  <Route exact path="/ibc-transfer" component={IBCTransferPage} />
                  <Route exact path="/setting" component={SettingPage} />
                  <Route exact path="/ledger-grant" component={LedgerGrantPage} />
                  <Route exact path="/setting/language" component={SettingLanguagePage} />
                  <Route exact path="/setting/fiat" component={SettingFiatPage} />
                  <Route exact path="/setting/connections" component={SettingConnectionsPage} />
                  <Route
                    exact
                    path="/setting/connections/viewing-key/:contractAddress"
                    component={SettingSecret20ViewingKeyConnectionsPage}
                  />
                  <Route exact path="/setting/address-book" component={AddressBookPage} />
                  <Route exact path="/setting/export-to-mobile" component={ExportToMobilePage} />
                  <Route exact path="/setting/credit" component={CreditPage} />
                  <Route exact path="/setting/set-keyring" component={SetKeyRingPage} />
                  <Route exact path="/setting/export/:index" component={ExportPage} />
                  <Route exact path="/setting/clear/:index" component={ClearPage} />
                  <Route exact path="/setting/keyring/change/name/:index" component={ChangeNamePage} />
                  <Route exact path="/setting/token/add" component={AddTokenPage} />
                  <Route exact path="/setting/token-evm/add" component={AddEvmTokenPage} />
                  <Route exact path="/setting/token/manage" component={ManageTokenPage} />
                  <Route exact path="/stake/validator-list" component={ValidatorListPage} />
                  <Route path="/sign" component={SignPage} />
                  <Route path="/sign-bitcoin" component={SignBtcPage} />
                  <Route path="/sign-ethereum" component={SignEthereumPage} />
                  <Route path="/sign-tron" component={SignTronPage} />
                  <Route path="/suggest-chain" component={ChainSuggestedPage} />
                </LogPageViewWrapper>
              </HashRouter>
            </ConfirmProvider>
          </NotificationProvider>
        </NotificationStoreProvider>
      </LoadingIndicatorProvider>
    </AppIntlProviderWithStorage>
  </StoreProvider>,
  document.getElementById('app')
);

import React from "react";
import { Route } from "react-router-dom";
import { AccessPage, Secret20ViewingKeyAccessPage } from "../pages/access";
import { LockPage } from "../pages/lock";
import { ReceivePage } from "../pages/receive/receive-page";
import { SelectAccountPage } from "../pages/account/select-account-page";
import { EditAccountPage } from "../pages/account/edit-account";
import { RevealRecoveryPhrasePage } from "../pages/account/reveal-recovery-phrase-page";
import { RevealPrivateKeyPage } from "../pages/account/reveal-private-key-page";
import { ConnectedDappPage } from "../pages/connected-dapp/connected-dapp-page";
import { AddTokenPage } from "../pages/add-token/add-token-page";
import { PreferencesPage } from "../pages/preferences/preferences-page";
import { ActivitiesPage } from "../pages/activities/activities-page";
import { ExplorePage } from "../pages/explore/explore-page";
import { RegisterPage } from "../pages/register";
import { ConfirmLedgerPage } from "../pages/register/ledger/confirm";
import {
  SendEvmPage,
  SendPage,
  SendTronEvmPage,
  SendBtcPage,
} from "../pages/send";
import { ChainSuggestedPage } from "../pages/chain/suggest";
import { LedgerGrantPage } from "../pages/ledger";
import { AddressBookPage } from "../pages/setting/address-book";
import { SignPage } from "../pages/sign";
import { SignTronPage } from "../pages/sign/sign-tron";
import { SignEvmPage } from "../pages/sign/sign-evm";
import { SignBtcPage } from "../pages/sign/sign-btc";
import { StateRenderer } from "../components/state-renderer/StateRenderer";
import { ManageChainsPage } from "pages/chain/manage-chains/manage-chains-page";
import { AddChainPage } from "pages/chain/add-chain/add-chain-page";

export const Routes: React.FC = () => (
  <>
    <Route exact path="/" component={StateRenderer} />
    <Route exact path="/unlock" component={LockPage} />
    <Route exact path="/permission" component={AccessPage} />
    <Route exact path="/receive" component={ReceivePage} />
    <Route exact path="/activities" component={ActivitiesPage} />
    <Route exact path="/explore" component={ExplorePage} />
    <Route exact path="/preferences" component={PreferencesPage} />
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
    <Route exact path="/select-account" component={SelectAccountPage} />
    <Route exact path="/add-token" component={AddTokenPage} />
    <Route
      exact
      path="/edit-account/:keystoreIndex"
      component={EditAccountPage}
    />
    <Route exact path="/connected-dapp" component={ConnectedDappPage} />
    <Route
      exact
      path="/permission/viewing-key"
      component={Secret20ViewingKeyAccessPage}
    />
    <Route exact path="/register" component={RegisterPage} />
    <Route exact path="/confirm-ledger/:chain" component={ConfirmLedgerPage} />
    <Route exact path="/send" component={SendPage} />
    <Route exact path="/send-evm" component={SendEvmPage} />
    <Route exact path="/send-tron" component={SendTronEvmPage} />
    <Route exact path="/send-btc" component={SendBtcPage} />
    <Route exact path="/ledger-grant" component={LedgerGrantPage} />
    <Route exact path="/setting/address-book" component={AddressBookPage} />
    <Route path="/sign" component={SignPage} />
    <Route path="/sign-bitcoin" component={SignBtcPage} />
    <Route path="/sign-ethereum" component={SignEvmPage} />
    <Route path="/sign-tron" component={SignTronPage} />
    <Route path="/suggest-chain" component={ChainSuggestedPage} />
    <Route path="/manage-chains" component={ManageChainsPage} />
    <Route path="/add-chain" component={AddChainPage} />
  </>
);

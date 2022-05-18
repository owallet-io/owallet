import { WEBPAGE_PORT } from '@owallet-wallet/router';
import {
  ContentScriptEnv,
  ContentScriptGuards,
  ExtensionRouter,
  InExtensionMessageRequester
} from '@owallet-wallet/router-extension';
import { OWallet, InjectedOWallet } from '@owallet-wallet/provider';
import { initEvents } from './events';

import manifest from '../manifest.json';

InjectedOWallet.startProxy(
  new OWallet(manifest.version, 'core', new InExtensionMessageRequester())
);

const router = new ExtensionRouter(ContentScriptEnv.produceEnv);
router.addGuard(ContentScriptGuards.checkMessageIsInternal);
initEvents(router);
router.listen(WEBPAGE_PORT);

const container = document.head || document.documentElement;
const scriptElement = document.createElement('script');

scriptElement.src = browser.runtime.getURL('injectedScript.bundle.js');
scriptElement.type = 'text/javascript';
container.insertBefore(scriptElement, container.children[0]);
scriptElement.remove();

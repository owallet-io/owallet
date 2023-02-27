import { WEBPAGE_PORT } from '@owallet/router';
import {
  ContentScriptEnv,
  ContentScriptGuards,
  ExtensionRouter,
  InExtensionMessageRequester
} from '@owallet/router-extension';
import { OWallet, InjectedOWallet, Ethereum, InjectedEthereum, InjectedEthereumOWallet } from '@owallet/provider';
import { initEvents } from './events';

import manifest from '../manifest.json';

// keep service_worker alive at content_script injected
function keepAlive() {
  const port = chrome.runtime.connect({ name: 'keepAlive' });
  port.onDisconnect.addListener(keepAlive);
  port.onMessage.addListener((msg) => {
    console.log('received', msg, 'from bg');
  });
}
keepAlive();

InjectedOWallet.startProxy(
  new OWallet(manifest.version, 'core', new InExtensionMessageRequester())
);

InjectedEthereum.startProxy(
  new Ethereum(manifest.version, 'core', "0x38", new InExtensionMessageRequester())
);

InjectedEthereumOWallet.startProxy(
  new Ethereum(manifest.version, 'core', "0x38", new InExtensionMessageRequester())
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

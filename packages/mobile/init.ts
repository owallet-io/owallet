import './src/background/background';

import { version } from './package.json';
import { Ethereum, OWallet, TronWeb } from '@owallet/provider';
import { RNMessageRequesterInternal } from './src/router';
import { ETH_ID, TRON_ID } from '@owallet/common';

//@ts-ignore
window.owallet = new OWallet(version, 'core', new RNMessageRequesterInternal());
//@ts-ignore
window.ethereum = new Ethereum(version, 'core', ETH_ID, new RNMessageRequesterInternal());
//@ts-ignore
window.tronWeb = new TronWeb(version, 'core', TRON_ID, new RNMessageRequesterInternal());

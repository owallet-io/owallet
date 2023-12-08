import './src/background/background';

import { version, name } from './package.json';
import { OWallet, Ethereum, TronWeb } from '@owallet/provider';
import { RNMessageRequesterInternal } from './src/router';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.owallet = new OWallet(`${name}-${version}`, new RNMessageRequesterInternal());
//@ts-ignore
window.ethereum = new Ethereum(version, 'core', ETH_ID, new RNMessageRequesterInternal());
//@ts-ignore
window.tronWeb = new TronWeb(version, 'core', TRON_ID, new RNMessageRequesterInternal());

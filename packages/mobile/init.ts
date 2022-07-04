import './src/background/background';

import { version } from './package.json';
import { OWallet } from '@owallet/provider';
import { RNMessageRequesterInternal } from './src/router';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.owallet = new OWallet(version, new RNMessageRequesterInternal());

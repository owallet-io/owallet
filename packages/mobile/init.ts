import './src/background/background';

import { OWallet } from '@owallet-wallet/provider';
import { RNMessageRequesterInternal } from './src/router';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.owallet = new OWallet('', new RNMessageRequesterInternal());

import './src/background/background';

import { version } from './package.json';
import { Ethereum, Oasis, OWallet, TronWeb } from '@owallet/provider';
import { RNMessageRequesterInternal } from './src/router';
import { ChainIdEnum } from '@owallet/common';

//@ts-ignore
window.owallet = new OWallet(version, 'core', new RNMessageRequesterInternal());
//@ts-ignore
window.oasis = new Oasis(version, 'core', ChainIdEnum.Oasis, new RNMessageRequesterInternal());
//@ts-ignore
window.ethereum = new Ethereum(version, 'core', ChainIdEnum.Ethereum, new RNMessageRequesterInternal());
//@ts-ignore
window.tronWeb = new TronWeb(version, 'core', ChainIdEnum.TRON, new RNMessageRequesterInternal());

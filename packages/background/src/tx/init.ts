import { Router } from '@owallet/router';
import { SendTxEthereumMsg, SendTxMsg } from './messages';
import { ROUTE } from './constants';
import { getHandler } from './handler';
import { BackgroundTxService } from './service';

export function init(router: Router, service: BackgroundTxService): void {
  router.registerMessage(SendTxMsg);
  router.registerMessage(SendTxEthereumMsg);

  router.addHandler(ROUTE, getHandler(service));
}

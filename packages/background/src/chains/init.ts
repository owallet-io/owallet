import { Router } from '@owallet/router';
import {
  GetChainInfosMsg,
  SuggestChainInfoMsg,
  RemoveSuggestedChainInfoMsg,
  GetChainInfosWithoutEndpointsMsg
} from './messages';
import { ROUTE } from './constants';
import { getHandler } from './handler';
import { ChainsService } from './service';

export function init(router: Router, service: ChainsService): void {
  router.registerMessage(GetChainInfosMsg);
  router.registerMessage(SuggestChainInfoMsg);
  router.registerMessage(RemoveSuggestedChainInfoMsg);
  router.registerMessage(GetChainInfosWithoutEndpointsMsg);

  router.addHandler(ROUTE, getHandler(service));
}

import { Router } from '@owallet/router';
import { KeyRingTronService } from './service';
import {
  GetTronKeyMsg,
  GetTronKeysSettledMsg,
  RequestGetTronAddressMsg,
  RequestSendRawTransactionMsg,
  RequestSignTronMsg,
  RequestTriggerSmartContractMsg
} from './messages';
import { ROUTE } from './constants';
import { getHandler } from './handler';
import { PermissionInteractiveService } from '../permission-interactive';

export function init(
  router: Router,
  service: KeyRingTronService,
  permissionInteractionService: PermissionInteractiveService
): void {
  router.registerMessage(GetTronKeyMsg);
  router.registerMessage(GetTronKeysSettledMsg);
  router.registerMessage(RequestSignTronMsg);
  router.registerMessage(RequestTriggerSmartContractMsg);
  router.registerMessage(RequestSendRawTransactionMsg);
  router.registerMessage(RequestGetTronAddressMsg);
  router.addHandler(ROUTE, getHandler(service, permissionInteractionService));
}

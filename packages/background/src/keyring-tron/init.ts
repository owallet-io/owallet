import { Router } from '@owallet/router';
import { KeyRingTronService } from './service';
import { GetTronKeyMsg, GetTronKeysSettledMsg, RequestSignTronMsg } from './messages';
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

  router.addHandler(ROUTE, getHandler(service, permissionInteractionService));
}

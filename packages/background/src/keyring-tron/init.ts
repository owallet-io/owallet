import { Router } from "@owallet/router";
import { KeyRingTronService } from "./service";
import { GetTronKeyMsg, GetTronKeysSettledMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { PermissionInteractiveService } from "../permission-interactive";

export function init(
  router: Router,
  service: KeyRingTronService,
  permissionInteractionService: PermissionInteractiveService
): void {
  router.registerMessage(GetTronKeyMsg);
  router.registerMessage(GetTronKeysSettledMsg);

  router.addHandler(ROUTE, getHandler(service, permissionInteractionService));
}

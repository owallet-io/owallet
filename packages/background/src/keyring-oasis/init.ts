import { Router } from "@owallet/router";
import { KeyRingOasisService } from "./service";
import { GetOasisKeyMsg, GetOasisKeysSettledMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { PermissionInteractiveService } from "../permission-interactive";

export function init(
  router: Router,
  service: KeyRingOasisService,
  permissionInteractionService: PermissionInteractiveService
): void {
  router.registerMessage(GetOasisKeyMsg);
  router.registerMessage(GetOasisKeysSettledMsg);

  router.addHandler(ROUTE, getHandler(service, permissionInteractionService));
}

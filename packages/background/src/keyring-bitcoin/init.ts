import { Router } from "@owallet/router";
import { KeyRingBtcService } from "./service";
import { GetBtcKeyMsg, GetBtcKeysSettledMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { PermissionInteractiveService } from "../permission-interactive";

export function init(
  router: Router,
  service: KeyRingBtcService,
  permissionInteractionService: PermissionInteractiveService
): void {
  router.registerMessage(GetBtcKeyMsg);
  router.registerMessage(GetBtcKeysSettledMsg);

  router.addHandler(ROUTE, getHandler(service, permissionInteractionService));
}
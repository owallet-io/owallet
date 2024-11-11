import { Router } from "@owallet/router";
import { KeyRingBtcService } from "./service";
import {
  GetBtcKeyMsg,
  GetBtcKeysSettledMsg,
  RequestSignBtcMsg,
} from "./messages";
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
  router.registerMessage(RequestSignBtcMsg);

  router.addHandler(ROUTE, getHandler(service, permissionInteractionService));
}

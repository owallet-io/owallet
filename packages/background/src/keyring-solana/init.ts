import { Router } from "@owallet/router";
import { KeyRingSvmService } from "./service";
import {
  GetSvmKeyMsg,
  GetSvmKeysSettledMsg,
  // RequestSignSvmMsg,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { PermissionInteractiveService } from "../permission-interactive";

export function init(
  router: Router,
  service: KeyRingSvmService,
  permissionInteractionService: PermissionInteractiveService
): void {
  router.registerMessage(GetSvmKeyMsg);
  router.registerMessage(GetSvmKeysSettledMsg);
  // router.registerMessage(RequestSignSvmMsg);

  router.addHandler(ROUTE, getHandler(service, permissionInteractionService));
}

import { Router } from "@owallet/router";
import { SendTxOasisMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { BackgroundTxOasisService } from "./service";
import { PermissionInteractiveService } from "../permission-interactive";

export function init(
  router: Router,
  service: BackgroundTxOasisService,
  permissionInteractionService: PermissionInteractiveService
): void {
  router.registerMessage(SendTxOasisMsg);

  router.addHandler(ROUTE, getHandler(service, permissionInteractionService));
}

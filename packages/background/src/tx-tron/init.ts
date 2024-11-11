import { Router } from "@owallet/router";
import { SendTxTronMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { BackgroundTxTronService } from "./service";
import { PermissionInteractiveService } from "../permission-interactive";

export function init(
  router: Router,
  service: BackgroundTxTronService,
  permissionInteractionService: PermissionInteractiveService
): void {
  router.registerMessage(SendTxTronMsg);

  router.addHandler(ROUTE, getHandler(service, permissionInteractionService));
}

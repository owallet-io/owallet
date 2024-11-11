import { Router } from "@owallet/router";
import { SendTxBtcMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { BackgroundTxBtcService } from "./service";
import { PermissionInteractiveService } from "../permission-interactive";

export function init(
  router: Router,
  service: BackgroundTxBtcService,
  permissionInteractionService: PermissionInteractiveService
): void {
  router.registerMessage(SendTxBtcMsg);

  router.addHandler(ROUTE, getHandler(service, permissionInteractionService));
}

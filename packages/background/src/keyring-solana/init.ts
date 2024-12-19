import { Router } from "@owallet/router";
import { KeyRingSvmService } from "./service";
import {
  ConnectSvmMsg,
  GetSvmKeyMsg,
  GetSvmKeysSettledMsg,
  RequestSignAllTransactionSvm,
  RequestSignInSvm,
  RequestSignMessageSvm,
  RequestSignTransactionSvm,
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
  router.registerMessage(ConnectSvmMsg);
  router.registerMessage(GetSvmKeysSettledMsg);
  router.registerMessage(RequestSignAllTransactionSvm);
  router.registerMessage(RequestSignInSvm);
  router.registerMessage(RequestSignTransactionSvm);
  router.registerMessage(RequestSignMessageSvm);
  // router.registerMessage(RequestSignSvmMsg);

  router.addHandler(ROUTE, getHandler(service, permissionInteractionService));
}

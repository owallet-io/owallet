import { Router } from "@owallet/router";
import {
  GetPubkeyMsg,
  GetTxEncryptionKeyMsg,
  ReqeustEncryptMsg,
  RequestDecryptMsg,
} from "./messages";
import { SecretWasmService } from "./service";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { PermissionInteractiveService } from "../permission-interactive";

export function init(
  router: Router,
  service: SecretWasmService,
  permissionInteractionService: PermissionInteractiveService
): void {
  router.registerMessage(GetPubkeyMsg);
  router.registerMessage(ReqeustEncryptMsg);
  router.registerMessage(RequestDecryptMsg);
  router.registerMessage(GetTxEncryptionKeyMsg);

  router.addHandler(ROUTE, getHandler(service, permissionInteractionService));
}

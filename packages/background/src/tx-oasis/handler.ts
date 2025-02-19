import {
  Env,
  Handler,
  InternalHandler,
  OWalletError,
  Message,
} from "@owallet/router";
import { SendTxOasisMsg } from "./messages";
import { BackgroundTxOasisService } from "./service";
import { PermissionInteractiveService } from "../permission-interactive";

export const getHandler: (
  service: BackgroundTxOasisService,
  permissionInteractionService: PermissionInteractiveService
) => Handler = (
  service: BackgroundTxOasisService,
  permissionInteractionService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case SendTxOasisMsg:
        return handleSendTxOasisMsg(service, permissionInteractionService)(
          env,
          msg as SendTxOasisMsg
        );
      default:
        throw new OWalletError("tx", 110, "Unknown msg type");
    }
  };
};

const handleSendTxOasisMsg: (
  service: BackgroundTxOasisService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<SendTxOasisMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(
      env,
      [msg.chainId],
      msg.origin
    );

    return await service.sendOasisTx(msg.chainId, msg.signedTx, {
      silent: msg.silent,
    });
  };
};

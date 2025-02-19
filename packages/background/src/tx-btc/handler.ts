import {
  Env,
  Handler,
  InternalHandler,
  OWalletError,
  Message,
} from "@owallet/router";
import { SendTxBtcMsg } from "./messages";
import { BackgroundTxBtcService } from "./service";
import { PermissionInteractiveService } from "../permission-interactive";

export const getHandler: (
  service: BackgroundTxBtcService,
  permissionInteractionService: PermissionInteractiveService
) => Handler = (
  service: BackgroundTxBtcService,
  permissionInteractionService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case SendTxBtcMsg:
        return handleSendTxBtcMsg(service, permissionInteractionService)(
          env,
          msg as SendTxBtcMsg
        );
      default:
        throw new OWalletError("tx", 110, "Unknown msg type");
    }
  };
};

const handleSendTxBtcMsg: (
  service: BackgroundTxBtcService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<SendTxBtcMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(
      env,
      [msg.chainId],
      msg.origin
    );

    return await service.sendBtcTx(msg.chainId, msg.signedTx, {
      silent: msg.silent,
    });
  };
};

import {
  Env,
  Handler,
  InternalHandler,
  OWalletError,
  Message,
} from "@owallet/router";
import { SendTxEthereumMsg } from "./messages";
import { BackgroundTxEthereumService } from "./service";
import { PermissionInteractiveService } from "../permission-interactive";

export const getHandler: (
  service: BackgroundTxEthereumService,
  permissionInteractionService: PermissionInteractiveService
) => Handler = (
  service: BackgroundTxEthereumService,
  permissionInteractionService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case SendTxEthereumMsg:
        return handleSendTxEthereumMsg(service, permissionInteractionService)(
          env,
          msg as SendTxEthereumMsg
        );
      default:
        throw new OWalletError("tx", 110, "Unknown msg type");
    }
  };
};

const handleSendTxEthereumMsg: (
  service: BackgroundTxEthereumService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<SendTxEthereumMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(
      env,
      [msg.chainId],
      msg.origin
    );

    return await service.sendEthereumTx(msg.origin, msg.chainId, msg.tx, {
      silent: msg.silent,
    });
  };
};

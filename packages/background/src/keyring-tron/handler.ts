import {
  Env,
  Handler,
  InternalHandler,
  OWalletError,
  Message,
} from "@owallet/router";
import { GetTronKeyMsg, GetTronKeysSettledMsg } from "./messages";
import { KeyRingTronService } from "./service";
import { PermissionInteractiveService } from "../permission-interactive";

export const getHandler: (
  service: KeyRingTronService,
  permissionInteractionService: PermissionInteractiveService
) => Handler = (service: KeyRingTronService, permissionInteractionService) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetTronKeyMsg:
        return handleGetTronKeyMsg(service, permissionInteractionService)(
          env,
          msg as GetTronKeyMsg
        );
      case GetTronKeysSettledMsg:
        return handleGetTronKeysSettledMsg(
          service,
          permissionInteractionService
        )(env, msg as GetTronKeysSettledMsg);

      default:
        throw new OWalletError("keyring", 221, "Unknown msg type");
    }
  };
};

const handleGetTronKeyMsg: (
  service: KeyRingTronService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<GetTronKeyMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(
      env,
      [msg.chainId],
      msg.origin
    );

    return await service.getKeySelected(msg.chainId);
  };
};

const handleGetTronKeysSettledMsg: (
  service: KeyRingTronService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<GetTronKeysSettledMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(
      env,
      msg.chainIds,
      msg.origin
    );

    return await Promise.allSettled(
      msg.chainIds.map((chainId) => service.getKeySelected(chainId))
    );
  };
};

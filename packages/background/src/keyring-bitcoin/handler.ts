import {
  Env,
  Handler,
  InternalHandler,
  OWalletError,
  Message,
} from "@owallet/router";
import { GetBtcKeyMsg, GetBtcKeysSettledMsg } from "./messages";
import { KeyRingBtcService } from "./service";
import { PermissionInteractiveService } from "../permission-interactive";

export const getHandler: (
  service: KeyRingBtcService,
  permissionInteractionService: PermissionInteractiveService
) => Handler = (service: KeyRingBtcService, permissionInteractionService) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetBtcKeyMsg:
        return handleGetBtcKeyMsg(service, permissionInteractionService)(
          env,
          msg as GetBtcKeyMsg
        );
      case GetBtcKeysSettledMsg:
        return handleGetBtcKeysSettledMsg(
          service,
          permissionInteractionService
        )(env, msg as GetBtcKeysSettledMsg);

      default:
        throw new OWalletError("keyring", 221, "Unknown msg type");
    }
  };
};

const handleGetBtcKeyMsg: (
  service: KeyRingBtcService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<GetBtcKeyMsg> = (
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

const handleGetBtcKeysSettledMsg: (
  service: KeyRingBtcService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<GetBtcKeysSettledMsg> = (
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

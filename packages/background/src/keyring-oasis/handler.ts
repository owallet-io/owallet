import {
  Env,
  Handler,
  InternalHandler,
  OWalletError,
  Message,
} from "@owallet/router";
import { GetOasisKeyMsg, GetOasisKeysSettledMsg } from "./messages";
import { KeyRingOasisService } from "./service";
import { PermissionInteractiveService } from "../permission-interactive";

export const getHandler: (
  service: KeyRingOasisService,
  permissionInteractionService: PermissionInteractiveService
) => Handler = (service: KeyRingOasisService, permissionInteractionService) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetOasisKeyMsg:
        return handleGetOasisKeyMsg(service, permissionInteractionService)(
          env,
          msg as GetOasisKeyMsg
        );
      case GetOasisKeysSettledMsg:
        return handleGetOasisKeysSettledMsg(
          service,
          permissionInteractionService
        )(env, msg as GetOasisKeysSettledMsg);

      default:
        throw new OWalletError("keyring", 221, "Unknown msg type");
    }
  };
};

const handleGetOasisKeyMsg: (
  service: KeyRingOasisService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<GetOasisKeyMsg> = (
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

const handleGetOasisKeysSettledMsg: (
  service: KeyRingOasisService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<GetOasisKeysSettledMsg> = (
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

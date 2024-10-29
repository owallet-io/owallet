import {
  Env,
  Handler,
  InternalHandler,
  OWalletError,
  Message,
} from "@owallet/router";
import {
  GetOasisKeyMsg,
  GetOasisKeysSettledMsg,
  RequestSignOasisMsg,
} from "./messages";
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
      case RequestSignOasisMsg:
        return handleRequestSignOasisMsg(service, permissionInteractionService)(
          env,
          msg as RequestSignOasisMsg
        );

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
const handleRequestSignOasisMsg: (
  service: KeyRingOasisService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestSignOasisMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(
      env,
      [msg.chainId],
      msg.origin
    );

    return (
      await service.signOasisSelected(
        env,
        msg.origin,
        msg.chainId,
        msg.signer,
        msg.message,
        msg.signType
      )
    ).signature;
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

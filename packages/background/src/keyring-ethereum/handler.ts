import {
  Env,
  Handler,
  InternalHandler,
  OWalletError,
  Message,
} from "@owallet/router";
import { RequestSignEthereumMsg, RequestJsonRpcToEvmMsg } from "./messages";
import { KeyRingEthereumService } from "./service";
import { PermissionInteractiveService } from "../permission-interactive";

export const getHandler: (
  service: KeyRingEthereumService,
  permissionInteractionService: PermissionInteractiveService
) => Handler = (
  service: KeyRingEthereumService,
  permissionInteractionService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case RequestSignEthereumMsg:
        return handleRequestSignEthereumMsg(
          service,
          permissionInteractionService
        )(env, msg as RequestSignEthereumMsg);
      case RequestJsonRpcToEvmMsg:
        return handleRequestJsonRpcToEvmMsg(
          service,
          permissionInteractionService
        )(env, msg as RequestJsonRpcToEvmMsg);
      default:
        throw new OWalletError("keyring", 221, "Unknown msg type");
    }
  };
};

const handleRequestSignEthereumMsg: (
  service: KeyRingEthereumService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestSignEthereumMsg> = (
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
      await service.signEthereumSelected(
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

const handleRequestJsonRpcToEvmMsg: (
  service: KeyRingEthereumService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestJsonRpcToEvmMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    if (msg.method !== "owallet_initProviderState") {
      await permissionInteractionService.ensureEnabledForEVM(env, msg.origin);
    }

    return await service.request(
      env,
      msg.origin,
      msg.method,
      msg.params,
      msg.providerId,
      msg.chainId
    );
  };
};

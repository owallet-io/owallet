import {
  Env,
  Handler,
  InternalHandler,
  OWalletError,
  Message,
} from "@owallet/router";
import {
  GetSvmKeysSettledMsg,
  GetSvmKeyMsg,
  // RequestSignBtcMsg,
} from "./messages";
import { KeyRingSvmService } from "./service";
import { PermissionInteractiveService } from "../permission-interactive";

export const getHandler: (
  service: KeyRingSvmService,
  permissionInteractionService: PermissionInteractiveService
) => Handler = (service: KeyRingSvmService, permissionInteractionService) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetSvmKeyMsg:
        return handleGetSvmKeyMsg(service, permissionInteractionService)(
          env,
          msg as GetSvmKeyMsg
        );
      case GetSvmKeysSettledMsg:
        return handleGetSvmKeysSettledMsg(
          service,
          permissionInteractionService
        )(env, msg as GetSvmKeysSettledMsg);
      // case RequestSignBtcMsg:
      //   return handleRequestSignBtcMsg(service, permissionInteractionService)(
      //     env,
      //     msg as RequestSignBtcMsg
      //   );

      default:
        throw new OWalletError("keyring", 221, "Unknown msg type");
    }
  };
};
// const handleRequestSignBtcMsg: (
//   service: KeyRingBtcService,
//   permissionInteractionService: PermissionInteractiveService
// ) => InternalHandler<RequestSignBtcMsg> = (
//   service,
//   permissionInteractionService
// ) => {
//   return async (env, msg) => {
//     await permissionInteractionService.ensureEnabled(
//       env,
//       [msg.chainId],
//       msg.origin
//     );
//
//     return (
//       await service.signBtcSelected(
//         env,
//         msg.origin,
//         msg.chainId,
//         msg.signer,
//         msg.message,
//         msg.signType
//       )
//     ).signature;
//   };
// };
const handleGetSvmKeyMsg: (
  service: KeyRingSvmService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<GetSvmKeyMsg> = (
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

const handleGetSvmKeysSettledMsg: (
  service: KeyRingSvmService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<GetSvmKeysSettledMsg> = (
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

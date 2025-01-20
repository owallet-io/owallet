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
  RequestSignTransactionSvm,
  // RequestSendAndConfirmTxSvm,
  RequestSignAllTransactionSvm,
  RequestSignMessageSvm,
  RequestSignInSvm,
  ConnectSvmMsg,
  // RequestSignBtcMsg,
} from "./messages";

import { KeyRingSvmService } from "./service";
import { PermissionInteractiveService } from "../permission-interactive";
import { PublicKey } from "@solana/web3.js";

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
      case ConnectSvmMsg:
        return handleConnectSvmMsg(service, permissionInteractionService)(
          env,
          msg as ConnectSvmMsg
        );
      case GetSvmKeysSettledMsg:
        return handleGetSvmKeysSettledMsg(
          service,
          permissionInteractionService
        )(env, msg as GetSvmKeysSettledMsg);
      // case RequestSendAndConfirmTxSvm:
      //     return handleRequestSendAndConfirmTxSvm(service,permissionInteractionService)(
      //         env,
      //         msg as RequestSendAndConfirmTxSvm
      //     );
      case RequestSignTransactionSvm:
        return handleRequestSignTransactionSvm(
          service,
          permissionInteractionService
        )(env, msg as RequestSignTransactionSvm);
      case RequestSignAllTransactionSvm:
        return handleRequestSignAllTransactionSvm(
          service,
          permissionInteractionService
        )(env, msg as RequestSignAllTransactionSvm);
      case RequestSignMessageSvm:
        return handleRequestSignMessageSvm(
          service,
          permissionInteractionService
        )(env, msg as RequestSignMessageSvm);
      case RequestSignInSvm:
        return handleRequestSignInSvm(service, permissionInteractionService)(
          env,
          msg as RequestSignInSvm
        );
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
const handleConnectSvmMsg: (
  service: KeyRingSvmService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<ConnectSvmMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    if (!msg.silent) {
      await permissionInteractionService.ensureEnabled(
          env,
          [msg.chainId],
          msg.origin
      );
    }

    const key = await service.getKeySelected(msg.chainId);
    return { publicKey: new PublicKey(key.base58Address) };
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

const handleRequestSignAllTransactionSvm: (
  service: KeyRingSvmService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestSignAllTransactionSvm> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(
      env,
      [msg.chainId],
      msg.origin
    );

    return await service.requestSignAllTransactionSvm(
      env,
      msg.origin,
      msg.chainId,
      msg.signer,
      msg.txs
    );
  };
};
const handleRequestSignTransactionSvm: (
  service: KeyRingSvmService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestSignTransactionSvm> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    console.log(msg, "msg sign svm");
    await permissionInteractionService.ensureEnabled(
      env,
      [msg.chainId],
      msg.origin
    );

    return await service.requestSignTransactionSvm(
      env,
      msg.origin,
      msg.chainId,
      msg.signer,
      msg.tx
    );
  };
};
const handleRequestSignMessageSvm: (
  service: KeyRingSvmService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestSignMessageSvm> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(
      env,
      [msg.chainId],
      msg.origin
    );

    return await service.requestSignMessageSvm(
      env,
      msg.origin,
      msg.chainId,
      msg.signer,
      msg.message
    );
  };
};
const handleRequestSignInSvm: (
  service: KeyRingSvmService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestSignInSvm> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(
      env,
      [msg.chainId],
      msg.origin
    );

    return await service.requestSignInSvm(
      env,
      msg.origin,
      msg.chainId,
      msg.inputs
    );
  };
};
// const handleRequestSendAndConfirmTxSvm: (
//     service: KeyRingSvmService,
//     permissionInteractionService: PermissionInteractiveService
// ) => InternalHandler<RequestSendAndConfirmTxSvm> = (service, permissionInteractionService) => {
//     return async (env, msg) => {
//         await permissionInteractionService.ensureEnabled(
//             env,
//             msg.chainIds,
//             msg.origin
//         );
//
//         return await service.requestSendAndConfirmTxSvm(
//             env,
//             msg.origin,
//             msg.chainId,
//             msg.signer,
//             msg.unsignedTx
//         );
//     };
// };

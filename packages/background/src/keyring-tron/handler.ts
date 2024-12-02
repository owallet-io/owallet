import { Env, Handler, InternalHandler, OWalletError, Message } from '@owallet/router';
import {
  GetTronKeyMsg,
  GetTronKeysSettledMsg,
  RequestGetTronAddressMsg,
  RequestSendRawTransactionMsg,
  RequestSignTronMsg,
  RequestTriggerSmartContractMsg
} from './messages';
import { KeyRingTronService } from './service';
import { PermissionInteractiveService } from '../permission-interactive';

export const getHandler: (
  service: KeyRingTronService,
  permissionInteractionService: PermissionInteractiveService
) => Handler = (service: KeyRingTronService, permissionInteractionService) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetTronKeyMsg:
        return handleGetTronKeyMsg(service, permissionInteractionService)(env, msg as GetTronKeyMsg);
      case GetTronKeysSettledMsg:
        return handleGetTronKeysSettledMsg(service, permissionInteractionService)(env, msg as GetTronKeysSettledMsg);
      case RequestSignTronMsg:
        return handleRequestSignTronMsg(service, permissionInteractionService)(env, msg as RequestSignTronMsg);
      case RequestTriggerSmartContractMsg:
        return handleTriggerSmartContractMsg(service, permissionInteractionService)(
          env,
          msg as RequestTriggerSmartContractMsg
        );
      case RequestSendRawTransactionMsg:
        return handleSendRawTransactionMsg(service)(env, msg as RequestSendRawTransactionMsg);
      case RequestGetTronAddressMsg:
        return handleRequestGetTronAddressMsg(service)(env, msg as RequestGetTronAddressMsg);
      default:
        throw new OWalletError('keyring', 221, 'Unknown msg type');
    }
  };
};

const handleGetTronKeyMsg: (
  service: KeyRingTronService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<GetTronKeyMsg> = (service, permissionInteractionService) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(env, [msg.chainId], msg.origin);

    return await service.getKeySelected(msg.chainId);
  };
};

const handleGetTronKeysSettledMsg: (
  service: KeyRingTronService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<GetTronKeysSettledMsg> = (service, permissionInteractionService) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(env, msg.chainIds, msg.origin);

    console.log('handleGetTronKeysSettledMsg', msg.chainIds);

    return await Promise.allSettled(msg.chainIds.map(chainId => service.getKeySelected(chainId)));
  };
};
const handleRequestSignTronMsg: (
  service: KeyRingTronService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestSignTronMsg> = (service, permissionInteractionService) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(env, [msg.chainId], msg.origin);

    return (await service.signTronSelected(env, msg.origin, msg.chainId, msg.data)).signature;
  };
};

const handleTriggerSmartContractMsg: (
  service: KeyRingTronService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestTriggerSmartContractMsg> = (service, permissionInteractionService) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(env, [msg.chainId], msg.origin);

    return await service.requestTriggerSmartContract(env, msg.chainId, JSON.parse(msg.data));
  };
};

const handleSendRawTransactionMsg: (
  service: KeyRingTronService
) => InternalHandler<RequestSendRawTransactionMsg> = service => {
  return async (env, msg) => {
    const response = await service.requestSendRawTransaction(env, msg.chainId, msg.data);
    return { ...response };
  };
};

const handleRequestGetTronAddressMsg: (
  service: KeyRingTronService
) => InternalHandler<RequestGetTronAddressMsg> = service => {
  return async (env, msg) => {
    return await service.requestTronAddress(env, msg.origin);
  };
};

import { Env, Handler, InternalHandler, OWalletError, Message } from '@owallet/router';
import { SendTxTronMsg } from './messages';
import { BackgroundTxTronService } from './service';
import { PermissionInteractiveService } from '../permission-interactive';

export const getHandler: (
  service: BackgroundTxTronService,
  permissionInteractionService: PermissionInteractiveService
) => Handler = (service: BackgroundTxTronService, permissionInteractionService) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case SendTxTronMsg:
        return handleSendTxTronMsg(service, permissionInteractionService)(env, msg as SendTxTronMsg);
      default:
        throw new OWalletError('tx', 110, 'Unknown msg type');
    }
  };
};

const handleSendTxTronMsg: (
  service: BackgroundTxTronService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<SendTxTronMsg> = (service, permissionInteractionService) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(env, [msg.chainId], msg.origin);

    return await service.sendTronTx(msg.chainId, msg.signedTx, {
      silent: msg.silent
    });
  };
};

import { Env, Handler, InternalHandler, Message } from '@owallet/router';
import { SendTxEthereumMsg, SendTxMsg } from './messages';
import { BackgroundTxService } from './service';

export const getHandler: (service: BackgroundTxService) => Handler = (
  service: BackgroundTxService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case SendTxMsg:
        return handleSendTxMsg(service)(env, msg as SendTxMsg);
      case SendTxEthereumMsg:
        return handleSendEthereumTxMsg(service)(env, msg as SendTxEthereumMsg);
      default:
        throw new Error('Unknown msg type');
    }
  };
};

const handleSendTxMsg: (
  service: BackgroundTxService
) => InternalHandler<SendTxMsg> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );

    return await service.sendTx(msg.chainId, msg.tx, msg.mode);
  };
};

const handleSendEthereumTxMsg: (
  service: BackgroundTxService
) => InternalHandler<SendTxEthereumMsg> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );

    return await service.request(msg.rpc, msg.method, msg.params);
  };
};

import { Env, Handler, InternalHandler, Message } from "@owallet/router";
import { RequestEthereumMsg, SendTxMsg } from "./messages";
import { BackgroundTxService } from "./service";

export const getHandler: (service: BackgroundTxService) => Handler = (
  service: BackgroundTxService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case SendTxMsg:
        return handleSendTxMsg(service)(env, msg as SendTxMsg);
      case RequestEthereumMsg:
        return handleRequestEthereumMsg(service)(
          env,
          msg as RequestEthereumMsg
        );
      default:
        throw new Error("Unknown msg type");
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

const handleRequestEthereumMsg: (
  service: BackgroundTxService
) => InternalHandler<RequestEthereumMsg> = (service) => {
  return async (env, msg) => {
    // await service.permissionService.checkOrGrantBasicAccessPermission(
    //   env,
    //   msg.chainId,
    //   msg.origin
    // );

    return await service.request(msg.chainId, msg.method, msg.params);
  };
};

import {
  Env,
  Handler,
  InternalHandler,
  OWalletError,
  Message,
} from "@owallet/router";
import { ChainsUpdateService } from "./service";
import {
  TryUpdateAllChainInfosMsg,
  TryUpdateEnabledChainInfosMsg,
} from "./messages";

export const getHandler: (service: ChainsUpdateService) => Handler = (
  service
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case TryUpdateAllChainInfosMsg:
        return handleTryUpdateAllChainInfosMsg(service)(
          env,
          msg as TryUpdateAllChainInfosMsg
        );
      case TryUpdateEnabledChainInfosMsg:
        return handleTryUpdateEnabledChainInfosMsg(service)(
          env,
          msg as TryUpdateEnabledChainInfosMsg
        );
      default:
        throw new OWalletError("chains-update", 110, "Unknown msg type");
    }
  };
};

const handleTryUpdateAllChainInfosMsg: (
  service: ChainsUpdateService
) => InternalHandler<TryUpdateAllChainInfosMsg> = (service) => {
  return async () => {
    return await service.tryUpdateAllChainInfos();
  };
};

const handleTryUpdateEnabledChainInfosMsg: (
  service: ChainsUpdateService
) => InternalHandler<TryUpdateEnabledChainInfosMsg> = (service) => {
  return async () => {
    return await service.tryUpdateEnabledChainInfos();
  };
};

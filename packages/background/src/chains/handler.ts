import { Env, Handler, InternalHandler, Message } from "@owallet/router";
import { ChainsService } from "./service";
import {
  GetChainInfosMsg,
  RemoveSuggestedChainInfoMsg,
  SuggestChainInfoMsg,
  GetChainInfosWithoutEndpointsMsg,
} from "./messages";
import { ChainInfo } from "@owallet/types";

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export const getHandler: (service: ChainsService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetChainInfosMsg:
        return handleGetChainInfosMsg(service)(env, msg as GetChainInfosMsg);
      case SuggestChainInfoMsg:
        return handleSuggestChainInfoMsg(service)(
          env,
          msg as SuggestChainInfoMsg
        );
      case RemoveSuggestedChainInfoMsg:
        return handleRemoveSuggestedChainInfoMsg(service)(
          env,
          msg as RemoveSuggestedChainInfoMsg
        );
      case GetChainInfosWithoutEndpointsMsg:
        return handleGetChainInfosWithoutEndpointsMsg(service)(
          env,
          msg as GetChainInfosWithoutEndpointsMsg
        );
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleGetChainInfosMsg: (
  service: ChainsService
) => InternalHandler<GetChainInfosMsg> = (service) => {
  return async () => {
    const chainInfos = await service.getChainInfos();
    return {
      chainInfos,
    };
  };
};

const handleSuggestChainInfoMsg: (
  service: ChainsService
) => InternalHandler<SuggestChainInfoMsg> = (service) => {
  return async (env, msg) => {
    if (await service.hasChainInfo(msg.chainInfo.chainId)) {
      // throw new Error("This chain is already registered");
      // If suggested chain info is already registered, just return.
      return;
    }

    const chainInfo = msg.chainInfo as Writeable<ChainInfo>;

    // And, always handle it as beta, if not specific.
    if (chainInfo.beta === undefined) {
      chainInfo.beta = true;
    }

    await service.suggestChainInfo(env, chainInfo, msg.origin);
  };
};

const handleRemoveSuggestedChainInfoMsg: (
  service: ChainsService
) => InternalHandler<RemoveSuggestedChainInfoMsg> = (service) => {
  return async (_, msg) => {
    await service.removeChainInfo(msg.chainId);
    return await service.getChainInfos();
  };
};

//@ts-ignore
const handleGetChainInfosWithoutEndpointsMsg: (
  service: ChainsService
) => InternalHandler<GetChainInfosWithoutEndpointsMsg> = (service) => {
  return async (env, msg) => {
    return await service.getChainInfosWithoutEndpoints();
  };
};

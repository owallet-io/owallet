import {
  Env,
  Handler,
  InternalHandler,
  OWalletError,
  Message,
} from "@owallet/router";
import { InteractionAddonService } from "./service";
import { ReplacePageMsg } from "./messages";

export const getHandler: (service: InteractionAddonService) => Handler = (
  service: InteractionAddonService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case ReplacePageMsg:
        return handleReplacePageMsg(service)(env, msg as ReplacePageMsg);
      default:
        throw new OWalletError(
          "extension-interaction-addon",
          100,
          "Unknown msg type"
        );
    }
  };
};

const handleReplacePageMsg: (
  service: InteractionAddonService
) => InternalHandler<ReplacePageMsg> = (service) => {
  return (_, msg) => {
    return service.replacePage(msg.url);
  };
};

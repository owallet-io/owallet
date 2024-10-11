import {
  Env,
  Handler,
  InternalHandler,
  OWalletError,
  Message,
} from "@owallet/router";
import { SettingsService } from "./service";
import { GetThemeOptionMsg, SetThemeOptionMsg } from "./messages";

export const getHandler: (service: SettingsService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetThemeOptionMsg:
        return handleGetThemeOptionMsg(service)(env, msg as GetThemeOptionMsg);
      case SetThemeOptionMsg:
        return handleSetThemeOptionMsg(service)(env, msg as SetThemeOptionMsg);
      default:
        throw new OWalletError("settings", 110, "Unknown msg type");
    }
  };
};

const handleGetThemeOptionMsg: (
  service: SettingsService
) => InternalHandler<GetThemeOptionMsg> = (service) => {
  return () => {
    return service.getThemeOption();
  };
};

const handleSetThemeOptionMsg: (
  service: SettingsService
) => InternalHandler<SetThemeOptionMsg> = (service) => {
  return (_, msg) => {
    return service.setThemeOption(msg.themeOption);
  };
};

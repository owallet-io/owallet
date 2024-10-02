import { Router } from "@owallet/router";
import {
  GetTokensMsg,
  AddTokenMsg,
  RemoveTokenMsg,
  GetSecret20ViewingKey,
  SuggestTokenMsg,
  GetAllTokenInfosMsg,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { TokensService } from "./service";

export function init(router: Router, service: TokensService): void {
  router.registerMessage(GetTokensMsg);
  router.registerMessage(SuggestTokenMsg);
  router.registerMessage(AddTokenMsg);
  router.registerMessage(RemoveTokenMsg);
  router.registerMessage(GetSecret20ViewingKey);
  router.registerMessage(GetAllTokenInfosMsg);

  router.addHandler(ROUTE, getHandler(service));
}

import { Router } from "@owallet/router";
import {
  GetPersistentMemoryMsg,
  SetPersistentMemoryMsg,
  TestWalletId,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { PersistentMemoryService } from "./service";

export function init(router: Router, service: PersistentMemoryService) {
  router.registerMessage(SetPersistentMemoryMsg);
  router.registerMessage(GetPersistentMemoryMsg);
  router.registerMessage(TestWalletId);
  router.addHandler(ROUTE, getHandler(service));
}

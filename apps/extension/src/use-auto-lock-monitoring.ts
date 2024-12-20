import { useStore } from "./stores";
import { useLayoutEffect } from "react";
import {
  GetAutoLockStateMsg,
  StartAutoLockMonitoringMsg,
} from "@owallet/background";
import { InExtensionMessageRequester } from "@owallet/router-extension";
import { BACKGROUND_PORT } from "@owallet/router";

// CONTRACT: Use with `observer`
export const useAutoLockMonitoring = () => {
  const { keyRingStore } = useStore();

  useLayoutEffect(() => {
    const listener = async (newState: browser.idle.IdleState) => {
      if ((newState as any) === "locked") {
        const msg = new GetAutoLockStateMsg();
        const requester = new InExtensionMessageRequester();
        const res = await requester.sendMessage(BACKGROUND_PORT, msg);
        if (res.lockOnSleep || res.duration > 0) {
          window.close();
        }
      }
    };

    browser.idle.onStateChanged.addListener(listener);

    return () => {
      browser.idle.onStateChanged.removeListener(listener);
    };
  }, []);

  useLayoutEffect(() => {
    if (keyRingStore.status === "unlocked") {
      const sendAutoLockMonitorMsg = async () => {
        const msg = new StartAutoLockMonitoringMsg();
        const requester = new InExtensionMessageRequester();
        await requester.sendMessage(BACKGROUND_PORT, msg);
      };

      // Notify to auto lock service to start activation check whenever the keyring is unlocked.
      sendAutoLockMonitorMsg();
      const autoLockInterval = setInterval(() => {
        sendAutoLockMonitorMsg();
      }, 10000);

      return () => {
        clearInterval(autoLockInterval);
      };
    }
  }, [keyRingStore.status]);
};

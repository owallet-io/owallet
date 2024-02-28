import { PushEventDataMsg } from "@owallet/background";
import { Router } from "@owallet/router";

export function initEvents(router: Router) {
  router.registerMessage(PushEventDataMsg);

  router.addHandler("interaction-foreground", (_, msg) => {
    console.log("interaction-foreground event");
    switch (msg.constructor) {
      case PushEventDataMsg:
        if ((msg as PushEventDataMsg).data.type === "keystore-changed") {
          window.dispatchEvent(
            new CustomEvent("keplr_keystorechange", {
              detail: {
                ...(msg as PushEventDataMsg).data,
              },
            })
          );
        }
        return {};
      default:
        throw new Error("Unknown msg type");
    }
  });
}

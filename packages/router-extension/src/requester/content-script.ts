import { MessageRequester, Message, JSONUint8Array } from "@owallet/router";
import { getOWalletExtensionRouterId } from "../utils";

// The message requester to send the message to the content scripts.
// This will send message to the tab with the content script.
// And, this can't handle the result of the message sending.
// TODO: Research to improve this requester.
export class ContentScriptMessageRequester implements MessageRequester {
  async sendMessage<M extends Message<unknown>>(
    port: string,
    msg: M
  ): Promise<M extends Message<infer R> ? R : never> {
    msg.validateBasic();

    // Set message's origin.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    msg["origin"] = globalThis.location.origin;
    msg.routerMeta = {
      ...msg.routerMeta,
      routerId: getOWalletExtensionRouterId(),
    };

    const wrappedMsg = JSONUint8Array.wrap(msg);

    const tabs = await browser.tabs.query({
      discarded: false,
      status: "complete",
    });

    const promises: Promise<unknown>[] = [];
    for (let i = 0; i < tabs.length; i++) {
      const tabId = tabs[i].id;
      if (tabId) {
        promises.push(
          browser.tabs.sendMessage(tabId, {
            port,
            type: msg.type(),
            msg: wrappedMsg,
          })
        );
      }
    }

    // Ignore the failures
    await Promise.allSettled(promises);

    // This requester can't handle the result of the message.
    return undefined as any;
  }
}

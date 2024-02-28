import {
  MessageRequester,
  Message,
  JSONUint8Array,
  OWalletError,
} from "@owallet/router";

export class InExtensionMessageRequester implements MessageRequester {
  async sendMessage<M extends Message<unknown>>(
    port: string,
    msg: M
  ): Promise<M extends Message<infer R> ? R : never> {
    return InExtensionMessageRequester.sendMessageToTab(port, msg);
  }

  static async sendMessageToTab<M extends Message<unknown>>(
    port: string,
    msg: M,
    tabId?: number
  ): Promise<M extends Message<infer R> ? R : never> {
    msg.validateBasic();

    // Set message's origin.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    msg["origin"] =
      typeof window !== "undefined" && window.location
        ? window.location.origin
        : new URL(browser.runtime.getURL("/")).origin;

    const message = {
      port,
      type: msg.type(),
      msg: JSONUint8Array.wrap(msg),
    };
    const result = JSONUint8Array.unwrap(
      Number.isInteger(tabId)
        ? await browser.tabs.sendMessage(tabId, message)
        : await browser.runtime.sendMessage(message)
    );

    if (!result) {
      throw new Error("Null result");
    }

    if (result.error) {
      if (typeof result.error === "string") {
        throw new Error(result.error);
      } else {
        throw new OWalletError(
          result.error.module,
          result.error.code,
          result.error.message
        );
      }
    }

    return result.return;
  }
}

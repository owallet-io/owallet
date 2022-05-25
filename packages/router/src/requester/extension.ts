import { MessageRequester, Message, JSONUint8Array } from '@owallet/router';
import { getOWalletExtensionRouterId } from '../utils';

export class InExtensionMessageRequester implements MessageRequester {
  async sendMessage<M extends Message<unknown>>(
    port: string,
    msg: M
  ): Promise<M extends Message<infer R> ? R : never> {
    msg.validateBasic();

    // Set message's origin.
    (msg as any).origin = window.location.origin;
    msg.routerMeta = {
      ...msg.routerMeta,
      routerId: getOWalletExtensionRouterId()
    };

    const result = JSONUint8Array.unwrap(
      await browser.runtime.sendMessage({
        port,
        type: msg.type(),
        msg: JSONUint8Array.wrap(msg)
      })
    );

    if (!result) {
      throw new Error('Null result');
    }

    if (result.error) {
      throw new Error(result.error);
    }

    return result.return;
  }

  static async sendMessageToTab<M extends Message<unknown>>(
    tabId: number,
    port: string,
    msg: M
  ): Promise<M extends Message<infer R> ? R : never> {
    msg.validateBasic();

    // Set message's origin.
    (msg as any).origin = window.location.origin;
    msg.routerMeta = {
      ...msg.routerMeta,
      routerId: getOWalletExtensionRouterId()
    };

    const result = JSONUint8Array.unwrap(
      await browser.tabs.sendMessage(tabId, {
        port,
        type: msg.type(),
        msg: JSONUint8Array.wrap(msg)
      })
    );

    if (!result) {
      throw new Error('Null result');
    }

    if (result.error) {
      throw new Error(result.error);
    }

    return result.return;
  }
}

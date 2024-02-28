import { Message } from "../message";
import { Handler } from "../handler";
import { EnvProducer, Guard, MessageSender } from "../types";
import { MessageRegistry } from "../encoding";
import { JSONUint8Array } from "../json-uint8-array";

const handleLoadUrl = (url: string) => {
  const views = browser.extension.getViews({
    // Request only for the same tab as the requested frontend.
    // But the browser popup itself has no information about tab.
    // Also, if user has multiple windows on, we need another way to distinguish them.
    // See the comment right below this part.
  });

  if (views.length > 0) {
    for (const view of views) {
      view.location.href = url;
    }
  }
};

export abstract class Router {
  protected msgRegistry: MessageRegistry = new MessageRegistry();
  protected registeredHandler: Map<string, Handler> = new Map();

  protected guards: Guard[] = [];

  protected port = "";

  constructor(protected readonly envProducer: EnvProducer) {}

  public registerMessage(
    msgCls: { new (...args: any): Message<unknown> } & { type(): string }
  ): void {
    this.msgRegistry.registerMessage(msgCls);
  }

  public addHandler(route: string, handler: Handler) {
    if (this.registeredHandler.has(route)) {
      throw new Error(`Already registered type ${route}`);
    }

    this.registeredHandler.set(route, handler);
  }

  public addGuard(guard: Guard): void {
    this.guards.push(guard);
  }

  public abstract listen(port: string): void;

  public abstract unlisten(): void;

  protected async handleMessage(
    message: any,
    sender: MessageSender
  ): Promise<unknown> {
    const msg = this.msgRegistry.parseMessage(JSONUint8Array.unwrap(message));
    const routerMeta = msg.routerMeta ?? {};
    const env = this.envProducer(sender, routerMeta);

    for (const guard of this.guards) {
      await guard(env, msg, sender);
    }

    // Can happen throw
    msg.validateBasic();

    // TODO: check if there is url then reload it before handle
    if (routerMeta.url) {
      handleLoadUrl(routerMeta.url);
    }

    const route = msg.route();

    if (!route) {
      throw new Error("Null router");
    }
    const handler = this.registeredHandler.get(route);
    if (!handler) {
      throw new Error("Can't get handler");
    }

    try {
      return JSONUint8Array.wrap(await handler(env, msg));
    } catch (e) {
      // it may related to service-worker not loaded
      if (e?.message === "Request rejected") {
        return;
      }
      // other error should throw
      throw e;
    }
  }
}

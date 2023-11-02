import { EnvProducer, MessageSender, Result, Router } from '@owallet/router';

import EventEmitter from 'eventemitter3';

export class RNRouterBase extends Router {
  constructor(protected readonly envProducer: EnvProducer, protected readonly eventEmitter: EventEmitter) {
    super(envProducer);
  }

  listen(port: string): void {
    if (!port) {
      throw new Error('Empty port');
    }

    this.port = port;
    this.eventEmitter.addListener('message', this.onMessage);
  }

  unlisten(): void {
    this.port = '';
    this.eventEmitter.removeListener('message', this.onMessage);
  }

  protected onMessage = async (params: {
    message: any;
    sender: MessageSender & {
      resolver: (result: Result) => void;
    };
  }): Promise<void> => {
    const { message, sender } = params;
    if (message.port !== this.port) {
      return;
    }

    console.log('in the onMessage function, ready to handle message with sender: ', sender);
    console.log('message: ', message);

    try {
      const result = await this.handleMessage(message, sender);
      console.log('result after handling the message: ', result);
      sender.resolver({
        return: result
      });
      return;
    } catch (e) {
      console.log(`Failed to process msg ${message.type}: ${e?.message || e?.toString()}`);
      if (e) {
        sender.resolver({
          error: e.message || e.toString()
        });
      } else {
        sender.resolver({
          error: 'Unknown error, and error is null'
        });
      }
    }
  };
}

export class RNRouterBackground extends RNRouterBase {
  public static readonly EventEmitter: EventEmitter = new EventEmitter();

  constructor(protected readonly envProducer: EnvProducer) {
    super(envProducer, RNRouterBackground.EventEmitter);
  }
}

export class RNRouterUI extends RNRouterBase {
  public static readonly EventEmitter: EventEmitter = new EventEmitter();

  constructor(protected readonly envProducer: EnvProducer) {
    super(envProducer, RNRouterUI.EventEmitter);
  }
}

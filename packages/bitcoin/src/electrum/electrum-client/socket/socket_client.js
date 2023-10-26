import { EventEmitter } from 'events';
import { MessageParser } from './util';

import { WebSocketClient } from './socket_client_ws';

export class SocketClient {
  constructor(host, port, protocol, options) {
    this.id = 0;
    this.host = host;
    this.port = port;
    this.protocol = protocol;
    this.options = options;
    this.status = 0;
    this.callback_message_queue = {};
    this.events = new EventEmitter();
    this.mp = new MessageParser((body, n) => {
      this.onMessage(body, n);
    });
    switch (protocol) {
      case 'ws':
      case 'wss':
        this.client = new WebSocketClient(this, host, port, protocol, options);
        break;
      default:
        throw new Error(`invalid protocol: [${protocol}]`);
    }
  }

  async connect() {
    if (this.status === 1) {
      return Promise.resolve();
    }

    this.status = 1;
    return this.client.connect();
  }

  close() {
    if (this.status === 0) {
      return;
    }

    this.client.close();

    this.status = 0;
  }

  response(msg) {
    const callback = this.callback_message_queue[msg.id];

    if (callback) {
      delete this.callback_message_queue[msg.id];
      if (msg.error) {
        callback(msg.error.message);
      } else {
        callback(null, msg.result);
      }
    } else {
      console.log("Can't get callback");
    }
  }

  onMessage(body, n) {
    const msg = JSON.parse(body);
    if (msg instanceof Array) {
      // don't support batch request
    } else {
      if (msg.id !== void 0) {
        this.response(msg);
      } else {
        this.subscribe.emit(msg.method, msg.params);
      }
    }
  }

  onConnect() {}

  onClose(event) {
    this.status = 0;
    Object.keys(this.callback_message_queue).forEach((key) => {
      this.callback_message_queue[key](new Error('close connect'));
      delete this.callback_message_queue[key];
    });
  }

  onRecv(chunk) {
    this.mp.run(chunk);
  }

  onEnd(error) {
    console.log(`onEnd: [${error}]`);
  }

  onError(error) {
    console.log(`onError: [${JSON.stringify(error)}]`);
  }
}

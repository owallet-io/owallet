import { w3cwebsocket as W3CWebSocket } from 'websocket';

export class WebSocketClient {
  constructor(self, host, port, protocol, options) {
    this.self = self;
    this.host = host;
    this.port = port;
    this.protocol = protocol;
    this.options = options;
    this.client = null;
  }

  async connect() {
    const url = `wss://${this.host}`;

    // TODO: Add docs
    // https://github.com/theturtle32/WebSocket-Node/blob/master/docs/W3CWebSocket.md#constructor
    const client = new W3CWebSocket(url, undefined, undefined, undefined, this.options);

    this.client = client;

    return new Promise((resolve, reject) => {
      client.onerror = (error) => {
        this.self.onError(error);
      };

      client.onclose = (event) => {
        this.self.onClose(event);
        reject(new Error(`websocket connection closed: code: [${event.code}], reason: [${event.reason}]`));
      };

      client.onmessage = (message) => {
        this.self.onMessage(message.data);
      };

      client.onopen = () => {
        if (client.readyState === client.OPEN) {
          this.self.onConnect();
          resolve({ port: this.port, host: this.host });
        }
      };
    });
  }

  async close() {
    this.client.close(1000, 'close connection');
  }

  // string
  send(data) {
    this.client.send(data);
  }
}
